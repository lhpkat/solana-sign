import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, message, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { TokenListProvider } from '@solana/spl-token-registry'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useAtom } from 'jotai';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import EllipsisMiddle from '../EllipsisMiddle';
import './index.css';
import { currentUserAtom } from '../../store';
import { aboutSolanaWeb3 } from '../../lib';

const Wallet = () => {
    const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
    // const { wallet } = useWallet();
    // const { setVisible } = useWalletModal();

    // const onRequestConnectWallet = () => {
    //     setVisible(true);
    // };

    // // Prompt the user to connect their wallet
    // if (!wallet) {
    //     return <button onClick={onRequestConnectWallet}>Connect Wallet</button>;
    // }

    // // Displays the connected wallet address
    // return (
    //     <main>
    //         <p>Wallet successfully connected!</p>
    //         <p>{wallet.publicKey.toBase58()}</p>
    //     </main>
    // );

    const getProvider = () => {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;
        
            if (provider?.isPhantom) {
                return provider;
            }
        }
        message.info('Please install phantom.')
        window.open('https://phantom.app/', '_blank');
    };

    const connectWallet = async() => {
        const provider = getProvider();

        try {
            const resp = await provider.connect();

            setCurrentUser(resp.publicKey.toString());
        } catch (err) {
            message.error('User rejected the request.')
        }
    }

    const disconnect = () => {
        getProvider().disconnect();
        setCurrentUser('');
    }

    const paste = (data) => {
        navigator.clipboard.writeText(data).then(() => {
            message.success('复制成功！');
        });
    }

    const handleSubString = (value) => {
        return (
            value.length > 12
            ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
            : value
        )
    }

    const connectPhantomWallet = async() => {
        const wallet = aboutSolanaWeb3.wallets.Phantom.getAdapter();
        await wallet.connect();

        const owner = wallet.publicKey.toString();
        console.log('wallet', { wallet, owner });
    }

    useEffect(() => {
        connectPhantomWallet();
    }, [])

    return (
        <div className="wallet-contain">
            {
                !currentUser
                ? <Button onClick={connectWallet}>
                    登录
                </Button>
                : <>
                    <div className="user-box">
                        { handleSubString(currentUser) }
                        <CopyOutlined onClick={ () => { paste(currentUser) } }/>
                    </div>
                    <Button onClick={ disconnect }>
                        退出
                    </Button>
                </>
            }
        </div>
    );
}

export default Wallet;
