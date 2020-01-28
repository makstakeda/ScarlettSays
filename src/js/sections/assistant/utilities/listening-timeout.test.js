import { assistStatuses } from '../../../constants/assist-statuses';
import basicPhrases from './basic-phrases';
import ListeningTimeout from './listening-timeout';

describe('ListeningTimeout', () => {
  test('should create expected instance', () => {
    const $scope = {
      assistStatus: assistStatuses.LISTENING,
      assistFeedback: basicPhrases.READY
    };
    const createdInstance = 'fake-instance';
    const $timeout = jest.fn((callback, period) => {
      callback();
      return createdInstance;
    });
    $timeout.cancel = jest.fn();
    const listeningTimeout = new ListeningTimeout($scope, $timeout);
    expect(listeningTimeout.isActive()).toBe(false);
    listeningTimeout.invoke();
    expect(listeningTimeout.isActive()).toBe(true);
    expect($scope.assistStatus).toBe(assistStatuses.WAITING);
    expect($scope.assistFeedback).toBe(basicPhrases.WAITING);
    expect($timeout).toHaveBeenCalledTimes(1);
    expect($timeout.mock.calls[0][1]).toBe(5000);
    listeningTimeout.clear();
    expect(listeningTimeout.isActive()).toBe(false);
    expect($timeout.cancel).toHaveBeenCalledTimes(1);
    expect($timeout.cancel).toHaveBeenCalledWith(createdInstance);
    $scope.assistStatus = assistStatuses.LISTENING;
    $scope.assistFeedback = basicPhrases.READY;
    listeningTimeout.delay();
    expect(listeningTimeout.isActive()).toBe(true);
    expect($scope.assistStatus).toBe(assistStatuses.WAITING);
    expect($scope.assistFeedback).toBe(basicPhrases.WAITING);
    expect($timeout).toHaveBeenCalledTimes(2);
    expect($timeout.mock.calls[0][1]).toBe(5000);
  });
});
