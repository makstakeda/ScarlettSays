import 'babel-polyfill';
import SnippetsManager from './snippets-manager';

describe('SnippetsManager', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should create expected instance', async () => {
    const callback = jest.fn();
    const snippetsManager = new SnippetsManager({}, callback);
    expect(callback).toHaveBeenCalledTimes(0);
    const mockOutputResult = 'hi there';
    const testSnippet = { input: 'snippet-input', output: jest.fn(() => mockOutputResult)};
    snippetsManager.registerSnippet(testSnippet);
    expect(testSnippet.output).toHaveBeenCalledTimes(0);
    const registeredSnippets = snippetsManager.getSnippets();
    expect(Object.keys(registeredSnippets)).toMatchObject([testSnippet.input]);
    const testPhrase = 'hello world';
    await registeredSnippets[testSnippet.input](testPhrase);
    expect(testSnippet.output).toHaveBeenCalledTimes(1);
    expect(testSnippet.output).toHaveBeenCalledWith(testPhrase);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(testPhrase, mockOutputResult);
  });

  test('should throw an error if register is not defined', () => {
    expect(() => new SnippetsManager()).toThrow('Snippets\' Register is not defined.');
  });
});
