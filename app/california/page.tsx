"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type CaliforniaPostcard = {
  id: number;
  title: string | null;
  city: string | null;
  state: string | null;
  postcard_date: string | null;
  description: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  display_rotation: number | null;
  night_display: "off" | "subtle" | "neon" | null;
};

export default function CaliforniaPage() {
  const [featuredPostcard, setFeaturedPostcard] =
    useState<CaliforniaPostcard | null>(null);
  const [californiaPostcards, setCaliforniaPostcards] =
    useState<CaliforniaPostcard[]>([]);
  const [showBack, setShowBack] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);
  const [featuredIsPortrait, setFeaturedIsPortrait] = useState(false);

  useEffect(() => {
    async function loadCaliforniaPostcards() {
      const featuredQuery = supabase
        .from("postcards")
        .select(
          "id, title, city, state, postcard_date, description, front_image_url, back_image_url, display_rotation, night_display"
        )
        .eq("status", "Published")
        .or("state.ilike.%California%,gallery.ilike.%California%")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const allCaliforniaQuery = supabase
        .from("postcards")
        .select(
          "id, title, city, state, postcard_date, description, front_image_url, back_image_url, display_rotation, night_display"
        )
        .eq("status", "Published")
        .or("state.ilike.%California%,gallery.ilike.%California%")
        .order("created_at", { ascending: false });

      const [
        { data: featuredData, error: featuredError },
        { data: allCaliforniaData, error: allCaliforniaError },
      ] = await Promise.all([featuredQuery, allCaliforniaQuery]);

      if (featuredError) {
        console.error(
          "Could not load featured California postcard:",
          featuredError.message
        );
      } else if (featuredData) {
        setFeaturedPostcard(featuredData as CaliforniaPostcard);
      }

      if (allCaliforniaError) {
        console.error(
          "Could not load California collection:",
          allCaliforniaError.message
        );
        setCaliforniaPostcards([]);
      } else {
        setCaliforniaPostcards(
          (allCaliforniaData as CaliforniaPostcard[]) || []
        );
      }
    }

    void loadCaliforniaPostcards();
  }, []);

  const californiaNightDisplay =
    featuredPostcard?.night_display?.toLowerCase() || "off";

  return (
    <main className="california-page">
      <style>{`
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }

        .california-page {
          min-height: 100vh;
          margin: 0;
          color: #2e241b;
          font-family: Georgia, "Times New Roman", serif;
          background: linear-gradient(180deg,#17131a 0%,#32202d 18%,#a9553b 35%,#efd3a4 35%,#fbf6ed 100%);
        }

        .california-hero {
          position: relative;
          overflow: hidden;
          min-height: 340px;
          isolation: isolate;
          color: #fff7e8;
          background: linear-gradient(180deg,#120f20 0%,#33203d 24%,#7f3e43 50%,#d77745 74%,#f2bb68 100%);
          border-bottom: 3px solid #a96e33;
        }

        .california-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -5;
          background: radial-gradient(circle at 50% 72%,rgba(255,221,139,.92) 0%,rgba(255,151,73,.50) 20%,rgba(150,62,68,.20) 45%,transparent 68%);
        }

        .california-hero::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 72px;
          z-index: -1;
          background: linear-gradient(to top,#1d171d 0 38%,transparent 39%),linear-gradient(135deg,transparent 0 10%,rgba(30,23,29,.78) 10% 18%,transparent 18% 24%,rgba(30,23,29,.78) 24% 31%,transparent 31% 43%,rgba(30,23,29,.78) 43% 51%,transparent 51% 64%,rgba(30,23,29,.78) 64% 73%,transparent 73% 84%,rgba(30,23,29,.78) 84% 92%,transparent 92%);
          opacity: .82;
        }

        .museum-nav {
          max-width: 1180px;
          margin: 0 auto;
          padding: 14px 22px 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,220,159,.34);
          position: relative;
          z-index: 5;
        }

        .museum-nav a { color: #fff5e3; text-decoration: none; }
        .museum-nav .entrance-link { color: #f3cb7c; letter-spacing: 1.4px; text-transform: uppercase; font-size: 14px; }
        .museum-nav-links { display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px; }

        .hero-center {
          position: relative;
          z-index: 4;
          max-width: 980px;
          margin: 0 auto;
          padding: 8px 180px 10px;
          text-align: center;
        }

        .museum-name {
          margin: 0 0 8px;
          color: #f4cb7b;
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: bold;
        }

        .hero-title-frame {
          max-width: 760px;
          margin: 0 auto;
          padding: 10px 24px 13px;
          border: 2px solid #e9bd63;
          outline: 1px solid rgba(255,238,185,.68);
          box-shadow: 0 0 0 5px rgba(103,53,46,.55),0 0 0 7px rgba(233,189,99,.34),inset 0 0 26px rgba(255,207,113,.10),0 14px 28px rgba(0,0,0,.30);
          background: linear-gradient(135deg,rgba(54,24,35,.94),rgba(116,51,47,.91) 48%,rgba(48,24,38,.94));
          clip-path: polygon(4% 0,96% 0,100% 18%,100% 82%,96% 100%,4% 100%,0 82%,0 18%);
        }

        .golden-coast { color: #e9c77d; letter-spacing: 4px; text-transform: uppercase; font-size: 11px; margin-bottom: 3px; }

        .california-word {
          font-size: clamp(44px,7vw,74px);
          line-height: .92;
          letter-spacing: clamp(2px,.7vw,7px);
          text-transform: uppercase;
          font-weight: bold;
          color: #ffe6a4;
          -webkit-text-stroke: 1px rgba(99,52,23,.7);
          text-shadow: 0 2px 0 #d99d3f,0 4px 0 #9e632c,0 6px 0 #4a2b1e,0 0 15px rgba(255,210,116,.8);
        }

        .hero-heading { margin: 7px 0 0; font-size: clamp(30px,4vw,44px); line-height: 1; font-weight: normal; text-shadow: 0 4px 16px rgba(0,0,0,.40); }
        .hero-description { max-width: 760px; margin: 1px auto 0; color: #f4dfbd; font-size: clamp(14px,1.6vw,17px); line-height: 1.25; font-style: italic; text-shadow: 0 2px 8px rgba(0,0,0,.40); }

        .continue-plaque {
          position: absolute;
          right: 22px;
          bottom: 46px;
          z-index: 8;
          width: 150px;
          padding: 10px 9px 11px;
          border: 1px solid #dfb45f;
          outline: 2px solid rgba(72,39,23,.78);
          background: linear-gradient(180deg,rgba(111,57,38,.98),rgba(56,29,27,.98));
          color: #ffe3a7;
          text-align: center;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 10px;
          line-height: 1.35;
          box-shadow: inset 0 0 0 2px rgba(232,190,103,.14),0 8px 18px rgba(0,0,0,.40);
        }

        .continue-plaque strong { display: block; margin-top: 5px; color: #f5c865; font-size: 23px; line-height: 1; }
        .featured-zone {
          max-width: 1180px;
          margin: 0 auto;
          padding: 2px 20px 12px;
        }

        .featured-compact {
          display: grid;
          grid-template-columns: minmax(0, 1.75fr) minmax(290px, .48fr);
          gap: 20px;
          align-items: center;
          padding: 12px;
          background: linear-gradient(145deg,#fff3d9,#e6c58e);
          border: 5px solid #6a321f;
          outline: 2px solid #c68a45;
          box-shadow: inset 0 0 0 3px rgba(240,190,112,.40), inset 0 0 34px rgba(82,39,23,.20), 0 12px 28px rgba(55,28,20,.22);
        }

        .featured-image-wrap {
          position: relative;
          min-height: 390px;
          display: grid;
          place-items: center;
          padding: 28px;
          overflow: hidden;
          background: linear-gradient(145deg,#70402a 0%,#a7683d 22%,#643623 52%,#8a5634 78%,#4f2a1d 100%);
          border: 10px solid #5b2f20;
          outline: 3px solid #c88e49;
          box-shadow:
            inset 0 0 0 3px rgba(238,188,105,.45),
            inset 0 0 26px rgba(53,27,18,.28),
            0 8px 18px rgba(0,0,0,.18);
        }

        .featured-image-wrap::before {
          content: "";
          position: absolute;
          inset: 18px;
          background: linear-gradient(180deg,#f8f1e3 0%, #ead9bb 100%);
          border: 2px solid #ad7b46;
          box-shadow:
            inset 0 0 22px rgba(98, 63, 35, 0.10),
            0 0 0 1px rgba(255,245,222,0.45);
          z-index: 0;
        }

        .featured-image-wrap img {
          position: relative;
          z-index: 2;
          display: block;
          max-width: 100%;
          max-height: 350px;
          width: auto;
          height: auto;
          object-fit: contain;
          background: #f0e5d2;
          border: 8px solid #f1e5cf;
          outline: 1px solid #a97a42;
          box-shadow:
            0 0 0 6px #d9bb8b,
            0 8px 20px rgba(0,0,0,.30);
          transition: transform .2s ease;
          transform-origin: center center;
        }

        .featured-image-wrap.night-subtle::after {
          content: "";
          position: absolute;
          inset: 18px;
          pointer-events: none;
          background: radial-gradient(ellipse at center,rgba(7,18,36,0) 0%,rgba(7,18,36,0) 58%,rgba(5,15,32,.14) 76%,rgba(2,8,20,.34) 100%);
          z-index: 1;
        }

        .featured-image-wrap.night-neon::after {
          content: "";
          position: absolute;
          inset: 18px;
          pointer-events: none;
          background: radial-gradient(ellipse at center,rgba(5,15,34,0) 0%,rgba(5,15,34,0) 56%,rgba(3,12,30,.19) 70%,rgba(2,8,22,.46) 87%,rgba(1,5,14,.68) 100%);
          z-index: 1;
        }

        .featured-controls {
          align-self: stretch;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4px;
        }

        .featured-kicker {
          margin: 0 0 8px;
          color: #9b5d24;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: bold;
        }

        .featured-title {
          margin: 0;
          color: #5a2d20;
          font-size: clamp(24px,2.5vw,34px);
          line-height: 1.03;
          font-weight: normal;
        }

        .featured-description {
          margin: 8px 0 10px;
          color: #6f4a32;
          font-size: 15px;
          line-height: 1.45;
        }

        .featured-meta {
          margin: 0 0 10px;
          padding: 11px 12px;
          background: rgba(156,103,43,.14);
          border: 1px solid rgba(113,66,32,.30);
          color: #4d3323;
          font-size: 13px;
          line-height: 1.5;
        }

        .featured-meta strong { color: #5a2d20; }

        .control-stack {
          display: grid;
          gap: 7px;
        }

        .museum-button {
          display: block;
          width: 100%;
          padding: 9px 11px;
          border: 1px solid #b9823e;
          color: #fff0cf;
          background: linear-gradient(180deg,#7a4428,#4b281a);
          text-align: center;
          text-decoration: none;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 5px 12px rgba(0,0,0,.20);
        }

        .museum-button.light {
          color: #4a2b1e;
          background: linear-gradient(180deg,#e0b65f,#c98f36);
          border-color: #8f5e24;
        }

        .viewing-note {
          margin: 9px 0 0;
          text-align: center;
          color: #76543c;
          font-size: 12px;
          font-style: italic;
        }

        .collection-section {
          padding: 24px 24px 60px;
          background: linear-gradient(180deg,#2c1b1a 0%,#47261f 100%);
          border-top: 6px solid #9b6b31;
          color: #fff1d4;
        }

        .collection-inner { max-width: 1120px; margin: 0 auto; }
        .collection-kicker { margin: 0; color: #d8a954; letter-spacing: 4px; text-transform: uppercase; font-size: 12px; font-weight: bold; }
        .collection-title { margin: 8px 0 5px; color: #ffe7b7; font-size: clamp(34px,5vw,54px); font-weight: normal; }
        .collection-count { margin: 0 0 24px; color: #d0bca6; font-size: 16px; }

        .postcard-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(285px,1fr)); gap: 24px; align-items: stretch; }

        .california-card {
          overflow: hidden;
          background: linear-gradient(145deg,#fff8ea,#e7cda5);
          border: 3px solid #5f3223;
          outline: 2px solid #c28a46;
          box-shadow: inset 0 0 0 4px rgba(82,43,27,.16),0 16px 30px rgba(32,18,14,.25);
        }

        .california-card-image {
          min-height: 270px;
          display: grid;
          place-items: center;
          padding: 14px;
          background: linear-gradient(145deg,#5f3223,#8a472c 44%,#4b281d);
          border-bottom: 1px solid #a46d34;
        }

        .california-card-image img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 245px;
          object-fit: contain;
          background: #efe4d1;
          box-shadow: 0 7px 18px rgba(0,0,0,.28);
          transform-origin: center center;
        }
        .california-card-info { padding: 16px 17px 18px; color: #40271b; }
        .california-card-info h3 { margin: 0; color: #5a2d20; font-size: 22px; font-weight: normal; }
        .california-card-meta { margin-top: 8px; color: #76543c; font-size: 13px; line-height: 1.5; }
        .california-card-link { display: block; margin-top: 13px; padding: 9px 12px; color: #fff0cf; text-align: center; text-decoration: none; font-weight: bold; background: linear-gradient(180deg,#7a4428,#4b281a); border: 1px solid #b9823e; }
        .empty-collection { padding: 32px; text-align: center; border: 1px solid #9c7042; background: rgba(255,244,221,.08); color: #efd9b9; }

        .museum-footer { padding: 28px 20px 40px; text-align: center; background: #171210; color: #cdbba3; border-top: 1px solid #6d4828; }
        .museum-footer a { color: #efc873; text-decoration: none; margin: 0 9px; }

        @media (max-width: 820px) {
          .california-hero { min-height: 500px; }
          .hero-center { padding: 18px 135px 30px 18px; text-align: left; }
          .hero-title-frame { padding: 10px 15px 12px; }
          .hero-heading, .hero-description { text-align: left; }
          .continue-plaque { right: 10px; bottom: 24px; width: 112px; font-size: 8px; }
          .featured-zone { padding: 12px 14px 16px; }
          .featured-compact { grid-template-columns: 1fr; gap: 14px; padding: 14px; }
          .featured-image-wrap { min-height: 300px; }
          .featured-image-wrap img { max-height: 300px; }
          .featured-controls { padding: 0; }
        }

        @media (max-width: 560px) {
          .museum-nav { padding: 11px 14px 9px; }
          .museum-nav-links { gap: 11px; font-size: 12px; }
          .california-hero { min-height: 530px; }
          .hero-center { padding: 18px 116px 26px 14px; }
          .california-word { font-size: clamp(41px,14vw,64px); }
          .hero-heading { font-size: 29px; }
          .hero-description { font-size: 14px; }
          .continue-plaque { width: 102px; right: 7px; }
          .postcard-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="california-hero">
        <nav className="museum-nav">
          <Link href="/" className="entrance-link">
            ← Museum Entrance
          </Link>

          <div className="museum-nav-links">
            <Link href="/grand-gallery">Grand Gallery</Link>
            <Link href="/collection/florida">Florida Gallery</Link>
            <Link href="/history">History of Postcards</Link>
          </div>
        </nav>

        <div className="hero-center">
          <p className="museum-name">The Virtual Postcard Museum</p>

          <div className="hero-title-frame">
            <div className="golden-coast">Golden Coast Collection</div>
            <div className="california-word">California</div>
          </div>

          <h1 className="hero-heading">California Gallery</h1>

          <p className="hero-description">
            A journey through California’s cities, coastlines, landmarks,
            and historic destinations.
          </p>
        </div>

        <a
          href="#california-featured-exhibit"
          className="continue-plaque"
          aria-label="Continue to the featured California exhibit"
        >
          Continue to
          <br />
          Featured Exhibit
          <strong aria-hidden="true">↓</strong>
        </a>
      </section>
      <section id="california-featured-exhibit" className="featured-zone">
        <div className="featured-compact">
          <div
            className={`featured-image-wrap ${
              californiaNightDisplay === "neon"
                ? "night-neon"
                : californiaNightDisplay === "subtle"
                ? "night-subtle"
                : ""
            }`}
            style={{
              width: featuredIsPortrait ? "min(560px, 100%)" : "100%",
              minHeight: featuredIsPortrait ? "560px" : "390px",
              margin: "0 auto",
            }}
          >
            {(showBack
              ? featuredPostcard?.back_image_url
              : featuredPostcard?.front_image_url) ? (
              <img
                src={
                  (showBack
                    ? featuredPostcard?.back_image_url
                    : featuredPostcard?.front_image_url) || ""
                }
                alt={featuredPostcard?.title || "Featured California postcard"}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  const naturalPortrait =
                    image.naturalHeight > image.naturalWidth;
                  const rotation = featuredPostcard?.display_rotation || 0;
                  const displayedPortrait =
                    rotation % 180 === 90 ? !naturalPortrait : naturalPortrait;
                  setFeaturedIsPortrait(displayedPortrait);
                }}
                style={{
                  maxWidth: featuredIsPortrait ? "430px" : "100%",
                  maxHeight: featuredIsPortrait ? "500px" : "350px",
                  transform: `rotate(${featuredPostcard?.display_rotation || 0}deg)${
                    isMagnified
                      ? featuredIsPortrait
                        ? " scale(1.12)"
                        : " scale(1.22)"
                      : ""
                  }`,
                }}
              />
            ) : (
              <div style={{ color: "#f6dfbd", fontStyle: "italic", textAlign: "center" }}>
                Featured postcard image coming soon
              </div>
            )}
          </div>

          <aside className="featured-controls">
            <p className="featured-kicker">Featured California Exhibit</p>

            <h2 className="featured-title">
              {featuredPostcard?.title || "Interactive Postcard Display"}
            </h2>

            <p className="featured-description">
              {featuredPostcard?.description ||
                "Turn the postcard over to examine the message side, then magnify it for a closer museum view."}
            </p>

            <div className="featured-meta">
              <div>
                <strong>Location:</strong>{" "}
                {featuredPostcard
                  ? [featuredPostcard.city, featuredPostcard.state]
                      .filter(Boolean)
                      .join(", ") || "California"
                  : "California"}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {featuredPostcard?.postcard_date || "Not recorded"}
              </div>
              <div>
                <strong>Exhibit:</strong>{" "}
                {featuredPostcard
                  ? `VPM ${String(featuredPostcard.id).padStart(4, "0")}`
                  : "Museum Accession No. Pending"}
              </div>
            </div>

            <div className="control-stack">
              <button
                type="button"
                className="museum-button light"
                onClick={() => setShowBack((current) => !current)}
                disabled={
                  showBack
                    ? !featuredPostcard?.front_image_url
                    : !featuredPostcard?.back_image_url
                }
              >
                {showBack ? "↶ Show Postcard Front" : "↻ Turn Postcard Over"}
              </button>

              <button
                type="button"
                className="museum-button"
                onClick={() => setIsMagnified((current) => !current)}
              >
                {isMagnified ? "Return to Normal Size" : "+ Magnify Postcard"}
              </button>

              {featuredPostcard && (
                <Link
                  href={`/reading-room?id=${featuredPostcard.id}&from=california`}
                  className="museum-button"
                >
                  View Full Exhibit →
                </Link>
              )}

              <a href="#california-collection" className="museum-button">
                Continue to California Collection ↓
              </a>
            </div>

            <p className="viewing-note">
              Currently viewing: postcard {showBack ? "back" : "front"}
            </p>
          </aside>
        </div>
      </section>

      <section id="california-collection" className="collection-section">
        <div className="collection-inner">
          <p className="collection-kicker">Now on display</p>
          <h2 className="collection-title">California Collection</h2>

          <p className="collection-count">
            {californiaPostcards.length}{" "}
            {californiaPostcards.length === 1 ? "postcard" : "postcards"}{" "}
            currently on display.
          </p>

          {californiaPostcards.length > 0 ? (
            <div className="postcard-grid">
              {californiaPostcards.map((postcard) => {
                const location =
                  [postcard.city, postcard.state].filter(Boolean).join(", ") ||
                  "California";
                const rotation = postcard.display_rotation || 0;

                return (
                  <article className="california-card" key={postcard.id}>
                    <div className="california-card-image">
                      {postcard.front_image_url ? (
                        <img
                          src={postcard.front_image_url}
                          alt={postcard.title || "California postcard"}
                          style={{
                            transform:
                              rotation % 180 === 90
                                ? `rotate(${rotation}deg) scale(0.87)`
                                : `rotate(${rotation}deg)`,
                            maxWidth:
                              rotation % 180 === 90 ? "280px" : "100%",
                            maxHeight: "245px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            minHeight: "245px",
                            display: "grid",
                            placeItems: "center",
                            color: "#f5dfbd",
                            fontStyle: "italic",
                          }}
                        >
                          Image coming soon
                        </div>
                      )}
                    </div>

                    <div className="california-card-info">
                      <h3>
                        {postcard.title || "Untitled California Postcard"}
                      </h3>

                      <div className="california-card-meta">
                        <div>
                          <strong>Location:</strong> {location}
                        </div>
                        <div>
                          <strong>Date:</strong>{" "}
                          {postcard.postcard_date || "Not recorded"}
                        </div>
                        <div>
                          <strong>Exhibit:</strong> VPM{" "}
                          {String(postcard.id).padStart(4, "0")}
                        </div>
                      </div>

                      <Link
                        href={`/reading-room?id=${postcard.id}&from=california`}
                        className="california-card-link"
                      >
                        Open Exhibit →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-collection">
              No published California postcards were found yet.
            </div>
          )}
        </div>
      </section>

      <footer className="museum-footer">
        <Link href="/">Museum Entrance</Link>
        <span>•</span>
        <Link href="/grand-gallery">Grand Gallery</Link>
        <span>•</span>
        <Link href="/collection/florida">Florida Gallery</Link>
        <span>•</span>
        <Link href="/history">History of Postcards</Link>
      </footer>
    </main>
  );
}