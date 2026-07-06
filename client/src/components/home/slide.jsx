import React, { useState, useContext } from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Countdown from 'react-countdown';
import { Link } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import { DataContext } from '../../context/dataprovider';

import { Box, Typography, Divider, Button, Dialog, DialogTitle, DialogContent, Grid, Card, IconButton, styled } from '@mui/material';
const Component = styled(Box)`
margin: 20px 0;
background: #FFFFFF;
`;

const Deal = styled(Box)(({ theme }) => ({
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
        flexWrap: 'wrap',
        gap: '10px'
    }
}));

const Timer = styled(Box)(({ theme }) => ({
    display: 'flex',
    marginLeft: '10px',
    alignItems: 'center',
    color: '#7f7f7f',
    [theme.breakpoints.down('sm')]: {
        marginLeft: 0
    }
}));

const DealText = styled(Typography)(({ theme }) => ({
    fontSize: '22px',
    fontWeight: 600,
    marginRight: '25px',
    lineHeight: '32px',
    [theme.breakpoints.down('sm')]: {
        fontSize: '16px',
        marginRight: '10px'
    }
}));

const ViewAllButton = styled(Button)`
margin-left: auto;
background-color: #2874f0;
color: #fff;
border-radius: 2px;
height: 32px;
font-size: 13px;
font-weight: 600;
text-transform: none;   
&:hover {
    background-color: #2874f0;
    color: #fff;
}
`;  

// const Image=styled(img)`

// `;
const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};
const Image=styled('img')({
  width: 'auto',
  height:150

});
const Text=styled(Typography)`
font-size: 14px;
margin-top: 5px;  
`;


const Slide = ({ products, title,timer }) => {   
    const [openCatalog, setOpenCatalog] = useState(false);
    const { formatPrice } = useContext(DataContext);
    const timerURL = "https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/timer_a73398.svg";
    const renderer = ({ hours, minutes, seconds, completed }) => {
         return <span>{hours}:{minutes}:{seconds} Left</span>;
    };
  return(
    <Component>
        <Deal>
             <DealText >
                 {title}
                   </DealText>
              {
                 timer && <Timer>
                <img src={timerURL} alt="timer" style={{width:24}} />
                <Countdown date={Date.now() + 5.04e+7} renderer={renderer} />   
             </Timer>
              }
                   
  

             <ViewAllButton variant="contained" color="primary" onClick={() => setOpenCatalog(true)}>View All </ViewAllButton>
        </Deal>
        <Divider />

    <Carousel responsive={responsive}
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={4000}
              swipeable={true}
              draggable={true}
              centerMode={true}
              keyBoardControl={true}
              slidesToSlide={1}
                containerClass="carousel-container"
             itemClass="carousel-item-padding-40-px"
              dotListClass="custom-dot-list-style"

    >

        {products?.map((product) => (
          <Link to={`product/${product.id}`} style={{textDecoration:'none'}} key={product.id}>
            <Box textAlign="center" style={{padding:'25px 15px'}} >

            <Image
              src={product.url} 
              alt={product.title?.shortTitle || "product"} 
              width="150"
              height="150"
              style={{ objectFit: 'contain' }}
            />
            <Text style={{fontWeight:600,color:'#212121'}}>{product.title?.shortTitle}</Text>
            <Text style={{color:'green'}}> {product.discount}</Text>
            <Text style={{color:'#212121',opacity:0.8}} >{product.tagline}</Text>
                </Box>
                </Link>
        ))}
    </Carousel>

    {/* View All Dialog Popup Grid */}
    <Dialog 
        open={openCatalog} 
        onClose={() => setOpenCatalog(false)}
        maxWidth="lg"
        fullWidth
    >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2874f0', color: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>{title} ({products?.length} Products)</Typography>
            <IconButton onClick={() => setOpenCatalog(false)} sx={{ color: '#fff' }} aria-label="close catalog products list">
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: '#f1f3f6', padding: '20px' }}>
            <Grid container spacing={3}>
                {products?.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                        <Card 
                            component={Link} 
                            to={`/product/${product.id}`} 
                            onClick={() => setOpenCatalog(false)}
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
        </DialogContent>
    </Dialog>

    </Component>
  )
};  

export default Slide;