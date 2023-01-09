import { create } from 'dva-core';
import common from './common';
import { atom } from 'jotai';


const app = create();

app.model(common);
app.start();


const store = app._store;

const currentUserAtom = atom('');

const creatorAtom = atom('');

const pdfFileAtom = atom('');

const signersAtom = atom({});

const viewersAtom = atom({});

const fileListAtom = atom({});

const signGroupInfoAtom = atom([]);

const createFileListAtom = atom([]);

const signFileListAtom = atom([]);

export default store;

export {
    currentUserAtom,
    creatorAtom,
    signersAtom,
    viewersAtom,
    fileListAtom,
    signGroupInfoAtom,
    pdfFileAtom,
    createFileListAtom,
    signFileListAtom
}
