import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import bs58 from "bs58";
import { useAtomValue } from 'jotai';
import { Keypair } from "@solana/web3.js";
import {
    signersAtom,
    signGroupInfoAtom,
    viewersAtom,
    pdfFileAtom,
    currentUserAtom
} from '../../store';
import { useUserInfo, aboutSolanaWeb3 } from '../../lib';
import { uploadPdf, requestCreateSign } from "../../api";
import './index.css';


const { createWeb3Connection, transferNativeSol } = aboutSolanaWeb3; 

const Review = () => {
    const signers = useAtomValue(signersAtom);
    const viewers = useAtomValue(viewersAtom);
    const signGroupInfo = useAtomValue(signGroupInfoAtom);
    const pdfFile = useAtomValue(pdfFileAtom);
    const currentUser = useAtomValue(currentUserAtom);
    const [contractName, setContractName] = useState(pdfFile.name);

    const data = useUserInfo();

    const handleSubString = (value) => {
        return (
            value.length > 12
                ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
                : value
        )
    }

    const handleSend = async () => {
        // const test = bs58.decode("3md7BBV9wFjYGnMWcMNyAZcjca2HGfXWZkrU8vvho66z2sJMZFcx6HZdBiAddjo2kzgBv3uZoac3domBRjJJSXkbBvokxPLqkN2gx8C5DroAWtsLPjGFXrADuB4ZCjZTbwT3N15hwriTfHBJhcvdcfrChkCVnjHnD6atddBzmgyMAMnfjQGys6ArKh2JQYEXthAEZpzmPxwyu2jYbFXSeqNexT176bt1hhMm4dwCCaVLs7yQpfwjcrSJWppjHt3s3niUgFfEMVStNRdjv5S3A1ksTJwgBiLEWAfcb")

        // const keyPair = Keypair.fromSecretKey(test);
        let signersStr = "";

        signGroupInfo.forEach((item, index) => {
            if (index === 0) {
                signersStr = signersStr
                    + item.address + ","
                    + item.top + ","
                    + item.left + ","
                    + item.height + ","
                    + item.width + ","
                    + item.page + ","
                    // + item.id + ","
                    + item.type
            } else {
                signersStr = signersStr + ";"
                + item.address + ","
                + item.top + ","
                + item.left + ","
                + item.height + ","
                + item.width + ","
                + item.page + ","
                // + item.id + ","
                + item.type
            }
        });

        const file = new File([pdfFile.blob], `${contractName}.pdf`, { type: "application/pdf" });
        const fd = new FormData();

        fd.append("signers", signersStr);
        fd.append("file", file);

        // const res = await uploadPdf(data?.userInfo?.publicKey, fd);
        const res = await uploadPdf(currentUser, fd);

        if (!res?.code && res.msg === "success") {
            // const decoded = bs58.decode(res?.data?.tx);
            const wallet = aboutSolanaWeb3.wallets.Phantom.getAdapter();
            await wallet.connect();
            const { solana = undefined } = window;

            const hashRes = await transferNativeSol({
                payerPublicKey: solana?.publicKey,
                toPubkey: res?.data?.file_address,
                amount: Number(res?.data?.pay_amount) * 1e9,
                connection: createWeb3Connection(),
                wallet: solana,
            });

            await requestCreateSign({
                user: solana?.publicKey.toString(),
                file_address: res?.data?.file_address,
                hash: hashRes
            })
        }
    }

    return (
        <div className="review-box">
            <div className="title">检查和发送</div>
            <div className='sub-title'>接收人</div>
            <div className="signers-box">
                {
                    Object.keys(signers).map(item => (
                        <div className="signer">
                            { handleSubString(item) }
                            <div>签名人</div>
                        </div>
                    ))
                }
                {
                    Object.keys(viewers).map(item => (
                        <div className="viewer">
                            { handleSubString(item) }
                            <div>阅览人</div>
                        </div>
                    ))
                }
            </div>
            <div className='sub-title'>设置合同名</div>
            <Input
                placeholder={ pdfFile.name }
                value={ contractName }
                onChange={ (e) => {
                    setContractName(e.target.value)
                } }
            />
            <footer>
                <Link to="/prepare-document">
                    <Button  variant="contained">上一步</Button>
                </Link>
                <Button  variant="contained" onClick={ () => {
                    handleSend();
                } }>发送</Button>
            </footer>
        </div>
    )
}

export default Review;
