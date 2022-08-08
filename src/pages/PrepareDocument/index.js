import React, { useState, useRef, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import cx from "classnames";
import { jsPDF } from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from 'html2canvas';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
} from '../../lib';
import './index.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;


const PrepareDocument = ({ dispatch, user }) => {
    const canvasBoxWrap = useRef({});
    const maskRef = useRef();
    const [numPages, setNumPages] = useState(0);
    const startListen = useRef(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleAllDomToCanvas = async() => {
        const box = [];

        if (canvasBoxWrap.current) {
            const canvasBoxWrapArr = Object.values(canvasBoxWrap.current);
            const length = canvasBoxWrapArr.length;

            for (let i = 0; i < length; i += 1) {
                box.push(getCanvasByDom(canvasBoxWrapArr[i]));
            }
        }

        return Promise.all(box);
    };

    const getAllPdfImage = async() => {
        const allCanvas = await handleAllDomToCanvas();

        // allImg.map(canvas => canvas.toDataURL("image/jpeg", 1.0))

        return allCanvas;
    }

    const save = async() => {
        const allCanvas = await getAllPdfImage();

        const doc = new jsPDF();

        allCanvas.forEach((canvas, index) => {
            const image = canvas.toDataURL("image/jpeg", 1.0);

            // canvasToPdf(image, doc);
            if (index === 0) {
                doc.addImage(image, "JPEG", 0, 0, 210, 300);
                // // 设置透明度.
                // doc.saveGraphicsState();
                // doc.setGState(new doc.GState({ opacity: 0.2 }));
                // doc.restoreGraphicsState();
            } else {
                doc.addPage();
                doc.addImage(image, "JPEG", 0, 0, 210, 300);
                // // 设置透明度.
                // doc.saveGraphicsState();
                // doc.setGState(new doc.GState({ opacity: 0.2 }));
                // doc.restoreGraphicsState();
            }
        });

        doc.save("test.pdf");
    }

    const signature = (doc, text, image, location, angle = 0) => {
        doc.addImage(image, "JPEG", 0, 0, 210, 300);
        // 设置透明度.
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.2 }));

        doc.text(text, location.x, location.y, { angle });
        doc.restoreGraphicsState();
    };

    const onClick = (doc_, ) => {
        const x = getAllPdfImage();

        if (x) {
            const doc = doc_ || new jsPDF();
            doc.setTextColor(255, 0, 0);

            x.forEach((image, index) => {
                if (index === 0) {
                    signature(doc, 'hello react', image, {
                        x: 10,
                        y: 10
                    });
                } else {
                    doc.addPage();
                    signature(doc, "hello react", image, {
                        x: 30,
                        y: 30
                    });
                }
            });

            doc.save("test.pdf");
        }
    };

    const RenderPage = useMemo(() => {
        const temp = [];
        const t = Date.now();

        if (numPages) {
            canvasBoxWrap.current = {};

            for (let i = 0; i < +numPages ; i+=1) {
                temp.push(
                    <Page
                        width='500'
                        key={ `${i}-${t}` }
                        pageNumber={ i + 1 }
                        renderAnnotationLayer={ false }
                        renderTextLayer={ false }
                        inputRef={ (ref) => {
                            if (ref) {
                                canvasBoxWrap.current[i] = ref;
                                addListener(ref);
                                ref.addEventListener('click', (e) => {
                                    console.log(e);
                                })
                            }
                        } }
                    />
                );
            }
        }

        return temp;
    }, [numPages]);

    const addListener = (element) => {
        const changeLocation = (e) => {
            if (!startListen.current) {
                return ;
            }
            e.stopPropagation();
            e.preventDefault();

            let signBox_ = document.querySelector('.sign-box');

            if (!signBox_) {
                const signBox = document.createElement('div');
                const docBox = document.querySelector('.doc-box');
        
                signBox.className = 'sign-box';
                signBox.innerText = user.substring(0, 6) + '...' + user.substring(user.length - 3);
                docBox.appendChild(signBox);

                signBox_ = document.querySelector('.sign-box');
            } else {
                signBox_.innerText = user.substring(0, 6) + '...' + user.substring(user.length - 3);
            }

            const {
                width: elementWidth,
                height: elementHeight
            } = element.getClientRects()[0];

            const {
                width: signBoxWidth,
                height: signBoxHeight
            } = signBox_.getClientRects()[0];

            let locationX = e.offsetX;
            let locationY = e.offsetY;

            if (locationX > (elementWidth - signBoxWidth)) {
                locationX = elementWidth - signBoxWidth;
            } else if (locationX < 0) {
                locationX = 0;
            }

            if (locationY> (elementHeight - signBoxHeight)) {
                locationY = elementHeight - signBoxHeight;
            } else if (locationY < 0) {
                locationY = 0;
            }

            signBox_.style.top = `${locationY}px`;
            signBox_.style.left = `${locationX}px`;

            element.addEventListener('click', () => {
                startListen.current = false;
                element.removeEventListener('mousemove', changeLocation, false);
                // canvasPanal.removeEventListener('scroll', changeLocation, false);
            });

            element.addEventListener('mouseleave', () => {
                startListen.current = false;
                element.removeEventListener('mousemove', changeLocation, false);
                // canvasPanal.removeEventListener('scroll', changeLocation, false);
            })
        }
        // const canvasPanal = document.querySelector('.canvas-panal');

        element.addEventListener('mousemove', changeLocation, false);

        // element.addEventListener('scroll', changeLocation, false);
        // canvasPanal.addEventListener('scroll', changeLocation, false);
    }

    // useEffect(() => {
    //     const canvasPanal = document.querySelector('.canvas-panal');

    //     canvasPanal.addEventListener('scroll', (e) => {
    //         if (startListen.current) {
    //             e.preventDefault();
    //             e.stopPropagation();
    //             return;
    //         }
    //         console.log(555);

    //     }, { passive: false });
    // }, [startListen.current])

    const addSign = () => {
        startListen.current = true;
        // const canvasPanal = document.querySelector('.canvas-panal');
        // const {
        //     x: canvasPanalX,
        //     y: canvasPanalY,
        //     width: canvasPanalWidth,
        //     height: canvasPanalHeight,
        // } = canvasPanal.getClientRects()[0];

        // if (!user) {
        //     message.info('请先登录');
        //     return;
        // }

        // if (!signBox_) {
        //     const signBox = document.createElement('div');
        //     const docBox = document.querySelector('.doc-box');
    
        //     signBox.className = 'sign-box';
        //     signBox.innerText = user.substring(0, 6) + '...' + user.substring(user.length - 3);
        //     docBox.appendChild(signBox);

        //     signBox_ = document.querySelector('.sign-box');
        // } else {
        //     signBox_.innerText = user.substring(0, 6) + '...' + user.substring(user.length - 3);
        // }

        // const { width: signBoxWidth, height: signBoxHeight } = signBox_.getClientRects()[0];

        // const changeLocation = (e) => {
        //     if (!startListen.current) {
        //         return ;
        //     }
        //     e.stopPropagation();

        //     let locationX = e.offsetX;
        //     let locationY = e.offsetY;

        //     if (locationX > (canvasPanalWidth - signBoxWidth)) {
        //         locationX = canvasPanalWidth - signBoxWidth;
        //     } else if (locationX < 0) {
        //         locationX = 0;
        //     }

        //     if (locationY> (canvasPanalHeight - signBoxHeight)) {
        //         locationY = canvasPanalHeight - signBoxHeight;
        //     } else if (locationY < 0) {
        //         locationY = 0;
        //     }

        //     signBox_.style.top = `${locationY}px`;
        //     signBox_.style.left = `${locationX}px`;

        //     element.addEventListener('click', () => {
        //         element.removeEventListener('mousemove', changeLocation, false)
        //     });

        //     element.addEventListener('mouseleave', () => {
        //         element.removeEventListener('mousemove', changeLocation, false)
        //     })
        // }

        // element.addEventListener('mousemove', changeLocation, false);
        // element.addEventListener('scroll', changeLocation, false);
    }

    useEffect(() => {
        if (maskRef.current) {
            // maskRef.current.addEventListener('mousemove', handleAddSignDom, false);
            addListener(maskRef.current);
        }
    }, [maskRef.current])

    return (
        <div className="prepare-document-box">
            <div
                // className={ cx("canvas-panal", {
                //     'overflow-hidden': !startListen.current
                //     // 'overflow-hidden': true
                // }) }
                className={`canvas-panal ${startListen.current ? 'overflow-hidden' : ''}`}
            >
                <div
                    className="doc-box"
                >
                    <Document
                        // file="https://arweave.net/KoRjEpshjPZHnqVj4BB_DKimKXpa1nkGlrvpmtMTPeA"
                        file="init.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        { RenderPage }
                    </Document>
                    <div className="mask"
                        ref={ maskRef }
                        // onMouseEnter={ () => { startListen.current = true; } }
                        // onMouseLeave={ () => { startListen.current = false; } }
                    />
                </div>
            </div>
            <div className="action-panal">
                {
                    !!numPages &&
                    <Button onClick={ onClick }>下载签名后pdf</Button>
                }
                <Button
                    onClick={ addSign }
                >添加签名</Button>
                <Button
                    onClick={ save }
                >保存</Button>
            </div>
        </div>
    )
}

export default connect((state) => {
    const { user } = state.common;

    return ({
        user,
    })
})(PrepareDocument);