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

export const GoodEmoji = () => {
  return <Emoji symbol="👍" label="thumbs-up" fontSize={"5em"} />;
};

export const BadEmoji = () => {
  return <Emoji symbol="👎" label="thumbs-down" fontSize={"5em"} />;
};

export const EvalEmoji = () => {
  return <Emoji symbol="🤔" label="thinking-face" fontSize={"5em"} />;
};

export const SorryEmoji = () => {
  return <Emoji symbol="😅" label="grin-with-sweat-face" fontSize={"5em"} />;
};

export default Emoji;
