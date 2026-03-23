import express from 'express';
const router = express.Router();
import { userSignup,userLogin } from '../controllers/user-controller.js';
import { getProducts,getProductById } from '../controllers/product-controllers.js';
import { addPaymentGateway, paymentResponse } from '../controllers/payment-controller.js';


 router.post('/signup', userSignup);
 router.post('/login', userLogin);

 //product routes will be here
 router.get('/products', getProducts);
 router.get('/products/:id',getProductById);

 router.post('/payment', addPaymentGateway);
router.post('/callback', paymentResponse);


export default router;