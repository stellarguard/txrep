// tslint:disable:no-expression-statement
import test from 'ava';
import { Networks, Transaction } from 'stellar-sdk';
import { testCases } from './txrepTestCases';
import { toTxrep } from './txToTxrep';

testCases.forEach(testCase => {
  test(testCase.description, t => {
    const transaction = new Transaction(testCase.xdr, Networks.TESTNET);
    const actual = toTxrep(transaction);

    t.is(actual, testCase.txrep.trim());
  });
});
