import { useState } from 'react';
import { ArrowDown, ArrowUp, Compass, Plus, Sparkles, Trash2 } from 'lucide-react';
import Page from '../Page';
import { makeTrip } from '../../services/tripService';
import type { Place } from '../../types';
import type { ChapterProps } from '../store';

// 지도 SVG(600x500) 기준 좌표로 거리 계산
const dist = (a: Place, b: Place) => Math.hypot((a.x - b.x) * 6, (a.y - b.y) * 5);
const routeLength = (ps: Place[]) => ps.slice(1).reduce((sum, p, i) => sum + dist(ps[i], p), 0);

/** 첫 장소에서 출발해 가장 가까운 곳을 차례로 방문(최근접 이웃). 시간 슬롯은 그대로 두고 장소만 재배치 */
function optimize(places: Place[]) {
  if (places.length < 3) return places;
  const rest = places.slice(1), order = [places[0]];
  while (rest.length) {
    const last = order[order.length - 1];
    let best = 0;
    rest.forEach((p, i) => { if (dist(last, p) < dist(last, rest[best])) best = i; });
    order.push(rest.splice(best, 1)[0]);
  }
  const times = places.map(p => p.time).sort();
  return order.map((p, i) => ({ ...p, time: times[i] }));
}

export default function Route({ store, go }: ChapterProps) {
  const { trip, setTrip } = store;
  const [day, setDay] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  if (!trip) return <>
    <Page side="left" kicker="CHAPTER 02 · ROUTE" title="동선 다듬기">
      <div className="empty"><p>아직 다듬을 일정이 없어요.</p><button className="px-btn" onClick={() => go('plan')}>일정 먼저 만들기</button></div>
    </Page>
    <Page side="right"><div className="empty"><Compass size={64} strokeWidth={1}/><p className="muted">일정이 생기면 여기에 지도가 펼쳐져요.</p></div></Page>
  </>;

  const d = Math.min(day, trip.days.length - 1);
  const places = trip.days[d];
  const active = places.find(p => p.id === selected) ?? places[0];
  const update = (next: Place[]) => setTrip({ ...trip, days: trip.days.map((x, i) => (i === d ? next : x)) });
  const patch = (id: string, change: Partial<Place>) => update(places.map(p => (p.id === id ? { ...p, ...change } : p)));
  const move = (i: number, by: number) => { const next = [...places]; [next[i], next[i + by]] = [next[i + by], next[i]]; update(next); };

  const runOptimize = () => {
    const before = routeLength(places), next = optimize(places), after = routeLength(next);
    update(next);
    setNotice(after < before - 1 ? `이동 거리가 약 ${Math.round((1 - after / before) * 100)}% 줄었어요!` : '이미 가장 짧은 동선이에요.');
  };
  const addPlace = () => {
    const base = makeTrip(trip.request).days[d][2];
    const p = { ...base, id: `added-${Date.now()}`, name: '나만의 장소', time: '18:00', x: 30 + Math.random() * 40, y: 30 + Math.random() * 30, description: '오른쪽 지도 아래에서 이름을 바꿔보세요.' };
    update([...places, p]); setSelected(p.id);
  };

  return <>
    <Page side="left" kicker="CHAPTER 02 · ROUTE" title={`${trip.destination} 동선`}>
      <div className="day-tabs" role="tablist">
        {trip.days.map((_, i) => <button key={i} role="tab" aria-selected={d === i} className={d === i ? 'on' : ''} onClick={() => { setDay(i); setSelected(null); setNotice(''); }}>DAY {i + 1}</button>)}
      </div>
      <ol className="stops">
        {places.map((p, i) => (
          <li key={p.id} className={active?.id === p.id ? 'on' : ''}>
            <button className="stop-name" onClick={() => setSelected(p.id)}><span className="pin-no">{i + 1}</span>{p.name}</button>
            <input type="time" aria-label={`${p.name} 시간`} value={p.time} onChange={e => patch(p.id, { time: e.target.value })}/>
            <span className="stop-tools">
              <button aria-label="위로" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={13}/></button>
              <button aria-label="아래로" disabled={i === places.length - 1} onClick={() => move(i, 1)}><ArrowDown size={13}/></button>
              <button aria-label="삭제" onClick={() => update(places.filter(x => x.id !== p.id))}><Trash2 size={13}/></button>
            </span>
          </li>
        ))}
      </ol>
      {places.length === 0 && <p className="muted">장소가 없어요. 아래에서 추가해보세요.</p>}
      <div className="btn-row">
        <button className="px-btn" disabled={places.length < 3} onClick={runOptimize}><Sparkles size={14}/> 최적 동선 정렬</button>
        <button className="px-btn ghost" onClick={addPlace}><Plus size={14}/> 장소 추가</button>
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
    </Page>
    <Page side="right" kicker="ILLUSTRATED MAP">
      <div className="map">
        <svg viewBox="0 0 600 500" role="img" aria-label={`${trip.destination} 일러스트 지도`}>
          <rect width="600" height="500" fill="#dbeef0"/>
          <path d="M68 274 Q89 188 199 136 Q365 54 490 148 Q564 219 489 300 Q380 402 215 379 Q113 365 68 274" fill="#f8f0dc" stroke="#cbb79a" strokeWidth="6"/>
          <path d="M235 275 l28 -47 33 47 Z" fill="#8fbf9a"/><path d="M265 284 l28 -51 34 51 Z" fill="#6fa585"/>
          {places.length > 1 && <polyline points={places.map(p => `${p.x * 6},${p.y * 5}`).join(' ')} fill="none" stroke="#c0785a" strokeWidth="4" strokeDasharray="10 8"/>}
        </svg>
        {places.map((p, i) => <button key={p.id} className={`map-pin ${active?.id === p.id ? 'on' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={p.name} onClick={() => setSelected(p.id)}>{i + 1}</button>)}
      </div>
      {active && (
        <div className="place-detail">
          <img src={active.image} alt=""/>
          <div>
            <small>{active.time} · {active.category}</small>
            <input aria-label="장소 이름" maxLength={50} value={active.name} onChange={e => patch(active.id, { name: e.target.value })}/>
            <p>{active.description}</p>
          </div>
        </div>
      )}
      <p className="fine">실제 위치와 무관한 데모 지도예요. 지도 API를 연결하면 실제 거리로 계산할 수 있어요.</p>
    </Page>
  </>;
}
