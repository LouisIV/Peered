import React, { useContext, useState } from "react";
import ConnectionContext from "../ConnectionProvider";

import { Flex, Text, Box, Link, Button } from "rebass";
import { Input } from "@rebass/forms";

export default function Nav() {
  const connection = useContext(ConnectionContext);
  const { connectionState, connectToPeer, remotePeer } = connection;
  return (
    <Flex px={2} color="white" bg="black" alignItems="center">
      <Text p={2} fontWeight="bold">
        Peered!
      </Text>
      {connectionState ? (
        <Box>
          <Text>{connectionState}</Text>
        </Box>
      ) : null}

      {/* This will display who we are connected to  */}
      {remotePeer ? (
        <Box>
          <Text>
            {"Connected to"}
            {/* TODO: It would be nice if their name was a monospace font */}
            {remotePeer}
          </Text>
        </Box>
      ) : null}

      <Box mx="auto" />
      <Link variant="nav" href="#!">
        About
      </Link>
    </Flex>
  );
}
