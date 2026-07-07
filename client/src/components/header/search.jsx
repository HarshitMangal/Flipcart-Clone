import { InputBase, List, ListItem, Box, styled, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts } from '../../redux/actions/productAction';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const SearchContainer = styled(Box)(({ theme }) => ({
  background: '#fff',
  width: '38%',
  borderRadius: '2px',
  marginLeft: '25px',
  display: 'flex',
  position: 'relative',
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
  cursor: pointer;
`;

const ListWrapper = styled(List)(({ theme }) => ({
  position: 'absolute',
  color: '#000',
  background: '#FFFFFF',
  marginTop: '38px',
  width: '100%', // Match width of input container exactly
  zIndex: 999,
  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
  border: '1px solid #e0e0e0',
  borderTop: 'none',
  borderRadius: '0 0 4px 4px',
  maxHeight: '320px',
  overflowY: 'auto',
  padding: 0
}));

const SearchListItem = styled(ListItem)`
  padding: 0;
  cursor: pointer;
  &:hover {
    background-color: #f5f8ff;
  }
`;

const Search = () => {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const dispatch = useDispatch();

  // Load products list from Redux
  const { products } = useSelector(state => state.getProducts);

  // Load products on mount
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(true); // Close dropdown
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getText = (value) => {
    setText(value);
    setOpen(false);
  };

  // Filter products by search text (checks both shortTitle and longTitle)
  const filteredProducts = products?.filter(product =>
    product.title.longTitle.toLowerCase().includes(text.toLowerCase()) ||
    product.title.shortTitle.toLowerCase().includes(text.toLowerCase())
  ) || [];

  return (
    <SearchContainer ref={containerRef}>
      <InputSearchBase
        placeholder='Search for products, brands and more'
        inputProps={{ 'aria-label': 'search' }}
        value={text}
        onChange={(e) => getText(e.target.value)}
        onFocus={() => setOpen(false)}
      />

      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>

      {
        text && !open &&
        <ListWrapper>
          {
            filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <SearchListItem key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'inherit', 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: '100%', 
                      gap: '12px',
                      padding: '10px 16px' 
                    }}
                    onClick={() => {
                      setOpen(true);
                      setText(''); // Clear search input on selection
                    }}
                  >
                    <SearchIcon style={{ color: '#878787', fontSize: '18px' }} />
                    <Typography style={{ fontSize: '14px', color: '#212121', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.title.longTitle}
                    </Typography>
                  </Link>
                </SearchListItem>
              ))
            ) : (
              <ListItem style={{ padding: '12px 16px' }}>
                <Typography style={{ fontSize: '14px', color: '#878787' }}>
                  No results found for "{text}"
                </Typography>
              </ListItem>
            )
          }
        </ListWrapper>
      }
    </SearchContainer>
  );
};

export default Search;