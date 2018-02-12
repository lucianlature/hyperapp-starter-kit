import { h } from 'hyperapp';
import Counter from './components/Counter/Counter';

export default ({ state, actions /* , location, match */ }) => (
    <Counter
        state={state}
        actions={actions}
    />
);
