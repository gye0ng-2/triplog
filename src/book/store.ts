import { useEffect, useState } from 'react';
import { defaultRequest, photos } from '../services/tripService';
import type { Trip, TripRequest } from '../types';

export type Stamp = { placeId: string; place: string; destination: string; at: string; lat: number; lng: number; accuracy: number };
export type CollageItem = { id: number; src: string; x: number; y: number; rotate: number; sticker?: boolean };

function load<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return valid(value) ? value : fallback;
  } catch { return fallback; }
}

function usePersisted<T>(key: string, fallback: T, valid: (v: unknown) => boolean) {
  const [value, setValue] = useState<T>(() => load(key, fallback, valid));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 불가 환경은 무시 */ } }, [key, value]);
  return [value, setValue] as const;
}

const isTrip = (v: unknown) => v === null || (!!v && typeof v === 'object' && 'destination' in v && Array.isArray((v as Trip).days));

/** 다이어리 전체에서 같이 쓰는 데이터. 챕터를 넘겨도 유지된다. */
export function useBookStore() {
  const [trip, setTrip] = usePersisted<Trip | null>('chorok-trip', null, isTrip);
  const [stamps, setStamps] = usePersisted<Stamp[]>('triplog-stamps', [], Array.isArray);
  const [name, setNameState] = useState(() => { try { return localStorage.getItem('triplog-name') || '여행자'; } catch { return '여행자'; } });
  const setName = (value: string) => { setNameState(value); try { localStorage.setItem('triplog-name', value); } catch { /* 무시 */ } };

  // 계획 폼과 스크랩북은 페이지를 넘겨도 작성 중인 내용이 남도록 여기서 보관
  const [request, setRequest] = useState<TripRequest>(trip?.request ?? defaultRequest);
  const [items, setItems] = useState<CollageItem[]>([
    { id: 1, src: photos.coast, x: 6, y: 20, rotate: -7 },
    { id: 2, src: photos.forest, x: 52, y: 30, rotate: 7 },
    { id: 3, src: '🌼', x: 74, y: 8, rotate: 10, sticker: true },
  ]);
  const [caption, setCaption] = useState('우리의 반짝이는 순간들');
  const [paper, setPaper] = useState('#fbf3ef');

  return { trip, setTrip, stamps, setStamps, name, setName, request, setRequest, items, setItems, caption, setCaption, paper, setPaper };
}

export type Store = ReturnType<typeof useBookStore>;
export type ChapterProps = { store: Store; go: (id: ChapterId) => void };
export type ChapterId = 'plan' | 'route' | 'scrap' | 'passport' | 'verify';
