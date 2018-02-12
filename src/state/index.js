import { location } from '@hyperapp/router';
import { getStateFromStorage } from '../services/persist/local-storage';
import counterState from '../scenes/Counter/state';

export default getStateFromStorage() || {
  counter: counterState,
  location: location.state,
};
