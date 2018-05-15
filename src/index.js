import { h, app } from 'hyperapp';
import { location, Route, Switch } from '@hyperapp/router';
import { withLogger } from '@hyperapp/logger';
import { withFx, http } from '@hyperapp/fx';
import flyd from 'flyd';

// Only for using Meiosis Tracer in development.
// import { trace } from 'meiosis';
// import meiosisTracer from 'meiosis-tracer';

// import styling
import '../styles/app.css';

import compose from './utils/compose';
// import wrap from './utils/wrap';
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
// Create actions
// const createActions = update => ({
//   ...actions,
//   counter: {
//     ...actions.counter,
//     increase: amount =>
//       update(state => {
//         state.counter.num = state.counter.num + amount;
//         return state;
//       })
//     // increase: () => {
//     //   console.log('increase called...');
//     //   state.num = state.num + 1;
//     //   return state;
//     // }
//   }
// });
// const wrapActions = (actions, update) =>
//   Object.keys(actions).reduce((acts, ns) => {
//     Object.keys(actions[ns]).forEach(action => {
//       if (!(ns in acts)) {
//         acts[ns] = {};
//       }
//       const act = actions[ns][action];
//       acts[ns][action] = ns === 'location' ? act : () => update(act);
//     });

//     return acts;
//   }, {});

// Create View
// const createView = appActions => appState => {
const createView = () => (state, actions) => {
  // const appActions = wrapActions(actions, update);
  // console.log(actions);
  // console.log(appActions);

  const scene = Component => ({ location: l, match: m }) =>
    h(Component, {
      location: l,
      match: m,
      state,
      actions // : appActions
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
// const view = createView(actions);
const view = createView();

// State Stream
const appState = flyd.scan(
  (state /*, func */) => {
    // state.counter = { num: 101 };
    return state;
  },
  state,
  update
);

// Container element
const container = document.body;

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
    // appActions,
    actions,
    // VIEW
    view,
    // createView,
    // CONTAINER
    container
  );

let main = null;
let once = false;
appState.map(state => {
  main = createApp(state, container);
  location.subscribe(main.location);

  if (!once) {
    const cah = main.counter.cah.bind(null, { amount: 100, update });
    setTimeout(cah, 2000);
    once = true;
  }
});

// setTimeout(main.films.getFilms, 1000);
// setTimeout(main.increase, 2000);

// registerServiceWorker();

export default main;
