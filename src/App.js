import React, { useState, useEffect, useRef } from "react";
import { pickDirection } from "./directionGen.js";
// Theming
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";

// 3rd Party Components
import { Flex, Box, Button, Heading, Text } from "rebass";
import Peer from "peerjs";
import generate from "project-name-generator";

// Custom Components
import Nav from "./Components/Nav";
import { GoodEmoji, BadEmoji, EvalEmoji, SorryEmoji } from "./Components/Emoji";
import PosePredictor from "./Components/PosePredictor";

// Custom Hooks
import useInterval from "./useInterval";
import { WebcamProvider } from "./WebcamProvider";

import StyledVideo from "./Components/StyledVideo";
import { Input } from "@rebass/forms";
import { Tick } from "./Tick";
import { Highest } from "./helpers";
import { UserScore } from "./Components/UserScore.js";
import Taunts from "./Taunts";
import GoodResponses from "./GoodResponses.js";
import { Bell } from "./Bell";
import { Buzzer } from "./Buzzer";

// Constant Defs.
const STATE = {
  GOOD: "GOOD",
  BAD: "BAD",
  LOADING: "LOADING",
  COUNTDOWN: "COUNTDOWN",
  EVALUATING: "EVALUATING",
  SORRY: "SORRY"
};

const CONNECTION_STATE = {
  DOWN: "DOWN",
  SETUP: "SETUP",
  LOST: "LOST",
  DESTROYED: "DESTROYED",
  CONNECTED: "CONNECTED"
};

export const DIRECTIONS = {
  LEFT: "Left",
  RIGHT: "Right",
  FORWARDS: "Forwards",
  DOWN: "Down",
  UP: "Up"
};

const MODELS = {
  pose1: "https://teachablemachine.withgoogle.com/models/4aaH-PVu/",
  pose2: "https://teachablemachine.withgoogle.com/models/Nl9pauCf/"
};

const VIDEO_PREVIEW_DIMENSIONS = {
  width: 200,
  height: 200
};

function App() {
  /* HOOKS */
  const [shouldClassify, setShouldClassify] = useState(false);
  const [currentState, setCurrentState] = useState(STATE.LOADING);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [predictions, setPredictions] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [chosenDirection, setChosenDirection] = useState(DIRECTIONS.UP);
  const [userVideo, setUserVideo] = useState(null);
  const [userscore, setUserscore] = useState(0);
  const [modelReady, setModelReady] = useState(false);

  const [userMessage, setUserMessage] = useState("");
  const [lockUserMessage, setLockUserMessage] = useState(false);

  const playerRef = useRef(null);

  const [ticking, setTicking] = useState(null);

  useEffect(() => {
    if (!userVideo) {
      let getUserMedia;
      if (navigator.mediaDevices) {
        getUserMedia = navigator.mediaDevices.getUserMedia;
      } else {
        getUserMedia =
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      }

      if (!getUserMedia) {
        console.warn("It looks like your browser is not supported!");
      }

      getUserMedia({ video: true, audio: false })
        .then(stream => {
          console.log("Setting userVideo to", stream);
          setUserVideo(stream);
          return stream;
        })
        .catch(error => {
          console.log("Something went wrong", error);
        });
    }
  }, [userVideo]);

  useInterval(() => {
    if (currentState === STATE.COUNTDOWN) {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        setLockUserMessage(false);
        setCurrentState(STATE.EVALUATING);
        setTicking(false);
        setTimeout(() => {
          returnPrediction();
        }, 500);
      }
    }
    if (ticking) {
      Tick.play();
    }
  }, 500);

  /* INTERNALS */

  const returnPrediction = () => {
    const dir = pickDirection();
    setChosenDirection(dir);
    console.log("Game Chose", dir);
    if (dir === prediction) {
      // Turn off the classifier
      // setShouldClassify(false);

      // Update the UI
      setLockUserMessage(false);
      Buzzer.play();
      setCurrentState(STATE.BAD);

      // Give the user a message
      setCountdown("GAME OVER");
    } else {
      // Update the UI
      setLockUserMessage(false);
      setCurrentState(STATE.GOOD);
      ScoreUserGood();
      setTimeout(StartRound, 800);
    }
  };

  const ScoreUserGood = () => {
    Bell.play();
    setUserscore((userscore || 0) + 1);
  };

  const StartRound = () => {
    // Start the classifier
    setShouldClassify(true);
    setPredictions([]);
    setLockUserMessage(false);
    setCurrentState(STATE.COUNTDOWN);
    setTicking(true);
    setCountdown(5);
  };

  const RunTurn = () => {
    // Reset the predictions array
    setPredictions([]);
  };

  useEffect(() => {}, [modelReady]);

  const GetOverlayContent = () => {
    if (currentState !== STATE.COUNTDOWN) {
      if (currentState === STATE.LOADING) {
        return (
          <Button
            backgroundColor="black"
            color="white"
            onClick={() => {
              if (!modelReady) {
                return;
              }
              setLockUserMessage(false);
              setCurrentState(STATE.COUNTDOWN);
              setShouldClassify(true);
              setTicking(true);
              setCountdown(5);
              setButtonDisabled(true);
            }}
            disabled={buttonDisabled}
          >
            <Text>{modelReady ? "START GAME" : "LOADING"}</Text>
          </Button>
        );
      } else if (currentState === STATE.SORRY) {
        return (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <SorryEmoji />

            <Text fontSize={[2, 3, 4]} fontWeight={"bold"} color="white" mb={1}>
              {"Sorry About That"}
            </Text>
          </Flex>
        );
      } else if (currentState === STATE.GOOD) {
        return <GoodEmoji />;
      } else if (currentState === STATE.BAD) {
        return (
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <BadEmoji />
            <Text fontSize={[2, 3, 4]} fontWeight={"bold"} color="white" mb={1}>
              {"I KNEW YOU'D LOOK"} {chosenDirection.toUpperCase()}
            </Text>

            <Text fontSize={[1, 2]} color="white" mb={1}>
              {"OR"}
            </Text>
            <Text fontSize={[2, 3, 4]} fontWeight={"bold"} color="white" mb={1}>
              {"ACTUALLY I LOOKED"}
            </Text>
            <Flex flexDirection="row">
              {Object.values(DIRECTIONS).map(direction => {
                return (
                  <Button
                    bg={"white"}
                    color={"black"}
                    key={direction}
                    borderWidth={3}
                    m={1}
                    onClick={() => {
                      setLockUserMessage(false);
                      setCurrentState(STATE.SORRY);
                      setTimeout(() => {
                        ScoreUserGood();
                        StartRound();
                      }, 500);
                    }}
                    zIndex={10}
                  >
                    <Text>{direction}</Text>
                  </Button>
                );
              })}
              <Button
                backgroundColor="white"
                color="black"
                onClick={() => {
                  setLockUserMessage(false);
                  setCurrentState(STATE.COUNTDOWN);
                  setShouldClassify(true);
                  setTicking(true);
                  setCountdown(5);
                  setButtonDisabled(true);
                }}
                disabled={buttonDisabled}
                m={1}
                mb={2}
              >
                <Text zIndex={10}>{"TRY AGAIN"}</Text>
              </Button>
            </Flex>
          </Flex>
        );
      } else if (currentState === STATE.EVALUATING) {
        return <EvalEmoji />;
      } else {
        return <BadEmoji />;
      }
    } else {
      return (
        <Heading fontSize={[4, 5, 6]} color={"black"} textAlign="center">
          {countdown}
        </Heading>
      );
    }

    return null;
  };

  const GetOverlayColor = () => {
    if (currentState !== STATE.LOADING) {
      if (currentState === STATE.GOOD) {
        return "rgba(145, 255, 36, 0.47)";
      } else if (currentState === STATE.BAD) {
        return "rgba(255, 36, 36, 0.47)";
      } else {
        return "rgba(255, 255, 255, 0.36)";
      }
    }
    return "transparent";
  };

  const canvasWidth = 500;
  const canvasHeight = 500;

  useEffect(() => {
    switch (currentState) {
      case STATE.LOADING:
        setUserMessage("GET READY TO LOSE!");
        break;

      case STATE.BAD:
        if (lockUserMessage) {
          return;
        }
        setUserMessage(Taunts[(Taunts.length * Math.random()) | 0]);
        setLockUserMessage(true);
        break;

      case STATE.GOOD:
        if (lockUserMessage) {
          return;
        }
        setUserMessage(
          GoodResponses[(GoodResponses.length * Math.random()) | 0]
        );
        setLockUserMessage(true);
        break;

      case STATE.SORRY:
        setUserMessage("I Swear This Never Happens");
        break;

      case STATE.EVALUATING:
        setUserMessage("HOLD ON I'M THINKING!!");
        break;

      default:
      case STATE.COUNTDOWN:
        setUserMessage(
          `YOU'RE LOOKING ${prediction ? prediction.toUpperCase() : "?"}`
        );
        break;
    }
  }, [lockUserMessage, userMessage, prediction, currentState]);

  const getTitleMessage = () => {
    switch (currentState) {
      case STATE.LOADING:
        return "Welcome To ISH!";
      default:
        return `Your Score: ${userscore > 0 ? userscore : ""}`;
    }
  };

  const titleMessage = getTitleMessage();

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <Flex flexDirection="column" marginLeft={0} marginRight={0}>
        <Box>
          <UserScore message={titleMessage} />
        </Box>
        <Box>
          <Flex justifyContent={"center"} alignItems={"center"} m={[2, 3]}>
            {/* <StyledCanvas
              showOverlay={currentState != null}
              overlayContent={
                currentState != null ? <GetOverlayContent /> : null
              }
              borderRadius={5}
              overlayBackground={currentState != null ? GetOverlayColor : null}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            /> */}
          </Flex>
        </Box>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize={[2, 3, 4]} fontWeight={"bold"} color="black" mb={1}>
            {userMessage}
          </Text>
          <StyledVideo
            dependentRef={playerRef}
            showOverlay={currentState != null}
            overlayContent={currentState != null ? <GetOverlayContent /> : null}
            borderRadius={5}
            overlayBackground={currentState != null ? GetOverlayColor : null}
            displayVideo={userVideo}
          />
        </Flex>
        <PosePredictor
          targetVideoStream={playerRef}
          baseURL={MODELS.pose2}
          shouldClassify={shouldClassify}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          shouldUpdateWebcam={true}
          modelReadyCallback={() => {
            setModelReady(true);
          }}
          predictionCallback={prediction => {
            // Copy current predictions array
            let newPredictions = predictions;

            if (!newPredictions) {
              newPredictions = [];
            }

            // Enforce maximum size
            if (newPredictions.length > 5) {
              // Remove the extra entries
              newPredictions.shift();
            }

            // Append the new entry
            newPredictions.push(prediction);

            // Update the array
            setPredictions(newPredictions);

            // Update the running prediction
            setPrediction(Highest(newPredictions));
          }}
        />
      </Flex>
    </ThemeProvider>
  );
}

export default App;
