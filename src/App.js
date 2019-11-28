import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import PosePredictor from "./Components/PosePredictor";

import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";
import { Button } from "rebass";

function App() {
  const [shouldClassify, setShouldClassify] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>

          <div id="label-container" />
          <PosePredictor shouldClassify={shouldClassify} />
          <Button
            variant="outline"
            onClick={() => {
              setShouldClassify(!shouldClassify);
            }}
          >
            {shouldClassify ? "STOP CLASSIFYING" : "START CLASSIFYING"}
          </Button>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
