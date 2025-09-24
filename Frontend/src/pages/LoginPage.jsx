import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { isAuthenticated, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }

    // Check if user was redirected due to being blocked
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('blocked') === 'true') {
      toast.error('Your account has been blocked. Please contact support.', {
        duration: 6000,
        position: 'top-center'
      });
    }
  }, [isAuthenticated, navigate, location]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      // Show loading toast with custom styling
      // const loadingToast = toast.loading(
      //   "Signing you in...", 
      //   {
      //     icon: '🔄',
      //     style: {
      //       background: 'var(--base-100)',
      //       color: 'var(--base-content)',
      //       padding: '16px',
      //       borderRadius: '8px',
      //       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      //     }
      //   }
      // );

      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        password: trimmedPassword
      }).catch(error => {
        if (!error.response) {
          throw new Error('Unable to connect to the server. Please check if the server is running.');
        }
        throw error;
      });

      // Dismiss loading toast
      // toast.dismiss(loadingToast);

      if (!res.data || !res.data.token) {
        throw new Error("Invalid response from server");
      }

      // Store token in localStorage first
      localStorage.setItem("token", res.data.token);

      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      // Update auth state
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      // Clean up auth state
      localStorage.removeItem("token");
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: "AUTH_ERROR" });

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials and try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-content font-bold text-2xl">N</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-base-content mb-2">Welcome Back</h1>
        <p className="text-base sm:text-lg text-base-content/70">Sign in to your account to continue</p>
      </div>

      {/* Login Form */}
      <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300/50">
        <div className="card-body p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="form-group">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="Enter your email address"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                placeholder="Enter your password"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              disabled={!email.trim() || !password.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          </form>

          <div className="divider my-8 before:bg-base-content/10 after:bg-base-content/10">OR</div>

          <div className="text-center">
            <p className="text-base text-base-content/70 mb-4">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="btn btn-outline w-full gap-2 py-3 text-lg font-semibold hover:bg-base-content/5 border-base-content/20 hover:border-base-content/30 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;