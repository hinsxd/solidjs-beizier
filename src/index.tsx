/* @refresh reload */
import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";
import { render } from "solid-js/web";
import App from "./App";

import "./index.css";

render(
  () => (
    <DragDropProvider>
      <DragDropSensors />
      <App />
    </DragDropProvider>
  ),
  document.getElementById("root") as HTMLElement
);
