import lnService from 'ln-service';
import lnCreateInvoice from 'ln-service/createInvoice';
import lnVerifyMessage from 'ln-service/verifyMessage';
import WebSocket from 'ws';
import env from '../env';

// Separate LND instances for separate needs. Invoice can't readonly and vice versa.
const readonlyLnd = lnService.lightningDaemon({
  socket: env.LND_GRPC_URL,
  cert: env.LND_TLS_CERT,
  macaroon: env.LND_READONLY_MACAROON,
});

const invoiceLnd = lnService.lightningDaemon({
  socket: env.LND_GRPC_URL,
  cert: env.LND_TLS_CERT,
  macaroon: env.LND_INVOICE_MACAROON,
});

// Create Invoice
interface CreateInvoiceArgs {
  description: string;
  expires_at: string; // ISO 8601
  tokens: string | number;
  wss: WebSocket[];
}

interface CreateInvoiceResponse {
  created_at: string; // ISO 8601
  description: string;
  id: string;
  request: string;
  secret: string;
  tokens: string;
  type: string;
}

export function createInvoice(args: CreateInvoiceArgs): Promise<CreateInvoiceResponse> {
  return lnCreateInvoice({
    ...args,
    lnd: invoiceLnd,
    log: console.log,
  });
}


// Verify Message
interface VerifyMessageArgs {
  message: string;
  signature: string;
}

interface VerifyMessageResponse {
  signed_by: string;
}

export function verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
  return lnVerifyMessage({
    ...args,
    lnd: readonlyLnd,
    log: console.log,
  });
}

