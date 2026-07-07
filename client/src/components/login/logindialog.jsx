import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogContent, TextField, Box, Button, Typography, styled, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { authenticateLogin, authenticateSignup, authenticateGoogleLogin, sendOtpAPI, verifyOtpAPI } from '../../service/api';
import { GoogleLogin } from '@react-oauth/google';
import { DataContext } from '../../context/dataprovider';

const Component = styled(DialogContent)(({ theme }) => ({
    height: '70vh',
    width: '90vh',
    padding: 0,
    paddingTop: 0,
    [theme.breakpoints.down('md')]: {
        width: '100%',
        height: 'auto'
    }
}));

const CloseButton = styled(IconButton)`
    position: absolute;
    right: 8px;
    top: 8px;
    color: #555;
    z-index: 1000;
    transition: color 0.2s ease;
    &:hover {
        color: #000;
        background-color: rgba(0, 0, 0, 0.05);
    }
`;

const LoginButton = styled(Button)`
    text-transform: none;
    background: #FB641B;
    color: #fff;
    height: 48px;
    border-radius: 2px;
    transition: background 0.2s ease;
    &:hover {
        background: #f3580c;
        box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);
    }
`;

const RequestOTP = styled(Button)`
    text-transform: none;
    background: #fff;
    color: #2874f0;
    height: 48px;
    border-radius: 2px;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 20%);
    transition: background 0.2s ease;
    &:hover {
        background: #f9f9f9;
        box-shadow: 0 2px 6px 0 rgb(0 0 0 / 25%);
    }
`;

const Text = styled(Typography)`
    color: #878787;
    font-size: 12px;
`;

const CreateAccount = styled(Typography)`
    margin: auto 0 5px 0;
    text-align: center;
    color: #2874f0;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer
`

const Wrapper = styled(Box)(({ theme }) => ({
    padding: '25px 35px',
    display: 'flex',
    flex: 1,
    overflow: 'auto',
    flexDirection: 'column',
    '& > div, & > button, & > p': {
        marginTop: '20px'
    }
}));

const Error = styled(Typography)`
    font-size: 10px;
    color: #ff6161;
    line-height: 0;
    margin-top: 10px;
    font-weight: 600;
`
// height: 70vh;
    
const Image = styled(Box)(({ theme }) => ({
    background: '#2874f0 url(https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/login_img_c4a81e.png) center 85% no-repeat',
    width: '40%',
    height: '100%',
    padding: '45px 35px',
    '& > p, & > h5': {
        color: '#FFFFFF',
        fontWeight: 600
    },
    [theme.breakpoints.down('md')]: {
        display: 'none'
    }
}));

const loginInitialValues = {
    username: '',
    password: ''
};

const signupInitialValues = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    phone: ''
};

const accountInitialValues = {
    login: {
        view: 'login',
        heading: 'Login',
        subHeading: 'Get access to your Orders, Wishlist and Recommendations'
    },
    signup: {
        view: 'signup',
        heading: "Looks like you're new here",
        subHeading: 'Signup to get started'
    }
}

const LoginDialog = ({ open, setOpen, setAccount }) => {
    const { setRole } = useContext(DataContext);
    const [ login, setLogin ] = useState(loginInitialValues);
    const [ signup, setSignup ] = useState(signupInitialValues);
    const [ error, showError] = useState(false);
    const [ account, toggleAccount ] = useState(accountInitialValues.login);
    
    // OTP states
    const [ otpSent, setOtpSent ] = useState(false);
    const [ otp, setOtp ] = useState('');

    // Signup OTP states
    const [ signupOtpSent, setSignupOtpSent ] = useState(false);
    const [ signupOtp, setSignupOtp ] = useState('');
    const [ isSignupEmailVerified, setIsSignupEmailVerified ] = useState(true);
    const [ signupError, setSignupError ] = useState('');

    useEffect(() => {
        showError(false);
    }, [login])

    const onValueChange = (e) => {
        setLogin({ ...login, [e.target.name]: e.target.value });
    }

    const onInputChange = (e) => {
        setSignup({ ...signup, [e.target.name]: e.target.value });
    }
    
    const handleGoogleSuccess = async (credentialResponse) => {
        const response = await authenticateGoogleLogin({ token: credentialResponse.credential });
        if(response.status === 200) {
            handleClose();
            setAccount(response.data.data.username);
            setRole(response.data.data.role);
        } else {
            showError(true);
        }
    }
    
    const requestOtp = async () => {
        if(!login.username) {
            alert('Please enter email to receive OTP');
            return;
        }
        const res = await sendOtpAPI({ email: login.username });
        if(res && res.status === 200) {
            setOtpSent(true);
            alert('OTP sent to your email');
        } else {
            alert('Error sending OTP');
        }
    }
    
    const verifyUserOtp = async () => {
        const res = await verifyOtpAPI({ email: login.username, otp });
        if(res && res.status === 200) {
            alert('OTP Verified! You can now login.');
            setOtpSent(false);
        } else {
            alert('Invalid OTP');
        }
    }

    const loginUser = async() => {
        try {
            let response = await authenticateLogin(login);
            if(!response) {
                showError(true);
            } else {
                showError(false);
                handleClose();
                setAccount(response.data.data.username);
                setRole(response.data.data.role);
            }
        } catch (err) {
            showError(true);
        }
    }

    const requestSignupOtp = async () => {
        if(!signup.email) {
            alert('Please enter your email to receive OTP');
            return;
        }
        const res = await sendOtpAPI({ email: signup.email, isSignup: true });
        if(res && res.status === 200) {
            setSignupOtpSent(true);
            alert('OTP sent to your signup email');
        } else {
            alert(res?.data?.message || 'Error sending OTP');
        }
    }
    
    const verifySignupOtp = async () => {
        const res = await verifyOtpAPI({ email: signup.email, otp: signupOtp, isSignup: true });
        if(res && res.status === 200) {
            setIsSignupEmailVerified(true);
            setSignupOtpSent(false);
            alert('Email OTP Verified! You can now proceed to Sign Up.');
        } else {
            alert('Invalid OTP');
        }
    }

    const validateSignup = (data) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

        if (!data.firstname || !/^[A-Z][a-zA-Z]*$/.test(data.firstname)) {
            setSignupError("Firstname must start with a Capital letter and contain only alphabets!");
            return false;
        }
        if (!data.lastname || !/^[A-Z][a-zA-Z]*$/.test(data.lastname)) {
            setSignupError("Lastname must start with a Capital letter and contain only alphabets!");
            return false;
        }
        if (!data.username || data.username.trim().length < 4) {
            setSignupError("Username must be at least 4 characters long!");
            return false;
        }
        if (!data.email || !emailRegex.test(data.email)) {
            setSignupError("Please enter a valid email address!");
            return false;
        }
        if (!data.password || !passwordRegex.test(data.password)) {
            setSignupError("Password must be at least 6 characters long with 1 letter & 1 number!");
            return false;
        }
        if (!data.phone || !phoneRegex.test(data.phone)) {
            setSignupError("Please enter a valid 10-digit mobile number!");
            return false;
        }
        setSignupError('');
        return true;
    };

    const signupUser = async() => {
        if (!validateSignup(signup)) {
            return;
        }
        let response = await authenticateSignup(signup);
        if(!response) return;
        handleClose();
        setAccount(response.data.data.username);
        setRole(response.data.data.role);
    }
    
    const toggleSignup = () => {
        toggleAccount(accountInitialValues.signup);
    }

    const handleClose = () => {
        setOpen(false);
        toggleAccount(accountInitialValues.login);
    }

    return (
        <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { maxWidth: 'unset', position: 'relative' } }}>
            <CloseButton onClick={handleClose}>
                <CloseIcon />
            </CloseButton>
            <Component>
                <Box style={{display: 'flex', height: '100%'}}>
                    <Image>
                        <Typography variant="h5">{account.heading}</Typography>
                        <Typography style={{marginTop: 20}}>{account.subHeading}</Typography>
                    </Image>
                    {
                        account.view === 'login' ? 
                        <Wrapper>
                            <TextField variant="standard" onChange={(e) => onValueChange(e)} name='username' label='Enter Email/Mobile number' />
                            { error && <Error>Please enter valid Email ID/Mobile number</Error> }
                            <TextField variant="standard" onChange={(e) => onValueChange(e)} name='password' label='Enter Password' type="password" />
                            <Text>By continuing, you agree to ShopSphere's Terms of Use and Privacy Policy.</Text>
                            <LoginButton onClick={() => loginUser()} >Login</LoginButton>
                            <Text style={{textAlign:'center'}}>OR</Text>
                            
                            {!otpSent ? 
                                <RequestOTP onClick={() => requestOtp()}>Request OTP on Email</RequestOTP>
                            : 
                                <Box style={{display:'flex', flexDirection:'column', gap: '10px'}}>
                                    <TextField variant="standard" onChange={(e) => setOtp(e.target.value)} label='Enter OTP' />
                                    <Button variant="contained" style={{background: '#2874f0'}} onClick={() => verifyUserOtp()}>Verify OTP</Button>
                                </Box>
                            }
                            
                            <Box style={{marginTop: 20, display:'flex', justifyContent:'center'}}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => { console.log('Login Failed'); showError(true); }}
                                />
                            </Box>
                            <CreateAccount onClick={() => toggleSignup()}>New to ShopSphere? Create an account</CreateAccount>
                        </Wrapper> : 
                        <Wrapper>
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='firstname' label='Enter Firstname' />
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='lastname' label='Enter Lastname' />
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='username' label='Enter Username' />
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='email' label='Enter Email' />
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='password' label='Enter Password' type="password" />
                            <TextField variant="standard" onChange={(e) => onInputChange(e)} name='phone' label='Enter Phone' />
                            { signupError && <Error style={{ lineHeight: 'normal', margin: '10px 0 0 0' }}>{signupError}</Error> }
                            <LoginButton onClick={() => signupUser()} >Continue</LoginButton>
                        </Wrapper>
                    }
                </Box>
            </Component>
        </Dialog>
    )
}

export default LoginDialog;