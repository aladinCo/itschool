import React from 'react';
import style from "./btn.module.scss"


const _shape = Object.freeze({
  SQUARE:     'square', 
  CIRCLE:     'circle',
  RECTANGLE:  'rectangle'
})


const _color = Object.freeze({
  DEFAULT:    'default',
  PRIMARY:    'primary',
  SECONDRAY:  'secondary',
  SUCCESS:    'success',
  WARNING:    'warning',
  DANGER:     'danger',
  INFO:       'info',
  LIGHT:      'light',
  DARK:       'dark'
});

const _size = Object.freeze({
  SMALL:    'small',
  MEDIUM:   'medium',
  LARGE:    'large '
});

const Button = ({ onClick, label, color, shape, size, active, disabled }) => {
  // Визначення класів для кольору та форми
  const buttonColorClass = color ? `${_color[color]}` : _color.DEFAULT;
  const buttonShapeClass = shape ? `${_shape[shape]}` : _shape.CIRCLE;
  const buttonSizeClass = size ? `${_size[size]}` : _size.MEDIUM;
  const buttonActiveClass = active ? "--active" : "";
  return (
    <button
      onClick={onClick}
      className={`${style[buttonColorClass + buttonActiveClass]} ${style[buttonShapeClass]} ${style[buttonSizeClass]} }`}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

Button.defaultProps = {
  onClick: () => {},
  label: 'Кнопка',
  color: _color.DEFAULT,  // За замовчуванням колір синій
  shape: _shape.CIRCLE,  // За замовчуванням форма кругла
  size: _size.MEDIUM,
  active: false,
  style: {},
  disabled: false,
  to: null,  // Якщо не передано prop 'to', рендеримо кнопку
};

export default Button;