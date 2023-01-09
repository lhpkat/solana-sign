import React, { useState, useRef, useMemo, useEffect, forwardRef } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { zhCN } from '@mui/x-date-pickers/locales';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
// import { Checkbox } from 'antd';
import SignatureDom from './SignatureDom';
import {
    BorderOutlined,
    Loading3QuartersOutlined,
    CalendarOutlined,
    WalletOutlined,
    FontSizeOutlined,
} from '@ant-design/icons';
import { getCanvasByDom } from '../../../lib';
import { useAtomValue } from 'jotai';
import { currentUserAtom, signersAtom } from '../../../store';
import './index.css';

dayjs.locale('zh-cn');


const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

const a11yProps = (index) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Modal = ({ open, handleClose, type, handleSign }) => {
    const currentUser = useAtomValue(currentUserAtom);
    const [value, setValue] = useState(0);
    // const [time, setTime] = useState(dayjs().format("YYYY/MM/DD HH:mm A"));
    const [time, setTime] = useState(dayjs());
    const [checked, setChecked] = useState(false);
    const [textValue, setTextValue] = useState('');
    const signatureDomRef = useRef(null);
    const checkBoxRef = useRef(null);


    const handleTimeChange = (value) => {
        // setTime(dayjs(value).format("YYYY/MM/DD HH:mm A"));
        setTime(dayjs(value));
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const signType = [
        {
            id: 0,
            name: "Don't specify",
            zhName: "不指定",
            icon: <Loading3QuartersOutlined />,
            label: (
                <SignatureDom ref={ signatureDomRef } />
            )
        },
        {
            id: 1,
            name: "Data",
            zhName: "日期",
            icon: <CalendarOutlined />,
            label: (
                <LocalizationProvider
                    // adapterLocale="zh-cn"
                    dateAdapter={ AdapterDayjs }
                >
                    <DateTimePicker
                        label="签名时间"
                        value={ time }
                        onChange={ handleTimeChange }
                        inputFormat="YYYY/MM/DD HH:mm A"
                        renderInput={ (params) => {
                            return (
                                <TextField {...params} />
                            )
                        } }
                    />
                </LocalizationProvider>
            )
        },
        {
            id: 2,
            name: "CheckBox",
            zhName: "多选框",
            icon: <BorderOutlined />,
            label: (
                <Checkbox
                    ref={ checkBoxRef }
                    checked={ checked }
                    onChange={ (e) => {
                        setChecked(e.target.checked)
                    } }
                />
            )
        },
        {
            id: 3,
            name: "Wallet Address",
            zhName: "钱包地址",
            icon: <WalletOutlined />,
            label: currentUser,
        },
        {
            id: 4,
            name: "Text",
            zhName: "文本",
            icon: <FontSizeOutlined />,
            label: (
                <TextField
                    id="outlined-basic"
                    label="签名文本"
                    variant="outlined"
                    value={ textValue }
                    onChange={ (e) => {
                        setTextValue(e.target.value)
                    } }
                />
            )
        }
    ];

    const handleSubString = (value, ) => {
        return (
            value.length > 12
            ? value.substring(0, 8) + '...' + value.substring(value.length - 6)
            : value
        )
    }

    const SignDom = () => {
        return (
            <div className='sign-dom'>
                { handleSubString(currentUser) }
            </div>
        )
    }

    const handleSignature = async () => {
        switch (value) {
            case 0:
                handleSign(value, signatureDomRef.current.signature());
                break;

            case 1:
                handleSign(value, dayjs(time).format("YYYY/MM/DD HH:mm A"));
                break;

            case 2:
                const checkDom = await getCanvasByDom(checkBoxRef.current);

                handleSign(value, checkDom);
                break;

            case 3:
                handleSign(value, currentUser);
                break;

            case 4:
                handleSign(value, textValue);
                break;

            default:
                break;
        }
        handleClose();
    }

    useEffect(() => {
        const findIndex = signType.findIndex(item => (item.name === type || item.id == type));

        setValue(findIndex);
    }, [type])

    return (
        <div className="modal-box">
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={ handleClose }
                aria-describedby="alert-dialog-slide-description"
            >
                {/* <DialogTitle></DialogTitle> */ }

                <DialogContent>
                    <Box sx={{ width: '100%', minHeight: "200px" }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={ value }
                                onChange={ handleChange }
                                aria-label="basic tabs example"
                            >
                                {
                                    signType.map(((item, index) => {
                                        if (index === 0) {
                                            return (
                                                <Tab
                                                    key={ item.id }
                                                    label="签名"
                                                    disabled={ !(type == item.id || type === item.name) }
                                                    { ...a11yProps(item.id) }
                                                />
                                            );
                                        }

                                        return (
                                            <Tab
                                                key={ item.id }
                                                label={ item.zhName }
                                                disabled={
                                                    !(type == item.id ||
                                                    type === item.name ||
                                                    type == signType[0].id ||
                                                    type === signType[0].name)
                                                }
                                                { ...a11yProps(item.id) }
                                            />
                                        )
                                    }))
                                }
                            </Tabs>
                        </Box>
                        {
                            signType.map(item => (
                                <TabPanel
                                    key={ item.id }
                                    value={ value }
                                    index={ item.id }
                                    className="tab-panel-box"
                                >
                                    { item.label }
                                </TabPanel>
                            ))
                        }
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={ handleClose }>取消</Button>
                    <Button variant="contained" onClick={ handleSignature }>签名</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Modal;
