import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Steps } from 'antd';
import Button from '@mui/material/Button';
import { PlusCircleTwoTone } from '@ant-design/icons';
import Wallet from '../Wallet';
import './index.css';

const { Step } = Steps;


const SliderContain = () => {
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
        const { pathname = '' } = location;

        setStep(pathToStep[pathname]);
    }, [location]);

    const CreatePageButton = () => { 
        return (
            <Link to='/create'>
                <Button variant="contained" className='jump-to-create-box'>
                    <span>上传合同</span>
                    <span>
                        <PlusCircleTwoTone />
                    </span>
                </Button>
            </Link>
        )
    }

    return (
        <div className="slider-contain">
            <img src="/favicon.svg" alt="" width="130" height="100"/>
            {
                (step <= 0 || !step)
                ? <CreatePageButton />
                : <Steps
                    className="steps-contain"
                    direction="vertical"
                    current={ step - 1 }
                >
                    <Step title="上传文件" />
                    <Step title="管理收件人" />
                    <Step title="准备文件" />
                    <Step title="查看并发送" />
                </Steps>
            }
            <Wallet />
        </div>
    );
}

export default SliderContain;
