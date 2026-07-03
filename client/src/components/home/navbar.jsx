 
 import {Box,styled,Typography} from '@mui/material';
 import { navData} from '../../constants/data';
 

const Components = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    margin: '55px 130px 0 130px',
    textAlign: 'center',
    overflowX: 'auto',
    [theme.breakpoints.down('lg')]: {
        margin: '55px 0 0 0'
    }
}));

const Container = styled(Box)(({ theme }) => ({
    padding: '12px 8px',
    textAlign: 'center',
    flexShrink: 0
}));

const Text = styled(Typography)`
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
`;
const NavBar = ({ onCategorySelect }) => {
    return (
        <Components>
            {
                navData.map(data => (
                    <Container onClick={() => onCategorySelect && onCategorySelect(data.text)} style={{ cursor: 'pointer' }}>
                        <img src={data.url} alt="nav" style={{width:64}}/>
                        <Text>{data.text}</Text>
                    </Container>
                ))
            }
        </Components>
    );
};
export default NavBar;