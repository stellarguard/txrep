// tslint:disable:no-expression-statement
import test from 'ava';
import { Networks, TransactionBuilder } from 'stellar-sdk';
import { toTxrep } from './txToTxrep';

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const tests = yaml.safeLoad(readFileSync('tests.yaml', 'utf8'));

tests.forEach(testCase => {
  const tc = testCase.skip ? test.skip : test;
  tc(testCase.description, t => {
    const transaction = TransactionBuilder.fromXDR(
      testCase.xdr,
      Networks.TESTNET
    );
    const actual = toTxrep(transaction);

    t.is(actual, testCase.txrep.trim());
  });
});
