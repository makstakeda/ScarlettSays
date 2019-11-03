import 'angular/angular';
import 'angular-mocks/angular-mocks';
import 'babel-polyfill';
import '../../app';
import './configurator';
import { exampleSnippet } from './utilities/example-snippet';
import CodeMirror from 'codemirror/lib/codemirror';
jest.mock('codemirror/lib/codemirror');
CodeMirror.mockImplementation(() => ({ getValue: () => exampleSnippet }));

window.componentHandler = {
  upgradeAllRegistered: () => {}
};

describe('configurator', () => {
  let $element;
  let $scope;
  let httpMock;

  let instance;
  let editable;

  beforeEach(() => {
    jest.clearAllMocks();
    angular.mock.module('scarlettModule');

    instance = document.createElement('div');
    instance.id = 'snippets-editor';
    document.body.appendChild(instance);

    editable = document.createElement('div');
    editable.id = 'snippets-lib-editor';
    document.body.appendChild(editable);

    inject(($rootScope, $compile, $http) => {
      httpMock = $http;
      httpMock.get = jest.fn(path => Promise.resolve({ data: path === '/snippets' ? [] : exampleSnippet }));
      httpMock.post = jest.fn(() => Promise.resolve());
      $element = angular.element('<configurator></configurator>');
      $compile($element)($rootScope);
      $scope = $element.isolateScope();
    })
  });

  afterEach(() => {
    instance.remove();
    editable.remove();
  });

  test('should invoke registered snippets', () => {
    expect(httpMock.get).toHaveBeenCalledTimes(1);
    expect(httpMock.get).toHaveBeenCalledWith('/snippets');
  });

  test('should create editor instance with expected content', () => {
    expect(CodeMirror).toHaveBeenCalledTimes(1);
    expect(CodeMirror).toHaveBeenCalledWith(
      document.getElementById('snippets-editor'),
      { value: exampleSnippet, mode: 'javascript', theme: 'material', lineNumbers: true }
    );
  });

  test('should get and update existed snippet on `updateSnippet`', async () => {
    const testFileName = 'test-snippet.js';
    await $scope.getSnippet({ file: testFileName });
    expect(httpMock.get).toHaveBeenCalledTimes(2);
    expect(httpMock.get.mock.calls[0]).toEqual(['/snippets']);
    expect(httpMock.get.mock.calls[1]).toEqual([`/read-snippet?file=${testFileName}`]);
    expect(CodeMirror).toHaveBeenCalledTimes(2);
    expect(CodeMirror.mock.calls[0]).toEqual([
      document.getElementById('snippets-editor'),
      { value: exampleSnippet, mode: 'javascript', theme: 'material', lineNumbers: true }
    ]);
    expect(CodeMirror.mock.calls[1]).toEqual([
      document.getElementById('snippets-lib-editor'),
      { value: exampleSnippet, mode: 'javascript', theme: 'material', lineNumbers: true }
    ]);
    await $scope.updateSnippet();
    expect(httpMock.post).toHaveBeenCalledTimes(1);
    expect(httpMock.post).toHaveBeenCalledWith('/save-snippet', { body: exampleSnippet, file: testFileName });
  });

  test('should create expected snippet on `createSnippet`', async () => {
    const inputRegEx = /input:([^]+)(\'|\"),/;
    const quotesRegEx = /"([^"]+)"|'([^']+)'/;
    const inputProp = exampleSnippet.match(inputRegEx);
    const extractedInput = inputProp[0].match(quotesRegEx);
    expect(CodeMirror).toHaveBeenCalledTimes(1);
    expect(CodeMirror).toHaveBeenCalledWith(
      document.getElementById('snippets-editor'),
      { value: exampleSnippet, mode: 'javascript', theme: 'material', lineNumbers: true }
    );
    await $scope.createSnippet();
    expect(httpMock.post).toHaveBeenCalledTimes(1);
    expect(httpMock.post).toHaveBeenCalledWith(
      '/save-snippet', { body: exampleSnippet, file: `${extractedInput[0].slice(1, -1)}.js` }
    );
  });
});
