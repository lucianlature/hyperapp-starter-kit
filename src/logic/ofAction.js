import { filter } from 'rxjs/operators';

/**
 * RxJS operator for selecting out specific actions.
 */
export function ofAction(...allowedTypes) {
  const allowedMap = {};

  allowedTypes.forEach(klass => {
    allowedMap[klass.type || klass.name] = true;
  });

  return filter(action => {
    return allowedMap[action.constructor.type || action.constructor.name];
  });
}
