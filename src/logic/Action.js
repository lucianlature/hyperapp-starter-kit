import { ensureStoreMetadata } from './internals';

export class ActionToken {
  static counter = 0;

  stamp;
  description;

  constructor(desc) {
    ActionToken.counter++;

    this.stamp = ActionToken.counter;
    this.description = `ActionToken ${desc} ${this.stamp}`;
  }

  toString() {
    return this.description;
  }
}

/**
 * Decorates a method with a action information.
 */
export function Action(actions, options) {
  return function(target, name) {
    const meta = ensureStoreMetadata(target.constructor);

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    for (const action of actions) {
      if (!action.type) {
        action.type = new ActionToken(action.name);
      }

      const type = action.type;

      if (!meta.actions[type]) {
        meta.actions[type] = [];
      }

      meta.actions[type].push({
        fn: name,
        options: options || {},
        type
      });
    }
  };
}
