import React, { useState, useEffect, useRef } from 'react';
import { Svg } from "../../../assets/svg";

const Button = ({
        icon,
        text,
        onClick,
        type = 'button',
        isLoading = false,
        disabled = false,
        className = '',
        size = 'medium',
        variant = 'primary'
    }) => {
    
    const textRef = useRef(null);
    const [textWidth, setTextWidth] = useState("auto");                
    const [loadingText, setLoadingText] = useState("Завантаження...");
    const [isFocused, setIsFocused] = useState(false);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleClick = (e) => {        
      if (!disabled && !isLoading && onClick) {
        onClick(e);
      }
    };
  
    
    const buttonClasses = [
        'button',
        className,
        isLoading && 'button--loading',
        `button--${size}`,
        `button--${variant}`,
        (disabled || isLoading) && 'button--disabled',
        isFocused && 'button--focused',
    ].filter(Boolean).join(' ');
    
    useEffect(() => {
        if (textRef.current && !isLoading) {
            setTextWidth(`${textRef.current.offsetWidth}px`); // Запоминаем ширину текста
        }
        setLoadingText("Завантаження...".slice(0, text.length));
    }, [text, isLoading]); // Отслеживаем изменение текста и загрузки

    return (
      <button
        type={type}
        className={buttonClasses}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled || isLoading}
        
      >
        {isLoading ? (
            <>
                <Svg name={"Sync"} className="button__svg" />
                <div style={{ maxWidth: textWidth }} ref={textRef} className="button__text--loading">{loadingText}...</div>
            </>
        ) : (
            <>
                <Svg name={icon} className="button__svg" />
                <div style={{ maxWidth: textWidth }} ref={textRef}  className="button__text">{text}</div>
            </>
        )}
      </button>
    );
  }
  
  export default Button;