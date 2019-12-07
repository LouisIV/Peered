import React from "react";
import { Flex, Box } from "rebass";

const StyledCanvas = ({
  borderRadius = 3,
  backgroundColor = "bisque",
  showOverlay = false,
  overlayContent = null,
  overlayBackground = "bisque",
  canvasID = null,
  canvasWidth = 200,
  canvasHeight = 200
}) => {
  return (
    <Box>
      <Flex
        justifyContent={"center"}
        alignItems={"center"}
        width={canvasWidth}
        height={canvasHeight}
        sx={{
          position: "absolute",
          backgroundColor: overlayBackground,
          borderRadius: borderRadius,
          display: showOverlay ? "flex" : "none"
        }}
      >
        {overlayContent}
      </Flex>

      <canvas
        style={{
          backgroundColor: backgroundColor,
          borderRadius: borderRadius
        }}
        id={canvasID}
        height={canvasHeight}
        width={canvasWidth}
      />
    </Box>
  );
};

export default StyledCanvas;
