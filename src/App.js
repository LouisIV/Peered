import React, { useState, useEffect, useRef } from "react";

// Theming
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";

// 3rd Party Components
import { Flex, Box, Button, Heading, Text } from "rebass";
import Peer from "peerjs";
import generate from "project-name-generator";

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
import { Input } from "@rebass/forms";

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

const VIDEO_PREVIEW_DIMENSIONS = {
  width: 200,
  height: 200
};

function App() {
  /* HOOKS */
  const [shouldClassify, setShouldClassify] = useState(false);
  const [currentState, setCurrentState] = useState(STATE.COUNTDOWN);
  const [usingTimer, setUsingTimer] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [direction, setDirection] = useState(DIRECTIONS.LEFT);
  const [predictions, setPredictions] = useState(null);
  const [userVideo, setUserVideo] = useState(null);
  const [hasUserVideo, setHasUserVideo] = useState(false);

  const [peer, setPeer] = useState(null);
  const [peerSetup, setPeerSetup] = useState(false);

  const [connection, setConnection] = useState(null);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.DOWN);
  const [shouldReconnect, setShouldReconnect] = useState(true);

  const [remoteVideo, setRemoteVideo] = useState(null);

  const [lastPeerId, setLastPeerID] = useState(null);

  const [remotePeerID, setRemotePeerID] = useState(null);

  const [call, setCall] = useState(null);

  const GetUserVideo = () => {
    if (!hasUserVideo) {
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

      getUserMedia({ video: true, audio: true })
        .then(stream => {
          console.log("Setting userVideo to", stream);
          setUserVideo(stream);
          return stream;
        })
        .catch(error => {
          console.log("Something went wrong", error);
        });
      setHasUserVideo(true);
    }
  };

  useEffect(() => {
    if (!userVideo) {
      GetUserVideo();
    }
    if (userVideo && !peer) {
      SetupPeer();
    }
  }, [userVideo, peer]);

  // useEffect(() => {
  //   if (!hasUserVideo) {
  //     var getUserMedia =
  //       navigator.mediaDevices.getUserMedia ||
  //       navigator.webkitGetUserMedia ||
  //       navigator.mozGetUserMedia;
  //     getUserMedia({ video: true, audio: true })
  //       .then(stream => {
  //         console.log("Setting userVideo to", stream);
  //         setUserVideo(stream);
  //       })
  //       .catch(error => {
  //         console.log("Something went wrong", error);
  //       });
  //     setHasUserVideo(true);
  //     SetupPeer();
  //   }
  // }, [userVideo, hasUserVideo]);

  const ConnectToPeer = peerID => {
    if (!peer) {
      console.warn("Tried to connect to ''", peerID, "' without a peer!");
      return;
    }

    if (!peerID) {
      console.warn("Tried to connect without a valid PeerID!");
      return;
    }

    setConnection(peer.connect(peerID));
  };

  const CallPeer = () => {
    if (!remotePeerID) {
      console.warn("Tried to make a call without a remotePeerID!");
      return;
    }
    if (!peer) {
      console.warn("Tried to call ''", remotePeerID, "' without a peer!");
      return;
    }
    if (!connection) {
      console.warn("Tried to start a call without a valid connection!");
      return;
    }

    console.log("Starting call with '", remotePeerID, "'");
    const newCall = peer.call(remotePeerID, userVideo);

    newCall.on("stream", remoteStream => {
      console.log("Receiving remote stream from", newCall.peer);
      setRemoteVideo(remoteStream);
    });

    setCall(newCall);
  };

  const SetupPeer = () => {
    console.log("setting up new peer!");

    const newPeerID = generate({ words: 2 }).dashed;
    setLastPeerID(newPeerID);
    let newPeer = new Peer(newPeerID, {
      host: "peerjs.lliv.space",
      path: "/broker",
      port: 9000
    });

    // let newPeer = new Peer(newPeerID);

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
      if (!conn) {
        console.log("Connection was called with no connection!");
        return;
      }

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
      SetupConnection(conn);
    });

    // Handle receiving a call
    newPeer.on("call", newCall => {
      if (call) {
        console.log("Already in a call");
        return;
      }
      console.log(newCall);
      console.log("Being called by", newCall.peer);

      // Setup this call
      SetupCall(newCall);
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
  };

  const SetupConnection = conn => {
    // There is a chance that the connection won't be set yet
    let currentConnection = conn;
    if (connection != null) {
      currentConnection = connection;
    }

    currentConnection.on("open", () => {
      setConnectionState(CONNECTION_STATE.UP);

      // Receive messages
      currentConnection.on("data", data => {
        ReceiveMessage(data);
      });
    });

    // Set our remote peer id
    setRemotePeerID(currentConnection.peer);

    console.log("Connected to: " + currentConnection.peer);
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

  const SetupCall = newCall => {
    let currentUserVideo = userVideo;
    if (!userVideo) {
      console.warn("Tried to start a video call without a 'userVideo'!");
      currentUserVideo = GetUserVideo();
    }

    if (!newCall) {
      console.warn("SetupCall was called without a call!");
      return;
    }

    // Answer the call, providing our userVideo stream
    newCall.answer(currentUserVideo);

    newCall.on("stream", remoteStream => {
      console.log("Receiving remote stream from", newCall.peer);
      setRemoteVideo(remoteStream);
    });

    // Call the other user back
    CallPeer();

    setCall(newCall);
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

  const handleChange = event => {
    setRemotePeerID(event.target.value);
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
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <StyledVideo
            showOverlay={false}
            overlayContent={currentState != null ? <GetOverlayContent /> : null}
            borderRadius={5}
            overlayBackground={currentState != null ? GetOverlayColor : null}
            displayVideo={remoteVideo}
          />
        </Flex>
        <WebcamProvider value={userVideo}>
          <Flex
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0
            }}
          >
            <StyledVideo
              showOverlay={currentState != null}
              borderRadius={5}
              overlayBackground={currentState != null ? GetOverlayColor : null}
              videoWidth={VIDEO_PREVIEW_DIMENSIONS.width}
              videoHeight={VIDEO_PREVIEW_DIMENSIONS.height}
              displayVideo={userVideo}
            />
          </Flex>
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
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            m={[2, 3]}
            flexWrap={"wrap"}
          >
            <Text>{lastPeerId}</Text>
            <Input
              placeholder="broken-walrus"
              value={remotePeerID}
              onChange={handleChange}
            />
            <Button
              onClick={() => {
                ConnectToPeer(remotePeerID);
              }}
            >
              CONNECT TO PEER
            </Button>
            <Button onClick={SetupPeer}>SETUP PEER</Button>
            <Button
              onClick={() => {
                setShouldClassify(!shouldClassify);
              }}
            >
              <Text>
                {shouldClassify ? "STOP CLASSIFYING" : "START CLASSIFYING"}
              </Text>
            </Button>
            <Button onClick={CallPeer}>CALL PEER</Button>
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
