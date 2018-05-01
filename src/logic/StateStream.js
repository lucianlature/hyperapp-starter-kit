import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * BehaviorSubject of the entire state.
 */
export class StateStream extends BehaviorSubject {
  constructor(parent) {
    super({});

    if (parent) {
      Object.assign(this, parent);
    }
  }
}
