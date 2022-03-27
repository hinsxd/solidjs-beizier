import { Anchor } from "../types";

export const commitAnchor = (anchor: Anchor) => {
  const newAnchor = { ...anchor };
  for (const key of Object.keys(newAnchor)) {
    const draggingEl = anchor[key as keyof Anchor];
    if (draggingEl && draggingEl.isDraft) {
      newAnchor[key as keyof Anchor] = {
        x: draggingEl.draftX,
        y: draggingEl.draftY,
      };
    }
  }
  return newAnchor
};
