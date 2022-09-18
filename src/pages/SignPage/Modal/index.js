import React, { useState, useRef, useMemo, useEffect, forwardRef } from 'react';
import dayjs from 'dayjs';
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
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import SignatureDom from './SigntureDom';
import {
    BorderOutlined,
    Loading3QuartersOutlined,
    CalendarOutlined,
    WalletOutlined,
    FontSizeOutlined,
} from '@ant-design/icons';
import { useAtomValue } from 'jotai';
import { currentUserAtom, signersAtom } from '../../../store';
import './index.css';

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

const Modal = ({ open, handleClose }) => {
    const currentUser = useAtomValue(currentUserAtom);
    const [value, setValue] = useState(0);
    const [time, setTime] = useState(dayjs().format("YYYY/MM/DD HH:mm"));
    const [checked, setChecked] = useState(false);
    const [textValue, setTextValue] = useState('')

    const handleTimeChange = (value) => {
        setTime(value);
    };

    const handleChange = (event, newValue) => {
        console.log({ newValue });
        setValue(newValue);
    };

    const signType = [
        {
            id: 0,
            name: "Don't specify",
            zhName: "不指定",
            icon: <Loading3QuartersOutlined />,
            label: (
                <SignatureDom />
            )
        },
        {
            id: 1,
            name: "Data",
            zhName: "日期",
            icon: <CalendarOutlined />,
            label: (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label="签名时间"
                        value={time}
                        onChange={handleTimeChange}
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

    const handleSubString = (value) => {
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

    return (
        <div className="modal-box">
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                // aria-describedby="alert-dialog-slide-description"
            >
                {/* <DialogTitle></DialogTitle> */}
                <DialogContent>
                    <Box sx={{ width: '100%', minHeight: "200px" }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                {
                                    signType.map(((item, index) => {
                                        if (index === 0) return (
                                            <Tab label="签名" { ...a11yProps(item.id) } />
                                        );

                                        return (
                                            <Tab label={ item.zhName } { ...a11yProps(item.id) } />
                                        )
                                    }))
                                }
                            </Tabs>
                        </Box>
                        {
                            signType.map(item => (
                                <TabPanel
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
                    <Button variant="contained" onClick={ handleClose }>签名</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Modal;
