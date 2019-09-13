export default class SnippetsManager {
  constructor(register, callback) {
    if (!register) {
      throw new Error('Snippets Register is not defined.');
    }
    this._register = register;
    this._callback = callback;
  };

  registerSnippet = (snippet) => {
    this._register[snippet.input] = (value) => Promise.resolve(snippet.output(value))
      .then(response => this._callback(response))
      .catch(error => console.error(error));
  };

  getSnippets = () => {
    return this._register;
  };
};