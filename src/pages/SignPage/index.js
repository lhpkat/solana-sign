import React, { useState, useRef, useMemo, useEffect } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Modal from "./Modal";
import {
    BorderOutlined,
    Loading3QuartersOutlined,
    CalendarOutlined,
    WalletOutlined,
    FontSizeOutlined,
    CheckSquareTwoTone
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
import { fetchToSign } from "../../api";
import './index.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

const SignPage = () => {
    const canvasBoxWrap = useRef({});
    const [numPages, setNumPages] = useState(0);
    const [data, setData] = useState({});
    const currentUser = useAtomValue(currentUserAtom);
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [openType, setOpenType] = useState(0);
    const [activeGroup, setActiveGroup] = useState();
    const [needSignGroup, setNeedSignGroup] = useState([]);
    const [openTip, setOpenTip] = useState(false);

    const handleClickOpen = (type) => {
        setOpen(true);
        setOpenType(type);
    };

    const handleClose = () => {
        setOpen(false);
        setOpenType(0);
    };

    useEffect(() => {
        setData({
            ...location.state?.info,
            signers: location.state?.info?.signers.map((item, index) => ({
                ...item,
                id: index
            }))
        });
    }, [location])

    const signType = [
        {
            id: 0,
            name: "Don't specify",
            zhName: "签名",
            icon: <Loading3QuartersOutlined />,
        },
        {
            id: 1,
            name: "Data",
            zhName: "日期",
            icon: <CalendarOutlined />,
        },
        {
            id: 2,
            name: "CheckBox",
            zhName: "多选框",
            icon: <BorderOutlined />,
        },
        {
            id: 3,
            name: "Wallet Address",
            zhName: "钱包地址",
            icon: <WalletOutlined />,
        },
        {
            id: 4,
            name: "Text",
            zhName: "文本",
            icon: <FontSizeOutlined />,
        }
    ]

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
                status: info.status,
                id: info?.id,
            });
        }
    }

    const handleAddSignToCanvas = (fabricCanvas, info, expends) => {
        const rect = new fabric.Rect({
            width: Math.ceil(info.width),
            height: Math.ceil(info.height),
            fill: '#e8e8e8',
            // fill: '#fff',
            opacity: 0.5,
            rx: 10,
            ry: 10,
            originX: 'center',
            originY: 'center',
        });
        let mainInfo;

        if (!!expends) {
            switch (expends.type) {
                case "text":
                    mainInfo = new fabric.Text(handleSubString(expends.data, 20), {
                        fontSize: 16,
                        fontWeight: 400,
                        fontFamily: 'BlinkMacSystemFont',
                        originX: 'center',
                        originY: 'center',
                    });
                    break;

                case "img":
                    fabric.Image.fromURL(expends.data, (img) => {
                        mainInfo = img.set({
                            originX: 'center',
                            originY: 'center',
                        }).scale(0.4);
                    });
                    break;

                case "checkBox":
                    mainInfo = new fabric.Image(expends.data, {
                        originX: 'center',
                        originY: 'center',
                        opacity: 0.8,
                    });
                    break;

                default:
                    break;
            }
        } else {
            mainInfo = new fabric.Text(
                signType[signType.findIndex(item => (item.id === info.signType || item.name === info.signType))].zhName,
                {
                    fontSize: 20,
                    fontWeight: 400,
                    fontFamily: 'BlinkMacSystemFont',
                    originX: 'center',
                    originY: 'center',
                }
            );
        }
        const desc = new fabric.Text(`签名：${ handleSubString(info.address) }`, {
            fontSize: 8,
            color: '#e8e8e8',
            left: 95,
            top: 65,
            originX: 'right',
            originY: 'bottom',
            // originX: 'center',
            // originY: 'center',
        });

        setTimeout(() => {
            const group = new fabric.Group([rect, mainInfo, desc], {
                // width: Math.ceil(info.width),
                // height: Math.ceil(info.height),
                left: info.x,
                top: info.y,
                hasControls: false,
                // subTargetCheck: true,
                lockMovementX: true,
                lockMovementY: true,
                hasBorders: false
            });
    
            group.on('mousedown', function (options) {
                if (!!info.status || info.address !== currentUser) return;
    
                handleClickOpen(info.signType);
                setActiveGroup({
                    canvas: fabricCanvas,
                    group,
                    id: info.id,
                });
            });
    
            fabricCanvas.add(group);

            if (info.address === currentUser) {
                if (!expends) {
                    setNeedSignGroup((prev) => ([...prev, info]));
                } else {
                    setNeedSignGroup((prev) => {
                        return (
                            prev.slice().map(item => {
                                if (item.id === info.id) {
                                    return ({
                                        ...item,
                                        raw: group.toDataURL({
                                            format: "jpeg",
                                            quality: 1
                                        })
                                    })
                                } else {
                                    return item;
                                }
                            })
                        )
                    });
                }
            }
        }, 100)

    }

    const handleSign = (type, info) => {
        activeGroup.canvas.remove(activeGroup.group);

        const preSignData = data.signers.filter(item => item.id === activeGroup.id)[0];

        switch (type) {
            case 0:
                handleAddSignToCanvas(activeGroup.canvas, {
                    ...preSignData,
                    signType: preSignData.sign_type,
                }, {
                    type: "img",
                    data: info
                });
                break;

            case 2:
                handleAddSignToCanvas(activeGroup.canvas, {
                    ...preSignData,
                    signType: preSignData.sign_type,
                }, {
                    type: "checkBox",
                    data: info
                });
                break;

            case 1:
            case 3:
            case 4:
            default:
                handleAddSignToCanvas(activeGroup.canvas, {
                    ...preSignData,
                    signType: preSignData.sign_type,
                }, {
                    type: "text",
                    data: info
                });
                break;
        }
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

    const handleCompleteSign = () => {
        const filterData = needSignGroup.filter(item => !!item.raw);

        if (!filterData.length) {
            setOpenTip(true);
        } else {
            filterData.forEach(item => {
                fetchToSign({
                    ...item,
                    sign_raw: item.raw,
                    id: data.id,
                    address: currentUser
                })
            })
        }
    }

    const handleSubString = (value, need) => {
        return (
            value.length > (need || 12)
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
                handleSign={ handleSign }
                open={ open }
                handleClose={ handleClose }
                type={ openType }
            />
            <Snackbar
                open={ openTip }
                autoHideDuration={ 6000 }
                onClose={ () => { setOpenTip(false); } }
                message="请完成签名"
                severity="info"
                anchorOrigin={ {
                    vertical: "top",
                    horizontal: "right"
                } }
            >
                <MuiAlert elevation={ 6 } variant="filled" severity="info" sx={ { width: '100%' } } >
                    请完成签名！
                </MuiAlert>
            </Snackbar>
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
                    {
                        !!data.status
                            ? <Button variant="contained" onClick={ save }>下载</Button>
                            : <Button variant="contained" onClick={ handleCompleteSign }>完成</Button>
                    }
                </footer>
            </div>
        </div>
    )
}

export default SignPage;
