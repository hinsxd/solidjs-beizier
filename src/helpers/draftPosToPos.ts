import { Position } from "../types";

export const draftPosToPos = (pos: Position): Position =>
  pos?.isDraft ? { x: pos.draftX, y: pos.draftY } : pos;