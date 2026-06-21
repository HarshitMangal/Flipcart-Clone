import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Badge, Button, Menu, MenuItem, IconButton, styled } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/dataprovider';
import { useSelector } from 'react-redux';

import Profile from './profile';
import LoginDialog from '../login/logindialog';

const Container = styled(Link)(({ theme }) => ({
    display: 'flex',
    textDecoration: 'none',
    color: '#fff',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('sm')]: {
        color: '#2874f0'
    }
}));

const Wrapper = styled(Box)(({ theme }) => ({
    margin: '0 3% 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '20px',
        width: '100%',
        padding: '10px'
    }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  color: '#2874f0',
  background: '#fff',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '2px',
  padding: '5px 25px',
  height: '32px',
  [theme.breakpoints.down('sm')]: {
      background: '#2874f0',
      color: '#fff'
  }
}));

const NotificationButton = styled(IconButton)(({ theme }) => ({
    color: '#fff',
    padding: '6px',
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
        color: '#2874f0'
    }
}));

const CustomButtons = () => {

    const navigate = useNavigate();
    const [moreAnchor, setMoreAnchor] = useState(null);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const { account, setAccount, isLoginOpen, setIsLoginOpen } = useContext(DataContext);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!account) {
                setNotifications([]);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:8000/api/notifications/${account}`);
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [account]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMoreClick = (event) => {
        event.stopPropagation();
        setMoreAnchor(event.currentTarget);
    };

    const handleMoreClose = () => {
        setMoreAnchor(null);
    };

    const handleNotifClick = (event) => {
        event.stopPropagation();
        setNotifAnchor(event.currentTarget);
    };

    const handleNotifClose = () => {
        setNotifAnchor(null);
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post('http://localhost:8000/api/notifications/read', { username: account });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking alerts read", error);
        }
    };

    const cartDetails = useSelector(state => state.cart);
    const { cartItems } = cartDetails;

    const openDialog = (event) => {
        event.stopPropagation();
        setIsLoginOpen(true);
    };

    return (
        <Wrapper>

            {
                account ? 
                <Profile account={account} setAccount={setAccount} /> :
                <LoginButton variant="contained" onClick={openDialog} startIcon={<AccountCircleIcon />}>
                    Login
                </LoginButton>
            }

            <Typography style={{ fontSize: 14, cursor: 'pointer' }} onClick={() => navigate('/seller/onboarding')}>
                Become a Seller
            </Typography>

            <Typography style={{ fontSize: 14, cursor: 'pointer' }} onClick={handleMoreClick}>
                More
            </Typography>

            <Menu
                anchorEl={moreAnchor}
                open={Boolean(moreAnchor)}
                onClose={handleMoreClose}
                sx={{ marginTop: '10px' }}
            >
                <MenuItem component={Link} to="/admin" onClick={handleMoreClose}>
                    <AdminPanelSettingsIcon color="primary" fontSize="small" sx={{ marginRight: '8px' }} />
                    <Typography style={{ fontSize: 14 }}>Admin Panel</Typography>
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={handleMoreClose}>
                    <ListAltIcon color="primary" fontSize="small" sx={{ marginRight: '8px' }} />
                    <Typography style={{ fontSize: 14 }}>My Orders</Typography>
                </MenuItem>
            </Menu>

            {/* Notification Bell Icon */}
            {account && (
                <>
                    <NotificationButton onClick={handleNotifClick}>
                        <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </NotificationButton>

                    <Menu
                        anchorEl={notifAnchor}
                        open={Boolean(notifAnchor)}
                        onClose={handleNotifClose}
                        sx={{ marginTop: '10px' }}
                        PaperProps={{
                            style: {
                                maxHeight: 350,
                                width: '320px',
                            },
                        }}
                    >
                        <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #e0e0e0">
                            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>Alerts & Notifications</Typography>
                            {unreadCount > 0 && (
                                <Button 
                                    size="small" 
                                    onClick={handleMarkAllRead} 
                                    style={{ fontSize: '11px', textTransform: 'none', padding: 0 }}
                                >
                                    Mark all read
                                </Button>
                            )}
                        </Box>
                        {notifications.length === 0 ? (
                            <Box p={2} textAlign="center">
                                <Typography style={{ fontSize: '13px', color: '#878787' }}>
                                    No price drop alerts yet.
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((notif) => (
                                <MenuItem 
                                    key={notif._id} 
                                    onClick={handleNotifClose}
                                    style={{ 
                                        whiteSpace: 'normal', 
                                        backgroundColor: notif.isRead ? 'transparent' : '#f4f7fb',
                                        borderBottom: '1px solid #f1f3f6'
                                    }}
                                >
                                    <Box py={0.5}>
                                        <Typography style={{ fontSize: '12.5px', color: '#333', lineHeight: '1.4' }}>
                                            {notif.message}
                                        </Typography>
                                        <Typography style={{ fontSize: '10px', color: '#878787', marginTop: '4px' }}>
                                            {new Date(notif.date).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        )}
                    </Menu>
                </>
            )}

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
                open={isLoginOpen}
                setOpen={setIsLoginOpen}
                setAccount={setAccount}
            />

        </Wrapper>
    );
};

export default CustomButtons;