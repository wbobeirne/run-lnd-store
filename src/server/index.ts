import express, { Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import env from './env';
import { sequelize } from './db';
import { initLnApi } from './lib/ln-api';
import apiRouter from './routes/api';

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

app.get('*', (_, res: Response) => {
  res.render('template');
});

// Start the server
console.log('Initializing database...');
sequelize.sync({ force: true }).then(() => {
  console.log('Database initialized!');
  console.log('Initializing LND node API...');
  return initLnApi();
}).then(() => {
  console.log('LND API initialized!');
  console.log('Starting REST server...');
  app.listen(env.PORT, () => {
    console.log(`REST server started on port ${env.PORT}!`);
  });
});