import { DIRECTIONS } from "./App.js";

export const pickDirection = () => {
  const num = Math.floor(Math.random() * 4); // Generate random number from 0-3 since we have 4 directions
  switch (num) {
    case 0:
      return DIRECTIONS.LEFT;
    case 1:
      return DIRECTIONS.RIGHT;
    case 2:
      return DIRECTIONS.UP;
    case 3:
      return DIRECTIONS.DOWN;
    default:
      console.log(
        "Should not be possible to get here, got value " + num.toString()
      );
  }
};
