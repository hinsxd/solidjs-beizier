import { createDraggable } from "@thisbeyond/solid-dnd";
import { Anchor } from "../types";

export const AnchorCircle = ({
  idx,
  anchor,
}: {
  idx: number;
  anchor: () => Anchor;
}) => {
  const draggable = createDraggable(`anchor-${idx}`, {
    index: idx,
    dragging: "position",
    anchor,
  });
  return (
    <>
      <circle
        class="anchor"
        cx={anchor().position.x}
        cy={anchor().position.y}
      />
      <circle
        use:draggable
        class="anchor draft"
        cx={anchor().position.x}
        cy={anchor().position.y}
      />
    </>
  );
};
