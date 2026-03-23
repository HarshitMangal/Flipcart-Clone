import axios from 'axios';

export const authenticateSignup = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/signup', data);
    } catch (error) {
        console.log('Error while calling signup API', error);
        console.log('Backend error:', error.response);
        alert(error?.response?.data?.message || 'Signup failed');
    }
};

export const authenticateLogin = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/login', data);
    } catch (error) {
        console.log('Error while calling login API', error);
        console.log('Backend error:', error.response);
        alert(error?.response?.data?.message || 'Login failed');
        throw error;
    }
};

export  const payUsingPaytm = async (data) => {
    try {
        let response = await axios.post(`http://localhost:8000/api/payment`, data);
        return response.data;
    } catch (error) {
        console.log('Error', error);
    }
}