import { parseFormula, type Node as FormulaNode } from "./parseFormula";

export type ArrowKind = "->" | "<->" | "=>" | "<=>";

export type EqNode =
  | { type: "space"; value: string }
  | { type: "plus" }
  | { type: "arrow"; kind: ArrowKind }
  | { type: "formula"; nodes: FormulaNode[] };

function matchArrow(s: string, i: number): { kind: ArrowKind; len: number } | null {
  const rest = s.slice(i);

  if (rest.startsWith("<=>")) return { kind: "<=>", len: 3 };
  if (rest.startsWith("<->")) return { kind: "<->", len: 3 };
  if (rest.startsWith("=>")) return { kind: "=>", len: 2 };
  if (rest.startsWith("->")) return { kind: "->", len: 2 };
  if (rest.startsWith("⇌")) return { kind: "<->", len: 1 };
  if (rest.startsWith("→")) return { kind: "->", len: 1 };

  return null;
}

function isSpace(ch: string) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

// Konsumiert ^{...} oder ^<digits>[+|-]?  bzw. _{...} oder _<digits>
function consumeSupSub(s: string, i: number): { text: string; next: number } {
  const start = i;
  const ch = s[i]; // ^ oder _
  i++;

  if (s[i] === "{") {
    i++; // nach {
    while (i < s.length && s[i] !== "}") i++;
    if (i < s.length && s[i] === "}") i++; // schließende }
    return { text: s.slice(start, i), next: i };
  }

  if (ch === "_") {
    // _ gefolgt von Ziffern
    while (i < s.length && /[0-9]/.test(s[i])) i++;
    return { text: s.slice(start, i), next: i };
  }

  // ch === "^"
  // ^ gefolgt von Ziffern
  while (i < s.length && /[0-9]/.test(s[i])) i++;
  // optional + oder -
  if (i < s.length && (s[i] === "+" || s[i] === "-")) i++;

  return { text: s.slice(start, i), next: i };
}

export function parseEquation(input: string): EqNode[] {
  const out: EqNode[] = [];
  let i = 0;

  let buf = ""; // sammelt Formel-Text (ein Token)

  const flushFormula = () => {
    if (buf.length > 0) {
      out.push({ type: "formula", nodes: parseFormula(buf) });
      buf = "";
    }
  };

  while (i < input.length) {
    const ch = input[i];

    // Whitespace als eigenes Node (Layout stabil)
    if (isSpace(ch)) {
      flushFormula();
      let ws = "";
      while (i < input.length && isSpace(input[i])) ws += input[i++];
      out.push({ type: "space", value: ws });
      continue;
    }

    // Pfeile erkennen
    const arrow = matchArrow(input, i);
    if (arrow) {
      flushFormula();
      out.push({ type: "arrow", kind: arrow.kind });
      i += arrow.len;
      continue;
    }

    // Plus ist Operator – ABER nur, wenn wir nicht gerade ^... konsumieren.
    // Da wir ^... im Formelbuffer als Einheit konsumieren, ist ein '+' hier wirklich ein Operator.
    if (ch === "+") {
      flushFormula();
      out.push({ type: "plus" });
      i++;
      continue;
    }

    // Sup/Sub-Konstrukte innerhalb einer Formel als Einheit konsumieren (wichtig für Cu^2+)
    if (ch === "^" || ch === "_") {
      const consumed = consumeSupSub(input, i);
      buf += consumed.text;
      i = consumed.next;
      continue;
    }

    // Normaler Formel-Char
    buf += ch;
    i++;
  }

  flushFormula();
  return out;
}
