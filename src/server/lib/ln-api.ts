
import createLnRpc, {
  LnRpc,
  Invoice,
  VerifyMessageRequest,
  InvoiceSubscription,
} from '@radar/lnrpc';
import { Readable } from 'stream';
import env from '../env';

let readonlyLnRpc: LnRpc;
let invoiceLnRpc: LnRpc;
let invoiceStream: Readable;

export async function initLnApi() {
  const server = env.LND_GRPC_URL;
  const tls = env.LND_TLS_CERT_PATH;
  const cert = env.LND_TLS_CERT
    ? new Buffer(env.LND_TLS_CERT, 'base64').toString('ascii')
    : undefined;

  // Separate LN RPC instances for separate needs. Invoice can't readonly
  // and readonly can't create invoices.
  readonlyLnRpc = await createLnRpc({
    server,
    tls,
    cert,
    macaroon: env.LND_READONLY_MACAROON,
    macaroonPath: env.LND_READONLY_MACAROON_PATH,
  });

  invoiceLnRpc = await createLnRpc({
    server,
    tls,
    cert,
    macaroon: env.LND_INVOICE_MACAROON,
    macaroonPath: env.LND_INVOICE_MACAROON_PATH,
  });

  invoiceStream = await invoiceLnRpc.subscribeInvoices({});
}

function checkInitialized() {
  if (!invoiceLnRpc || !readonlyLnRpc) {
    throw new Error('Must initialize ln-api before running functions');
  }
}

export function createInvoice(args: Invoice) {
  checkInitialized();
  return invoiceLnRpc.addInvoice(args);
}

export function verifyMessage(args: VerifyMessageRequest) {
  checkInitialized();
  return readonlyLnRpc.verifyMessage({
    ...args,
    msg: Buffer.from(args.msg as string),
  }).then(res => ({
    valid: !!res.pubkey,
    ...res,
  }));
}

export function getNode(pubKey: string) {
  checkInitialized();
  return readonlyLnRpc.getNodeInfo({ pubKey });
}

export function getInvoiceStream() {
  checkInitialized();
  return invoiceStream;
}
