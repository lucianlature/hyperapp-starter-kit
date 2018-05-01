const getStateFromStorage = () => JSON.parse(window.localStorage.getItem('hyperapp-counter'));

const storeStateInStorage = state => window.localStorage.setItem('hyperapp-counter', JSON.stringify(state));

export { getStateFromStorage, storeStateInStorage };
