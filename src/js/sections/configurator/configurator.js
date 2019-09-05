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
    $scope.configTab = 'engine';
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
  }
});