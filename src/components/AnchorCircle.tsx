import { createDraggable } from "@thisbeyond/solid-dnd";
import { getDraftablePos } from "../helpers/getDraftablePos";
import { anchorStore } from "../store/anchorStore";
import { DraggableData } from "../types";

export const AnchorCircle = ({ idx }: { idx: number }) => {
  const draggable = createDraggable(`anchor-${idx}`, {
    index: idx,
    dragging: "position",
  } as DraggableData);
  const anchor = anchorStore.anchors[idx];

  return (
    <>
      <circle class="node anchor" cx={anchor.position.x} cy={anchor.position.y} />
      <circle
        use:draggable
        class="node anchor draft"
        cx={anchor.position.x}
        cy={anchor.position.y}
      />
    </>
  );
};
