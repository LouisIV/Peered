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
  displayVideo,
  dependentRef = null,
  onLoadedData = null
}) => {
  const playerRef = useRef();

  useEffect(() => {
    if (displayVideo) {
      console.log(displayVideo);

      if (dependentRef == null) {
        playerRef.current.srcObject = displayVideo;
        playerRef.current.play();
      } else if (dependentRef != null) {
        dependentRef.current.srcObject = displayVideo;
        dependentRef.current.play();
      } else {
        console.warn("could not set video!");
      }
    }
  }, [playerRef, displayVideo, dependentRef]);
  return (
    <Box width={videoWidth} height={videoHeight} margin={3}>
      {showOverlay ? (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          width={videoWidth}
          height={videoHeight}
          sx={{
            zIndex: 10,
            position: "absolute",
            backgroundColor: overlayBackground,
            borderRadius: borderRadius,
            display: showOverlay ? "flex" : "none",
            border: "solid",
            borderWidth: 5,
            borderColor: "black"
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
        ref={dependentRef || playerRef}
        id={videoID}
        height={videoHeight}
        width={videoWidth}
        playsInline={true}
        onLoadedData={() => {
          if (onLoadedData) {
            onLoadedData();
          }
        }}
      />
    </Box>
  );
};

export default StyledVideo;
