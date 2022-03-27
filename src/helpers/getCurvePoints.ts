import { Position } from "../types";
import { lerp } from "./lerp";

export const getCurvePoints = (
  anchor1: Position,
  control1: Position,
  control2: Position,
  anchor2: Position,
  parts: number
): Position[] => {
  const results: Position[] = [];
  for (let i = 0, delta = 0; i <= parts; i++, delta += 1 / parts) {
    const x1 = lerp(anchor1.x, control1.x, delta);
    const y1 = lerp(anchor1.y, control1.y, delta);
    const x2 = lerp(control1.x, control2.x, delta);
    const y2 = lerp(control1.y, control2.y, delta);
    const x3 = lerp(control2.x, anchor2.x, delta);
    const y3 = lerp(control2.y, anchor2.y, delta);

    const xx1 = lerp(x1, x2, delta);
    const yy1 = lerp(y1, y2, delta);
    const xx2 = lerp(x2, x3, delta);
    const yy2 = lerp(y2, y3, delta);

    const x = lerp(xx1, xx2, delta);
    const y = lerp(yy1, yy2, delta);
    results.push({ x, y });
  }

  return results;
};
