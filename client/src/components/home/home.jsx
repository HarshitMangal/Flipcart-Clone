
import { useEffect, useState, useContext } from "react";
import NavBar from "./navbar";
import Banner from "./banner";
import Slide from "./slide";
import Midslide from "./midslide";
import MidSection from "./MidSection";

import { Box, styled, Dialog, DialogTitle, DialogContent, Grid, Card, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { getProducts } from "../../redux/actions/productAction";
import { useDispatch, useSelector } from "react-redux";
import { DataContext } from '../../context/dataprovider';

const Component = styled(Box)`
  padding: 10px;
  background: #F2F2F2;
`;

const Home = () => {

 const { products } = useSelector((state) => state.getProducts);
 console.log(products);

 const dispatch = useDispatch();

 const [selectedCategory, setSelectedCategory] = useState(null);
 const [isCategoryOpen, setIsCategoryOpen] = useState(false);
 const { formatPrice } = useContext(DataContext);

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

 const filterProductsByCategory = (items, category) => {
     if (!items || !category) return [];
     const cat = category.toLowerCase();
     
     if (cat === 'top offers') {
         return items.filter(p => p.discount?.toLowerCase().includes('70%') || p.discount?.toLowerCase().includes('extra') || p.discount?.toLowerCase().includes('from') || p.discount?.toLowerCase().includes('off'));
     }
     if (cat === 'grocery') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('grocery') || p.description?.toLowerCase().includes('grocery') || p.title?.longTitle?.toLowerCase().includes('grocery') || p.title?.shortTitle?.toLowerCase().includes('kettle') || p.title?.shortTitle?.toLowerCase().includes('maker'));
     }
     if (cat === 'mobile') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('watch') || p.title?.shortTitle?.toLowerCase().includes('mobile') || p.title?.shortTitle?.toLowerCase().includes('phone') || p.description?.toLowerCase().includes('smartwatch') || p.description?.toLowerCase().includes('phone'));
     }
     if (cat === 'fashion') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('trimmer') || p.title?.shortTitle?.toLowerCase().includes('dryer') || p.description?.toLowerCase().includes('hair') || p.title?.shortTitle?.toLowerCase().includes('fashion'));
     }
     if (cat === 'electronics') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('electric') || p.title?.shortTitle?.toLowerCase().includes('watch') || p.title?.shortTitle?.toLowerCase().includes('dryer') || p.title?.shortTitle?.toLowerCase().includes('fan') || p.title?.shortTitle?.toLowerCase().includes('maker'));
     }
     if (cat === 'home' || cat === 'appliances') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('home') || p.title?.shortTitle?.toLowerCase().includes('kitchen') || p.title?.shortTitle?.toLowerCase().includes('fan') || p.title?.shortTitle?.toLowerCase().includes('sandwich') || p.title?.shortTitle?.toLowerCase().includes('appliances'));
     }
     if (cat === 'beauty, toys & more') {
         return items.filter(p => p.title?.shortTitle?.toLowerCase().includes('fitness') || p.description?.toLowerCase().includes('tube') || p.description?.toLowerCase().includes('toy') || p.description?.toLowerCase().includes('beauty'));
     }
     return items.filter(p => p.title?.shortTitle?.toLowerCase().includes(cat) || p.title?.longTitle?.toLowerCase().includes(cat));
 };

 const handleCategorySelect = (categoryName) => {
     setSelectedCategory(categoryName);
     setIsCategoryOpen(true);
 };

 const filteredCategoryProducts = filterProductsByCategory(products, selectedCategory);

 return (
   <>
     <NavBar onCategorySelect={handleCategorySelect} />
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

     {/* Category Catalog Dialog */}
     <Dialog 
         open={isCategoryOpen} 
         onClose={() => setIsCategoryOpen(false)}
         maxWidth="lg"
         fullWidth
     >
         <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2874f0', color: '#fff' }}>
             <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>{selectedCategory} ({filteredCategoryProducts.length} Products)</Typography>
             <IconButton onClick={() => setIsCategoryOpen(false)} sx={{ color: '#fff' }} aria-label="close category products list">
                 <CloseIcon />
             </IconButton>
         </DialogTitle>
         <DialogContent dividers sx={{ backgroundColor: '#f1f3f6', padding: '20px' }}>
             {filteredCategoryProducts.length === 0 ? (
                 <Box py={5} textAlign="center">
                     <Typography variant="h6" color="textSecondary">No products found in this category currently.</Typography>
                 </Box>
             ) : (
                 <Grid container spacing={3}>
                     {filteredCategoryProducts.map((product) => (
                         <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                             <Card 
                                 component={Link} 
                                 to={`/product/${product.id}`} 
                                 onClick={() => setIsCategoryOpen(false)}
                                 sx={{ 
                                     textDecoration: 'none', 
                                     height: '100%', 
                                     display: 'flex', 
                                     flexDirection: 'column', 
                                     alignItems: 'center', 
                                     padding: '15px', 
                                     textAlign: 'center',
                                     transition: 'transform 0.2s',
                                     '&:hover': {
                                         transform: 'scale(1.03)',
                                         boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                                     }
                                 }}
                             >
                                 <img 
                                     src={product.url} 
                                     alt={product.title?.shortTitle} 
                                     style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '15px' }} 
                                 />
                                 <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#212121', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                     {product.title?.longTitle || product.title?.shortTitle}
                                 </Typography>
                                 <Typography sx={{ color: 'green', fontSize: '12px', fontWeight: 600, mt: 1 }}>
                                     {product.discount}
                                 </Typography>
                                 <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#212121', mt: 0.5 }}>
                                     {formatPrice(product.price?.cost)} <span style={{ textDecoration: 'line-through', color: '#878787', fontSize: '11px', fontWeight: 'normal' }}>{formatPrice(product.price?.mrp)}</span>
                                 </Typography>
                             </Card>
                         </Grid>
                     ))}
                 </Grid>
             )}
         </DialogContent>
     </Dialog>
   </>
 );
}

export default Home;