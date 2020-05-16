const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'GET_TRANSACTIONS':
      return { ...state, loading: true };
    case 'TRANSACTIONS_RECEIVED':
      return { ...state, transactions: action.json, loading: false }
    default:
      return state;
  }
};

export default reducer;
