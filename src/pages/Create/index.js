import React, { useState } from "react";
import { DeleteOutlined } from '@ant-design/icons';
// import { Button } from 'antd';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { pdfjs } from "react-pdf";
import { useAtom } from 'jotai';
import { fileListAtom } from '../../store';
import './index.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;


const Create = () => {
    const [fileList, setFileList] = useAtom(fileListAtom);
    const [iframeSrc, setIframeSrc] = useState('');

    const handleDragFile = (e) => {
        e.preventDefault();
        // e.dataTransfer.dropEffect = 'copy';
        const files = e?.dataTransfer?.files || e?.target?.files;

        const filesObj = {};

        const promiseBox = []

        Object.values(files)
            .filter(item => item.type.indexOf('pdf') !== -1)
            .forEach((item) => {
                const loadingTask = pdfjs.getDocument(window.URL.createObjectURL(item));

                promiseBox.push(loadingTask.promise);

                loadingTask.promise.then(pdf => {
                    filesObj[item?.name] = {
                        file: item,
                        numPages: pdf.numPages
                    }
                });
            })

        Promise.all(promiseBox).then(() => {
            setFileList({
                ...fileList,
                ...filesObj,
            });
        })
    }

    const allowDrop = (e) => {
        e.preventDefault();
    }

    const handlePreViewPdf = (name) => {
        setIframeSrc(window.URL.createObjectURL(fileList[name].file) + '#toolbar=0');
    }

    const deleteFile = (e, name) => {
        e.stopPropagation();
        const fileList_ = { ...fileList };

        delete fileList_[name];
        setFileList(fileList_);
        setIframeSrc('');
    }

    return (
        <div className="create-container">
            <div className="title">上传合同</div>
            <div
                className="dragger-box"
                onDrop={ handleDragFile }
                onDragOver={ allowDrop }
            >
                将文件拖放到此处
                <div className="divide" />
                <label
                    className="upload-button"
                    htmlFor="upload-input"
                >
                    上传文件
                    <input
                        type="file"
                        id="upload-input"
                        accept="application/pdf, .pdf"
                        multiple
                        onChange={ handleDragFile }
                    />
                </label>
            </div>
            <div className="title">已上传合同</div>
            <div className="uploaded-box">
                <div className="items-box">
                    {
                        Object.values(fileList)?.length > 0 &&
                        Object.values(fileList).map(item => {
                            return (
                                <div className="uploaded-item"
                                    key={ item.file.name }
                                    onClick={ () => handlePreViewPdf(item.file.name) }
                                >
                                    <div className="box-left">
                                        <div className="name">{ item.file.name }</div>
                                        <div className="desc">
                                            <span>{ parseInt(item?.file?.size / 1024).toFixed(2) }KB</span>
                                            <span>{ item?.numPages || '' }页</span>
                                        </div>
                                    </div>
                                    <DeleteOutlined className="delete-icon" onClick={ (e) => deleteFile(e, item.file.name) } />
                                </div>
                            )
                        })
                    }
                </div>
                <div className="action-box">
                    {
                        iframeSrc &&
                        <iframe
                            src={ iframeSrc }
                            width='298'
                            height='400'
                        />
                    }
                    {
                        !iframeSrc &&
                        <div className="preview-tip">
                                点击文件以预览
                        </div>
                    }
                    <div>
                        <Link to="/">
                            <Button
                                variant="contained"
                            >返回</Button>
                        </Link>
                        <Button
                            variant="contained"
                            disabled={ !Object.keys(fileList).length }
                        >
                            <Link to="/recipients">
                                下一步
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Create;
