 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./california/lib/supabase";
import MuseumSignup from "./MuseumSignup";

type FeaturedPostcard = {
  id: number;
  title: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  landmark: string | null;
  postcard_date: string | null;
  gallery: string | null;
  description: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  night_display: "off" | "subtle" | "neon" | null;
};

const featuredCollections = [
  {
    title: "Florida Collection",
    description:
      "Explore historic hotels, restaurants, beaches, roadside attractions, and communities throughout the Sunshine State.",
    href: "/collection/florida",
    icon: "🌴",
    background: "linear-gradient(135deg, #063c4a, #12677a)",
  },
  {
    title: "California Collection",
    description:
      "Journey through California’s cities, coastlines, landmarks, and celebrated destinations.",
    href: "/california",
    icon: "🌉",
    background: "linear-gradient(135deg, #8b3f26, #c77845)",
  },
  {
    title: "Holiday Collection",
    description:
      "Discover colorful greetings celebrating Christmas, Halloween, Thanksgiving, and other special occasions.",
    href: "/holiday",
    icon: "🎄",
    background: "linear-gradient(135deg, #5f1f27, #923846)",
  },
  {
    title: "Humor Collection",
    description:
      "Enjoy comic artwork, playful messages, exaggerated scenes, and the lighter side of postcard history.",
    href: "/humor",
    icon: "😂",
    background: "linear-gradient(135deg, #70531e, #ad812d)",
  },
];

export default function Home() {
  const [featuredPostcard, setFeaturedPostcard] =
    useState<FeaturedPostcard | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  useEffect(() => {
  let visitorId = window.localStorage.getItem("vpm_visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    window.localStorage.setItem("vpm_visitor_id", visitorId);
  }

  void fetch("/api/visitor-count", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId }),
    cache: "no-store",
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data?.enabled && typeof data.count === "number") {
        setVisitorCount(data.count);
      }
    })
    .catch(() => {});
}, []);

  useEffect(() => {
    async function loadFeaturedPostcard() {
      setFeaturedLoading(true);
      setIsFlipped(false);

      const { data, error } = await supabase
        .from("postcards")
        .select(
          "id, title, country, state, city, landmark, postcard_date, gallery, description, front_image_url, back_image_url, night_display"
        )
        .eq("status", "Published")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Could not load the featured postcard:", error.message);
        setFeaturedPostcard(null);
      } else {
        setFeaturedPostcard((data as FeaturedPostcard | null) || null);
      }

      setFeaturedLoading(false);
    }

    void loadFeaturedPostcard();
  }, []);

  const featuredLocation = featuredPostcard
    ? [featuredPostcard.city, featuredPostcard.state, featuredPostcard.country]
        .filter(Boolean)
        .join(", ")
    : "";

  const nightDisplay = featuredPostcard?.night_display || "off";

  return (
        <main
      className="museum-home"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #1c1713 0%, #2c241c 38%, #efe4ce 38%, #f8f2e7 100%)",
        color: "#2e241b",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes museumArrowFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }

        @keyframes featuredSpotlightGlow {
          0%, 100% {
            opacity: 0.78;
          }
          50% {
            opacity: 0.95;
          }
        }

        @keyframes floridaNavGlow {
          0%, 100% {
            color: #7df9ff;
            text-shadow:
              0 0 6px rgba(125,249,255,.78),
              0 0 14px rgba(39,220,232,.52);
          }
          33% {
            color: #ff8ec7;
            text-shadow:
              0 0 6px rgba(255,142,199,.82),
              0 0 14px rgba(255,105,180,.50);
          }
          66% {
            color: #ffd27a;
            text-shadow:
              0 0 6px rgba(255,210,122,.80),
              0 0 14px rgba(255,166,77,.45);
          }
        }

        .florida-nav-link {
          position: relative;
          display: inline-block;
          padding: 3px 8px 5px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: bold;
          animation: floridaNavGlow 5.5s ease-in-out infinite;
          transition:
            transform .22s ease,
            filter .22s ease;
        }

        .florida-nav-link::after {
          content: "";
          position: absolute;
          left: 15%;
          right: 15%;
          bottom: 0;
          height: 1px;
          background:
            linear-gradient(90deg, transparent, #7df9ff, #ff8ec7, #ffd27a, transparent);
          opacity: .8;
        }

        .florida-nav-link:hover {
          transform: translateY(-1px);
          filter: brightness(1.15);
        }


        .postcard-flip-stage {
          perspective: 1600px;
        }

        .postcard-flip-card {
          position: relative;
          width: 100%;
          transform-style: preserve-3d;
          transition: transform 0.85s cubic-bezier(0.2, 0.75, 0.25, 1);
        }

        .postcard-flip-card.is-flipped {
          transform: rotateY(180deg);
        }

        .postcard-face {
          width: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .postcard-back-face {
          position: absolute;
          inset: 0;
          transform: rotateY(180deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .featured-side-actions {
          position: absolute;
          right: -148px;
          top: 86px;
          width: 138px;
          display: grid;
          gap: 9px;
          z-index: 6;
        }

        .featured-side-actions a,
        .featured-side-actions button {
          width: 100%;
          margin: 0 !important;
          padding: 10px 9px !important;
          font-size: 12px !important;
          line-height: 1.25;
          text-align: center;
        }

        .featured-side-plaque {
          margin-top: 4px;
          padding: 10px 9px;
          border: 1px solid #c89d52;
          background: linear-gradient(180deg, #7a5225 0%, #4b2d16 100%);
          color: #f8dda0;
          font-size: 10px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-align: center;
          box-shadow: 0 6px 12px rgba(10,6,3,.35);
        }

        @media (max-width: 960px) {
          .featured-side-actions {
            position: static;
            width: min(520px, 100%);
            margin: 12px auto 0;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .museum-top-nav,
          .museum-hero-grid {
            grid-template-columns: 1fr !important;
          }

          .museum-top-nav {
            text-align: center;
          }

          .museum-nav-links {
            justify-content: center !important;
          }

          .museum-hero-grid {
            gap: 12px !important;
            padding-top: 18px !important;
          }

          .museum-welcome {
            padding-bottom: 6px !important;
          }
        }
          @media (max-width: 960px) {
  .museum-home,
  .museum-home * {
    box-sizing: border-box;
  }

  .museum-home .museum-top-nav,
  .museum-home .museum-hero-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .museum-home .museum-top-nav > *,
  .museum-home .museum-hero-grid > * {
    min-width: 0;
  }

  .museum-home .featured-display-stage {
    min-width: 0;
    padding: 58px 12px 12px !important;
  }

  .featured-display-stage > [aria-hidden="true"]:nth-child(1),
  .featured-display-stage > [aria-hidden="true"]:nth-child(2),
  .featured-display-stage > [aria-hidden="true"]:nth-child(5),
  .featured-display-stage > [aria-hidden="true"]:nth-child(6) {
    left: 50% !important;
  }

  .featured-display-stage > [aria-hidden="true"]:nth-child(5) {
    width: 98% !important;
  }

  .featured-display-stage > [aria-hidden="true"]:nth-child(6) {
    width: 78% !important;
  }

  .featured-display-stage strong {
    white-space: normal !important;
    overflow-wrap: anywhere;
  }
}

@media (max-width: 560px) {
  .museum-home .museum-hero-grid {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .museum-home .museum-welcome {
    overflow-wrap: anywhere;
  }

  .featured-display-stage > [aria-hidden="true"]:nth-child(1) {
    transform: translateX(-50%) scale(0.7) !important;
    transform-origin: top center;
  }
}
  @media (max-width: 560px) {
  .museum-home > header {
    padding: 8px 16px 4px !important;
  }

  .museum-home .museum-top-nav {
    gap: 8px !important;
  }

  .museum-home .museum-nav-links {
    gap: 8px 14px !important;
    font-size: 13px !important;
  }

  .museum-home .museum-hero-grid {
    padding-top: 8px !important;
    gap: 4px !important;
  }

  .museum-home .museum-welcome {
    padding: 0 4px !important;
  }

  .museum-home .museum-welcome h1 {
    font-size: 30px !important;
    line-height: 1.05 !important;
  }

  .museum-home .museum-welcome > p:first-child {
    margin-bottom: 4px !important;
    font-size: 11px !important;
    letter-spacing: 2px !important;
  }

  .museum-home .museum-welcome > div[aria-hidden="true"] {
    margin: 7px auto !important;
  }

  .museum-home .museum-welcome > p {
    font-size: 13px !important;
    line-height: 1.25 !important;
  }

  .museum-home .museum-welcome > p:nth-last-child(2),
  .museum-home .museum-welcome > p:last-child {
    margin: 7px 0 !important;
    letter-spacing: 0 !important;
  }
}
      `}</style>

      {/* ========================================= */}
      {/* MUSEUM HEADER */}
      {/* ========================================= */}
      <header
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "12px 28px 8px",
          color: "#f8edd7",
        }}
      >
        <nav
          className="museum-top-nav"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 0.8fr) minmax(420px, 1.6fr)",
            alignItems: "center",
            gap: "22px",
            borderBottom: "1px solid rgba(235, 203, 140, 0.35)",
            paddingBottom: "10px",
          }}
        >
          <div
            style={{
              color: "#e9c77e",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              lineHeight: "1.08",
              fontWeight: "bold",
              fontSize: "17px",
            }}
          >
            <div>The Virtual</div>
            <div style={{ fontSize: "21px" }}>Postcard Museum</div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                letterSpacing: "2px",
                color: "#c99b43",
              }}
            >
              — Established 2026 —
            </div>
          </div>

          <div
            className="museum-nav-links"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "34px",
              flexWrap: "wrap",
              fontSize: "16px",
              letterSpacing: "0.5px",
            }}
          >
            <Link
              href="/grand-gallery"
              style={{ color: "#fff6e6", textDecoration: "none" }}
            >
              Grand Gallery
            </Link>

            <Link
              href="/collection/florida"
              className="florida-nav-link"
            >
              Florida Gallery
            </Link>

            <Link
              href="/collection"
              style={{ color: "#fff6e6", textDecoration: "none" }}
            >
              Collections
            </Link>

            <Link
              href="/history"
              style={{ color: "#fff6e6", textDecoration: "none" }}
            >
              History of Postcards
            </Link>
          </div>
        </nav>
      </header>

      {/* ========================================= */}
      {/* MUSEUM ENTRANCE HERO */}
      {/* ========================================= */}
      <section
        className="museum-hero-grid"
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "12px 28px 8px",
          display: "grid",
          gridTemplateColumns: "minmax(270px, 0.72fr) minmax(600px, 1.58fr)",
          gap: "26px",
          alignItems: "center",
          color: "#fff7e8",
        }}
      >
        {/* LEFT: MUSEUM WELCOME */}
        <div
          className="museum-welcome"
          style={{
            textAlign: "center",
            padding: "8px 8px 6px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#e8c878",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            — Welcome To —
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(40px, 4.9vw, 64px)",
              lineHeight: "1.02",
              fontWeight: "normal",
              textShadow: "0 5px 20px rgba(0, 0, 0, 0.38)",
            }}
          >
            The Virtual
            <br />
            Postcard Museum
          </h1>

          <div
            aria-hidden="true"
            style={{
              width: "190px",
              height: "1px",
              margin: "15px auto 14px",
              background:
                "linear-gradient(90deg, transparent, #b98a38 18%, #e5c56f 50%, #b98a38 82%, transparent)",
            }}
          />

          <p
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              fontSize: "clamp(17px, 2vw, 22px)",
              lineHeight: "1.35",
              color: "#e8d9bd",
              fontStyle: "italic",
            }}
          >
            Preserving History. Sharing Stories.
            <br />
            Connecting Generations.
          </p>

          <p
            style={{
              margin: "18px 0 0",
              color: "#e8c878",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            📅 &nbsp; New Postcards Added Weekly
          </p>

          <p
            style={{
              marginTop: "16px",
              fontSize: "15px",
              color: "#cdbb9e",
            }}
          >
            Founded &amp; Curated by{" "}
            <strong style={{ color: "#f0d18a" }}>
              Clarence E. Pridemore Jr.
            </strong>
          </p>
        </div>

        {/* RIGHT: FEATURED EXHIBIT */}
        <div>
          <p
            style={{
              margin: "-4px 0 4px",
              textAlign: "center",
              color: "#e8c878",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            ★ Featured Exhibit ★
          </p>

          <div
                        className="featured-display-stage"
            style={{
              position: "relative",
              minHeight: "360px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(ellipse at 50% 12%, rgba(255,211,115,0.17) 0%, rgba(92,67,44,0.08) 38%, rgba(22,17,13,0) 72%)",
              padding: "58px 150px 4px 8px",
            }}
          >
            {/* POLISHED BRASS PICTURE LIGHT */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "0px",
                left: "calc(50% - 71px)",
                transform: "translateX(-50%)",
                width: "350px",
                height: "62px",
                zIndex: 5,
                pointerEvents: "none",
                filter: "brightness(1.18) saturate(1.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "44px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "360px",
                  height: "22px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(180deg, #f0d17d 0%, #bd8730 44%, #6e4314 100%)",
                  border: "1px solid #57330d",
                  boxShadow:
                    "0 5px 10px rgba(20,12,5,0.48), inset 0 2px 0 rgba(255,244,194,0.6)",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "44px",
                  width: "8px",
                  height: "38px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(90deg, #6c4414 0%, #e0bb68 50%, #6c4414 100%)",
                  transform: "rotate(17deg)",
                  transformOrigin: "top center",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "44px",
                  width: "8px",
                  height: "38px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(90deg, #6c4414 0%, #e0bb68 50%, #6c4414 100%)",
                  transform: "rotate(-17deg)",
                  transformOrigin: "top center",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: "29px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "388px",
                  height: "17px",
                  borderRadius: "4px 4px 11px 11px",
                  background:
                    "linear-gradient(180deg, #dbb157 0%, #9e6820 58%, #623a0e 100%)",
                  border: "1px solid #55310c",
                  boxShadow:
                    "0 4px 9px rgba(25,14,6,0.46), inset 0 1px 0 rgba(255,235,168,0.5)",
                }}
              />
            </div>

            {/* WARM HALO BEHIND THE PICTURE LIGHT */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "18px",
                left: "calc(50% - 71px)",
                transform: "translateX(-50%)",
                width: "460px",
                height: "145px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,215,125,0.48) 0%, rgba(255,190,80,0.20) 42%, rgba(255,170,55,0) 78%)",
                filter: "blur(24px)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* LEFT LIGHT CONE */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "58px",
                left: "17%",
                width: "44%",
                height: "72%",
                clipPath: "polygon(48% 0, 64% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, rgba(255,232,165,0.36) 0%, rgba(255,205,120,0.16) 50%, rgba(255,190,95,0) 100%)",
                filter: "blur(16px)",
                transform: "rotate(2deg)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* RIGHT LIGHT CONE */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "58px",
                right: "17%",
                width: "44%",
                height: "72%",
                clipPath: "polygon(36% 0, 52% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, rgba(255,232,165,0.36) 0%, rgba(255,205,120,0.16) 50%, rgba(255,190,95,0) 100%)",
                filter: "blur(16px)",
                transform: "rotate(-2deg)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* CENTER BLENDED SPOTLIGHT */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "56px",
                left: "calc(50% - 71px)",
                transform: "translateX(-50%)",
                width: "calc(98% - 142px)",
                height: "84%",
                clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, rgba(255,239,184,0.30) 0%, rgba(255,218,145,0.12) 50%, rgba(255,205,120,0) 100%)",
                filter: "blur(22px)",
                animation: "featuredSpotlightGlow 4s ease-in-out infinite",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* TOP FRAME HIGHLIGHT */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "92px",
                left: "calc(50% - 71px)",
                transform: "translateX(-50%)",
                width: "calc(78% - 110px)",
                height: "8px",
                borderRadius: "50%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,222,145,0.72), transparent)",
                filter: "blur(3px)",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />

            <div
              style={{
                position: "relative",
                width: "100%",
                zIndex: 2,
                textAlign: "center",
              }}
            >
              {featuredLoading ? (
                <div>
                  <div style={{ fontSize: "54px", marginBottom: "16px" }}>
                    🏛️
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#f3dfb8",
                      fontSize: "clamp(27px, 5vw, 40px)",
                      fontWeight: "normal",
                    }}
                  >
                    Opening the Featured Exhibit...
                  </h2>
                </div>
              ) : featuredPostcard ? (
                <div style={{ width: "100%" }}>
                  {featuredPostcard.front_image_url ? (
                    <div
                      className="postcard-flip-stage"
                      style={{
                        maxWidth: "760px",
                        margin: "0 auto",
                      }}
                    >
                      <div
                        className={`postcard-flip-card ${
                          isFlipped ? "is-flipped" : ""
                        }`}
                      >
                        <div className="postcard-face">
                          <div
                            style={{
                              padding: "10px",
                              background:
                                "linear-gradient(145deg, #5e3717 0%, #c0954d 20%, #42250f 49%, #a97c39 78%, #503015 100%)",
                              border: "4px solid #2f1a0c",
                              outline: "2px solid #dbbb75",
                              boxShadow:
                                "0 34px 58px rgba(9, 6, 3, 0.62), 0 0 58px rgba(255, 207, 105, 0.40), inset 0 0 0 2px rgba(255, 225, 158, 0.4)",
                            }}
                          >
                            <div
                              style={{
                                padding: "13px",
                                background:
                                  "linear-gradient(145deg, #f5ead1 0%, #d8c39a 100%)",
                                border: "1px solid #8f6d38",
                                boxShadow:
                                  "inset 0 0 28px rgba(72, 48, 24, 0.2)",
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  overflow: "hidden",
                                  margin: "0 auto",
                                  backgroundColor: "#eee1c5",
                                  border: "1px solid #8f774d",
                                  boxShadow:
                                    nightDisplay === "neon"
                                      ? "0 10px 24px rgba(55, 35, 15, 0.3), 0 0 28px rgba(65, 118, 255, 0.32), 0 0 18px rgba(255, 189, 87, 0.24)"
                                      : "0 10px 24px rgba(55, 35, 15, 0.3)",
                                }}
                              >
                                <img
                                  src={featuredPostcard.front_image_url}
                                  alt={
                                    featuredPostcard.title ||
                                    "Featured postcard front"
                                  }
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    maxHeight: "405px",
                                    objectFit: "contain",
                                    margin: "0 auto",
                                    backgroundColor: "#eee1c5",
                                    filter:
                                      nightDisplay === "neon"
                                        ? "brightness(1.00) contrast(1.05) saturate(1.05)"
                                        : nightDisplay === "subtle"
                                          ? "brightness(0.97) contrast(1.04) saturate(0.98)"
                                          : "none",
                                    transition: "filter 0.5s ease",
                                  }}
                                />

                                {nightDisplay !== "off" && (
                                  <>
                                    <div
                                      aria-hidden="true"
                                      style={{
                                        position: "absolute",
                                        inset: 0,
                                        pointerEvents: "none",
                                        background:
                                          nightDisplay === "neon"
                                            ? "radial-gradient(ellipse at 50% 48%, rgba(8, 18, 38, 0) 0%, rgba(8, 18, 38, 0) 64%, rgba(8, 22, 48, 0.12) 74%, rgba(5, 17, 40, 0.30) 84%, rgba(3, 12, 31, 0.56) 93%, rgba(2, 8, 24, 0.78) 100%)"
                                            : "radial-gradient(ellipse at 50% 48%, rgba(10, 20, 38, 0) 0%, rgba(10, 20, 38, 0) 46%, rgba(8, 22, 48, 0.14) 70%, rgba(5, 16, 34, 0.34) 100%)",
                                        mixBlendMode: "multiply",
                                      }}
                                    />

                                    {nightDisplay === "neon" && (
                                      <div
                                        aria-hidden="true"
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          pointerEvents: "none",
                                          background:
                                            "radial-gradient(ellipse at 50% 50%, rgba(255, 218, 145, 0.10) 0%, rgba(255, 196, 104, 0.05) 22%, transparent 46%), radial-gradient(ellipse at 50% 10%, rgba(58, 94, 170, 0.09) 0%, transparent 44%)",
                                          mixBlendMode: "screen",
                                          opacity: 0.75,
                                        }}
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="postcard-face postcard-back-face">
                          <div
                            style={{
                              width: "100%",
                              padding: "10px",
                              background:
                                "linear-gradient(145deg, #5e3717 0%, #c0954d 20%, #42250f 49%, #a97c39 78%, #503015 100%)",
                              border: "4px solid #2f1a0c",
                              outline: "2px solid #dbbb75",
                              boxShadow:
                                "0 34px 58px rgba(9, 6, 3, 0.62), 0 0 42px rgba(255, 212, 125, 0.28), inset 0 0 0 2px rgba(255, 225, 158, 0.4)",
                            }}
                          >
                            <div
                              style={{
                                minHeight: "250px",
                                padding: "13px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                  "linear-gradient(145deg, #f5ead1 0%, #d8c39a 100%)",
                                border: "1px solid #8f6d38",
                                boxShadow:
                                  "inset 0 0 28px rgba(72, 48, 24, 0.2)",
                              }}
                            >
                              {featuredPostcard.back_image_url ? (
                                <img
                                  src={featuredPostcard.back_image_url}
                                  alt={
                                    featuredPostcard.title ||
                                    "Featured postcard back"
                                  }
                                  style={{
                                    display: "block",
                                    width: "100%",
                                    maxHeight: "405px",
                                    objectFit: "contain",
                                    margin: "0 auto",
                                    backgroundColor: "#eee1c5",
                                    border: "1px solid #8f774d",
                                    boxShadow:
                                      "0 10px 24px rgba(55, 35, 15, 0.3)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    color: "#5b4632",
                                    fontSize: "18px",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  The back image has not yet been added for
                                  this postcard.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "62px", marginBottom: "18px" }}>
                        🖼️
                      </div>
                      <h2
                        style={{
                          margin: 0,
                          color: "#f3dfb8",
                          fontSize: "clamp(28px, 5vw, 44px)",
                          fontWeight: "normal",
                        }}
                      >
                        {featuredPostcard.title || "Featured Postcard"}
                      </h2>
                    </div>
                  )}

                  {/* FINAL ENGRAVED MUSEUM PLAQUE */}
                  <div
                    style={{
                      maxWidth: "320px",
                      margin: "-12px auto 0",
                      padding: "5px 20px 6px",
                      borderRadius: "3px",
                      background:
                        "linear-gradient(180deg, #ecd487 0%, #ca9a40 48%, #a66f21 100%)",
                      border: "3px ridge #755019",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.64), inset 0 -2px 0 rgba(78,47,12,0.25), 0 6px 12px rgba(16,10,4,0.42), 0 0 24px rgba(255,216,133,0.42)",
                      color: "#211307",
                      textShadow:
                        "0 1px 0 rgba(255,241,191,0.5), 0 -1px 0 rgba(82,47,10,0.18)",
                      lineHeight: "1.15",
                      position: "relative",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "9px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 35% 35%, #f7dfa0 0%, #b57e28 55%, #68400f 100%)",
                        border: "1px solid #68400f",
                      }}
                    />

                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: "9px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 35% 35%, #f7dfa0 0%, #b57e28 55%, #68400f 100%)",
                        border: "1px solid #68400f",
                      }}
                    />

                    <strong
                      style={{
                        display: "block",
                        fontSize: "15px",
                        letterSpacing: "0.15px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {featuredPostcard.title || "Untitled Postcard"}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "3px",
                        fontSize: "11px",
                      }}
                    >
                      {[
                        featuredLocation,
                        featuredPostcard.postcard_date,
                        `Exhibit #${featuredPostcard.id}`,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </div>

                  <div className="featured-side-actions">
                    <button
                      type="button"
                      onClick={() => setIsFlipped((current) => !current)}
                      style={{
                        borderRadius: "4px",
                        background:
                          "linear-gradient(180deg, #7a5225 0%, #4b2d16 100%)",
                        border: "1px solid #dfb967",
                        color: "#fff0d1",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontWeight: "bold",
                        letterSpacing: "0.4px",
                        cursor: "pointer",
                        boxShadow:
                          "0 6px 12px rgba(10, 6, 3, 0.42)",
                      }}
                    >
                      {isFlipped ? "Turn to Front ↺" : "Turn Postcard Over ↻"}
                    </button>

                    <Link
                      href={`/reading-room?id=${featuredPostcard.id}&from=${
                        featuredPostcard.gallery?.toLowerCase().includes("florida")
                          ? "florida"
                          : featuredPostcard.gallery?.toLowerCase().includes("california")
                          ? "california"
                          : featuredPostcard.gallery?.toLowerCase().includes("holiday")
                          ? "holiday"
                          : featuredPostcard.gallery?.toLowerCase().includes("humor")
                          ? "humor"
                          : "grand-gallery"
                      }`}
                      style={{
                        borderRadius: "4px",
                        background:
                          "linear-gradient(180deg, #4f2f19 0%, #2b180d 100%)",
                        border: "1px solid #dfb967",
                        color: "#fff0d1",
                        textDecoration: "none",
                        fontWeight: "bold",
                        letterSpacing: "0.4px",
                        boxShadow:
                          "0 6px 12px rgba(10, 6, 3, 0.42)",
                      }}
                    >
                      View Full Exhibit →
                    </Link>

                    <Link
                      href={`/reading-room?id=${featuredPostcard.id}&from=grand-gallery#comments`}
                      style={{
                        borderRadius: "4px",
                        background:
                          "linear-gradient(180deg, #8f5f73 0%, #5d3547 100%)",
                        border: "1px solid #dfb967",
                        color: "#fff0d1",
                        textDecoration: "none",
                        fontWeight: "bold",
                        letterSpacing: "0.4px",
                        boxShadow:
                          "0 6px 12px rgba(10, 6, 3, 0.42)",
                      }}
                    >
                      Leave a Comment
                    </Link>

                    <div className="featured-side-plaque">
                      Featured Exhibit
                    </div>

                    <a
                      href="#collection-galleries"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 9px",
                        borderRadius: "4px",
                        background:
                          "linear-gradient(180deg, #d6b66e 0%, #a9792f 55%, #714715 100%)",
                        border: "1px solid #f0cf82",
                        color: "#241407",
                        textDecoration: "none",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontWeight: "bold",
                        fontSize: "11px",
                        lineHeight: "1.25",
                        letterSpacing: "0.7px",
                        textAlign: "center",
                        textTransform: "uppercase",
                        boxShadow:
                          "0 6px 12px rgba(10, 6, 3, 0.42), inset 0 1px 0 rgba(255,245,205,0.55)",
                      }}
                    >
                      Continue Visit
                      <span
                        aria-hidden="true"
                        style={{
                          display: "block",
                          marginTop: "2px",
                          fontSize: "18px",
                          lineHeight: 1,
                          animation: "museumArrowFloat 1.8s ease-in-out infinite",
                        }}
                      >
                        ▼
                      </span>
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "62px", marginBottom: "18px" }}>
                    🖼️
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "clamp(28px, 5vw, 44px)",
                      fontWeight: "normal",
                      color: "#f3dfb8",
                    }}
                  >
                    Preparing the Next Featured Exhibit
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="collection-galleries"
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "34px 24px 70px",
          scrollMarginTop: "24px",
          background: "#f8f2e7",
          boxShadow: "0 0 0 100vmax #f8f2e7",
          clipPath: "inset(0 -100vmax)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "760px",
            margin: "0 auto 44px",
          }}
        >
          <p
            style={{
              color: "#986d25",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
              marginBottom: "12px",
            }}
          >
            Explore the Museum
          </p>

          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              margin: "0",
              fontWeight: "normal",
              color: "#432e20",
            }}
          >
            Collection Galleries
          </h2>

          <p
            style={{
              fontSize: "19px",
              lineHeight: "1.7",
              color: "#6c5948",
            }}
          >
            Enter the Grand Gallery to explore the complete collection, or
            visit one of the museum’s featured specialty galleries.
          </p>
        </div>

        <Link
          href="/grand-gallery"
          style={{
            display: "block",
            width: "100%",
            marginBottom: "24px",
            padding: "clamp(25px, 4vw, 38px)",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fff8e9",
            background:
              "linear-gradient(135deg, #3c2f21 0%, #765b32 52%, #a17b3e 100%)",
            border: "2px solid #c39a55",
            boxShadow: "0 16px 32px rgba(60, 42, 27, 0.25)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "28px",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "54px", marginBottom: "10px" }}>🏛️</div>
              <p style={{ margin: "0 0 7px", color: "#f2cf86", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "bold", fontSize: "13px" }}>
                The Heart of the Collection
              </p>
              <h3 style={{ fontSize: "clamp(34px, 5vw, 51px)", margin: "0", fontWeight: "normal" }}>
                The Grand Gallery
              </h3>
            </div>
            <div>
              <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.65", color: "rgba(255, 248, 233, 0.9)" }}>
                Enter the museum’s central gallery to explore postcards by state, city, region, and subject.
              </p>
              <p style={{ marginTop: "18px", marginBottom: "0", fontWeight: "bold", letterSpacing: "1px", fontSize: "17px" }}>
                Enter the Grand Gallery →
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/collection/florida"
          style={{
            display: "block",
            width: "100%",
            marginBottom: "24px",
            padding: "clamp(30px, 5vw, 48px)",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#fffaf1",
            background:
              "linear-gradient(120deg, #075361 0%, #168b91 38%, #d97c85 74%, #e7b36b 100%)",
            border: "2px solid #e8c487",
            boxShadow: "0 17px 34px rgba(35, 85, 89, 0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", right: "-45px", top: "-80px", width: "260px", height: "260px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,236,186,0.38) 0%, rgba(255,226,167,0.12) 48%, rgba(255,226,167,0) 72%)" }} />
          <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "62px", marginBottom: "10px" }}>🌴</div>
              <p style={{ margin: "0 0 8px", color: "#fff1bb", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "bold", fontSize: "13px" }}>
                Featured State Gallery
              </p>
              <h3 style={{ fontSize: "clamp(36px, 5vw, 56px)", margin: "0", fontWeight: "normal", textShadow: "0 3px 12px rgba(22, 57, 58, 0.28)" }}>
                Florida Gallery
              </h3>
            </div>
            <div>
              <p style={{ margin: "0", fontSize: "19px", lineHeight: "1.7", color: "rgba(255, 250, 241, 0.93)" }}>
                Explore more than 1,000 Florida postcards featuring historic hotels, beaches, restaurants, roadside attractions, and communities throughout the Sunshine State.
              </p>
              <p style={{ marginTop: "20px", marginBottom: "0", fontWeight: "bold", letterSpacing: "1px", fontSize: "18px" }}>
                Enter the Florida Gallery →
              </p>
            </div>
          </div>
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
          }}
        >
          {featuredCollections.slice(1).map((collection) => (
            <Link
              key={collection.title}
              href={collection.href}
              style={{
                display: "block",
                minHeight: "275px",
                padding: "30px",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#fff8e9",
                background: collection.background,
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow: "0 13px 28px rgba(60, 42, 27, 0.2)",
              }}
            >
              <div style={{ fontSize: "46px", marginBottom: "20px" }}>{collection.icon}</div>
              <h3 style={{ fontSize: "27px", margin: "0 0 14px", fontWeight: "normal" }}>
                {collection.title}
              </h3>
              <p style={{ margin: "0", lineHeight: "1.62", color: "rgba(255, 248, 233, 0.86)" }}>
                {collection.description}
              </p>
              <p style={{ marginTop: "22px", fontWeight: "bold", letterSpacing: "1px" }}>
                Enter Gallery →
              </p>
            </Link>
          ))}
        </div>

      </section>

      <section
        style={{
          background: "#3a2c21",
          color: "#fff6e4",
          padding: "78px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "55px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#e3bd6d",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              The Story Behind the Museum
            </p>

            <h2
              style={{
                margin: "12px 0 22px",
                fontSize: "clamp(38px, 5vw, 58px)",
                fontWeight: "normal",
              }}
            >
              A Lifelong Passion
            </h2>
          </div>

          <div
            style={{
              fontSize: "18px",
              lineHeight: "1.85",
              color: "#dfd0ba",
            }}
          >
            <p>
              The Virtual Postcard Museum was created to preserve and share the
              history, artwork, messages, buildings, communities, and personal
              stories found on vintage postcards.
            </p>

            <p>
              Founded and curated by Clarence E. Pridemore Jr., the museum is
              built from a personal collection of more than 5,000 postcards,
              with new exhibits to be added regularly.
            </p>

            <p>
              Each card is more than an image. It is a surviving record of a
              place, a moment, and the people who experienced it.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "78px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#986d25",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Museum by the Numbers
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "20px",
            marginTop: "35px",
          }}
        >
          {[
            ["5,000+", "Postcards in the Collection"],
            ["1,000+", "Florida Postcards"],
            ["50", "States Represented"],
            ["Weekly", "New Museum Additions"],
          ].map(([number, label]) => (
            <div
              key={label}
              style={{
                background: "#fffaf1",
                border: "1px solid #d4c09a",
                padding: "35px 20px",
                boxShadow: "0 8px 18px rgba(70, 49, 28, 0.1)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#74451f",
                  fontSize: "38px",
                  marginBottom: "10px",
                }}
              >
                {number}
              </strong>

              <span style={{ color: "#6c5948", lineHeight: "1.4" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "950px",
          margin: "0 auto 80px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #6e2c28 0%, #44211f 100%)",
            color: "#fff6e8",
            padding: "clamp(38px, 7vw, 70px)",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "0 18px 35px rgba(74, 43, 31, 0.25)",
          }}
        >
          <div style={{ fontSize: "46px" }}>📬</div>

          <h2
            style={{
              fontSize: "clamp(34px, 5vw, 52px)",
              fontWeight: "normal",
              margin: "18px 0",
            }}
          >
            Become a Museum Friend
          </h2>

          <p
            style={{
              maxWidth: "660px",
              margin: "0 auto",
              fontSize: "19px",
              lineHeight: "1.7",
              color: "#ead8cc",
            }}
          >
            Receive news about newly added postcards, featured exhibits,
            special collections, Curator’s Picks, and museum updates.
          </p>

                  <MuseumSignup />
        </div>
      </section>

      <footer
        style={{
          background: "#1d1713",
          color: "#d9c9ae",
          textAlign: "center",
          padding: "55px 24px",
          borderTop: "5px solid #a87930",
        }}
      >
        <h2
          style={{
            margin: "0",
            color: "#fff2d8",
            fontSize: "30px",
            fontWeight: "normal",
          }}
        >
          The Virtual Postcard Museum
        </h2>

        <p style={{ margin: "14px 0 0" }}>
          Founded &amp; Curated by Clarence E. Pridemore Jr.
        </p>
        {visitorCount !== null && (
  <p style={{ margin: "14px 0 0", color: "#dfb860" }}>
    Museum Visitors: {visitorCount.toLocaleString()}
  </p>
)}

        <p
          style={{
            margin: "26px 0 8px",
            color: "#dfb860",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          Contact the Curator
        </p>

        <a
          href="mailto:curator@virtualpostcardmuseum.org"
          style={{
            color: "#fff2d8",
            textDecoration: "none",
            fontSize: "18px",
          }}
        >
          curator@virtualpostcardmuseum.org
        </a>

        <p
          style={{
            margin: "26px 0 0",
            fontStyle: "italic",
            color: "#bfae93",
          }}
        >
          Every Postcard Has a Story.
        </p>

        <p
          style={{
            margin: "22px 0 0",
            fontSize: "14px",
            color: "#8f816e",
          }}
        >
          © 2026 The Virtual Postcard Museum
        </p>
      </footer>
    </main>
  );
}