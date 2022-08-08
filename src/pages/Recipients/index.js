import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './index.css';

const Recipients = () => {
    const viewer = useRef(null);

    useEffect(() => {
        WebViewer(
            {
                path: '/webviewer/lib',
                initialDoc: 'init.pdf',
            },
            viewer.current,
        ).then((instance) => {
            const { documentViewer } = instance.Core;
            // you can now call WebViewer APIs here...
        });
    }, []);

    return (
        <div className="recipients-box">
            <div className="webviewer" ref={viewer} style={{height: "100vh"}}></div>
        </div>
    )
}

export default Recipients;
