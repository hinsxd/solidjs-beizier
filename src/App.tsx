import { useDragDropContext } from "@thisbeyond/solid-dnd";
import { Component, Index, onMount, Show } from "solid-js";
import { AnchorCircle } from "./components/AnchorCircle";
import { ControlCircle } from "./components/ControlCIrcle";
import { anchorList } from "./store/anchorList";
import { Anchor, Position } from "./types";

const App: Component = () => {
  const [, { onDragMove, onDragEnd }] = useDragDropContext()!;

  onDragMove((e) => {
    const { index, dragging, anchor } = e.draggable.data;

    const { x, y } = e.draggable.transform;

    const draftPos = {
      draftX: anchor()[dragging].x + x,
      draftY: anchor()[dragging].y + y,
    };
    anchorList.anchors[index as number][dragging as keyof Anchor] = {
      ...anchorList.anchors[index as number][dragging as keyof Anchor],
      isDraft: true,
      ...draftPos,
    } as Position;
  });
  onDragEnd((e) => {
    const { index, dragging } = e.draggable.data;
    const pos = anchorList.anchors[index as number][dragging as keyof Anchor];
    if (pos?.isDraft) {
      anchorList.anchors[index as number][dragging as keyof Anchor] = {
        x: pos.draftX,
        y: pos.draftY,
        isDraft: false,
      };
    }
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
        onPointerDown={(e) => {
          if (e.currentTarget === e.target) {
            const lastAnchor =
              anchorList.anchors[anchorList.anchors.length - 1];
            const { x, y } = container.getBoundingClientRect();
            const newPos = { x: e.clientX - x + 1, y: e.clientY - y + 1 };
            lastAnchor.rightControl = {
              x: 2 * lastAnchor.position.x - lastAnchor.leftControl!.x,
              y: 2 * lastAnchor.position.y - lastAnchor.leftControl!.y,
            };
            anchorList.anchors.push({
              position: newPos,
              leftControl: { x: newPos.x + 20, y: newPos.y - 20 },
              rightControl: null,
            });
          }
        }}
      >
        <rect stroke="white" fill="none" width={500} height={500} />
        <Index each={anchorList.draftPaths}>
          {(path) => <path d={path()} class="curve-line draft" />}
        </Index>
        <Index each={anchorList.paths}>
          {(path) => <path d={path()} class="curve-line" />}
        </Index>

        <Index each={anchorList.anchors}>
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
                <AnchorCircle idx={idx} anchor={anchor} />
              </>
            );
          }}
        </Index>
      </svg>
    </div>
  );
};

export default App;
