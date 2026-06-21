
import { Card, Box, Typography, Button, styled } from '@mui/material';

import { addEllipsis } from '../../utils/util';
import GroupButton from './GroupButton';

const Component = styled(Card)(({ theme }) => ({
    borderTop: '1px solid #f0f0f0',
    borderRadius: '0px',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
    }
}));

const LeftComponent = styled(Box)(({ theme }) => ({
    margin: '20px', 
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
        margin: '10px 0',
        alignItems: 'center'
    }
}));

const SmallText = styled(Typography)`
    color: #878787;
    font-size: 14px;
    margin-top: 10px;
`;

const Cost = styled(Typography)`
    font-size: 18px;
    font-weight: 600;
`;

const MRP = styled(Typography)`
    color: #878787;
`;

const Discount = styled(Typography)`
    color: #388E3C;
`;

const Remove = styled(Button)`
    margin-top: 20px;
    font-size: 16px;
    font-weight: 600;
    color: #212121;
    &:hover {
        color: #2874f0;
    }
`;

const CartItem = ({ item, removeItemFromCart }) => {
    const fassured = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/fa_62673a.png';

    return (
        <Component>
            <LeftComponent>
                <img src={item.url} style={{ height: 110, width: 110 }} />
                <GroupButton item={item} />
            </LeftComponent>
            <Box style={{ margin: 20 }}>
                <Typography>{addEllipsis(item.title.longTitle)}</Typography>
                <SmallText>Seller:RetailNet
                    <span><img src={fassured} style={{ width: 50, marginLeft: 10 }} /></span>
                </SmallText>
                <Typography style={{margin: '20px 0'}}>
                    <Cost component="span">₹{item.price.cost}</Cost>&nbsp;&nbsp;&nbsp;
                    <MRP component="span"><strike>₹{item.price.mrp}</strike></MRP>&nbsp;&nbsp;&nbsp;
                    <Discount component="span">{item.price.discount} off</Discount>
                </Typography>
                <Remove onClick={() => removeItemFromCart(item.id)}>REMOVE</Remove>
            </Box>
        </Component>
    )
}

export default CartItem;