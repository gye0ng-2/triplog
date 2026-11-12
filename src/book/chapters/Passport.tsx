import { Stamp as StampIcon } from 'lucide-react';
import Page from '../Page';
import type { ChapterProps } from '../store';

const SLOTS = 9;

export default function Passport({ store, go }: ChapterProps) {
  const { name, setName, stamps } = store;
  const cities = new Set(stamps.map(s => s.destination)).size;
  const empty = Math.max(0, SLOTS - stamps.length);

  return <>
    <Page side="left" kicker="CHAPTER 04 · PASSPORT">
      <div className="passport">
        <StampIcon size={30} strokeWidth={1.5}/>
        <span className="passport-brand">TRIPLOG</span>
        <strong>TRAVEL PASSPORT</strong>
        <span className="passport-name">{name || '여행자'}</span>
      </div>
      <label className="form">여권에 적을 이름<input value={name} maxLength={20} onChange={e => setName(e.target.value)}/></label>
      <dl className="stats">
        <div><dt>모은 스탬프</dt><dd>{stamps.length}</dd></div>
        <div><dt>다녀온 도시</dt><dd>{cities}</dd></div>
      </dl>
    </Page>
    <Page side="right" kicker="VISITED PLACES" title="스탬프 모음">
      <ul className="stamp-grid">
        {stamps.map((s, i) => (
          <li key={s.placeId} className="stamp" style={{ '--tilt': `${((i * 37) % 21) - 10}deg` } as React.CSSProperties}>
            <span className="stamp-city">{s.destination}</span>
            <strong>{s.place}</strong>
            <small>{new Date(s.at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</small>
          </li>
        ))}
        {Array.from({ length: empty }, (_, i) => <li key={`e${i}`} className="stamp empty" aria-hidden="true"/>)}
      </ul>
      {stamps.length === 0 && <button className="px-btn ghost" onClick={() => go('verify')}>첫 스탬프 받으러 가기</button>}
    </Page>
  </>;
}
