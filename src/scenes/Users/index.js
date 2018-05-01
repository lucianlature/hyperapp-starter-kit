import { h } from 'hyperapp';
import { usersFetch, usersFetchCancel } from './actions';
import { selectors } from './state';
import Users from './components/Users/Users';

export default ({ state, actions: { users: usersActions } }) => {
  const users = selectors.users(state);
  const fetchStatus = selectors.fetchStatus(state);

  return (
    <div>
      <h1>Users</h1>

      <Users
        users={users}
        fetchStatus={fetchStatus}
        onFetch={usersActions[usersFetch]}
        onCancelFetch={usersActions[usersFetchCancel]}
      />
    </div>
  );
};
