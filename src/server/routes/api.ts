import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyMessage, createInvoice, getNode } from '../lib/ln-api';
import { Order } from '../db';
import env from '../env';

const router = Router();

async function verify(message: string, signature: string, res: Response) {
  // First validate a message and get their pubkey
  let pubkey: string;
  try {
    const verification = await verifyMessage({ message, signature });
    if (!verification.signed_by) {
      res.status(400).json({ error: 'Could not verify your pubkey from signature. Try connecting to our node first.' });
      return false;
    }
    pubkey = verification.signed_by;
  } catch(err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid signature' });
    return false;
  }

  // TODO: Verify that we don't already have an order for this node
  return pubkey;
}

router.get('/stock', asyncHandler(async (_, res: Response) => {
  const stock = await Order.getStock();
  res.json({ data: stock });
}));

router.get('/node', asyncHandler(async (req: Request, res: Response) => {
  const { pubkey } = req.query;
  const node = await getNode(pubkey);
  res.json({ data: node });
}));

// Verify an LND signature
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { message, signature } = req.body;
  const pubkey = await verify(message, signature, res);

  if (pubkey) {
    const node = await getNode(pubkey);
    return res.json({
      data: {
        pubkey,
        node,
        valid: true,
      },
    });
  }
}));

// Verify the signature (again, to prevent cheaters) and create an invoice for them
router.post('/order', asyncHandler(async (req: Request, res: Response) => {
  const { message, signature, size } = req.body;

  const pubkey = await verify(message, signature, res);
  if (!pubkey) {
    return;
  }

  // If we already have an order for them, return it
  const existingOrder = await Order.getOrderForPubkey(pubkey);
  if (existingOrder) {
    return res.json({ data: existingOrder });
  }

  // Otherwise create a new invoice & order
  try {
    const expires = new Date(Date.now() + env.INVOICE_EXPIRE_MINS * 60 * 1000);
    const invoice = await createInvoice({
      description: `RUN LND Shirt (${size})`,
      tokens: env.SHIRT_COST,
      expires_at: expires.toISOString(),
      wss: [],
    });
    const newOrder = await Order.create({
      pubkey,
      size,
      expires,
      paymentRequest: invoice.request,
      preimage: invoice.secret,
    });
    res.status(201).json({ data: newOrder });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}));

export default router;