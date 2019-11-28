import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useInterval from "../useInterval";

import { Text } from "rebass";

import * as tf from "@tensorflow/tfjs";
import * as tmPose from "@teachablemachine/pose";

const CANVAS_ID = "poseCanvas";
const CANVAS_HEIGHT = 200;
const CANVAS_WIDTH = 200;

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/4aaH-PVu/";
let model, webcam, ctx, labelContainer, maxPredictions;

const loadPoseModel = async ({
  canvasID = "canvas",
  canvasHeight = 200,
  canvasWidth = 200
}) => {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
  model = await tmPose.load(modelURL, metadataURL);

  if (!model) {
    console.log("Could not load model!");
    return;
  }

  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  webcam.play();
  //   window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  let canvas = document.getElementById(canvasID);

  if (!canvas) {
    console.log("No canvas was found!");
    canvas = document.createElement("canvas");
    canvas.id = canvasID;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");

  //   labelContainer = document.getElementById("label-container");
  //   if (!labelContainer) {
  //     console.log("No label container found!");
  //     labelContainer = document.createElement("div");
  //     labelContainer.id = "label-container";
  //   }

  //   for (let i = 0; i < maxPredictions; i++) {
  //     // and class labels
  //     labelContainer.appendChild(document.createElement("div"));
  //   }
};

const loop = async timestamp => {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
};

const predict = async () => {
  if (!model) {
    console.log("Model has not been loaded!");
    return;
  }

  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  //   for (let i = 0; i < maxPredictions; i++) {
  //     const classPrediction =
  //       prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  //     labelContainer.childNodes[i].innerHTML = classPrediction;
  //   }

  return prediction;

  // finally draw the poses
  //   drawPose(pose);
};

const drawPose = pose => {
  ctx.drawImage(webcam.canvas, 0, 0);
  // draw the keypoints and skeleton
  if (pose) {
    const minPartConfidence = 0.5;
    tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
    tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
  }
};

const PosePredictor = ({ shouldClassify = false }) => {
  const [poseModelLoaded, setPoseModelLoaded] = useState(false);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    if (!poseModelLoaded) {
      async function __loadPoseModel() {
        console.log("Loading Pose Model");
        loadPoseModel({
          canvasID: CANVAS_ID,
          canvasHeight: CANVAS_HEIGHT,
          canvasWidth: CANVAS_WIDTH
        })
          .then(setPoseModelLoaded(true))
          .catch(error => {
            console.log(error);
          });
      }
      __loadPoseModel();
    }
  }, []);

  useInterval(() => {
    if (poseModelLoaded && shouldClassify) {
      webcam.update(); // update the webcam frame
      predict()
        .then(prediction => {
          setPredictions(prediction);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, 500);

  //   const updateLabels = async timestamp => {
  //     webcam.update(); // update the webcam frame
  //     await predict();

  //     if (shouldClassify) {
  //       window.requestAnimationFrame(updateLabels);
  //     }
  //   };

  //   if (poseModelLoaded && shouldClassify) {
  //     updateLabels();
  //   }

  return (
    <React.Fragment>
      <canvas
        id={CANVAS_ID}
        height={CANVAS_HEIGHT}
        width={CANVAS_WIDTH}
      ></canvas>
      {predictions
        ? predictions.map(item => {
            return (
              <Text>{item.className + ": " + item.probability.toFixed(2)}</Text>
            );
          })
        : null}
    </React.Fragment>
  );
};

PosePredictor.propTypes = {};

export default PosePredictor;
