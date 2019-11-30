import React, { useEffect, useState, useContext } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import useInterval from "../useInterval";

import WebcamContext from "../WebcamProvider";

let model;

const PointPredictor = ({
  shouldClassify = false,
  predictionCallback = null
}) => {
  const [modelReady, setModelReady] = useState(false);
  const [gettingPrediction, setGettingPrediction] = useState(false);
  const webcam = useContext(WebcamContext);

  useEffect(() => {
    if (!modelReady) {
      async function loadModel() {
        model = await tmImage.loadFromFiles({
          model: "../models/point/model.json",
          weights: "../models/point/weights.bin",
          metadata: "../models/point/metadata.json"
        });
        setModelReady(true);
      }
      loadModel();
    }
  }, []);

  // run the webcam image through the image model
  const predict = async () => {
    if (!webcam || !modelReady) {
      return null;
    }
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.current);
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

  return null;
};

export default PointPredictor;
