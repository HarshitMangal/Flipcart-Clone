import { Box, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import logo from './logo.svg';
//components
import Header from './components/header/header';
import Home from './components/home/home';
import DetailView from './components/details/DetailView';

import Cart from './components/Cart/Cart';
import DataProvider from './context/dataprovider';

import {BrowserRouter,Routes,Route} from 'react-router-dom';


function App() {
  return (
   <DataProvider >
    <BrowserRouter>
    <Header/>
    <Box sx={{ marginTop: 6}}>
      <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/product/:id' element={ <DetailView/>} />
         <Route path= '/cart' element={<Cart />} />
     </Routes>
    </Box>
    </BrowserRouter>
    </DataProvider>
  );
}

export default App;
