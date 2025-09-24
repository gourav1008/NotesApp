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
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary via-secondary to-accent rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
            <span className="text-primary-content font-bold text-3xl">N</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-base-content mb-3 font-heading">Create Account</h1>
          <p className="text-base sm:text-lg text-base-content/70 max-w-sm mx-auto">Join our community and start managing your notes today</p>
        </div>

        {/* Register Form */}
        <div className="backdrop-blur-sm bg-base-100/90 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-base-content/5">
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="form-group">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  placeholder="Enter your full name"
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  autoComplete="name"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Email Address</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="Enter your email address"
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="Create a strong password"
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="label">
                  <span className="label-text font-semibold text-base-content/80">Confirm Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  placeholder="Confirm your password"
                  className="input input-bordered w-full bg-base-200/50 focus:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full gap-2 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                disabled={!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </button>
            </form>

            <div className="divider my-8 before:bg-base-content/10 after:bg-base-content/10">OR</div>

            <div className="text-center">
              <p className="text-base text-base-content/70 mb-4">
                Already have an account?
              </p>
              <Link 
                to="/login" 
                className="btn btn-outline w-full gap-2 py-3 text-lg font-semibold hover:bg-base-content/5 border-base-content/20 hover:border-base-content/30 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;