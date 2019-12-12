import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

import * as tf from "@tensorflow/tfjs";
import * as tmPose from "@teachablemachine/pose";
import useInterval from "../useInterval";
import WebcamContext from "../WebcamProvider";

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model;

const PosePredictor = ({
  shouldClassify = false,
  predictionCallback = null,
  baseURL = null,
  predictionInterval = 100,
  targetVideoStream = null,
  modelReadyCallback = null
}) => {
  const [modelReady, setModelReady] = useState(false);
  const [gettingPrediction, setGettingPrediction] = useState(false);

  useEffect(() => {
    if (!baseURL) {
      console.error("You must provide a link to a model!");
      return;
    }
    if (!modelReady) {
      const modelURL = baseURL + "model.json";
      const metadataURL = baseURL + "metadata.json";

      console.log(modelURL);

      tmPose
        .load(modelURL, metadataURL)
        .then(loadedModel => {
          model = loadedModel;
          setModelReady(true);
          if (modelReadyCallback) {
            modelReadyCallback();
          }
        })
        .catch(error => {
          console.log(error);
          alert(error);
        });
    }
  }, [baseURL, modelReady]);

  const predict = async () => {
    if (!targetVideoStream.current || !modelReady) {
      console.error("MODEL NOT READY");
      setGettingPrediction(false);
      return null;
    }
    // predict can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(
      targetVideoStream.current
    );

    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    if (predictionCallback) {
      // Return only the highest probable class
      prediction.sort((a, b) => {
        return b.probability - a.probability;
      });

      // Handle img flip
      if (prediction[0].className === "Left") {
        predictionCallback("Right");
      } else if (prediction[0].className === "Right") {
        predictionCallback("Left");
      } else if (prediction[0].className === "Idle") {
        predictionCallback("Forwards");
      } else if (prediction[0].className !== null) {
        predictionCallback(prediction[0].className);
      } else {
        predictionCallback("Forwards");
      }
    } else {
      console.log("Not using prediction!");
    }

    setGettingPrediction(false);
  };

  useInterval(() => {
    if (!gettingPrediction && shouldClassify) {
      setGettingPrediction(true);
      predict();
    }
  }, predictionInterval);

  return null;
};

PosePredictor.propTypes = {};

export default PosePredictor;
