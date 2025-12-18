export type Node =
  | { type: "text"; value: string }
  | { type: "sub"; value: string }
  | { type: "sup"; value: string }
  | { type: "group"; children: Node[] };

function readBraced(input: string, i: number): { value: string; next: number } | null {
  if (input[i] !== "{") return null;
  let j = i + 1;
  let value = "";
  while (j < input.length && input[j] !== "}") {
    value += input[j++];
  }
  if (j >= input.length) return null;
  return { value, next: j + 1 };
}

export function parseFormula(input: string): Node[] {
  const out: Node[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Klammern als Gruppe
    if (ch === "(") {
      i++;
      let depth = 1;
      const start = i;
      while (i < input.length && depth > 0) {
        if (input[i] === "(") depth++;
        else if (input[i] === ")") depth--;
        i++;
      }
      const inside = input.slice(start, i - 1);
      out.push({ type: "group", children: parseFormula(inside) });
      continue;
    }

    // Subscript: _2 oder _{12}
    if (ch === "_") {
      i++;
      const br = readBraced(input, i);
      if (br) {
        out.push({ type: "sub", value: br.value });
        i = br.next;
        continue;
      }

      // Standardfall: _ gefolgt von genau einer oder mehreren Ziffern
      let digits = "";
      while (i < input.length && /[0-9]/.test(input[i])) digits += input[i++];
      if (digits.length > 0) {
        out.push({ type: "sub", value: digits });
        continue;
      }

      // falls "_" ohne gültigen Inhalt: literal behalten
      out.push({ type: "text", value: "_" });
      continue;
    }

// Superscript: ^2+, ^3-, e^-, SO_4^2-
if (ch === "^") {
  i++;

  // ^{...}
  const br = readBraced(input, i);
  if (br) {
    out.push({ type: "sup", value: br.value });
    i = br.next;
    continue;
  }

  // ^ gefolgt von Zahl(en) UND optionalem Vorzeichen
  let sup = "";

  // erst Ziffern
  while (i < input.length && /[0-9]/.test(input[i])) {
    sup += input[i++];
  }

  // dann optional + oder -
  if (i < input.length && (input[i] === "+" || input[i] === "-")) {
    sup += input[i++];
  }

  if (sup.length > 0) {
    out.push({ type: "sup", value: sup });
    continue;
  }

  // Fallback
  out.push({ type: "text", value: "^" });
  continue;
}


    // Default: normaler Text
    out.push({ type: "text", value: ch });
    i++;
  }

  return out;
}
