import { Observable } from 'rxjs/Observable'; // could selectively import only needed
import createLogic from '../../logic/createLogic';
import {
  usersFetch,
  usersFetchCancel,
  usersFetchFulfilled,
  usersFetchRejected,
} from './actions';

// 4s delay for interactive use of cancel/take latest
const delay = 4;

export const usersFetchLogic = createLogic({
  type: usersFetch,
  cancelType: usersFetchCancel,
  latest: true, // take latest only

  process({ httpClient, action }, dispatch, done) {
    const { actions } = action;
    const usersFetchFullfilledMap = users => actions[usersFetchFulfilled](users);
    const usersFetchCancelCatch = err => Observable.of(actions[usersFetchCancel](err));

    // dispatch the results of the observable
    // httpClient is RxJS ajax injected in the src/configureStore.js
    // as a dependency for logic hooks to use. It returns observable
    // the delay query param adds arbitrary delay to the response
    const fetcher = httpClient.getJSON(`https://reqres.in/api/users?delay=${delay}`)
      .map(payload => payload.data) // use data property of payload
      .map(usersFetchFullfilledMap)
      .catch(usersFetchCancelCatch);

    dispatch(fetcher);
    done();
  },
});

export default [
  usersFetchLogic,
];
