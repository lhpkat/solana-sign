import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Steps, Button } from 'antd';
import { PlusCircleTwoTone } from '@ant-design/icons';
import Wallet from '../Wallet';
import './index.css';

const { Step } = Steps;


const SliderContain = ({ dispatch, user }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        console.log(user);
    }, [user])

    return (
        <div className="slider-contain">
            <Button><PlusCircleTwoTone /></Button>
            <Steps
                className="steps-contain"
                direction="vertical"
                current={ step }
            >
                <Step title="上传合同" />
                <Step title="管理收件人" />
                <Step title="准备文件" />
                <Step title="查看并发送" />
            </Steps>
            <Wallet />
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
})(SliderContain);
