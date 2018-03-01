import createLogicEnhancer from './createLogicEnhancer';
import { isFn } from './utils';

const enhanceActions = (actionsTemplate, logicEnhancer) =>
  Object
    .keys(actionsTemplate || [])
    .reduce((memoActions, name) => {
      const otherActions = memoActions;
      const action = actionsTemplate[name];
      otherActions[name] = isFn(action)
        ? data => (state, actions) => {
          let result = action(data);
          result = isFn(result) ? result(state, actions) : result;
          logicEnhancer.enhance(name, state, actions);
          return result;
        }
        : enhanceActions(action, logicEnhancer);
      return otherActions;
    }, {});

const createLogicApp = (logicEnhancer, nextApp) =>
  (initialState, actionsTemplate, view, container) => {
    const enhancedActions = enhanceActions(actionsTemplate, logicEnhancer);

    const appActions = nextApp(
      initialState,
      enhancedActions,
      view,
      container,
    );

    return appActions;
  };

export default function withLogic(logicOrApp = {}, { deps }) {
  const logicEnhancer = createLogicEnhancer(logicOrApp, deps);

  if (isFn(logicOrApp)) {
    return createLogicApp(logicEnhancer, logicOrApp);
  }

  return nextApp => createLogicApp(logicEnhancer, nextApp);
}
