"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../california/lib/supabase";

export default function CuratorLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();

    setMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Welcome, Curator!");
    router.push("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5e6c8",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Georgia, serif",
      }}
    >
      <form
        onSubmit={signIn}
        style={{
          width: "450px",
          background: "#5d3421",
          color: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 15px 35px rgba(0,0,0,.3)",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            color: "#e7c16b",
            letterSpacing: "2px",
          }}
        >
          CURATOR'S OFFICE
        </h3>

        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Museum Login
        </h1>

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            background: "#fff8e8",
color: "#3b2418",
border: "1px solid #c79a3b",
borderRadius: "6px",
boxSizing: "border-box",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
          }}
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            background: "#fff8e8",
color: "#3b2418",
border: "1px solid #c79a3b",
borderRadius: "6px",
boxSizing: "border-box",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "25px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "15px",
            background: "#c79a3b",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            borderRadius: "8px",
          }}
        >
          Enter Curator's Office
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#f8df9c",
          }}
        >
          {message}
        </p>
      </form>
    </main>
  );
}