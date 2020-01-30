import template from './assistant.html';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';
import SnippetsManager from './utilities/snippets-manager';
import basicPhrases from './utilities/basic-phrases';
import SpeechModule from './utilities/speech-module';
import ListeningTimeout from './utilities/listening-timeout';

angular.module('scarlettModule').component('assistant', {
  template,
  controller: function($scope, $http, $timeout, $window) {
    componentHandler.upgradeAllRegistered();

    const speechModule = new SpeechModule();
    const listeningTimemout = new ListeningTimeout($scope, $timeout);

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
      if ($scope.isMute) {
        if (listeningTimemout.isActive()) {
          listeningTimemout.clear();
        };
      } else {
        $scope.assistStack.push({ input: value, output: response })
        listeningTimemout.clear();
        feedback(response, true);
        $scope.$digest();
      };
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
          [require('../../../../config.json').INVOCATION_COMMAND]: () => {
            listeningTimemout.delay();
            $scope.startListen();
            $scope.$digest();
          },
          ...SCARLETT.getSnippets()
        });
      });

    $scope.assistFeedback = basicPhrases.HELLO;

    $scope.assistStatus = assistStatuses.WAITING;
    $scope.startListen = () => {
      $scope.assistStatus = assistStatuses.LISTENING;
      feedback(basicPhrases.READY, false);
      if ($scope.assistStack.length) {
        $scope.assistStack.push({ output: basicPhrases.READY });
      };
      listeningTimemout.delay();
    };

    $scope.isQuiet = false;
    $scope.toggleQuiet = () => {
      $scope.isQuiet = !$scope.isQuiet;
    };

    $scope.isMute = false;
    $scope.toggleMute = () => {
      $scope.isMute = !$scope.isMute;
      if ($scope.isMute) {
        if (listeningTimemout.isActive()) {
          listeningTimemout.clear();
        };
        $scope.assistFeedback = basicPhrases.MUTE;
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
