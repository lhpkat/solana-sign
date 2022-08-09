import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Button, message, Input, Tag, Form } from 'antd';
import { PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import cx from "classnames";
import { jsPDF } from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from 'html2canvas';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
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

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

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
                        width='500'
                        key={ `${i}-${t}` }
                        pageNumber={ i + 1 }
                        renderAnnotationLayer={ false }
                        renderTextLayer={ false }
                        inputRef={ (ref) => {
                            if (ref) {
                                canvasBoxWrap.current[i] = ref;
                            }
                        } }
                    >
                        <div
                            className="page-mask"
                            // onMouseEnter={ (e) => handleAddSignDom(e, i) }
                            // onMouseLeave={ startListen.current = false }
                        />
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
            console.log({ ...signers, [value]: value });
            setSigners({ ...signers, [value]: value });
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
            <div className={`canvas-panal ${startListen.current ? 'overflow-hidden' : ''}`}>
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
                    onClick={ addSign }
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
                                onClose={ () => deleteTag(item) }
                            >
                                {
                                    item.length > 12
                                        ? `${item.substring(0, 6)}...${item.substring(item.length - 3)}`
                                        : item
                                }
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