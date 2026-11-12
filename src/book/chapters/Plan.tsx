import { useState } from 'react';
import { ArrowRight, Check, LoaderCircle, Sparkles } from 'lucide-react';
import Page from '../Page';
import { tripService } from '../../services/tripService';
import type { ChapterProps } from '../store';

const styles = ['자연과 힐링', '감성 카페', '맛집 탐방', '문화와 예술', '액티비티', '느긋한 여행'];
const companions = ['혼자서', '친구와 둘이', '연인과 함께', '가족과 함께', '친구들과 함께'];

export default function Plan({ store, go }: ChapterProps) {
  const { request, setRequest, trip, setTrip } = store;
  const [loading, setLoading] = useState(false);
  const [day, setDay] = useState(0);
  const set = (patch: Partial<typeof request>) => setRequest({ ...request, ...patch });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { setTrip(await tripService.recommend(request)); setDay(0); } finally { setLoading(false); }
  };
  const places = trip?.days[Math.min(day, trip.days.length - 1)] ?? [];

  return <>
    <Page side="left" kicker="CHAPTER 01 · PLAN" title="어디로 떠나볼까요?">
      <form className="form" onSubmit={submit}>
        <label>여행지<input required maxLength={40} value={request.destination} placeholder="예: 제주, 부산, 강릉" onChange={e => set({ destination: e.target.value })}/></label>
        <div className="row">
          <label>출발일<input type="date" required value={request.startDate} onChange={e => set({ startDate: e.target.value })}/></label>
          <label>기간<select value={request.days} onChange={e => set({ days: +e.target.value })}>{[1, 2, 3, 4, 5, 6, 7].map(d => <option key={d} value={d}>{d}일</option>)}</select></label>
        </div>
        <label>누구와?<select value={request.travelers} onChange={e => set({ travelers: e.target.value })}>{companions.map(c => <option key={c}>{c}</option>)}</select></label>
        <fieldset><legend>여행 스타일</legend><div className="chips">
          {styles.map(t => {
            const on = request.tags.includes(t);
            return <button key={t} type="button" aria-pressed={on} className={on ? 'chip on' : 'chip'} onClick={() => set({ tags: on ? request.tags.filter(x => x !== t) : [...request.tags, t] })}>{on && <Check size={11}/>}{t}</button>;
          })}
        </div></fieldset>
        <label>바라는 여행<textarea rows={3} maxLength={1000} value={request.preferences} onChange={e => set({ preferences: e.target.value })} placeholder="좋아하는 것, 꼭 가고 싶은 곳, 예산 등"/></label>
        <button className="px-btn" disabled={loading || !request.destination.trim()}>
          {loading ? <><LoaderCircle className="spin" size={15}/> 일정 그리는 중…</> : <><Sparkles size={15}/> AI 일정 추천받기</>}
        </button>
        <p className="fine">지금은 예시 일정이에요. 실제 AI와는 아직 연결되지 않았어요.</p>
      </form>
    </Page>
    <Page side="right" kicker="MY NEXT ADVENTURE" title={trip ? trip.title : '추천 일정'}>
      {loading ? (
        <div className="empty"><p>일정을 만드는 중…</p></div>
      ) : !trip ? (
        <div className="empty"><p>왼쪽에 취향을 적어주면<br/>여기에 일정이 생겨요!</p></div>
      ) : <>
        <p className="muted">{trip.request.startDate}부터 {trip.days.length}일 · {trip.request.travelers}</p>
        <div className="day-tabs" role="tablist">
          {trip.days.map((_, i) => <button key={i} role="tab" aria-selected={day === i} className={day === i ? 'on' : ''} onClick={() => setDay(i)}>DAY {i + 1}</button>)}
        </div>
        <ol className="timeline">
          {places.map(p => <li key={p.id}><time>{p.time}</time><div><strong>{p.name}</strong><small>{p.category} · {p.description}</small></div></li>)}
        </ol>
        <button className="px-btn ghost" onClick={() => go('route')}>지도에서 동선 다듬기 <ArrowRight size={14}/></button>
      </>}
    </Page>
  </>;
}
