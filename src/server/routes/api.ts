import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyMessage, createInvoice } from '../lib/ln-api';
import { Order } from '../db';
import env from '../env';

const router = Router();

async function verifyAndAssertUnique(message: string, signature: string, res: Response) {
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

router.get('/stock', asyncHandler(async (req: Request, res: Response, _: NextFunction) => {
  const stock = await Order.getStock();
  res.json({ data: stock });
}));

// Verify an LND signature
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  const { message, signature } = req.body;
  const pubkey = await verifyAndAssertUnique(message, signature, res);

  if (pubkey) {
    return res.json({
      data: {
        pubkey,
        valid: true,
      },
    });
  }

  next();
});

// Verify the signature (again, to prevent cheaters) and create an invoice for them
router.post('/order', async (req: Request, res: Response, next: NextFunction) => {
  const { message, signature, size } = req.body;

  const pubkey = await verifyAndAssertUnique(message, signature, res);
  if (!pubkey) {
    return next();
  }

  // Create an invoice
  try {
    createInvoice({
      description: `RUN LND Shirt (${size})`,
      tokens: env.SHIRT_COST,
      expires_at: new Date(Date.now() + env.INVOICE_EXPIRE_MINS * 60 * 1000).toISOString(),
      wss: [],
    });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create LN invoice' });
  }

  next();
});

export default router;