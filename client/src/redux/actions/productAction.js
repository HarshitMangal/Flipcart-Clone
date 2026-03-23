import axios from 'axios';
import { 
  GET_PRODUCTS_SUCCESS, 
  GET_PRODUCTS_FAIL,
  GET_PRODUCT_DETAILS_REQUEST,
  GET_PRODUCT_DETAILS_SUCCESS,
  GET_PRODUCT_DETAILS_FAIL
} from '../constant/productConstant';

const URL = "http://localhost:8000/api";

export const getProducts = () => async (dispatch) => {
   try {

      const { data } = await axios.get(`${URL}/products`);

      dispatch({
         type: GET_PRODUCTS_SUCCESS,
         payload: data
      });

   } catch (err) {

      dispatch({
         type: GET_PRODUCTS_FAIL,
         payload: err.message
      });

   }
};


export const getProductDetails = (id) => async (dispatch) => {
   try {

      dispatch({
         type: GET_PRODUCT_DETAILS_REQUEST
      });

      const { data } = await axios.get(`${URL}/products/${id}`);

      dispatch({
         type: GET_PRODUCT_DETAILS_SUCCESS,
         payload: data
      });

   } catch (err) {

      dispatch({
         type: GET_PRODUCT_DETAILS_FAIL,
         payload: err.message
      });

   }
};