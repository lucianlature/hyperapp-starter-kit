import { h } from 'hyperapp';
import Description from '../Description';

/**
 * first object in the store is 'state' (an object - {})
 * second object in the store is 'actions' (an object - {})
 * here we destructure what is needed
 * 'num' from 'state' and 'add'/'sub' from 'actions'
 */
export default ({
  state: { num },
  actions: { add, sub },
}) =>
  <div class="counter">
    <Description />
    <section>
      <button
        onclick={sub}
        disabled={num < 1}
      >
        -
      </button>
      <code class="count">{num}</code>
      <button
        onclick={add}
      >
        +
      </button>
    </section>
  </div>;
