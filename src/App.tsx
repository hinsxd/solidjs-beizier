import {
  batch,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  Show,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import "./beizier.css";

const lerp = (i: number, j: number, delta: number) => i + (j - i) * delta;

const getCurvePoints = (
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

type Position = { x: number; y: number };

type Anchor = {
  position: Position;
  leftControl: Position | null;
  rightControl: Position | null;
};

type DraggingState =
  | {
      isDragging: false;
    }
  | {
      isDragging: true;
      draggingIndex: number;
      draggingEl: keyof Anchor;
    };

const [anchorList, setAnchorList] = createStore<{ anchors: Anchor[] }>({
  anchors: [
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
});

const [draggingState, setDraggingState] = createSignal<DraggingState>({
  isDragging: false,
});

const App: Component = () => {
  const path = () => {
    let str = "";

    for (let i = 0; i < anchorList.anchors.length - 1; i++) {
      const current = anchorList.anchors[i];
      const next = anchorList.anchors[i + 1];
      const dots = getCurvePoints(
        current.position!,
        current.rightControl!,
        next.leftControl!,
        next.position,
        50
      );
      for (let j = 0; j < dots.length; j++) {
        str += i === 0 && j === 0 ? "M " : i === 0 && j === 1 ? "L " : "";
        const current = dots[j];
        str += `${current.x.toFixed(3)} ${current.y.toFixed(3)} `;
      }
    }

    return str;
  };

  let container: SVGSVGElement;
  return (
    <div class="app">
      <svg
        class="container"
        width={500}
        height={500}
        ref={(el) => (container = el)}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            setAnchorList(
              produce((state) => {
                const lastAnchor = state.anchors[state.anchors.length - 1];
                const { x, y } = container.getBoundingClientRect();
                const newPos = { x: e.clientX - x + 1, y: e.clientY - y + 1 };
                lastAnchor.rightControl = {
                  x:
                    2 * lastAnchor.position.x -
                    (lastAnchor?.leftControl?.x ?? 10),
                  y:
                    2 * lastAnchor.position.y -
                    (lastAnchor?.leftControl?.y ?? 10),
                };
                state.anchors.push({
                  position: newPos,
                  leftControl: { x: newPos.x + 10, y: newPos.y - 20 },
                  rightControl: null,
                });
              })
            );
          }
        }}
        onMouseMove={(e) => {
          const dragState = draggingState();
          if (dragState.isDragging) {
            const { x, y } = container.getBoundingClientRect();
            const newPos = { x: e.clientX - x + 1, y: e.clientY - y + 1 };
            setAnchorList(
              "anchors",
              dragState.draggingIndex,
              dragState.draggingEl,
              newPos
            );
          }
        }}
      >
        <rect stroke="white" fill="none" width={500} height={500} />

        <path d={path()} class="curve-line" />

        <For each={anchorList.anchors}>
          {(anchor, idx) => {
            const dragState = draggingState();
            return (
              <>
                <Show when={!!anchor.leftControl}>
                  <line
                    class="handle-line"
                    x1={anchor.leftControl?.x}
                    x2={anchor.position.x}
                    y1={anchor.leftControl?.y}
                    y2={anchor.position.y}
                  />
                  <circle
                    classList={{
                      control: true,
                      dragging:
                        dragState.isDragging &&
                        dragState.draggingIndex === idx() &&
                        dragState.draggingEl === "leftControl",
                    }}
                    cx={anchor.leftControl?.x}
                    cy={anchor.leftControl?.y}
                    onMouseDown={() => {
                      setDraggingState({
                        isDragging: true,
                        draggingIndex: idx(),
                        draggingEl: "leftControl",
                      });
                    }}
                    onMouseUp={() => {
                      setDraggingState({ isDragging: false });
                    }}
                  />
                </Show>
                <Show when={!!anchor.rightControl}>
                  <line
                    class="handle-line"
                    x1={anchor.rightControl?.x}
                    x2={anchor.position.x}
                    y1={anchor.rightControl?.y}
                    y2={anchor.position.y}
                  />
                  <circle
                    classList={{
                      control: true,
                      dragging:
                        dragState.isDragging &&
                        dragState.draggingIndex === idx() &&
                        dragState.draggingEl === "rightControl",
                    }}
                    cx={anchor.rightControl?.x}
                    cy={anchor.rightControl?.y}
                    onMouseDown={() => {
                      setDraggingState({
                        isDragging: true,
                        draggingIndex: idx(),
                        draggingEl: "rightControl",
                      });
                    }}
                    onMouseUp={() => {
                      setDraggingState({ isDragging: false });
                    }}
                  />
                </Show>
                <circle
                  classList={{
                    anchor: true,
                    dragging:
                      dragState.isDragging &&
                      dragState.draggingIndex === idx() &&
                      dragState.draggingEl === "position",
                  }}
                  cx={anchor.position.x}
                  cy={anchor.position.y}
                  onMouseDown={() => {
                    setDraggingState({
                      isDragging: true,
                      draggingIndex: idx(),
                      draggingEl: "position",
                    });
                  }}
                  onMouseUp={() => {
                    setDraggingState({ isDragging: false });
                  }}
                />
              </>
            );
          }}
        </For>
      </svg>
    </div>
  );
};

export default App;
