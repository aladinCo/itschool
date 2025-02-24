import React, { useState, useRef } from 'react';

const Splitter = ({type,  onMove }) => {

    const minWidth = 100;
    const minHeight = 100;
    const splitterRef = useRef(null);
    const [position, setPosition] = useState(minWidth);
    const isDragging = useRef(false);

    const onMouseDown = (e) => {
        isDragging.current = true;
        splitterRef.current.setPointerCapture(e.pointerId);
        document.addEventListener('pointermove', onMouseMove);
        document.addEventListener('pointerup', onMouseUp);
    };

    function onMouseMove(e) {
        if (!isDragging.current) return;
        e.preventDefault();
        
        switch(type){
            case "horz":
                let newX = e.clientX;
                if (newX < minWidth) newX = minWidth; // Минимальная ширина левой панели
                if (newX > window.innerWidth - minWidth) newX = window.innerWidth - minWidth; // Максимальная ширина
                onMove({x:newX, w:window.innerWidth});
                setPosition(newX);
                break;
            case "vert":                
                let newY = e.clientY;
                if (newY < minHeight) newY = minHeight; // Минимальная ширина левой панели
                if (newY > window.innerHeight - minHeight) newY = window.innerHeight - minHeight; // Максимальная ширина
                onMove({x:newY, w:window.innerHeight});
                setPosition(newY);
                break;
            default:
                break;
        }
        
    };

    function onMouseUp() {
        isDragging.current = false;
        document.removeEventListener('pointermove', onMouseMove);
        document.removeEventListener('pointerup', onMouseUp);
    };


    return ( 
        <div className={`layout__splitter layout__splitter--${type}`} style={type === "horz" ? { left: `${position}px` } : { top: `${position}px` }}>
            <div className={`layout__splitter_handle layout__splitter_handle--${type}`} ref={splitterRef} onPointerDown={onMouseDown}></div>
        </div>
    );
};

export default Splitter;