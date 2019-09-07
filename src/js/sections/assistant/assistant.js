import _ from 'lodash';
import template from './assistant.html';
import Speech from 'speak-tts';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';
import annyang from 'annyang';
import { dataSearch } from './base-modules/data-search';

angular.module('scarlettModule').component('assistant', {
  template,
  bindings: {},
  controller: function($rootScope, $scope, $http, $document, $timeout) {
    componentHandler.upgradeAllRegistered();

    // put $http.get on window object to simplify writing snippets
    window.$http = $http.get;

    const speech = new Speech();
    const say = (text) => speech.speak({
      text,
      listeners: {
        onend: () => {}
      }
    })
      // .then(() => console.log("Success !"))
      // .catch(e => console.error("An error occurred :", e));

    $scope.assistStack = [
      {
        input: 'hello',
        output: 'corresponed to hello'
      }
    ];

    $scope.clearStack = () => {
      $scope.assistStack = [];
    };

    const feedback = (text, read) => {
      if (!$scope.isQuiet) {
        say(text).then(() => {
          if (read) {
            $scope.assistStatus = assistStatuses.WAITING;
            $scope.assistFeedback = 'Ask me about something.';
            $scope.$digest();
          };
        });
      };
      $scope.assistFeedback = text;
    };

    speech.init().catch(e => {
      console.error("An error occured while initializing : ", e)
    });

    speech.init({
      'volume': 1,
         'lang': 'en-GB',
         'rate': 1,
         'pitch': 1,
         'voice':'Google US English',
         'splitSentences': true,
         'listeners': {
             'onvoiceschanged': (voices) => {
                 // console.log("Event voiceschanged", voices)
             }
         }
    });

    $scope.assistFeedback = 'Hi! How can I help you?';

    let listeningTimemout;
    const invokeListeningTimemout = () => {
      listeningTimemout = $timeout(() => {
        $scope.assistStatus = assistStatuses.WAITING;
        $scope.assistFeedback = 'Ask me about something.';
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
      feedback('Yes.', false);
      if ($scope.assistStack.length) {
        $scope.assistStack.push({ output: 'Yes' });
      };
      invokeListeningTimemout();
    };

    $scope.isQuiet = false;
    $scope.toggleQuiet = () => {
      $scope.isQuiet = !$scope.isQuiet;
    };

    $scope.isMute = false;
    $scope.toggleMute = () => {
      $scope.isMute = !$scope.isMute;
      if ($scope.isMute) {
        $scope.assistFeedback = 'I do not disturb you.';
        if ($scope.assistStack.length) {
          $scope.assistStack.push({ output: 'I do not disturb you' });
        };
        $scope.assistStatus = assistStatuses.SLEEPING;
        annyang.abort();
      } else {
        $scope.assistFeedback = 'Ask me about something.';
        $scope.assistStatus = assistStatuses.WAITING;
        annyang.start();
      };
    };

    annyang.addCommands({
      ['Scarlett']: () => {
        delayListeningTimemout();
        $scope.startListen();
        $scope.$digest();
      },
      ['Hello']: (name) => {
        if ($scope.assistStatus === assistStatuses.LISTENING) {
          clearListeningTimemout();
          feedback('Hi!', true);
          $scope.$digest();
        };
      },
      [dataSearch.input]: (value) => Promise.resolve(dataSearch.output(value))
        .then(response => {
          $scope.assistStack.push({ input: value, output: response })
          clearListeningTimemout();
          feedback(response, true);
          $scope.$digest();
        })
    });

    annyang.start();
  }
});
