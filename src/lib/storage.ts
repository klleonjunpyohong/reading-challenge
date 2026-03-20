import { Book } from './database.types';

const BOOKS_KEY = 'reading-challenge-books';
const START_DATE_KEY = 'reading-challenge-start-date';
const PROFILE_KEY = 'reading-challenge-profile';

export interface ChallengeProfile {
  name: string;
  motto: string;
  goals: string[];
  startDate: string;
}

export function getProfile(): ChallengeProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: ChallengeProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  // Also update the start date
  localStorage.setItem('reading-challenge-start-date', profile.startDate);
}

export function hasProfile(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PROFILE_KEY);
}

export function getBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBooks(books: Book[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function getStartDate(): string {
  if (typeof window === 'undefined') return new Date().toISOString().split('T')[0];
  const date = localStorage.getItem(START_DATE_KEY);
  if (!date) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(START_DATE_KEY, today);
    return today;
  }
  return date;
}

export function setStartDate(date: string) {
  localStorage.setItem(START_DATE_KEY, date);
}

const CHALLENGE_KEY = 'reading-challenge-type';

export type ChallengeType = '100days_33books' | '365days_100expert';

export function getChallengeType(): ChallengeType {
  if (typeof window === 'undefined') return '100days_33books';
  return (localStorage.getItem(CHALLENGE_KEY) as ChallengeType) || '100days_33books';
}

export function setChallengeType(type: ChallengeType) {
  localStorage.setItem(CHALLENGE_KEY, type);
}

const ARCHIVE_KEY = 'reading-challenge-archive';

export function archiveCurrentChallenge(books: any[], profile: any) {
  const archives = getArchives();
  archives.push({
    type: getChallengeType(),
    books,
    profile,
    completedAt: new Date().toISOString(),
  });
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives));
}

export function getArchives(): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ARCHIVE_KEY);
  return data ? JSON.parse(data) : [];
}

export function calculateStreak(books: any[]): number {
  const dates = new Set<string>();
  books.forEach(b => {
    if (b.created_at) dates.add(b.created_at.split('T')[0]);
    if (b.started_at) dates.add(b.started_at);
    if (b.completed_at) dates.add(b.completed_at);
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (dates.has(dateStr)) streak++;
    else break;
  }
  return streak;
}

export function calculateSeason(startDate: string, challengeDays: number): { season: number; seasonName: string; dayInSeason: number; seasonDays: number } {
  const start = new Date(startDate);
  const now = new Date();
  const elapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
  const seasonLength = Math.floor(challengeDays / 4);
  const season = Math.min(4, Math.floor(elapsed / seasonLength) + 1);
  const dayInSeason = elapsed % seasonLength;
  const names = ['기초의 시작', '성장의 가속', '깊이의 확장', '완성의 여정'];
  return { season, seasonName: names[season - 1] || names[3], dayInSeason, seasonDays: seasonLength };
}
