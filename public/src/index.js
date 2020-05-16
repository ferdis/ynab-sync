import React from 'react';
import createSagaMiddleware from 'redux-saga';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { logger } from 'redux-logger';
import reducer from './reducers';
import App from './components/App';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const state = {
  transactions: [],
};

const store = createStore(
  reducer,
  state,
  applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(rootSaga);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept(App);
}

