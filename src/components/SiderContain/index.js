import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, Router, useHref, useLocation } from "react-router-dom";
import { Steps, Button } from 'antd';
import { PlusCircleTwoTone } from '@ant-design/icons';
import Wallet from '../Wallet';
import './index.css';

const { Step } = Steps;


const SliderContain = ({ dispatch, user }) => {
    const pathToStep = {
        '/': 0,
        '/create': 1,
        '/recipients': 2,
        '/prepare-document': 3,
        '/review': 4,
    }
    const [step, setStep] = useState(0);
    let location = useLocation();

    useEffect(() => {
        console.log(user);
    }, [user])

    useEffect(() => {
        const { pathname = '' } = location;

        setStep(pathToStep[pathname]);
    }, [location]);

    useEffect(() => {
        console.log(step);
    }, [step])

    const CreatePageButton = () => { 
        return (
            <Link to='/create'>
                <div className='jump-to-create-box'>
                    <span>上传合同</span>
                    <span>
                        <PlusCircleTwoTone />
                    </span>
                </div>
            </Link>
        )
    }

    return (
        <div className="slider-contain">
            {
                step === 0
                    ? <CreatePageButton />
                    : <Steps
                        className="steps-contain"
                        direction="vertical"
                        current={ step - 1 }
                    >
                        <Step title="上传合同" />
                        <Step title="管理收件人" />
                        <Step title="准备文件" />
                        <Step title="查看并发送" />
                    </Steps>
            }
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
