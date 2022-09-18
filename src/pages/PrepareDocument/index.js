import React, { useState, useRef, useMemo, useEffect } from 'react';
import { message, Select } from 'antd';
import Button from '@mui/material/Button';
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
import { fileListAtom, signersAtom, signGroupInfoAtom, pdfFileAtom } from '../../store';
import {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
    useListenAndCreateSignView
} from '../../lib';
import './index.css';


const { Option } = Select;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const PrepareDocument = () => {
    const [numPages, setNumPages] = useState(0);
    const startListen = useRef(false);
    const signers = useAtomValue(signersAtom);
    const activeSigner = useRef('');
    const activeSelectType = useRef('');
    const activePageNumber = useRef(0);
    const fileList = useAtomValue(fileListAtom);
    const setSignGroupInfo = useSetAtom(signGroupInfoAtom);
    const [pdfMetaData, setPdfMetaData] = useState([]);
    const setPdfFile = useSetAtom(pdfFileAtom);
    const [info, setInfo] = useState([]);

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

    const handleCanvasItemActionRenderer = (id, info) => {
        const canvas = new fabric.Canvas(id, {
            width: info.pageWidth,
            height: info.pageHeight,
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

    const saveSignInfo = () => {
        setSignGroupInfo(info.slice().map(item => ({
            address: item.address,
            page: item.page,
            type: item.type,
            top: item.group.get("top"),
            left: item.group.get("left"),
            width: Math.floor(item.group.get("width") * item.group.get('scaleX').toFixed(2)),
            height: Math.floor(item.group.get("height") * item.group.get('scaleY').toFixed(2)),
        })))
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

        window.Buffer = Buffer;
        const merger = new PDFMerger();

        for (const file of data) {
            await merger.add(file)
        }

        const mergedPdf = await merger.saveAsBlob();

        setPdfFile({
            blob: mergedPdf,
            name: data[0].name.replace(".pdf", "")
        });

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
            for (let i = 0; i < +numPages; i += 1) {
                temp.push(
                    <Page
                        width={ 500 }
                        className="page"
                        key={ `${i}-${t}` }
                        pageNumber={ i + 1 }
                        onLoadSuccess={ ({ _pageIndex, width, height }) => {
                            handleCanvasItemActionRenderer(`canvas-action-${_pageIndex}`, {
                                pageWidth: width,
                                pageHeight: height
                            });
                        } }
                        renderAnnotationLayer={ false }
                        renderTextLayer={ false }
                        onClick={ () => {
                            activePageNumber.current = i;
                        } }
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

    useEffect(() => {
        return (() => {
            saveSignInfo();
        })
    }, [info])

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
                            <Option
                                value={ item.id }
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
                        <Button  variant="contained">返回上一步</Button>
                    </Link>
                    <Link to="/review">
                        <Button  variant="contained">下一步</Button>
                    </Link>
                </footer>
            </div>
        </div>
    )
}

export default PrepareDocument;
