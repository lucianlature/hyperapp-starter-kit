import { location } from '@hyperapp/router';
import { getStateFromStorage } from '../services/persist/local-storage';
import counterState from '../scenes/Counter/state';
import filmsState from '../scenes/Films/state';
import usersState from '../scenes/Users/state';

export default getStateFromStorage() || {
  counter: counterState,
  location: location.state,
  films: filmsState,
  users: usersState
};
