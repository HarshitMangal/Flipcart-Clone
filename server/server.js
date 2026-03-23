import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import Connection from './database/db.js';
import DefaultData from './default.js';
import Routes from './routes/route.js';

dotenv.config();
const app = express();

const PORT = process.env.port||8000;

// ✅ Middleware PEHLE
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', Routes);

// ✅ DB connect
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
Connection(username, password);

if(process.env.Node_ENV==='production'){
    app.use(express.static('client/build'))
}
// ✅ Default data
DefaultData();

// ✅ Server sabse last mein
app.listen(PORT, () => console.log(`Server is running successfully on PORT ${PORT}`));

// ✅ Sirf key export - paytmParams hataya
export let paytmMerchantkey = process.env.PAYTM_MERCHANT_KEY;