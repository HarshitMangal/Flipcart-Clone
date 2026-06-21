import { Typography, Box, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, styled } from "@mui/material";
import { useState, useContext } from "react";
import { DataContext } from "../../context/dataprovider";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Components = styled(Box)`
  margin-top: 5px;
`;

const Logout = styled(Typography)`
  font-size: 14px;
  margin-left: 5px;
`;

const Profile = ({ account }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { setAccount } = useContext(DataContext);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
    handleClose();
  };

  const handleCurrentDeviceLogout = () => {
    setAccount('');
    setOpenLogoutDialog(false);
    navigate('/');
    alert('Logged out from current device successfully!');
  };

  const handleAllDevicesLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout-all', { username: account });
      setAccount('');
      setOpenLogoutDialog(false);
      navigate('/');
      alert('Logged out from all devices successfully!');
    } catch (err) {
      console.error(err);
      setAccount('');
      setOpenLogoutDialog(false);
      navigate('/');
    }
  };

  const goToProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const goToOrders = () => {
    navigate('/orders');
    handleClose();
  };

  const goToAdmin = () => {
    navigate('/admin');
    handleClose();
  };

  const goToWishlist = () => {
    navigate('/wishlist');
    handleClose();
  };

  return (
    <>
      <Box onClick={handleClick} sx={{ cursor: "pointer", display: 'flex', alignItems: 'center' }}>
        <Typography style={{ color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          Account <KeyboardArrowDownIcon style={{ marginLeft: 3, fontSize: 18 }} />
        </Typography>
      </Box>

      <Components>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={{ marginTop: '10px' }}
        >
          <MenuItem onClick={goToProfile}>
            <AccountCircleIcon color="primary" fontSize="small" />
            <Logout>My Profile</Logout>
          </MenuItem>
          <MenuItem onClick={goToOrders}>
            <ListAltIcon color="primary" fontSize="small" />
            <Logout>My Orders</Logout>
          </MenuItem>
          <MenuItem onClick={goToWishlist}>
            <FavoriteIcon color="primary" fontSize="small" />
            <Logout>Wishlist</Logout>
          </MenuItem>
          <MenuItem onClick={goToAdmin}>
            <AdminPanelSettingsIcon color="primary" fontSize="small" />
            <Logout>Admin Panel</Logout>
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <PowerSettingsNewIcon color="primary" fontSize="small" />
            <Logout>Logout</Logout>
          </MenuItem>
        </Menu>
      </Components>

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={openLogoutDialog} 
        onClose={() => setOpenLogoutDialog(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title" style={{ fontWeight: 600 }}>
          Logout Confirmation 🚪
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary">
            Are you sure you want to log out? Choose your preference below:
          </Typography>
        </DialogContent>
        <DialogActions style={{ padding: '15px 24px', gap: '8px' }}>
          <Button 
            onClick={() => setOpenLogoutDialog(false)} 
            style={{ textTransform: 'none', color: '#878787' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCurrentDeviceLogout} 
            variant="outlined" 
            style={{ textTransform: 'none', borderColor: '#2874f0', color: '#2874f0' }}
          >
            Logout from this device
          </Button>
          <Button 
            onClick={handleAllDevicesLogout} 
            variant="contained" 
            style={{ textTransform: 'none', backgroundColor: '#fb641b', color: '#fff' }}
          >
            Logout from all devices
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Profile;