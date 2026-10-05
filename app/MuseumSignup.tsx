"use client";

import { useState, type FormEvent } from "react";

export default function MuseumSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.error || "Could not save your signup. Please try again."
        );
      }

      setSuccess(true);
      setMessage("Thank you! You’re on the museum’s updates list.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your signup. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={subscribe}
      style={{
        maxWidth: "560px",
        margin: "30px auto 0",
        textAlign: "left",
      }}
    >
      <label htmlFor="museum-friend-email">
        Your email address
      </label>

      <input
        id="museum-friend-email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={busy}
        placeholder="you@example.com"
        style={{
          boxSizing: "border-box",
          width: "100%",
          marginTop: "8px",
          padding: "14px",
          border: "1px solid #d6b77c",
          borderRadius: "6px",
          background: "#fffaf1",
          color: "#44211f",
          fontSize: "16px",
        }}
      />

      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="museum-friend-website">Website</label>
        <input
          id="museum-friend-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <label
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          marginTop: "18px",
          fontSize: "15px",
          lineHeight: "1.5",
        }}
      >
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={busy}
          style={{ marginTop: "5px" }}
        />
        <span>
          I agree to receive email updates from The Virtual
          Postcard Museum.
        </span>
      </label>

      <button
        type="submit"
        disabled={busy}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "14px",
          border: "1px solid #e6cb91",
          borderRadius: "6px",
          background: "#c79a3b",
          color: "#281b12",
          fontFamily: "Georgia, serif",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Saving…" : "Become a Museum Friend"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#ead8cc",
        }}
      >
        Your email stays private. To leave the list, contact{" "}
        <a
          href="mailto:curator@virtualpostcardmuseum.org?subject=Unsubscribe"
          style={{ color: "#f8df9c" }}
        >
          the curator
        </a>.
      </p>

      <p
        role={success ? "status" : "alert"}
        aria-live="polite"
        style={{
          textAlign: "center",
          color: "#f8df9c",
          lineHeight: "1.5",
        }}
      >
        {message}
      </p>
    </form>
  );
}