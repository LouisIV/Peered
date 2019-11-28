import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import useInterval from "../useInterval";

import WebcamContext from "../WebcamProvider";

import BarChart from "./BarChart";

import { Text } from "rebass";

import * as tf from "@tensorflow/tfjs";
import * as tmPose from "@teachablemachine/pose";

export const CANVAS_ID = "poseCanvas";
export const CANVAS_HEIGHT = 500;
export const CANVAS_WIDTH = 500;

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/4aaH-PVu/";
let model, webcam, ctx, labelContainer, maxPredictions;

// const loadPoseModel = async ({
//   canvasID = "canvas",
//   canvasHeight = CANVAS_HEIGHT,
//   canvasWidth = CANVAS_WIDTH
// }) => {
//   const modelURL = URL + "model.json";
//   const metadataURL = URL + "metadata.json";

//   // load the model and metadata
//   // Refer to tmPose.loadFromFiles() in the API to support files from a file picker
//   model = await tmPose.load(modelURL, metadataURL);

//   if (!model) {
//     console.log("Could not load model!");
//     return;
//   }

//   maxPredictions = model.getTotalClasses();

//   // Convenience function to setup a webcam
//   const flip = true; // whether to flip the webcam
//   webcam = new tmPose.Webcam(canvasWidth, canvasHeight, flip); // width, height, flip
//   await webcam.setup(); // request access to the webcam
//   webcam.play();
//   //   window.requestAnimationFrame(loop);

//   let canvas = document.getElementById(canvasID);

//   canvas.width = canvasWidth;
//   canvas.height = canvasHeight;
//   ctx = canvas.getContext("2d");
// };

// const loop = async timestamp => {
//   webcam.update(); // update the webcam frame
//   await predict();
//   window.requestAnimationFrame(loop);
// };

const PosePredictor = ({
  shouldClassify = false,
  predictionCallback = null,
  shouldUpdateWebcam = false
}) => {
  const [modelReady, setModelReady] = useState(false);
  const [gettingPrediction, setGettingPrediction] = useState(false);
  const webcam = useContext(WebcamContext);

  //   const [poseModelLoaded, setPoseModelLoaded] = useState(false);
  //   const [predictions, setPredictions] = useState(null);
  //   const [updatingWebcam, setUpdatingWebcam] = useState(false);
  //   const [poseKeypoints, setPoseKeypoints] = useState(null);
  //   const [pose, setPose] = useState(null);

  useEffect(() => {
    if (!modelReady) {
      async function loadModel() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmPose.load(modelURL, metadataURL);
        setModelReady(true);
      }
      loadModel();
    }
  }, []);

  const predict = async () => {
    // predict can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);
    if (!predictionCallback) {
      predictionCallback(prediction);
    }
    setGettingPrediction(false);
  };

  useInterval(() => {
    if (!gettingPrediction && shouldClassify) {
      setGettingPrediction(true);
      predict();
    }
  }, 500);

  //   useInterval(() => {
  //     if (webcam && shouldClassify) {
  //       webcam.update(); // update the webcam frame
  //       predict()
  //         .then(result => {
  //           const { prediction } = result;
  //           //   if (pose) {
  //           //     setPose(pose);
  //           //     // setPoseKeypoints(pose.keypoints);
  //           //   }
  //           setPredictions(prediction);
  //           if (predictionCallback != null) {
  //             predictionCallback(prediction);
  //           }
  //         })
  //         .catch(error => {
  //           console.error(error);
  //         });
  //     }
  //   }, 500);

  //   const updateWebcam = () => {
  //     if (ctx && webcam && shouldUpdateWebcam) {
  //       webcam.update(); // update the webcam frame
  //       ctx.drawImage(webcam.canvas, 0, 0);
  //       //   if (pose) {
  //       //     console.log("DRAWING KEYPOINTS");
  //       //     // console.log(poseKeypoints);
  //       //     const minPartConfidence = 0.5;
  //       //     tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
  //       //     tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
  //       //   }
  //     }
  //     window.requestAnimationFrame(updateWebcam);
  //   };

  //   const predict = async () => {
  //     if (!model) {
  //       console.log("Model has not been loaded!");
  //       return;
  //     }

  //     // Prediction #1: run input through posenet
  //     // estimatePose can take in an image, video or canvas html element
  //     const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  //     // Prediction 2: run input through teachable machine classification model
  //     const prediction = await model.predict(posenetOutput);

  //     //   for (let i = 0; i < maxPredictions; i++) {
  //     //     const classPrediction =
  //     //       prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  //     //     labelContainer.childNodes[i].innerHTML = classPrediction;
  //     //   }

  //     return { prediction, pose };
  //   };

  return (
    <React.Fragment>
      {/* {predictions ? (
        <BarChart
          height={200}
          width={600}
          dataKey={"amt"}
          data={predictions.map(item => {
            return {
              name: item.className,
              amt: item.probability.toFixed(2)
            };
          })}
        />
      ) : null} */}
      {predictions
        ? predictions.map(item => {
            return (
              <Text key={item.className}>
                {item.className + ": " + item.probability.toFixed(2)}
              </Text>
            );
          })
        : null}
    </React.Fragment>
  );
};

PosePredictor.propTypes = {};

export default PosePredictor;
