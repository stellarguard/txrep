// tslint:disable:no-expression-statement
import test from 'ava';
import { MemoNone, MemoText, Networks, Operation } from 'stellar-sdk';
import { parseLine, toTransaction } from './txrepToTx';

test('toTransaction.createAccount', t => {
  const txrep = `
    tx.sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
    tx.fee: 100
    tx.seqNum: 1375042369748993
    tx.timeBounds._present: true
    tx.timeBounds.minTime: 0
    tx.timeBounds.maxTime: 0
    tx.memo.type: MEMO_NONE
    tx.operations.len: 1
    tx.operations[0].sourceAccount._present: true
    tx.operations[0].sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
    tx.operations[0].body.type: CREATE_ACCOUNT
    tx.operations[0].body.createAccountOp.destination: GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O
    tx.operations[0].body.createAccountOp.startingBalance: 123400000 (12.34e7)
    tx.ext.v: 0
    signatures.len: 0
`;

  const expectedXdr = `AAAAAKjbIbAJn+ysBWgp/jsZEx4ccbB3oicFelkopFq7rB38AAAAZAAE4pgAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAqNshsAmf7KwFaCn+OxkTHhxxsHeiJwV6WSikWrusHfwAAAAAAAAAAEBfNu3YzyLvv4ByuYW2pMAVUcNN04wTesjUDUAs0fe0AAAAAAda70AAAAAAAAAAAA==`;
  const tx = toTransaction(txrep, Networks.TESTNET);

  t.is(tx.source, 'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF');
  t.is(tx.fee, 100);
  t.is(tx.sequence, '1375042369748993');
  t.is(tx.timeBounds.minTime, '0');
  t.is(tx.timeBounds.maxTime, '0');
  t.is(tx.memo.type, MemoNone);

  const operation = tx.operations[0] as Operation.CreateAccount;
  t.is(operation.type, 'createAccount');
  t.is(
    operation.source,
    'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF'
  );
  t.is(Number(operation.startingBalance), 12.34);
  t.is(
    operation.destination,
    'GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O'
  );

  const actualXdr = (tx.toEnvelope().toXDR('base64') as unknown) as string;
  t.is(actualXdr, expectedXdr);
});

test('toTransaction.payment', t => {
  const expectedXdr =
    'AAAAACsWS5BDhC5BjpKQtznHFJ3CkU6+XtWopW+t+Q9KoH7QAAAAZAClKY0AAAABAAAAAQAAAABbicmAAAAAAF1q/QAAAAABAAAAFkVuam95IHRoaXMgdHJhbnNhY3Rpb24AAAAAAAEAAAAAAAAAAQAAAABAXzbt2M8i77+AcrmFtqTAFVHDTdOME3rI1A1ALNH3tAAAAAFVU0QAAAAAADJSVDIhkp9uz61Ra68rs3ScZIIgjT8ajX8Kkdc1be0LAAAAABfXk6AAAAAAAAAAAUqgftAAAABA3vtPH60cJ5MntVrxhP3N33P096jLQOflNKcdc6BRJLo2nbem0xtHyv0RhZIkaoV15sJJq5TsN2je22KSIhzlDA==';
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
  t.is(Number(operation.amount), 40.0004);

  const signature = tx.signatures[0];
  t.is(signature.hint().toString('hex'), '4aa07ed0');
  t.is(
    signature.signature().toString('hex'),
    'defb4f1fad1c279327b55af184fdcddf73f4f7a8cb40e7e534a71d73a05124ba369db7a6d31b47cafd118592246a8575e6c249ab94ec3768dedb6292221ce50c'
  );

  const actualXdr = (tx.toEnvelope().toXDR('base64') as unknown) as string;
  t.is(actualXdr, expectedXdr);
});

test('toTransaction.manageSellOffer', t => {
  const expectedXdr =
    'AAAAAKjbIbAJn+ysBWgp/jsZEx4ccbB3oicFelkopFq7rB38AAAAZAAE4pgAAAABAAAAAAAAAAAAAAABAAAAAQAAAACo2yGwCZ/srAVoKf47GRMeHHGwd6InBXpZKKRau6wd/AAAAAMAAAACU1RFTExBUgAAAAAAAAAAAEBfNu3YzyLvv4ByuYW2pMAVUcNN04wTesjUDUAs0fe0AAAAAVVTRAAAAAAAQF827djPIu+/gHK5hbakwBVRw03TjBN6yNQNQCzR97QAAAAAO5rKAAAAAAQAAAABAAAAAAAAAZ4AAAAAAAAAAA==';
  const txrep = `
  tx.sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
  tx.fee: 100
  tx.seqNum: 1375042369748993
  tx.timeBounds._present: false
  tx.memo.type: MEMO_NONE
  tx.operations.len: 1
  tx.operations[0].sourceAccount._present: true
  tx.operations[0].sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
  tx.operations[0].body.type: MANAGE_SELL_OFFER
  tx.operations[0].body.manageSellOfferOp.selling: STELLAR:GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O
  tx.operations[0].body.manageSellOfferOp.buying: USD:GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O
  tx.operations[0].body.manageSellOfferOp.amount: 1000000000 (100e7)
  tx.operations[0].body.manageSellOfferOp.price.n: 4
  tx.operations[0].body.manageSellOfferOp.price.d: 1
  tx.operations[0].body.manageSellOfferOp.offerID: 414 (0.0000414e7)
  tx.ext.v: 0
  signatures.len: 0
  `;

  const tx = toTransaction(txrep, Networks.TESTNET);

  t.is(tx.source, 'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF');

  const operation = tx.operations[0] as Operation.ManageSellOffer;
  t.is(operation.type, 'manageSellOffer');
  t.is(
    operation.source,
    'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF'
  );
  t.is(operation.selling.code, 'STELLAR');
  t.is(
    operation.selling.issuer,
    'GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O'
  );

  t.is(operation.buying.code, 'USD');
  t.is(
    operation.buying.issuer,
    'GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O'
  );

  t.is(Number(operation.amount), 100);
  t.is(operation.price, '4');
  t.is(operation.offerId, '414');
  const actualXdr = (tx.toEnvelope().toXDR('base64') as unknown) as string;
  t.is(actualXdr, expectedXdr);
});

test('toTransaction.createPassiveSellOffer', t => {
  const expectedXdr =
    'AAAAAKjbIbAJn+ysBWgp/jsZEx4ccbB3oicFelkopFq7rB38AAAAZAAE4pgAAAABAAAAAAAAAAAAAAABAAAAAQAAAACo2yGwCZ/srAVoKf47GRMeHHGwd6InBXpZKKRau6wd/AAAAAQAAAAAAAAAAAAAAABJUE+AAAAAAQAAAAoAAAAAAAAAAA==';
  const txrep = `
  tx.sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
  tx.fee: 100
  tx.seqNum: 1375042369748993
  tx.timeBounds._present: false
  tx.memo.type: MEMO_NONE
  tx.operations.len: 1
  tx.operations[0].sourceAccount._present: true
  tx.operations[0].sourceAccount: GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF
  tx.operations[0].body.type: CREATE_PASSIVE_SELL_OFFER
  tx.operations[0].body.createPassiveSellOfferOp.selling: XLM
  tx.operations[0].body.createPassiveSellOfferOp.buying: XLM
  tx.operations[0].body.createPassiveSellOfferOp.amount: 1230000000 (123e7)
  tx.operations[0].body.createPassiveSellOfferOp.price.n: 1
  tx.operations[0].body.createPassiveSellOfferOp.price.d: 10
  tx.ext.v: 0
  signatures.len: 0
  `;

  const tx = toTransaction(txrep, Networks.TESTNET);

  t.is(tx.source, 'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF');

  const operation = tx.operations[0] as Operation.CreatePassiveSellOffer;
  t.is(operation.type, 'createPassiveSellOffer');
  t.is(
    operation.source,
    'GCUNWINQBGP6ZLAFNAU74OYZCMPBY4NQO6RCOBL2LEUKIWV3VQO7YOBF'
  );
  t.true(operation.selling.isNative());
  t.true(operation.buying.isNative());

  t.is(Number(operation.amount), 123);
  t.is(operation.price, '0.1');
  const actualXdr = (tx.toEnvelope().toXDR('base64') as unknown) as string;
  t.is(actualXdr, expectedXdr);
});

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
