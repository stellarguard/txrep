import { Asset, Memo, Operation, Transaction, xdr } from 'stellar-sdk';

export function toTxrep(transaction: Transaction) {
  const lines = [];

  addLine('tx.sourceAccount', transaction.source, lines);
  addLine('tx.fee', transaction.fee, lines);
  addLine('tx.seqNum', transaction.sequence, lines);
  addTimeBounds(transaction.timeBounds, lines);
  addMemo(transaction.memo, lines);
  addOperations(transaction.operations, lines);
  addLine('tx.ext.v', 0, lines);
  addSignatures(transaction.signatures, lines);
  return lines.join('\n');
}

function addLine(key: string, value: any, lines: string[]) {
  if (value !== undefined) {
    lines.push(`${key}: ${value}`);
  }
}

function addTimeBounds(
  timeBounds: { minTime: string; maxTime: string },
  lines: string[]
) {
  if (timeBounds) {
    addLine('tx.timeBounds._present', true, lines);
    addLine('tx.timeBounds.minTime', timeBounds.minTime, lines);
    addLine('tx.timeBounds.maxTime', timeBounds.maxTime, lines);
  } else {
    addLine('tx.timeBounds._present', false, lines);
  }
}

function addMemo(memo: Memo, lines: string[]) {
  switch (memo.type) {
    case 'none':
      addLine('tx.memo.type', 'MEMO_NONE', lines);
      return;
    case 'text':
      addLine('tx.memo.type', 'MEMO_TEXT', lines);
      addLine(
        'tx.memo.text',
        JSON.stringify(memo.value.toString('utf-8')),
        lines
      );
      return;
    case 'id':
      addLine('tx.memo.type', 'MEMO_ID', lines);
      addLine('tx.memo.id', memo.value, lines);
      return;
    case 'hash':
      addLine('tx.memo.type', 'MEMO_HASH', lines);
      addLine('tx.memo.hash', memo.value, lines);
      return;
    case 'return':
      addLine('tx.memo.type', 'MEMO_RETURN', lines);
      addLine('tx.memo.retHash', memo.value, lines);
      return;
  }
}

function addOperations(operations: Operation[], lines: string[]) {
  addLine('tx.operations.len', operations.length, lines);
  operations.forEach((operation, i) => {
    addOperation(operation, i, lines);
  });
}

function addOperation(operation: Operation, i: number, lines: string[]) {
  const prefix = `tx.operations[${i}]`;
  const addOpLine = (k: string, v: any) => addLine(`${prefix}.${k}`, v, lines);
  if (operation.source) {
    addOpLine('sourceAccount._present', true);
    addOpLine('sourceAccount', operation.source);
  } else {
    addOpLine('sourceAccount._present', false);
  }

  switch (operation.type) {
    case 'payment':
      addPaymentOperation(operation, addOpLine);
      return;
    default:
      throw Error('Not implemented');
  }
}

function addPaymentOperation(operation: Operation.Payment, addOpLine: any) {
  addOpLine('body.type', 'PAYMENT');
  const addPaymentOpLine = (k: string, v: any) =>
    addOpLine(`body.paymentOp.${k}`, v);
  addPaymentOpLine('destination', operation.destination);
  addPaymentOpLine('asset', toAsset(operation.asset));
  addPaymentOpLine('amount', toAmount(operation.amount));
}

function toAsset(asset: Asset) {
  if (asset.isNative()) {
    return 'XLM';
  }

  return `${asset.code}:${asset.issuer}`;
}

function toAmount(amount: string) {
  return Number(amount) * 10000000;
}

function addSignatures(signatures: xdr.DecoratedSignature[], lines: string[]) {
  addLine('signatures.len', signatures.length, lines);
  signatures.forEach((signature, i) => {
    addSignature(signature, i, lines);
  });
}

function addSignature(
  signature: xdr.DecoratedSignature,
  i: number,
  lines: string[]
) {
  const prefix = `signatures[${i}]`;
  addLine(`${prefix}.hint`, signature.hint().toString('hex'), lines);
  addLine(`${prefix}.signature`, signature.signature().toString('hex'), lines);
}
