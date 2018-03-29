import { Observable } from 'rxjs/Observable'; // could selectively import only needed

import { usersFetch, usersFetchCancel, usersFetchFulfilled, usersFetchRejected } from './actions';

// two seconds delay for interactive use of cancel/take latest
const DELAY = 2;

export const usersFetchLogic = {
  type: usersFetch,
  cancelType: usersFetchCancel,
  latest: true, // take latest only

  process({ httpClient, action }, dispatch, done) {
    const { actions } = action;
    const usersFetchFulfilledMap = users => actions[usersFetchFulfilled](users);
    const usersFetchCancelCatch = err => Observable.of(actions[usersFetchCancel](err));

    // dispatch the results of the observable
    // httpClient is RxJS ajax injected in the src/index.js
    // as a dependency for logic hooks to use. It returns observable
    // the delay query param adds arbitrary delay to the response
    const fetcher = httpClient
      .getJSON(`https://reqres.in/api/users?delay=${DELAY}`)
      .map(payload => payload.data) // use data property of payload
      .map(usersFetchFulfilledMap)
      .catch(usersFetchCancelCatch);

    dispatch(fetcher);
    done();
  }
};

export default [usersFetchLogic];
