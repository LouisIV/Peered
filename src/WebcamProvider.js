import React from "react";

const WebcamContext = React.createContext({});

export const WebcamProvider = WebcamContext.Provider;
export const WebcamConsumer = WebcamContext.Consumer;
export default WebcamContext;
