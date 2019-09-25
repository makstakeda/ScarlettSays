import template from './assistant.html';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';
import SnippetsManager from './utilities/snippets-manager';
import basicPhrases from './utilities/basic-phrases';
import SpeechModule from './utilities/speech-module';

angular.module('scarlettModule').component('assistant', {
  template,
  controller: function($scope, $http, $timeout, $window) {
    componentHandler.upgradeAllRegistered();

    const speechModule = new SpeechModule();

    const feedback = (text, read) => {
      if (!$scope.isQuiet) {
        speechModule.say(text)
          .then(() => {
            if (read) {
              $scope.assistStatus = assistStatuses.WAITING;
              $scope.assistFeedback = basicPhrases.WAITING;
              $scope.$digest();
            };
          });
      };
      $scope.assistFeedback = text;
    };

    const userSnippets = {};
    const callback = (value, response) => {
      $scope.assistStack.push({ input: value, output: response })
      clearListeningTimemout();
      feedback(response, true);
      $scope.$digest();
    };

    const snippetsManager = new SnippetsManager(userSnippets, callback);

    // create global object for snippets registration
    $window.SCARLETT = { ...snippetsManager, httpGet: $http.get, httpPost: $http.post };

    $scope.assistStack = [];

    $scope.clearStack = () => $scope.assistStack = [];

    // get existed snippets and invoke assistant
    $http.get('/snippets')
      .then(response => {
        response.data.forEach(element => {
          require(`../../../../snippets/${element}`);
        });
        speechModule.addCommands({
          ['Scarlett']: () => {
            delayListeningTimemout();
            $scope.startListen();
            $scope.$digest();
          },
          ...SCARLETT.getSnippets()
        });
        // annyang.start();
      });

    $scope.assistFeedback = basicPhrases.HELLO;

    let listeningTimemout;
    const invokeListeningTimemout = () => {
      listeningTimemout = $timeout(() => {
        $scope.assistStatus = assistStatuses.WAITING;
        $scope.assistFeedback = basicPhrases.WAITING;
      }, 5000);
    };

    const clearListeningTimemout = () => {
      $timeout.cancel(listeningTimemout);
    };

    const delayListeningTimemout = () => {
      $timeout.cancel(listeningTimemout);
      invokeListeningTimemout();
    };

    $scope.assistStatus = assistStatuses.WAITING;
    $scope.startListen = () => {
      $scope.assistStatus = assistStatuses.LISTENING;
      feedback(basicPhrases.READY, false);
      if ($scope.assistStack.length) {
        $scope.assistStack.push({ output: basicPhrases.READY });
      };
      delayListeningTimemout();
    };

    $scope.isQuiet = false;
    $scope.toggleQuiet = () => {
      $scope.isQuiet = !$scope.isQuiet;
    };

    $scope.isMute = false;
    $scope.toggleMute = () => {
      $scope.isMute = !$scope.isMute;
      if ($scope.isMute) {
        if (listeningTimemout) {
          $timeout.cancel(listeningTimemout);
        };
        $scope.assistFeedback = basicPhrases.MUTE;
        if ($scope.assistStack.length) {
          $scope.assistStack.push({ output: basicPhrases.MUTE });
        };
        $scope.assistStatus = assistStatuses.SLEEPING;
        speechModule.stopListen();
      } else {
        $scope.assistFeedback = basicPhrases.WAITING;
        $scope.assistStatus = assistStatuses.WAITING;
        speechModule.startListen();
      };
    };
  }
});
