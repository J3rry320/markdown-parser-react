# Markdownie

Markdownie is a lightweight, configurable, and easy-to-use Markdown renderer for React and Next.js with syntax highlighting support. It is built with TypeScript and can be effortlessly integrated into any React or Next.js project.

![npm](https://img.shields.io/npm/v/markdownie)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/J3rry320/markdownie/CI)
![npm bundle size](https://img.shields.io/bundlephobia/min/markdownie)

## Installation

Install Markdownie using npm or yarn:

```bash
npm install markdownie
# or
yarn add markdownie
```

## Usage

To use Markdownie, import the `Markdown` component and pass the Markdown text you want to render:



```typescript
import  Markdown from 'markdownie';

function MyComponent() {
  const markdown = `# Hello, world!

This is **Markdownie**, a *flexible* Markdown renderer.

## Syntax Highlighting

\`\`\`javascript
const message = 'Hello, world!';
console.log(message);
\`\`\``;

  return <Markdown content={markdown} />;
}
``` 

## Usage with Next.js

If you're using Next.js, you may encounter the ***"Text content does not match server-rendered HTML"*** error. To avoid this issue, you can use `next/dynamic` to dynamically import the `Markdown` component, ensuring that it is only rendered on the client-side.

Here's how to use `Markdown` with Next.js:

```typescript
import dynamic from 'next/dynamic';

const Markdown = dynamic(() => import('markdownie').then((markdown) => markdown),{
  ssr: false,
});

interface MyComponentProps {
  content: string;
  options?: {
    langPrefix?: string;
  };
}

export const MyComponent: React.FC<MyComponentProps> = ({ content, options }) => {
  return (
    <div>
      <Markdown content={content} options={options} />
    </div>
  );
};
``` 

By using the `next/dynamic` function and passing ssr as false, we ensure that the `Markdown` component is only rendered on the client-side, preventing the mismatch error between server-rendered and client-rendered HTML in Next.js projects.

## Parser Options

You can configure the following options for the Markdown parser:

### `langPrefix`

Specifies the prefix to use for language classes in code blocks. The default value is `'language-'`.

```typescript

`const options = {
  langPrefix: 'lang-',
};
```

Configure the Markdown parser options by passing an `options` prop:



```typescript
import  Markdown  from 'markdownie';

function MyComponent() {
  const markdown = `# Hello, world!

This is **Markdownie**, a *flexible* Markdown renderer.

## Syntax Highlighting

\`\`\`javascript
const message = 'Hello, world!';
console.log(message);
\`\`\``;

  const parseOptions = {
    langPrefix: 'lang-',
  };

  return <Markdown content={markdown} options={parseOptions} />;
}
``` 

## Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/J3rry320/markdownie/blob/main/CONTRIBUTING.md) for more information.

## Hire Me

If you need a freelance developer for your project, feel free to contact me at [j3@nobunagadesignlabs.com](mailto:j3@nobunagadesignlabs.com). I have experience with React, Next.js, TypeScript, and Node.js and would be happy to discuss your project with you.

## Credits

Markdownie is inspired by and based on the [marked](https://github.com/markedjs/marked) library.

## License

Markdownie is licensed under the [MIT License](https://github.com/J3rry320/markdownie/blob/main/LICENSE).