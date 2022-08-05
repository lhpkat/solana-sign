import { create } from 'dva-core';
import common from './common'

const app = create();

app.model(common);
app.start();

const store = app._store;

export default store;
