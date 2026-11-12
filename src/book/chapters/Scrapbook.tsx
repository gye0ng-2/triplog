import { useRef, useState } from 'react';
import { Check, Download, ImagePlus, LoaderCircle, RotateCw, Trash2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import Page from '../Page';
import type { ChapterProps } from '../store';

const papers = ['#fbf3ef', '#e6efdf', '#f6e2e2', '#e3e6f3'];
const stickers = ['🌼', '🌿', '🍊', '☕', '🌰', '✈️', '🌈', '✨'];

export default function Scrapbook({ store }: ChapterProps) {
  const { items, setItems, caption, setCaption, paper, setPaper } = store;
  const [active, setActive] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState('');
  const canvas = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);

  const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
  const limits = (sticker?: boolean) => (sticker ? [88, 85] : [60, 55]);

  const upload = (files: FileList | null) => {
    Array.from(files ?? []).filter(f => f.type.startsWith('image/')).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setItems(prev => [...prev, { id: Date.now() + Math.random(), src: String(reader.result), x: 25, y: 25, rotate: -3 }]);
      reader.readAsDataURL(file);
    });
  };
  const save = async () => {
    if (!canvas.current) return;
    setActive(null); setExporting(true); setNotice('');
    try {
      await new Promise(r => setTimeout(r, 80));
      const link = document.createElement('a');
      link.download = 'triplog-스크랩북.png';
      link.href = await toPng(canvas.current, { pixelRatio: 3, cacheBust: true });
      link.click();
      setNotice('PNG로 저장했어요!');
    } catch { setNotice('저장하지 못했어요. 직접 올린 사진으로 다시 시도해주세요.'); }
    finally { setExporting(false); }
  };

  return <>
    <Page side="left" kicker="CHAPTER 03 · SCRAPBOOK" title="추억 꾸미기">
      <div className="tools">
        <label className="px-btn upload"><ImagePlus size={14}/> 내 사진 추가<input type="file" accept="image/*" multiple onChange={e => { upload(e.target.files); e.target.value = ''; }}/></label>
        <label>한 줄 기록<input maxLength={40} value={caption} onChange={e => setCaption(e.target.value)}/></label>
        <span className="tool-label">종이 색</span>
        <div className="swatches">{papers.map(c => <button key={c} aria-label={`종이 색 ${c}`} aria-pressed={paper === c} style={{ background: c }} onClick={() => setPaper(c)}>{paper === c && <Check size={13}/>}</button>)}</div>
        <span className="tool-label">스티커</span>
        <div className="stickers">{stickers.map(s => <button key={s} aria-label={`${s} 스티커 추가`} onClick={() => setItems([...items, { id: Date.now(), src: s, x: 40, y: 35, rotate: 0, sticker: true }])}>{s}</button>)}</div>
        <span className="tool-label">선택한 조각</span>
        <div className="btn-row">
          <button className="px-btn ghost" disabled={active === null} onClick={() => setItems(items.map(p => (p.id === active ? { ...p, rotate: p.rotate + 15 } : p)))}><RotateCw size={13}/> 회전</button>
          <button className="px-btn ghost" disabled={active === null} onClick={() => { setItems(items.filter(p => p.id !== active)); setActive(null); }}><Trash2 size={13}/> 삭제</button>
        </div>
        <button className="px-btn" onClick={save} disabled={exporting}>{exporting ? <LoaderCircle className="spin" size={14}/> : <Download size={14}/>} PNG로 저장</button>
        {notice && <p className="notice" role="status">{notice}</p>}
        <p className="fine">끌어서 옮기고, 선택 후 방향키로도 움직일 수 있어요. 사진은 내 브라우저에서만 쓰여요.</p>
      </div>
    </Page>
    <Page side="right">
      <div ref={canvas} className="collage" style={{ backgroundColor: paper }} onPointerDown={e => { if (e.target === e.currentTarget) setActive(null); }}>
        <h3>{caption}</h3>
        {items.map(p => (
          <div
            key={p.id} tabIndex={0} role="button"
            aria-label={p.sticker ? `${p.src} 스티커` : '사진: 드래그하거나 방향키로 이동'}
            className={`piece ${p.sticker ? 'sticker' : 'photo'} ${active === p.id ? 'on' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.rotate}deg)` }}
            onPointerDown={e => {
              e.preventDefault(); setActive(p.id);
              const r = canvas.current!.getBoundingClientRect();
              drag.current = { id: p.id, dx: e.clientX - r.left - (p.x / 100) * r.width, dy: e.clientY - r.top - (p.y / 100) * r.height };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={e => {
              if (drag.current?.id !== p.id) return;
              const r = canvas.current!.getBoundingClientRect(), [mx, my] = limits(p.sticker);
              const x = clamp(((e.clientX - r.left - drag.current.dx) / r.width) * 100, mx);
              const y = clamp(((e.clientY - r.top - drag.current.dy) / r.height) * 100, my);
              setItems(prev => prev.map(it => (it.id === p.id ? { ...it, x, y } : it)));
            }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
            onKeyDown={e => {
              const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
              if (!moves[e.key]) return;
              e.preventDefault(); setActive(p.id);
              const [dx, dy] = moves[e.key], [mx, my] = limits(p.sticker);
              setItems(items.map(it => (it.id === p.id ? { ...it, x: clamp(it.x + dx, mx), y: clamp(it.y + dy, my) } : it)));
            }}
          >
            {p.sticker ? p.src : <><img draggable={false} src={p.src} alt="" crossOrigin="anonymous"/><span>a moment ♡</span></>}
          </div>
        ))}
        <span className="collage-brand">triplog 🌰</span>
      </div>
    </Page>
  </>;
}
