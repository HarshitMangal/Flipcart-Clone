import React, { useState, useContext } from 'react';
import { Box, Typography, TextField, Button, styled, Container, Paper, Alert } from '@mui/material';
import { DataContext } from '../../context/dataprovider';
import { becomeSellerAPI } from '../../service/api';
import { useNavigate } from 'react-router-dom';

const Component = styled(Container)`
    margin-top: 80px;
    margin-bottom: 50px;
    display: flex;
    justify-content: center;
`;

const FormWrapper = styled(Paper)`
    padding: 40px;
    width: 100%;
    max-width: 550px;
    border-radius: 8px;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
`;

const FormHeader = styled(Box)`
    text-align: center;
    margin-bottom: 30px;
    background: #2874f0;
    color: #fff;
    padding: 20px;
    margin: -40px -40px 30px -40px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
`;

const StyledButton = styled(Button)`
    background: #fb641b;
    color: #fff;
    font-weight: 600;
    height: 48px;
    border-radius: 2px;
    text-transform: none;
    margin-top: 20px;
    &:hover {
        background: #e05916;
    }
`;

const initialValues = {
    businessName: '',
    gstin: '',
    sellerPhone: '',
    sellerAddress: ''
};

const SellerOnboarding = () => {
    const { account, role, setRole, setIsLoginOpen } = useContext(DataContext);
    const [formValues, setFormValues] = useState(initialValues);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const onInputChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!formValues.businessName || !formValues.gstin || !formValues.sellerPhone || !formValues.sellerAddress) {
            setError('Please fill in all the details');
            return;
        }

        // Validate GSTIN length (15 characters)
        if (formValues.gstin.length !== 15) {
            setError('GSTIN must be exactly 15 characters long');
            return;
        }

        // Validate Phone (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formValues.sellerPhone)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        try {
            const payload = {
                username: account,
                ...formValues
            };
            const response = await becomeSellerAPI(payload);

            if (response && response.status === 200) {
                setSuccess('Congratulations! You are now registered as a seller.');
                setRole('seller');
                setTimeout(() => {
                    navigate('/admin');
                }, 2000);
            } else {
                setError(response?.data?.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        }
    };

    if (!account) {
        return (
            <Component>
                <FormWrapper sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 600 }}>
                        Login Required 🔒
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                        You must log in to your customer account first before registering as a seller.
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => setIsLoginOpen(true)}
                        sx={{ backgroundColor: '#2874f0', color: '#fff', textTransform: 'none', px: 4, py: 1 }}
                    >
                        Login to Continue
                    </Button>
                </FormWrapper>
            </Component>
        );
    }

    if (role === 'seller' || role === 'admin') {
        return (
            <Component>
                <FormWrapper sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                        Already Registered 🎉
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                        You are already registered as a {role}. You have full access to the seller portal.
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/admin')}
                        sx={{ backgroundColor: '#fb641b', color: '#fff', textTransform: 'none', px: 4, py: 1 }}
                    >
                        Go to Dashboard
                    </Button>
                </FormWrapper>
            </Component>
        );
    }

    return (
        <Component>
            <FormWrapper>
                <FormHeader>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Seller Onboarding</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 1 }}>
                        Onboard as a seller to list products, edit catalog and manage order fulfillments.
                    </Typography>
                </FormHeader>

                <form onSubmit={handleSubmit}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <TextField
                        fullWidth
                        label="Registered Business / Store Name"
                        name="businessName"
                        value={formValues.businessName}
                        onChange={onInputChange}
                        variant="outlined"
                        sx={{ mb: 3 }}
                        placeholder="e.g. Mangal Retailers"
                    />

                    <TextField
                        fullWidth
                        label="GSTIN (15 Digits Alphanumeric)"
                        name="gstin"
                        value={formValues.gstin.toUpperCase()}
                        onChange={onInputChange}
                        variant="outlined"
                        sx={{ mb: 3 }}
                        placeholder="e.g. 22AAAAA1111A1Z5"
                        inputProps={{ maxLength: 15 }}
                    />

                    <TextField
                        fullWidth
                        label="Store Pickup Mobile Number"
                        name="sellerPhone"
                        value={formValues.sellerPhone}
                        onChange={onInputChange}
                        variant="outlined"
                        sx={{ mb: 3 }}
                        placeholder="10-digit mobile number"
                        inputProps={{ maxLength: 10 }}
                    />

                    <TextField
                        fullWidth
                        label="Store Pickup Address"
                        name="sellerAddress"
                        value={formValues.sellerAddress}
                        onChange={onInputChange}
                        variant="outlined"
                        multiline
                        rows={3}
                        sx={{ mb: 3 }}
                        placeholder="Full business/store pickup address"
                    />

                    <StyledButton type="submit" fullWidth variant="contained">
                        Register and Launch Shop
                    </StyledButton>
                </form>
            </FormWrapper>
        </Component>
    );
};

export default SellerOnboarding;
