
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

 // Dynamic feed helper: divides products if catalog is large (30 items), or shifts them if catalog is small (7 items)
 const getProductFeed = (items, type) => {
   if (!items || items.length === 0) return [];
   
   if (items.length >= 24) {
     switch (type) {
       case 'deal': return items.slice(0, 8);
       case 'best': return items.slice(8, 16);
       case 'new': return items.slice(16, 24);
       case 'top': return items.slice(24, 32);
       case 'limited': return items.slice(12, 20);
       case 'favs': return items.slice(4, 12);
       default: return items;
     }
   } else {
     switch (type) {
       case 'deal': return items;
       case 'best': return [...items].reverse();
       case 'new': return items.slice(2).concat(items.slice(0, 2));
       case 'top': return items.slice(4).concat(items.slice(0, 4));
       case 'limited': return items.slice(1).concat(items.slice(0, 1));
       case 'favs': return items.slice(3).concat(items.slice(0, 3));
       default: return items;
     }
   }
 };

 return (
   <>
     <NavBar />
     <Component>
       <Banner />
       <Midslide products={getProductFeed(products, 'deal')} title="Deal of the Day" timer={true} />
       <MidSection/>
       <Slide products={getProductFeed(products, 'best')} title="Best Sellers"  timer={false}/>
       <Slide products={getProductFeed(products, 'new')} title="New Arrivals" timer={false} />
       <Slide products={getProductFeed(products, 'top')} title="Top Picks" timer={false} />
       <Slide products={getProductFeed(products, 'limited')} title="Limited Time Offer" timer={false} />
       <Slide products={getProductFeed(products, 'favs')} title="Customer Favorites" timer={false} />
     </Component>
   </>
 );
}

export default Home;