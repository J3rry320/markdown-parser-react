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

interface CustomStyles {
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
  let skipLines = 0;

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
      ? `${customClasses[elementType]}${
          additionalProps.className ? ` ${additionalProps.className}` : ""
        }`
      : additionalProps.className;

    return {
      ...additionalProps,
      style: Object.keys(style).length > 0 ? style : undefined,
      className: className || undefined,
    };
  };

  // Enhanced sanitization function
  // const sanitize = (text: string): string => {
  //   if (!sanitizeHtml) return text;
  //   return text
  //     .replace(/&/g, "&amp;")
  //     .replace(/</g, "&lt;")
  //     .replace(/>/g, "&gt;")
  //     .replace(/"/g, "&quot;")
  //     .replace(/'/g, "&#039;");
  // };

  // Process all inline formatting
  const processInlineFormatting = (text: string): string => {
    if (!text) return "";

    const replacements = [
      {
        regex: /\$(.+?)\$/g,
        replace: (_: string, math: string) =>
          //TODO Return Math tags properly 
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
        regex: /\[([^\]]+)\]\(([^)"'\s]+)(?:\s+"([^"]+)")?\)/g,
        replace: (
          match: string,
          text: string,
          url: string,
          title: string | undefined
        ): string => {
          const props = getElementProperties("links", {
            href: url,
            ...(title && { title }), // Only add title if it exists
            target: linkTarget,
            rel: linkTarget === "_blank" ? "noopener noreferrer" : undefined,
          });

          const attributes = Object.entries(props)
            .filter(([_, value]) => value !== undefined) // Filter out undefined values
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ");

          return `<a ${attributes}>${text}</a>`;
        },
      },
    ];

    return replacements.reduce(
      (processed, { regex, replace }) =>
        processed.replace(regex, replace as any),
      text
    );
  };

  // Process each line
  lines.forEach((line, index) => {
    if (skipLines > 0) {
      skipLines--;
      return;
    }
    // Skip processing if max nesting level is reached
    if (nestingLevel > maxNestingLevel) {
      html.push(<p key={`error-${index}`}>Maximum nesting level reached</p>);
      return;
    }

    // Inside the parse function, where we handle different line types:

    // Handle definition lists - needs multiple line lookahead
    if (index < lines.length - 1) {
      const currentLine = line.trim();
      const nextLine = lines[index + 1].trim();

      if (
        currentLine !== "" &&
        !currentLine.startsWith(":") &&
        nextLine.startsWith(":")
      ) {
        const term = currentLine;
        const definitions: string[] = [];
        let i = index + 1;

        // Collect all subsequent definitions
        while (i < lines.length && lines[i].trim().startsWith(":")) {
          definitions.push(lines[i].trim().slice(1).trim());
          i++;
        }

        // Set the number of lines to skip
        skipLines = definitions.length;

        // Create the definition list element
        html.push(
          <dl key={`dl-${index}`} {...getElementProperties("lists")}>
            <dt>{processInlineFormatting(term)}</dt>
            {definitions.map((def, defIndex) => (
              <dd key={defIndex}>{processInlineFormatting(def)}</dd>
            ))}
          </dl>
        );

        return;
      }
    }

    // Task lists with nested support
    if (/^(\s*)-\s\[(x| )\]/.test(line.trim())) {
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
    if (/^#{1,6}\s/.test(line.trim())) {
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
    if (/^```(\S+)?(\s+\{.*\})?$/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        const match = line.trim().match(/^```(\S+)?/);
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
              {code}
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

    if (/^>\s/.test(line.trim())) {
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
        return;
      } else {
        html.push(
          <blockquote
            key={`quote-${index}`}
            {...getElementProperties("blockquotes")}
          >
            {processInlineFormatting(line.trim().replace(/^>\s/, ""))}
          </blockquote>
        );
        return;
      }
    }

    // Tables with alignment
    if (/^\|(.+\|)+/.test(line.trim())) {
      // Skip if we're in the middle of processing a table (i.e., this is a data row or alignment row)
      if (index > 0 && /^\|(.+\|)+/.test(lines[index - 1].trim())) {
        return;
      }
      // Check if this is not an alignment row - prevent treating alignment rows as new table starts
      if (!/^\|(\s*:?-+:?\s*\|)+/.test(line.trim())) {
        const tableRows: string[] = [line.trim()]; // Start with the header row
        const alignments: Array<"left" | "center" | "right"> = [];

        // Check for alignment row directly after the header row
        if (
          index + 1 < lines.length &&
          /^\|(\s*:?-+:?\s*\|)+/.test(lines[index + 1].trim())
        ) {
          const alignmentRow = lines[index + 1].trim();
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
          index++; // Skip alignment row
        }

        // Collect all body rows following the alignment row
        while (
          index + 1 < lines.length &&
          /^\|(.+\|)+/.test(lines[index + 1].trim()) &&
          !/^\|(\s*:?-+:?\s*\|)+/.test(lines[index + 1].trim())
        ) {
          tableRows.push(lines[index + 1].trim());
          index++;
        }

        // Only proceed if we have a valid table structure
        if (tableRows.length > 0) {
          // Process the header row to extract columns
          const headerRow = tableRows[0];
          const headerColumns = headerRow
            .split("|")
            .slice(1, -1)
            .map((col) => col.trim());

          // Generate the HTML for the table
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
                {tableRows.slice(1).map((row, rowIndex) => (
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
        }
      }
      return;
    }
    //TODO MOVE REGEX TO A CONFIG
    // Images
    if (/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/.test(line.trim())) {
      const match = line
        .trim()
        .match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/);

      if (match) {
        const [, alt = "", src = "", title = ""] = match;
        html.push(
          <img
            key={`img-${index}`}
            src={src}
            alt={alt}
            title={title || undefined}
            {...getElementProperties("images")}
          />
        );
      }
      return; // Stop further processing for this line
    }

    // Lists (ordered and unordered)
    if (/^(\s*)([-*+]|\d+\.)\s/.test(line.trim())) {
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
    const processedText = processInlineFormatting(line.trim());
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
