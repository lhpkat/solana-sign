import React, { useEffect } from 'react';
import { useUserInfo } from '../../lib';
import './index.css';

const Review = () => {
    const data = useUserInfo();

    useEffect(() => {
        console.log('data', data);
    }, [data])

    return (
        <div className="review-box">
            Review
        </div>
    )
}

export default Review;
