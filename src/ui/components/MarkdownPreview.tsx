import DOMPurify from "dompurify";
import { marked, Renderer } from "marked";
import { useEffect, useMemo, useRef } from "react";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export function MarkdownPreview({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => {
    const renderer = new Renderer();
    renderer.code = ({ text, lang }) => {
      if (lang?.trim().toLowerCase() === "mermaid") {
        return `<div class="mermaid-source">${escapeHtml(text)}</div>`;
      }
      const language = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      return `<pre><code${language}>${escapeHtml(text)}</code></pre>`;
    };
    return DOMPurify.sanitize(marked.parse(content, { gfm: true, breaks: false, renderer }) as string);
  }, [content]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cancelled = false;
    const diagrams = [...root.querySelectorAll<HTMLElement>(".mermaid-source")];
    if (diagrams.length === 0) return;
    void import("mermaid").then(async ({ default: mermaid }) => {
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        suppressErrorRendering: true,
        htmlLabels: false,
        theme: "default",
        flowchart: { useMaxWidth: true },
      });
      await Promise.all(diagrams.map(async (element, index) => {
        const source = element.textContent ?? "";
        const id = `markdownos-diagram-${Date.now()}-${index}`;
        try {
          await mermaid.parse(source);
          const result = await mermaid.render(id, source);
          if (cancelled) return;
          element.className = "mermaid-card";
          element.innerHTML = DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true } });
        } catch (error) {
          if (cancelled) return;
          renderDiagramError(element, source, error);
        }
      }));
    }).catch((error: unknown) => {
      if (!cancelled) console.error("Unable to render Mermaid diagram.", error);
    });
    return () => { cancelled = true; };
  }, [html]);

  return <div ref={ref} className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderDiagramError(element: HTMLElement, source: string, error: unknown): void {
  element.className = "mermaid-error-card";
  element.replaceChildren();

  const message = document.createElement("p");
  message.className = "mermaid-error-message";
  message.textContent = error instanceof Error
    ? error.message.split("\n").slice(0, 2).join(" ")
    : "Check the Mermaid diagram syntax and try again.";

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Show diagram source";
  const code = document.createElement("pre");
  code.textContent = source;
  details.append(summary, code);
  element.append(message, details);
}
