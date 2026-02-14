import React from "react";

interface StarRatingProps {
  rating: number;
  reviews?: number;
  showReviews?: boolean;
  className?: string;
  starSize?: string;
}

const formatReviews = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviews = 0,
  showReviews = true,
  className = "",
  starSize = "text-sm",
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center -space-x-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span
            key={`full-${i}`}
            className={`material-icons-outlined ${starSize} text-yellow-500`}
          >
            star
          </span>
        ))}
        {hasHalfStar && (
          <span
            className={`material-icons-outlined ${starSize} text-yellow-500`}
          >
            star_half
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span
            key={`empty-${i}`}
            className={`material-icons-outlined ${starSize} text-gray-200`}
          >
            star
          </span>
        ))}
      </div>
      {showReviews && (
        <div className="flex items-center gap-1 leading-none bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
          <span className="text-[11px] font-bold text-neutral-dark">
            {rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            ({formatReviews(reviews)})
          </span>
        </div>
      )}
    </div>
  );
};
