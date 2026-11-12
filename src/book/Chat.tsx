import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import Squirrel from './Squirrel';
import { chatService, type ChatMessage } from '../services/chatService';
import type { Store } from './store';

export default function Chat({ store }: { store: Store }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: '안녕! 여행 얘기라면 뭐든 물어봐' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const history = [...messages, { role: 'user' as const, text }];
    setMessages(history); setInput(''); setBusy(true);
    try { setMessages([...history, { role: 'assistant', text: await chatService.reply(history, store.trip) }]); }
    catch { setMessages([...history, { role: 'assistant', text: '앗, 지금은 대답할 수 없어… 잠시 후 다시 말 걸어줘!' }]); }
    finally { setBusy(false); }
  };

  return (
    <section className="chat" aria-label="다람쥐 챗봇">
      <div className="chat-squirrel"><Squirrel size={64} talking={busy}/></div>
      <div className="chat-box">
        <div className="chat-log" ref={log} aria-live="polite">
          {messages.map((m, i) => <p key={i} className={`msg ${m.role}`}>{m.text}</p>)}
          {busy && <p className="msg assistant typing" aria-label="다람쥐가 입력 중"><i/><i/><i/></p>}
        </div>
        <form className="chat-input" onSubmit={send}>
          <input value={input} maxLength={300} placeholder="다람쥐에게 말 걸기…" aria-label="메시지" onChange={e => setInput(e.target.value)}/>
          <button className="px-btn" disabled={busy || !input.trim()} aria-label="보내기"><Send size={15}/></button>
        </form>
      </div>
    </section>
  );
}
