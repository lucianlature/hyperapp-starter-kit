import { h } from 'hyperapp';

export default ({
  users,
  fetchStatus,
  onFetch,
  onCancelFetch,
}) =>
    <div>
        <div class="status">Status: { fetchStatus }</div>
        <button onclick={ onFetch }>Fetch users</button>
        <button onclick={ onCancelFetch }>Cancel</button>
        <ol class="list">
        {
            users.map(user => (
                <li key={ user.id }>{ user.first_name } { user.last_name }</li>
            ))
        }
        </ol>
    </div>;
