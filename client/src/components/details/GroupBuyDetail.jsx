import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, styled, Card, CardContent, LinearProgress, Divider, Avatar } from '@mui/material';
import { DataContext } from '../../context/dataprovider';
import { getGroupBuyAPI, joinGroupBuyAPI } from '../../service/api';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

const Container = styled(Box)`
    width: 60%;
    margin: 80px auto;
    background: #fff;
    padding: 30px;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.1);
    border-radius: 4px;
    @media (max-width: 960px) {
        width: 95%;
        padding: 15px;
    }
`;

const ProductSection = styled(Box)`
    display: flex;
    gap: 20px;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 25px;
    border: 1px solid #f0f0f0;
    @media (max-width: 600px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const ProductImage = styled('img')({
    width: 120,
    height: 120,
    objectFit: 'contain',
    background: '#fff',
    padding: 5,
    border: '1px solid #f0f0f0',
    borderRadius: 4
});

const ProgressBarContainer = styled(Box)`
    margin: 25px 0;
    background: #f5f7fa;
    padding: 20px;
    border-radius: 4px;
    border: 1px dashed #2874f0;
`;

const MemberRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 12px 10px;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
        border-bottom: none;
    }
`;

const GroupBuyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { account, formatPrice, localeInfo } = useContext(DataContext);
    const [groupData, setGroupData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchGroupDetails = async () => {
        setLoading(true);
        const res = await getGroupBuyAPI(id);
        if (res) {
            setGroupData(res.group);
            setProductData(res.product);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchGroupDetails();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Invitation link copied to clipboard! Share it with your friends.');
    };

    const joinGroupBuyPayment = async () => {
        if (!account) {
            alert('Please login to join the group buy!');
            return;
        }

        if (localeInfo.country !== 'IN') {
            alert('Group Buying is currently only available for domestic orders (INR). For international shipping, please purchase the product individually.');
            return;
        }

        try {
            const baseAmount = productData.price?.cost || 0;
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
                                id: productData.id,
                                title: productData.title,
                                price: {
                                    ...productData.price,
                                    cost: totalAmount
                                },
                                url: productData.url,
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
                                groupId: id,
                                username: account,
                                orderId: orderIdFromDb
                            });

                            alert('Joined Group Buy successfully! Your order is placed.');
                            fetchGroupDetails(); // Reload progress
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

    if (loading) {
        return (
            <Container style={{ textAlign: 'center', padding: '50px 0' }}>
                <Typography>Loading Group Buy details...</Typography>
            </Container>
        );
    }

    if (!groupData || !productData) {
        return (
            <Container style={{ textAlign: 'center', padding: '50px 0' }}>
                <Typography color="error">Group Buy Team not found or expired.</Typography>
                <Button component={Link} to="/" variant="contained" style={{ marginTop: 20, background: '#2874f0' }}>Go Home</Button>
            </Container>
        );
    }

    const joinedCount = groupData.members.length;
    const targetCount = groupData.targetMembers;
    const progress = (joinedCount / targetCount) * 100;
    const isMember = groupData.members.some(m => m.username === account);
    const spotsLeft = targetCount - joinedCount;

    return (
        <Container>
            <Typography variant="h5" style={{ fontWeight: 600, color: '#212121', marginBottom: 20, textAlign: 'center' }}>
                👥 Group Buy Invitation 👥
            </Typography>

            <ProductSection>
                <Link to={`/product/${productData.id}`}>
                    <ProductImage src={productData.url} alt="product" />
                </Link>
                <Box>
                    <Typography style={{ fontWeight: 600, fontSize: 16 }}>{productData.title?.longTitle}</Typography>
                    <Typography style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>{formatPrice(Math.round(productData.price?.cost * 0.85))}</span>
                        <span style={{ color: '#878787', textDecoration: 'line-through', marginLeft: 10 }}>{formatPrice(productData.price?.cost)}</span>
                        <span style={{ color: '#388e3c', fontWeight: 600, marginLeft: 10 }}>(15% Group Buy Discount!)</span>
                    </Typography>
                </Box>
            </ProductSection>

            <ProgressBarContainer>
                <Typography style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <InfoIcon color="primary" /> 
                    {groupData.status === 'completed' ? 'Group Buy Complete! 🎉' : `Group Progress: ${joinedCount} of ${targetCount} joined`}
                </Typography>
                
                <LinearProgress variant="determinate" value={progress} style={{ height: 10, borderRadius: 5, marginBottom: 15 }} />
                
                {groupData.status === 'active' && (
                    <Typography style={{ fontSize: 14, color: '#4a4a4a' }}>
                        {spotsLeft} more spot{spotsLeft > 1 ? 's' : ''} left! Share the link or join now to get the group discount.
                    </Typography>
                )}
                {groupData.status === 'completed' && (
                    <Typography style={{ fontSize: 14, color: '#388e3c', fontWeight: 600 }}>
                        All spots filled! Everyone gets the 15% discount and orders are being processed.
                    </Typography>
                )}
            </ProgressBarContainer>

            <Typography variant="h6" style={{ fontWeight: 600, marginBottom: 15 }}>Group Members</Typography>
            <Card variant="outlined" style={{ marginBottom: 30 }}>
                {groupData.members.map((member, index) => (
                    <React.Fragment key={member.username}>
                        <MemberRow>
                            <Avatar style={{ background: '#2874f0', width: 32, height: 32, fontSize: 14 }}>
                                {member.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Typography style={{ fontWeight: 600, fontSize: 14 }}>
                                    {member.username} {index === 0 && <span style={{ color: '#878787', fontSize: 11 }}>(Creator)</span>}
                                </Typography>
                                <Typography style={{ fontSize: 11, color: '#878787' }}>
                                    Joined on {new Date(member.joinedAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <CheckCircleIcon color="success" fontSize="small" />
                        </MemberRow>
                        {index < groupData.members.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Card>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {groupData.status === 'active' && !isMember && (
                    <Button 
                        variant="contained" 
                        color="success" 
                        fullWidth 
                        style={{ background: '#24c35e', color: '#fff', textTransform: 'none', height: 48, fontWeight: 'bold' }}
                        onClick={joinGroupBuyPayment}
                    >
                        Join this Group & Pay {formatPrice(Math.round(productData.price?.cost * 0.85))}
                    </Button>
                )}
                
                {isMember && groupData.status === 'active' && (
                    <Box style={{ textStyle: 'center', background: '#e8f0fe', padding: 12, borderRadius: 4, textAlign: 'center', color: '#1a73e8', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
                        You have joined this group! Invite friends to complete it.
                    </Box>
                )}

                <Button 
                    variant="outlined" 
                    startIcon={<ShareIcon />} 
                    fullWidth 
                    style={{ borderColor: '#2874f0', color: '#2874f0', textTransform: 'none', height: 48 }}
                    onClick={handleShare}
                >
                    Copy & Share Invitation Link
                </Button>
                
                <Button 
                    component={Link} 
                    to="/" 
                    variant="text" 
                    fullWidth 
                    style={{ textTransform: 'none', color: '#878787' }}
                >
                    Back to Store
                </Button>
            </Box>
        </Container>
    );
};

export default GroupBuyDetail;
