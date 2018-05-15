import flyd from 'flyd';

export default (actions, update, skipNamespace = 'location') =>
  Object.keys(actions).reduce((acts, ns) => {
    Object.keys(actions[ns]).forEach(action => {
      if (!(ns in acts)) {
        acts[ns] = {};
      }
      const act = actions[ns][action];
      acts[ns][action] =
        ns === skipNamespace
          ? act
          : data => {
              const res = update(act.call(null, data));
              return flyd.isStream(res) ? res() : res;
            };
    });

    return acts;
  }, {});
