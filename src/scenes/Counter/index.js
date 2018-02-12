import { h } from 'hyperapp';
import Counter from './components/Counter/Counter';

export default (state, actions) => (
    <Counter
        state={state}
        actions={actions}
    />
);
