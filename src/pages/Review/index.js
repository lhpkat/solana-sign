import React, { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { Link } from "react-router-dom";
import bs58 from "bs58";
import { useAtomValue } from 'jotai';
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
        // console.log(test);
        
        // const keyPair = Keypair.fromSecretKey(test);
        // console.log({keyPair});
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
                    + item.type
            } else {
                signersStr = signersStr + ";"
                + item.address + ","
                + item.top + ","
                + item.left + ","
                + item.height + ","
                + item.width + ","
                + item.page + ","
                + item.type
            }
        });

        const file = new File([pdfFile.blob], `${contractName}.pdf`, { type: "application/pdf" });
        const fd = new FormData();

        fd.append("signers", signersStr);
        fd.append("file", file);

        // const res = await uploadPdf(data?.userInfo?.publicKey, fd);
        const res = await uploadPdf(currentUser, fd);

        if (!res?.code) {
            const decoded = bs58.decode(res?.data?.tx);
            const wallet = aboutSolanaWeb3.wallets.Phantom.getAdapter();
            await wallet.connect();

            const transres = await transferNativeSol(
                {
                    payerPublicKey: window?.solana?.publicKey,
                    toPubkey,
                    amount: amount * 1e9,
                    connection,
                    wallet: solana,
                },
                res?.data?.file_address,
                Number(res?.data?.pay_amount) * 1e9,
                data?.userInfo?.publicKey,
                createWeb3Connection,
                wallet,
            );

            await requestCreateSign({
                user: data?.userInfo?.publicKey,
                file_address: res?.data?.file_address,
                hash: transres?.hash || transres?.result
            })
        }
    }

    useEffect(() => {
        console.log('data', data);
    }, [data])

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
            <Button onClick={ async () => {
                const resp = await window.solana.connect();
                // resp.publicKey.toString();
                //连接了solana钱包，得到了钱包地址
                console.log('resp.publicKey.toString() :',resp.publicKey.toString());

                const wallet = aboutSolanaWeb3.wallets.Phantom.getAdapter();
                await wallet.connect();
                const web3 = createWeb3Connection()
                await transferNativeSol(
                    data?.userInfo?.publicKey,
                    1 * 1e9,
                    data?.userInfo?.publicKey,
                    web3,
                    wallet,
                );
            } }>
                test
            </Button>
            <footer>
                <Link to={ {
                    pathname: "/prepare-document",
                    state: {
                        test: '0'
                    }
                } }>
                    <Button>上一步</Button>
                </Link>
                <Button onClick={ () => {
                    handleSend();
                } }>发送</Button>
            </footer>
        </div>
    )
}

export default Review;
