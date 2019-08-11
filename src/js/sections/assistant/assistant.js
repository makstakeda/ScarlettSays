import _ from 'lodash';
import template from './assistant.html';
import Speech from 'speak-tts';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';

angular.module('scarlettModule').component('assistant', {
  template,
  bindings: {},
  controller: function($rootScope, $scope, $http, $document, $timeout) {
    const speech = new Speech();
    const say = (text) => {
      return speech.speak({
        text: 'Hello, how are you today ?',
      }).then(() => {
          console.log("Success !")
      }).catch(e => {
          console.error("An error occurred :", e)
      })
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

    $scope.assistStatus = assistStatuses.WAITING;
    $scope.startListen = () => {
      $scope.assistStatus = assistStatuses.LISTENING;
      const listeningTimemout = $timeout(() => {
        $scope.assistStatus = assistStatuses.WAITING;
      }, 3000);
    };

    $scope.isQuiet = false;
    $scope.toggleQuiet = () => {
      $scope.isQuiet = !$scope.isQuiet;
    }

    $scope.isMute = false;
    $scope.toggleMute = () => {
      $scope.isMute = !$scope.isMute;
    }
  }
});