import { createDraggable } from "@thisbeyond/solid-dnd";
import { Show } from "solid-js";
import { draftPosToPos } from "../helpers/draftPosToPos";
import { Anchor } from "../types";

export const ControlCircle = ({
  idx,
  side,
  anchor,
}: {
  idx: number;
  side: "leftControl" | "rightControl";
  anchor: () => Anchor;
}) => {
  const draggable = createDraggable(`${side}-${idx}`, {
    index: idx,
    dragging: side,
    anchor,
  });
  const controlPosition = () => anchor()[side];
  const anchorPosition = () => anchor().position;

  const controlHasDraft = () => controlPosition()?.isDraft;
  const anchorHasDraft = () => anchorPosition()?.isDraft;

  const hasDraft = () => controlHasDraft() || anchorHasDraft();

  return (
    <>
      <line
        class="handle-line"
        x1={controlPosition()?.x}
        x2={anchorPosition().x}
        y1={controlPosition()?.y}
        y2={anchorPosition().y}
      />
      <Show when={hasDraft()}>
        <line
          class="handle-line draft"
          x1={draftPosToPos(controlPosition()!).x}
          x2={draftPosToPos(anchorPosition()).x}
          y1={draftPosToPos(controlPosition()!).y}
          y2={draftPosToPos(anchorPosition()).y}
        />
      </Show>
      <circle
        class="control"
        cx={controlPosition()?.x}
        cy={controlPosition()?.y}
      />
      <circle
        use:draggable
        class="control draft"
        cx={controlPosition()?.x}
        cy={controlPosition()?.y}
      />
    </>
  );
};
