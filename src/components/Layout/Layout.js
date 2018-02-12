import { h } from 'hyperapp';
import Navigation from '../Navigation/Navigation';

export default ({ title }, children) => (
  <div>
    <header>
      <Navigation />
    </header>

    { children }

    <footer>
      {'footer content'}
    </footer>
  </div>
);
