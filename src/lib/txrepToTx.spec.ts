// tslint:disable:no-expression-statement
import test from 'ava';
import { MemoText, Operation } from 'stellar-sdk';
import { toTransaction } from './txrepToTx';

test('toTransaction', t => {
  const txrep = `
  tx.sourceAccount: GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN
  tx.fee: 100
  tx.seqNum: 46489056724385793
  tx.timeBounds.minTime: 1535756672
  tx.timeBounds.maxTime: 1567292672
  tx.memo.type: MEMO_TEXT
  tx.memo.text: "Enjoy this transaction"
  tx.operations[0].body.type: PAYMENT
  tx.operations[0].body.paymentOp.destination: GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O
  tx.operations[0].body.paymentOp.asset: USD:GAZFEVBSEGJJ63WPVVIWXLZLWN2JYZECECGT6GUNP4FJDVZVNXWQWMYI
  tx.operations[0].body.paymentOp.amount: 400004000
  tx.ext.v: 0
  `;

  const tx = toTransaction(txrep);

  t.is(tx.source, 'GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN');
  t.is(tx.fee, 100);
  t.is(tx.sequence, '46489056724385793');
  t.is(tx.timeBounds.minTime, '1535756672');
  t.is(tx.timeBounds.maxTime, '1567292672');
  t.is(tx.memo.type, MemoText);
  t.is(tx.memo.value, 'Enjoy this transaction');

  const operation = tx.operations[0] as Operation.Payment;
  t.is(operation.source, undefined);
  t.is(operation.type, 'payment');
  t.is(operation.asset.code, 'USD');
  t.is(
    operation.asset.issuer,
    'GAZFEVBSEGJJ63WPVVIWXLZLWN2JYZECECGT6GUNP4FJDVZVNXWQWMYI'
  );
  t.is(Number(operation.amount), 400004000);
});
