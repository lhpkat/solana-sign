import React, { useState, useRef, useMemo, useEffect } from 'react';
import { message, Select } from 'antd';
import Button from '@mui/material/Button';
import Modal from "./Modal";
import {
    BorderOutlined,
    Loading3QuartersOutlined,
    CalendarOutlined,
    WalletOutlined,
    FontSizeOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from "react-router-dom";
import cx from "classnames";
import { jsPDF } from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
import { fabric } from "fabric";
import { useAtomValue } from 'jotai';
import { currentUserAtom, signersAtom } from '../../store';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
} from '../../lib';
import './index.css';


const { Option } = Select;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const SignPage = () => {
    const canvasBoxWrap = useRef({});
    const [numPages, setNumPages] = useState(0);
    const [data, setData] = useState({});
    const currentUser = useAtomValue(currentUserAtom);
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    useEffect(() => {
        setData(location.state?.info);
    }, [location])

    const signType = [
        {
            id: 0,
            name: "Don't specify",
            icon: <Loading3QuartersOutlined />
        },
        {
            id: 1,
            name: "Data",
            icon: <CalendarOutlined />
        },
        {
            id: 2,
            name: "CheckBox",
            icon: <BorderOutlined />
        },
        {
            id: 3,
            name: "Wallet Address",
            icon: <WalletOutlined />
        },
        {
            id: 4,
            name: "Text",
            icon: <FontSizeOutlined />
        }
    ];

    const SignDom = () => {
        return (
            <div className='sign-dom'>
                { handleSubString(currentUser) }
            </div>
        )
    }

    const onDocumentLoadSuccess = ({ numPages: pages }) => {
        setNumPages(numPages => numPages + pages);
    };

    const handleSignDomRenderer = (id, info) => {
        const canvas = new fabric.Canvas(id, {
            // position: 'absolute',
            // left: 0,
            // top: 0,
            width: Math.ceil(info.pageWidth),
            height: Math.ceil(info.pageHeight),
            hasRotatingPoint: false,
            hoverCursor: "pointer",
            selection: false,
        });
        console.log({info});
        if (!!info.status) {
            // 添加已签名图片
            fabric.Image.fromURL(
                info.raw,
                (img) => {
                    canvas.add(img.set({
                        left: info.x,
                        top: info.y,
                        width: info.width,
                        height: info.height,
                        clipPath: new fabric.Circle({
                            radius: 200,
                            originX: 'center',
                            originY: 'center'
                        }),
                        angle: 30
                    }).scale(0.25));

                    canvas.renderAll();
                }, { crossOrigin: 'anonymous' }
            );
        } else {
            handleAddSignToCanvas(canvas, {
                width: info.width,
                height: info.height,
                x: info.x,
                y: info.y,
                address: info.address,
                signType: info.sign_type,
                raw: info.raw,
                status: info.status
            });
        }
    }

    const handleAddSignToCanvas = (fabricCanvas, info) => {
        const rect = new fabric.Rect({
            width: Math.ceil(info.width),
            height: Math.ceil(info.height),
            fill: '#eaf1ff',
            opacity: 0.7,
            rx: 10,
            ry: 10,
            originX: 'center',
            originY: 'center',
        });
        const text = new fabric.Text(handleSubString(info.address), {
            fontSize: 20,
            fontWeight: 400,
            fontFamily: 'BlinkMacSystemFont',
            originX: 'center',
            originY: 'center',
        });
        const text_desc = new fabric.Text(`签名：${ handleSubString(info.address) }`, {
            fontSize: 12,
            color: '#e8e8e8',
            left: 10,
            top: 50,
        });
        const group = new fabric.Group([rect, text, text_desc], {
            left: info.x,
            top: info.y,
            hasControls: false,
            subTargetCheck: true,
            lockMovementX: true,
            lockMovementY: true,
        });

        group.on('mousedown', function (options) {
            if (!!info.status || info.address !== currentUser) return;

            handleClickOpen();
            console.log({ options, info });
        });

        fabricCanvas.add(group);
    }

    const getAllPdfCanvas = async () => {
        const box = [];

        if (canvasBoxWrap.current) {
            const canvasBoxWrapArr = Object.values(canvasBoxWrap.current);
            const length = canvasBoxWrapArr.length;

            for (let i = 0; i < length; i += 1) {
                box.push(getCanvasByDom(canvasBoxWrapArr[i]));
            }
        }

        const allCanvas = await Promise.all(box);
        return allCanvas;
    };

    const save = async () => {
        const allCanvas = await getAllPdfCanvas();
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

    const handleSubString = (value) => {
        return (
            value.length > 12
                ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
                : value
        )
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
                        onLoadSuccess={ ({ _pageIndex, height, width }) => {
                            data.signers.forEach(item => {
                                if (item.page === _pageIndex) {
                                    handleSignDomRenderer(`canvas-action-${_pageIndex}`, {
                                        pageHeight: height,
                                        pageWidth: width,
                                        ...item
                                    });
                                }
                            })
                        } }
                        renderAnnotationLayer={ false }
                        renderTextLayer={ false }
                        inputRef={ (ref) => {
                            if (ref) {
                                canvasBoxWrap.current[i] = ref;
                            }
                        } }
                        // onClick={ () => {
                        //     activePageNumber.current = i + 1;
                        // } }
                    >
                        <canvas
                            width="500"
                            id={ `canvas-action-${i}` }
                            className="page-mask"
                        ></canvas>
                    </Page>
                );
            }
        }

        return temp;
    }, [numPages]);

    return (
        <div className="prepare-document-box">
            <Modal
                open={ open }
                handleClose={ handleClose }
            />
            <div className="canvas-panal">
                <div className="doc-box">
                    <Document
                        // file={ data.url }
                        // file="https://arweave.net/KoRjEpshjPZHnqVj4BB_DKimKXpa1nkGlrvpmtMTPeA"
                        file="/init.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        { RenderPage }
                    </Document>
                </div>
            </div>
            <div className="action-panal">
                <footer>
                    <Button variant="contained">完成</Button>
                </footer>
            </div>
        </div>
    )
}

export default SignPage;
