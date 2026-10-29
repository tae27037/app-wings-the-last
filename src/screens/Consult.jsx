import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import ScreenHead from '../components/ScreenHead';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './Consult.module.css';

const SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00'];

function resizeImage(file, max = 480) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Consult() {
  const { t, lang } = useI18n();
  const { state, patch, addPoints, toast } = useApp();
  const [tab, setTab] = useState('video');
  const [stylistId, setStylistId] = useState('eva');
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState(SLOTS[0]);

  const stylists = t('consult.stylists');
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'numeric' }),
    [lang],
  );
  const days = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return { iso: d.toISOString().slice(0, 10), date: d };
      }),
    [],
  );

  const book = () => {
    const first = !state.booking && !state.bookedBefore;
    patch({ booking: { stylistId, iso: days[dayIdx].iso, slot }, bookedBefore: true });
    if (first) addPoints(40, 'booking');
  };

  const booking = state.booking;
  const bookedStylist = booking && stylists.find((x) => x.id === booking.stylistId);
  const bookedDate = booking && new Date(`${booking.iso}T12:00:00`);

  return (
    <div>
      <ScreenHead title={t('consult.title')} subtitle={t('consult.intro')} />

      <div className={s.tabs} role="tablist">
        {[
          ['video', 'video', t('consult.tabVideo')],
          ['chat', 'chat', t('consult.tabChat')],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`${s.tab} ${tab === id ? s.on : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon name={icon} size={20} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'video' ? (
        <div className={s.panel}>
          {booking ? (
            <section className={s.booked}>
              <span className={s.bookedIcon}>
                <Icon name="check" size={26} />
              </span>
              <h2 className={s.bookedTitle}>{t('consult.booked')}</h2>
              <p className={s.bookedText}>
                {bookedStylist?.name} · {fmt.format(bookedDate)}, {booking.slot}
              </p>
              <div className={s.bookedActions}>
                <Button icon="video" onClick={() => toast(t('consult.callDemo'))}>
                  {t('consult.join')}
                </Button>
                <Button variant="ghost" onClick={() => patch({ booking: null })}>
                  {t('consult.cancel')}
                </Button>
              </div>
            </section>
          ) : (
            <>
              <h2 className={s.label}>{t('consult.choose')}</h2>
              <div className={s.stylists}>
                {stylists.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={stylistId === st.id}
                    className={`${s.stylist} ${stylistId === st.id ? s.on : ''}`}
                    onClick={() => setStylistId(st.id)}
                  >
                    <span className={s.avatar}>{st.name.slice(0, 1)}</span>
                    <span className={s.stText}>
                      <strong>{st.name}</strong>
                      <small>{st.role}</small>
                    </span>
                  </button>
                ))}
              </div>

              <h2 className={s.label}>{t('consult.day')}</h2>
              <div className={s.chips}>
                {days.map((d, i) => (
                  <button
                    key={d.iso}
                    type="button"
                    aria-pressed={dayIdx === i}
                    className={`${s.chip} ${dayIdx === i ? s.on : ''}`}
                    onClick={() => setDayIdx(i)}
                  >
                    {fmt.format(d.date)}
                  </button>
                ))}
              </div>

              <h2 className={s.label}>{t('consult.time')}</h2>
              <div className={s.chips}>
                {SLOTS.map((sl) => (
                  <button
                    key={sl}
                    type="button"
                    aria-pressed={slot === sl}
                    className={`${s.chip} ${slot === sl ? s.on : ''}`}
                    onClick={() => setSlot(sl)}
                  >
                    {sl}
                  </button>
                ))}
              </div>

              <Button full icon="clock" onClick={book}>
                {t('consult.book')}
              </Button>
            </>
          )}
        </div>
      ) : (
        <Chat />
      )}
    </div>
  );
}

function Chat() {
  const { t } = useI18n();
  const { state, patch } = useApp();
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [local, setLocal] = useState([]); // messages with photos (not persisted)
  const endRef = useRef(null);
  const timer = useRef();

  const messages = [...state.chat, ...local];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, typing]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const reply = (count) => {
    setTyping(true);
    timer.current = setTimeout(() => {
      const replies = t('consult.replies');
      patch((st) => ({ chat: [...st.chat, { from: 'stylist', text: replies[count % replies.length] }] }));
      setTyping(false);
    }, 1400);
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const count = state.chat.filter((m) => m.from === 'stylist').length;
    patch((st) => ({ chat: [...st.chat, { from: 'me', text: value }] }));
    setText('');
    reply(count);
  };

  const attach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await resizeImage(file);
    const count = state.chat.filter((m) => m.from === 'stylist').length;
    setLocal((l) => [...l, { from: 'me', img }]);
    reply(count);
  };

  return (
    <div className={s.chat}>
      <p className={s.chatIntro}>{t('consult.chatIntro')}</p>
      <div className={s.messages} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`${s.msg} ${m.from === 'me' ? s.me : s.them}`}>
            {m.img && <img src={m.img} alt="" />}
            {m.text}
          </div>
        ))}
        {typing && <div className={`${s.msg} ${s.them} ${s.typing}`}>{t('consult.typing')}</div>}
        <div ref={endRef} />
      </div>

      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className={s.attach} aria-label={t('consult.attach')}>
          <Icon name="paperclip" size={22} />
          <input type="file" accept="image/*" className="sr-only" onChange={attach} />
        </label>
        <input
          className={s.input}
          value={text}
          placeholder={t('consult.placeholder')}
          aria-label={t('consult.placeholder')}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className={s.send} aria-label={t('consult.send')} disabled={!text.trim()}>
          <Icon name="send" size={20} />
        </button>
      </form>
    </div>
  );
}
