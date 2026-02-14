import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { logError } from "../../lib/logger";
import { Feedback } from "../../types/feedback";
import { Button } from "../../components/ui/Button";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const FeedbackManager: React.FC = () => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"new" | "reviewed" | "all">(
    "all",
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  // Sort and Pagination State
  const [sortBy, setSortBy] = useState<
    "date-desc" | "date-asc" | "rating-desc" | "rating-asc"
  >("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadFeedback();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRating, filterStatus, filterCategory, searchQuery, sortBy]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback();
      setFeedbacks(data);
    } catch (err) {
      logError("Failed to load feedback", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: "new" | "reviewed") => {
    try {
      await api.updateFeedbackStatus(id, status);
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status } : f)),
      );
      showToast(`Feedback marked as ${status}`, "success");
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      logError("Failed to update status", err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Feedback",
      message:
        "Are you sure you want to delete this feedback? This action cannot be undone.",
      confirmLabel: "Delete",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      await api.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      showToast("Feedback deleted successfully", "success");
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback(null);
      }
    } catch (err) {
      logError("Failed to delete feedback", err);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const ratingMatch =
      filterRating === "all" || f.rating === Number(filterRating);
    const statusMatch = filterStatus === "all" || f.status === filterStatus;
    const categoryMatch =
      filterCategory === "all" || f.category === filterCategory;

    const term = searchQuery.toLowerCase();
    const searchMatch =
      !searchQuery ||
      f.name.toLowerCase().includes(term) ||
      f.email.toLowerCase().includes(term) ||
      f.message.toLowerCase().includes(term) ||
      formatDate(f.createdAt).includes(term);

    return ratingMatch && statusMatch && categoryMatch && searchMatch;
  });

  // Sorting Logic
  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "date-asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "rating-desc") {
      return b.rating - a.rating;
    } else if (sortBy === "rating-asc") {
      return a.rating - b.rating;
    }
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = sortedFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const uniqueCategories = Array.from(
    new Set(feedbacks.map((f) => f.category || "General")),
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark mb-1">
            Feedback
          </h1>
          <p className="text-gray-500">Manage user feedback and reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
            Total: {feedbacks.length}
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 text-sm font-medium text-primary shadow-sm">
            New: {feedbacks.filter((f) => f.status === "new").length}
          </div>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 group relative">
            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, message or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border-gray-200 border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <span className="material-icons-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* SortBy */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                sort
              </span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "date-desc"
                      | "date-asc"
                      | "rating-desc"
                      | "rating-asc",
                  )
                }
                className="w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
              </select>
              <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Rating Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                star_outline
              </span>
              <select
                value={filterRating}
                onChange={(e) =>
                  setFilterRating(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                fact_check
              </span>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as "new" | "reviewed" | "all")
                }
                className="w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">New Inbox</option>
                <option value="reviewed">Reviewed</option>
              </select>
              <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Category Filter */}
            <div className="relative flex-1 sm:flex-initial">
              <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                folder_open
              </span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Reset Button (Optional) */}
            {(searchQuery ||
              filterRating !== "all" ||
              filterStatus !== "all" ||
              filterCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterRating("all");
                  setFilterStatus("all");
                  setFilterCategory("all");
                  setSortBy("date-desc");
                }}
                className="px-4 py-3.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="p-20 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
          <span className="material-icons-outlined text-6xl text-gray-300 mb-4">
            inbox
          </span>
          <p className="text-xl text-gray-500 font-medium">No feedback found</p>
          <p className="text-gray-400 mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedFeedbacks.map((f) => (
            <div
              key={f._id}
              className={`group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                f.status === "new"
                  ? "border-l-4 border-l-primary border-y-gray-100 border-r-gray-100"
                  : "border-gray-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      f.status === "new"
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getInitials(f.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-dark text-sm">
                      {f.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {formatDate(f.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`material-icons-outlined text-base ${i < f.rating ? "text-yellow-400" : "text-gray-200"}`}
                    >
                      {i < f.rating ? "star" : "star_border"}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <span className="inline-block px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-[10px] uppercase font-bold tracking-wider mb-2">
                  {f.category}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  "{f.message}"
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    f.status === "new"
                      ? "bg-primary/10 text-primary"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {f.status.toUpperCase()}
                </span>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if (f.category === "General" && f.status === "new") {
                        handleStatusUpdate(f._id, "reviewed");
                        setSelectedFeedback({ ...f, status: "reviewed" });
                      } else {
                        setSelectedFeedback(f);
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"
                    title="View Details"
                  >
                    <span className="material-icons-outlined text-lg">
                      visibility
                    </span>
                  </button>
                  {f.status === "new" && (
                    <button
                      onClick={() => handleStatusUpdate(f._id, "reviewed")}
                      className="p-2 hover:bg-green-50 rounded-full text-gray-500 hover:text-green-600 transition-colors"
                      title="Mark as Reviewed"
                    >
                      <span className="material-icons-outlined text-lg">
                        check_circle
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(f._id)}
                    className="p-2 hover:bg-red-50 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <span className="material-icons-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-white border-gray-200"
          >
            <span className="material-icons-outlined text-sm mr-1">
              chevron_left
            </span>{" "}
            Previous
          </Button>
          <span className="text-sm font-medium text-gray-500 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-white border-gray-200"
          >
            Next{" "}
            <span className="material-icons-outlined text-sm ml-1">
              chevron_right
            </span>
          </Button>
        </div>
      )}

      {/* Enhanced Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-neutral-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden scale-100 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-neutral-dark">
                Feedback Details
              </h2>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {getInitials(selectedFeedback.name)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-neutral-dark">
                    {selectedFeedback.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {selectedFeedback.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedFeedback.status === "new"
                        ? "bg-primary/10 text-primary"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {selectedFeedback.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Rating & Category */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-500">
                    Rating:
                  </span>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`material-icons-outlined text-lg ${i < selectedFeedback.rating ? "text-yellow-400" : "text-gray-200"}`}
                      >
                        {i < selectedFeedback.rating ? "star" : "star_border"}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                  {selectedFeedback.category}
                </span>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Message
                </label>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-gray-700 italic leading-relaxed relative">
                  <span className="material-icons-outlined absolute top-4 left-3 text-gray-300 text-2xl -translate-y-1">
                    format_quote
                  </span>
                  <p className="pl-6">{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Close
                </Button>

                {selectedFeedback.status === "new" ? (
                  <Button
                    onClick={() =>
                      handleStatusUpdate(selectedFeedback._id, "reviewed")
                    }
                  >
                    Mark as Reviewed
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      handleStatusUpdate(selectedFeedback._id, "new")
                    }
                    variant="outline"
                  >
                    Mark as New
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
