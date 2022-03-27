import { useDragDropContext } from "@thisbeyond/solid-dnd";
import { Component, createSignal, Index, onMount, Show } from "solid-js";
import { produce } from "solid-js/store";
import { AnchorCircle } from "./components/AnchorCircle";
import { ControlCircle } from "./components/ControlCIrcle";
import { getOpposite } from "./helpers/getOpposite";
import { anchorStore, setAnchorStore } from "./store/anchorStore";
import { Anchor, DraggableData } from "./types";

const App: Component = () => {
  const [, { onDragMove, onDragEnd }] = useDragDropContext()!;

  const [lockControl, setLockControl] = createSignal(true);

  onDragMove((e) => {
    const { index, dragging } = e.draggable.data as DraggableData;

    const { x, y } = e.draggable.transform;
    setAnchorStore(
      "anchors",
      index,
      dragging,
      (draggingEl) =>
        draggingEl && {
          ...draggingEl,
          isDraft: true,
          draftX: draggingEl.x + x,
          draftY: draggingEl.y + y,
        }
    );
  });
  onDragEnd((e) => {
    const { index, dragging } = e.draggable.data as DraggableData;

    setAnchorStore("anchors", index, dragging, (draggingEl) =>
      draggingEl?.isDraft
        ? { x: draggingEl.draftX, y: draggingEl.draftY }
        : draggingEl
    );
  });

  onMount(() => {
    document.addEventListener("touchmove", (e) => e.preventDefault(), {
      passive: false,
    });
  });

  let container: SVGSVGElement;
  return (
    <div class="app">
      <svg
        ref={(el) => (container = el)}
        class="container"
        width={500}
        height={500}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            const { x, y } = container.getBoundingClientRect();
            const newPos = { x: e.clientX - x + 1, y: e.clientY - y + 1 };

            setAnchorStore(
              produce((state) => {
                const lastAnchor = state.anchors[state.anchors.length - 1];
                lastAnchor.rightControl = getOpposite(
                  lastAnchor.leftControl!,
                  lastAnchor.position
                );

                state.anchors.push({
                  position: newPos,
                  leftControl: { x: newPos.x + 20, y: newPos.y - 20 },
                  rightControl: null,
                });
              })
            );
          }
        }}
      >
        <rect stroke="white" stroke-width={2} x={0} fill="none" width="100%" height="100%" />
        <Index each={anchorStore.draftPaths}>
          {(path) => <path d={path()} class="curve-line draft" />}
        </Index>
        <Index each={anchorStore.paths}>
          {(path) => <path d={path()} class="curve-line" />}
        </Index>

        <Index each={anchorStore.anchors}>
          {(anchor, idx) => {
            return (
              <>
                <Show when={!!anchor().leftControl}>
                  <ControlCircle idx={idx} side="leftControl" anchor={anchor} />
                </Show>
                <Show when={!!anchor().rightControl}>
                  <ControlCircle
                    idx={idx}
                    side="rightControl"
                    anchor={anchor}
                  />
                </Show>
                <AnchorCircle idx={idx} />
              </>
            );
          }}
        </Index>
      </svg>
    </div>
  );
};

export default App;
