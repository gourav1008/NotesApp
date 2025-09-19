import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import api from "../lib/axios";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { isAuthenticated, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                    placeholder="Enter your email"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    placeholder="Enter your password"
                    className="input input-bordered w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;