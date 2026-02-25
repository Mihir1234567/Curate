import React, { Suspense } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages (eagerly loaded for fast first paint)
import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Wishlist from "./pages/Wishlist";
import Feedback from "./pages/Feedback";
import FAQ from "./pages/FAQ";

// Admin Pages (lazy-loaded to reduce initial bundle)
const ProductManager = React.lazy(() => import("./pages/admin/ProductManager"));
const ProductForm = React.lazy(() => import("./pages/admin/ProductForm"));
const CategoryManager = React.lazy(
  () => import("./pages/admin/CategoryManager"),
);
const UnderConstruction = React.lazy(
  () => import("./pages/admin/UnderConstruction"),
);
const FeedbackManager = React.lazy(
  () => import("./pages/admin/FeedbackManager"),
);
const PinParser = React.lazy(() => import("./pages/admin/PinParser"));
import AdminLogin from "./pages/admin/AdminLogin";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { WishlistProvider } from "./lib/WishlistContext";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ui/ScrollToTopButton";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";

const AdminFallback = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <WishlistProvider>
          <Router>
            <ScrollToTop />
            <ScrollToTopButton />
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <PublicLayout>
                    <Home />
                  </PublicLayout>
                }
              />
              <Route
                path="/products"
                element={
                  <PublicLayout>
                    <ProductListing />
                  </PublicLayout>
                }
              />
              <Route
                path="/category/:category"
                element={
                  <PublicLayout>
                    <ProductListing />
                  </PublicLayout>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <PublicLayout>
                    <ProductDetail />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <About />
                  </PublicLayout>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <PublicLayout>
                    <Wishlist />
                  </PublicLayout>
                }
              />
              <Route
                path="/feedback"
                element={
                  <PublicLayout>
                    <Feedback />
                  </PublicLayout>
                }
              />
              <Route
                path="/faq"
                element={
                  <PublicLayout>
                    <FAQ />
                  </PublicLayout>
                }
              />
              {/* Admin Login (outside AdminLayout) */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLogin />
                  </Suspense>
                }
              />
              {/* Admin Routes (Nested to keep Layout mounted) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/admin/products" replace />}
                />
                <Route
                  path="products"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <ProductManager />
                    </Suspense>
                  }
                />
                <Route
                  path="products/new"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <ProductForm />
                    </Suspense>
                  }
                />
                <Route
                  path="products/edit/:id"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <ProductForm />
                    </Suspense>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <CategoryManager />
                    </Suspense>
                  }
                />
                <Route
                  path="feedback"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <FeedbackManager />
                    </Suspense>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <UnderConstruction title="Settings" />
                    </Suspense>
                  }
                />
                <Route
                  path="pin-parser"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <PinParser />
                    </Suspense>
                  }
                />
              </Route>
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </WishlistProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
};

export default App;
