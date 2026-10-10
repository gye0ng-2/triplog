export type View = 'home' | 'plan' | 'result' | 'map' | 'journal';
export interface TripRequest { destination: string; startDate: string; days: number; travelers: string; preferences: string; tags: string[] }
export interface Place { id: string; name: string; time: string; category: string; description: string; x: number; y: number; image: string }
export interface Trip { title: string; destination: string; days: Place[][]; request: TripRequest }
