import qs from 'qs'

import BtcBaseApi from './btc-base-api'
import { Cryptos } from '../constants'
import BigNumber from '../bignumber'
import * as bitcoin from 'bitcoinjs-lib'
import { isPositiveNumber } from '../numericHelpers'
import { ECPairFactory } from 'ecpair'
import * as tinysecp from 'tiny-secp256k1'

const ECPairAPI = ECPairFactory(tinysecp)

const POST_CONFIG = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

export const CHUNK_SIZE = 20
// P2PKH output size (https://gist.github.com/junderw/b43af3253ea5865ed52cb51c200ac19c)
export const OUTPUTS_COMPENSATION = 34 * 4
export const NB_BLOCKS = 5 // Number of last blocks

export default class DogeApi extends BtcBaseApi {
  constructor(passphrase) {
    super(Cryptos.DOGE, passphrase)
  }

  /**
   * @override
   */
  getBalance() {
    return this._get(`/api/addr/${this.address}/balance`).then(
      (balance) => Number(balance) / this.multiplier
    )
  }

  async getFeePerByte() {
    const lastBlocksFee = await this._get(`/api/utils/estimatefee?nbBlocks=${NB_BLOCKS}`)
    return lastBlocksFee[NB_BLOCKS] / 1024
  }

  /** @override */
  async createTransaction(address = '', amount = 0, fee) {
    const unspents = await this.getUnspents()

    // populate unspents with full transaction in HEX
    for (const unspent of unspents) {
      // insight API v0.2.18
      const { rawtx } = await this._get(`/api/rawtx/${unspent.txid}`)
      unspent.txHex = rawtx
    }

    const hex = await this._buildTransaction(address, amount, unspents, fee)

    let txid = bitcoin.crypto.sha256(Buffer.from(hex, 'hex'))
    txid = bitcoin.crypto.sha256(Buffer.from(txid))
    txid = txid.toString('hex').match(/.{2}/g).reverse().join('')

    return { hex, txid }
  }

  /** @override */
  async _buildTransaction(address, amount, unspents, fee) {
    amount = new BigNumber(amount).times(this.multiplier).toNumber()
    amount = Math.floor(amount)
    const heldFee = Math.floor(new BigNumber(fee).times(this.multiplier).toNumber())

    const txb = new bitcoin.Psbt({
      network: this._network
    })
    txb.setVersion(1)
    txb.setMaximumFeeRate(heldFee)

    let target = amount + heldFee
    let transferAmount = 0
    let inputs = 0
    let estimatedTxBytes = 0

    unspents.forEach((tx) => {
      const amt = Math.floor(tx.amount)
      if (transferAmount < target) {
        const buffer = Buffer.from(tx.txHex, 'hex')
        txb.addInput({
          hash: tx.txid,
          index: tx.vout,
          nonWitnessUtxo: buffer
        })
        transferAmount += amt
        estimatedTxBytes += buffer.length
        inputs++
      }
    })

    txb.addOutput({
      address,
      value: amount
    })

    // Estimated fee based on https://github.com/dogecoin/dogecoin/blob/master/doc/fee-recommendation.md
    const currentFeeRate = await this.getFeePerByte()
    let estimatedFee = Math.floor(
      new BigNumber(currentFeeRate * (estimatedTxBytes + OUTPUTS_COMPENSATION))
        .times(this.multiplier)
        .toNumber()
    )

    if (estimatedFee >= heldFee) {
      estimatedFee = heldFee
    }

    // This is a necessary step
    // If we'll not add a change to output, it will burn in hell
    const change = transferAmount - amount - estimatedFee
    if (isPositiveNumber(change)) {
      txb.addOutput({
        address: this._address,
        value: change
      })
    }

    for (let i = 0; i < inputs; ++i) {
      txb.signInput(i, this._keyPair)
      txb.validateSignaturesOfInput(i, this.validator)
    }

    txb.finalizeAllInputs()
    const tx = txb.extractTransaction()

    return tx.toHex()
  }

  /** @override */
  sendTransaction(txHex) {
    return this._post('/api/tx/send', { rawtx: txHex }).then((res) => res.txid)
  }

  /** @override */
  getTransaction(txid) {
    return this._get(`/api/tx/${txid}`).then((tx) => this._mapTransaction(tx))
  }

  /** @override */
  getTransactionHex(txid) {
    const { rawtx } = this._get(`/api/rawtx/${txid}`)
    return rawtx
  }

  /** @override */
  getTransactions({ from = 0 }) {
    const to = from + CHUNK_SIZE
    return this._get(`/api/addrs/${this.address}/txs`, { from, to }).then((resp) => ({
      ...resp,
      hasMore: to < resp.totalItems,
      items: resp.items.map((tx) => this._mapTransaction(tx))
    }))
  }

  /** @override */
  getUnspents() {
    return this._get(`/api/addr/${this.address}/utxo?noCache=1`).then((unspents) => {
      return unspents.map((tx) => ({
        ...tx,
        amount: new BigNumber(tx.amount).times(this.multiplier).toNumber()
      }))
    })
  }

  /** Executes a GET request to the DOGE API */
  _get(url, params) {
    return this._getClient()
      .get(url, { params })
      .then((response) => response.data)
  }

  /** Executes a POST request to the DOGE API */
  _post(url, data) {
    return this._getClient()
      .post(url, qs.stringify(data), POST_CONFIG)
      .then((response) => response.data)
  }

  validator(pubkey, msghash, signature) {
    return ECPairAPI.fromPublicKey(pubkey).verify(msghash, signature)
  }
}
