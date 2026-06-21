import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import  {Provider}  from 'react-redux';
import store from './redux/store';

import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

// Global Axios Interceptor to dynamically swap API base URL during deployment
axios.interceptors.request.use(
    (config) => {
        if (config.url && config.url.includes('http://localhost:8000')) {
            const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            config.url = config.url.replace('http://localhost:8000', backendUrl);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>  
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </GoogleOAuthProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
