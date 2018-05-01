import { forkJoin } from 'rxjs/observable/forkJoin';

class Dispatcher {
  constructor() {
    this._errorHandler = {
      handleError: err => {
        console.error(err);
      }
    };
  }
  /**
   * Dispatches event(s).
   */
  dispatch(event) {
    let result;

    if (Array.isArray(event)) {
      result = forkJoin(event.map(a => this._dispatch(a)));
    } else {
      result = this._dispatch(event);
    }

    result.pipe(
      catchError(err => {
        // handle error through angular error system
        this._errorHandler.handleError(err);
        return of(err);
      })
    );

    result.subscribe();

    return result;
  }

  _dispatch(action) {
    const prevState = this._stateStream.getValue();
    const plugins = this._pluginManager.plugins;

    return compose([
      ...plugins,
      (nextState, nextAction) => {
        if (nextState !== prevState) {
          this._stateStream.next(nextState);
        }

        this._actions.next(nextAction);

        return this._dispatchActions(nextAction).pipe(map(() => this._stateStream.getValue()));
      }
    ])(prevState, action).pipe(shareReplay());
  }

  _dispatchActions(action) {
    const results = this._storeFactory.invokeActions(
      () => this._stateStream.getValue(),
      newState => this._stateStream.next(newState),
      actions => this.dispatch(actions),
      action
    );
    return (results.length ? forkJoin(this._handleNesting(results)) : of({})).pipe(shareReplay());
  }
}

export default Dispatcher;
