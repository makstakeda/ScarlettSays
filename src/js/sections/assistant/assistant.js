import _ from 'lodash';
import template from './assistant.html';
import Speech from 'speak-tts';
import './assist-processing/assist-processing';
import { assistStatuses } from '../../constants/assist-statuses';
import annyang from 'annyang';
import { dataSearch } from './base-modules/data-search';
import SnippetsManager from './utilities/snippets-manager';

angular.module('scarlettModule').component('assistant', {
  template,
  bindings: {},
  controller: function($rootScope, $scope, $http, $document, $timeout, $window) {
    componentHandler.upgradeAllRegistered();

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

    const speech = new Speech();
    speech.init().catch(e => {
      console.error("An error occured while initializing : ", e)
    });

    speech.init({ volume: 1, lang: 'en-GB', rate: 1, pitch: 1, voice:'Google US English',
      splitSentences: true, listeners: { onvoiceschanged: (voices) => {} }
    });

    const userSnippets = {};
    const callback = (value, response) => {
      $scope.assistStack.push({ input: value, output: response })
      clearListeningTimemout();
      feedback(response, true);
      $scope.$digest();
    };

    const snippetsManager = new SnippetsManager(userSnippets, callback);

    // create global object for snippets registration
    $window.$http = $http.get;
    $window.SCARLETT = {
      ...snippetsManager,
      httpGet: $http.get
    };

    const say = (text) => speech.speak({
      text,
      listeners: {
        onend: () => {}
      }
    })
      // .then(() => console.log("Success !"))
      // .catch(e => console.error("An error occurred :", e));

    $scope.assistStack = [];

    $scope.clearStack = () => {
      $scope.assistStack = [];
    };

    // get existed snippets and invoke assistant
    $http.get('/snippets')
    .then(response => {
      response.data.forEach(element => {
        require(`../../../../snippets/${element}`);
      });
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
        ...SCARLETT.getSnippets()
        // [dataSearch.input]: (value) => Promise.resolve(dataSearch.output(value))
        //   .then(response => {
        //     $scope.assistStack.push({ input: value, output: response })
        //     clearListeningTimemout();
        //     feedback(response, true);
        //     $scope.$digest();
        //   })
      });
      annyang.start();
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
  }
});
