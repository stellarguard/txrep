// tslint:disable:no-expression-statement
import test from 'ava';
import { Networks } from 'stellar-sdk';
import { parseLine, toTransaction } from './txrepToTx';

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const tests = yaml.safeLoad(readFileSync('tests.yaml', 'utf8'));

tests.forEach(testCase => {
  test(testCase.description, t => {
    const tx = toTransaction(testCase.txrep, Networks.TESTNET);
    const actualXdr = (tx.toEnvelope().toXDR('base64') as unknown) as string;
    t.is(actualXdr, testCase.xdr);
  });
});

// internal functions

test('parseLine simple', t => {
  const { path, value, comment } = parseLine(
    `tx.sourceAccount: GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN`
  );

  t.is(path, 'tx.sourceAccount');
  t.is(value, 'GAVRMS4QIOCC4QMOSKILOOOHCSO4FEKOXZPNLKFFN6W7SD2KUB7NBPLN');
  t.is('', comment);
});

test('parseLine boolean with comment', t => {
  const { path, value, comment } = parseLine(
    `tx.operations[0].sourceAccount._present: true this is a comment`
  );

  t.is(path, 'tx.operations[0].sourceAccount._present');
  t.is(value, true);
  t.is('this is a comment', comment);
});

test('parseLine string with comment', t => {
  const { path, value, comment } = parseLine(
    `tx.memo.text: "Enjoy this transaction" this is a comment`
  );

  t.is(path, 'tx.memo.text');
  t.is(value, 'Enjoy this transaction');
  t.is('this is a comment', comment);
});

test('parseLine string with escapes ', t => {
  const { path, value, comment } = parseLine(
    `tx.memo.text: "Enjoy \\\\ \\\\\\\" this transaction" this is " a comment`
  );

  t.is(path, 'tx.memo.text');
  t.is(value, 'Enjoy \\ \\" this transaction');
  t.is('this is " a comment', comment);
});
