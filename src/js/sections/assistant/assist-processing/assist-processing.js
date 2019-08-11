import _ from 'lodash';
import template from './assist-processing.html';
import { assistStatuses } from '../../../constants/assist-statuses';

angular.module('scarlettModule').component('assistProcessing', {
  template,
  bindings: {
    status: '='
  },
  controller: ($scope) => {
    $scope.assistStatuses = assistStatuses;
  }
});