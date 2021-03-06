import { createMutable, createStore } from "solid-js/store";
import { getDraftablePos } from "../helpers/getDraftablePos";
import { getCurvePoints } from "../helpers/getCurvePoints";
import { Anchor } from "../types";
export const TEMP_ANCHORS_KEY = "temp-anchors";

export const [anchorStore, setAnchorStore] = createStore<{
  anchors: Anchor[];
  paths: string[];
  draftPaths: string[];
}>({
  anchors: localStorage.getItem(TEMP_ANCHORS_KEY)
    ? JSON.parse(localStorage.getItem(TEMP_ANCHORS_KEY)!)
    : [
        {
          position: { x: 150, y: 200 },
          leftControl: null,
          rightControl: { x: 250, y: 150 },
        },
        {
          position: { x: 350, y: 350 },
          leftControl: { x: 250, y: 400 },
          rightControl: null,
        },
      ],
  get paths() {
    const paths: string[] = [];

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const current = this.anchors[i];
      const next = this.anchors[i + 1];
      if (!current.rightControl || !next.leftControl) continue;

      const dots = getCurvePoints(
        current.position,
        current.rightControl,
        next.leftControl,
        next.position,
        50
      );

      let str = `M ${dots[0].x} ${dots[0].y}`;

      for (let j = 0; j < dots.length; j++) {
        str += "L";
        const current = dots[j];
        str += `${current.x.toFixed(3)} ${current.y.toFixed(3)}`;
      }
      paths.push(str);
    }
    return paths;
  },
  get draftPaths() {
    const paths: string[] = [];

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const current = this.anchors[i];
      const next = this.anchors[i + 1];
      if (!current.rightControl || !next.leftControl) continue;

      const isDraft =
        current.rightControl.isDraft ||
        current.position.isDraft ||
        next.position.isDraft ||
        next.leftControl.isDraft;

      if (!isDraft) continue;

      const dots = getCurvePoints(
        getDraftablePos(current.position),
        getDraftablePos(current.rightControl),
        getDraftablePos(next.leftControl),
        getDraftablePos(next.position),
        50
      );

      let str = `M ${dots[0].x} ${dots[0].y}`;

      for (let j = 0; j < dots.length; j++) {
        str += "L";
        const current = dots[j];
        str += `${current.x.toFixed(3)} ${current.y.toFixed(3)}`;
      }
      paths.push(str);
    }
    return paths;
  },
});
