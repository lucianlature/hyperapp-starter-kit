import { h, app } from 'hyperapp';
import { location, Route, Switch, Link } from '@hyperapp/router';

import actions from './actions';
import state from './state';
import registerServiceWorker from './service-worker-registration';
import Layout from './components/Layout/Layout';

// Scenes
import Home from './scenes/Home';
import About from './scenes/About';
import Topics from './scenes/Topics';
import Counter from './scenes/Counter';

const {
  location: mainLocation,
  counter,
} = app(
  // STATE
  state,

  // ACTIONS
  actions,

  // VIEW
  (appState, appActions) => {
    const renderScene = Component => ({ location: l, match: m }) => h(Component, {
      location: l,
      match: m,
      state: appState,
      actions: appActions,
    });

    return (
        <Layout>
                <Switch>
                    <Route path="/" render={Home} />
                    <Route
                        path="/counter"
                        render={renderScene(Counter)}
                    />
                    <Route parent path="/topics" render={Topics} />
                    <Route path="/about" render={About} />
                </Switch>
        </Layout>
    );
  },

  // CONTAINER
  document.body,
);

location.subscribe(mainLocation);

setTimeout(counter.add, 1000);
setTimeout(counter.sub, 2000);

registerServiceWorker();
