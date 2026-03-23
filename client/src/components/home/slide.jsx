import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Countdown from 'react-countdown';
import { Link } from "react-router-dom";

import {Box, Typography,Divider,Button,styled} from '@mui/material';
const Component = styled(Box)`
margin: 20px 0;
background: #FFFFFF;
`;

const Deal=styled(Box)`
padding: 15px 20px;
display: flex;
`;
const Timer=styled(Box)`
display: flex;
margin-left: 10px;
align-items: center;
color: #7f7f7f;
`;

const DealText = styled(Typography)`
font-size: 22px;
font-weight: 600;
margin-right: 25px;
line-height: 32px;
`;

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
                   
  

             <ViewAllButton variant="contained" color="primary">View All </ViewAllButton>
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
          <Link to={`product/${product.id}`} style={{textDecoration:'none'}}>
            <Box textAlign="center" style={{padding:'25px 15px'}} >

            <Image
              key={product.id}
              src={product.url} 
              alt="product" 
            />
            <Text style={{fontWeight:600,color:'#212121'}}>{product.title.shortTitle}</Text>
            <Text style={{color:'green'}}> {product.discount}</Text>
            <Text style={{color:'#212121',opacity:0.8}} >{product.tagline}</Text>
                </Box>
                </Link>
        ))}
    </Carousel>
    </Component>
  )
};  

export default Slide;