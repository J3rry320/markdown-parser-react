

#  Markdown Parser React

  

A flexible and feature-rich React component for rendering Markdown content with customizable styling, extensive formatting options, and robust typings.

![markdown-parser-react](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0h9v6cfybc92ozlfa65x.png)
  

![npm](https://img.shields.io/npm/v/markdown-parser-react)  ![npm bundle size](https://img.shields.io/bundlephobia/min/markdown-parser-react)
![downloads](https://img.shields.io/npm/dt/markdown-parser-react?color=green&label=downloads&logo=npm)
  ![stars](https://img.shields.io/github/stars/J3rry320/markdown-parser-react?color=brightgreen&label=stars&logo=github)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)![Code Coverage](https://img.shields.io/badge/Coverage-97.45%25-brightgreen)

##  Features

  

- 🚀 Full Markdown syntax support

- 💅 Customizable styling with CSS classes and inline styles

- 🔒 HTML sanitization

- ♿ Accessibility support

- 📱 Responsive image handling

- 🎨 Syntax highlighting for code blocks

- 📝 Task list support

- 📊 Table support with alignment options

- 🔗 Custom link handling

- 🎯 Definition lists

- 📑 Custom IDs for headers

- 🔢 Nested list support

- ➗ Supports Math Equations



##  Installation

  

Install Markdown Parser React using npm or yarn or pnpm:

  
  

  

```bash
npm  install  markdown-parser-react

# or

yarn  add  markdown-parser-react

# or

pnpm  add  markdown-parser-react
```

  

##  Basic Usage

  
The basic usage example demonstrates rendering a simple Markdown string:

```tsx

import Markdown from "markdown-parser-react";

function MyComponent() {
  return <Markdown content="# Hello World\n\nThis is **markdown** content." />;
}


```

  

##  Advanced Usage

 In the advanced usage example, we see how you can configure the component with custom styling, classes, and additional features like task lists, code highlighting, and tables

```tsx

import Markdown from "markdown-parser-react";

function BlogPost() {
  const markdownContent = `

# Welcome to My Blog

This is a _formatted_ paragraph with a [link](https://example.com).

- [x] Task 1

- [ ] Task 2

\`\`\`javascript

const hello = "world";

console.log(hello);

\`\`\`

| Column 1 | Column 2 |

|----------|----------|

| Cell 1 | Cell 2 |

`;

  return (
    <Markdown
      content={markdownContent}
      options={{
        customClasses: {
          headings: "blog-heading",

          paragraphs: "blog-paragraph",
        },

        customStyles: {
          headings: {
            color: "#2c3e50",

            fontFamily: "Georgia, serif",
          },
        },

        linkTarget: "_blank",

        sanitizeHtml: true,

        maxNestingLevel: 4,
      }}
      className="blog-content"
      asArticle={true}
      aria={{
        label: "Blog post content",

        describedBy: "blog-description",
      }}
    />
  );
}

```

  

##  Usage with Next.js

  

If you're using Next.js, you may encounter the _**"Text content does not match server-rendered HTML"**_ error.

To avoid this issue, you can use `next/dynamic` to dynamically import the `Markdown` component, ensuring that it is only rendered on the client-side.

  

Here's how to use `Markdown` with Next.js:

  
  

```tsx
import dynamic from "next/dynamic";

const Markdown = dynamic(
  () => import("markdown-parser-react").then((markdown) => markdown),

  {
    ssr: false,
  }
);

interface MyComponentProps {
  content: string;

  options?: {
    langPrefix?: string;
    linkTarget?: string; 
  };
}

export const MyComponent: React.FC<MyComponentProps> = ({
  content,
  options,
}) => {
  return (
    <div>
      <Markdown content={content} options={options} />
    </div>
  );
};


```

  

By using the `next/dynamic` function and passing ssr as false, we ensure that the `Markdown` component is only rendered on the client-side, preventing the mismatch error between server-rendered and client-rendered HTML in Next.js projects.

  

##  Configuration Options
###  Props

 
The `MarkdownProps` interface defines the properties that can be passed into the component. These props allow you to customize the behavior, appearance, and accessibility of the rendered Markdown.

  
| **Prop**        | **Type**                                   | **Description**                                                                                                                                                    | **Example**                                                                                   |
|-----------------|--------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **`content`**   | `string`                                   | The Markdown content to be rendered. This is the main content of the component.                                                                                     | ```md<br># Hello World<br>**Bold text** [Link](https://example.com)```                        |
| **`options`**   | `ParseOptions` (optional)                  | Configuration options for the Markdown parser.                                                                                                                      |                                                                                               |
| **`className`** | `string` (optional)                        | Additional CSS class names to be applied to the container.                                                                                                          | `className="my-markdown"`                                                                     |
| **`style`**     | `React.CSSProperties` (optional)           | Custom styles to be applied to the container.                                                                                                                       | `style={{ backgroundColor: 'lightgray' }}`                                                    |
| **`asArticle`** | `boolean` (optional)                       | Whether to wrap the content in an article element instead of a div. Recommended for semantic HTML when rendering full articles or blog posts. Defaults to `false`. | `asArticle={true}`                                                                            |
| **`id`**        | `string` (optional)                        | Custom ID to be applied to the container.                                                                                                                           | `id="blog-post-1"`                                                                            |
| **`aria`**      | `{ label?: string, describedBy?: string }` (optional) | Additional accessibility attributes for the container. `label` is the accessible name, and `describedBy` references an element that provides more information.     | `aria={{ label: 'Blog Content', describedBy: 'content-description' }}`                        |
###  ParseOptions
  

The `ParseOptions` interface provides configuration for parsing and rendering the Markdown content. It gives you the ability to customize how the content is parsed and displayed, including applying custom classes, styles, and controlling link behavior.

| **Option**           | **Type**                                   | **Description**                                                                                                      | **Example**                                                                                 |
|----------------------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **`langPrefix`**     | `string` (optional)                        | Prefix for language-specific code block classes.                                                                     | `langPrefix="language-"`                                                                    |
| **`customClasses`**  | `CustomClasses` (optional)                 | Custom CSS classes for different Markdown elements.                                                                  | `{ headings: 'custom-heading', paragraphs: 'custom-paragraph' }`                            |
| **`customStyles`**   | `CustomStyles` (optional)                  | Custom CSS styles for different Markdown elements.                                                                   | `{ headings: { color: 'blue', fontFamily: 'Arial' } }`                                      |
| **`linkTarget`**     | `"_blank" | "_self" | "_parent" | "_top"` (optional) | Specifies how links should open. By default, it opens links in a new tab (`_blank`).                                 | `linkTarget="_self"`                                                                         |
| **`sanitizeHtml`**   | `boolean` (optional)                       | Whether to sanitize HTML content to prevent XSS attacks. Defaults to `false`.                                        | `sanitizeHtml={true}`                                                                       |
| **`maxNestingLevel`**| `number` (optional)                        | Maximum allowed nesting level for lists. Defaults to `6`.                                                            | `maxNestingLevel={4}`                                                                        |
##  Supported Markdown Features

  

###  Basic Formatting

- Headers (H1-H6)

- Bold and Italic text

- Strikethrough

- Links

- Images

- Blockquotes with citations

- Ordered and unordered lists

- Code blocks with syntax highlighting

  

###  Extended Features

- Task lists with checkboxes

- Tables with alignment options

- Definition lists

- Custom header IDs

- Math expressions (`$...$`)

- Superscript (`^...^`)

- Subscript (`~...~`)

- Highlighted text (`==...==`)

  

###  Code Block Example

````markdown

```javascript

function hello() {
  console.log("Hello, world!");
}


```

````

  

###  Table Example

```markdown

| Left | Center | Right |

|:-----|:------:|------:|

| L1 | C1 | R1 |

```
##  Customization

  

You can customize how the Markdown content is displayed by adjusting the appearance of different elements like headings, paragraphs, links, and more. Below are the options for customizing the styles and classes.

###  Custom Classes
You can pass your classNames to customClasses config inside the options object passed as props to the component

 | **Element**      | **Type**       | **Description**                                                                                                        | **Example**                              |
|------------------|----------------|------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| **`headings`**   | `string`       | Custom class for headings (H1-H6).                                                                                     | `headings:"custom-heading-class"`        |
| **`paragraphs`** | `string`       | Custom class for paragraphs.                                                                                           | `paragraphs:"custom-paragraph-class"`    |
| **`lists`**      | `string`       | Custom class for lists (ordered and unordered).                                                                        | `lists:"custom-list-class"`              |
| **`blockquotes`**| `string`       | Custom class for blockquotes.                                                                                          | `blockquotes:"custom-blockquote-class"`  |
| **`codeBlocks`** | `string`       | Custom class for code blocks.                                                                                          | `codeBlocks="custom-code-class"`         |
| **`tables`**     | `string`       | Custom class for tables.                                                                                               | `tables:"custom-table-class"`            |
| **`links`**      | `string`       | Custom class for links.                                                                                                | `links:"custom-link-class"`              |
| **`images`**     | `string`       | Custom class for images.                                                                                               | `images:"custom-image-class"`            |

###  Custom Styles

You can pass your styles to the customStyles property inside the option object. 

| **Element**      | **Type**        | **Description**                                                                                                        | **Example**                                           |
|------------------|-----------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **`headings`**   | `CSSProperties` | Custom styles for headings (H1-H6).                                                                                    | `headings:{{ color: 'blue', fontSize: '2em' }}`       |
| **`paragraphs`** | `CSSProperties` | Custom styles for paragraphs.                                                                                          | `paragraphs:{{ lineHeight: '1.5' }}`                  |
| **`lists`**      | `CSSProperties` | Custom styles for lists (ordered and unordered).                                                                       | `lists:{{ marginLeft: '20px' }}`                      |
| **`blockquotes`**| `CSSProperties` | Custom styles for blockquotes.                                                                                         | `blockquotes:{{ borderLeft: '4px solid gray' }}`      |
| **`codeBlocks`** | `CSSProperties` | Custom styles for code blocks.                                                                                         | `codeBlocks:{{ backgroundColor: 'black', color: 'white' }}` |
| **`tables`**     | `CSSProperties` | Custom styles for tables.                                                                                              | `tables:{{ borderCollapse: 'collapse' }}`             |
| **`links`**      | `CSSProperties` | Custom styles for links.                                                                                               | `links:{{ textDecoration: 'underline' }}`             |
| **`images`**     | `CSSProperties` | Custom styles for images.                                                                                              | `images:{{ maxWidth: '100%' }}`                       |
##  Default Styling

  

The component comes with default styles that can be imported:

  

```tsx

import { defaultStyles } from "markdown-parser-react";

// In your global CSS or styled-components

const GlobalStyle = createGlobalStyle`

${defaultStyles}

`;


```
##  Accessibility

  

The component follows WCAG guidelines and provides:

- Semantic HTML structure

- ARIA attributes support

- Keyboard navigation for interactive elements

- Screen reader-friendly content structure

  

##  Browser Support

  

- Chrome (latest)

- Firefox (latest)

- Safari (latest)

- Edge (latest)

- IE11 (with appropriate polyfills)

##  Contributing

  

Contributions are welcome! Please read our [contributing guidelines](https://github.com/J3rry320/markdown-parser-react/blob/main/CONTRIBUTING.md) for more information.

  ## Issues

If you encounter any issues or have suggestions for improvements, please report them on the [GitHub Issues page](https://github.com/J3rry320/markdown-parser-react/issues)

##  Hire Me

  

If you need a freelance developer for your project, feel free to contact me at [ LinkedIn](https://www.linkedin.com/in/jerrythejsguy/) I have experience with React, Next.js, TypeScript, and Node.js, and I would be happy to discuss your project with you.

  

## License

This project is licensed under the MIT License. See the [LICENSE file](https://github.com/J3rry320/markdown-parser-react/blob/main/LICENSE) for details.

  

Happy Coding Everyone! 🧑🏽‍💻