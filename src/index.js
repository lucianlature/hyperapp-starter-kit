import { h, app } from 'hyperapp';
import { location, Route, Switch } from '@hyperapp/router';
import { withLogger } from '@hyperapp/logger';
import { withFx, http } from '@hyperapp/fx';
// import flyd from 'flyd';

// import styling
import '../styles/app.css';

import compose from './utils/compose';
import client from './data/apollo-client';
import actions from './actions';
import state from './state';
import Layout from './components/Layout/Layout';
// import registerServiceWorker from '../static/service-worker-registration';

// Scenes
import Home from './scenes/Home';
import About from './scenes/About';
import Films from './scenes/Films';
import Topics from './scenes/Topics';
import Counter from './scenes/Counter';
import Users from './scenes/Users';

const composition = compose(
  withFx({
    graphQLQuery: async ({ query, action }, getAction) => {
      const response = await client.query({ query });
      return getAction(action)({ data: response.data });
    }
  }),
  withLogger
);

// -- Meiosis pattern setup code
// const update = flyd.stream();
// const view = createView(update);
// const models = flyd.scan(
//   function(model, obj) {
//     if (obj.operation === 'add') {
//       return model + obj.value;
//     } else if (obj.operation === 'times') {
//       return model * obj.value;
//     } else {
//       return model;
//     }
//   },
//   0,
//   update
// );

// Container element
const container = document.body;

// Create View
const createView = (appState, appActions) => {
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
        <Route path="/" render={scene(Home)} />
        <Route path="/counter" render={scene(Counter)} />
        <Route parent path="/films" render={scene(Films)} />
        <Route path="/films/:page" render={scene(Films)} />
        <Route parent path="/topics" render={scene(Topics)} />
        <Route path="/users" render={scene(Users)} />
        <Route path="/about" render={scene(About)} />
      </Switch>
    </Layout>
  );
};

// Adding app logging
const composedApp = composition(app);

const createApp = () =>
  composedApp(
    // STATE
    state,

    // ACTIONS
    actions,

    // VIEW
    createView,

    // CONTAINER
    container
  );

const main = createApp();
// models.map(model => ReactDOM.render(app.view(model), container));

location.subscribe(main.location);

// setTimeout(main.films.getFilms, 1000);
// setTimeout(main.counter.sub, 2000);

// registerServiceWorker();

export default main;
