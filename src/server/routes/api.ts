import { Router, Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { verifyMessage, createInvoice, getNode, getInvoiceStream } from '../lib/ln-api';
import { Order } from '../db';
import env from '../env';

const router = Router();

async function verify(msg: string, signature: string, res: Response) {
  // First validate a message and get their pubkey
  try {
    const verification = await verifyMessage({ msg, signature });
    if (!verification.valid) {
      res.status(400).json({ error: 'Invalid signature, make sure you copied it correctly and you signed using a mainnet node.' });
      return false;
    }
    if (!verification.pubkey) {
      res.status(400).json({ error: 'Could not verify your pubkey from signature. Make sure you’re on a mainnet node, and have at least one public channel open, and try again.' });
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
  try {
    const { node } = await getNode(pubkey);
    res.json({ data: node });
  } catch(err) {
    res.status(400).json({ error: 'Could not find your node on the network, add our node as a peer and try again' });
  }
}));


// Verify an LND signature
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { message, signature } = req.body;
  const pubkey = await verify(message, signature, res);
  if (!pubkey) {
    return;
  }

  try {
    const { node } = await getNode(pubkey);
    return res.json({
      data: {
        pubkey,
        node,
        valid: true,
      },
    });
  } catch(err) {
    console.error(err);
    res.status(400).json({ error: 'Could not find your node on the network, add our node as a peer and try again' });
  }
}));


// Verify the signature (again, to prevent cheaters) and create an invoice for them
router.post('/order', asyncHandler(async (req: Request, res: Response) => {
  const { message, signature, size } = req.body;

  const pubkey = await verify(message, signature, res);
  if (!pubkey) {
    return;
  }

  // If we already have an active order for them, return it
  const activeOrder = await Order.getActiveOrderForPubkey(pubkey);
  if (activeOrder) {
    return res.json({ data: activeOrder.serialize() });
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
      rHash: Buffer.from(invoice.rHash as Uint8Array).toString('hex'),
      addIndex: invoice.addIndex,
      hasPaid: false,
    });
    res.status(201).json({ data: newOrder.serialize() });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create invoice, it’s probably an issue on our end' });
  }
}));


router.get('/order/:id', async (req: Request, res: Response) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'No order found' });
  }
  return res.json({ data: order.serialize() });
});


router.put('/order/:id', async (req: Request, res: Response) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'No order found' });
  }

  try {
    const updateKeys: Array<keyof Order> = ['address1', 'address2', 'city', 'country', 'email', 'name', 'state', 'zip'];
    updateKeys.forEach(key => {
      if (req.body[key] === null || req.body[key] === undefined) {
        return;
      }
      order[key] = req.body[key];
    });
    await order.save();
    res.json({ data: order.serialize() });
  } catch(err) {
    res.status(400).json({ error: 'Invalid information for order, check the form and try again' });
  }
});


router.ws('/order/:id/subscribe', async (ws, req) => {
  const order = await Order.findByPk(req.params.id);
  const sendAndClose = (d: object) => {
    ws.send(JSON.stringify(d), err => {
      if (err) {
        console.log('sendAndClose error:', err);
      } else {
        ws.close();
      }
    });
  };

  if (!order) {
    return sendAndClose({ error: 'No order found' });
  }

  // Early returns if the database has info
  console.log(order.expires.toLocaleString());
  console.log(new Date().toLocaleString());
  if (order.hasPaid) {
    return sendAndClose({ success: true });
  }
  if (order.expires.getTime() < Date.now()) {
    return sendAndClose({ expired: true });
  }

  // Open up stream with invoice to find out when they pay
  console.log('Streamin');
  const stream = getInvoiceStream();
  let expiresTimeout: NodeJS.Timeout;
  stream.on('data', chunk => {
    // Send an expired event after time has elapsed
    if (chunk.expiry && chunk.creationDate && !expiresTimeout) {
      const expiryDate = new Date((parseInt(chunk.creationDate, 10) + parseInt(chunk.expiry, 10)) * 1000);
      const msToExpiry = expiryDate.getTime() - Date.now();
      expiresTimeout = setTimeout(() => sendAndClose({ expired: true }), msToExpiry);
    }

    if (chunk.settled) {
      clearTimeout(expiresTimeout);
      order.update({ hasPaid: true });
      sendAndClose({ success: true });
    }
  });
  stream.on('error', err => {
    console.error('Encountered error in invoice stream:', err);
    ws.close();
  });
  stream.on('close', () => {
    console.error('Invoice stream closed unexpectedly');
    ws.close();
  });

  ws.on('close', () => {
    stream.removeAllListeners();
  });
});

export default router;