import React from "react";
import { Flex, Box, Button, Heading, Text } from "rebass";
import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";

const fadeAnimation = keyframes`${fadeIn}`;

const FlexFade = styled(Flex)`
  animation: 1s ${fadeAnimation};
`;

export const UserScore = ({ message = "" }) => {
  return (
    <FlexFade justifyContent={"center"} m={[2, 3]}>
      <Heading fontSize={[5, 6, 7]} color={"black"}>
        <p>{message}</p>
      </Heading>
    </FlexFade>
  );
};
