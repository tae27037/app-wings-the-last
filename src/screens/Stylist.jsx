import { useState } from 'react';
import Button from '../components/Button';
import Wig from '../components/Wig';
import ScreenHead from '../components/ScreenHead';
import { QUIZ, recommend } from '../data/wigs';
import { useI18n } from '../i18n';
import { useApp } from '../state/AppState';
import s from './Stylist.module.css';

export default function Stylist() {
  const { t } = useI18n();
  const { state, patch, addPoints } = useApp();
  const [step, setStep] = useState(-1); // -1 intro, 0..3 questions, 4 results
  const [answers, setAnswers] = useState({});

  const answer = (qid, value) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step + 1 >= QUIZ.length) {
      setStep(QUIZ.length);
      if (!state.quizDone) {
        patch({ quizDone: true });
        addPoints(20, 'quiz');
      }
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(-1);
  };

  if (step === -1) {
    return (
      <div>
        <ScreenHead title={t('stylist.title')} subtitle={t('stylist.intro')} />
        <div className={s.introArt} aria-hidden="true">
          <Wig kind="bob" color="#6B4A38" height={150} />
          <Wig kind="curly" color="#D6AE6A" height={190} />
          <Wig kind="short" color="#2E2A36" height={150} />
        </div>
        <Button full icon="sparkle" onClick={() => setStep(0)}>
          {t('stylist.start')}
        </Button>
      </div>
    );
  }

  if (step < QUIZ.length) {
    const q = QUIZ[step];
    return (
      <div>
        <ScreenHead title={t(`stylist.q.${q.id}.title`)} subtitle={t('stylist.step', { n: step + 1, total: QUIZ.length })} />
        <div
          className={s.progress}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUIZ.length}
          aria-valuenow={step + 1}
        >
          <span style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
        </div>
        <div className={s.options}>
          {q.options.map((o) => (
            <button
              key={o}
              type="button"
              className={`${s.option} ${answers[q.id] === o ? s.on : ''}`}
              onClick={() => answer(q.id, o)}
            >
              {t(`stylist.q.${q.id}.options.${o}`)}
            </button>
          ))}
        </div>
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
            {t('common.back')}
          </Button>
        )}
      </div>
    );
  }

  const results = recommend(answers);
  return (
    <div>
      <ScreenHead title={t('stylist.resultTitle')} subtitle={t('stylist.resultText')} />
      <div className={s.results}>
        {results.map(({ style, percent }) => (
          <article key={style.id} className={s.result}>
            <div className={s.art}>
              <Wig kind={style.kind} color={style.color} height={132} label={style.name} />
            </div>
            <div className={s.info}>
              <span className={s.match}>{t('stylist.match', { n: percent })}</span>
              <h2 className={s.name}>{style.name}</h2>
              <p className={s.meta}>
                {t(`common.length.${style.length}`)} · {t(`common.material.${style.material}`)}
              </p>
              <a className={s.try} href={`#/tryon/${style.id}`}>
                {t('stylist.tryIt')}
              </a>
            </div>
          </article>
        ))}
      </div>
      <Button full variant="ghost" onClick={restart}>
        {t('stylist.again')}
      </Button>
    </div>
  );
}
