import { Observable } from 'rxjs/Observable'; // could selectively import only needed

import { usersFetch, usersFetchCancel, usersFetchFulfilled, usersFetchRejected } from './actions';

// two seconds delay for interactive use of cancel/take latest
const DELAY = 2;

export const usersFetchLogic = {
  // this is how we launch the logic process on an action
  type: usersFetch,
  cancelType: usersFetchCancel,
  latest: true, // take latest only

  process({ httpClient, action }) {
    const { actions } = action;

    // dispatch the results of the observable
    // httpClient is RxJS ajax injected in the src/index.js as a dependency for logic hooks to use.
    // It returns an observable
    // the delay query param adds arbitrary delay to the response
    return httpClient
      .getJSON(`https://reqres.in/api/users?delay=${DELAY}`)
      .map(payload => payload.data) // use data property of payload
      .map(users => actions[usersFetchFulfilled](users))
      .catch(err => Observable.of(actions[usersFetchCancel](err)));
  }
};

export default [usersFetchLogic];
