
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

 return (
   <>
     <NavBar />
     <Component>
       <Banner />
       <Midslide products={products} title="Deal of the Day" timer={true} />
       <MidSection/>
       <Slide products={products} title="Best Sellers"  timer={false}/>
       <Slide products={products} title="New Arrivals" timer={false} />
       <Slide products={products} title="Top Picks" timer={false} />
       <Slide products={products} title="Limited Time Offer" timer={false} />
       <Slide products={products} title="Customer Favorites" timer={false} />
     </Component>
   </>
 );
}

export default Home;