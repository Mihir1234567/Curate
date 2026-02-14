export interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number; // 1-5
  category?: string; // e.g., "Health", "Feature Request", "General"
  status: "new" | "reviewed";
  createdAt: string; // ISO date string
}
