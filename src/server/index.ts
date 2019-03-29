import express, { Response } from 'express';
import expressWs from 'express-ws';
import bodyParser from 'body-parser';
import path from 'path';
import env from './env';
import { sequelize } from './db';
import { initLnApi, createInvoice } from './lib/ln-api';

// Configure server
const app = express();
expressWs(app);
app.set('port', env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/client', express.static(path.join(__dirname, 'client')));

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

  // Sample order
  // const expiry = env.INVOICE_EXPIRE_MINS * 60;
  // createInvoice({
  //   memo: `RUN LND Shirt (M)`,
  //   value: env.SHIRT_COST.toString(),
  //   expiry: expiry.toString(),
  // })
  // .then(res => console.log(res))
  // .catch(err => console.log('oh shit', err));
});