import { h, app } from 'hyperapp';
import { location, Route, Switch } from '@hyperapp/router';
import logger from '@hyperapp/logger';
// import 'rxjs/Observable';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';
import { ajax } from 'rxjs/observable/dom/ajax';

import { compose } from './logic/utils';
import withLogic from './logic/withLogic';
import logic from './logic';
import actions from './actions';
import state from './state';
import registerServiceWorker from './service-worker-registration';
import Layout from './components/Layout/Layout';

// Scenes
// import Home from './scenes/Home';
import About from './scenes/About';
import Films from './scenes/Films';
import Topics from './scenes/Topics';
import Counter from './scenes/Counter';
import Users from './scenes/Users';

const deps = { // injected dependencies for logic
  httpClient: ajax, // RxJS ajax
};
const appLogger = logger();
const appWithLogic = withLogic(logic, { deps });
const enhancedApp = compose(appLogger, appWithLogic);

// Adding app logging
const main = enhancedApp(app)(
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
                    <Route path="/" render={renderScene(Users)} />
                    <Route path="/counter" render={renderScene(Counter)} />
                    <Route parent path="/films" render={renderScene(Films)} />
                    <Route path="/films/:page" render={renderScene(Films)} />
                    <Route parent path="/topics" render={renderScene(Topics)} />
                    <Route path="/users" render={renderScene(Users)} />
                    <Route path="/about" render={renderScene(About)} />
                </Switch>
        </Layout>
    );
  },

  // CONTAINER
  document.body,
);

location.subscribe(main.location);

// setTimeout(main.counter.add, 1000);
// setTimeout(main.counter.sub, 2000);

registerServiceWorker();

export default main;
