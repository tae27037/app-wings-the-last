import s from './ScreenHead.module.css';

export default function ScreenHead({ title, subtitle, children }) {
  return (
    <div className={s.head}>
      <div>
        <h1 className={s.title}>{title}</h1>
        {subtitle && <p className={s.sub}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
