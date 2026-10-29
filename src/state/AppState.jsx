import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useI18n } from '../i18n';

const DEFAULT_STATE = {
  points: 100, // welcome bonus
  lastCheckin: null,
  streak: 0,
  wigs: [
    { id: 'aurora', sinceWash: 8 },
    { id: 'sylvia', sinceWash: 2 },
  ],
  redeemed: [],
  booking: null,
  chat: [],
  notif: false,
  quizDone: false,
  likes: {},
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { t } = useI18n();
  const [state, setState] = useLocalStorage('mw.state', DEFAULT_STATE);
  const [posts, setPosts] = useLocalStorage('mw.posts', []); // user posts (with photos) kept separately
  const [toastMsg, setToastMsg] = useState(null);
  const timer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const patch = useCallback(
    (p) => setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) })),
    [setState],
  );

  const addPoints = useCallback(
    (n, reason) => {
      patch((s) => ({ points: s.points + n }));
      toast(t('toast.points', { n, why: t(`club.reasons.${reason}`) }));
    },
    [patch, toast, t],
  );

  const value = useMemo(
    () => ({ state, patch, posts, setPosts, addPoints, toast, toastMsg }),
    [state, patch, posts, setPosts, addPoints, toast, toastMsg],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
