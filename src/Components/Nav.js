import React, { useState } from "react";
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";

import { Flex, Text, Box, Link, Button } from "rebass";
import { GoodEmoji } from "./Emoji";

export default function Nav() {
  const [showModal, setShowModal] = useState(false);
  return (
    <Flex px={2} color="white" bg="black" alignItems="center">
      <Text p={2} fontWeight="bold">
        ISH!
      </Text>

      <Button
        backgroundColor="transparent"
        onClick={() => {
          console.log("Modal State", showModal);
          setShowModal(!showModal);
        }}
        zIndex={110}
      >
        <Text>HOW TO PLAY</Text>
      </Button>

      <Box mx="auto" />
      <Link variant="nav" href="https://github.com/LouisIV/Peered">
        About
      </Link>

      {showModal ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          width="100vw"
          height="100vh"
          backgroundColor="black"
          flexDirection="column"
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 110
          }}
          m={0}
          p={0}
        >
          <Flex flexDirection="row" justifyContent="flex-start" width="80%">
            <Button
              backgroundColor="transparent"
              onClick={() => {
                console.log("Modal State", showModal);
                setShowModal(!showModal);
              }}
              zIndex={110}
            >
              <Text>BACK</Text>
            </Button>
          </Flex>
          <Box
            minHeight={500}
            backgroundColor="black"
            minWidth={200}
            sx={{
              width: "80%",
              position: "relative",
              overflow: "hidden",
              "& > iframe": {
                position: "absolute",
                width: "100%",
                height: "100%"
              }
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Gb9qb5_R-10"
              frameBorder="0"
              allowFullScreen={false}
            />
          </Box>
          <Flex
            minHeight={500}
            backgroundColor="black"
            minWidth={200}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              width: "80%",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <GoodEmoji />
            <ThemeProvider theme={theme}>
              <Text
                fontSize={[2, 3, 4]}
                color="white"
                fontWeight={"bold"}
                mb={1}
              >
                Move your head as soon as your hear the clicking!
              </Text>
              <Text
                fontSize={[2, 3, 4]}
                color="white"
                fontWeight={"bold"}
                mb={1}
              >
                Exaggerate your gestures!
              </Text>
              <Text
                fontSize={[2, 3, 4]}
                color="white"
                fontWeight={"bold"}
                mb={1}
              >
                Have Fun!
              </Text>
            </ThemeProvider>
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
}
