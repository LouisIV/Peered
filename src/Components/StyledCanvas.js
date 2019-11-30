import React, { useState } from "react";
import { CANVAS_ID, CANVAS_HEIGHT, CANVAS_WIDTH } from "./PosePredictor";
import { Flex, Box, Button, Heading, Text } from "rebass";

const StyledCanvas = ({
  borderRadius = 3,
  backgroundColor = "bisque",
  showOverlay = false,
  overlayContent = null,
  overlayBackground = "bisque",
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT
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
        id={CANVAS_ID}
        height={canvasHeight}
        width={canvasWidth}
      />
    </Box>
  );
};

export default StyledCanvas;
