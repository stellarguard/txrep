import {
  Account,
  Asset,
  AuthFlag,
  Memo,
  Operation,
  SignerOptions,
  StrKey,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  xdr
} from 'stellar-sdk';

import BigNumber from 'bignumber.js';
import { set } from './utils';

export function toTransaction(
  txrep: string,
  networkPassphrase?: string
): Transaction {
  const obj: any = toObj(txrep);
  const account = new Account(obj.tx.sourceAccount, obj.tx.seqNum);
  // hack - build() will increment the sequence number so we have to decrement it first
  (account as any).sequence = (account as any).sequence.add(-1);
  const opts = {
    memo: toMemo(obj.tx.memo),
    fee: toFee(obj.tx.fee),
    timebounds: toTimebounds(obj.tx.timeBounds),
    networkPassphrase
  };
  const builder = new TransactionBuilder(account, opts);

  if (!opts.timebounds) {
    builder.setTimeout(TimeoutInfinite);
  }

  for (const operation of obj.tx.operations) {
    builder.addOperation(toOperation(operation));
  }

  const transaction = builder.build();

  if (obj.signatures) {
    for (const signature of obj.signatures) {
      transaction.signatures.push(toSignature(signature));
    }
  }
  return transaction;
}

export function toObj(txrep: string): object {
  const obj = {};
  const fields = txrep
    .split('\n')
    .map(line => line.trim())
    .filter(l => !!l)
    .map(parseLine);

  fields.forEach(({ path, value }) => {
    // meta-attributes will mess up arrays if converted directly to an object, so ignore them
    if (!path || !isMetaAttribute(path)) {
      set(obj, path, value);
    }
  });

  return obj;
}

function isMetaAttribute(path: string): boolean {
  const paths = path.split('.');
  const field = paths[paths.length - 1];
  return field === 'len' || field.startsWith('_');
}

export function parseLine(line: string) {
  const [path, remainingLine] = getPath(line);
  const [value, comment] = getValue(remainingLine);
  return { path, value: parseValue(value), comment };
}

function getPath(line: string) {
  const colonPos = line.indexOf(':');
  const path = line.slice(0, colonPos).trim();
  const rest = line.slice(colonPos + 1).trim();
  return [path, rest];
}

function getValue(line: string) {
  if (line[0] === '"') {
    return getStringValue(line);
  } else {
    return getNonStringValue(line);
  }
}

function getStringValue(line: string) {
  let value = '"';
  let inEscapeSequence = false;
  let i = 1;
  for (; i < line.length; ++i) {
    const char = line[i];
    if (inEscapeSequence) {
      // newline
      if (char === 'n') {
        value += '\n';
      } else {
        value += char;
      }

      inEscapeSequence = false;
    } else if (char === '\\') {
      inEscapeSequence = true;
    } else if (char === '"') {
      // end of string
      value += char;
      break;
    } else {
      value += char;
    }
  }

  return [value.trim(), line.slice(i + 1).trim()];
}

function getNonStringValue(line: string) {
  const spacePos = line.indexOf(' ');
  if (spacePos === -1) {
    return [line.trim(), ''];
  } else {
    const value = line.slice(0, spacePos);
    const rest = line.slice(spacePos);
    return [value.trim(), rest.trim()];
  }
}

function parseValue(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

function toFee(value: string): number {
  return Number(value);
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
    case 'PATH_PAYMENT_STRICT_SEND':
      return toPathPaymentStrictSend(
        body.pathPaymentStrictSendOp,
        sourceAccount
      );
    case 'MANAGE_SELL_OFFER':
      return toManageSellOffer(body.manageSellOfferOp, sourceAccount);
    case 'CREATE_PASSIVE_SELL_OFFER':
      return toCreatePassiveSellOffer(
        body.createPassiveSellOfferOp,
        sourceAccount
      );
    case 'SET_OPTIONS':
      return toSetOptions(body.setOptionsOp, sourceAccount);
    case 'CHANGE_TRUST':
      return toChangeTrust(body.changeTrustOp, sourceAccount);
    case 'ALLOW_TRUST':
      return toAllowTrust(body.allowTrustOp, sourceAccount);
    case 'ACCOUNT_MERGE':
      // ACCOUNT_MERGE does not have a nested op in it
      return toAccountMerge(body, sourceAccount);
    case 'MANAGE_DATA':
      return toManageData(body.manageDataOp, sourceAccount);
    case 'BUMP_SEQUENCE':
      return toBumpSequence(body.bumpSequenceOp, sourceAccount);
    case 'MANAGE_BUY_OFFER':
      return toManageBuyOffer(body.manageBuyOfferOp, sourceAccount);
    default:
      throw new Error('Not implemented');
  }
}

function toCreateAccountOperation(op: any, source: string) {
  const { destination, startingBalance } = op;
  return Operation.createAccount({
    destination,
    startingBalance: toAmount(startingBalance),
    source
  });
}

function toPaymentOperation(op: any, source: string) {
  const { asset, destination, amount } = op;

  return Operation.payment({
    destination,
    asset: toAsset(asset),
    amount: toAmount(amount),
    source
  });
}

function toPathPaymentStrictReceive(op: any, source: string) {
  const { sendAsset, destAsset, sendMax, destination, destAmount, path } = op;

  return Operation.pathPaymentStrictReceive({
    sendAsset: toAsset(sendAsset),
    sendMax: toAmount(sendMax),
    destination,
    destAsset: toAsset(destAsset),
    destAmount: toAmount(destAmount),
    path: path && path.map(toAsset),
    source
  });
}

function toPathPaymentStrictSend(op: any, source: string) {
  const { sendAsset, sendAmount, destAsset, destination, destMin, path } = op;

  return Operation.pathPaymentStrictSend({
    sendAsset: toAsset(sendAsset),
    sendAmount: toAmount(sendAmount),
    destination,
    destAsset: toAsset(destAsset),
    destMin: toAmount(destMin),
    path: path && path.map(toAsset),
    source
  });
}

type ManageSellOfferOp = {
  selling: string;
  buying: string;
  amount: string;
  price: {
    d: string;
    n: string;
  };
  offerID: string;
};

function toManageSellOffer(op: ManageSellOfferOp, source: string) {
  const { selling, buying, amount, price, offerID } = op;

  return Operation.manageSellOffer({
    selling: toAsset(selling),
    buying: toAsset(buying),
    amount: toAmount(amount),
    price: toPrice(price),
    offerId: offerID,
    source
  });
}

type ManageBuyOfferOp = {
  selling: string;
  buying: string;
  buyAmount: string;
  price: {
    d: string;
    n: string;
  };
  offerID: string;
};

function toManageBuyOffer(op: ManageBuyOfferOp, source: string) {
  const { selling, buying, buyAmount, price, offerID } = op;

  return Operation.manageBuyOffer({
    selling: toAsset(selling),
    buying: toAsset(buying),
    buyAmount: toAmount(buyAmount),
    price: toPrice(price),
    offerId: offerID,
    source
  });
}

function toCreatePassiveSellOffer(op: any, source: string) {
  const { selling, buying, amount, price } = op;

  return Operation.createPassiveSellOffer({
    selling: toAsset(selling),
    buying: toAsset(buying),
    amount: toAmount(amount),
    price: toPrice(price),
    source
  });
}

type SetOptionsOp = {
  inflationDest?: string;
  clearFlags?: AuthFlag;
  setFlags?: AuthFlag;
  masterWeight?: string;
  lowThreshold?: string;
  medThreshold?: string;
  highThreshold?: string;
  homeDomain?: string;
  signer?: {
    key: string;
    weight: string;
  };
};

function toSetOptions(op: SetOptionsOp = {}, source: string) {
  const {
    inflationDest,
    clearFlags,
    setFlags,
    masterWeight,
    lowThreshold,
    medThreshold,
    highThreshold,
    homeDomain,
    signer
  } = op;

  let signerOptions: SignerOptions;
  if (signer) {
    switch (signer.key.charAt(0)) {
      case 'G':
        signerOptions = {
          ed25519PublicKey: signer.key,
          weight: signer.weight
        };
        break;
      case 'X':
        signerOptions = {
          sha256Hash: StrKey.decodeSha256Hash(signer.key),
          weight: signer.weight
        };
        break;
      case 'T':
        signerOptions = {
          preAuthTx: StrKey.decodePreAuthTx(signer.key),
          weight: signer.weight
        };
        break;
    }
  }

  return Operation.setOptions({
    inflationDest,
    clearFlags,
    setFlags,
    masterWeight,
    lowThreshold,
    medThreshold,
    highThreshold,
    homeDomain,
    signer: signerOptions,
    source
  });
}

type ChangeTrustOp = {
  line: string;
  limit: string | undefined;
};

function toChangeTrust(op: ChangeTrustOp, source: string) {
  const { line, limit } = op;
  return Operation.changeTrust({
    asset: toAsset(line),
    limit: limit && toLimit(limit),
    source
  });
}

type AllowTrustOp = {
  trustor: string;
  asset: string;
  authorize: boolean;
};

function toAllowTrust(op: AllowTrustOp, source: string) {
  const { trustor, asset, authorize } = op;
  return Operation.allowTrust({
    trustor,
    authorize,
    assetCode: asset,
    source
  });
}

type AccountMergeOp = {
  destination: string;
};

function toAccountMerge(op: AccountMergeOp, source: string) {
  const { destination } = op;
  return Operation.accountMerge({
    destination,
    source
  });
}

type ManageDataOp = {
  dataName: string;
  dataValue?: string;
};

function toManageData(op: ManageDataOp, source: string) {
  const { dataName, dataValue } = op;
  const value = Buffer.from(dataValue, 'hex');
  return Operation.manageData({ name: dataName, value, source });
}

type BumpSequenceOp = {
  bumpTo: string;
};

function toBumpSequence(op: BumpSequenceOp, source: string) {
  const { bumpTo } = op;

  return Operation.bumpSequence({
    bumpTo,
    source
  });
}

function toSignature(sig: { hint: string; signature: string }) {
  const hint = Buffer.from(sig.hint, 'hex');
  const signature = Buffer.from(sig.signature, 'hex');
  return new xdr.DecoratedSignature({ hint, signature });
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
    case 'MEMO_ID':
      return Memo.id(memo.id);
    case 'MEMO_HASH':
      return Memo.hash(memo.hash);
    case 'MEMO_RETURN':
      return Memo.return(memo.retHash);
    default:
      return Memo.none();
  }
}

function toTimebounds(timeBounds) {
  if (!timeBounds) {
    return undefined;
  }

  const { minTime, maxTime } = timeBounds;
  return { minTime, maxTime };
}

function toAmount(amount: string) {
  return new BigNumber(amount).div(10000000).toFixed(10);
}

function toLimit(limit: string) {
  return new BigNumber(limit).div(10000000).toFixed(7);
}

function toPrice({ n, d }: { n: string; d: string }) {
  return {
    n: Number(n),
    d: Number(d)
  };
}
