import {
  batch,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from "solid-js";
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
const [mousePos, setMousePos] = createSignal<Position>({
  x: 0,
  y: 0,
});
const [showDots, setShowDots] = createSignal(true);
const [anchor1, setAnchor1] = createSignal<Position>({ x: 10, y: 10 });
const [control1, setControl1] = createSignal<Position>({ x: 400, y: 10 });
const [control2, setControl2] = createSignal<Position>({ x: 100, y: 490 });
const [anchor2, setAnchor2] = createSignal<Position>({ x: 490, y: 490 });

const [draggingState, setDraggingState] = createSignal<{
  isDragging: boolean;
  draggingEl: string | null;
}>({
  isDragging: false,
  draggingEl: null,
});

const App: Component = () => {
  const dots = createMemo<Position[]>(() => {
    return getCurvePoints(anchor1(), control1(), control2(), anchor2(), 100);
  });

  const lines = createMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < dots().length - 1; i++) {
      const current = dots()[i];
      const next = dots()[i + 1];
      lines.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y });
    }
    return lines;
  });

  let container: SVGSVGElement;
  return (
    <div class="app">
      <svg
        class="container"
        width={500}
        height={500}
        ref={(el) => (container = el)}
        onMouseMove={(e) => {
          const { x, y } = container.getBoundingClientRect();
          const newPos = { x: e.clientX - x + 1, y: e.clientY - y + 1 };
          setMousePos(newPos);
          if (draggingState().isDragging) {
            switch (draggingState().draggingEl) {
              case "anchor1":
                setAnchor1(newPos);
                return;
              case "control1":
                setControl1(newPos);
                return;
              case "control2":
                setControl2(newPos);
                return;
              case "anchor2":
                setAnchor2(newPos);
                return;
            }
          }
        }}
      >
        <rect stroke="white" fill="none" width={500} height={500} />

        <Show when={showDots()}>
          <For each={dots()}>
            {(dot) => (
              <circle
                class="curve-dot"
                cx={dot.x}
                cy={dot.y}
                r={0.5}
                stroke="#ffffff"
                // stroke-width="1"
                fill="#dddddd"
              />
            )}
          </For>
        </Show>
        <For each={lines()}>
          {(line) => <line {...line} class="curve-line" />}
        </For>
        <line
          class="handle-line"
          x1={anchor1().x}
          x2={control1().x}
          y1={anchor1().y}
          y2={control1().y}
        />
        <line
          class="handle-line"
          x1={anchor2().x}
          x2={control2().x}
          y1={anchor2().y}
          y2={control2().y}
        />
        <circle
          classList={{
            anchor: true,
            dragging: draggingState().draggingEl === "anchor1",
          }}
          cx={anchor1().x}
          cy={anchor1().y}
          onMouseDown={() => {
            setDraggingState({ isDragging: true, draggingEl: "anchor1" });
          }}
          onMouseUp={() => {
            setDraggingState({ isDragging: false, draggingEl: null });
          }}
        />
        <circle
          classList={{
            control: true,
            dragging: draggingState().draggingEl === "control1",
          }}
          cx={control1().x}
          cy={control1().y}
          onMouseDown={() => {
            setDraggingState({ isDragging: true, draggingEl: "control1" });
          }}
          onMouseUp={() => {
            setDraggingState({ isDragging: false, draggingEl: null });
          }}
        />

        <circle
          classList={{
            control: true,
            dragging: draggingState().draggingEl === "control2",
          }}
          cx={control2().x}
          cy={control2().y}
          onMouseDown={() => {
            setDraggingState({ isDragging: true, draggingEl: "control2" });
          }}
          onMouseUp={() => {
            setDraggingState({ isDragging: false, draggingEl: null });
          }}
        />
        <circle
          classList={{
            anchor: true,
            dragging: draggingState().draggingEl === "anchor2",
          }}
          cx={anchor2().x}
          cy={anchor2().y}
          onMouseDown={() => {
            setDraggingState({ isDragging: true, draggingEl: "anchor2" });
          }}
          onMouseUp={() => {
            setDraggingState({ isDragging: false, draggingEl: null });
          }}
        />
      </svg>
    </div>
  );
};

export default App;
