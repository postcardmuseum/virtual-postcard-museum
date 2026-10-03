"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const CURATOR_EMAIL = "virtualpostcardmuseum+curator@gmail.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [canReset, setCanReset] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;

      setCanReset(
        data.user?.email?.toLowerCase() === CURATOR_EMAIL.toLowerCase()
      );
      setChecking(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setCanReset(
        session?.user.email?.toLowerCase() === CURATOR_EMAIL.toLowerCase()
      );
      setChecking(false);
    });

    void checkUser();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sendRecoveryEmail() {
    setBusy(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      CURATOR_EMAIL,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setMessage(
      error
        ? `Could not send the email: ${error.message}`
        : "A new recovery email was sent. Open its link on this laptop."
    );
    setBusy(false);
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 12) {
      setMessage("Use a password of at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The two passwords do not match.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Password was not changed: ${error.message}`);
      setBusy(false);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    await supabase.auth.signOut();
    setFinished(true);
    setBusy(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f4e6c8",
        padding: 24,
        fontFamily: "Georgia, serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#553321",
          color: "#fff5df",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 12px 30px #0003",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#e6bf65" }}>
          Curator Password Reset
        </h1>

        {finished ? (
          <>
            <p>Your password has been changed.</p>
            <a href="/curator-login" style={{ color: "#e6bf65" }}>
              Return to Curator Login
            </a>
          </>
        ) : checking ? (
          <p>Checking your recovery link…</p>
        ) : canReset ? (
          <form onSubmit={changePassword}>
            <p>Enter a new password for the curator account.</p>

            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={12}
              style={{ width: "100%", padding: 10, margin: "8px 0 18px" }}
            />

            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={12}
              style={{ width: "100%", padding: 10, margin: "8px 0 18px" }}
            />

            <button type="submit" disabled={busy} style={{ padding: 12 }}>
              {busy ? "Saving…" : "Save New Password"}
            </button>
          </form>
        ) : (
          <>
            <p>Request a fresh recovery link for the curator account.</p>
            <button
              type="button"
              disabled={busy}
              onClick={sendRecoveryEmail}
              style={{ padding: 12 }}
            >
              {busy ? "Sending…" : "Send Recovery Email"}
            </button>
          </>
        )}

        {message && <p role="status">{message}</p>}
      </section>
    </main>
  );
}