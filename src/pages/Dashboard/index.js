import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Link } from "react-router-dom";
import { fetchCreateFile, fetchSignFile } from "../../api";
import { useUserInfo } from '../../lib';


const Dashboard = () => {
    const [createFile, setCreateFile] = useState([]);
    const [signFile, setSignFile] = useState([]);
    const data = useUserInfo();

    const fetchCreateFile_ = async () => {
        const res = await fetchCreateFile({ address: data?.userInfo?.publicKey });

        if (!res?.code) {
            setCreateFile(res.data)
        }
    }

    const fetchSignFile_ = async () => {
        const res = await fetchSignFile({ address: data?.userInfo?.publicKey });

        if (!res?.code) {
            setSignFile(res.data)
        }
    }

    useEffect(() => {
        fetchCreateFile_();
        fetchSignFile_();
    }, [])

    return (
        <div>
            <div className="title">我创建的合同</div>
            <div className="file-box">
                {
                    createFile.map((item, index) => {
                        <div className="file-item">
                            { item?.name || index }
                            <Link to='/signPage' state={ {
                                url: item.url,
                                sign_info: item.sign_info
                            } }>
                                <Button>查看</Button>
                            </Link>
                        </div>
                    })
                }
            </div>
            <div className="title">我需签名的合同</div>
                {
                    signFile.map((item, index) => {
                        <div className="file-item">
                            { item?.name || index }
                            <Link to='/signPage' state={ {
                                url: item.url,
                                sign_info: item.sign_info
                            } }>
                                <Button>查看</Button>
                            </Link>
                        </div>
                    })
                }
        </div>
    )
}


export default Dashboard;
