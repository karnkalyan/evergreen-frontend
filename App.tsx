import React, { useEffect } from 'react';
// 1. IMPORT CHANGE: Replace HashRouter with BrowserRouter
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'; 
import AOS from 'aos';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useMediaQuery } from './hooks/useMediaQuery';

// Main Site Components
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import BottomNavBar from './components/shared/BottomNavBar';
import Chatbot from './components/chatbot/Chatbot';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyPolicyPage from './pages/Privacy';
import ManufacturersPage from './pages/ManufacturersPage';
import OffersPage from './pages/OffersPage';
import ContactUsPage from './pages/ContactUsPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PromoCodesPage from './pages/PromoCodesPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';

// Account Section Components
import AccountLayout from './components/account/AccountLayout';
import AccountDashboardPage from './pages/account/DashboardPage';
import OrderHistoryPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import ProfilePage from './pages/account/ProfilePage';
import AddressesPage from './pages/account/AddressesPage';
import PaymentMethodsPage from './pages/account/PaymentMethodsPage';
import PrescriptionsPage from './pages/account/PrescriptionsPage';

// Admin Panel Components
import PrivateRoute from './components/admin/PrivateRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductListPage from './pages/admin/ProductListPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import OrderListPage from './pages/admin/OrderListPage';
import AdminOrderDetailPage from './pages/admin/OrderDetailPage';
import CustomerListPage from './pages/admin/CustomerListPage';
import CustomerDetailPage from './pages/admin/CustomerDetailPage';
import CategoryListPage from './pages/admin/CategoryListPage';
import BrandListPage from './pages/admin/BrandListPage';
import SettingsPage from './pages/admin/SettingsPage';
import StockControlPage from './pages/admin/inventory/StockControlPage';
import PurchaseOrderListPage from './pages/admin/inventory/PurchaseOrderListPage';
import PurchaseOrderDetailPage from './pages/admin/inventory/PurchaseOrderDetailPage';
import PurchaseOrderEditPage from './pages/admin/inventory/PurchaseOrderEditPage';
import PromotionsPage from './pages/admin/marketing/PromotionsPage';
import CouponsPage from './pages/admin/marketing/CouponsPage';
import BlogManagementPage from './pages/admin/content/BlogManagementPage';
import PageManagementPage from './pages/admin/content/PageManagementPage';
import MediaLibraryPage from './pages/admin/content/MediaLibraryPage';
import ReportsPage from './pages/admin/analytics/ReportsPage';
import UserManagementPage from './pages/admin/users/UserManagementPage';
import RolesManagement from './pages/admin/roles/RoleManagementPage';
import MedicineRequest from './pages/admin/MedicationRequestsPage';
import CustomerRoute from './components/shared/CustomerRoute';
import ContactRequest from './pages/admin/ContactRequestPage.tsx';
import AboutUsAdminPage from './components/admin/AboutUsAdminPage.tsx';
import UserProfilePage from './components/admin/ProfilePage.tsx';
import CountryAdminPage from './components/admin/CountryAdmin.tsx';
import TermsAndConditionsPage from './pages/TermsAndConditions.tsx';
import DisclaimerPage from './pages/Disclaimer.tsx';
import RefundPolicyPage from './pages/RefundPolicyPage.tsx';
import ShippingPolicyPage from './pages/ShippingPolicy.tsx';


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This is the correct logic for client-side scroll restoration
    // in both HashRouter and BrowserRouter environments
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout for the public-facing website
const MainLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        <Outlet />
      </main>
      {isMobile ? <BottomNavBar /> : <Footer />}
      <Chatbot />
    </div>
  );
};


const App: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <HelmetProvider>
      <AppProvider>
          <AuthProvider>
            <CartProvider>
            {/* 2. CHANGE: Use BrowserRouter */}
            <BrowserRouter> 
              <Toaster position="top-center" reverseOrder={false} />
              <ScrollToTop />
              <Routes>
              
              {/* --- Admin Panel Routes --- */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              {/* Admin Routes wrapped in PrivateRoute & AdminLayout */}
              <Route 
                path="/admin" 
                element={
              <PrivateRoute adminOnly={true}> {/* Add adminOnly prop */}
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductEditPage />} />
                <Route path="products/edit/:slug" element={<ProductEditPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="customers" element={<CustomerListPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="categories" element={<CategoryListPage />} />
                <Route path="brands" element={<BrandListPage />} />
                <Route path="inventory/stock" element={<StockControlPage />} />
                <Route path="inventory/purchases" element={<PurchaseOrderListPage />} />
                <Route path="inventory/purchases/new" element={<PurchaseOrderEditPage />} />
                <Route path="inventory/purchases/edit/:id" element={<PurchaseOrderEditPage />} />
                <Route path="inventory/purchases/:id" element={<PurchaseOrderDetailPage />} />
                <Route path="marketing/promotions" element={<PromotionsPage />} />
                <Route path="marketing/coupons" element={<CouponsPage />} />
                <Route path="content/blog" element={<BlogManagementPage />} />
                <Route path="content/pages" element={<PageManagementPage />} />
                <Route path="content/media" element={<MediaLibraryPage />} />
                <Route path="analytics/reports" element={<ReportsPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="roles" element={<RolesManagement />} />
                <Route path="medication-requests" element={<MedicineRequest />} />
                <Route path="contact-request" element={<ContactRequest />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="about-us" element={<AboutUsAdminPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="country" element={<CountryAdminPage />} />
              </Route>
              
              {/* --- Main Site Routes (Public and User Account) --- */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/promocodes" element={<PromoCodesPage />} />
                <Route path="/manufacturers" element={<ManufacturersPage />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
                
                {/* User Account Section */}
                {/* This uses nested routing for /account/* pages inside MainLayout */}
           <Route 
              path="/account" 
              element={
                <CustomerRoute>
                  <AccountLayout />
                </CustomerRoute>
              }
            >
              <Route index element={<AccountDashboardPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="addresses" element={<AddressesPage />} />
              {/* <Route path="payment-methods" element={<PaymentMethodsPage />} /> */}
              <Route path="prescriptions" element={<PrescriptionsPage />} />
            </Route>
              </Route>
              
              {/* Optional: Add a catch-all route for 404 pages */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>
          </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    </AppProvider>
    </HelmetProvider>
  );
};

export default App;