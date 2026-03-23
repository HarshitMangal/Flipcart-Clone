import Slide from "./slide";
import { Box, styled } from "@mui/material";

const Component = styled(Box)`
  display: flex;
`;

const Leftcomponent = styled(Box)`
  width: 83%;
`;

const Rightcomponent = styled(Box)`
  margin-top: 10px;
  background: #FFFFFF;
  width: 17%;
  margin-left: 10px;
  padding: 5px;
  text-align: center;
`;

const Midslide = ({ products, title, timer }) => {
  const adURL =
    "https://rukminim1.flixcart.com/flap/464/708/image/633789f7def60050.jpg?q=70";

  return (
    <Component>
      <Leftcomponent>
        <Slide products={products} title={title} timer={timer} />
      </Leftcomponent>

      <Rightcomponent>
        <img src={adURL} alt="ad" style={{ width: 217 }} />
      </Rightcomponent>
    </Component>
  );
};

export default Midslide;