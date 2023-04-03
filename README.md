# Markdownie

Markdownie is a lightweight and configurable Markdown renderer for React and Next.js that supports syntax highlighting. It is built with TypeScript and can be easily integrated into any React or Next.js project.

## Installation

You can install Markdownie via npm or yarn:



``` bash
npm install markdownie
# or
yarn add markdownie
```

## Usage

To use Markdownie, simply import the `Markdown` component and pass it the Markdown text you want to render:



```typescript
import { Markdown } from 'markdownie';

function MyComponent() {
  const markdown = `# Hello, world!

This is **Markdownie**, a *flexible* Markdown renderer.

## Syntax Highlighting

\`\`\`javascript
const message = 'Hello, world!';
console.log(message);
\`\`\``;

  return <Markdown source={markdown} />;
}
```
## Parser Options

The following options can be configured for the Markdown parser:

### `langPrefix`

Specifies the prefix to use for language classes in code blocks. The default value is `'language-'`.


``` typescript
const parseOptions = {
  langPrefix: 'lang-',
};
```
You can also configure the Markdown parser options by passing a `parseOptions` prop:
```typescript




import { Markdown } from 'markdownie';

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

  return <Markdown source={markdown} parseOptions={parseOptions} />;
}
```
## Hire Me

If you need a freelance developer for your project, feel free to contact me at [j3@nobunagadesignlabs.com](mailto:j3@nobunagadesignlabs.com). I have experience with React, Next.js, TypeScript, and Node.js, and I would be happy to discuss your project with you.

## Credits

Markdownie is inspired by and based on the [marked](https://github.com/markedjs/marked) library.

## License

Markdownie is licensed under the [MIT License](https://chat.openai.com/chat/LICENSE).