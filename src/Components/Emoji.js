import React from "react";
const Emoji = props => (
  <span
    className="emoji"
    role="img"
    style={{
      fontSize: props.fontSize || "1em"
    }}
    aria-label={props.label ? props.label : ""}
    aria-hidden={props.label ? "false" : "true"}
  >
    {props.symbol}
  </span>
);
export default Emoji;
