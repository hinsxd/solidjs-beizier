import { useDragDropContext } from "@thisbeyond/solid-dnd";
import { Component, createSignal, Index, onMount, Show } from "solid-js";
import { produce } from "solid-js/store";
import { AnchorCircle } from "./components/AnchorCircle";
import { ControlCircle } from "./components/ControlCIrcle";
import { LockClosedIcon } from "./components/LockClosedIcon";
import { LockOpenedIcon } from "./components/LockOpenedIcon";
import { commitAnchor } from "./helpers/commitAnchor";
import { getOpposite } from "./helpers/getOpposite";
import { anchorStore, setAnchorStore } from "./store/anchorStore";
import { DraggableData, Position } from "./types";

const applyTransform = (position: Position, delta: Position) => {
  return {
    ...position,
    isDraft: true,
    draftX: position.x + delta.x,
    draftY: position.y + delta.y,
  };
};

const App: Component = () => {
  const [, { onDragMove, onDragEnd }] = useDragDropContext()!;

  const [lockControl, setLockControl] = createSignal(true);

  onDragMove((e) => {
    const { index, dragging } = e.draggable.data as DraggableData;
    setAnchorStore(
      "anchors",
      index,
      produce((anchor) => {
        const draggingEl = anchor[dragging];
        if (!draggingEl) return;

        anchor[dragging] = applyTransform(draggingEl, e.draggable.transform);
        if (!lockControl()) return;

        if (dragging === "position") {
          if (anchor.leftControl) {
            anchor.leftControl = applyTransform(
              anchor.leftControl,
              e.draggable.transform
            );
          }
          if (anchor.rightControl) {
            anchor.rightControl = applyTransform(
              anchor.rightControl,
              e.draggable.transform
            );
          }
        } else {
          const opposite =
            dragging === "leftControl" ? "rightControl" : "leftControl";
          if (anchor[opposite]) {
            anchor[opposite] = applyTransform(
              anchor[opposite]!,
              getOpposite(e.draggable.transform)
            );
          }
        }
      })
    );
  });
  onDragEnd((e) => {
    const { index } = e.draggable.data as DraggableData;
    setAnchorStore("anchors", index, commitAnchor);
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
        <rect
          stroke="white"
          stroke-width={2}
          x={0}
          fill="none"
          width="100%"
          height="100%"
        />
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

      <button
        classList={{
          "lock-button": true,
          opened: !lockControl(),
          closed: lockControl(),
        }}
        onClick={() => setLockControl((locked) => !locked)}
      >
        <Show
          when={lockControl()}
          fallback={
            <>
              <LockOpenedIcon />
              <span>Lock Opened</span>
            </>
          }
        >
          <LockClosedIcon />
          <span>Locked</span>
        </Show>
      </button>
    </div>
  );
};

export default App;
