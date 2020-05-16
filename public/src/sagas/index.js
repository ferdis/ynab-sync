import { call, put, take, takeLatest, all} from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';

function poll() {
  return eventChannel(emitter => {
    const iv = setInterval(() => emitter(1), 2500);
    return () => clearInterval(iv);
  })

}

function* continuouslyFetchTransactions() {
  const channel = yield call(poll);

  try {
    while(true) {
      yield take(channel);
      yield put({ type: 'GET_TRANSACTIONS' });
    }
  } finally {}
}

function* fetchTransactions() {
  const json = yield fetch('/api/transactions')
    .then(response => response.json());

  yield put({ type: "TRANSACTIONS_RECEIVED", json: json.transactions || [{ error: json.message }] });
}

function* actionWatcher() {
  yield takeLatest('GET_TRANSACTIONS', fetchTransactions)
}


export default function* rootSaga() {
  yield all([
    actionWatcher(),
    put({ type: 'GET_TRANSACTIONS'}),
    continuouslyFetchTransactions()
  ]);
}
