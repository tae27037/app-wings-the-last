import Button from '../components/Button';
import Icon from '../components/Icon';
import ScreenHead from '../components/ScreenHead';
import { EARN, LEVELS, REWARDS } from '../data/wigs';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './Club.module.css';

const todayKey = () => new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv');
};

export default function Club() {
  const { t } = useI18n();
  const { state, patch, addPoints, toast } = useApp();

  const levelIdx = LEVELS.reduce((acc, l, i) => (state.points >= l.from ? i : acc), 0);
  const level = LEVELS[levelIdx];
  const next = LEVELS[levelIdx + 1];
  const pct = next ? ((state.points - level.from) / (next.from - level.from)) * 100 : 100;

  const checkedIn = state.lastCheckin === todayKey();
  const checkin = () => {
    if (checkedIn) return;
    patch((st) => ({
      lastCheckin: todayKey(),
      streak: st.lastCheckin === yesterdayKey() ? st.streak + 1 : 1,
    }));
    addPoints(5, 'checkin');
  };

  const redeem = (r) => {
    if (state.redeemed.includes(r.id)) return;
    if (state.points < r.cost) {
      toast(t('club.notEnough'));
      return;
    }
    patch((st) => ({ points: st.points - r.cost, redeemed: [...st.redeemed, r.id] }));
  };

  const early = state.redeemed.includes('early');

  return (
    <div className={s.page}>
      <ScreenHead title={t('club.title')} />

      <section className={s.card}>
        <p className={s.small}>{t('club.level')}</p>
        <h2 className={s.level}>{t(`club.levels.${level.id}`)}</h2>
        <p className={s.big}>
          {state.points} <span>{t('club.points')}</span>
        </p>
        <div
          className={s.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className={s.small}>
          {next
            ? t('club.toNext', { n: next.from - state.points, level: t(`club.levels.${next.id}`) })
            : t('club.maxLevel')}
        </p>
      </section>

      <section className={s.checkin}>
        <div>
          <h3 className={s.h3}>{t('club.checkin')}</h3>
          <p className={s.small}>{t('club.streak', { n: state.streak })}</p>
        </div>
        <Button size="sm" icon={checkedIn ? 'check' : 'gift'} disabled={checkedIn} onClick={checkin}>
          {checkedIn ? t('club.checkinDone') : '+5'}
        </Button>
      </section>

      <section className={`${s.early} ${early ? s.unlocked : ''}`}>
        <span className={s.earlyIcon}>
          <Icon name="clock" size={22} />
        </span>
        <div>
          <h3 className={s.h3}>{t('club.earlyTitle')}</h3>
          <p className={s.small}>{t('club.earlyText')}</p>
          <p className={s.status}>{early ? t('club.earlyUnlocked') : t('club.earlyLocked')}</p>
        </div>
      </section>

      <h2 className={s.h2}>{t('club.rewardsTitle')}</h2>
      <div className={s.list}>
        {REWARDS.map((r) => {
          const done = state.redeemed.includes(r.id);
          return (
            <div key={r.id} className={s.row}>
              <span className={s.rowIcon}>
                <Icon name="gift" size={22} />
              </span>
              <div className={s.rowText}>
                <strong>{t(`club.rewards.${r.id}`)}</strong>
                <small>
                  {r.cost} {t('club.points')}
                </small>
              </div>
              <Button
                size="sm"
                variant={done ? 'soft' : 'primary'}
                disabled={done}
                onClick={() => redeem(r)}
              >
                {done ? t('club.redeemed') : t('club.redeem')}
              </Button>
            </div>
          );
        })}
      </div>

      <h2 className={s.h2}>{t('club.earnTitle')}</h2>
      <div className={s.list}>
        {EARN.map((e) => (
          <div key={e.id} className={s.row}>
            <span className={s.rowIcon}>
              <Icon name="star" size={22} />
            </span>
            <div className={s.rowText}>
              <strong>{t(`club.earn.${e.id}`)}</strong>
            </div>
            <span className={s.pts}>+{e.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
