import Link from 'next/link';
import './style.scss';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  className?: string;
  href?: string;
  target?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'disabled';
  style?: React.CSSProperties;
  opacity?: number;
  shadow?: boolean;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  middleIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  label?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>;
  onChange?: React.ChangeEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

export function Button({
  type = 'button',
  id,
  className,
  href,
  target,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  style,
  opacity,
  shadow = false,
  children,
  startIcon,
  middleIcon,
  endIcon,
  label,
  disabled,
  ref,
  onChange,
  onClick,
}: Props) {
  const classes = [
    'button-root',
    `button-${variant}`,
    `button-size-${size}`,
    `button-color-${color}`,
    shadow && 'button-shadow',
    className?.trim(),
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {startIcon && (
        <i className="material-symbols-rounded button-icon start-icon" translate="no">
          {startIcon}
        </i>
      )}
      {middleIcon && (
        <i className="material-symbols-rounded button-icon middle-icon" translate="no">
          {startIcon}
        </i>
      )}
      {children}
      {endIcon && (
        <i className="material-symbols-rounded button-icon end-icon" translate="no">
          {endIcon}
        </i>
      )}
    </>
  );

  const customStyles = {
    ...style,
    ...(opacity !== undefined ? { '--btn-opacity': opacity } : {}),
  } as React.CSSProperties;

  if (target && href) {
    return (
      <a
        id={id}
        href={href}
        className={classes}
        target={target}
        rel={target ? 'noopener noreferrer' : undefined}
        style={customStyles}
        ref={ref as React.Ref<HTMLAnchorElement>}
        onChange={onChange}
        onClick={onClick}
        aria-label={label}
        aria-disabled={disabled}
      >
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link
        id={id}
        href={href}
        className={classes}
        style={customStyles}
        ref={ref as React.Ref<HTMLAnchorElement>}
        onChange={onChange}
        onClick={onClick}
        aria-label={label}
        aria-disabled={disabled}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      className={classes}
      style={customStyles}
      ref={ref as React.Ref<HTMLButtonElement>}
      onChange={onChange}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
