import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Steps, Button, message, Typography } from 'antd';
import { PlusCircleTwoTone } from '@ant-design/icons';
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

    const getAddress = async() => {
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

    useEffect(() => {

    }, [])

    return (
        <div className="wallet-contain">
            {
                !user
                    ? <div onClick={ () => { getAddress(); } }>
                        登录
                    </div>
                    : <div onClick={ () => { disconnect(); } }>
                        退出
                        <EllipsisMiddle suffixCount={5}>
                            { user }
                        </EllipsisMiddle>
                    </div>
            }
            <div onClick={ () => { paste(user) }}>粘贴</div>
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