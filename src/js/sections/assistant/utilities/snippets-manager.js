export default class SnippetsManager {
  constructor(register, callback) {
    if (!register) {
      throw new Error('Snippets\' Register is not defined.');
    }
    this._register = register;
    this._callback = callback;
  };

  registerSnippet = (snippet) => {
    this._register[snippet.input] = (value) => Promise.all([value, snippet.output(value)])
      .then(([value, response]) => this._callback(value, response))
      .catch(error => console.error(error));
  };

  getSnippets = () => {
    return this._register;
  };
};
