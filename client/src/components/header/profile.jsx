import { Typography, Box, Menu, MenuItem, styled } from "@mui/material";
import { useState, useContext } from "react";
import { DataContext } from "../../context/dataprovider";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from "react-router-dom";

const Components = styled(Box)`
  margin-top: 5px;
`;

const Logout = styled(Typography)`
  font-size: 14px;
  margin-left: 5px;
`;

const Profile = ({ account }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { setAccount } = useContext(DataContext);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logoutUser = () => {
    setAccount('');
    handleClose();
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
          <MenuItem onClick={logoutUser}>
            <PowerSettingsNewIcon color="primary" fontSize="small" />
            <Logout>Logout</Logout>
          </MenuItem>
        </Menu>
      </Components>
    </>
  );
};

export default Profile;