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
  modelURL = null,
  predictionInterval = 100
}) => {
  const [modelReady, setModelReady] = useState(false);
  const [gettingPrediction, setGettingPrediction] = useState(false);
  const webcam = useContext(WebcamContext);

  useEffect(() => {
    if (!modelURL) {
      console.error("You must provide a link to a model!");
      return;
    }
    if (!modelReady) {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";
      tmPose
        .load(modelURL, metadataURL)
        .then(loadedModel => {
          model = loadedModel;
          console.log(model);
          setModelReady(true);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, []);

  const predict = async () => {
    if (!webcam || !modelReady) {
      return null;
    }
    // predict can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.current);
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
  }, predictionInterval);

  return null;
};

PosePredictor.propTypes = {};

export default PosePredictor;
