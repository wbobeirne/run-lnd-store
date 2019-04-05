import express, { Response } from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import path from 'path';
import enforce from 'express-sslify';
import env from './env';
import { sequelize, Order } from './db';
import { initLnApi, getInvoiceStream } from './lib/ln-api';
import { rHashBufferToStr } from './util';

// Configure server
const app = express();
expressWs(app);
app.set('port', env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/client', express.static(path.join(__dirname, 'client')));

if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Routes
const apiRouter = require('./routes/api').default;
app.use('/api', apiRouter);

app.get('*', (_, res: Response) => {
  res.render('template');
});

// Start the server
console.log('Initializing database...');
sequelize.sync({ force: false }).then(() => {
  console.log('Database initialized!');
  console.log('Initializing LND node API...');
  return initLnApi();
}).then(() => {
  console.log('LND API initialized!');
  console.log('Starting REST server...');
  app.listen(env.PORT, () => {
    console.log(`REST server started on port ${env.PORT}!`);
  });

  // Keep an eye out for paid invoices, in case the API stream isn't watching
  getInvoiceStream().on('data', async (chunk) => {
    console.log(chunk);
    if (chunk.settled && chunk.rHash) {
      const rHash = rHashBufferToStr(chunk.rHash);
      const order = await Order.findOne({
        where: { rHash },
      });
      if (order) {
        console.log('Received a payment of', chunk.amtPaidSat, 'sats for order', order.id);
        order.update({ hasPaid: true });
      }
    }
  });
});