import { Box, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from './logo.svg';
//components
import Header from './components/header/header';
import Home from './components/home/home';
import DetailView from './components/details/DetailView';
import Cart from './components/Cart/Cart';
import DataProvider from './context/dataprovider';
import OrderHistory from './components/orders/OrderHistory';
import AIChatbot from './components/ai/AIChatbot';
import AdminPanel from './components/admin/AdminPanel';
import SupportChatWidget from './components/chat/SupportChatWidget';
import Footer from './components/footer/Footer';
import Wishlist from './components/wishlist/Wishlist';
import ProfileDashboard from './components/profile/ProfileDashboard';
import GroupBuyDetail from './components/details/GroupBuyDetail';
import SellerOnboarding from './components/seller/SellerOnboarding';

import {BrowserRouter,Routes,Route} from 'react-router-dom';


function App() {
  return (
   <DataProvider >
    <BrowserRouter>
      <Header/>
      <Box component="main" sx={{ marginTop: 6}}>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/product/:id' element={ <DetailView/>} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/orders' element={<OrderHistory />} />
          <Route path='/admin' element={<AdminPanel />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/profile' element={<ProfileDashboard />} />
          <Route path='/group-buy/:id' element={<GroupBuyDetail />} />
          <Route path='/seller/onboarding' element={<SellerOnboarding />} />
        </Routes>
      </Box>
      <Footer />
      <AIChatbot />
      <SupportChatWidget />
    </BrowserRouter>
   </DataProvider>
  );
}

export default App;
