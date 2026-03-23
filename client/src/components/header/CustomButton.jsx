import React, { useState, useContext } from 'react';
import { Box, Typography, Badge, Button, styled } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { DataContext } from '../../context/dataprovider';
import { useSelector } from 'react-redux';

import Profile from './profile';
import LoginDialog from '../login/logindialog';

const Container = styled(Link)(({ theme }) => ({
    display: 'flex',
    textDecoration: 'none',
    color: '#fff',
    alignItems: 'center',
    gap: '8px'
}));

const Wrapper = styled(Box)(({ theme }) => ({
    margin: '0 3% 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    [theme.breakpoints.down('sm')]: {
        gap: '20px'
    }
}));

const LoginButton = styled(Button)`
  color: #2874f0;
  background: #fff;
  text-transform: none;
  font-weight: 600;
  border-radius: 2px;
  padding: 5px 25px;
  height: 32px;
`;

const CustomButtons = () => {

    const [open, setOpen] = useState(false);
    const { account, setAccount } = useContext(DataContext);

    const cartDetails = useSelector(state => state.cart);
    const { cartItems } = cartDetails;

    const openDialog = () => {
        setOpen(true);
    };

    return (
        <Wrapper>

            {
                account ? 
                <Profile account={account} setAccount={setAccount} /> :
                <LoginButton variant="contained" onClick={openDialog}>
                    Login
                </LoginButton>
            }

            <Typography style={{ fontSize: 14, cursor: 'pointer' }}>
                Become a Seller
            </Typography>

            <Typography style={{ fontSize: 14, cursor: 'pointer' }}>
                More
            </Typography>

            <Container to="/cart">
                <Badge badgeContent={cartItems?.length} color="secondary">
                    <ShoppingCart />
                </Badge>
                <Typography>
                    Cart
                </Typography>
            </Container>

            {/* ✅ FIXED PART */}
            <LoginDialog
                open={open}
                setOpen={setOpen}
                setAccount={setAccount}
            />

        </Wrapper>
    );
};

export default CustomButtons;