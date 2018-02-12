import { h } from 'hyperapp';
import { Link } from '@hyperapp/router';

export default () =>
    <nav>
        <Link to='/'>Home</Link> |
        <Link to='/counter'>Counter</Link> |
        <Link to='/shop'>Shop</Link> |
        <Link to='/topics'>Topics</Link> |
        <Link to='/about'>About</Link> |
    </nav>;
