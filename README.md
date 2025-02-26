[![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/adamant-im/adamant-im/preview.yml)](https://github.com/Adamant-im/adamant-im/actions/workflows/preview.yml) [![GitHub commit activity (branch)](https://img.shields.io/github/commit-activity/m/Adamant-im/adamant-im/dev?color=24bd13)](https://github.com/Adamant-im/adamant-im/graphs/commit-activity) [![GitHub release (with filter)](https://img.shields.io/github/v/release/adamant-im/adamant-im?color=24bd13)](https://github.com/Adamant-im/adamant-im/releases) [![Static Badge](https://img.shields.io/badge/Slack-brightgreen?logo=slack&logoColor=white&labelColor=fa8f02&color=grey&link=https%3A%2F%2Fjoin.slack.com%2Ft%2Fadamant-im%2Fshared_invite%2Fzt-3n32uqh3-TmTM4qPAKcp3PzrPMtKETQ)](https://join.slack.com/t/adamant-im/shared_invite/zt-3n32uqh3-TmTM4qPAKcp3PzrPMtKETQ) [![Static Badge](https://img.shields.io/badge/Twitter-brightgreen?logo=x&logoColor=white&labelColor=blue&color=grey&link=https%3A%2F%2Ftwitter.com%2Fadamant_im)](https://twitter.com/adamant_im)

# ADAMANT Messenger Progressive Web Application (PWA)

A messaging application client for ADAMANT Blockchain. See ADAMANT Project at [adamant.im](https://adamant.im).

ADAMANT is a decentralized anonymous messenger based on the blockchain system. It’s independent of any governments or corporations, and even developers due to the distributed network infrastructure that contains an open-source code.

The ADAMANT blockchain system belongs to its users. Nobody can control, block, deactivate, restrict or censor accounts. Users take full responsibility for their content, messages, media, and goals and intentions of using the messenger.

Privacy is the main concept of ADAMANT: neither phone numbers nor emails are required. Apps have no access to the contact list or geotags, IPs are hidden from chatters and paranoids can use [Tor app](http://adamant6457join2rxdkr2y7iqatar7n4n72lordxeknj435i4cjhpyd.onion).

All the messages are encrypted with the Diffie-Hellman Curve25519, Salsa20, Poly1305 algorithms and signed by SHA-256 + Ed25519 EdDSA. Private keys are never transferred to the network. The sequence of messages and their authenticity is guaranteed by the blockchain.

ADAMANT includes crypto wallets for ADAMANT (ADM), Bitcoin (BTC), Ethereum (ETH), Lisk (LSK), Dogecoin (DOGE) and Dash (DASH). Private keys for the wallets are derived from an ADAMANT passphrase. You can export the keys and use them in other wallets.

This application deployed at [msg.adamant.im](https://msg.adamant.im) and [available as standalone apps](https://adamant.im/#adm-apps) for macOS, Windows and Linux. Feel free to run your own messenger using this code and Build Setup.

ADAMANT Messenger has built-in crypto Exchanger and Adelina, an AI chat assistant based on ChatGPT.

## Project setup

Clone the repository:

```
git clone --recursive https://github.com/Adamant-im/adamant-im.git
```

Install the dependencies:

```
npm install
```

Note: Lisk libraries may ask for specific Node.js version, you can ignore this with `npm install --ignore-engines`.

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and hot-reloads self-signed https-server for development

```
npm run https
```

### Compiles and minifies for production

```
npm run build
```

### Preview production build locally

```
npm run serve
```

### Lints and fixes files

```
npm run lint
```

### Start dev server and electron app

```
npm run electron:dev
```

### Build electron version

```
npm run electron:build
```

### Build electron version and notarize the app

```
APPLE_NOTARIZE=true npm run electron:build
```

### Preview electron production build

```
npm run electron:serve
```

### Opening the Android project in Android Studio

```shell
$ npm run android:open
```

### Running Android app

```shell
$ npm run android:run
```

> Note: You must have an Android emulator or a connected device to run the app.

### Build and sign Android app

```shell
$ cp capacitor.env.example capacitor.env # replace ENV values before build
$ npm run android:build
```

[Download pre-build apps](https://adamant.im/#adm-apps) for macOS, Windows and Linux.

#### Note for Windows users

To build on Windows you must install build tools for windows, it is easier to do this with [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) npm package.

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
