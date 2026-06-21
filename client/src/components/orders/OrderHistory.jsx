import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Card, CardContent, Grid, Divider, Stepper, Step, StepLabel, Button, CircularProgress, Paper, styled } from '@mui/material';
import { DataContext } from '../../context/dataprovider';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DownloadIcon from '@mui/icons-material/Download';

// Styled Components for Modern Aesthetics
const Container = styled(Box)(({ theme }) => ({
    padding: '30px 8%',
    backgroundColor: '#f1f3f6',
    minHeight: '90vh',
    [theme.breakpoints.down('md')]: {
        padding: '15px 10px'
    }
}));

const HeaderTitle = styled(Typography)`
    font-size: 22px;
    fontWeight: 600;
    margin-bottom: 20px;
    color: #212121;
`;

const OrderCard = styled(Card)`
    margin-bottom: 20px;
    border-radius: 8px;
    border: 1px solid #dbdbdb;
    box-shadow: none;
    overflow: visible;
`;

const ProductImage = styled('img')({
    width: 80,
    height: 80,
    objectFit: 'contain'
});

const StatusBadge = styled(Box)(({ status }) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: 
        status === 'Delivered' ? '#388E3C' : 
        status === 'Out for Delivery' ? '#ff9f00' :
        status === 'Shipped' ? '#2874f0' : '#fb641b',
    textTransform: 'uppercase',
    marginTop: '5px'
}));

const EmptyContainer = styled(Paper)`
    padding: 50px;
    text-align: center;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: none;
    border: 1px solid #dbdbdb;
`;

const ActionWrapper = styled(Grid)(({ theme }) => ({
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
        textAlign: 'left',
        marginTop: '15px'
    }
}));



const OrderHistory = () => {
    const { account } = useContext(DataContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const downloadInvoice = (order) => {
        const printWindow = window.open('', '_blank');
        
        const itemRows = order.products.map(item => `
            <tr>
                <td>${item.title?.longTitle || item.title?.shortTitle}</td>
                <td>₹${item.price?.cost}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${(item.price?.cost || 0) * (item.quantity || 1)}</td>
            </tr>
        `).join('');

        const invoiceHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Invoice - Order #${order._id}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #333;
                        margin: 0;
                        padding: 30px;
                        line-height: 1.6;
                    }
                    .invoice-box {
                        max-width: 800px;
                        margin: auto;
                        padding: 30px;
                        border: 1px solid #eee;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                        border-radius: 8px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 3px solid #2874f0;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2874f0;
                        letter-spacing: 0.5px;
                    }
                    .logo span {
                        color: #ffe500;
                        font-style: italic;
                    }
                    .title {
                        font-size: 22px;
                        font-weight: bold;
                        text-align: right;
                        color: #555;
                    }
                    .details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .details-col {
                        width: 48%;
                    }
                    .details-col strong {
                        font-size: 14px;
                        text-transform: uppercase;
                        color: #878787;
                        display: block;
                        margin-bottom: 5px;
                    }
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        margin-bottom: 30px;
                    }
                    .invoice-table th, .invoice-table td {
                        border: 1px solid #e0e0e0;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                    }
                    .invoice-table th {
                        background-color: #f7f9fc;
                        font-weight: 600;
                        color: #333;
                    }
                    .invoice-table td {
                        color: #555;
                    }
                    .total-box {
                        text-align: right;
                        margin-top: 20px;
                        font-size: 16px;
                    }
                    .total-box table {
                        width: 250px;
                        margin-left: auto;
                        border-collapse: collapse;
                    }
                    .total-box td {
                        padding: 6px 12px;
                    }
                    .total-box tr.grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        color: #2874f0;
                        border-top: 2px solid #2874f0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 50px;
                        font-size: 12px;
                        color: #878787;
                        border-top: 1px solid #e0e0e0;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="logo">Flipkart<span>Plus</span></div>
                        <div class="title">TAX INVOICE</div>
                    </div>
                    
                    <div class="details">
                        <div class="details-col">
                            <strong>Sold By:</strong>
                            Flipkart Clone Retail Private Limited<br>
                            Tech Park, Outer Ring Road<br>
                            Bangalore, Karnataka, 560103
                        </div>
                        <div class="details-col" style="text-align: right;">
                            <strong>Order Details:</strong>
                            Order ID: #${order._id}<br>
                            Date: ${new Date(order.orderDate).toLocaleString()}<br>
                            Customer: ${order.username}<br>
                            Status: ${order.orderStatus}
                        </div>
                    </div>

                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Product Item</th>
                                <th style="width: 100px;">Price</th>
                                <th style="width: 80px;">Qty</th>
                                <th style="width: 120px;">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>

                    <div class="total-box">
                        <table>
                            <tr>
                                <td>Subtotal:</td>
                                <td>₹${order.totalAmount}</td>
                            </tr>
                            <tr>
                                <td>Shipping:</td>
                                <td style="color: green;">FREE</td>
                            </tr>
                            <tr class="grand-total">
                                <td>Grand Total:</td>
                                <td>₹${order.totalAmount}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="footer">
                        Thank you for shopping with us! This is a system-generated electronic invoice.<br>
                        For any support, please contact support@flipkartclone.com
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    const orderStatuses = ['Ordered', 'Shipped', 'Out for Delivery', 'Delivered'];

    useEffect(() => {
        const fetchOrders = async () => {
            if (!account) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/orders/${account}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching order history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [account]);

    const getActiveStep = (status) => {
        return orderStatuses.indexOf(status);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!account) {
        return (
            <Container>
                <EmptyContainer>
                    <Typography variant="h5" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Please sign in to view your orders.
                    </Typography>
                    <Button variant="contained" color="primary" component={Link} to="/">
                        Go to Home
                    </Button>
                </EmptyContainer>
            </Container>
        );
    }

    return (
        <Container>
            <HeaderTitle variant="h5">
                My Orders ({orders.length})
            </HeaderTitle>
            
            {orders.length === 0 ? (
                <EmptyContainer>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                        You haven't placed any orders yet!
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Check out our amazing products and place your first order.
                    </Typography>
                    <Button 
                        variant="contained" 
                        style={{ backgroundColor: '#2874f0', color: '#fff', textTransform: 'none' }} 
                        onClick={() => navigate('/')}
                    >
                        Shop Now
                    </Button>
                </EmptyContainer>
            ) : (
                orders.map((order) => (
                    <OrderCard key={order._id}>
                        <CardContent>
                            <Grid container spacing={3} alignItems="center">
                                {/* Product detail */}
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <Typography variant="caption" color="textSecondary">
                                            Order ID: #{order._id} | Placed on: {new Date(order.orderDate).toLocaleDateString()}
                                        </Typography>
                                        
                                        {order.products.map((item, index) => (
                                            <Box key={index} display="flex" gap={2} alignItems="center">
                                                <ProductImage src={item.url} alt={item.title?.shortTitle} />
                                                <Box>
                                                    <Typography style={{ fontSize: '14px', fontWeight: 600 }}>
                                                        {item.title?.longTitle}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Qty: {item.quantity || 1} | Price: ₹{item.price?.cost}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>

                                {/* Delivery tracking stepper */}
                                <Grid item xs={12} md={4}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Delivery Status
                                        </Typography>
                                        <StatusBadge status={order.orderStatus}>
                                            {order.orderStatus}
                                        </StatusBadge>
                                        
                                        <Box mt={3}>
                                            <Stepper activeStep={getActiveStep(order.orderStatus)} alternativeLabel size="small">
                                                {orderStatuses.map((label) => (
                                                    <Step key={label}>
                                                        <StepLabel 
                                                            StepIconProps={{
                                                                sx: {
                                                                    '&.Mui-active': { color: '#2874f0' },
                                                                    '&.Mui-completed': { color: '#388E3C' }
                                                                }
                                                            }}
                                                        >
                                                            {label}
                                                        </StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Order summary total */}
                                <ActionWrapper item xs={12} md={2}>
                                    <Box display="flex" flexDirection="column">
                                        <Typography variant="caption" color="textSecondary">
                                            Total Amount
                                        </Typography>
                                        <Typography style={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginTop: '5px' }}>
                                            ₹{order.totalAmount}
                                        </Typography>
                                        <Typography variant="caption" color="green" sx={{ fontWeight: 600, mt: 1 }}>
                                            Simulated Cash on Delivery
                                        </Typography>
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<DownloadIcon />} 
                                            size="small"
                                            onClick={() => downloadInvoice(order)}
                                            sx={{ 
                                                textTransform: 'none', 
                                                fontSize: '11px', 
                                                mt: 2, 
                                                borderColor: '#2874f0', 
                                                color: '#2874f0',
                                                '&:hover': {
                                                    backgroundColor: '#f1f3f6'
                                                }
                                            }}
                                        >
                                            Download Invoice
                                        </Button>
                                    </Box>
                                </ActionWrapper>
                            </Grid>
                        </CardContent>
                    </OrderCard>
                ))
            )}
        </Container>
    );
};

export default OrderHistory;
