import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyMessage, createInvoice, getNode } from '../lib/ln-api';
import { Order } from '../db';
import env from '../env';

const router = Router();

async function verify(msg: string, signature: string, res: Response) {
  // First validate a message and get their pubkey
  let pubkey: string;
  try {
    const verification = await verifyMessage({ msg, signature });
    if (!verification.pubkey) {
      res.status(400).json({ error: 'Could not verify your pubkey from signature. Try connecting to our node first and trying again.' });
      return false;
    }
    return verification.pubkey;
  } catch(err) {
    console.error(err)
    res.status(400).json({ error: 'Invalid signature, make sure you copied it correctly and you signed using a mainnet node.' });
    return false;
  }
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
  if (!pubkey) {
    return;
  }

  const node = await getNode(pubkey);
  return res.json({
    data: {
      pubkey,
      node,
      valid: true,
    },
  });
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
    return res.json({ data: existingOrder.serialize() });
  }

  // Otherwise create a new invoice & order
  try {
    const expiry = env.INVOICE_EXPIRE_MINS * 60;
    const invoice = await createInvoice({
      memo: `RUN LND Shirt (${size})`,
      value: env.SHIRT_COST.toString(),
      expiry: expiry.toString(),
    });
    const newOrder = await Order.create({
      pubkey,
      size,
      expires: new Date(Date.now() + expiry * 1000),
      paymentRequest: invoice.paymentRequest,
      preimage: invoice.rHash.toString(),
    });
    res.status(201).json({ data: newOrder.serialize() });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create invoice, it’s probably an issue on our end' });
  }
}));

export default router;