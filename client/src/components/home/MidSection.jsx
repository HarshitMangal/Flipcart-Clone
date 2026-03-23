import { Box, styled } from '@mui/material';

const ImageURL = [
  'https://rukminim1.flixcart.com/flap/960/960/image/2f30db9425df5cec.jpg?q=50',
  'https://rukminim1.flixcart.com/flap/960/960/image/084789479074d2b2.jpg',
  'https://rukminim1.flixcart.com/flap/960/960/image/1ce0c4c1fb501b45.jpg?q=50'
];

const Wrapper = styled(Box)`
  display: flex;
  margin-top: 20px;
  gap: 10px;
`;

const SmallImage = styled('img')`
  width: 33.3%;
`;

const LargeImage = styled('img')`
  width: 100%;
  margin-top: 20px;
`;

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