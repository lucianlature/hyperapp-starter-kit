import { h } from 'hyperapp';
import Navigation from '../Navigation/Navigation';

export default ({ title }, children) => (
  <div uk-sticky class="uk-navbar-container tm-navbar-container uk-active">
    <div class="uk-container uk-container-expand">
        <header>
        <Navigation />
        </header>

        { children }

        <footer>
        {'footer content'}
        </footer>
    </div>
  </div>
);
