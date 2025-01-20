// @ts-nocheck
import { parse, ParseOptions } from "../src/parser";
import React, { ReactElement } from "react";

describe("Markdown Parser", () => {
  // Helper function to render and match snapshots
  const renderMarkdown = (markdown: string, options: ParseOptions = {}) => {
    return parse(markdown, options);
  };

  // Helper function to get React element from ReactNode
  const getReactElement = (node: React.ReactNode): ReactElement | null => {
    if (React.isValidElement(node)) {
      return node;
    }
    return null;
  };

  describe("Headers", () => {
    it("should parse headers of different levels", () => {
      const markdown = `# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6`;
      const result = renderMarkdown(markdown);
      expect(result).toHaveLength(6);
      const h1 = getReactElement(result[0]);
      const h6 = getReactElement(result[5]);
      expect(h1?.type).toBe("h1");
      expect(h6?.type).toBe("h6");
    });

    it("should parse headers with custom IDs", () => {
      const markdown = `# Header {#custom-id}`;
      const result = renderMarkdown(markdown);
      const header = getReactElement(result[0]);
      expect(header?.props.id).toBe("custom-id");
    });
  });

  describe("Paragraphs and Text Formatting", () => {
    it("should parse basic paragraphs", () => {
      const markdown = `This is paragraph 1.

This is paragraph 2.`;
      const result = renderMarkdown(markdown);
      expect(result).toHaveLength(2);
      const p1 = getReactElement(result[0]);
      expect(p1?.type).toBe("p");
    });

    it("should handle inline formatting", () => {
      const markdown = `**bold** *italic* ~~strikethrough~~ \`code\` $E=mc^2$`;
      const result = renderMarkdown(markdown);
      const p = getReactElement(result[0]);
      const html = p?.props.children.props.dangerouslySetInnerHTML.__html;
      expect(html).toContain("<strong>bold</strong>");
      expect(html).toContain("<em>italic</em>");
      expect(html).toContain("<del>strikethrough</del>");
      expect(html).toContain("<code>code</code>");
      expect(html).toContain('<span class="math-inline">E=mc^2</span>');
    });
  });
  describe("Definition Lists", () => {
    it("should parse a single term with single definition", () => {
      const markdown = `Term
  : Definition`;
      const result = renderMarkdown(markdown);
      const dl = getReactElement(result[0]);

      expect(dl?.type).toBe("dl");
      const children = dl?.props.children;
      expect(children[0].type).toBe("dt");
      expect(children[0].props.children).toBe("Term");
      expect(children[1][0].type).toBe("dd");
      expect(children[1][0].props.children).toBe("Definition");
    });

    it("should parse a single term with multiple definitions", () => {
      const markdown = `Term
  : First definition
  : Second definition
  : Third definition`;
      const result = renderMarkdown(markdown);
      const dl = getReactElement(result[0]);

      expect(dl?.type).toBe("dl");
      const children = dl?.props.children;
      expect(children).toHaveLength(2);
      expect(children[0].type).toBe("dt");
      expect(children[0].props.children).toBe("Term");

      // Check all definitions
      for (let i = 0; i <= 2; i++) {
        expect(children[1][i].type).toBe("dd");
      }
      expect(children[1][0].props.children).toBe("First definition");
      expect(children[1][1].props.children).toBe("Second definition");
      expect(children[1][2].props.children).toBe("Third definition");
    });

    it("should parse multiple terms with their definitions", () => {
      const markdown = `First Term
  : Definition 1
  
  Second Term
  : Definition 2`;
      const result = renderMarkdown(markdown);

      // Check first definition list
      const dl1 = getReactElement(result[0]);
      expect(dl1?.type).toBe("dl");
      expect(dl1?.props.children[0].type).toBe("dt");
      expect(dl1?.props.children[0].props.children).toBe("First Term");
      expect(dl1?.props.children[1][0].type).toBe("dd");
      expect(dl1?.props.children[1][0].props.children).toBe("Definition 1");

      // Check second definition list
      const dl2 = getReactElement(result[1]);
      expect(dl2?.type).toBe("dl");
      expect(dl2?.props.children[0].type).toBe("dt");
      expect(dl2?.props.children[0].props.children).toBe("Second Term");
      expect(dl2?.props.children[1][0].type).toBe("dd");
      expect(dl2?.props.children[1][0].props.children).toBe("Definition 2");
    });
  });

  describe("Lists", () => {
    it("should parse unordered lists", () => {
      const markdown = `- Item 1
- Item 2
  - Nested Item
- Item 3`;
      const result = renderMarkdown(markdown);
      const ul = getReactElement(result[0]);
      expect(ul?.type).toBe("ul");
    });

    it("should parse ordered lists", () => {
      const markdown = `1. First
2. Second
   1. Nested
3. Third`;
      const result = renderMarkdown(markdown);
      const ol = getReactElement(result[0]);
      expect(ol?.type).toBe("ol");
    });

    it("should handle task lists", () => {
      const markdown = `- [ ] Unchecked task
- [x] Checked task`;
      const result = renderMarkdown(markdown);
      const div1 = getReactElement(result[0]);
      const div2 = getReactElement(result[1]);
      expect(div1?.props.children[0].props.checked).toBe(false);
      expect(div2?.props.children[0].props.checked).toBe(true);
    });
  });

  describe("Code Blocks", () => {
    it("should parse code blocks with language", () => {
      const markdown = "```javascript\nconst x = 1;\n```";
      const result = renderMarkdown(markdown);
      const pre = getReactElement(result[0]);
      expect(pre?.type).toBe("pre");
      expect(pre?.props.children.props.className).toBe("language-javascript");
    });

    it("should handle code blocks without language", () => {
      const markdown = "```\nplain text\n```";
      const result = renderMarkdown(markdown);
      const pre = getReactElement(result[0]);
      expect(pre?.props.children.props.className).toBeUndefined();
    });
  });

  describe("Tables", () => {
    it("should parse tables with alignment", () => {
      const markdown = `| Left | Center | Right |
|:-----|:------:|------:|
| 1    | 2      | 3     |`;
      const result = renderMarkdown(markdown);
      const table = getReactElement(result[0]);
      expect(table?.type).toBe("table");
      const [thead] = table?.props.children || [];
      const cells = thead?.props.children.props.children;
      expect(cells[0].props.style.textAlign).toBe("left");
      expect(cells[1].props.style.textAlign).toBe("center");
      expect(cells[2].props.style.textAlign).toBe("right");
    });
  });

  describe("Blockquotes", () => {
    it("should parse blockquotes", () => {
      const markdown = "> This is a quote\n> Multiple lines";
      const result = renderMarkdown(markdown);
      const blockquote = getReactElement(result[0]);
      expect(blockquote?.type).toBe("blockquote");
    });

    it("should parse blockquotes with citations", () => {
      const markdown = "> Quote text -- Author";
      const result = renderMarkdown(markdown);
      const blockquote = getReactElement(result[0]);
      expect(blockquote?.props.children).toHaveLength(2);
      expect(blockquote?.props.children[1].type).toBe("footer");
    });
    it("should parse blockquotes without citations", () => {
      const markdown = "> Quote text";
      const result = renderMarkdown(markdown);
      const blockquote = getReactElement(result[0]);
      expect(blockquote?.props.children).toHaveLength(2);
      expect(blockquote?.type).toBe("blockquote");
      expect(blockquote?.props.children[0]).toContain("Quote text");
    });
  });

  describe("Links and Images", () => {
    it("should parse links with titles", () => {
      const markdown = '[Link](https://example.com "Title")';
      const result = renderMarkdown(markdown);
      const p = getReactElement(result[0]);
      const html = p?.props.children.props.dangerouslySetInnerHTML.__html;
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('title="Title"');
    });

    it("should parse images", () => {
      const markdown = '![Alt text](image.jpg "Image title")';
      const result = renderMarkdown(markdown);
      const img = getReactElement(result[0]);
      expect(img?.type).toBe("img");
      expect(img?.props.alt).toBe("Alt text");
      expect(img?.props.title).toBe("Image title");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom classes", () => {
      const options: ParseOptions = {
        customClasses: {
          headings: "custom-heading",
          paragraphs: "custom-paragraph",
        },
      };
      const markdown = `# Header\nParagraph`;
      const result = renderMarkdown(markdown, options);
      const header = getReactElement(result[0]);
      const paragraph = getReactElement(result[1]);
      expect(header?.props.className).toBe("custom-heading");
      expect(paragraph?.props.className).toBe("custom-paragraph");
    });

    it("should apply custom styles", () => {
      const options: ParseOptions = {
        customStyles: {
          headings: { color: "red" },
          paragraphs: { fontSize: "16px" },
        },
      };
      const markdown = `# Header\nParagraph`;
      const result = renderMarkdown(markdown, options);
      const header = getReactElement(result[0]);
      const paragraph = getReactElement(result[1]);
      expect(header?.props.style).toEqual({ color: "red" });
      expect(paragraph?.props.style).toEqual({ fontSize: "16px" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", () => {
      const result = renderMarkdown("");
      expect(result).toHaveLength(0);
    });

    it("should handle maximum nesting level", () => {
      const markdown =
        "- Level 1\n  - Level 2\n    - Level 3\n      - Level 4\n        - Level 5\n          - Level 6\n            - Level 7";
      const result = renderMarkdown(markdown, { maxNestingLevel: 3 });
      const errorElement = result.find((node) => {
        const element = getReactElement(node);
        return element?.props.children === "Maximum nesting level reached";
      });
      expect(errorElement).toBeTruthy();
    });

    it("should handle malformed tables", () => {
      const markdown = "| Header 1 | Header 2\n|--------|";
      const result = renderMarkdown(markdown);
      const table = getReactElement(result[0]);
      expect(table?.type).toBe("table");
      expect(
        table?.props.children[0].props.children.props.children
      ).toHaveLength(1);
    });
  });
});
