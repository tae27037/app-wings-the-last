import Icon from './Icon';
import s from './Button.module.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  icon,
  children,
  className = '',
  ...rest
}) {
  const cls = [s.btn, s[variant], s[size], full ? s.full : '', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}
