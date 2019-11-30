import React, { useContext } from "react";
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
  videoID = "styled-video"
}) => {
  const videoRef = useContext(WebcamContext);
  return (
    <Box>
      <Flex
        justifyContent={"center"}
        alignItems={"center"}
        width={videoWidth}
        height={videoHeight}
        sx={{
          position: "absolute",
          backgroundColor: overlayBackground,
          borderRadius: borderRadius,
          display: showOverlay ? "flex" : "none"
        }}
      >
        {overlayContent}
      </Flex>

      <video
        style={{
          backgroundColor: backgroundColor,
          borderRadius: borderRadius
        }}
        ref={videoRef}
        id={videoID}
        height={videoHeight}
        width={videoWidth}
      />
    </Box>
  );
};

export default StyledVideo;
