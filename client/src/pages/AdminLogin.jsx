import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_TOKEN_KEY, authApi } from "../api/http";
import Logo from "../components/Logo";

// The email and password are checked by the server; nothing secret lives in this page.
const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const { data } = await authApi.login(form);
      if (data.role !== "admin") {
        setError("This account doesn't have admin access.");
        setStatus("idle");
        return;
      }
      window.localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      navigate("/admin-panel", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="grid min-h-screen place-items-center bg-masking px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex justify-center" aria-label="Garviks home">
          <Logo />
        </Link>
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-text">Staff login</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage products and orders.</p>

          <label className="mt-6 block">
            <span className="field-label">Email</span>
            <input className="input-field" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="username" required />
          </label>
          <label className="mt-4 block">
            <span className="field-label">Password</span>
            <input className="input-field" type="password" name="password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
          </label>

          {error && <p role="alert" className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <button type="submit" className="btn-dark mt-6 w-full" disabled={status === "loading"}>
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-white/60 hover:text-white">Back to the shop</Link>
      </div>
    </section>
  );
};

export default AdminLogin;
