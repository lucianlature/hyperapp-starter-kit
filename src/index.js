import { h, app } from 'hyperapp';
import { location, Route, Switch } from '@hyperapp/router';
import { withLogger } from '@hyperapp/logger';
// import 'rxjs/Observable';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';
import { ajax } from 'rxjs/observable/dom/ajax';

import { compose } from './logic/utils';
import withLogic from './logic/withLogic';
import appLogic from './logic';
import actions from './actions';
import state from './state';
import Layout from './components/Layout/Layout';
import registerServiceWorker from './service-worker-registration';

// Scenes
// import Home from './scenes/Home';
import About from './scenes/About';
import Films from './scenes/Films';
import Topics from './scenes/Topics';
import Counter from './scenes/Counter';
import Users from './scenes/Users';

const deps = {
  // injected dependencies for logic
  httpClient: ajax // RxJS ajax
};

const appWithLogic = withLogic(appLogic, { deps });
const enhancedApp = compose(withLogger, appWithLogic);

// Adding app logging
const main = enhancedApp(app)(
  // STATE
  state,

  // ACTIONS
  actions,

  // VIEW
  (appState, appActions) => {
    const scene = Component => ({ location: l, match: m }) =>
      h(Component, {
        location: l,
        match: m,
        state: appState,
        actions: appActions
      });

    return (
      <Layout>
        <Switch>
          <Route path="/" render={scene(Users)} />
          <Route path="/counter" render={scene(Counter)} />
          <Route parent path="/films" render={scene(Films)} />
          <Route path="/films/:page" render={scene(Films)} />
          <Route parent path="/topics" render={scene(Topics)} />
          <Route path="/users" render={scene(Users)} />
          <Route path="/about" render={scene(About)} />
        </Switch>
      </Layout>
    );
  },

  // CONTAINER
  document.body
);

location.subscribe(main.location);

// setTimeout(main.counter.add, 1000);
// setTimeout(main.counter.sub, 2000);

registerServiceWorker();

export default main;
