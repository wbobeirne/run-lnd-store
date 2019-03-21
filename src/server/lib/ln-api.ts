import path from 'path';
import createLnRpc, { LnRpc } from '@radar/lnrpc';
import env from '../env';

let readonlyLnRpc: LnRpc;
let invoiceLnRpc: LnRpc;

export async function initLnApi() {
  const server = env.LND_GRPC_URL;
  const tls = env.LND_TLS_CERT_PATH;

  // Separate LN RPC instances for separate needs. Invoice can't readonly
  // and readonly can't create invoices.
  readonlyLnRpc = await createLnRpc({
    server,
    tls,
    macaroon: env.LND_READONLY_MACAROON,
  });

  invoiceLnRpc = await createLnRpc({
    server,
    tls,
    macaroon: env.LND_INVOICE_MACAROON,
  });
}

function checkInitialized() {
  if (!invoiceLnRpc || !readonlyLnRpc) {
    throw new Error('Must initialize ln-api before running functions');
  }
}

export function createInvoice(...args: Parameters<LnRpc["addInvoice"]>) {
  checkInitialized();
  return invoiceLnRpc.addInvoice(...args);
}

export function verifyMessage(...args: Parameters<LnRpc["verifyMessage"]>) {
  checkInitialized();
  return readonlyLnRpc.verifyMessage(...args);
}

export function getNode(pubKey: string) {
  checkInitialized();
  return readonlyLnRpc.getNodeInfo({ pubKey });
}

// Get parameters from another function as args
type Parameters<T> = T extends (... args: infer T) => any ? T : never; 
