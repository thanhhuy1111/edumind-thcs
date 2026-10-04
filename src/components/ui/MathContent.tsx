"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathContentProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Parses text containing LaTeX math ($...$, $$...$$, \(...\), \[...\])
 * and renders it cleanly using KaTeX.
 */
export function MathContent({ content, className = "", inline = false }: MathContentProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Pattern to match block math ($$...$$ or \[...\]) and inline math ($...$ or \(...\))
    const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?:\\.|[^\$\n])+\$|\\\([\s\S]*?\\\))/g;

    const parts = content.split(mathRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Check block math $$...$$
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      // Check block math \[...\]
      if (part.startsWith("\\[") && part.endsWith("\\]")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-2 block overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      // Check inline math $...$
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-math mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      // Check inline math \(...\)
      if (part.startsWith("\\(") && part.endsWith("\\)")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-math mx-0.5"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      // Normal text: handle line breaks if multi-line and not pure inline
      if (!inline && part.includes("\n")) {
        const lines = part.split("\n");
        return (
          <React.Fragment key={index}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      }

      return <span key={index}>{part}</span>;
    });
  }, [content, inline]);

  if (inline) {
    return <span className={`math-renderer inline ${className}`}>{renderedElements}</span>;
  }

  return <div className={`math-renderer ${className}`}>{renderedElements}</div>;
}
