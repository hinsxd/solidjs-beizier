import { createDraggable } from "@thisbeyond/solid-dnd";
import { Show } from "solid-js";
import { getDraftablePos } from "../helpers/getDraftablePos";
import { anchorStore } from "../store/anchorStore";
import { Anchor } from "../types";

export const ControlCircle = ({
  idx,
  side,
}: // anchor,
{
  idx: number;
  side: "leftControl" | "rightControl";
  anchor: () => Anchor;
}) => {
  const anchor = () => anchorStore.anchors[idx];
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
          x1={getDraftablePos(controlPosition()!).x}
          x2={getDraftablePos(anchorPosition()).x}
          y1={getDraftablePos(controlPosition()!).y}
          y2={getDraftablePos(anchorPosition()).y}
        />
      </Show>
      <circle
        class="node control"
        cx={controlPosition()?.x}
        cy={controlPosition()?.y}
      />
      <circle
        class="node control draft"
        cx={getDraftablePos(controlPosition()!).x}
        cy={getDraftablePos(controlPosition()!)?.y}
      />
      <circle
        use:draggable
        class="node control draft"
        cx={controlPosition()?.x}
        cy={controlPosition()?.y}
      />
    </>
  );
};
