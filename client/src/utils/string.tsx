import type Fuse from "fuse.js";
import { ReactNode } from "react";

export const highlightPartOfText = (
  inputText: string,
  indicesToHighlight: readonly Fuse.RangeTuple[]
) => {
  if (indicesToHighlight.length === 0) {
    return inputText;
  }
  const stringParts: ReactNode[] = [
    inputText.substring(0, indicesToHighlight[0][0]),
  ];
  let lastEnd = indicesToHighlight[0][0] - 1;
  indicesToHighlight.forEach(([start, end]) => {
    if (start !== lastEnd + 1) {
      stringParts.push(inputText.substring(lastEnd + 1, start));
    }
    const stringToHighLight = inputText.substring(start, end + 1);
    stringParts.push(
      <span
        style={{
          fontWeight: "bold",
          backgroundColor: "rgba(72, 122, 180, .1)",
        }}
      >
        {stringToHighLight}
      </span>
    );
    lastEnd = end;
  });
  stringParts.push(inputText.substring(lastEnd + 1));
  return stringParts;
};
