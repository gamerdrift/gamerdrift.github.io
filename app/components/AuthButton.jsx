// components/AuthButton.jsx
import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import "./AuthButton.css";

export default function AuthButton() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // After login you might store user info or redirect – omitted for brevity.
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <button className="auth-button" onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}
