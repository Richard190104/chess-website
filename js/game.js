import { Chess } from "chess.js";

export function createGame() {
  const chess = new Chess();
  // you can add hooks here for UI updates, move history, etc.
  return chess;
}
