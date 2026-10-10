import type { Place, Trip, TripRequest } from '../types';
export const photos = {
  coast: 'https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?auto=format&fit=crop&w=1000&q=85',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85',
  cafe: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=700&q=85',
  ocean: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=85',
};
const places: Place[] = [
  { id: 'p1', name: '함덕 해수욕장', time: '09:30', category: '바다 산책', description: '에메랄드빛 바다를 따라 천천히 걷는 아침', x: 72, y: 26, image: photos.coast },
  { id: 'p2', name: '동백동산', time: '11:30', category: '숲과 자연', description: '초록 숲길에서 만나는 제주의 고요한 순간', x: 60, y: 43, image: photos.forest },
  { id: 'p3', name: '작은 숲 카페', time: '14:00', category: '감성 카페', description: '향긋한 커피와 함께 쉬어가는 오후 · 예시 장소', x: 44, y: 35, image: photos.cafe },
  { id: 'p4', name: '김녕 해변', time: '16:30', category: '노을 감상', description: '하루의 끝에 남기는 따뜻한 바다의 색', x: 81, y: 47, image: photos.ocean },
];
export const defaultRequest: TripRequest = { destination: '제주', startDate: '2026-10-24', days: 3, travelers: '친구와 둘이', preferences: '복잡한 관광지보다는 조용한 바다와 숲이 좋아요. 예쁜 카페에서 쉬고, 여유롭게 사진도 찍고 싶어요.', tags: ['자연과 힐링', '감성 카페'] };
export function makeTrip(request: TripRequest): Trip {
  const isJeju = /제주/.test(request.destination);
  return { title: `${request.destination}, 초록을 따라 쉬어가는 여행`, destination: request.destination, request, days: Array.from({ length: request.days }, (_, day) => places.map((p, i) => ({ ...p, id: `${day}-${p.id}`, name: isJeju ? p.name : [`${request.destination} 바닷길`, `${request.destination} 숲 산책`, '작은 숲 카페', `${request.destination} 노을 명소`][i], time: day === 0 ? p.time : ['10:00', '12:00', '14:30', '17:00'][i] }))) };
}
// REST 연동 시 구현을 fetch(`${API_BASE_URL}/api/trips/recommend`, ...)로 교체합니다.
export const tripService = { recommend: async (request: TripRequest): Promise<Trip> => { await new Promise(resolve => setTimeout(resolve, 850)); return makeTrip(request); } };
