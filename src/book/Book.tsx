import { useEffect, useState, type CSSProperties } from 'react';
import { Camera, LocateFixed, Route as RouteIcon, Sparkles, Stamp } from 'lucide-react';
import bookArt from '../assets/diary2.png';
import Chat from './Chat';
import { useBookStore, type ChapterId } from './store';
import Plan from './chapters/Plan';
import Route from './chapters/Route';
import Scrapbook from './chapters/Scrapbook';
import Passport from './chapters/Passport';
import Verify from './chapters/Verify';
import './book.css';

const chapters = [
  { id: 'plan', label: '계획', icon: Sparkles, color: '#a9d18e', Component: Plan },
  { id: 'route', label: '동선', icon: RouteIcon, color: '#8fc8e0', Component: Route },
  { id: 'scrap', label: '스크랩', icon: Camera, color: '#f2a7ad', Component: Scrapbook },
  { id: 'passport', label: '여권', icon: Stamp, color: '#b9a3dc', Component: Passport },
  { id: 'verify', label: '인증', icon: LocateFixed, color: '#f5b78a', Component: Verify },
] as const;

const indexOf = (id: string) => chapters.findIndex(c => c.id === id);
const fromHash = () => Math.max(0, indexOf(location.hash.slice(1)));

export default function Book() {
  const store = useBookStore();
  const [page, setPage] = useState(fromHash);

  const turnTo = (next: number) => {
    if (next === page) return;
    history.pushState(null, '', `#${chapters[next].id}`);
    setPage(next);
  };
  const go = (id: ChapterId) => turnTo(indexOf(id));

  // 브라우저 뒤로/앞으로 가기 지원
  useEffect(() => {
    const onPop = () => setPage(fromHash());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const { Component } = chapters[page];

  return (
    <main className="desk">
      <h1 className="sr-only">triplog 여행 다이어리 · {chapters[page].label}</h1>
      <div className="book">
        <nav className="book-tabs" aria-label="책갈피">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              className={`book-tab ${i === page ? 'on' : ''}`}
              style={{ '--tab': c.color, '--i': i } as CSSProperties}
              aria-current={i === page ? 'page' : undefined}
              onClick={() => turnTo(i)}
            >
              <c.icon size={14}/><span>{c.label}</span>
            </button>
          ))}
        </nav>
        <img className="book-art" src={bookArt} alt="" draggable={false}/>
        <div className="spread" key={page}>
          <Component store={store} go={go}/>
        </div>
      </div>
      <Chat store={store}/>
    </main>
  );
}
