import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Button, message, Input, Tag, Form } from 'antd';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import cx from "classnames";
import { jsPDF } from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from 'html2canvas';
import { fabric } from "fabric";
import { ReactSketchCanvas } from 'react-sketch-canvas';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
    useListenAndCreateSignView
} from '../../lib';
import './index.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const { Search } = Input;


const PrepareDocument = ({ dispatch, user }) => {
    const [form] = Form.useForm();
    const canvasBoxWrap = useRef({});
    const userRef = useRef('');
    const [numPages, setNumPages] = useState(0);
    const startListen = useRef(false);
    const [signers, setSigners] = useState({});
    const activeSigner = useRef('');

    const SignDom = () => {
        return (
            <div className='sign-dom'>
                { activeSigner.current }
            </div>
        )
    }

    const [starter, FloatModal, success] = useListenAndCreateSignView(SignDom, true, (e) => {
        console.log('callbacke', e);
    });

    useEffect(() => {
        console.log('success', success);
    }, [success])

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleCanvasActionRenderer = (baseId, totalOfPages) => {
        for (let i = 0; i < totalOfPages; i += 1) { 
            const canvas = new fabric.Canvas(`${baseId}-${i}`);
            const rect = new fabric.Rect({
                width: 100,
                height: 20,
                fill: '#f55',
                opacity: 0.7
            });
            const circle = new fabric.Circle({
                radius: 20,
                fill: 'green',
                left: 100,
                top: 100
            });

            canvas.add(rect, circle);
        }
    }

    const handleCanvasItemActionRenderer = (id, index) => {
        const canvas = new fabric.Canvas(id, {
            // position: 'absolute',
            // left: 0,
            // top: 0,
            width: 500,
            height: 647,
        });

        // canvas.clear().renderAll();
        canvas.on('mouse:down', function (options) {
            console.log('startListen.current', startListen.current);
            if (!startListen.current) return;
            startListen.current = false;
            handleAddSignToCanvas(canvas, options);
        });

    }

    const handleAddSignToCanvas = (fabricCanvas, options) => {
        console.log('activeSigner', activeSigner.current);
        const rect = new fabric.Rect({
            width: 200,
            height: 150,
            fill: '#eaf1ff',
            // borderColor: '#618cf9',
            // hasBorders: false,
            // hasControls: false,
            // borderDashArray: ['dash'],
            opacity: 0.7,
            rx: 10,
            ry: 10,
            originX: 'center',
            originY: 'center'
        });
        const text = new fabric.Text(activeSigner.current, {
            fontSize: 20,
            fontWeight: 400,
            fontFamily: 'BlinkMacSystemFont',
            originX: 'center',
            originY: 'center'
        });
        const text_desc = new fabric.Text("在此签名", {
            fontSize: 12,
            color: '#e8e8e8',
            left: 30,
            top: 50,
        });
        const group = new fabric.Group([rect, text, text_desc], {
            width: 200,
            height: 150,
            left: options.e.offsetX - 100,
            top: options.e.offsetY - 75,
        });

        fabricCanvas.add(group);
    }

    useEffect(() => {
        userRef.current = user;
    }, [user])

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
            } else {
                doc.addPage();
                doc.addImage(image, "JPEG", 0, 0, 210, 300);
            }

            // // 设置透明度.
            // doc.saveGraphicsState();
            // doc.setGState(new doc.GState({ opacity: 0.2 }));
            // doc.restoreGraphicsState();
        });

        doc.save("test.pdf");
    }

    const handleAddSignDom = (e, i) => {
        if (!startListen.current) return;

        const user = userRef.current;
        if (!user) {
            message.info('请先登录！');
            return;
        }

        if (e.target) {
            const signDom = document.createElement('div');
            signDom.innerText = user.substring(0, 6) + '...' + user.substring(user.length - 3);
            signDom.className = 'sign-item';
            signDom.addEventListener('mousemove', (e) => {
                console.log(e);
            })
            e.target.appendChild(signDom);
        }
    }

    const RenderPage = useMemo(() => {
        const temp = [];
        const t = Date.now();

        if (numPages) {
            canvasBoxWrap.current = {};

            for (let i = 0; i < +numPages; i += 1) {
                temp.push(
                    <Page
                        width={ 500 }
                        className="page"
                        key={ `${i}-${t}` }
                        pageNumber={ i + 1 }
                        onLoadSuccess={ ({ _pageIndex }) => {
                            handleCanvasItemActionRenderer(`canvas-action-${_pageIndex}`, _pageIndex);
                        } }
                        renderAnnotationLayer={ false }
                        renderTextLayer={ false }
                        inputRef={ (ref) => {
                            if (ref) {
                                canvasBoxWrap.current[i] = ref;
                            }
                        } }
                        canvasRef={ (ref) => {
                            // ref.id = `canvas-action-${i}`
                        } }
                    >
                        <canvas
                            width="500"
                            id={ `canvas-action-${i}` }
                            className="page-mask"
                        // onMouseEnter={ (e) => handleAddSignDom(e, i) }
                        // onMouseLeave={ startListen.current = false }
                        ></canvas>
                    </Page>
                );
            }
        }

        return temp;
    }, [numPages]);

    const addSign = () => {
        startListen.current = true;
    }

    const handleAddSigner = (value) => {
        if (value) {
            setSigners({
                ...signers,
                [value]: value.length > 12
                            ? value.substring(0, 6) + '...' + value.substring(user.length - 3)
                            : value
            });
            form.resetFields();
        }
    }

    const deleteTag = (value) => {
        const signers_ = { ...signers };

        delete signers_[value];

        setSigners(signers_);
    }

    return (
        <div className="prepare-document-box">
            <FloatModal />
            <div className="canvas-panal">
                <div className="doc-box">
                    <Document
                        // file="https://arweave.net/KoRjEpshjPZHnqVj4BB_DKimKXpa1nkGlrvpmtMTPeA"
                        file="init.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        { RenderPage }
                    </Document>
                </div>
            </div>
            <div className="action-panal">
                <Button
                    onClick={ (e) => {
                        addSign();
                    } }
                >添加签名</Button>
                <Button
                    onClick={ save }
                >保存</Button>
                <div className="add-myself"
                    onClick={() => handleAddSigner(user)}
                >
                    <PlusOutlined />添加我自己
                </div>
                <Form form={form}>
                    <Form.Item name="addSigner">
                        <Search
                            allowClear
                            placeholder="input add Wallet Address"
                            enterButton={ <PlusCircleFilled /> }
                            size="large"
                            onSearch={ handleAddSigner }
                        />
                    </Form.Item>
                </Form>
                <div className="divider" />
                <div className="signers-box">
                    <div className="signers-box-title">
                        签名人
                    </div>
                    {
                        Object.values(signers).map(item => (
                            <Tag
                                className="signer"
                                key={ item }
                                closable
                                onClick={ (e) => {
                                    startListen.current = true;
                                    activeSigner.current = item;
                                    starter(e);
                                } }
                                onClose={ () => deleteTag(item) }
                            >
                                { item }
                            </Tag>
                        ))
                    }
                </div>
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