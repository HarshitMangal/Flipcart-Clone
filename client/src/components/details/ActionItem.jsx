import { Button, Box, styled, IconButton } from '@mui/material';
import { ShoppingCart as Cart, FlashOn as Flash, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cartActions';
import { useState, useContext } from 'react';
import { DataContext } from '../../context/dataprovider';
import { toggleWishlistAPI, createGroupBuyAPI, joinGroupBuyAPI } from '../../service/api';
import axios from 'axios';

const LeftContainer = styled(Box)(({ theme }) => ({
    padding: '40px 0 0 0',
    [theme.breakpoints.down('md')]: {
        padding: '20px 0'
    }
}))

const ImageWrapper = styled(Box)`
    padding: 15px 20px;
    border: 1px solid #f0f0f0;
    width: 95%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #FFFFFF;
`;

const Image = styled('img')({
    width: 'auto',
    height: '320px',
    maxWidth: '90%',
    objectFit: 'contain',
    padding: '15px'
});

const WishlistButton = styled(IconButton)`
    position: absolute;
    top: 15px;
    right: 15px;
    background: #FFFFFF;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.15);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    z-index: 5;
    &:hover {
        background: #FFFFFF;
    }
`;

const ButtonWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '8px',
    padding: '10px 0',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column'
    }
}));


const ActionItem=({ product})=>{
     console.log("Full product object:", product);      // product ka pura data
     console.log("id field:", product.id);    
     const navigate = useNavigate();
     const dispatch = useDispatch();
     const [quantity, setQuantity] = useState(1);
     const { id } = product;
     const { account, localeInfo } = useContext(DataContext);

     const addItemToCart = () => {
         dispatch(addToCart(id, quantity));
         navigate('/cart');
     }

     const buyNow = async (isGroupBuy = false, groupId = null) => {
         if (!account) {
             alert('Please login to buy items!');
             return;
         }

         // International redirect to cart for checkout routing
         if (localeInfo.country !== 'IN') {
             dispatch(addToCart(id, 1));
             navigate('/cart');
             return;
         }

         try {
             const baseAmount = product.price?.cost || 0;
             const totalAmount = isGroupBuy ? Math.round(baseAmount * 0.85) : baseAmount;

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
                 description: isGroupBuy ? 'Group Buy Payment' : 'Direct Order Payment',
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
                             const productsList = [{
                                 id: product.id,
                                 title: product.title,
                                 price: {
                                     ...product.price,
                                     cost: totalAmount
                                 },
                                 url: product.url,
                                 quantity: 1
                             }];

                             const orderCreateRes = await axios.post('http://localhost:8000/api/order/create', {
                                 username: account,
                                 products: productsList,
                                 totalAmount: totalAmount,
                                 paymentId: paymentResponse.razorpay_payment_id
                             });

                             const orderIdFromDb = orderCreateRes.data.order._id;

                             if (isGroupBuy) {
                                 if (groupId) {
                                     await joinGroupBuyAPI({
                                         groupId,
                                         username: account,
                                         orderId: orderIdFromDb
                                     });
                                     alert('Joined Group Buy successfully!');
                                     navigate(`/group-buy/${groupId}`);
                                 } else {
                                     const createRes = await createGroupBuyAPI({
                                         productId: product.id,
                                         username: account,
                                         orderId: orderIdFromDb
                                     });
                                     alert('Group Buy started successfully! Share this link with your friends to get 15% discount!');
                                     navigate(`/group-buy/${createRes.group._id}`);
                                 }
                             } else {
                                 alert('Payment Successful! Order placed!');
                                 navigate('/orders');
                             }
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

             if (!window.Razorpay) {
                 alert('Razorpay SDK failed to load. Are you offline?');
                 return;
             }

             const rzp = new window.Razorpay(options);
             rzp.open();

         } catch (error) {
             console.log('Error during direct checkout', error);
             alert(error.response?.data?.message || 'Failed to initialize payment');
         }
     }

     const toggleWishlist = async () => {
         if (!account) {
             alert('Please login to add to wishlist');
             return;
         }
         await toggleWishlistAPI({ userId: account, productId: product.id });
         alert('Wishlist updated!');
     }

     return (
          <LeftContainer>
             <ImageWrapper>
                 <WishlistButton onClick={toggleWishlist} aria-label="add to wishlist">
                     <FavoriteIcon style={{ color: '#ff4343' }} />
                 </WishlistButton>
                 <Image src={product.detailUrl} />
             </ImageWrapper>
             <ButtonWrapper>
                 <Button 
                     onClick={() => addItemToCart()} 
                     style={{ background: product.quantity === 0 ? '#cccccc' : '#ff9f00', color: '#fff', fontSize: '13px', flex: 1, height: '48px', textTransform: 'none', borderRadius: '2px' }} 
                     variant="contained"
                     disabled={product.quantity === 0}
                 >
                     <Cart style={{ marginRight: 5 }} />{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                 </Button>
                 <Button 
                     onClick={() => buyNow(false)}  
                     style={{ background: product.quantity === 0 ? '#cccccc' : '#fb641b', color: '#fff', fontSize: '13px', flex: 1, height: '48px', textTransform: 'none', borderRadius: '2px' }} 
                     variant="contained"
                     disabled={product.quantity === 0}
                 >
                     <Flash style={{ marginRight: 5 }} /> Buy Now
                 </Button>
                 <Button 
                     onClick={() => buyNow(true)}  
                     style={{ background: product.quantity === 0 ? '#cccccc' : '#2874f0', color: '#fff', fontSize: '11px', flex: 1.2, height: '48px', textTransform: 'none', borderRadius: '2px', fontWeight: 'bold' }} 
                     variant="contained"
                     disabled={product.quantity === 0}
                 >
                     Start Group Buy (-15%)
                 </Button>
             </ButtonWrapper>
         </LeftContainer>
     )
}

export default ActionItem;