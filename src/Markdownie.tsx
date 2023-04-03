import React from "react";
import { parse, ParseOptions } from "./parser";

interface MarkdownProps {
  content: string;
  options?: ParseOptions;
}

function Markdown({ content, options }: MarkdownProps) {
  const html = parse(content, options);

  return <div>{html}</div>;
}

export default Markdown;
