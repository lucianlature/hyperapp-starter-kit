import home from './home';
import shop from './shop';
import counter from './counter';
import about from './about';

const scenes = { home, shop, counter, about };

export default ({counter, navigation}) => scenes[navigation.state.current]({counter, navigation})
