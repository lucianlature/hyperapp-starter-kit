import { h } from 'hyperapp';
import Films from './components/Films/Films';

export default ({ state, actions, match }) =>
    <div>
        <h1>Star Wars Films</h1>
        <Films
            loading={state.films.loading}
            page={+(match.params && match.params.page) || 1}
            actions={actions.films}
            films={state.films.films}
        />
    </div>;
