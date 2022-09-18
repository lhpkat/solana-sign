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

const createFileListAtom = atom([
    {
        "id": "AH8Tm561GniFQjGpVhuEHuaiEXmMJbxc2Efd96HSYYe",
        "address": "创建者地址",
        "status": 0, //文件总签名是否完成 0-未完成,1-已完成
        "url": "https://arweave.net/KoRjEpshjPZHnqVj4BB_DKimKXpa1nkGlrvpmtMTPeA",
        "sign_info": [
            {
                "status":1, //该签名者是否完成签名 0-未完成,1-已完成
                "address":"签名者地址",
                "x":10,
                "y":20,
                "height":15,
                "width":30,
                "page":1,
                "sign_type":"pdf",
                "raw":"base64签名附加数据" //未签名返回null
            }
        ]
    }
]);

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
