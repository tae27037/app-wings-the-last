import { useEffect } from 'react';
import Icon from './Icon';
import { useI18n } from '../i18n';
import s from './Sheet.module.css';

// Bottom sheet dialog.
export default function Sheet({ open, onClose, title, children }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.head}>
          <h2 className={s.title}>{title}</h2>
          <button type="button" className={s.close} onClick={onClose} aria-label={t('common.close')}>
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
