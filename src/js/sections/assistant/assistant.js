import _ from 'lodash';
import template from './assistant.html';
import Speech from 'speak-tts';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';
import annyang from 'annyang';
// import 'speechkitt/dist/speechkitt.min.js';

angular.module('scarlettModule').component('assistant', {
  template,
  bindings: {},
  controller: function($rootScope, $scope, $http, $document, $timeout) {
    const speech = new Speech();
    const say = (text) => {
      return speech.speak({
        text,
      }).then(() => {
          console.log("Success !")
      }).catch(e => {
          console.error("An error occurred :", e)
      })
    };

    const feedback = (text) => {
      if (!$scope.isQuiet) {
        say(text);
      };
      $scope.assistFeedback = text;
    };

    speech.init().then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        // say('Speech is ready, voices are available');
    }).catch(e => {
        console.error("An error occured while initializing : ", e)
    })
    speech.init({
      'volume': 1,
         'lang': 'en-GB',
         'rate': 1,
         'pitch': 1,
         'voice':'Google US English',
         'splitSentences': true,
         'listeners': {
             'onvoiceschanged': (voices) => {
                 console.log("Event voiceschanged", voices)
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

    $scope.assistStatus = assistStatuses.WAITING;
    $scope.startListen = () => {
      $scope.assistStatus = assistStatuses.LISTENING;
      feedback('Yes.');
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
        $scope.assistStatus = assistStatuses.SLEEPING;
        annyang.abort();
      } else {
        $scope.assistFeedback = 'Ask me about something.';
        $scope.assistStatus = assistStatuses.WAITING;
        annyang.start();
      };
    };

    annyang.addCommands({
      'Scarlett': () => {
        $scope.startListen();
        $scope.$digest();
      },
      'Hello': () => {
        if ($scope.assistStatus === assistStatuses.LISTENING) {
          feedback('Hi!');
          $scope.$digest();
        };
      }
    });

    annyang.start();
  }
});