import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useLocation, Link } from "react-router-dom";
import './index.css'


const PageFooter = () => {
    const pathToStep = {
        '/': 0,
        '/create': 1,
        '/recipients': 2,
        '/prepare-document': 3,
        '/review': 4,
        0: '/',
        1: '/create',
        2: '/recipients',
        3: '/prepare-document',
        4: '/review'
    }
    const location = useLocation();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const { pathname = '' } = location;

        setStep(pathToStep[pathname]);
    }, [location])

    return (
        <div className='page-footer-box'>
            <Link to={`${pathToStep[step - 1] || '/'}`}>
                <Button>返回上一步</Button>
            </Link>
            <Link to={`${pathToStep[step + 1] || '/'}`}>
                <Button>下一步</Button>
            </Link>
        </div>
    )
}

export default PageFooter;
