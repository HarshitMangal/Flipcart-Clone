import { Typography, Box, Menu, MenuItem, styled } from "@mui/material";
import { useState, useContext } from "react";
import { DataContext } from "../../context/dataprovider";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

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

  return (
    <>
      <Box onClick={handleClick} sx={{ cursor: "pointer" }}>
        <Typography>{account}</Typography>
      </Box>

      <Components>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
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