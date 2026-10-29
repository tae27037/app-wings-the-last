import { useEffect, useRef, useState } from 'react';
import Wig from '../components/Wig';
import Icon from '../components/Icon';
import Button from '../components/Button';
import Sheet from '../components/Sheet';
import ScreenHead from '../components/ScreenHead';
import { COLORS, STYLES, getStyle } from '../data/wigs';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './TryOn.module.css';

export default function TryOn({ param }) {
  const { t } = useI18n();
  const { addPoints, toast } = useApp();

  const [styleId, setStyleId] = useState(getStyle(param) ? param : STYLES[0].id);
  const [color, setColor] = useState(null); // null = the style's original colour
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [photo, setPhoto] = useState(null);

  const boxRef = useRef(null);
  const videoRef = useRef(null);
  const wigRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    if (getStyle(param)) {
      setStyleId(param);
      setColor(null);
    }
  }, [param]);

  const style = getStyle(styleId);
  const hair = color || style.color;

  // Attach the stream to the <video>, and always stop the camera on cleanup.
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((tr) => tr.stop());
  }, [stream]);

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('unsupported');
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      setError(null);
      setStream(media);
    } catch {
      setError('denied');
    }
  };

  const stopCamera = () => setStream(null);

  // Dragging the wig with a finger or mouse.
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (d) setPos({ x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy });
  };
  const onUp = () => {
    drag.current = null;
  };

  const capture = async () => {
    const box = boxRef.current.getBoundingClientRect();
    const k = 2; // export at 2x
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(box.width * k);
    canvas.height = Math.round(box.height * k);
    const ctx = canvas.getContext('2d');
    ctx.scale(k, k);

    const video = videoRef.current;
    if (stream && video && video.videoWidth) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const sc = Math.max(box.width / vw, box.height / vh); // object-fit: cover
      const dw = vw * sc;
      const dh = vh * sc;
      ctx.save();
      ctx.translate(box.width, 0);
      ctx.scale(-1, 1); // mirrored selfie view
      ctx.drawImage(video, (box.width - dw) / 2, (box.height - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, box.height);
      g.addColorStop(0, '#d9cfdc');
      g.addColorStop(1, '#b9a9c0');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, box.width, box.height);
      ctx.fillStyle = '#e4d3c4';
      ctx.beginPath();
      ctx.ellipse(box.width / 2, box.height * 0.42, box.width * 0.215, box.height * 0.21, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(box.width / 2, box.height * 1.02, box.width * 0.42, box.height * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the wig overlay exactly where it is on screen.
    const svg = wigRef.current;
    const r = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true);
    clone.setAttribute('width', r.width);
    clone.setAttribute('height', r.height);
    clone.removeAttribute('style');
    clone.removeAttribute('class');
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
    await img.decode();
    ctx.drawImage(img, r.left - box.left, r.top - box.top, r.width, r.height);

    setPhoto(canvas.toDataURL('image/jpeg', 0.9));
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = photo;
    a.download = `maison-wigs-${style.name.toLowerCase()}.jpg`;
    a.click();
  };

  const share = async () => {
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], `maison-wigs-${style.name.toLowerCase()}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: t('tryon.shareText') });
        addPoints(10, 'share');
      } else {
        download();
        toast(t('tryon.shareFail'));
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        download();
        toast(t('tryon.shareFail'));
      }
    }
  };

  return (
    <div className={s.page}>
      <ScreenHead title={t('tryon.title')} subtitle={t('tryon.hint')} />

      <div ref={boxRef} className={s.stage}>
        <video
          ref={videoRef}
          className={`${s.video} ${stream ? s.live : ''}`}
          autoPlay
          playsInline
          muted
        />
        {!stream && (
          <div className={s.demo} aria-hidden="true">
            <span className={s.head} />
            <span className={s.shoulders} />
          </div>
        )}
        <div className={s.guide} aria-hidden="true" />

        <div
          className={s.wigWrap}
          style={{
            height: `${105 * scale}%`,
            transform: `translate(-50%, -51.5%) translate(${pos.x}px, ${pos.y}px)`,
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <Wig
            ref={wigRef}
            kind={style.kind}
            color={hair}
            variant="overlay"
            className={s.wig}
            label={style.name}
          />
        </div>

        <div className={s.stageBar}>
          {stream ? (
            <Button variant="soft" size="sm" icon="cameraOff" onClick={stopCamera}>
              {t('tryon.stopCamera')}
            </Button>
          ) : (
            <Button size="sm" icon="camera" onClick={startCamera}>
              {t('tryon.startCamera')}
            </Button>
          )}
        </div>
      </div>

      {!stream && !error && <p className={s.note}>{t('tryon.demo')}</p>}
      {error && (
        <p className={s.error} role="alert">
          {t(`tryon.${error}`)}
        </p>
      )}

      <section className={s.controls}>
        <h2 className={s.label}>{t('tryon.style')}</h2>
        <div className={s.styles} role="listbox" aria-label={t('tryon.style')}>
          {STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              role="option"
              aria-selected={st.id === styleId}
              className={`${s.styleBtn} ${st.id === styleId ? s.on : ''}`}
              onClick={() => {
                setStyleId(st.id);
                setColor(null);
              }}
            >
              <Wig kind={st.kind} color={st.color} height={74} />
              <span>{st.name}</span>
            </button>
          ))}
        </div>

        <h2 className={s.label}>{t('tryon.color')}</h2>
        <div className={s.swatches}>
          <button
            type="button"
            className={`${s.swatch} ${s.orig} ${color === null ? s.on : ''}`}
            style={{ '--c': style.color }}
            aria-label={t('colors.original')}
            aria-pressed={color === null}
            onClick={() => setColor(null)}
          >
            <Icon name="check" size={18} />
          </button>
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${s.swatch} ${color === c.hex ? s.on : ''}`}
              style={{ '--c': c.hex }}
              aria-label={t(`colors.${c.id}`)}
              aria-pressed={color === c.hex}
              onClick={() => setColor(c.hex)}
            />
          ))}
        </div>

        <label className={s.label} htmlFor="size">
          {t('tryon.size')}
        </label>
        <input
          id="size"
          className={s.range}
          type="range"
          min="0.7"
          max="1.4"
          step="0.01"
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />

        <Button full icon="camera" onClick={capture}>
          {t('tryon.photo')}
        </Button>
      </section>

      <Sheet open={!!photo} onClose={() => setPhoto(null)} title={t('tryon.photoReady')}>
        {photo && <img className={s.photo} src={photo} alt={t('tryon.photoReady')} />}
        <div className={s.sheetActions}>
          <Button full icon="share" onClick={share}>
            {t('common.share')}
          </Button>
          <Button full variant="soft" icon="download" onClick={download}>
            {t('common.download')}
          </Button>
          <Button full variant="ghost" onClick={() => setPhoto(null)}>
            {t('tryon.retake')}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
