import React, { useMemo } from "react";
import { parse, ParseOptions } from "./parser";

export interface MarkdownProps {
  /**
   * The markdown content to be rendered.
   * @example
   * ```md
   * # Hello World
   *
   * This is a **markdown** paragraph with [links](https://example.com)
   * ```
   */
  content: string;

  /**
   * Configuration options for the markdown parser.
   * @optional
   */
  options?: ParseOptions;

  /**
   * Additional CSS class names to be applied to the container.
   * @optional
   */
  className?: string;

  /**
   * Custom styles to be applied to the container.
   * @optional
   */
  style?: React.CSSProperties;

  /**
   * Whether to wrap the content in an article element instead of a div.
   * Recommended for semantic HTML when rendering full articles or blog posts.
   * @default false
   * @optional
   */
  asArticle?: boolean;

  /**
   * Custom ID to be applied to the container.
   * @optional
   */
  id?: string;

  /**
   * Additional accessibility attributes for the container.
   * @optional
   */
  aria?: {
    label?: string;
    describedBy?: string;
  };
}

/**
 * A React component that renders markdown content with customizable options.
 *
 * @example
 * ```tsx
 * import Markdown from "markdown-parser-react";
 * // Basic usage
 * <Markdown content="# Hello World" />
 *
 * // With custom options
 * <Markdown
 *   content={markdownContent}
 *   options={{
 *     enabledFeatures: {
 *       footnotes: true,
 *       taskLists: true
 *     },
 *     customStyles: {
 *       headings: {
 *         color: 'blue'
 *       }
 *     }
 *   }}
 *   className="custom-markdown"
 *   asArticle={true}
 * />
 * ```
 * * @remarks
 * This code is open source under the MIT license. The author can be hired by visiting [Jerry's LinkedIn](https://www.linkedin.com/in/jerrythejsguy/).
 */
export function Markdown({
  content,
  options,
  className,
  style,
  asArticle = false,
  id,
  aria,
}: MarkdownProps) {
  // Memoize parsed content to prevent unnecessary re-renders
  const parsedContent = useMemo(() => {
    try {
      return parse(content, options);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return [<p key="error">Error parsing markdown content</p>];
    }
  }, [content, options]);

  // Common props for container
  const containerProps = {
    className: className
      ? `markdown-container ${className}`
      : "markdown-container",
    style,
    id,
    ...(aria?.label && { "aria-label": aria.label }),
    ...(aria?.describedBy && { "aria-describedby": aria.describedBy }),
  };

  // Use article tag for full content, div for partial content
  const Container = asArticle ? "article" : "div";

  return <Container {...containerProps}>{parsedContent}</Container>;
}

export const defaultStyles = `
  .markdown-container {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 100%;
  }

  .markdown-container img {
    max-width: 100%;
    height: auto;
  }

  .markdown-container pre {
    overflow-x: auto;
    padding: 1rem;
    background-color: #f6f8fa;
    border-radius: 4px;
  }

  .markdown-container blockquote {
    border-left: 4px solid #ddd;
    margin: 0;
    padding-left: 1rem;
    color: #666;
  }
`;

export default Markdown;
