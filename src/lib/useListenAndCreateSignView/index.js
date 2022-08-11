import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import './index.css';

/**
 * 
 * @param {} ChildrenDom 
 * @param {*} canClickDown boolean
 * @param {*} callback 
 * @returns 
 */

const useListenAndCreateSignView = (ChildrenDom, canClickDown = true, callback) => {
    const [success, setSuccess] = useState(false);
    const [showChildren, setShowChildren] = useState(false);
    const [location, setLocation] = useState({
        screenX: 0,
        screenY: 0
    });

    const SignBox = () => {
        const { screenX, screenY } = location;

        return (
            <div id="dom-box"
                style={{
                    top: screenY - 75,
                    left: screenX - 100
                }}
            >
                {
                    showChildren &&
                    <ChildrenDom />
                }
            </div>
        )
    }

    const listenMouseMove = (e) => {
        setLocation({
            screenX: e.pageX,
            screenY: e.pageY
        });

        document.addEventListener('click', listenMouseClick);
    }

    const listenMouseClick = (e) => {
        if (!canClickDown) return;

        callback && callback(e);
        setSuccess(true);
        setShowChildren(false);
        document.removeEventListener('mousemove', listenMouseMove);
        document.removeEventListener('click', listenMouseClick);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', listenMouseMove);
            document.removeEventListener('click', listenMouseClick);
        }
    }, [])

    const starter = (event) => {
        console.log('000000');
        if (ChildrenDom) {
            setLocation({
                screenX: event?.screenX || 0,
                screenY: event?.screenY || 0
            });
            setSuccess(false);
            setShowChildren(true);
            document.addEventListener('mousemove', listenMouseMove);
        }
    }

    const FloatModal = () => {
        const root = document.getElementById('root');

        if (ChildrenDom) {
            return createPortal(<SignBox />, root);
        }
        return createPortal(<div>test</div>, root);
    }

    return [
        starter,
        FloatModal,
        success
    ];
}

export default useListenAndCreateSignView;
