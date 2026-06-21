import { useEffect, useContext } from 'react';

import { Box, Typography, Button, Grid, styled } from '@mui/material';
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
    const { account } = useContext(DataContext);
    const navigate = useNavigate();

    const dispatch = useDispatch();
    


    const removeItemFromCart = (id) => {
        dispatch(removeFromCart(id));
    }

    const buyNow = async () => {
        if (!account) {
            alert('Please login to place your order!');
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
                name: 'Flipcart',
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
        </>

    )
}

export default Cart;