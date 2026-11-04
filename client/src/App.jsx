import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ADMIN_TOKEN_KEY, authApi } from "./api/http";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToHash from "./components/ScrollToHash";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminPannel from "./pages/AdminPannel";
import Cart from "./pages/Cart";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";

const readToken = () => {
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Only lets admins in; the server checks the token on every request too.
const AdminRoute = ({ children }) => {
  const token = readToken();
  const [state, setState] = useState(token ? "checking" : "denied");

  useEffect(() => {
    if (!token) return;
    authApi
      .me()
      .then((response) => setState(response.data?.role === "admin" ? "allowed" : "denied"))
      .catch(() => setState("denied"));
  }, [token]);

  if (state === "checking") return <p className="p-10 text-center text-muted">Checking your login…</p>;
  if (state === "denied") return <Navigate to="/admin-login" replace />;
  return children;
};

const App = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <ScrollToHash />
      <main className="min-h-[60vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin-panel"
            element={
              <AdminRoute>
                <AdminPannel />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
};

export default App;
