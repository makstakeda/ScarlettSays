import 'angular/angular';
import 'angular-mocks/angular-mocks';
import '../../app';
import './assistant';
import annyang from 'annyang';
jest.mock('annyang', () => {
  return {
    start: () => {},
    abort: () => {}
  };
});

import { assistStatuses } from '../../constants/assist-statuses';
import basicPhrases from './utilities/basic-phrases';

import ListeningTimeout from './utilities/listening-timeout';
jest.mock('./utilities/listening-timeout');
ListeningTimeout.prototype.isActive = jest.fn();

import SpeechModule from './utilities/speech-module';
jest.mock('./utilities/speech-module');
SpeechModule.prototype.startListen = jest.fn();
SpeechModule.prototype.stopListen = jest.fn();

window.componentHandler = {
  upgradeAllRegistered: () => {}
}

describe('assistant', () => {
  let $element;
  let $scope;

  beforeEach(() => {
    jest.clearAllMocks();
    angular.mock.module('scarlettModule');
    inject(($rootScope, $compile) => {
      $element = angular.element('<assistant></assistant>');
      $compile($element)($rootScope);
      $scope = $element.isolateScope();
    })
  });

  test('should have expected initial state', () => {
    expect($scope.assistFeedback).toBe(basicPhrases.HELLO);
    expect($scope.assistStatus).toBe(assistStatuses.WAITING);
    expect($scope.isQuiet).toBe(false);
    expect($scope.isMute).toBe(false);
  });

  test('should switch `isQuiet` by `toggleQuiet`', () => {
    expect($scope.isQuiet).toBe(false);
    $scope.toggleQuiet();
    expect($scope.isQuiet).toBe(true);
    $scope.toggleQuiet();
    expect($scope.isQuiet).toBe(false);
  });

  test('should switch `isMute` by `toggleMute`', () => {
    const listeningTimeout = ListeningTimeout.mock.instances[0];
    const speechModule = SpeechModule.mock.instances[0];

    expect($scope.isMute).toBe(false);
    $scope.toggleMute();
    expect($scope.isMute).toBe(true);
    expect($scope.assistFeedback).toBe(basicPhrases.MUTE);
    expect($scope.assistStatus).toBe(assistStatuses.SLEEPING);
    expect(listeningTimeout.isActive).toHaveBeenCalledTimes(1);
    expect(speechModule.stopListen).toHaveBeenCalledTimes(1);
    expect(speechModule.startListen).toHaveBeenCalledTimes(0);
    $scope.toggleMute();
    expect($scope.isMute).toBe(false);
    expect(listeningTimeout.isActive).toHaveBeenCalledTimes(1);
    expect(speechModule.startListen).toHaveBeenCalledTimes(1);
  });
});
