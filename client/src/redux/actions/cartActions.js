import axios from 'axios';
import * as actionTypes from '../constant/cartConstants';

export const addToCart = (id, quantity) => async (dispatch) => {
    try {
        console.log("ID:", id);

         console.log("API call with id:", id);    
      const { data } = await axios.get(`http://localhost:8000/api/products/${id}`);
          console.log("API response:", data);      

        dispatch({
            type: actionTypes.ADD_TO_CART,
            payload: { ...data, quantity }
        });

    } catch (error) {
        console.log('Error while calling cart API', error.message);
    }
};

export const removeFromCart = (id) => (dispatch) => {
    dispatch({
        type: actionTypes.REMOVE_FROM_CART,
        payload: id
    });
};