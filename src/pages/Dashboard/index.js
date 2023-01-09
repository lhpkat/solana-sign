import React, { useEffect, useState } from 'react';
// import { Button } from 'antd';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
// import Swiper from "swiper";
import SwiperCore, { Navigation, Pagination, Scrollbar, Autoplay } from 'swiper';
// import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Link } from "react-router-dom";
import { useAtom, useAtomValue } from 'jotai';
import { createFileListAtom, signFileListAtom, currentUserAtom } from '../../store';
import { fetchCreateFile, fetchSignFile } from "../../api";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import "./index.css";

// SwiperCore.use([Navigation, Pagination])

const Dashboard = () => {
    const [createFileList, setCreateFileList] = useAtom(createFileListAtom);
    const [signFileList, setSignFileList] = useAtom(signFileListAtom);
    const currentUser = useAtomValue(currentUserAtom);

    const fetchCreateFile_ = async () => {
        const res = await fetchCreateFile({ address: currentUser });

        if (!res?.code) {
            setCreateFileList(res.data)
        }
    }

    const fetchSignFile_ = async () => {
        const res = await fetchSignFile({ address: currentUser });

        if (!res?.code) {
            setSignFileList(res.data)
        }
    }

    useEffect(() => {
        if (!!currentUser) {
            fetchCreateFile_();
            fetchSignFile_();
        } else {
            setSignFileList([]);
            setCreateFileList([]);
        }
    }, [currentUser])

    return (
        <div>
            {
                !createFileList?.length &&
                !signFileList?.length &&
                <Typography
                    sx={ {
                        fontSize: 30,
                        textAlign: "center",
                        fontWeight: 600,
                        marginTop: "30%",
                    } }
                    color="text.secondary"
                >Welcome to SolanaSign.
                </Typography>
            }
            {
                createFileList?.length > 0 &&
                <>
                    <div className="title">我创建的合同</div>
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        spaceBetween={ 20 }
                        slidesPerView={ 4 }
                        slidesPerGroup={ 4 }
                        navigation
                        scrollbar={ {
                            draggable: true,
                            horizontalClass: "swiper-scrollbar-horizontal-expends"
                        } }
                        className="swiper-box"
                    >
                        {
                            createFileList.map((item, index) => (
                                <SwiperSlide>
                                    <Card
                                        sx={ { minWidth: 200 } }
                                        // className="file-item"
                                        key={ item.id }
                                    >
                                        <CardContent className='card-content'>
                                            <Typography
                                                sx={ { fontSize: 14, textAlign: "right" } }
                                                color="text.secondary"
                                            >PDF
                                            </Typography>
                                            <Typography variant="h4" component="div">
                                                { item?.name || index }
                                            </Typography>
                                            <Typography sx={{ mb: 1, fontSize: 14 }} color="text.secondary">
                                                { !!item?.status ? "已完成" : "未完成" }
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-end" }}>
                                            <Link
                                                to={ `/signPage/${item.id}` }
                                                state={ { info: item } }
                                            >
                                                <Button variant="text" className="view-btn">
                                                    查看
                                                </Button>
                                            </Link>
                                        </CardActions>
                                    </Card>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </>
            }
            {
                signFileList?.length > 0 &&
                <>
                    <div className="title">我需签名的合同</div>
                    <Swiper
                        modules={[Navigation, Scrollbar]}
                        spaceBetween={ 20 }
                        slidesPerView={ 4 }
                        slidesPerGroup={ 4 }
                        navigation
                        scrollbar={ {
                            draggable: true,
                            horizontalClass: "swiper-scrollbar-horizontal-expends"
                        } }
                        className="swiper-box"
                    >
                        {
                            signFileList.map((item, index) => (
                                <SwiperSlide>
                                    <Card
                                        sx={ { minWidth: 200 } }
                                        // className="file-item"
                                        key={ item.id }
                                    >
                                        <CardContent className='card-content'>
                                            <Typography sx={{ fontSize: 14, textAlign: "right" }} color="text.secondary" >
                                                PDF
                                            </Typography>
                                            <Typography variant="h4" component="div">
                                                { item?.name || index }
                                            </Typography>
                                            <Typography sx={{ mb: 1, fontSize: 14 }} color="text.secondary">
                                                {
                                                    !!item?.status
                                                        ? "已完成"
                                                        : !!item?.sign_status
                                                            ? "等待其他人"
                                                            : "等待签名"
                                                }
                                            </Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-end" }}>
                                            <Link
                                                to={ `/signPage/${item.id}` }
                                                state={ { info: item } }
                                            >
                                                <Button variant="text" className="view-btn">
                                                    查看
                                                </Button>
                                            </Link>
                                        </CardActions>
                                    </Card>
                                </SwiperSlide>
                            ))
                        }
                    </Swiper>
                </>
            }
        </div>
    )
}


export default Dashboard;
