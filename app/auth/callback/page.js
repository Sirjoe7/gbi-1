"use client";

import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [message, setMessage] = useState("Completing sign-in…");
  const [returnTo, setReturnTo] = useState("/apply");

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const queryParams = new URLSearchParams(window.location.search);
    const value = (key) => hashParams.get(key) || queryParams.get(key);
    const code = queryParams.get("code");
    const accessToken = value("access_token");
    const refreshToken = value("refresh_token");
    const destination =
      sessionStorage.getItem("gbi-oauth-return-to") === "/admin"
        ? "/admin"
        : "/dashboard";
    setReturnTo(destination === "/admin" ? "/admin" : "/apply");

    async function completeSignIn() {
      if (value("error")) {
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem("gbi-oauth-code-verifier");
        sessionStorage.removeItem("gbi-oauth-return-to");
        setMessage(value("error_description") || "Google sign-in failed. Check the Supabase provider and redirect URL settings.");
        return;
      }

      try {
        let session;
        if (code) {
          window.history.replaceState({}, document.title, window.location.pathname);
          const codeVerifier = sessionStorage.getItem("gbi-oauth-code-verifier");
          if (!codeVerifier) throw new Error("The sign-in session expired. Please try signing in with Google again.");

          const configResponse = await fetch("/api/config");
          const config = await configResponse.json();
          if (!configResponse.ok) throw new Error(config.error || "Could not load authentication configuration.");

          const tokenResponse = await fetch(`${config.url}/auth/v1/token?grant_type=pkce`, {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: config.anonKey },
            body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
          });
          session = await tokenResponse.json();
          sessionStorage.removeItem("gbi-oauth-code-verifier");
          if (!tokenResponse.ok || !session.access_token || !session.refresh_token) {
            throw new Error(session.msg || session.message || "Google sign-in could not be completed. Please try again.");
          }
        } else if (accessToken && refreshToken) {
          session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: Number(value("expires_in") || 3600),
          };
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error("Google did not return a session. Check the Google provider configuration and Supabase redirect URLs.");
        }

        const expiresAt = session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600);
        localStorage.setItem(
          "gbi-auth-session",
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: expiresAt,
          }),
        );
        sessionStorage.removeItem("gbi-oauth-return-to");
        window.location.replace(destination);
      } catch (error) {
        sessionStorage.removeItem("gbi-oauth-code-verifier");
        sessionStorage.removeItem("gbi-oauth-return-to");
        setMessage(error.message);
      }
    }

    completeSignIn();
  }, []);

  return (
    <main className="wrap">
      <div className="card">
        <h1>Google sign-in</h1>
        <p role="status">{message}</p>
        <a className="btn" href={returnTo}>
          Return to {returnTo === "/admin" ? "staff" : "applicant"} sign in
        </a>
      </div>
    </main>
  );
}
