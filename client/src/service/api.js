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

export const authenticateGoogleLogin = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/google-login', data);
    } catch (error) {
        console.log('Error while calling google login API', error);
        return error.response;
    }
};

export const sendOtpAPI = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/send-otp', data);
    } catch (error) {
        console.log('Error while calling send otp API', error);
        return error.response;
    }
};

export const verifyOtpAPI = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/verify-otp', data);
    } catch (error) {
        console.log('Error while calling verify otp API', error);
        return error.response;
    }
};

export const getSimilarProductsAPI = async (id) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/products/${id}/similar`);
        return response.data;
    } catch (error) {
        console.log('Error while calling similar products API', error);
    }
};

export const toggleWishlistAPI = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/wishlist/toggle', data);
    } catch (error) {
        console.log('Error while calling toggle wishlist API', error);
    }
};

export const getWishlistAPI = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/wishlist/${userId}`);
        return response.data;
    } catch (error) {
        console.log('Error while calling get wishlist API', error);
    }
};

export const addAddressAPI = async (data) => {
    try {
        return await axios.post('http://localhost:8000/api/address/add', data);
    } catch (error) {
        console.log('Error while calling add address API', error);
    }
};

export const getAddressesAPI = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/address/${userId}`);
        return response.data;
    } catch (error) {
        console.log('Error while calling get addresses API', error);
    }
};

export const updateAddressAPI = async (id, data) => {
    try {
        return await axios.put(`http://localhost:8000/api/address/${id}`, data);
    } catch (error) {
        console.log('Error while calling update address API', error);
    }
};

export const deleteAddressAPI = async (id) => {
    try {
        return await axios.delete(`http://localhost:8000/api/address/${id}`);
    } catch (error) {
        console.log('Error while calling delete address API', error);
    }
};

export const createGroupBuyAPI = async (data) => {
    try {
        const response = await axios.post('http://localhost:8000/api/group-buy/create', data);
        return response.data;
    } catch (error) {
        console.log('Error while calling create group buy API', error);
    }
};

export const joinGroupBuyAPI = async (data) => {
    try {
        const response = await axios.post('http://localhost:8000/api/group-buy/join', data);
        return response.data;
    } catch (error) {
        console.log('Error while calling join group buy API', error);
    }
};

export const getActiveGroupBuysAPI = async (productId) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/group-buy/active/${productId}`);
        return response.data;
    } catch (error) {
        console.log('Error while calling get active group buys API', error);
    }
};

export const getGroupBuyAPI = async (id) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/group-buy/${id}`);
        return response.data;
    } catch (error) {
        console.log('Error while calling get group buy API', error);
    }
};