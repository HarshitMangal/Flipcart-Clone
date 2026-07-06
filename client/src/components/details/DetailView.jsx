import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getProductDetails } from "../../redux/actions/productAction";
import { Box, Typography,styled ,Grid} from "@mui/material";
import ActionItem from "./ActionItem";
import ProductDetail from './ProductDetail';
import SimilarProducts from './SimilarProducts';




const Component = styled(Box)`
    margin-top: 55px;
    background: #F2F2F2;
`;

const ProductCard = styled(Box)(({ theme }) => ({
    background: '#FFFFFF',
    padding: '20px 40px',
    margin: '0 60px',
    borderTop: '3px solid #2874f0',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,.1)',
    [theme.breakpoints.down('lg')]: {
        margin: '0 20px',
        padding: '20px'
    },
    [theme.breakpoints.down('md')]: {
        margin: 0,
        padding: '15px 10px'
    }
}))

const RightContainer = styled(Grid)(({ theme }) => ({
    marginTop: '50px',
    paddingLeft: '40px',
    '& > p': {
        marginTop: '10px'
    },
    [theme.breakpoints.down('md')]: {
        paddingLeft: 0,
        marginTop: '20px'
    }
}));








const DetailView = () => {

    const dispatch = useDispatch();
    const { id } = useParams();

    const { loading, product } = useSelector(
        state => state.getProductDetails
    );

    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/products/${id}/reviews`);
            setReviews(response.data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    useEffect(() => {
        if (product && id !== product.id)
            dispatch(getProductDetails(id));
        
        fetchReviews();
    }, [dispatch, product, id]);

    const averageRating = reviews.length > 0 
        ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)) 
        : 0;

    return (
        <Component>
            {
                product && Object.keys(product).length > 0 &&
                <ProductCard>
                    <Grid 
                        container 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: { md: 'row', xs: 'column' }, 
                            flexWrap: { md: 'nowrap', xs: 'wrap' } 
                        }}
                    >
                        <Grid item lg={5} md={5} sm={12} xs={12} style={{ width: '100%' }}>
                            <ActionItem product={product} />
                        </Grid>
                        <RightContainer item lg={7} md={7} sm={12} xs={12} style={{ width: '100%' }}>
                            <ProductDetail 
                                product={product} 
                                reviews={reviews}
                                averageRating={averageRating}
                                refetchReviews={fetchReviews}
                            />
                        </RightContainer>
                    </Grid>
                </ProductCard>
            }
            {product && <SimilarProducts productId={product.id} />}
        </Component>
    )
}

export default DetailView;