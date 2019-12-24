// tslint:disable:no-expression-statement
import test from 'ava';
import { Networks, Transaction } from 'stellar-sdk';
import { toTxrep } from './txToTxrep';

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

const tests = yaml.safeLoad(readFileSync('tests.yaml', 'utf8'));

tests.forEach(testCase => {
  test(testCase.description, t => {
    const transaction = new Transaction(testCase.xdr, Networks.TESTNET);
    const actual = toTxrep(transaction);

    t.is(actual, testCase.txrep.trim());
  });
});
