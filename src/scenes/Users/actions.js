// unique key namespace used to separate action types
// By convention it will match the directory structure
// to make it easy to locate the src
export const key = 'users';

// action creators, note each of these functions returns the
// action type constant associated with it by coercing to a string
// (or calling toString()). So we don't have to manage constants
// and creators, they are both contained in one.
export const usersFetch = `${key}/FETCH`;
export const usersFetchCancel = `${key}/FETCH_CANCEL`;
export const usersFetchFulfilled = `${key}/FETCH_FULFILLED`;
export const usersFetchRejected = `${key}/FETCH_REJECTED`;

export const actions = {
  [usersFetch]: () => () => ({
    fetchStatus: `fetching... ${(new Date()).toLocaleString()}`,
    list: [],
  }),
  [usersFetchFulfilled]: data => state => ({
    ...state,
    list: data,
    fetchStatus: `Results from ${(new Date()).toLocaleString()}`,
  }),
  [usersFetchRejected]: error => state => ({
    ...state,
    fetchStatus: `errored: ${error}`,
  }),
  [usersFetchCancel]: () => state => ({
    ...state,
    fetchStatus: 'user cancelled',
  }),
};
