import { Box, Typography, Table, TableBody, TableRow, TableCell, Button, Rating, Card, TextField, Divider, Grid, styled } from '@mui/material';
import { LocalOffer as Badge } from '@mui/icons-material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../context/dataprovider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getActiveGroupBuysAPI, joinGroupBuyAPI } from '../../service/api';

 const SmallText = styled(Box)`
    font-size: 14px;
    vertical-align: baseline;
    & > p {
        font-size: 14px;
        margin-top: 10px;
    }`;

   const StyledBadge = styled(Badge)`
    margin-right: 10px;
    color: #00CC00;
    font-size: 15px;
`;
const ColumnText = styled(TableRow)`
    font-size: 14px;
    vertical-align: baseline;
    & > td {
        font-size: 14px;
        margin-top: 10px;
    }`;

const ProductDetail = ({ product, reviews, averageRating, refetchReviews }) => {
    const { account } = useContext(DataContext);
    const navigate = useNavigate();

    const [userRating, setUserRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');

    const [translatedReviews, setTranslatedReviews] = useState({});
    const [translatingId, setTranslatingId] = useState('');
    
    const [activeGroups, setActiveGroups] = useState([]);

    const fetchActiveGroups = async () => {
        if (product && product.id) {
            const res = await getActiveGroupBuysAPI(product.id);
            if (res) setActiveGroups(res);
        }
    };

    useEffect(() => {
        fetchActiveGroups();
    }, [product.id]);

    const joinGroupBuyPayment = async (groupId) => {
        if (!account) {
            alert('Please login to join the group buy!');
            return;
        }

        try {
            const baseAmount = product.price?.cost || 0;
            const totalAmount = Math.round(baseAmount * 0.85);

            const orderRes = await axios.post('http://localhost:8000/api/payment/create', {
                amount: totalAmount
            });

            const { orderId, amount, currency, key } = orderRes.data;

            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: 'ShopSphere',
                description: 'Join Group Buy Payment',
                order_id: orderId,
                handler: async function (paymentResponse) {
                    try {
                        const verifyRes = await axios.post('http://localhost:8000/api/payment/verify', {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        });

                        if (verifyRes.data.success) {
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

                            await joinGroupBuyAPI({
                                groupId,
                                username: account,
                                orderId: orderIdFromDb
                            });

                            alert('Joined Group Buy successfully! Your order is placed.');
                            navigate(`/group-buy/${groupId}`);
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
            console.log('Error during group join checkout', error);
            alert('Failed to initialize payment');
        }
    };

    const handleTranslate = async (reviewId, commentText) => {
        if (translatedReviews[reviewId]) {
            // Toggle back to original by removing from translated list
            setTranslatedReviews(prev => {
                const copy = { ...prev };
                delete copy[reviewId];
                return copy;
            });
            return;
        }

        setTranslatingId(reviewId);
        try {
            const response = await axios.post('http://localhost:8000/api/translate', {
                text: commentText,
                targetLang: 'English'
            });
            
            if (response.data.translatedText) {
                setTranslatedReviews(prev => ({
                    ...prev,
                    [reviewId]: response.data.translatedText
                }));
            }
        } catch (error) {
            console.error("Error translating review:", error);
            alert("Failed to translate review. Please check backend connection.");
        } finally {
            setTranslatingId('');
        }
    };

    const handleReviewSubmit = async () => {
        if (!reviewTitle.trim() || !reviewComment.trim()) {
            alert("Please fill in both review title and comments.");
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/products/${product.id}/review`, {
                username: account,
                rating: userRating,
                title: reviewTitle,
                comment: reviewComment
            });

            if (response.data.success) {
                alert("Thank you! Review submitted successfully.");
                setReviewTitle('');
                setReviewComment('');
                setUserRating(5);
                refetchReviews(); // Parent component reviews list refresh karega
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        }
    };

    const subscribePriceAlert = async () => {
        if (!account) {
            alert('Please login to subscribe to price alerts!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/alerts/subscribe', {
                productId: product.id,
                username: account,
                originalPrice: product.price?.cost
            });

            if (response.data.success) {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error subscribing to price alert", error);
            alert(error.response?.data?.message || "Failed to subscribe to price alerts.");
        }
    };

    const date = new Date(new Date().getTime()+(5*24*60*60*1000));
    const fassured = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/fa_62673a.png';
    const adURL = 'https://rukminim1.flixcart.com/lockin/774/185/images/CCO__PP_2019-07-14.png?q=50';

    return (
        <>
            <Typography>
                {product.title?.longTitle}
            </Typography>

            <Typography style={{ marginTop: 5, color: '#878787', fontSize: 14 }}>
            <Box style={{ display: 'flex', alignItems: 'center', marginTop: 5, gap: '15px' }}>
                {reviews && reviews.length > 0 ? (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Rating value={averageRating} readOnly precision={0.1} size="small" />
                        <Typography style={{ fontSize: 14, fontWeight: 600, color: '#388E3C' }}>{averageRating} ★</Typography>
                        <Typography style={{ color: '#878787', fontSize: 14 }}>
                            ({reviews.length} Customer Reviews)
                        </Typography>
                    </Box>
                ) : (
                    <Typography style={{ color: '#878787', fontSize: 14 }}>
                        No ratings yet
                    </Typography>
                )}
                <img
                    src={fassured}
                    style={{ width: 77 }}
                    alt="flipkart assured"
                />
            </Box>
            </Typography>

            <Typography>
                <span style={{ fontSize: 28 }}>
                    ₹{product.price?.cost}
                </span>

                &nbsp;&nbsp;&nbsp;

                <span style={{ color: '#878787' }}>
                    <strike>₹{product.price?.mrp}</strike>
                </span>

                &nbsp;&nbsp;&nbsp;

                <span style={{ color: '#388E3C' }}>
                    {product.price?.discount} off
                </span>
            </Typography>

            <Typography style={{ marginTop: 10 }}>
                Availability: &nbsp;
                <span style={{ 
                    fontWeight: 600, 
                    color: product.quantity === 0 ? '#ff6161' : product.quantity <= 3 ? '#ff9f00' : '#388E3C' 
                }}>
                    {product.quantity === 0 ? 'Out of Stock' : product.quantity <= 3 ? `Only ${product.quantity} left! Hurry up!` : 'In Stock'}
                </span>
            </Typography>

            <Box mt={1.5} mb={2}>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={subscribePriceAlert}
                    style={{ 
                        textTransform: 'none', 
                        borderColor: '#2874f0', 
                        color: '#2874f0',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        padding: '4px 12px'
                    }}
                >
                    🔔 Notify on Price Drop
                </Button>
            </Box>

            {activeGroups.length > 0 && (
                <Box style={{ background: '#f5f7fa', padding: '15px', border: '1px dashed #2874f0', borderRadius: '4px', margin: '15px 0' }}>
                    <Typography style={{ fontWeight: 600, color: '#2874f0', marginBottom: '10px', fontSize: '15px' }}>
                        👥 Active Group Buys (Join to get 15% off instantly!)
                    </Typography>
                    {activeGroups.map(group => (
                        <Box key={group._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '8px' }}>
                            <Box>
                                <Typography style={{ fontSize: '13px', fontWeight: 600 }}>
                                    Started by: {group.creator}
                                </Typography>
                                <Typography style={{ fontSize: '12px', color: '#878787' }}>
                                    Progress: {group.members.length} / {group.targetMembers} joined
                                </Typography>
                            </Box>
                            <Button 
                                variant="contained" 
                                size="small" 
                                style={{ background: '#24c35e', color: '#fff', textTransform: 'none', fontWeight: 600 }}
                                onClick={() => joinGroupBuyPayment(group._id)}
                            >
                                Join Group (₹{Math.round(product.price?.cost * 0.85)})
                            </Button>
                        </Box>
                    ))}
                </Box>
            )}

            <Typography style={{ marginTop: 15 }}>Available offers</Typography>

            <SmallText>
                <Typography>
                    <StyledBadge /> Bank Offer 5% Unlimited Cashback on Flipkart Axis Bank Credit Card
                </Typography>

                <Typography>
                    <StyledBadge /> Bank Offer 10% Off on Bank of Baroda Mastercard debit card first time transaction
                </Typography>

                <Typography>
                    <StyledBadge /> Purchase this Furniture or Appliance and Get Extra ₹500 Off on Select ACs
                </Typography>

                <Typography>
                    <StyledBadge /> Partner Offer Extra 10% off upto ₹500 on next furniture purchase
                </Typography>
            </SmallText>

             <Table>
                <TableBody>
                    <ColumnText>
                        <TableCell style={{ color: '#878787' }}>Delivery</TableCell>
                        <TableCell style={{ fontWeight: 600 }}>Delivery by {date.toDateString()} | ₹40</TableCell>
                    </ColumnText>
                    <ColumnText>
                        <TableCell style={{ color: '#878787' }}>Warranty</TableCell>
                        <TableCell>No Warranty</TableCell>
                    </ColumnText>
                    <ColumnText>
                        <TableCell style={{ color: '#878787' }}>Seller</TableCell>
                        <TableCell>
                            <span style={{ color: '#2874f0' }}>SuperComNet</span>
                            <Typography>GST invoice available</Typography>
                            <Typography>View more sellers starting from ₹329</Typography>
                        </TableCell>
                    </ColumnText>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <img src={adURL} style={{ width: 390 }} />
                        </TableCell>
                    </TableRow>
                    <ColumnText>
                        <TableCell style={{ color: '#878787' }}>Description</TableCell>
                        <TableCell>{product.description}</TableCell>
                    </ColumnText>
                </TableBody>
            </Table>

            <Divider sx={{ marginY: 4 }} />

            {/* Ratings & Reviews Dynamic System */}
            <Box pb={4}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Customer Ratings & Reviews
                </Typography>

                {/* A. WRITE A REVIEW SECTION */}
                {account ? (
                    <Card sx={{ padding: '20px', marginBottom: 4, border: '1px solid #e0e0e0', boxShadow: 'none', backgroundColor: '#fafbfc' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Share your feedback for this product
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Typography variant="body2" color="textSecondary">Select Rating Stars:</Typography>
                            <Rating 
                                name="user-stars" 
                                value={userRating} 
                                onChange={(event, newValue) => setUserRating(newValue)} 
                            />
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Review Headline/Title" 
                                    placeholder="e.g. Value for Money, Highly Recommended"
                                    fullWidth 
                                    size="small"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    label="Write details comments..." 
                                    placeholder="Tell others what you liked or disliked about this product"
                                    fullWidth 
                                    multiline 
                                    rows={3} 
                                    size="small"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleReviewSubmit}
                                    style={{ backgroundColor: '#fb641b', color: '#fff', textTransform: 'none', fontWeight: 600 }}
                                >
                                    Submit Review
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                ) : (
                    <Card sx={{ padding: '15px', marginBottom: 4, border: '1px dashed #cccccc', boxShadow: 'none', textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            Please sign in to write a review and rate this product.
                        </Typography>
                    </Card>
                )}

                {/* B. LIST OF CUSTOMER REVIEWS */}
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Verified Customer Reviews ({reviews?.length || 0})
                    </Typography>
                    
                    {reviews && reviews.length > 0 ? (
                        reviews.map((rev) => (
                            <Box key={rev._id} sx={{ borderBottom: '1px solid #f0f0f0', py: 2 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                    <Box sx={{ 
                                        backgroundColor: rev.rating >= 4 ? '#388e3c' : rev.rating >= 3 ? '#ff9f00' : '#d32f2f',
                                        color: '#fff', 
                                        px: 1.2, 
                                        py: 0.3, 
                                        borderRadius: '3px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                    }}>
                                        {rev.rating} ★
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13.5px' }}>
                                        {rev.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: '13px', lineHeight: 1.5 }}>
                                    {rev.comment}
                                </Typography>

                                {translatedReviews[rev._id] && (
                                    <Box sx={{ 
                                        backgroundColor: '#eaf4ff', 
                                        padding: '10px 15px', 
                                        borderRadius: '4px', 
                                        borderLeft: '4px solid #2874f0', 
                                        mb: 1.5,
                                        mt: 1
                                    }}>
                                        <Typography style={{ fontSize: '12px', fontStyle: 'italic', color: '#1a3b68', fontWeight: 600 }}>
                                            Translated (English):
                                        </Typography>
                                        <Typography style={{ fontSize: '13px', color: '#212121', marginTop: '4px' }}>
                                            "{translatedReviews[rev._id]}"
                                        </Typography>
                                    </Box>
                                )}

                                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '11px' }}>
                                        By <strong>{rev.username}</strong> on {new Date(rev.date).toLocaleDateString()}
                                    </Typography>
                                    
                                    <Button 
                                        size="small" 
                                        onClick={() => handleTranslate(rev._id, rev.comment)}
                                        disabled={translatingId === rev._id}
                                        startIcon={<TranslateIcon style={{ fontSize: '12px' }} />}
                                        sx={{ 
                                            textTransform: 'none', 
                                            fontSize: '11px', 
                                            padding: '0 5px',
                                            color: '#2874f0',
                                            minWidth: 'unset',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        {translatingId === rev._id ? "Translating..." : (translatedReviews[rev._id] ? "Show Original" : "Translate to English")}
                                    </Button>
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                            No customer reviews have been written for this product yet.
                        </Typography>
                    )}
                </Box>
            </Box>
        </>
    );
};

export default ProductDetail;