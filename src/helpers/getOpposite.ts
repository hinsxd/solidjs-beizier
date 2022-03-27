import { Position } from "../types";

export const getOpposite = (pos: Position, referencePos: Position) => {
  return {
    x: 2 * referencePos.x - pos.x,
    y: 2 * referencePos.y - pos.y,
  };
};
