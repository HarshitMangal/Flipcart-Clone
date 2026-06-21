import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Button, TextField, Grid, styled, Card, CardContent, IconButton, FormControlLabel, Radio, RadioGroup, Checkbox } from '@mui/material';
import { DataContext } from '../../context/dataprovider';
import { getAddressesAPI, addAddressAPI, updateAddressAPI, deleteAddressAPI, getUserProfileAPI, updateUserProfileAPI } from '../../service/api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const MainContainer = styled(Box)`
    width: 80%;
    margin: 80px auto;
    display: flex;
    gap: 30px;
    background: #f1f3f6;
    min-height: 70vh;
    @media (max-width: 960px) {
        flex-direction: column;
        width: 95%;
    }
`;

const Sidebar = styled(Box)`
    width: 30%;
    background: #fff;
    padding: 20px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.08);
    border-radius: 2px;
    height: fit-content;
    @media (max-width: 960px) {
        width: 100%;
    }
`;

const ContentArea = styled(Box)`
    width: 70%;
    background: #fff;
    padding: 25px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.08);
    border-radius: 2px;
    @media (max-width: 960px) {
        width: 100%;
    }
`;

const AvatarContainer = styled(Box)`
    display: flex;
    align-items: center;
    gap: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
`;

const Avatar = styled(Box)`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #2874f0;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
`;

const AddressCard = styled(Card)`
    margin-bottom: 15px;
    border: 1px solid #f0f0f0;
    box-shadow: none;
    position: relative;
    &:hover {
        box-shadow: 0 2px 8px 0 rgba(0,0,0,0.06);
    }
`;

const TypeBadge = styled(Box)`
    background: #f0f0f0;
    color: #878787;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 2px;
    width: fit-content;
    text-transform: uppercase;
    margin-bottom: 5px;
`;

const initialAddressValues = {
    fullname: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    addressType: 'Home',
    isDefault: false
};

const ProfileDashboard = () => {
    const { account } = useContext(DataContext);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialAddressValues);
    const [editId, setEditId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: account || ''
    });

    const fetchAddresses = async () => {
        if (!account) return;
        const data = await getAddressesAPI(account);
        if (data) {
            setAddresses(data);
        }
    };

    const loadProfile = async () => {
        if (!account) return;
        const res = await getUserProfileAPI(account);
        if (res && res.success && res.data) {
            setProfileData({
                firstname: res.data.firstname || '',
                lastname: res.data.lastname || '',
                email: res.data.email || '',
                username: res.data.username || account
            });
        }
    };

    useEffect(() => {
        loadProfile();
        fetchAddresses();
    }, [account]);

    const handleProfileSave = async () => {
        const res = await updateUserProfileAPI(profileData);
        if (res && res.status === 200) {
            alert('Profile updated successfully!');
            setIsEditing(false);
            loadProfile();
        } else {
            alert('Failed to update profile');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!account) return;

        if (editId) {
            // Update address
            const res = await updateAddressAPI(editId, { ...formData, userId: account });
            if (res) {
                alert('Address updated successfully!');
            }
        } else {
            // Add address
            const res = await addAddressAPI({ ...formData, userId: account });
            if (res) {
                alert('Address added successfully!');
            }
        }
        setFormData(initialAddressValues);
        setShowForm(false);
        setEditId(null);
        fetchAddresses();
    };

    const handleEdit = (addr) => {
        setFormData({
            fullname: addr.fullname,
            mobile: addr.mobile,
            pincode: addr.pincode,
            locality: addr.locality,
            address: addr.address,
            city: addr.city,
            state: addr.state,
            addressType: addr.addressType,
            isDefault: addr.isDefault
        });
        setEditId(addr._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            const res = await deleteAddressAPI(id);
            if (res) {
                alert('Address deleted successfully!');
                fetchAddresses();
            }
        }
    };

    return (
        <MainContainer>
            <Sidebar>
                <AvatarContainer>
                    <Avatar>
                        {account ? account.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                        <Typography style={{ fontSize: 12, color: '#878787' }}>Hello,</Typography>
                        <Typography style={{ fontWeight: 600, fontSize: 16 }}>{account}</Typography>
                    </Box>
                </AvatarContainer>
                <Typography style={{ fontWeight: 600, color: '#878787', marginBottom: 15 }}>ACCOUNT SETTINGS</Typography>
                <Typography style={{ color: '#2874f0', fontWeight: 600, paddingLeft: 10, borderLeft: '3px solid #2874f0', marginBottom: 15, cursor: 'pointer' }}>
                    My Profile & Addresses
                </Typography>
            </Sidebar>

            <ContentArea>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>Personal Information</Typography>
                    {!isEditing ? (
                        <Button 
                            variant="outlined" 
                            startIcon={<EditIcon />} 
                            onClick={() => setIsEditing(true)}
                            style={{ textTransform: 'none', borderColor: '#e0e0e0', color: '#2874f0' }}
                        >
                            EDIT
                        </Button>
                    ) : (
                        <Box style={{ display: 'flex', gap: '15px' }}>
                            <Button 
                                variant="contained" 
                                style={{ background: '#fb641b', color: '#fff', textTransform: 'none' }}
                                onClick={handleProfileSave}
                            >
                                SAVE
                            </Button>
                            <Button 
                                variant="text" 
                                style={{ color: '#2874f0', textTransform: 'none' }}
                                onClick={() => { setIsEditing(false); loadProfile(); }}
                            >
                                CANCEL
                            </Button>
                        </Box>
                    )}
                </Box>
                <Grid container spacing={3} style={{ marginBottom: 40 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="First Name" 
                            value={profileData.firstname} 
                            onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })} 
                            fullWidth 
                            disabled={!isEditing} 
                            variant="outlined" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Last Name" 
                            value={profileData.lastname} 
                            onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })} 
                            fullWidth 
                            disabled={!isEditing} 
                            variant="outlined" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Email Address" 
                            value={profileData.email} 
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
                            fullWidth 
                            disabled={!isEditing} 
                            variant="outlined" 
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Username" 
                            value={profileData.username} 
                            fullWidth 
                            disabled 
                            variant="outlined" 
                        />
                    </Grid>
                </Grid>

                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Typography variant="h6" style={{ fontWeight: 600 }}>Manage Addresses</Typography>
                    {!showForm && (
                        <Button 
                            variant="outlined" 
                            startIcon={<AddIcon />} 
                            onClick={() => { setShowForm(true); setEditId(null); setFormData(initialAddressValues); }}
                            style={{ textTransform: 'none', borderColor: '#e0e0e0', color: '#2874f0' }}
                        >
                            ADD A NEW ADDRESS
                        </Button>
                    )}
                </Box>

                {showForm && (
                    <Box component="form" onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 20, borderRadius: 4, marginBottom: 25, border: '1px solid #f0f0f0' }}>
                        <Typography style={{ fontWeight: 600, marginBottom: 15, color: '#2874f0' }}>
                            {editId ? 'EDIT ADDRESS' : 'ADD NEW ADDRESS'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Full Name" name="fullname" value={formData.fullname} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="10-digit mobile number" name="mobile" value={formData.mobile} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Locality" name="locality" value={formData.locality} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Address (Area and Street)" name="address" value={formData.address} onChange={handleInputChange} required fullWidth multiline rows={3} variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="City/District/Town" name="city" value={formData.city} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="State" name="state" value={formData.state} onChange={handleInputChange} required fullWidth variant="outlined" size="small" />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography style={{ fontSize: 12, color: '#878787', marginBottom: 5 }}>Address Type</Typography>
                                <RadioGroup row name="addressType" value={formData.addressType} onChange={handleInputChange}>
                                    <FormControlLabel value="Home" control={<Radio color="primary" />} label="Home (All day delivery)" />
                                    <FormControlLabel value="Work" control={<Radio color="primary" />} label="Work (Delivery between 10 AM - 5 PM)" />
                                </RadioGroup>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox name="isDefault" checked={formData.isDefault} onChange={handleInputChange} color="primary" />}
                                    label="Set as default address"
                                />
                            </Grid>
                            <Grid item xs={12} style={{ display: 'flex', gap: '15px', marginTop: 10 }}>
                                <Button type="submit" variant="contained" style={{ background: '#fb641b', color: '#fff', textTransform: 'none', padding: '10px 30px' }}>
                                    {editId ? 'UPDATE' : 'SAVE'}
                                </Button>
                                <Button variant="text" onClick={() => { setShowForm(false); setEditId(null); }} style={{ color: '#2874f0', textTransform: 'none' }}>
                                    CANCEL
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {addresses.length === 0 ? (
                    <Typography style={{ color: '#878787', textAlign: 'center', margin: '40px 0' }}>
                        No addresses saved yet. Click above to add.
                    </Typography>
                ) : (
                    addresses.map((addr) => (
                        <AddressCard key={addr._id}>
                            <CardContent style={{ padding: 20 }}>
                                <Box style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                                    <TypeBadge>{addr.addressType}</TypeBadge>
                                    {addr.isDefault && (
                                        <Box style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#388e3c', fontSize: 11, fontWeight: 600 }}>
                                            <CheckCircleIcon fontSize="inherit" /> DEFAULT
                                        </Box>
                                    )}
                                </Box>
                                <Typography style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>
                                    {addr.fullname} <span style={{ marginLeft: 15, color: '#878787', fontSize: 13 }}>{addr.mobile}</span>
                                </Typography>
                                <Typography style={{ fontSize: 14, color: '#212121', lineHeight: 1.6 }}>
                                    {addr.address}, {addr.locality}, {addr.city}, {addr.state} - <strong style={{ fontWeight: 600 }}>{addr.pincode}</strong>
                                </Typography>

                                <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                                    <IconButton onClick={() => handleEdit(addr)} size="small" style={{ color: '#2874f0' }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(addr._id)} size="small" style={{ color: '#ff6161' }}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </AddressCard>
                    ))
                )}
            </ContentArea>
        </MainContainer>
    );
};

export default ProfileDashboard;
