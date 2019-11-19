import {
  Account,
  Asset,
  Memo,
  Operation,
  Transaction,
  TransactionBuilder
} from 'stellar-sdk';

import ldSet from 'lodash.set';

export function toTransaction(txrep: string): Transaction {
  const obj: any = toObj(txrep);
  const account = new Account(obj.tx.sourceAccount, obj.tx.seqNum);
  // hack - build() will increment the sequence number so we have to decrement it first
  (account as any).sequence = (account as any).sequence.add(-1);
  const opts = {
    memo: toMemo(obj.tx.memo),
    fee: toFee(obj.tx.fee),
    timebounds: toTimebounds(obj.tx.timeBounds)
  };
  const builder = new TransactionBuilder(account, opts);

  for (const operation of obj.tx.operations) {
    builder.addOperation(toOperation(operation));
  }

  return builder.build();
}

function toObj(txrep: string): object {
  const obj = {};
  const fields = txrep
    .split('\n')
    .map(line => line.trim())
    .filter(l => !!l)
    .map(parseLine);

  fields.forEach(({ path, value }) => {
    // meta-attributes will mess up arrays if converted directly to an object, so ignore them
    if (!isMetaAttribute(path)) {
      ldSet(obj, path, parseValue(value));
    }
  });

  return obj;
}

function isMetaAttribute(path: string): boolean {
  const paths = path.split('.');
  return paths[paths.length - 1].startsWith('_');
}

function parseLine(line: string) {
  const colonPos = line.indexOf(':');
  const path = line.slice(0, colonPos);
  const value = line.slice(colonPos + 1).trim();
  return { path, value };
}

function parseValue(value: string) {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }

  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  return value;
}

function toFee(value: string): number {
  return Number(value);
}

function toAsset(value: string): Asset {
  if (!value) {
    return undefined;
  }

  if (value === 'XLM') {
    return Asset.native();
  }

  if (value === 'native') {
    return Asset.native();
  }

  const [code, issuer] = value.split(':');
  return new Asset(code, issuer);
}

function toMemo(memo: any) {
  switch (memo.type) {
    case 'MEMO_TEXT':
      return Memo.text(memo.text);
    default:
      return Memo.none();
  }
}

function toTimebounds({ minTime, maxTime }) {
  return { minTime, maxTime };
}

function toAmount(amount: string, asset: Asset) {
  if (asset.isNative()) {
    return (Number(amount) * 0.00001).toString(); // TODO: BigNumber
  } else {
    return amount;
  }
}

function toOperation({ sourceAccount, body }) {
  switch (body.type) {
    case 'CREATE_ACCOUNT':
      return toCreateAccountOperation(body.createAccountOp, sourceAccount);
    case 'PAYMENT':
      return toPaymentOperation(body.paymentOp, sourceAccount);
    case 'PATH_PAYMENT_STRICT_RECEIVE':
      return toPathPaymentStrictReceive(
        body.pathPaymentStrictReceiveOp,
        sourceAccount
      );
    default:
      throw new Error('Not implemented');
    // case "MANAGE_SELL_OFFER":
    //     return toManageSellOffer(body.manageSellOfferResult, sourceAccount);
    // case "CREATE_PASSIVE_SELL_OFFER":
    //     ManageSellOfferResult createPassiveSellOfferResult;
    // case "SET_OPTIONS":
    //     SetOptionsResult setOptionsResult;
    // case "CHANGE_TRUST":
    //     ChangeTrustResult changeTrustResult;
    // case "ALLOW_TRUST":
    //     AllowTrustResult allowTrustResult;
    // case "ACCOUNT_MERGE":
    //     AccountMergeResult accountMergeResult;
    // case "INFLATION":
    //     InflationResult inflationResult;
    // case "MANAGE_DATA":
    //     ManageDataResult manageDataResult;
    // case "BUMP_SEQUENCE":
    //     BumpSequenceResult bumpSeqResult;
    // case "MANAGE_BUY_OFFER":
    //     ManageBuyOfferResult manageBuyOfferResult;
    // case "PATH_PAYMENT_STRICT_SEND":
  }
}

function toCreateAccountOperation(op: any, source: string) {
  const { destination, startingBalance } = op;
  return Operation.createAccount({
    destination,
    startingBalance: toAmount(startingBalance, Asset.native()),
    source
  });
}

function toPaymentOperation(op: any, source: string) {
  const { destination, amount } = op;
  const asset = toAsset(op.asset);
  return Operation.payment({
    destination,
    asset,
    amount: toAmount(amount, asset),
    source
  });
}

function toPathPaymentStrictReceive(op: any, source: string) {
  const { sendMax, destination, destAmount, path } = op;
  const sendAsset = toAsset(op.sendAsset);
  const destAsset = toAsset(op.destAsset);
  return Operation.pathPaymentStrictReceive({
    sendAsset,
    sendMax: toAmount(sendMax, sendAsset),
    destination,
    destAsset,
    destAmount: toAmount(destAmount, destAsset),
    path: path && path.map(toAsset),
    source
  });
}
