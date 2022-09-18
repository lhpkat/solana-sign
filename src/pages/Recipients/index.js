import React, { useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { message, Input, Dropdown, Menu, Form } from 'antd';
import Button from '@mui/material/Button';
import { PlusCircleFilled, PlusOutlined, DeleteOutlined, DownOutlined } from '@ant-design/icons';
import { useAtomValue, useAtom } from 'jotai';
import {
    currentUserAtom,
    signersAtom,
    viewersAtom,
} from '../../store';
import './index.css';


const { Search } = Input;

const DropdownBox = ({
    title,
    value,
    onChangeCamp
}) => {

    const changeCamp = {
        签名人: "阅览人",
        阅览人: "签名人"
    }

    const enumType = {
        签名人: "signers",
        阅览人: "viewers"
    }

    const menu = (
        <Menu
            onClick={ ({ key }) => { onChangeCamp(key, value) } }
            items={[
                    {
                        key: enumType[changeCamp[title]],
                        label: (
                            <div>
                                { changeCamp[title] }
                            </div>
                        ),
                    },
            ]}
        />
    );

    return (
        <Dropdown overlay={menu}>
            <div className='select-orign'>
                { title }
                <DownOutlined />
            </div>
        </Dropdown>
    )
}

const SignersOrViewersBox = ({
    title,
    data,
    placehold,
    deleteCallback,
    onChangeCamp,
    type
}) => {

    const handleSubString = (value) => {
        return (
            value.length > 12
            ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
            : value
        )
    }

    return (
        <div className="signers-or-viewers-box">
            <div className="signers-or-viewers-title">{ title }</div>
            {
                !Object.values(data).length &&
                <div className="placehold">
                    { placehold }
                </div>
            }
            <div className="items-box">
                {
                    Object.values(data).length > 0 &&
                    Object.values(data).map(item => (
                        <div className="item-box" key={ item }>
                            <div className="item-box-right">
                                <div className="name">{ handleSubString(item) }</div>
                                <DropdownBox
                                    title={ title }
                                    value={ item }
                                    onChangeCamp={ onChangeCamp }
                                />
                            </div>
                            <DeleteOutlined className="delete-icon" onClick={ () => { deleteCallback(type, item) }  } />
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

const Recipients = () => {
    const [form] = Form.useForm();
    const currentUser = useAtomValue(currentUserAtom);
    const [signers, setSigners] = useAtom(signersAtom);
    const [viewers, setViewers] = useAtom(viewersAtom);

    const handleAddActioner = (value, type) => {
        if (value) {
            if (type === 'signers') {
                setSigners({
                    ...signers,
                    [value]: value
                });
            } else if (type === 'viewers') {
                setViewers({
                    ...viewers,
                    [value]: value
                });
            } else {
                setSigners({
                    ...signers,
                    [value]: value
                });
                form.resetFields();
            }
        }
    }

    const deleteCallback = (type, value) => {
        switch (type) {
            case "signers":
                const signers_ = { ...signers };

                delete signers_[value];
                setSigners(signers_);
                break;

            case "viewers":
                const viewers_ = { ...viewers };

                delete viewers_[value];
                setViewers(viewers_);
                break;

            default:
                break;
        }
    }

    const onChangeCamp = (key, value) => {
        const reverseKey = {
            viewers: "signers",
            signers: "viewers"
        }

        handleAddActioner(value, key);
        deleteCallback(reverseKey[key], value);
    }

    return (
        <div className="recipients-box">
            <div className="manage-recipients">
                <div className="title">管理收件人</div>
                <div className="add-myself"
                    onClick={() => handleAddActioner(currentUser)}
                >
                    <PlusOutlined />添加我自己
                </div>
                <Form form={form}>
                    <Form.Item name="addSigner">
                        <Search
                            allowClear
                            placeholder="输入钱包地址"
                            enterButton={ <PlusCircleFilled /> }
                            size="large"
                            onSearch={ handleAddActioner }
                        />
                    </Form.Item>
                </Form>
            </div>
            <div className="recipients">
                <div className="title">收件人</div>
                <div className="father-box">
                    <SignersOrViewersBox
                        type="signers"
                        title="签名人"
                        data={ signers }
                        placehold="暂无签名人"
                        onChangeCamp={ onChangeCamp }
                        deleteCallback={ deleteCallback }
                    />
                    <SignersOrViewersBox
                        type="viewers"
                        title="阅览人"
                        data={ viewers }
                        placehold="暂无阅览人"
                        onChangeCamp={ onChangeCamp }
                        deleteCallback={ deleteCallback }
                    />
                </div>
            </div>
            <footer>
                <Link to="/create">
                    <Button  variant="contained">返回</Button>
                </Link>
                <Link to="/prepare-document">
                    <Button  variant="contained">下一步</Button>
                </Link>
            </footer>
        </div>
    )
}

export default Recipients;
