export function poliSpeech(text: string): string {
  return text
  .replace(/\bKB\b/gi, "Ka B")
  .replace(/\bCATIN\b/gi, "CaTTIN");
}

export function kodeSpeech(kode: string): string {
  const text: Record<string, string> = {
    A: "A",
    B: "Be",
    C: "Ce",
    D: "D",
    E: "E",
    F: "F",
    G: "Ge",
    H: "Ha",
    I: "I",
    J: "Je",
    K: "Ka",
    L: "El",
    M: "Em",
    N: "En",
  };

  return kode.replace(/^([A-Z])-/, (_, huruf) => {
    return (text[huruf] ?? huruf) + " ";
  });
}
