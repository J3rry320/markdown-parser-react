/**
 * Parses markdown content into React nodes with support for custom styles, classes, and various markdown features.
 *
 * @param markdown - The markdown string to parse.
 * @param options - Optional settings for parsing the markdown.
 * @returns An array of React nodes representing the parsed markdown content.
 *
 * @example
 * ```ts
 * const markdown = "# Hello World\nThis is a paragraph.";
 * const options = {
 *   customClasses: {
 *     headings: "my-heading-class",
 *     paragraphs: "my-paragraph-class",
 *   },
 *   customStyles: {
 *     headings: { color: "red" },
 *     paragraphs: { fontSize: "16px" },
 *   },
 * };
 * const parsedContent = parse(markdown, options);
 * ```
 *
 * @remarks
 * This code is open source under the MIT license. The author can be hired by visiting [Jerry's LinkedIn](https://www.linkedin.com/in/jerrythejsguy/).
 */
import React, { CSSProperties } from "react";

interface CustomClasses {
  headings?: string;
  paragraphs?: string;
  lists?: string;
  blockquotes?: string;
  codeBlocks?: string;
  tables?: string;
  links?: string;
  images?: string;
}

interface CustomStyles extends CSSProperties {
  headings?: CSSProperties;
  paragraphs?: CSSProperties;
  lists?: CSSProperties;
  blockquotes?: CSSProperties;
  codeBlocks?: CSSProperties;
  tables?: CSSProperties;
  links?: CSSProperties;
  images?: CSSProperties;
}

/**
 * Options for parsing markdown content.
 */
export interface ParseOptions {
  /**
   * Prefix for language-specific code block classes.
   * @example "language-"
   */
  langPrefix?: string;

  /**
   * Custom CSS classes for different markdown elements.
   */
  customClasses?: CustomClasses;

  /**
   * Custom CSS styles for different markdown elements.
   */
  customStyles?: CustomStyles;

  /**
   * Target attribute for links.
   * @default "_blank"
   */
  linkTarget?: "_blank" | "_self" | "_parent" | "_top";

  /**
   * Whether to sanitize HTML content.
   * @default false
   */
  sanitizeHtml?: boolean;

  /**
   * Maximum allowed nesting level for lists.
   * @default 6
   */
  maxNestingLevel?: number;
}

type ElementType =
  | "headings"
  | "paragraphs"
  | "lists"
  | "blockquotes"
  | "codeBlocks"
  | "tables"
  | "links"
  | "images";

export function parse(
  markdown: string,
  options: ParseOptions = {}
): React.ReactNode[] {
  const {
    langPrefix = "language-",
    customClasses = {},
    customStyles = {},
    linkTarget = "_blank",
    sanitizeHtml = true,
    maxNestingLevel = 6,
  } = options;

  const lines = markdown.trim().split(/\r\n|\n/);
  const html: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang: string | null = null;
  let codeBlock: string[] = [];
  let nestingLevel = 0;

  // Helper function to safely merge styles and classes
  const getElementProperties = (
    elementType: ElementType,
    additionalProps: Record<string, any> = {}
  ): { style?: CSSProperties; className?: string } => {
    const style: CSSProperties = {
      ...customStyles[elementType],
      ...additionalProps.style,
    };

    const className = customClasses[elementType]
      ? `${customClasses[elementType]} ${additionalProps.className || ""}`
      : additionalProps.className;

    return {
      style: Object.keys(style).length > 0 ? style : undefined,
      className: className || undefined,
    };
  };

  // Enhanced sanitization function
  const sanitize = (text: string): string => {
    if (!sanitizeHtml) return text;
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Process all inline formatting
  const processInlineFormatting = (text: string): string => {
    if (!text) return "";

    const replacements = [
      {
        regex: /\$(.+?)\$/g,
        replace: (_: string, math: string) =>
          `<span class="math-inline">${math}</span>`,
      },
      { regex: /~~(.+?)~~/g, replace: "<del>$1</del>" },
      { regex: /\^(.+?)\^/g, replace: "<sup>$1</sup>" },
      { regex: /~(.+?)~/g, replace: "<sub>$1</sub>" },
      { regex: /==(.+?)==/g, replace: "<mark>$1</mark>" },
      { regex: /\*\*\*(.+?)\*\*\*/g, replace: "<strong><em>$1</em></strong>" },
      { regex: /___(.+?)___/g, replace: "<strong><em>$1</em></strong>" },
      { regex: /\*\*(.+?)\*\*/g, replace: "<strong>$1</strong>" },
      { regex: /__(.+?)__/g, replace: "<strong>$1</strong>" },
      { regex: /\*(.+?)\*/g, replace: "<em>$1</em>" },
      { regex: /_(.+?)_/g, replace: "<em>$1</em>" },
      { regex: /`([^`]+)`/g, replace: "<code>$1</code>" },
      {
        regex: /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g,
        replace: (
          match: string,
          text: string,
          url: string,
          title: string
        ): string => {
          const props = getElementProperties("links", {
            href: url,
            title,
            target: linkTarget,
            rel: linkTarget === "_blank" ? "noopener noreferrer" : undefined,
          });

          const attributes = Object.entries(props)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ");

          return `<a ${attributes}>${text}</a>`;
        },
      },
    ];

    return replacements.reduce(
      //ToDO Better Types please
      (processed, { regex, replace }) =>
        processed.replace(regex, replace as any),
      text
    );
  };

  // Process each line
  lines.forEach((line, index) => {
    // Skip processing if max nesting level is reached
    if (nestingLevel > maxNestingLevel) {
      html.push(<p key={`error-${index}`}>Maximum nesting level reached</p>);
      return;
    }

    // Process definition lists
    if (/^[^\s].*\n:\s/.test(line)) {
      const [term, ...definitions] = line.split("\n:");
      html.push(
        <dl key={`dl-${index}`} {...getElementProperties("lists")}>
          <dt>{processInlineFormatting(term)}</dt>
          {definitions.map((def, i) => (
            <dd key={i}>{processInlineFormatting(def.trim())}</dd>
          ))}
        </dl>
      );
      return;
    }

    // Task lists with nested support
    if (/^(\s*)-\s\[(x| )\]/.test(line)) {
      const indent = (line.match(/^\s*/) || [""])[0].length;
      const checked = line.includes("[x]");
      const text = line.replace(/^(\s*)-\s\[(x| )\]\s*/, "");

      nestingLevel = Math.floor(indent / 2);

      html.push(
        <div
          key={`task-${index}`}
          {...getElementProperties("lists")}
          style={{ marginLeft: `${nestingLevel * 20}px` }}
        >
          <input type="checkbox" checked={checked} readOnly />
          <span>{processInlineFormatting(text)}</span>
        </div>
      );
      return;
    }

    // Headers with custom IDs
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#{1,6}/)?.[0].length || 1;
      const text = line.replace(/^#{1,6}\s/, "");
      const idMatch = text.match(/\{#([^}]+)\}/);
      const id = idMatch ? idMatch[1] : undefined;
      const cleanText = text.replace(/\{#([^}]+)\}/, "").trim();

      html.push(
        React.createElement(
          `h${level}`,
          {
            key: `h-${index}`,
            id,
            ...getElementProperties("headings"),
          },
          processInlineFormatting(cleanText)
        )
      );
      return;
    }

    // Code blocks
    if (/^```(\S+)?(\s+\{.*\})?$/.test(line)) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        const match = line.match(/^```(\S+)?(\s+\{.*\})?$/);
        codeBlockLang = match?.[1] || null;
        codeBlock = [];
      } else {
        const code = codeBlock.join("\n");
        html.push(
          <pre key={`code-${index}`} {...getElementProperties("codeBlocks")}>
            <code
              className={
                codeBlockLang ? `${langPrefix}${codeBlockLang}` : undefined
              }
            >
              {sanitize(code)}
            </code>
          </pre>
        );
        codeBlock = [];
        codeBlockLang = null;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    // Blockquotes with citations
    if (/^>\s/.test(line)) {
      const citationMatch = line.match(/^>\s?(.+?)(?:\s+--\s+(.+))?$/);
      if (citationMatch) {
        const [, text, citation] = citationMatch;
        html.push(
          <blockquote
            key={`quote-${index}`}
            {...getElementProperties("blockquotes")}
          >
            {processInlineFormatting(text)}
            {citation && <footer>— {citation}</footer>}
          </blockquote>
        );
      }
      return;
    }

    // Tables with alignment
    if (/^\|(.+\|)+/.test(line)) {
      const tableRows = [line];
      const alignments: Array<"left" | "center" | "right"> = [];

      if (lines[0] && /^\|(\s*:?-+:?\s*\|)+/.test(lines[0])) {
        const alignmentRow = lines.shift();
        if (alignmentRow) {
          alignments.push(
            ...alignmentRow
              .split("|")
              .slice(1, -1)
              .map((cell) => {
                if (cell.trim().startsWith(":") && cell.trim().endsWith(":"))
                  return "center";
                if (cell.trim().endsWith(":")) return "right";
                return "left";
              })
          );
        }
      }

      while (lines.length && /^\|(.+\|)+/.test(lines[0])) {
        tableRows.push(lines.shift()!);
      }

      const headerRow = tableRows[0];
      const headerColumns = headerRow
        .split("|")
        .slice(1, -1)
        .map((col) => col.trim());

      const tableProps = getElementProperties("tables");

      html.push(
        <table key={`table-${index}`} {...tableProps}>
          <thead>
            <tr>
              {headerColumns.map((col, i) => (
                <th key={i} style={{ textAlign: alignments[i] || "left" }}>
                  {processInlineFormatting(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(2).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row
                  .split("|")
                  .slice(1, -1)
                  .map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={{ textAlign: alignments[cellIndex] || "left" }}
                    >
                      {processInlineFormatting(cell.trim())}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      return;
    }
    // Images
    if (/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/.test(line)) {
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/);
      if (match) {
        const [alt, src, title] = match;
        html.push(
          <img
            key={`img-${index}`}
            src={src}
            alt={alt}
            title={title}
            {...getElementProperties("images")}
          />
        );
      }
      return;
    }
    // Lists (ordered and unordered)
    if (/^(\s*)([-*+]|\d+\.)\s/.test(line)) {
      const indent = (line.match(/^\s*/) || [""])[0].length;
      const isOrdered = /^\s*\d+\./.test(line);
      const text = line.replace(/^(\s*)([-*+]|\d+\.)\s/, "");

      nestingLevel = Math.floor(indent / 2);

      const ListTag = isOrdered ? "ol" : "ul";

      html.push(
        React.createElement(
          ListTag,
          {
            key: `list-${index}`,
            ...getElementProperties("lists"),
            style: { marginLeft: `${nestingLevel * 20}px` },
          },
          <li>{processInlineFormatting(text)}</li>
        )
      );
      return;
    }

    // Process regular paragraphs with inline formatting
    const processedText = processInlineFormatting(line);
    if (processedText.trim()) {
      html.push(
        <p key={`p-${index}`} {...getElementProperties("paragraphs")}>
          <span dangerouslySetInnerHTML={{ __html: processedText }} />
        </p>
      );
    }
  });

  return html;
}
