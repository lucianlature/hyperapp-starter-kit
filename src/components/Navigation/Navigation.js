import { h } from 'hyperapp';
import { Link } from '@hyperapp/router';

export default () =>
  <ul class="navigation">
    <li><Link to='/'>Home</Link></li>
    <li><Link to='/counter'>Counter</Link></li>
    <li><Link to='/films'>Films</Link></li>
    <li><Link to='/users'>Users</Link></li>
    <li><Link to='/topics'>Topics</Link></li>
    <li><Link to='/about'>About</Link></li>
  </ul>;
