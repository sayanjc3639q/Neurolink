import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
}

let diagramIdCounter = 0;

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const isDark = document.documentElement.classList.contains('dark');

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        themeVariables: {
          fontFamily: 'Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif',
          primaryColor: isDark ? '#161D36' : '#EDEFF4',
          primaryTextColor: isDark ? '#E6E9F2' : '#1B2340',
          primaryBorderColor: isDark ? '#2A3354' : '#D5D9E3',
          lineColor: isDark ? '#8FAAF5' : '#2A4DB5',
          secondaryColor: isDark ? '#10162B' : '#F6F7F9',
          tertiaryColor: isDark ? '#161D36' : '#EDEFF4',
          background: isDark ? '#10162B' : '#F6F7F9',
        },
        securityLevel: 'loose',
      });

      const uniqueId = `mermaid-svg-${++diagramIdCounter}-${Date.now()}`;
      const trimmedCode = code.trim();

      mermaid
        .render(uniqueId, trimmedCode)
        .then(({ svg }) => {
          if (isMounted) {
            setSvgHtml(svg);
            setError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Mermaid syntax render error:', err);
            setError(err?.message || 'Invalid diagram definition');
          }
        });
    } catch (err: any) {
      if (isMounted) {
        setError(err?.message || 'Failed to initialize diagram');
      }
    }

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-3 border border-redline/60 bg-margin text-xs font-mono text-ink rounded">
        <div className="font-semibold text-redline mb-1">Diagram render error</div>
        <div className="text-pencil whitespace-pre-wrap">{error}</div>
        <pre className="mt-2 text-[11px] text-pencil bg-paper p-2 border border-rule overflow-x-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 border border-rule bg-margin/40 overflow-x-auto flex justify-center items-center rounded">
      {svgHtml ? (
        <div
          ref={containerRef}
          className="max-w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : (
        <div className="text-xs text-pencil py-4 animate-pulse">Rendering diagram...</div>
      )}
    </div>
  );
}
