
const common = {
    namespace: 'common',
    state: {
        user: ''
    },
    reducers: {
        changeUser(state, { payload }) {
            return { ...state, user: payload };
        },
    },
    effects: {
      *fetchUserData({ payload }, { call, put }) {
            // const { data } = yield call(delay, 1000);
            yield put({ type: 'changeUser', payload: payload });
      },
    },
    subscriptions: {
        setup({ dispatch, history }) { 
            console.log(history);
        },
    },
}

export default common;
