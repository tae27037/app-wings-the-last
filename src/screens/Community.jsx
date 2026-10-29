import { useState } from 'react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Sheet from '../components/Sheet';
import Wig from '../components/Wig';
import ScreenHead from '../components/ScreenHead';
import { SEED_POSTS, STYLES, getStyle } from '../data/wigs';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './Community.module.css';

// Downscale an uploaded photo so it fits comfortably in localStorage.
function resizeImage(file, max = 720) {
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
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function BeforeAfter({ style, t }) {
  const [v, setV] = useState(50);
  return (
    <div className={s.ba}>
      <div className={s.baLayer}>
        <Wig kind={style.kind} color={style.color} height={250} label={t('community.after')} />
      </div>
      <div className={s.baLayer} style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }}>
        <Wig kind="short" variant="bare" height={250} label={t('community.before')} />
      </div>
      <span className={`${s.tag} ${s.tagL}`}>{t('community.before')}</span>
      <span className={`${s.tag} ${s.tagR}`}>{t('community.after')}</span>
      <div className={s.divider} style={{ left: `${v}%` }} aria-hidden="true" />
      <input
        className={s.slider}
        type="range"
        min="5"
        max="95"
        value={v}
        aria-label={t('community.compare')}
        onChange={(e) => setV(Number(e.target.value))}
      />
    </div>
  );
}

export default function Community() {
  const { t } = useI18n();
  const { state, patch, posts, setPosts, addPoints } = useApp();
  const [filter, setFilter] = useState('all');
  const [composer, setComposer] = useState(false);
  const [draft, setDraft] = useState({ photo: null, caption: '', styleId: STYLES[0].id });

  const when = (p) => {
    if (p.ts) return t('community.justNow');
    return p.hours < 24
      ? t('community.hoursAgo', { n: p.hours })
      : t('community.daysAgo', { n: Math.floor(p.hours / 24) });
  };

  const all = [
    ...posts.map((p) => ({ ...p, author: t('community.you') })),
    ...SEED_POSTS.map((p) => ({ ...p, caption: t(`community.posts.${p.id}`) })),
  ].filter((p) => (filter === 'ba' ? p.beforeAfter : true));

  const toggleLike = (id) => patch((st) => ({ likes: { ...st.likes, [id]: !st.likes[id] } }));

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photo = await resizeImage(file);
    setDraft((d) => ({ ...d, photo }));
  };

  const publish = () => {
    setPosts((list) => [
      { id: `u${Date.now()}`, ts: Date.now(), photo: draft.photo, caption: draft.caption.trim(), styleId: draft.styleId, likes: 0 },
      ...list,
    ]);
    setComposer(false);
    setDraft({ photo: null, caption: '', styleId: STYLES[0].id });
    addPoints(50, 'post');
  };

  return (
    <div>
      <ScreenHead title={t('community.title')} subtitle={t('community.subtitle')} />

      <div className={s.top}>
        <div className={s.filters} role="group">
          {['all', 'ba'].map((f) => (
            <button
              key={f}
              type="button"
              className={`${s.filter} ${filter === f ? s.on : ''}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? t('community.filterAll') : t('community.filterBA')}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className={s.compose} onClick={() => setComposer(true)}>
        <span className={s.composeIcon}>
          <Icon name="plus" size={22} />
        </span>
        <span className={s.composeText}>
          <strong>{t('community.add')}</strong>
          <small>{t('community.bonus', { n: 50 })}</small>
        </span>
      </button>

      {all.length === 0 && <p className={s.empty}>{t('community.empty')}</p>}

      <div className={s.feed}>
        {all.map((p) => {
          const style = getStyle(p.styleId);
          const liked = !!state.likes[p.id];
          return (
            <article key={p.id} className={s.post}>
              <header className={s.postHead}>
                <span className={s.avatar} aria-hidden="true">
                  {p.author.slice(0, 1)}
                </span>
                <div>
                  <strong className={s.author}>{p.author}</strong>
                  <span className={s.time}>{when(p)}</span>
                </div>
              </header>

              {p.photo ? (
                <img className={s.photo} src={p.photo} alt={p.caption || p.author} />
              ) : p.beforeAfter ? (
                <BeforeAfter style={style} t={t} />
              ) : (
                <div className={s.art}>
                  <Wig kind={style.kind} color={style.color} height={250} label={style.name} />
                </div>
              )}

              <div className={s.postBody}>
                {p.caption && <p className={s.caption}>{p.caption}</p>}
                <div className={s.postFoot}>
                  <span className={s.chip}>{style.name}</span>
                  <button
                    type="button"
                    className={`${s.like} ${liked ? s.liked : ''}`}
                    aria-pressed={liked}
                    aria-label={t('community.like')}
                    onClick={() => toggleLike(p.id)}
                  >
                    <Icon name="heart" size={20} filled={liked} />
                    {p.likes + (liked ? 1 : 0)}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Sheet open={composer} onClose={() => setComposer(false)} title={t('community.add')}>
        <div className={s.form}>
          <label className={s.drop}>
            {draft.photo ? (
              <img src={draft.photo} alt="" />
            ) : (
              <span className={s.dropHint}>
                <Icon name="photo" size={32} />
                {t('community.choosePhoto')}
              </span>
            )}
            <input type="file" accept="image/*" onChange={pick} className="sr-only" />
          </label>

          <label className={s.field}>
            <span>{t('community.caption')}</span>
            <textarea
              rows="3"
              maxLength="200"
              value={draft.caption}
              placeholder={t('community.captionPlaceholder')}
              onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))}
            />
          </label>

          <label className={s.field}>
            <span>{t('community.tag')}</span>
            <select value={draft.styleId} onChange={(e) => setDraft((d) => ({ ...d, styleId: e.target.value }))}>
              {STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </label>

          <Button full icon="send" disabled={!draft.photo} onClick={publish}>
            {t('community.publish')} · {t('community.bonus', { n: 50 })}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
