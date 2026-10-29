import { useHashRoute } from './hooks/useHashRoute';
import { useApp } from './state/AppState';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Home from './screens/Home';
import TryOn from './screens/TryOn';
import Stylist from './screens/Stylist';
import Care from './screens/Care';
import Community from './screens/Community';
import Consult from './screens/Consult';
import Club from './screens/Club';
import s from './App.module.css';

const SCREENS = {
  home: Home,
  tryon: TryOn,
  stylist: Stylist,
  care: Care,
  community: Community,
  consult: Consult,
  club: Club,
};
const SUBSCREENS = ['stylist', 'consult'];

export default function App() {
  const { name, param } = useHashRoute();
  const { toastMsg } = useApp();
  const Screen = SCREENS[name] || Home;
  const current = SCREENS[name] ? name : 'home';
  const isSub = SUBSCREENS.includes(current);

  return (
    <div className={s.app}>
      <Header showBack={isSub} />
      <main className={s.main}>
        <Screen param={param} />
      </main>
      <TabBar active={isSub ? 'home' : current} />
      <div className={s.toastWrap} aria-live="polite">
        {toastMsg && <div className={s.toast}>{toastMsg}</div>}
      </div>
    </div>
  );
}
