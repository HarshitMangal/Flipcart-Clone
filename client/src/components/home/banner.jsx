
import Carousel from 'react-multi-carousel';
import { bannerData } from '../../constants/data';
import "react-multi-carousel/lib/styles.css";
import { styled } from '@mui/material';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

const Image = styled('img')(({ theme }) => ({
  width: '100%',
  height: 280,
  objectFit: 'cover',
  [theme.breakpoints.down('md')]: {
    height: 180
  },
  [theme.breakpoints.down('sm')]: {
    height: 150
  }
}));

const Banner=()=>{
    return(
       <Carousel responsive={responsive}
           containerClass="carousel-container"
             itemClass="carousel-item-padding-40-px"
              dotListClass="custom-dot-list-style"
              infinite={true}
              autoPlay={true}
              autoPlaySpeed={4000}
              swipeable={true}
              draggable={true}
              keyBoardControl={true}
              slidesToSlide={1}
       >
         {
        bannerData.map((data, index)=>{
          return(
            <Image src={data.url} alt="banner" key={index} />
          )
        })
         }
       </Carousel>
    )
};
export default Banner;