export interface Profile {
  id: string;
  email: string;
  start_date: string;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  category: string;
  status: 'not_started' | 'reading' | 'completed';
  cover_url: string;
  note: string;
  book_type: 'paper' | 'ebook' | 'audio';
  goal: string;
  rating: number;
  keywords: string[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
