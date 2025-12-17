import type { EqNode } from "./parseEquation";
import { renderNodes } from "./renderNodes";

function arrowGlyph(kind: EqNode extends { type: "arrow" } ? never : never) {
  return "";
}

function glyph(kind: "->" | "<->" | "=>" | "<=>") {
  switch (kind) {
    case "->":
      return "→";
    case "<->":
      return "⇌";
    case "=>":
      return "⇒";
    case "<=>":
      return "⇔";
  }
}

export function renderEquation(nodes: EqNode[]): React.ReactNode {
  return nodes.map((n, idx) => {
    switch (n.type) {
      case "space":
        return <span key={idx}>{n.value}</span>;
      case "plus":
        return <span key={idx}> + </span>;
      case "arrow":
        return (
          <span key={idx} style={{ padding: "0 0.25em" }}>
            {glyph(n.kind)}
          </span>
        );
      case "formula":
        return <span key={idx}>{renderNodes(n.nodes)}</span>;
    }
  });
}
