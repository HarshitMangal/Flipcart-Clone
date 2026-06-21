import { InputBase, List, ListItem, Box, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../../redux/actions/productAction';
import { Link } from 'react-router-dom';

import { useState } from 'react';


const SearchContainer = styled(Box)(({ theme }) => ({
  background: '#fff',
  width: '38%',
  borderRadius: '2px',
  marginLeft: '25px',
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    width: '60%',
    marginLeft: '10px'
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: '5px'
  }
}));

const InputSearchBase = styled(InputBase)`
  padding-left: 20px;
  width: 100%;
  font-size: unset;
`;

const SearchIconWrapper = styled(Box)`
  color: #2874f0;
  padding: 5px;
  display: flex;
  align-items: center;
`;

const ListWrapper = styled(List)(({ theme }) => ({
  position: 'absolute',
  color: '#000',
  background: '#FFFFFF',
  marginTop: '36px',
  width: '38%',
  zIndex: 10,
  [theme.breakpoints.down('md')]: {
    width: '60%'
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%'
  }
}));


const Search = () => {

  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  // ✅ Redux se products lo
  const { products } = useSelector(state => state.getProducts);

  const getText = (value) => {
    setText(value);
    setOpen(false);
    dispatch(getProducts(value));
  };

  return (
    <SearchContainer>

      <InputSearchBase
        placeholder='Search for products, brands and more'
        inputProps={{ 'aria-label': 'search' }}
        onChange={(e) => getText(e.target.value)}
      />

      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>

      {
        text && !open &&
        <ListWrapper>
          {
            products
              ?.filter(product =>
                product.title.longTitle.toLowerCase().includes(text.toLowerCase())
              )
              .map(product => (
                <ListItem key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    onClick={() => setOpen(true)}
                  >
                    {product.title.longTitle}
                  </Link>
                </ListItem>
              ))
          }
        </ListWrapper>
      }

    </SearchContainer>
  );
};

export default Search;