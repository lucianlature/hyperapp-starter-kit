import { key as usersKey } from './actions';

export const selectors = {
  users: state => state[usersKey].list,
  fetchStatus: state => state[usersKey].fetchStatus,
};

export default {
  list: [],
  fetchStatus: '',
};

