import { Position } from "../types";

export const getDraftablePos = (pos: Position): Position =>
  pos?.isDraft ? { x: pos.draftX, y: pos.draftY } : pos;