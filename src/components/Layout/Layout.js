import { h } from 'hyperapp';
import Navigation from '../Navigation/Navigation';

export default ({}, children) => (
  <div>
    <div>
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
