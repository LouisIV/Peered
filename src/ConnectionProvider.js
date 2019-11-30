import React from "react";

const ConnectionContext = React.createContext({});

export const ConnectionProvider = ConnectionContext.Provider;
export const ConnectionConsumer = ConnectionContext.Consumer;
export default ConnectionContext;
