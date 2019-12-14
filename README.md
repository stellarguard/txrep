# @stellarguard/txrep

[![Latest Version](https://img.shields.io/npm/v/@stellarguard/txrep.svg)](https://img.shields.io/npm/v/@stellarguard/txrep.svg)
[![NodeJS Support](https://img.shields.io/node/v/@stellarguard/txrep.svg)](https://img.shields.io/node/v/@stellarguard/txrep.svg)

A TypeScript/JavaScript implementation of [SEP-0011](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0011.md), a human-readable Stellar transaction representations.

## Installation

```bash
npm install @stellarguard/txrep --save
# or
yarn add @stellarguard/txrep
```

## Examples

[See a live demo](https://stellarguard.github.io/txrep/demo)

### Converting a Transaction to Txrep

```js
import { toTxrep } from '@stellarguard/txrep';
import { Transaction, Networks } from 'stellar-sdk';

const xdr = 'AAAAACsWS5BDhC5BjpKQtznHFJ3CkU6+XtWopW+t+Q9KoH7QAAAAZAClKY0AAAABAAAAAQAAAABbicmAAAAAAF1q/QAAAAABAAAAFkVuam95IHRoaXMgdHJhbnNhY3Rpb24AAAAAAAEAAAAAAAAAAQAAAABAXzbt2M8i77+AcrmFtqTAFVHDTdOME3rI1A1ALNH3tAAAAAFVU0QAAAAAADJSVDIhkp9uz61Ra68rs3ScZIIgjT8ajX8Kkdc1be0LAAAAABfXk6AAAAAAAAAAAUqgftAAAABA3vtPH60cJ5MntVrxhP3N33P096jLQOflNKcdc6BRJLo2nbem0xtHyv0RhZIkaoV15sJJq5TsN2je22KSIhzlDA=='
const tx = new Transaction(xdr, Networks.TESTNET);
const txrep = toTxrep(tx);
```

### Converting Txrep to Transaction

### Creating and signing a transaction URI

```js
import { toTransaction } from '@stellarguard/txrep';
import { Networks } from 'stellar-sdk';

const txrep = `
tx.sourceAccount: GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN
tx.fee: 100
tx.seqNum: 46489056724385793
tx.timeBounds._present: true
tx.timeBounds.minTime: 1535756672 (Fri Aug 31 16:04:32 PDT 2018)
tx.timeBounds.maxTime: 1567292672 (Sat Aug 31 16:04:32 PDT 2019)
tx.memo.type: MEMO_TEXT
tx.memo.text: "Enjoy this transaction"
tx.operations.len: 1
tx.operations[0].sourceAccount._present: false
tx.operations[0].body.type: PAYMENT
tx.operations[0].body.paymentOp.destination: GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O
tx.operations[0].body.paymentOp.asset: USD:GAZFEVBSEGJJ63WPVVIWXLZLWN2JYZECECGT6GUNP4FJDVZVNXWQWMYI
tx.operations[0].body.paymentOp.amount: 400004000 (40.0004e7)
tx.ext.v: 0
signatures.len: 1
signatures[0].hint: 4aa07ed0 (GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN signer for account GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN)
signatures[0].signature: defb4f1fad1c279327b55af184fdcddf73f4f7a8cb40e7e534a71d73a05124ba369db7a6d31b47cafd118592246a8575e6c249ab94ec3768dedb6292221ce50c
`;

const tx = toTransaction(txrep, Networks.TESTNET);
```
