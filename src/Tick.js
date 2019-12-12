import UIfx from "uifx";
import beep from "./Audio/tick.mp3";

export const Tick = new UIfx(beep, {
  volume: 0.4
});
