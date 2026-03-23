import paytmchecksum from '../paytm/PaytmChecksum.js';
import { paytmMerchantkey } from '../server.js';
import https from 'https';
import { v4 as uuid } from 'uuid';

export const addPaymentGateway = async (request, response) => {
    try {
        const paytmParams = {
            MID: process.env.PAYTM_MID,
            WEBSITE: process.env.PAYTM_WEBSITE,
            CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
            INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE_ID,
            ORDER_ID: uuid(),
            CUST_ID: process.env.PAYTM_CUST_ID || 'CUST_001',
            TXN_AMOUNT: String(request.body.amount || '100'),
            CALLBACK_URL: 'https://securegw-stage.paytm.in/theia/paytmCallback', // ✅ fix
            EMAIL: request.body.email || '',
            MOBILE_NO: '1234567890'
        };

        const paytmCheckSum = await paytmchecksum.generateSignature(
            paytmParams, 
            paytmMerchantkey
        );

        response.json({ ...paytmParams, CHECKSUMHASH: paytmCheckSum });

    } catch (error) {
        console.log('Payment error:', error);
        response.status(500).json({ error: 'Payment failed' });
    }
}

export const paymentResponse = (request, response) => {
    console.log('Callback body:', request.body);
    
    const paytmCheckSum = request.body.CHECKSUMHASH;

    if (!paytmCheckSum) {
        console.log('CHECKSUMHASH missing');
        return response.redirect('http://localhost:3000/');
    }

    delete request.body.CHECKSUMHASH;

    const isVerifySignature = paytmchecksum.verifySignature(
        request.body, 
        paytmMerchantkey, 
        paytmCheckSum
    );
    
    if (isVerifySignature) {
        let verifyParams = {};
        verifyParams["MID"] = request.body.MID;
        verifyParams["ORDERID"] = request.body.ORDERID;

        paytmchecksum.generateSignature(verifyParams, paytmMerchantkey)
        .then(function(checksum) {
            verifyParams["CHECKSUMHASH"] = checksum;
            const post_data = JSON.stringify(verifyParams);

            const options = {
                hostname: 'securegw-stage.paytm.in',
                port: 443,
                path: '/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            let res = "";
            const post_req = https.request(options, function(post_res) {
                post_res.on('data', function(chunk) {
                    res += chunk;
                });
                post_res.on('end', function() {
                    let result = JSON.parse(res);
                    console.log('Payment Result:', result);
                    response.redirect('http://localhost:3000/');
                });
            });

            post_req.write(post_data);
            post_req.end();
        });
    } else {
        console.log("Checksum Mismatched");
        response.redirect('http://localhost:3000/');
    }
}