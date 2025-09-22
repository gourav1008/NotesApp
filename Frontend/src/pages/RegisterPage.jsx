import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const { isAuthenticated, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { name, email, password, confirmPassword } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // Clear any existing token before registration
      localStorage.removeItem('token');
      
      const response = await api.post("/auth/register", { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password 
      });

      if (response.data && response.data.token) {
        // Store token first
        localStorage.setItem('token', response.data.token);
        // Then update state
        dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
        toast.success("Registration successful! Welcome to your notes.");
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Registration error:", error);
      dispatch({ type: "AUTH_ERROR" });
      
      // Clear any existing token
      localStorage.removeItem('token');
      
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-base-content mb-2">Create Account</h1>
        <p className="text-base sm:text-lg text-base-content/70">Sign up to start managing your notes</p>
      </div>

      {/* Register Form */}
      <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 border border-base-300/50">
        <div className="card-body p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="form-group">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                required
                placeholder="Enter your full name"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200"
                autoComplete="name"
                autoFocus
              />
            </div>

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
                placeholder="Create a password"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                required
                placeholder="Confirm your password"
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100 transition-all duration-200"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              disabled={!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </button>
          </form>

          <div className="divider my-6">OR</div>

          <div className="text-center">
            <p className="text-sm sm:text-base text-base-content/70 mb-2">
              Already have an account?
            </p>
            <Link 
              to="/login" 
              className="btn btn-outline w-full gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;