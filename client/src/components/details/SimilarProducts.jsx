import React, { useEffect, useState } from 'react';
import { Box, Typography, styled, Divider } from '@mui/material';
import { getSimilarProductsAPI } from '../../service/api';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import { Link } from 'react-router-dom';

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 5,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
    }
};

const Component = styled(Box)(({ theme }) => ({
    marginTop: '20px',
    background: '#FFFFFF',
    margin: '20px 60px 0 60px',
    [theme.breakpoints.down('lg')]: {
        margin: '20px 20px 0 20px'
    },
    [theme.breakpoints.down('md')]: {
        margin: '10px 15px 0 15px'
    }
}));

const Title = styled(Typography)`
    font-size: 22px;
    font-weight: 600;
    padding: 15px 20px;
`;

const ProductItem = styled(Box)`
    padding: 25px 15px;
    text-align: center;
    border-radius: 4px;
    margin: 10px;
    border: 1px solid #f0f0f0;
    transition: box-shadow 0.2s ease-in-out;
    &:hover {
        box-shadow: 0 3px 16px 0 rgba(0,0,0,.11);
    }
`;

const Image = styled('img')({
    width: 'auto',
    height: 150
});

const Text = styled(Typography)`
    font-size: 14px;
    margin-top: 5px;
`;

const SimilarProducts = ({ productId }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchSimilar = async () => {
            const res = await getSimilarProductsAPI(productId);
            if (res) setProducts(res);
        }
        if (productId) fetchSimilar();
    }, [productId]);

    if (!products || products.length === 0) return null;

    return (
        <Component>
            <Title>Similar Products You Might Like</Title>
            <Divider />
            <Carousel
                responsive={responsive}
                swipeable={false}
                draggable={false}
                centerMode={true}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={10000}
                keyBoardControl={true}
                showDots={false}
                containerClass="carousel-container"
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
            >
                {products.map(product => (
                    <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}} key={product.id}>
                        <ProductItem>
                            <Image src={product.url} alt="product" />
                            <Text style={{ fontWeight: 600, color: '#212121' }}>{product.title.shortTitle}</Text>
                            <Text style={{ color: 'green' }}>{product.discount}</Text>
                            <Text style={{ color: '#212121', opacity: '.6' }}>{product.tagline}</Text>
                        </ProductItem>
                    </Link>
                ))}
            </Carousel>
        </Component>
    );
};

export default SimilarProducts;
