import { Box, styled } from '@mui/material';

const ImageURL = [
  'https://rukminim1.flixcart.com/flap/960/960/image/2f30db9425df5cec.jpg?q=50',
  'https://rukminim1.flixcart.com/flap/960/960/image/084789479074d2b2.jpg',
  'https://rukminim1.flixcart.com/flap/960/960/image/1ce0c4c1fb501b45.jpg?q=50'
];

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: '20px',
  gap: '10px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const SmallImage = styled('img')(({ theme }) => ({
  width: '33.3%',
  [theme.breakpoints.down('md')]: {
    width: '100%'
  }
}));

const LargeImage = styled('img')(({ theme }) => ({
  width: '100%',
  marginTop: '20px',
  [theme.breakpoints.down('md')]: {
    height: 150,
    objectFit: 'cover'
  }
}));

const MidSection = () => {

  const url =
    "https://rukminim1.flixcart.com/flap/3006/433/image/4789bc3aefd54494.jpg?q=50";

  return (
    <>
      <Wrapper>
        {ImageURL.map((image, index) => (
          <SmallImage src={image} key={index} alt="banner" />
        ))}
      </Wrapper>

      <LargeImage src={url} alt="mid-banner" />
    </>
  );
};

export default MidSection;