import express, { Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import env from './env';
import { createInvoice } from './lib/ln-api';
import { sequelize, Order } from './db';
import apiRouter from './routes/api';
import viewsRouter from './routes/views';

// Configure server
const app = express();
app.set('port', env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/client', express.static(path.join(__dirname, 'client')));

// Routes
app.use('/api', apiRouter);

app.get('/', (_, res: Response) => {
  res.render('template');
});

// Start the server
sequelize.sync({ force: true }).then(() => {
  console.log('Database synced');
  app.listen(env.PORT, () => {
    console.log(`REST server started on port ${env.PORT}`);
  });

  // Testing out
  createInvoice({
    description: `RUN LND Shirt (M)`,
    tokens: env.SHIRT_COST,
    expires_at: new Date(Date.now() + env.INVOICE_EXPIRE_MINS * 60 * 1000).toISOString(),
    wss: [],
  }).then(invoice => {
    return Order.create({
      pubkey: 'hello',
      paymentRequest: invoice.request,
      preimage: invoice.secret,
      size: 'M',
    });
  }).then(order => {
    // console.log(order);
  });
});