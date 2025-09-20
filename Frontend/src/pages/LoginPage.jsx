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
      // Show loading toast
      const loadingToast = toast.loading("Logging in...");
      
      const res = await api.post("/auth/login", { 
        email: trimmedEmail, 
        password: trimmedPassword 
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
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
    <div>
      <h2 className="heading-responsive text-center mb-6">Login</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="form-group">
          <label className="label">
            <span className="form-label">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            placeholder="Enter your email"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="label">
            <span className="form-label">Password</span>
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            placeholder="Enter your password"
            className="form-input"
          />
        </div>
        <button
          type="submit"
          className="btn-primary-full hover-scale"
                >
                  Login
                </button>
              </form>
              <div className="divider">OR</div>
              <p className="text-center">
                Don't have an account? {" "}
                <Link to="/register" className="link link-primary">
                  Register
                </Link>
              </p>
            </div>
          
  );
};

export default LoginPage;