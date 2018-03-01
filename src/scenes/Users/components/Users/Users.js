import { h } from 'hyperapp';

export default ({
  users,
  fetchStatus,
  onFetch,
  onCancelFetch,
}) =>
    <div>
        <div>Status: { fetchStatus }</div>
        <button onclick={ onFetch }>Fetch users</button>
        <button onclick={ onCancelFetch }>Cancel</button>
        <ul>
        {
            users.map(user => (
                <li key={ user.id }>{ user.first_name } { user.last_name }</li>
            ))
        }
        </ul>
    </div>;
