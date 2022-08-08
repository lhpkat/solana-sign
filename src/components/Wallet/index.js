import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Steps, Button, message, Typography } from 'antd';
import { PlusCircleTwoTone } from '@ant-design/icons';
import { TokenListProvider } from '@solana/spl-token-registry'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import EllipsisMiddle from '../EllipsisMiddle';
import './index.css';


const Wallet = ({ dispatch, user }) => {
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

            dispatch({
                type: 'common/changeUser',
                payload: resp.publicKey.toString()
            })
        } catch (err) {
            message.error('User rejected the request.')
        }
    }

    const disconnect = () => {
        getProvider().disconnect();

        dispatch({
            type: 'common/changeUser',
            payload: ''
        })
    }

    const paste = (data) => {
        navigator.clipboard.writeText(data).then(() => {
            message.success('复制成功！');
        });
    }

    return (
        <div className="wallet-contain">
            {
                !user
                    ? <Button onClick={connectWallet}>
                        登录
                    </Button>
                    : <div>
                        <Button onClick={ disconnect }>
                            退出
                        </Button>
                        <EllipsisMiddle suffixCount={5}>
                            { user }
                        </EllipsisMiddle>
                        <Button onClick={ () => { paste(user) } }>
                            复制
                        </Button>
                    </div>
            }
        </div>
    );
}

export default connect((state) => {
    const {
        common: {
            user,
        }
    } = state;

    return {
        user
    }
})(Wallet);