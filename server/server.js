import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Connection from './database/db.js';
import DefaultData from './default.js';
import Routes from './routes/route.js';
import { initRedis } from './config/redis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initRedis();

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

const PORT = process.env.port||8000;

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', Routes);

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
Connection(username, password);

if(process.env.NODE_ENV==='production'){
    app.use(express.static('client/build'))
}
DefaultData();

app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));

export let paytmMerchantkey = process.env.PAYTM_MERCHANT_KEY;