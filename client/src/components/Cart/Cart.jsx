import { useEffect, useContext, useState } from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, CircularProgress, styled } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, resetCart } from '../../redux/actions/cartActions';

import TotalView from './TotalView';
import EmptyCart from './EmptyCart';
import CartItem from './CartItem';
import { DataContext } from '../../context/dataprovider';
import axios from 'axios';

const Component = styled(Grid)(({ theme }) => ({
    padding: '20px 40px',
    display: 'flex',
    [theme.breakpoints.down('md')]: {
        padding: '15px 0',
        flexDirection: 'column'
    }
}));

const LeftComponent = styled(Grid)(({ theme }) => ({
    paddingRight: 15,
    [theme.breakpoints.down('sm')]: {
        marginBottom: 15
    }
}));

const Header = styled(Box)`
    padding: 15px 24px;
    background: #fff;
`;

const BottomWrapper = styled(Box)`
    padding: 16px 22px;
    background: #fff;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 10%);
    border-top: 1px solid #f0f0f0;
`;

const StyledButton = styled(Button)`
    display: flex;
    margin-left: auto;
    background: #fb641b;
    color: #fff;
    border-radius: 2px;
    width: 250px;
    height: 51px;
`;

const Cart = () => {
    const cartDetails = useSelector(state => state.cart);
    const { cartItems } = cartDetails;
    const { id } = useParams();
    const { account, localeInfo, formatPrice } = useContext(DataContext);
    const navigate = useNavigate();

    const dispatch = useDispatch();
    
    // International PayPal dialog states
    const [openPaypalDialog, setOpenPaypalDialog] = useState(false);
    const [paypalLoading, setPaypalLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    const removeItemFromCart = (id) => {
        dispatch(removeFromCart(id));
    }

    const buyNow = async () => {
        if (!account) {
            alert('Please login to place your order!');
            return;
        }

        // Location check: If international, route to PayPal/Card dialog checkout instead of Razorpay
        if (localeInfo.country !== 'IN') {
            setOpenPaypalDialog(true);
            return;
        }

        try {
            // Total calculate karo
            let totalAmount = 0;
            cartItems.forEach(item => {
                totalAmount += item.price.cost * (item.quantity || 1);
            });

            // Step 1: Server se Razorpay order banao
            const orderRes = await axios.post('http://localhost:8000/api/payment/create', {
                amount: totalAmount
            });

            const { orderId, amount, currency, key } = orderRes.data;

            // Step 2: Razorpay checkout popup kholo
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: 'ShopSphere',
                description: 'Order Payment',
                order_id: orderId,
                handler: async function (paymentResponse) {
                    // Step 3: Payment verify karo server pe
                    try {
                        const verifyRes = await axios.post('http://localhost:8000/api/payment/verify', {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            // Step 4: Order MongoDB me save karo
                            const productsList = cartItems.map(item => ({
                                id: item.id,
                                title: item.title,
                                price: item.price,
                                url: item.url,
                                quantity: item.quantity || 1
                            }));

                            await axios.post('http://localhost:8000/api/order/create', {
                                username: account,
                                products: productsList,
                                totalAmount: totalAmount,
                                paymentId: paymentResponse.razorpay_payment_id
                            });

                            alert('Payment Successful! Order placed!');
                            dispatch(resetCart());
                            navigate('/orders');
                        }
                    } catch (err) {
                        alert('Payment verification failed!');
                    }
                },
                prefill: {
                    name: account,
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#2874f0'
                }
            };

            // Razorpay script load check
            if (!window.Razorpay) {
                alert('Razorpay SDK not loaded. Check internet connection!');
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.log('Error during checkout', error);
            alert(error.response?.data?.message || 'Payment failed. Try again!');
        }
    }

    const handlePaypalSubmit = async () => {
        if (!cardNumber || !expiry || !cvv || !cardName) {
            alert('Please fill in all credit card details!');
            return;
        }

        setPaypalLoading(true);
        try {
            let totalAmount = 0;
            cartItems.forEach(item => {
                totalAmount += item.price.cost * (item.quantity || 1);
            });

            // Simulate server network latency
            await new Promise(resolve => setTimeout(resolve, 1500));

            const productsList = cartItems.map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                url: item.url,
                quantity: item.quantity || 1
            }));

            const paymentId = "MOCK_PAYPAL_" + Math.random().toString(36).substring(7).toUpperCase();

            // Save order in MongoDB
            await axios.post('http://localhost:8000/api/order/create', {
                username: account,
                products: productsList,
                totalAmount: totalAmount,
                paymentId: paymentId,
                gateway: 'PayPal'
            });

            alert(`International Payment Successful!\nReceipt ID: ${paymentId}\nOrder placed successfully! 🎉`);
            setOpenPaypalDialog(false);
            dispatch(resetCart());
            navigate('/orders');
        } catch (error) {
            console.log('Error during international checkout', error);
            alert('Checkout failed. Try again!');
        } finally {
            setPaypalLoading(false);
        }
    }

    // Helper to calculate total amount for the modal
    let totalInr = 0;
    cartItems.forEach(item => {
        totalInr += item.price.cost * (item.quantity || 1);
    });

    return (
        <>
        { cartItems.length ? 
            <Component container>
                <LeftComponent item lg={9} md={9} sm={12} xs={12}>
                    <Header>
                        <Typography style={{fontWeight: 600, fontSize: 18}}>My Cart ({cartItems?.length})</Typography>
                    </Header>
                        {   cartItems.map(item => (
                                <CartItem item={item} removeItemFromCart={removeItemFromCart}/>
                            ))
                        }
                    <BottomWrapper>
                        <StyledButton onClick={() => buyNow()} variant="contained">Place Order</StyledButton>
                    </BottomWrapper>
                </LeftComponent>
                <Grid item lg={3} md={3} sm={12} xs={12}>
                    <TotalView cartItems={cartItems} />
                </Grid>
            </Component> : <EmptyCart />
        }

        {/* International Payments Mock Checkout Modal */}
        <Dialog open={openPaypalDialog} onClose={() => !paypalLoading && setOpenPaypalDialog(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#2874f0', color: '#white', pb: 2 }}>
                International Checkout 🌎
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }} dividers>
                <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 2, border: '1px dashed #2874f0' }}>
                        <Typography variant="subtitle2" color="textSecondary">Country Code: {localeInfo.country}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                            Total Due: {formatPrice(totalInr + 425)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            (Includes {formatPrice(425)} International Shipping)
                        </Typography>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Credit/Debit Card Details</Typography>
                    <TextField 
                        label="Cardholder Name" 
                        size="small" 
                        fullWidth 
                        value={cardName} 
                        onChange={(e) => setCardName(e.target.value)} 
                        disabled={paypalLoading}
                    />
                    <TextField 
                        label="Card Number" 
                        size="small" 
                        fullWidth 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        disabled={paypalLoading}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField 
                            label="Expiry (MM/YY)" 
                            size="small" 
                            fullWidth 
                            value={expiry} 
                            onChange={(e) => setExpiry(e.target.value)} 
                            disabled={paypalLoading}
                        />
                        <TextField 
                            label="CVV" 
                            type="password" 
                            size="small" 
                            fullWidth 
                            value={cvv} 
                            onChange={(e) => setCvv(e.target.value)} 
                            disabled={paypalLoading}
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setOpenPaypalDialog(false)} disabled={paypalLoading} color="secondary">
                    Cancel
                </Button>
                <Button 
                    onClick={handlePaypalSubmit} 
                    variant="contained" 
                    disabled={paypalLoading}
                    style={{ backgroundColor: '#2874f0', color: '#fff', minWidth: 100 }}
                >
                    {paypalLoading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
                </Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default Cart;