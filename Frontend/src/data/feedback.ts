import { Feedback } from "../types/feedback";

export const mockFeedback: Feedback[] = [
  {
    _id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    message:
      "Great selection of products! I really accept the minimalist vibe.",
    rating: 5,
    category: "General",
    status: "new",
    createdAt: "2024-03-10T10:00:00Z",
  },

  {
    _id: "3",
    name: "Charlie Davis",
    email: "charlie@example.com",
    message: "I would love to see more kitchenware items.",
    rating: 3,
    category: "Feature Request",
    status: "new",
    createdAt: "2024-03-08T09:15:00Z",
  },
  {
    _id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    message: "The website is very easy to navigate.",
    rating: 5,
    category: "General",
    status: "reviewed",
    createdAt: "2024-03-05T16:45:00Z",
  },
  {
    _id: "5",
    name: "Evan Wright",
    email: "evan@example.com",
    message: "Found a bug on the checkout page.",
    rating: 2,
    category: "Bug Report",
    status: "new",
    createdAt: "2024-03-01T11:20:00Z",
  },
];
