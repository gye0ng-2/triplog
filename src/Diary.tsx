import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Camera, Compass, Heart, MapPin, Plane, Sparkles, Stamp } from 'lucide-react';
import Workspace from './App';
import { photos } from './services/tripService';
import type { Trip, View } from './types';
import './diary.css';

const chapters = [
  { id: 'home', label: 'HOME', title: '여행이 머무는 작은 책', color: '#f3d989' },
  { id: 'plan', label: 'PLAN', title: '설렘부터 적어볼까요?', color: '#c5d8bb' },
  { id: 'memory', label: 'MEMORY', title: '오래 간직하고 싶은 순간', color: '#efc3c2' },
  { id: 'passport', label: 'PASSPORT', title: '세상을 모으는 나의 여권', color: '#c5c3e0' },
  { id: 'mypage', label: 'MY PAGE', title: '나의 여행 취향 노트', color: '#b9d6d9' },
  { id: 'contact', label: 'CONTACT', title: '우리에게 남기는 쪽지', color: '#e7c9ad' },
] as const;
function readChapter() { const index = chapters.findIndex(c => `#${c.id}` === location.hash); return index < 0 ? 0 : index; }
function savedTrip(): Trip | null { try { const value = JSON.parse(localStorage.getItem('chorok-trip') || 'null'); return value?.destination && Array.isArray(value.days) ? value : null; } catch { return null; } }

export default function Diary() {
  const [page, setPage] = useState(readChapter);
  const [turn, setTurn] = useState<{ from: number; to: number } | null>(null);
  const [workspace, setWorkspace] = useState<View | null>(null);
  const [trip, setTrip] = useState(savedTrip);
  const [name, setName] = useState(() => localStorage.getItem('triplog-name') || '여행자');
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const navigate = (next: number) => {
    if (lock.current || next === page) return;
    history.pushState(null, '', `#${chapters[next].id}`);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setPage(next); return; }
    lock.current = true; setTurn({ from: page, to: next });
  };
  useEffect(() => {
    const restore = () => { lock.current = false; setTurn(null); setWorkspace(null); setPage(readChapter()); };
    window.addEventListener('popstate', restore); window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, []);
  useEffect(() => {
    if (!turn) return;
    const timer = window.setTimeout(() => { setPage(turn.to); setTurn(null); lock.current = false; heading.current?.focus({ preventScroll: true }); }, 850);
    return () => clearTimeout(timer);
  }, [turn]);
  const open = (view: View) => { setWorkspace(view); window.scrollTo(0, 0); };
  const content = (index: number, decorative = false) => <>
    <div className="page-masthead"><span><Plane size={15}/> triplog / travel diary</span><span>VOL. 01</span></div>
    <div className="chapter-kicker">CHAPTER {String(index + 1).padStart(2, '0')} · {chapters[index].label}</div>
    <h1 tabIndex={-1} ref={decorative ? undefined : heading}>{chapters[index].title}</h1>
    {index === 0 ? <>
      <p className="diary-intro">낯선 곳의 설렘도, 사소한 행복도.<br/>당신의 여행을 한 장씩 담아보세요.</p>
      <div className="scrap-scene"><span className="scribble">let’s get a little lost…</span><div className="scrap-photo forest"><img src={photos.forest} alt="햇살이 스며드는 숲"/><span>a little pause 🌿</span></div><div className="scrap-photo sea"><i className="washi"/><img src={photos.coast} alt="제주의 푸른 바다"/><span>바람이 좋았던 그날 ♡</span></div><div className="travel-stamp"><Plane/><span>COLLECT<br/>MOMENTS</span></div><span className="flower-doodle">✿</span><span className="journey-label"><MapPin size={12}/> SOMEWHERE LOVELY</span></div>
      <div className="welcome-note"><span className="note-pin">♡</span><p>빈 페이지는 새로운 여행의 시작.<br/><strong>다음 이야기는 어디로 떠날까요?</strong></p></div>
      <div className="diary-actions"><button onClick={() => navigate(1)}><Sparkles size={18}/><span>여행 계획 시작하기<small>조금의 계획, 커다란 설렘</small></span><ArrowRight size={18}/></button><button onClick={() => navigate(2)}><BookOpen size={18}/><span>내 여행 기록 펼치기<small>우리의 순간을 오래오래</small></span><ArrowRight size={18}/></button></div>
    </> : index === 1 ? <>
      <p className="diary-intro">가고 싶은 곳과 좋아하는 것들을 적어주세요.<br/>나만의 여행 일정이 시작됩니다.</p><div className="chapter-illustration"><Compass size={80} strokeWidth={1}/><span className="scribble">where to next?</span></div><div className="notepaper"><span className="mini-heading">MY NEXT ADVENTURE</span><h2>{trip ? trip.destination : '아직 정하지 않아도 괜찮아요'}</h2><p>{trip ? `${trip.request.startDate} · ${trip.days.length}일의 여행` : '바다 한 조각, 숲 한 걸음, 그리고 커피 한 잔.'}</p></div><button className="diary-primary" onClick={() => open('plan')}><Sparkles size={17}/> AI 여행 계획 만들기 <ArrowRight size={17}/></button><button className="diary-link" onClick={() => open('map')}>일정과 여행 지도 열기 ↗</button><p className="diary-fine">현재 추천 기능은 예시 일정으로 제공됩니다.</p>
    </> : index === 2 ? <>
      <p className="diary-intro">사진 한 장에 그날의 마음을 더해요.<br/>나만의 스크랩북으로 남기는 여행.</p><div className="memory-photo"><i className="washi"/><img src={photos.ocean} alt="여행 기록 꾸미기 예시, 바다 풍경"/><span className="scribble">dear, my memories</span></div><div className="notepaper"><span className="mini-heading">MY TRAVEL RECORDS</span>{trip ? <><h2>{trip.title}</h2><p>저장된 여행 일정 · {trip.days.length}일</p><button className="diary-link" onClick={() => open('result')}>기록 속 일정 확인하기 ↗</button></> : <><h2>첫 번째 추억을 기다리는 중</h2><p>계획한 일정을 저장하면 이곳에서 다시 만나요.</p></>}</div><button className="diary-primary" onClick={() => open('journal')}><Camera size={18}/> 사진 꾸미기 & 스크랩북 열기 <ArrowRight size={17}/></button>
    </> : index === 3 ? <>
      <p className="diary-intro">발걸음이 닿은 곳마다, 하나의 이야기.</p><div className="passport-book"><Stamp size={43} strokeWidth={1}/><span>TRIPLOG</span><h2>TRAVEL PASSPORT</h2><p>{name}의 여행 여권</p><span className="passport-line">THE WORLD IS YOUR STORY</span></div><div className="stamp-area"><span className="mini-heading">VISITED PLACES</span><p>방문 도시와 스탬프를 위한 빈 페이지</p><p className="diary-fine">방문 인증·스탬프 수집 기능은 준비 중이에요.</p></div>
    </> : index === 4 ? <>
      <p className="diary-intro">여행 속에서 발견하는 나다운 모습.</p><div className="profile-sketch"><Heart size={40} strokeWidth={1}/></div><label className="diary-field">다이어리에 적을 나의 이름<input value={name} maxLength={30} onChange={e => { setName(e.target.value); localStorage.setItem('triplog-name', e.target.value); }}/></label><div className="notepaper"><h2>{name || '여행자'}의 작은 발자국</h2><p>저장한 여행 일정 {trip ? '1' : '0'}개</p><p>{trip ? `${trip.destination} · ${trip.days.length}일` : '첫 여행의 설렘을 기록해보세요.'}</p></div><button className="diary-primary" onClick={() => navigate(2)}>나의 여행 기록 보기 <ArrowRight size={17}/></button><p className="diary-fine">이름과 일정은 현재 브라우저에 저장됩니다.</p>
    </> : <>
      <p className="diary-intro">여행의 시작과 끝, triplog가 함께해요.</p><div className="letter-note"><span className="scribble">dear, traveler ♡</span><h2>작은 계획이, 큰 추억이 되는 곳.</h2><p>triplog는 여행 일정을 계획하고, 지도에서 살펴보고, 사진을 꾸며 추억으로 남기는 여행 다이어리입니다.</p><p>현재는 개발 중인 서비스예요. 계정·방문 인증·문의 접수 기능은 준비 중입니다.</p></div><details className="diary-faq"><summary>여행 일정은 어디에 저장되나요?</summary><p>일정 화면의 저장 버튼을 누르면 현재 브라우저에 저장돼요. 다른 기기와는 동기화되지 않습니다.</p></details><details className="diary-faq"><summary>사진은 어떻게 내려받나요?</summary><p>MEMORY의 사진 꾸미기에서 사진과 스티커를 배치한 후 PNG 저장 버튼을 눌러주세요.</p></details>
    </>}
    <div className="paper-footer"><span>a little plan, a lovely journey.</span><span>— {String(index + 1).padStart(2, '0')} —</span></div>
  </>;
  if (workspace) return <div className="diary-workspace"><div className="workspace-ribbon"><button onClick={() => { setWorkspace(null); setTrip(savedTrip()); }}><ArrowLeft size={16}/> 다이어리로 돌아가기</button><span>triplog · creative space</span></div><Workspace initialView={workspace} onHome={() => { setWorkspace(null); setTrip(savedTrip()); }}/></div>;
  const visible = turn ? turn.to : page;
  return <main className="diary-desk"><div className="desk-caption"><span>triplog</span><p>나의 작은 여행 다이어리</p></div><div className="diary-stage"><div className="diary-cover"/><div className="paper-stack"/><div className="binding" aria-hidden="true">{Array.from({length: 7}, (_, i) => <i key={i}/>)}</div><nav className="paper-indices" aria-label="다이어리 인덱스">{chapters.map((c, i) => <button key={c.id} disabled={!!turn} aria-current={page === i ? 'page' : undefined} className={`paper-tab ${i < visible ? 'turned-tab' : ''} ${i === visible ? 'current-tab' : ''}`} style={{ '--tab-color': c.color, '--tab-order': i, '--tab-depth': Math.abs(i-visible) } as CSSProperties} onClick={() => navigate(i)}><span>{c.label}</span><small>{String(i+1).padStart(2,'0')}</small></button>)}</nav><article className="diary-paper" aria-busy={!!turn} inert={!!turn}>{content(visible)}</article>{turn && <div aria-hidden="true" inert className={`turning-sheet ${turn.to > turn.from ? 'turn-forward' : 'turn-back'}`}><div className="sheet-front">{content(turn.to > turn.from ? turn.from : turn.to, true)}<span className="attached-tab" style={{background: chapters[turn.to > turn.from ? turn.from : turn.to].color, top: `${58 + (turn.to > turn.from ? turn.from : turn.to)*76}px`}}>{chapters[turn.to > turn.from ? turn.from : turn.to].label}</span></div><div className="sheet-back"/></div>}</div><p className="desk-hint">오른쪽 인덱스를 눌러, 다음 이야기를 펼쳐보세요 <span>↗</span></p><span className="sr-only" role="status">{turn ? '페이지를 넘기는 중' : `${chapters[page].label} 페이지`}</span></main>;
}


