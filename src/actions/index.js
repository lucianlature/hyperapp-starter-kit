import { location } from '@hyperapp/router';
import counterActions from '../scenes/Counter/actions';

export default {
  location: location.actions,
  counter: counterActions,
};
