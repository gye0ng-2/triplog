import type { Trip } from '../types';

export type ChatMessage = { role: 'user' | 'assistant'; text: string };

/**
 * 다람쥐 챗봇 응답.
 * 지금은 AI 연결 전이라 간단한 규칙으로 답한다.
 * AI를 붙일 때는 API 키를 브라우저에 두지 말고, 키를 가진 서버 엔드포인트로 fetch 하도록 이 함수만 교체하면 된다.
 *   예) const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ history, trip }) });
 */
export const chatService = {
  async reply(history: ChatMessage[], trip: Trip | null): Promise<string> {
    await new Promise(r => setTimeout(r, 650 + Math.random() * 500));
    const q = history[history.length - 1]?.text ?? '';
    if (/안녕|하이|hello|hi/i.test(q)) return '안녕! 나는 이 다이어리를 지키는 다람쥐야!';
    if (/추천|어디|계획|일정/.test(q)) return trip
      ? `${trip.destination} 여행을 계획 중이구나! ‘계획’ 탭에서 일정을, ‘동선’ 탭에서 순서를 다듬을 수 있어.`
      : '오른쪽 ‘계획’ 책갈피를 눌러서 가고 싶은 곳을 적어줘! 일정을 그려줄게.';
    if (/동선|순서|경로/.test(q)) return '‘동선’ 탭에서 ‘최적 동선 정렬’을 누르면 가까운 곳부터 차례로 정리해줘!';
    if (/스탬프|인증|여권|gps/i.test(q)) return '장소에 도착하면 ‘인증’ 탭에서 꾹 눌러줘. 스탬프는 ‘여권’에 차곡차곡 모여!';
    if (/사진|스크랩|꾸미/.test(q)) return '‘스크랩’ 탭에서 사진이랑 스티커로 예쁘게 꾸미고 PNG로 저장할 수 있어!';
    if (/도토리/.test(q)) return '도토리!? 어디어디? 👀';
    return '음… 아직 AI랑 연결되기 전이라 잘 모르겠어. 곧 더 똑똑해질게!';
  },
};
