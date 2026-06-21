import { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, Grid, styled } from '@mui/material';
import { getWishlistAPI, toggleWishlistAPI } from '../../service/api';
import { DataContext } from '../../context/dataprovider';
import { Link } from 'react-router-dom';

const Component = styled(Box)(({ theme }) => ({
    width: '80%',
    margin: '80px auto',
    background: '#fff',
    minHeight: '50vh',
    [theme.breakpoints.down('md')]: {
        width: '95%',
        margin: '64px auto'
    }
}));

const Header = styled(Box)`
    padding: 15px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
`;

const BottomContainer = styled(Box)`
    padding: 16px 22px;
    background: #fff;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 10%);
    border-top: 1px solid #f0f0f0;
`;

const ProductItem = styled(Grid)`
    padding: 25px 15px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
`;

const Image = styled('img')(({ theme }) => ({
    width: 150,
    objectFit: 'contain',
    [theme.breakpoints.down('sm')]: {
        width: '100%'
    }
}));

const RemoveButton = styled(Button)`
    margin-top: 20px;
    font-size: 16px;
    color: #2874f0;
    font-weight: 600;
`;

const EmptyWishlist = styled(Box)`
    text-align: center;
    padding: 50px;
    & > p {
        font-size: 18px;
        margin-top: 20px;
    }
`;

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const { account } = useContext(DataContext);

    const fetchWishlist = async () => {
        if (!account) return;
        // Assume account contains username or we need userId. The backend uses userId. 
        // For simplicity, we are passing account string, ensure backend finds user by username or we pass userId.
        const res = await getWishlistAPI(account);
        if (res) {
            setWishlistItems(res);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [account]);

    const removeItem = async (productId) => {
        await toggleWishlistAPI({ userId: account, productId });
        fetchWishlist(); // refresh
    };

    return (
        <Component>
            <Header>
                <Typography style={{ fontWeight: 600, fontSize: 18 }}>My Wishlist ({wishlistItems.length})</Typography>
            </Header>

            {wishlistItems.length === 0 ? (
                <EmptyWishlist>
                    <Typography>Empty Wishlist</Typography>
                    <Typography style={{fontSize: 14, color: '#878787'}}>You have no items in your wishlist. Start adding!</Typography>
                </EmptyWishlist>
            ) : (
                wishlistItems.map(product => (
                    <ProductItem container key={product.id}>
                        <Grid item lg={2} md={2} sm={3} xs={4}>
                            <Link to={`/product/${product.id}`}>
                                <Image src={product.url} alt="product" />
                            </Link>
                        </Grid>
                        <Grid item lg={8} md={8} sm={7} xs={8} style={{ paddingLeft: 20 }}>
                            <Typography style={{fontWeight: 600, fontSize: 18}}>{product.title.longTitle}</Typography>
                            <Typography style={{marginTop: 5, color: '#878787', fontSize: 14}}>
                                {product.price.mrp}
                            </Typography>
                            <Typography style={{fontSize: 20, fontWeight: 600}}>
                                ₹{product.price.cost}
                            </Typography>
                            <RemoveButton onClick={() => removeItem(product.id)}>REMOVE FROM WISHLIST</RemoveButton>
                        </Grid>
                    </ProductItem>
                ))
            )}
        </Component>
    )
}

export default Wishlist;
