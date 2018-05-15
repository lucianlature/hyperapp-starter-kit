import { h, app } from 'hyperapp';
import { location, Route, Switch } from '@hyperapp/router';
import { withLogger } from '@hyperapp/logger';
import { withFx, http } from '@hyperapp/fx';
import flyd from 'flyd';

// Only for using Meiosis Tracer in development.
import { trace } from 'meiosis';
import meiosisTracer from 'meiosis-tracer';

// import styling
import '../styles/app.css';

import compose from './utils/compose';
import wrapActions from './utils/wrapActions';
import client from './data/apollo-client';
import actions from './actions';
import state from './state';
import Layout from './components/Layout/Layout';
// import registerServiceWorker from '../static/service-worker-registration';

// Scenes
// import Home from './scenes/Home';
import About from './scenes/About';
import Films from './scenes/Films';
import Topics from './scenes/Topics';
import Counter from './scenes/Counter';
import Users from './scenes/Users';

// -- Meiosis pattern setup code
const update = flyd.stream();

// Create View
const view = (state, actions) => {
  const scene = Component => ({ location: l, match: m }) =>
    h(Component, {
      location: l,
      match: m,
      state,
      actions
    });

  return (
    <Layout>
      <Switch>
        <Route path="/" render={scene(Counter)} />
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

// State Stream
const appState = flyd.scan(
  (state, func) => {
    state.counter = typeof func === 'function' ? func(state.counter) : state.counter;
    return state;
  },
  state,
  update
);

// Container element
const container = document.getElementById('app');

// Adding app plugins, like the logger
const composition = compose(
  withFx({
    graphQLQuery: async ({ query, action }, getAction) => {
      const response = await client.query({ query });
      return getAction(action)({ data: response.data });
    }
  }),
  withLogger
);
const composedApp = composition(app);

const createApp = (state, container) =>
  composedApp(
    // STATE
    state,
    // ACTIONS
    // actions,
    wrapActions(actions, update),
    // VIEW
    view,
    // CONTAINER
    container
  );

// Only for using Meiosis Tracer in development.
trace({ update, dataStreams: [appState] });
meiosisTracer({ selector: '#tracer' });

let main = null;
appState.map(state => {
  console.log('render >>>');
  main = createApp(state, container);
  location.subscribe(main.location);
});

// setTimeout(main.films.getFilms, 1000);
// setTimeout(main.increase, 2000);

// registerServiceWorker();

export default main;
