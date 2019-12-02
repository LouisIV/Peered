import React, { useRef, useEffect, useContext } from "react";
import { Flex, Box } from "rebass";
import WebcamContext from "../WebcamProvider";

const StyledVideo = ({
  borderRadius = 3,
  backgroundColor = "bisque",
  showOverlay = false,
  overlayContent = null,
  overlayBackground = "bisque",
  videoWidth = 500,
  videoHeight = 500,
  videoID = "styled-video",
  displayVideo
}) => {
  const playerRef = useRef();

  useEffect(() => {
    if (displayVideo) {
      console.log(displayVideo);
      playerRef.current.srcObject = displayVideo;
      playerRef.current.play();
    }
  }, [playerRef, displayVideo]);
  return (
    <Box width={videoWidth} height={videoHeight} margin={3}>
      {showOverlay ? (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          width={videoWidth}
          height={videoHeight}
          sx={{
            position: "absolute",
            backgroundColor: overlayBackground,
            borderRadius: borderRadius,
            display: showOverlay ? "flex" : "none",
            border: "solid",
            borderWidth: 5,
            borderColor: "primary"
          }}
        >
          {overlayContent}
        </Flex>
      ) : null}
      <video
        style={{
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
          height: videoHeight,
          objectFit: "cover",
          zIndex: -100,
          backgroundSize: "cover",
          overflow: "hidden"
        }}
        autoPlay={true}
        ref={playerRef}
        id={videoID}
        height={videoHeight}
        width={videoWidth}
      />
    </Box>
  );
};

export default StyledVideo;
