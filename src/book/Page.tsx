import type { ReactNode } from 'react';

/** 펼친 책의 왼쪽/오른쪽 한 장 */
export default function Page({ side, kicker, title, children }: { side: 'left' | 'right'; kicker?: string; title?: string; children: ReactNode }) {
  return (
    <section className={`page page-${side}`}>
      {(kicker || title) && (
        <header className="page-head">
          {kicker && <span className="kicker">{kicker}</span>}
          {title && <h2>{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}
