import { InputBase, List, ListItem, Box, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../../redux/actions/productAction';
import { Link } from 'react-router-dom';

import { useState } from 'react';


const SearchContainer = styled(Box)`
  background: #fff;
  width: 38%;
  border-radius: 2px;
  margin-left: 25px;
  display: flex;
`;

const InputSearchBase = styled(InputBase)`
  padding-left: 20px;
  width: 100%;
  font-size: unset;
`;

const SearchIconWrapper = styled(Box)`
  color: #2874f0;
`;

const ListWrapper = styled(List)`
  position: absolute;
  color: #000;
  background: #FFFFFF;
  margin-top: 36px;
  width: 38%;
`;


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