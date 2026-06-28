import { useState, useEffect, useContext } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { DataContext } from '../../context/dataprovider';

const Header = styled(Box)`
    padding: 15px 24px;
    background: #fff;
    borderBottom: 1px solid #f0f0f0;
`;

const Heading = styled(Typography)`
    color: #878787;
`;

const Container = styled(Box)`
    padding: 15px 24px;
    background: #fff;
    & > p {
        margin-bottom: 20px;
        font-size: 14px;
    }
`;

const Price = styled(Typography)`
    float: right;
`;

const TotalAmount = styled(Typography)`
    font-size: 18px;
    font-weight: 600;
    border-top: 1px dashed #e0e0e0;
    padding: 20px 0;
    border-bottom: 1px dashed #e0e0e0;
`;

const Discount = styled(Typography)`
    font-size: 16px; 
    color: green;
`

const TotalView = ({ cartItems }) => {
    const [price, setPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const { formatPrice, localeInfo } = useContext(DataContext);

    useEffect(() => {
        totalAmount();
    }, [cartItems]);
    
    const totalAmount = () => {
        let price = 0, discount = 0;
        cartItems.map(item => {
            price += item.price.mrp
            discount += (item.price.mrp - item.price.cost) 
        })
        setPrice(price);
        setDiscount(discount);
    }

    const deliveryChargeINR = localeInfo.country === 'IN' ? 40 : 425;
    const totalINR = price - discount + deliveryChargeINR;

    return (
        <Box>
            <Header>
                <Heading>PRICE DETAILS</Heading>
            </Header>
            <Container>
                <Typography>Price ({cartItems?.length} item)
                    <Price component="span">{formatPrice(price)}</Price>
                </Typography>
                <Typography>Discount
                    <Price component="span">-{formatPrice(discount)}</Price>
                </Typography>
                <Typography>Delivery Charges
                    <Price component="span">{formatPrice(deliveryChargeINR)}</Price>
                </Typography>
                <TotalAmount>Total Amount
                    <Price>{formatPrice(totalINR)}</Price>
                </TotalAmount>
                <Discount>You will save {formatPrice(discount - deliveryChargeINR)} on this order</Discount>
            </Container>
        </Box>
    )
}

export default TotalView;