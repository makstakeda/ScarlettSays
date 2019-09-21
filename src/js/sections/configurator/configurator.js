import _ from 'lodash';
import template from './configurator.html';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/material.css';

angular.module('scarlettModule').component('configurator', {
  template,
  bindings: {},
  controller: function($rootScope, $scope, $http, $document, $timeout) {
    componentHandler.upgradeAllRegistered();
    $scope.configTab = 'snippets-lib';
    const myCodeMirror = CodeMirror(document.getElementById('snippets-editor'), {
      value: `{
  input: 'what time is now?',
  output: () => {
    const date = new Date();
    return \`\${date.getHours()} hours \${date.getMinutes()} minutes\`
  },
}`,
      mode:  "javascript",
      theme: 'material',
      lineNumbers: true
    });

    const listedSnippets = [];
    $http.get('/snippets')
      .then(async response => {
        const inputRegEx = /input:([^]+)(\'|\"),/;
        const quotesRegEx = /"([^"]+)"|'([^']+)'/;
        const snippets = response.data;
        for (let index = 0; index < snippets.length; index++) {
          const snippetSrc = await $http.get(`/read-snippet?file=${snippets[index]}`);
          const inputProp = snippetSrc.data.match(inputRegEx);
          if (inputProp) {
            const extractedInput = inputProp[0].match(quotesRegEx);
            listedSnippets.push({ input: extractedInput[0].slice(1, -1), file: snippets[index] });
          }
        }
        $scope.listedSnippets = listedSnippets;
        $scope.$digest();
      });
    
  }
});