
import { useEffect } from "react";
import NavBar from "./navbar";
import Banner from "./banner";
import Slide from "./slide";
import Midslide from "./midslide";
import MidSection from "./MidSection";

import { Box, styled } from '@mui/material';
import { getProducts } from "../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";


const Component = styled(Box)`
  padding: 10px;
  background: #F2F2F2;
`;

const Home = () => {

 const { products } = useSelector((state) => state.getProducts);
 console.log(products);

 const dispatch = useDispatch();

 useEffect(() => {
   dispatch(getProducts());
 }, [dispatch]);

 // Slice the products array dynamically so each row shows different items
 const dealOfTheDay = products ? products.slice(0, 8) : [];
 const bestSellers = products ? (products.length > 8 ? products.slice(8, 16) : products) : [];
 const newArrivals = products ? (products.length > 16 ? products.slice(16, 24) : products) : [];
 const topPicks = products ? (products.length > 24 ? products.slice(24, 32) : products) : [];
 const limitedOffer = products ? (products.length > 12 ? products.slice(12, 20) : products) : [];
 const customerFavorites = products ? (products.length > 18 ? products.slice(18, 26) : products) : [];

 return (
   <>
     <NavBar />
     <Component>
       <Banner />
       <Midslide products={dealOfTheDay} title="Deal of the Day" timer={true} />
       <MidSection/>
       <Slide products={bestSellers} title="Best Sellers"  timer={false}/>
       <Slide products={newArrivals} title="New Arrivals" timer={false} />
       <Slide products={topPicks} title="Top Picks" timer={false} />
       <Slide products={limitedOffer} title="Limited Time Offer" timer={false} />
       <Slide products={customerFavorites} title="Customer Favorites" timer={false} />
     </Component>
   </>
 );
}

export default Home;