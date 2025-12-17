import type { Node } from "./parseFormula";

export function renderNodes(nodes: Node[]): React.ReactNode {
  return nodes.map((n, idx) => {
    switch (n.type) {
      case "text":
        return <span key={idx}>{n.value}</span>;

      case "sub":
        return <sub key={idx}>{n.value}</sub>;

      case "sup":
        return <sup key={idx}>{n.value}</sup>;

      case "group":
        return (
          <span key={idx}>
            (<span>{renderNodes(n.children)}</span>)
          </span>
        );
    }
  });
}
