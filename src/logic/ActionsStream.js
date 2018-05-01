import { Subject } from 'rxjs/Subject';

/**
 * Action stream that is emitted anytime an action is dispatched.
 *
 * You can listen to this in services to react without stores.
 */
export class Actions extends Subject {
  constructor(parent) {
    super();

    if (parent) {
      Object.assign(this, parent);
    }
  }
}
