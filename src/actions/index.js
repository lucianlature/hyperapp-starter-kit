import { location } from '@hyperapp/router';
import counterActions from '../scenes/Counter/actions';
import filmsActions from '../scenes/Films/actions';
import { actions as usersActions, key as usersKey } from '../scenes/Users/actions';

export default {
  location: location.actions,
  counter: counterActions,
  films: filmsActions,
  [usersKey]: usersActions
};
