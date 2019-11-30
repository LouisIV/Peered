import React, { useState, useEffect, useRef } from "react";

// Theming
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";

// 3rd Party Components
import { Flex, Box, Button, Heading, Text } from "rebass";
import Peer from "peerjs";

// Custom Components
import Nav from "./Components/Nav";
import StyledCanvas from "./Components/StyledCanvas";
import Emoji from "./Components/Emoji";
import PosePredictor, { CANVAS_ID } from "./Components/PosePredictor";

// Custom Hooks
import useInterval from "./useInterval";
import PointPredictor from "./Components/PointPredict";
import { WebcamProvider } from "./WebcamProvider";
import { ConnectionProvider } from "./ConnectionProvider";

import StyledVideo from "./Components/StyledVideo";

// Quick Components
const GoodEmoji = () => {
  return <Emoji symbol="👍" label="thumbs-up" fontSize={"5em"} />;
};

const BadEmoji = () => {
  return <Emoji symbol="👎" label="thumbs-down" fontSize={"5em"} />;
};

// Constant Defs.
const STATE = {
  GOOD: "GOOD",
  BAD: "BAD",
  LOADING: "LOADING",
  COUNTDOWN: "COUNTDOWN"
};

const CONNECTION_STATE = {
  DOWN: "DOWN",
  SETUP: "SETUP",
  LOST: "LOST",
  DESTROYED: "DESTROYED",
  CONNECTED: "CONNECTED"
};

const DIRECTIONS = {
  LEFT: "Left",
  RIGHT: "Right",
  BACK: "Back",
  FORWARDS: "Forwards"
};

const MODELS = {
  pose1: "https://teachablemachine.withgoogle.com/models/4aaH-PVu/",
  pose2: "https://teachablemachine.withgoogle.com/models/Nl9pauCf/"
};

const PEER_JS_KEY = "lwjd5qra8257b9";

function App() {
  /* HOOKS */
  const [shouldClassify, setShouldClassify] = useState(false);
  const [currentState, setCurrentState] = useState(STATE.COUNTDOWN);
  const [usingTimer, setUsingTimer] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [direction, setDirection] = useState(DIRECTIONS.LEFT);
  const [predictions, setPredictions] = useState(null);
  const videoRef = useRef();

  const [peer, setPeer] = useState(null);
  const [peerSetup, setPeerSetup] = useState(false);

  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.DOWN);
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);

  const [lastPeerId, setLastPeerID] = useState(null);

  const [remotePeerID, setRemotePeerID] = useState(null);

  const [call, setCall] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      });
  }, [videoRef]);

  const ConnectToPeer = peerID => {
    if (!peer) {
      console.warn("Tried to connect to ''", peerID, "' without a peer!");
      return;
    }

    if (!peerID) {
      console.warn("Tried to connect with a valid PeerID!");
      return;
    }

    setConnection(peer.connect(peerID));
  };

  const SetupPeer = () => {
    let newPeer = new Peer({ key: PEER_JS_KEY });

    if (newPeer && !peerSetup) {
      newPeer.on("open", id => {
        // Workaround for peer.reconnect deleting previous id
        if (newPeer.id === null) {
          console.log("Received null id from peer open");
          newPeer.id = lastPeerId;
        } else {
          setLastPeerID(newPeer.id);
        }
      });

      // Handle receiving a connection
      newPeer.on("connection", conn => {
        // Allow only a single connection
        if (connection) {
          conn.on("open", function() {
            conn.send("Already connected to another client");
            setTimeout(function() {
              conn.close();
            }, 500);
          });
          return;
        }

        setConnection(conn);
        setConnectionState(CONNECTION_STATE.CONNECTED);

        // Setup this new connection
        SetupConnection();
      });

      // Handle receiving a call
      newPeer.on("call", call => {
        // Assign our call object
        setCall(call);

        // Setup this call
        SetupCall();
      });

      newPeer.on("disconnected", () => {
        setConnectionState(CONNECTION_STATE.LOST);
        console.log("Connection lost. Please reconnect");

        if (shouldReconnect) {
          // Workaround for peer.reconnect deleting previous id
          newPeer.id = lastPeerId;
          newPeer._lastServerId = lastPeerId;
          newPeer.reconnect();
        }
      });

      newPeer.on("close", () => {
        setConnection(null);
        setConnectionState(CONNECTION_STATE.DESTROYED);
        console.log("Connection destroyed");
      });

      newPeer.on("error", err => {
        console.log(err);
        alert("" + err);
      });

      setPeer(newPeer);
      setPeerSetup(true);
    }
  };

  const SetupConnection = () => {
    connection.on("open", () => {
      setConnectionState(CONNECTION_STATE.UP);

      // Receive messages
      connection.on("data", data => {
        ReceiveMessage(data);
      });
    });

    // Set our remote peer id
    setRemotePeerID(connection.peer.id);

    console.log("Connected to: " + connection.peer);
  };

  const ReceiveMessage = message => {
    console.log(message);
  };

  const SendMessage = message => {
    if (!connection) {
      console.warn("Tried to send a message without a connection.");
      return;
    }

    if (connectionState !== CONNECTION_STATE.CONNECTED) {
      console.warn(connectionState, "!== CONNECTION_STATE.CONNECTED");
      return;
    }

    connection.send(message);
  };

  const SetupCall = () => {
    call.on("stream", remoteStream => {
      // Show stream in some <video> element.
      setMediaStream(remoteStream);
    });

    // Answer the call, providing our mediaStream
    call.answer(videoRef.current.srcObject);
  };

  useInterval(() => {
    if (usingTimer) {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setUsingTimer(false);
      }
    }
  }, 500);

  /* INTERNALS */

  const GetPrediction = () => {};

  const GetOverlayContent = () => {
    if (currentState !== STATE.COUNTDOWN) {
      if (currentState === STATE.GOOD) {
        return <GoodEmoji />;
      } else if (currentState === STATE.BAD) {
        return <BadEmoji />;
      } else {
        return <BadEmoji />;
      }
    }
    return (
      <Heading fontSize={[5, 6, 7]} color={"primary"}>
        {countdown > 0 ? countdown : `"Lean ${direction}!"`}
      </Heading>
    );
  };

  const GetOverlayColor = () => {
    if (currentState !== STATE.COUNTDOWN) {
      if (currentState === STATE.GOOD) {
        return "lightgreen";
      } else if (currentState === STATE.BAD) {
        return "lightred";
      } else {
        return "blue";
      }
    }
    return "transparent";
  };
  const canvasWidth = 500;
  const canvasHeight = 500;

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider
        value={{
          connectionState: connectionState,
          connectToPeer: ConnectToPeer,
          remotePeer: remotePeerID
        }}
      >
        <Nav />
      </ConnectionProvider>
      <Flex flexDirection="column" marginLeft={0} marginRight={0}>
        <Box>
          <Flex justifyContent={"center"} m={[2, 3]}>
            <Heading fontSize={[5, 6, 7]} color={"primary"}>
              {countdown > 0 ? countdown : '"GO!"'}
            </Heading>
          </Flex>
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
        <WebcamProvider value={videoRef}>
          <StyledVideo
            showOverlay={currentState != null}
            overlayContent={currentState != null ? <GetOverlayContent /> : null}
            borderRadius={5}
            overlayBackground={currentState != null ? GetOverlayColor : null}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
          {/* <PointPredictor /> */}
          <PosePredictor
            shouldClassify={shouldClassify}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            shouldUpdateWebcam={true}
            predictionCallback={prediction => {
              setPredictions(prediction);
            }}
          />
        </WebcamProvider>
        <Box>
          <Flex justifyContent={"center"} alignItems={"center"} m={[2, 3]}>
            <Button
              onClick={() => {
                setShouldClassify(!shouldClassify);
              }}
            >
              <Text>
                {shouldClassify ? "STOP CLASSIFYING" : "START CLASSIFYING"}
              </Text>
            </Button>
            <Button
              onClick={() => {
                setUsingTimer(!usingTimer);
              }}
            >
              <Text>{usingTimer ? "STOP COUNTDOWN" : "START COUNTDOWN"}</Text>
            </Button>
          </Flex>
        </Box>
      </Flex>
    </ThemeProvider>
  );
}

export default App;
