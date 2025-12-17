import { parseFormula, type Node as FormulaNode } from "./parseFormula";

export type ArrowKind = "->" | "<->" | "=>" | "<=>";

export type EqNode =
  | { type: "space"; value: string }
  | { type: "plus" }
  | { type: "arrow"; kind: ArrowKind }
  | { type: "formula"; nodes: FormulaNode[] };

function normalizeArrow(token: string): ArrowKind | null {
  if (token === "->" || token === "→") return "->";
  if (token === "<->" || token === "⇌") return "<->";
  if (token === "=>") return "=>";
  if (token === "<=>") return "<=>";
  return null;
}

/**
 * Tokenizer für Reaktionsgleichungen.
 * Funktioniert auch ohne Leerzeichen: H_2+O_2->H_2O
 */
export function parseEquation(input: string): EqNode[] {
  const out: EqNode[] = [];

  const tokens = input
    .split(/(\s+|<=>|<->|=>|->|⇌|→|\+)/g)
    .filter((t) => t !== "");

  for (const t of tokens) {
    if (/^\s+$/.test(t)) {
      out.push({ type: "space", value: t });
      continue;
    }
    if (t === "+") {
      out.push({ type: "plus" });
      continue;
    }
    const arrow = normalizeArrow(t);
    if (arrow) {
      out.push({ type: "arrow", kind: arrow });
      continue;
    }

    out.push({ type: "formula", nodes: parseFormula(t) });
  }

  return out;
}
