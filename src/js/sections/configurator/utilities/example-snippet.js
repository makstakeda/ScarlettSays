export const exampleSnippet = `{
  input: 'what time is now?',
  output: () => {
    const date = new Date();
    return \`\${date.getHours()} hours \${date.getMinutes()} minutes\`
  },
}`;
