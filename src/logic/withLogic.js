import LogicEnhancer from './LogicEnhancer';
import { isFn } from './utils';

const enhanceActions = (actionsTemplate, logicEnhancer) =>
  Object.keys(actionsTemplate || []).reduce((memoActions, type) => {
    const otherActions = memoActions;
    const action = actionsTemplate[type];
    otherActions[type] = isFn(action)
      ? data => (state, actions) => {
          let result = action(data);
          result = isFn(result) ? result(state, actions) : result;
          logicEnhancer.enhance({ type, state: { ...state, ...result }, actions });
          return result;
        }
      : enhanceActions(action, logicEnhancer);
    return otherActions;
  }, {});

const createLogicApp = (logicEnhancer, nextApp) => (initialState, actionsTemplate, view, container) => {
  const enhancedActions = enhanceActions(actionsTemplate, logicEnhancer);

  const appActions = nextApp(initialState, enhancedActions, view, container);

  return appActions;
};

export default function withLogic(logic = {}, { deps }) {
  const logicEnhancer = LogicEnhancer.createLogicEnhancer(logic, deps);

  // logic could be a hyperapp app
  if (isFn(logic)) {
    return createLogicApp(logicEnhancer, logic);
  }

  return nextApp => createLogicApp(logicEnhancer, nextApp);
}
