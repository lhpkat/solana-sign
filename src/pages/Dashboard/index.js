import React, { useEffect, useState } from 'react';
// import { Button } from 'antd';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { useAtom, useAtomValue } from 'jotai';
import { createFileListAtom, signFileListAtom, currentUserAtom } from '../../store';
import { fetchCreateFile, fetchSignFile } from "../../api";
import { useUserInfo } from '../../lib';
import "./index.css";


const Dashboard = () => {
    const [createFileList, setCreateFileList] = useAtom(createFileListAtom);
    const [signFileList, setSignFileList] = useAtom(signFileListAtom);
    const currentUser = useAtomValue(currentUserAtom);
    const data = useUserInfo();

    const fetchCreateFile_ = async () => {
        const res = await fetchCreateFile({ address: data?.userInfo?.publicKey });

        if (!res?.code) {
            setCreateFileList(res.data)
        }
    }

    const fetchSignFile_ = async () => {
        const res = await fetchSignFile({ address: data?.userInfo?.publicKey });

        if (!res?.code) {
            setSignFileList(res.data)
        }
    }

    useEffect(() => {
        if (!!currentUser) {
            fetchCreateFile_();
            fetchSignFile_();
        }
    }, [currentUser])

    return (
        <div>
            <div className="title">我创建的合同</div>
            <div className="file-box">
                {
                    createFileList.map((item, index) => (
                        <div className="file-item" key={ item.id || index }>
                            { item?.name || index }
                            <Link
                                to={ `/signPage/${item.id}` }
                                state={ { info: item } }
                            >
                                <Button variant="outlined" className="view-btn">
                                    查看
                                </Button>
                            </Link>
                        </div>
                    ))
                }
            </div>
            <div className="title">我需签名的合同</div>
            <div className="file-box">
                {
                    signFileList.map((item, index) => (
                        <div className="file-item"  key={ item.id || index }>
                            { item?.name || index }
                            <Link
                                to={ `/signPage/${ item.id }` }
                                state={ { info: item } }
                            >
                                <Button variant="outlined" className="view-btn">
                                    查看
                                </Button>
                            </Link>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}


export default Dashboard;
