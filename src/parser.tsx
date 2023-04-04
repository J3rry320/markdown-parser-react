import React from "react";

export interface ParseOptions {
  langPrefix?: string;
}

function processText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).filter(Boolean);
  return parts.map((part, index) => {
    if (/^\*\*([^*]+)\*\*$/.test(part)) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } else if (/^\*([^*]+)\*$/.test(part)) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
}
export function parse(markdown: string, options: ParseOptions = {}) {
  const { langPrefix = "language-" } = options;

  const lines = markdown.trim().split(/\r\n|\n/);

  const html: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang: any = null;
  let codeBlock: string[] = [];

  lines.forEach((line, index) => {
    // check for headers
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#{1,6}/)?.[0].length;
      const text = line.replace(/^#{1,6}\s/, "");
      html.push(React.createElement(`h${level}`, { key: index }, text));
    }

    // check for horizontal rule
    else if (/^(\*{3,}|-{3,}|_{3,})$/.test(line)) {
      html.push(<hr />);
    }

    // check for unordered list
    else if (/^(\*|-)\s/.test(line)) {
      const text = line.replace(/^(\*|-)\s/, "");
      html.push(<li>{text}</li>);
    }

    // check for ordered list
    else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      html.push(<li>{text}</li>);
    }

    // check for blockquote
    else if (/^>\s/.test(line)) {
      const text = line.replace(/^>\s?/, "");
      html.push(<blockquote>{text}</blockquote>);
    }

    // check for code block
    else if (/^```(\S+)?$/.test(line)) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        codeBlockLang = line.match(/^```(\S+)?$/)?.[1] || null;
      } else {
        const code = codeBlock.join("\n");
        html.push(
          <pre>
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
    } else if (inCodeBlock) {
      codeBlock.push(line);
    }

    // check for inline code
    else if (/`([^`]+)`/.test(line)) {
      const text = line.replace(/`([^`]+)`/g, `<code>{$1}</code>`);
      html.push(<p>{text}</p>);
    }

    // check for links
    else if (/\[([^\]]+)\]\(([^\)]+)\)/.test(line)) {
      const text = line.replace(
        /\[([^\]]+)\]\(([^\)]+)\)/g,
        '<a href="$2">$1</a>'
      );
      html.push(<p>{text}</p>);
    }

    // check for images
    else if (/!\[([^\]]+)\]\(([^\)]+)\)/.test(line)) {
      const match = line.match(/!\[([^\]]+)\]\(([^\)]+)\)/);
      const alt = match?.[1];
      const src = match?.[2];
      html.push(<img src={src} alt={alt} />);
    }
    // check for tables
    else if (/^\|(.+\|)+/.test(line)) {
      const tableRows = [line];
      while (lines.length && /^\|(.+\|)+/.test(lines[0])) {
        tableRows.push(lines.shift()!);
      }

      const headerRow = tableRows.shift();
      const headerColumns = headerRow!
        .substring(1, headerRow!.length - 1)
        .split("|")
        .map((column) => column.trim());

      const tableHead = (
        <thead>
          <tr>
            {headerColumns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
      );

      const tableBody = (
        <tbody>
          {tableRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row
                .substring(1, row.length - 1)
                .split("|")
                .map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell.trim()}</td>
                ))}
            </tr>
          ))}
        </tbody>
      );

      html.push(
        <table>
          {tableHead}
          {tableBody}
        </table>
      );
    }
    if (!inCodeBlock && /^(.*\*{1,2}.*|\*{1,2}.*\*{1,2})$/.test(line)) {
      const processedText = processText(line);
      html.push(<p key={index}>{processedText}</p>);
    }
    // check for charts (Assuming chartData is a JSON string)

    // regular paragraph
    else {
      html.push(<p>{line}</p>);
    }
  });

  return html;
}
