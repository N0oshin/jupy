import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './lib/CartContext.tsx'
import { AuthProvider } from './lib/AuthContext.tsx'

// Code-split secondary routes so the landing page ships the smallest possible
// initial bundle. The homepage (App) stays eager to protect its LCP.
const Shop = lazy(() => import('./pages/Shop.tsx'))
const ProductDetail = lazy(() => import('./pages/ProductDetail.tsx'))
const Cart = lazy(() => import('./pages/Cart.tsx'))
const Checkout = lazy(() => import('./pages/Checkout.tsx'))
const OrderTracking = lazy(() => import('./pages/OrderTracking.tsx'))
const PaymentCapture = lazy(() => import('./pages/PaymentCapture.tsx'))
const MyOrders = lazy(() => import('./pages/MyOrders.tsx'))
const SignIn = lazy(() => import('./pages/SignIn.tsx'))
const Register = lazy(() => import('./pages/Register.tsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx'))
const Contact = lazy(() => import('./pages/Contact.tsx'))
const AboutUs = lazy(() => import('./pages/AboutUs.tsx'))
const PressRelease = lazy(() => import('./pages/PressRelease.tsx'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy.tsx'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy.tsx'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.tsx'))
const TermsOfService = lazy(() => import('./pages/TermsOfService.tsx'))

/**
 * Reset scroll position on route change.
 *
 * BrowserRouter does not do this, so following a footer/CTA link from halfway
 * down one page dropped the visitor halfway down the next one. Hash navigations
 * (/#about) are skipped — Navbar's own effect scrolls those to their section.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function RouteFallback() {
  return (
    <div
      className="grid min-h-screen place-items-center bg-bg"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent-dark" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-full bg-accent-dark px-5 py-3 text-sm text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/products" element={<Shop />} />
              {/* The catalogue used to live at /shop. It is in the published
                  sitemap and may have external links, so the old path stays as a
                  permanent client-side redirect rather than becoming a 404. */}
              <Route path="/shop" element={<Navigate to="/products" replace />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track" element={<OrderTracking />} />
              <Route path="/track/:orderNumber" element={<OrderTracking />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/payment-capture/:token" element={<PaymentCapture />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/press-release" element={<PressRelease />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
