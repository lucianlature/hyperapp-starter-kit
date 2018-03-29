import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/throttleTime';

// import createLogicAction$ from './createLogicAction$';
import { matchesType } from './utils';
import LogicAction from './LogicAction';

export default function logicWrapper(logic, monitor$, deps) {
  const { type, cancelType, latest, debounce, throttle } = logic;

  // cancel on cancelType or if take latest specified
  const cancelTypes = [].concat(type && latest ? type : []).concat(cancelType || []);
  const debouncing = debounce ? act$ => act$.debounceTime(debounce) : act$ => act$;
  const throttling = throttle ? act$ => act$.throttleTime(throttle) : act$ => act$;
  const limiting = act => throttling(debouncing(act));

  return function wrappedLogic(actionIn$) {
    // we want to share the same copy amongst all here
    const action$ = actionIn$.share();

    const cancel$ = cancelTypes.length
      ? action$.filter(action => matchesType(cancelTypes, action.type))
      : Observable.create((/* obs */) => {}); // shouldn't complete

    // types that don't match will bypass this logic
    const nonMatchingAction$ = action$.filter(action => !matchesType(type, action.type));

    const matchingAction$ = limiting(action$.filter(action => matchesType(type, action.type))).mergeMap(action =>
      LogicAction.createLogicAction$({
        action,
        logic,
        state: {}, // state
        deps, // deps
        cancel$,
        monitor$
      })
    );

    return Observable.merge(nonMatchingAction$, matchingAction$);
  };
}
