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
    <div>
      <h2 className="heading-responsive text-center mb-6">Register</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="form-group">
          <label className="label">
            <span className="form-label">Name</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            placeholder="Enter your name"
            className="form-input"
          />
        </div>
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
        <div className="form-group">
          <label className="label">
            <span className="form-label">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            required
            placeholder="Confirm your password"
            className="form-input"
          />
        </div>
        <button
          type="submit"
          className="btn-primary-full hover-scale"
                >
                  Register
                </button>
              </form>
              <div className="divider">OR</div>
              <p className="text-center">
                Already have an account? {" "}
                <Link to="/login" className="link link-primary">
                  Login
                </Link>
              </p>
            </div>
  );
};

export default RegisterPage;