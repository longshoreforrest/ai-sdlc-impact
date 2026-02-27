'use client';

import katex from 'katex';

interface FormulaProps {
  math: string;
  block?: boolean;
}

export default function Formula({ math, block = false }: FormulaProps) {
  const html = katex.renderToString(math, {
    displayMode: block,
    throwOnError: false,
  });

  if (block) {
    return (
      <div
        className="my-2 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}
