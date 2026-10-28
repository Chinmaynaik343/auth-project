
import React from "react";
import { createRoot } from "react-dom/client";
import {
  configureStore,
  createSlice
} from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("accessToken");

let initialUser = null;

try {
  initialUser = savedUser ? JSON.parse(savedUser) : null;
} catch {
  localStorage.removeItem("user");
  initialUser = null;
}

const initialState = {
  user: savedToken && initialUser ? initialUser : null,
  accessToken: savedToken && initialUser ? savedToken : null
};

if (!initialState.user || !initialState.accessToken) {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signupSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    }
  }
});

export const { signupSuccess, logout } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer
  }
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
