import { useState } from 'react';
import { Check, LoaderCircle, LocateFixed } from 'lucide-react';
import Page from '../Page';
import type { Place } from '../../types';
import type { ChapterProps } from '../store';

type Status = { kind: 'idle' } | { kind: 'loading'; place: string } | { kind: 'ok'; place: string; lat: number; lng: number; accuracy: number } | { kind: 'error'; message: string };

const errorText: Record<number, string> = {
  1: '위치 권한이 거부됐어요. 브라우저 주소창 옆에서 위치 권한을 허용해주세요.',
  2: '현재 위치를 찾지 못했어요. 잠시 후 다시 시도해주세요.',
  3: '위치 확인이 너무 오래 걸렸어요. 다시 시도해주세요.',
};

export default function Verify({ store, go }: ChapterProps) {
  const { trip, stamps, setStamps } = store;
  const [day, setDay] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const verify = (place: Place) => {
    if (!window.isSecureContext || !navigator.geolocation) {
      setStatus({ kind: 'error', message: '위치 기능은 https 주소나 localhost에서만 쓸 수 있어요.' });
      return;
    }
    setStatus({ kind: 'loading', place: place.name });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const stamp = { placeId: place.id, place: place.name, destination: trip!.destination, at: new Date().toISOString(), lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy };
        setStamps(prev => [...prev.filter(s => s.placeId !== place.id), stamp]);
        setStatus({ kind: 'ok', place: place.name, lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
      },
      err => setStatus({ kind: 'error', message: errorText[err.code] ?? '위치를 가져오지 못했어요.' }),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  if (!trip) return <>
    <Page side="left" kicker="CHAPTER 05 · CHECK-IN" title="방문 인증">
      <div className="empty"><p>인증할 여행 일정이 없어요.</p><button className="px-btn" onClick={() => go('plan')}>일정 먼저 만들기</button></div>
    </Page>
    <Page side="right"><div className="empty"><LocateFixed size={56} strokeWidth={1}/></div></Page>
  </>;

  const d = Math.min(day, trip.days.length - 1);
  const done = new Set(stamps.map(s => s.placeId));

  return <>
    <Page side="left" kicker="CHAPTER 05 · CHECK-IN" title="도착했다면 꾹!">
      <p className="muted">장소에 도착하면 버튼을 눌러 현재 위치로 인증하고 스탬프를 받아요.</p>
      <div className="day-tabs" role="tablist">
        {trip.days.map((_, i) => <button key={i} role="tab" aria-selected={d === i} className={d === i ? 'on' : ''} onClick={() => setDay(i)}>DAY {i + 1}</button>)}
      </div>
      <ul className="checkins">
        {trip.days[d].map(p => (
          <li key={p.id}>
            <span><strong>{p.name}</strong><small>{p.time} · {p.category}</small></span>
            {done.has(p.id)
              ? <span className="got"><Check size={13}/> 인증됨</span>
              : <button className="px-btn small" disabled={status.kind === 'loading'} onClick={() => verify(p)}><LocateFixed size={13}/> 인증</button>}
          </li>
        ))}
      </ul>
    </Page>
    <Page side="right" kicker="GPS CHECK-IN">
      <div className="gps-card" role="status">
        {status.kind === 'idle' && <><p>도착한 장소를<br/>왼쪽에서 골라 인증해주세요.</p></>}
        {status.kind === 'loading' && <><LoaderCircle className="spin" size={40}/><p>{status.place} 위치 확인 중…</p></>}
        {status.kind === 'ok' && <>
          <div className="stamp big"><span className="stamp-city">{trip.destination}</span><strong>{status.place}</strong><small>VISITED</small></div>
          <p>스탬프를 받았어요!</p>
          <p className="fine">위도 {status.lat.toFixed(4)}, 경도 {status.lng.toFixed(4)} · 오차 약 {Math.round(status.accuracy)}m</p>
          <button className="px-btn ghost" onClick={() => go('passport')}>여권에서 보기</button>
        </>}
        {status.kind === 'error' && <><p>{status.message}</p></>}
      </div>
      <p className="fine">데모 단계라 현재 위치를 기록만 해요. 장소의 실제 좌표가 연결되면 반경 안에 있을 때만 인증되도록 바꿀 수 있어요.</p>
    </Page>
  </>;
}
