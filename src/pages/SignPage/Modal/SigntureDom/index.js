import React, { useState, useRef, useMemo, useEffect, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import cx from "classnames";
import './index.css';


const SignatureDom = () => {
    const SignatureCanvasRef = useRef(null);
    const [penColor, setPenColor] = useState('red');
    const [fontSize, setFontSize] = useState(16);

    const penColorList = [
        "#1976d2",
        "black",
        "red",
        "green",
        "yellow"
    ]

    return (
        <div>
            <div className="color-list-box">
                {
                    penColorList.map(item => (
                        <div className={
                            cx("color-item", {
                                "active-color": item === penColor
                            }) }
                            style={ {
                                backgroundColor: item
                            } }
                            onClick={ () => {
                                setPenColor(item)
                            } }
                        ></div>
                    ))
                }
            </div>
            <div className="font-size-box">
                <Slider
                    aria-label="Temperature"
                    getAriaValueText={ (value) => `${value}px` }
                    getAriaLabel={ (value) => `${value}px` }
                    valueLabelDisplay="auto"
                    step={ 1 }
                    marks
                    min={ 12 }
                    max={ 24 }
                    value={ fontSize }
                    onChange={ (e) => {
                        setFontSize(e.target.value);
                    } }
                />
            </div>
            <div className="action-box">
                <div className="action-panel">
                    <Button variant="contained"
                        onClick={ () => {
                            SignatureCanvasRef.current.clear()
                        } }
                    >
                        <ClearRoundedIcon />
                    </Button>
                </div>
                <SignatureCanvas
                    maxWidth={ fontSize / 5 }
                    minWidth={ 0.1 }
                    penColor={ penColor }
                    // dotSize={ fontSize }
                    // dotSize="0.1"
                    ref={ (ref) => { SignatureCanvasRef.current = ref } } 
                    canvasProps={ {
                        width: 400,
                        height: 200,
                        className: 'sigature-dom-canvas-box',
                    } }
                />
            </div>
        </div>
    )
}

export default SignatureDom;
