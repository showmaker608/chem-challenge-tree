import { useMemo } from 'react';
import katex from 'katex';
import 'katex/contrib/mhchem';
import 'katex/dist/katex.min.css';

interface ChemExpressionProps {
  source: string;
  label: string;
  className?: string;
}

/**
 * 使用 mhchem 语法排版化学式或符号表达式。
 * 示例：H2O2 ->[MnO2] H2O + O2
 */
export function ChemExpression({ source, label, className = '' }: ChemExpressionProps) {
  const markup = useMemo(
    () => katex.renderToString(`\\ce{${source}}`, {
      displayMode: false,
      output: 'htmlAndMathml',
      throwOnError: false,
      trust: false,
    }),
    [source],
  );

  return (
    <span
      role="math"
      aria-label={label}
      data-chem-source={source}
      className={`inline-block max-w-full align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
