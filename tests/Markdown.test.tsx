/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Markdown from "../src/Markdown";

describe("Markdown Component", () => {
  it("renders headings, paragraphs, and links correctly", () => {
    const { container } = render(
      <Markdown
        content="# Hello World 
      This is a **markdown** paragraph with [links](https://example.com)."
      />
    );

    expect(container.querySelector("div > h1")).toHaveTextContent(
      "Hello World"
    );
    expect(container.querySelector("div > p > span")).toHaveTextContent(
      "This is a markdown paragraph with links."
    );
    expect(container.querySelector("p> span > a")).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });

  it("renders images with alt text and titles", () => {
    const { getByAltText } = render(
      <Markdown content='![Alt text](https://example.com/image.jpg "Image Title")' />
    );

    const img = getByAltText("Alt text");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
    expect(img).toHaveAttribute("title", "Image Title");
  });

  it("applies custom class name and styles", () => {
    const { container } = render(
      <Markdown
        content="# Custom Style Test"
        className="custom-class"
        style={{ color: "red" }}
      />
    );

    const markdownContainer = container.querySelector(".markdown-container");
    expect(markdownContainer).toHaveClass("custom-class");
    expect(markdownContainer).toHaveStyle("color: red");
  });

  it("renders as an article element when `asArticle` is true", () => {
    const { container } = render(
      <Markdown content="# Article Test" asArticle={true} />
    );

    const article = container.querySelector("article");
    expect(article).toBeInTheDocument();
    expect(article).toHaveTextContent("Article Test");
  });

  it("renders fallback content on parsing errors", () => {
    const mockParse = jest.fn(() => {
      throw new Error("Parsing Error");
    });

    jest.mock("../src/parser", () => ({
      parse: mockParse,
    }));

    const { getByText } = render(<Markdown content="Invalid Markdown" />);
    expect(getByText("Invalid Markdown")).toBeInTheDocument();
  });

  it("handles blockquotes correctly", () => {
    const { container } = render(
      <Markdown content="> This is a blockquote." />
    );

    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent("This is a blockquote.");
  });

  it("renders code blocks with correct styles", () => {
    const { container } = render(
      <Markdown
        content="```js
      console.log('Hello, world!');
      ```"
      />
    );

    const codeBlock = container.querySelector("div > pre");
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent("console.log('Hello, world!');");
  });

  it("handles tables correctly", () => {
    const markdownContent = `
      | Header 1 | Header 2 |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
      | Cell 3   | Cell 4   |
    `;

    const { container } = render(<Markdown content={markdownContent} />);
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent("Header 1");
    expect(table).toHaveTextContent("Header 2");
    expect(table).toHaveTextContent("Cell 1");
    expect(table).toHaveTextContent("Cell 4");
  });

  it("renders with accessibility attributes", () => {
    const { container } = render(
      <Markdown
        content="Accessible Markdown"
        aria={{ label: "Markdown content", describedBy: "description" }}
      />
    );

    const markdownContainer = container.querySelector(".markdown-container");
    expect(markdownContainer).toHaveAttribute("aria-label", "Markdown content");
    expect(markdownContainer).toHaveAttribute(
      "aria-describedby",
      "description"
    );
  });
});
