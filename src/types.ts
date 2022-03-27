export type Position =
  | { x: number; y: number; isDraft?: false }
  | { x: number; y: number; isDraft: true; draftX: number; draftY: number };

export type Anchor = {
  position: Position;
  leftControl: Position | null;
  rightControl: Position | null;
};
