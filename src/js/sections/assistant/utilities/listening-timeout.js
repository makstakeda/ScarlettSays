import { assistStatuses } from '../../../constants/assist-statuses';
import basicPhrases from './basic-phrases';

export default class ListeningTimeout {
  constructor($scope, $timeout) {
    this._timeout = $timeout;
    this._scope = $scope;
  };

  invoke = () => {
    this.instance = this._timeout(() => {
      this._scope.assistStatus = assistStatuses.WAITING;
      this._scope.assistFeedback = basicPhrases.WAITING;
    }, 5000);
  };

  clear = () => {
    this._timeout.cancel(this.instance);
    this.instance = null;
  };

  delay = () => {
    this._timeout.cancel(this.instance);
    this.invoke();
  };

  isActive = () => !!this.instance;
};
