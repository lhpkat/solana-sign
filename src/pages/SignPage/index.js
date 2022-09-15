import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Button, message, Select } from 'antd';
import {
    BorderOutlined,
    Loading3QuartersOutlined,
    CalendarOutlined,
    WalletOutlined,
    FontSizeOutlined,
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import cx from "classnames";
import { jsPDF } from "jspdf";
import { Document, Page, pdfjs } from "react-pdf";
import PDFMerger from 'pdf-merger-js/browser';
import { Buffer } from 'buffer';
import { fabric } from "fabric";
import { useAtomValue, useSetAtom } from 'jotai';
import { fileListAtom, signersAtom, signGroupInfoAtom } from '../../store';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
    useListenAndCreateSignView
} from '../../lib';
import './index.css';


const { Option } = Select;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const SignPage = () => {
    const canvasBoxWrap = useRef({});
    const [numPages, setNumPages] = useState(0);
    const startListen = useRef(false);
    const signers = useAtomValue(signersAtom);
    const activeSigner = useRef('');
    const activeSelectType = useRef('');
    const activePageNumber = useRef(0);
    const fileList = useAtomValue(fileListAtom);
    const setSignGroupInfo = useSetAtom(signGroupInfoAtom);
    const [pdfMetaData, setPdfMetaData] = useState([]);

    const [info, setInfo] = useState([]);

    const signType = [
        {
            name: "Don't specify",
            icon: <Loading3QuartersOutlined />
        },
        {
            name: "Data",
            icon: <CalendarOutlined />
        },
        {
            name: "CheckBox",
            icon: <BorderOutlined />
        },
        {
            name: "Wallet Address",
            icon: <WalletOutlined />
        },
        {
            name: "Text",
            icon: <FontSizeOutlined />
        }
    ];

    const SignDom = () => {
        return (
            <div className='sign-dom'>
                { handleSubString(activeSigner.current) }
            </div>
        )
    }

    const [starter, FloatModal, success] = useListenAndCreateSignView(SignDom, true, (e) => {
        console.log('callback', e);
    });

    useEffect(() => {
        console.log('success', success);
    }, [success])

    const onDocumentLoadSuccess = ({ numPages: pages }) => {
        setNumPages(numPages => numPages + pages);
    };

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
            if (!startListen.current) return;

            startListen.current = false;
            setTimeout(() => {
                handleAddSignToCanvas(canvas, options);
            }, 200)
        });
    }

    const handleAddSignToCanvas = (fabricCanvas, options) => {
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
            originY: 'center',
        });
        const text = new fabric.Text(handleSubString(activeSigner.current), {
            fontSize: 20,
            fontWeight: 400,
            fontFamily: 'BlinkMacSystemFont',
            originX: 'center',
            originY: 'center',
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
            left: options.e.offsetX,
            top: options.e.offsetY,
            hasRotatingPoint: false,
            lockRotation: true,
            rotatingPointOffset: false,
        });

        setInfo(info => ([
            ...info,
            {
                group,
                page: activePageNumber.current,
                type: activeSelectType.current,
                address: activeSigner.current
            }
        ]))

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

        setSignGroupInfo(info.slice().map(item => ({
            address: item.address,
            page: item.page,
            type: item.type,
            top: item.group.get("top"),
            left: item.group.get("left"),
            width: Math.floor(item.group.get("width") * item.group.get('scaleX').toFixed(2)),
            height: Math.floor(item.group.get("height") * item.group.get('scaleY').toFixed(2)),
        })))

        // doc.save("test.pdf");
    }

    const handleSubString = (value) => {
        return (
            value.length > 12
                ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
                : value
        )
    }

    const mergePdf = async (data) => {
        if (!data?.length) return;

        if (data.length <= 1) {
            const url = URL.createObjectURL(data[0]);
            setPdfMetaData(url);
            return;
        }

        window.Buffer = Buffer;
        const merger = new PDFMerger();

        for (const file of data) {
            await merger.add(file)
        }

        const mergedPdf = await merger.saveAsBlob();
        const url = URL.createObjectURL(mergedPdf);
        setPdfMetaData(url);
    }

    const handleActiverChange = (value) => {
        activeSigner.current = value;
    }

    const handleSelectTypeChange = (value) => {
        if (!activeSigner.current) {
            message.error("请选择一位签名者！");
            return;
        };
        activeSelectType.current = value;
        startListen.current = true;
        starter();
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
                        onClick={ () => {
                            activePageNumber.current = i + 1;
                        } }
                        // canvasRef={ (ref) => {
                        //     ref.id = `canvas-action-${i}`
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

    useEffect(() => {
        const fileListArr = Object.values(fileList);
        if (fileListArr?.length > 0) {
            const fileList_ = Object.values(fileList).slice().map(item => {
                return item.file
            })
    
            mergePdf(fileList_).catch(e => {
                console.error({
                    source: 'pdf-merger-js/browser',
                    error: e
                });
            });
        }
    }, [fileList])

    return (
        <div className="prepare-document-box">
            <FloatModal />
            <div className="canvas-panal">
                <div className="doc-box">
                    <Document
                        file={ pdfMetaData }
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        { RenderPage }
                    </Document>
                </div>
            </div>
            <div className="action-panal">
                <Button
                    onClick={ save }
                >保存</Button>
                <div className="title">选择签名者</div>
                <Select style={ { width: 240 } }
                    onChange={ handleActiverChange }
                >
                    {
                        Object.values(signers).map(item => (
                            <Option
                                value={ item }
                                key={ item }
                            >{ handleSubString(item) }</Option>
                        ))
                    }
                </Select>
                <div className="divide" />
                <div className="title">选择签名类型</div>
                <Select style={ { width: 240 } }
                    onSelect={ handleSelectTypeChange }
                >
                    {
                        signType.map(item => (
                            <Option value={ item.name }
                                key={ item.name }
                            >
                                { item.icon }
                                <span className='option-type-name'>
                                    { item.name }
                                </span>
                            </Option>
                        ))
                    }
                </Select>

                <footer>
                    <Link to="/recipients">
                        <Button>返回上一步</Button>
                    </Link>
                    <Link to="/review">
                        <Button>下一步</Button>
                    </Link>
                </footer>
            </div>
        </div>
    )
}

export default SignPage;
