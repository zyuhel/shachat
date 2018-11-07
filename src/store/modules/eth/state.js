export default () => {
  return {
    balance: 0,
    gasPrice: 0,
    blockNumber: 0,
    fee: 0,
    address: '',
    isPublished: false, // Indicates whether ETH address has been published to the KVS
    publicKey: null,
    privateKey: null,
    transactions: { },
    minHeight: -1,
    maxHeight: -1,
    bottomReached: false
  }
}
