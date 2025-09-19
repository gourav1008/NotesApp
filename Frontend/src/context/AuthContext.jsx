import React, { createContext, useReducer, useEffect } from "react";
import api from "../lib/axios";

const initialState = {
  user: null,
  token: null,  // Don't load from localStorage here
  isAuthenticated: false,
  loading: true,
};

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      try {
        // Set token in axios headers first
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        localStorage.setItem("token", action.payload.token);
        
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
        };
      } catch (error) {
        console.error("Error during login success:", error);
        // Clean up on error
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem("token");
        return {
          ...state,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        };
      }
    case "USER_LOADED":
      try {
        // Ensure token is in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        localStorage.setItem("token", action.payload.token);
        
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          loading: false,
        };
      } catch (error) {
        console.error("Error during user load:", error);
        // Clean up on error
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem("token");
        return {
          ...state,
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        };
      }
    case "AUTH_ERROR":
    case "LOGOUT":
      try {
        // Clean up auth state
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem("token");
      } catch (error) {
        console.error("Error during auth cleanup:", error);
      }
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          dispatch({ type: "AUTH_ERROR" });
          return;
        }

        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const res = await api.get("/auth/me");
        if (res.data?.user) {
          dispatch({ type: "USER_LOADED", payload: { user: res.data.user, token } });
        } else {
          console.error("Invalid user data received:", res.data);
          dispatch({ type: "AUTH_ERROR" });
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        dispatch({ type: "AUTH_ERROR" });
        
        // Clear invalid token
        try {
          localStorage.removeItem("token");
          delete api.defaults.headers.common['Authorization'];
        } catch (error) {
          console.error("Error cleaning up auth state:", error);
        }
      }
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;