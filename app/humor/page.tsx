"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PostcardExhibit from "../dashboard/components/PostcardExhibit";
import { supabase } from "../california/lib/supabase";


type FeaturedHumorPostcard = {
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
  created_at: string | null;
};

const humorRooms = [
  {
    title: "Comic Characters",
    icon: "😂",
    description:
      "Playful people, exaggerated personalities, cartoon figures, and comic scenes created to make the recipient smile.",
    background: "linear-gradient(135deg, #6d4d1f, #b07a2d)",
  },
  {
    title: "Romance & Courtship",
    icon: "💘",
    description:
      "Flirting, teasing, misunderstandings, and humorous observations about love, dating, and marriage.",
    background: "linear-gradient(135deg, #7a3145, #b95d72)",
  },
  {
    title: "Travel Mishaps",
    icon: "🧳",
    description:
      "Overpacked travelers, missed trains, crowded hotels, roadside surprises, and the lighter side of vacationing.",
    background: "linear-gradient(135deg, #2d5c67, #4e8f98)",
  },
  {
    title: "Work & Daily Life",
    icon: "🛠️",
    description:
      "Jobs, chores, money troubles, household confusion, and ordinary frustrations transformed into postcard comedy.",
    background: "linear-gradient(135deg, #5b4a3a, #8a6a4f)",
  },
  {
    title: "Tall Tales",
    icon: "🐟",
    description:
      "Impossible catches, oversized vegetables, giant animals, and wonderfully exaggerated scenes from another era.",
    background: "linear-gradient(135deg, #365c3a, #68906a)",
  },
  {
    title: "Risque Humor",
    icon: "😉",
    description:
      "Witty double meanings, mischievous illustrations, and cheeky jokes that reflect changing social attitudes.",
    background: "linear-gradient(135deg, #5c2f4f, #8c4c73)",
  },
];

const humorHighlights = [
  ["6", "Humor Gallery Rooms"],
  ["1", "Featured Comic Exhibit"],
  ["Many", "Styles of Vintage Humor"],
  ["Weekly", "New Museum Additions"],
];

export default function HumorPage() {
  const [featuredPostcard, setFeaturedPostcard] =
    useState<FeaturedHumorPostcard | null>(null);
  const [humorPostcards, setHumorPostcards] =
    useState<FeaturedHumorPostcard[]>([]);

  useEffect(() => {
    async function loadHumorPostcards() {
      const { data, error } = await supabase
        .from("postcards")
        .select(
          "id, title, city, state, postcard_date, description, front_image_url, back_image_url, display_rotation, night_display, created_at"
        )
        .eq("status", "Published")
        .ilike("gallery", "%Humor%")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        const loaded = data as FeaturedHumorPostcard[];
        setHumorPostcards(loaded);
        setFeaturedPostcard(loaded[0] || null);
      }
    }

    void loadHumorPostcards();
  }, []);

  const humorNightDisplay =
    featuredPostcard?.night_display?.toLowerCase() || "off";

  return (
    <main
    className="humor-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f0df",
        color: "#33271f",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <style>{`
        .humor-frame-shell {
          padding: 8px;
          background:
            linear-gradient(145deg, #b27a35 0%, #dfb765 22%, #8a5828 48%, #d0a257 78%, #74451f 100%);
          border: 3px solid #65401f;
          outline: 2px solid #e0be78;
          box-shadow:
            inset 0 0 0 2px rgba(255,238,190,.38),
            inset 0 0 20px rgba(79,45,19,.22),
            0 18px 34px rgba(61,38,20,.24);
        }

        .humor-featured-wrap {
          position: relative;
          overflow: hidden;
        }

        .humor-featured-wrap img {
          position: relative;
          z-index: 1;
        }

        .humor-featured-wrap.night-subtle::after,
        .humor-featured-wrap.night-neon::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
        }

        .humor-featured-wrap.night-subtle::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(8,18,36,0) 0%,
              rgba(8,18,36,0) 58%,
              rgba(5,15,32,.14) 76%,
              rgba(2,8,20,.34) 100%
            );
        }

        .humor-featured-wrap.night-neon::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(5,15,34,0) 0%,
              rgba(5,15,34,0) 56%,
              rgba(3,12,30,.19) 70%,
              rgba(2,8,22,.46) 87%,
              rgba(1,5,14,.68) 100%
            );
          box-shadow:
            inset 0 0 24px rgba(7,24,52,.22),
            inset 0 0 46px rgba(3,11,28,.20);
        }

        .humor-featured-wrap.night-subtle img {
          filter: saturate(.97) contrast(1.03);
        }

        .humor-featured-wrap.night-neon img {
          filter: saturate(1.05) contrast(1.05);
        }

        .humor-featured-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 250px;
          gap: 24px;
          align-items: center;
        }

        .humor-featured-compact {
          max-width: 760px;
          margin: 0 auto;
          zoom: .82;
        }

        .humor-side-actions {
          display: grid;
          gap: 16px;
        }

        .humor-continue-plaque {
          display: grid;
          place-items: center;
          min-height: 150px;
          padding: 22px 18px;
          border: 3px double #e2c06f;
          outline: 4px solid #4a2d16;
          background:
            linear-gradient(180deg, #8e642c 0%, #5f3d1e 48%, #2b190e 100%);
          color: #fff0bd;
          text-align: center;
          text-decoration: none;
          box-shadow:
            inset 0 0 0 4px rgba(255,230,169,.10),
            0 16px 30px rgba(52,31,16,.28);
        }

        .humor-continue-plaque.secondary {
          min-height: 105px;
          background:
            linear-gradient(180deg, #526f73 0%, #2e4b50 48%, #17292c 100%);
        }

        .humor-continue-plaque span {
          display: block;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .humor-continue-plaque strong {
          display: block;
          margin-top: 8px;
          font-size: 24px;
          line-height: 1.2;
          font-weight: normal;
        }

        .humor-continue-plaque b {
          display: block;
          margin-top: 10px;
          font-size: 30px;
          line-height: 1;
          color: #f0cf7f;
        }

        .humor-continue-plaque:hover {
          filter: brightness(1.08);
          transform: translateY(-2px);
        }

        .humor-thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 22px;
        }

        .humor-thumbnail-card {
          padding: 10px;
          background:
            linear-gradient(145deg, #b27a35 0%, #dfb765 22%, #8a5828 48%, #d0a257 78%, #74451f 100%);
          border: 3px solid #65401f;
          outline: 1px solid #e0be78;
          box-shadow: 0 13px 27px rgba(61,38,20,.20);
        }

        .humor-thumbnail-stage {
          min-height: 190px;
          display: grid;
          place-items: center;
          padding: 8px;
          overflow: hidden;
          background: #eee2c8;
          border: 1px solid #7e5c33;
        }

        .humor-thumbnail-stage img {
          display: block;
          max-width: 100%;
          max-height: 190px;
          width: auto;
          height: auto;
          object-fit: contain;
          transform-origin: center center;
        }

        .humor-thumbnail-plaque {
          margin-top: 9px;
          padding: 9px 10px;
          text-align: center;
          background: linear-gradient(180deg, #d7b561 0%, #a8782f 100%);
          border: 2px ridge #725119;
          color: #251b0f;
        }

        .humor-thumbnail-plaque strong {
          display: block;
          font-size: 15px;
        }

        .humor-thumbnail-link {
          display: block;
          margin-top: 8px;
          padding: 8px 10px;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          color: #fff0bd;
          background: linear-gradient(180deg, #5f4523, #2c2117);
          border: 1px solid #d2aa58;
        }

        @media (max-width: 900px) {
          .humor-featured-layout {
            grid-template-columns: 1fr;
          }

          .humor-featured-compact {
            zoom: 1;
          }
        }
          @media (max-width: 560px) {
  .humor-page > header > div {
    padding: 14px 16px !important;
  }

  .humor-page > header nav {
    justify-content: center !important;
    gap: 14px !important;
    text-align: center;
  }

  .humor-page > header nav > div {
    justify-content: center;
    gap: 12px !important;
    font-size: 13px !important;
  }

  .humor-page > header > section {
    padding: 28px 16px 65px !important;
  }

  .humor-page > header > section > p:first-child {
    font-size: 11px !important;
    letter-spacing: 2px !important;
    line-height: 1.5;
  }

  .humor-page > header > section > div {
    padding: 12px 22px !important;
    max-width: 100%;
    box-sizing: border-box;
  }

  .humor-page > header > section > div > span {
    font-size: 38px !important;
    letter-spacing: 2px !important;
  }

  .humor-page > header h1 {
    font-size: 36px !important;
    margin-top: 20px !important;
  }

  .humor-page > header > section > p:last-child {
    font-size: 16px !important;
    line-height: 1.5 !important;
    margin-top: 16px !important;
  }

  .humor-page > section:first-of-type {
    padding: 0 12px !important;
    margin: -30px auto 28px !important;
  }

  .humor-page > section:first-of-type > div {
    padding: 12px !important;
    border-width: 5px !important;
  }

  .humor-featured-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .humor-featured-layout > div {
    min-width: 0;
  }

  .humor-featured-compact {
    width: 100%;
    max-width: 100%;
    zoom: 1;
  }

  .humor-frame-shell {
    padding: 4px;
  }

  .humor-side-actions {
    gap: 14px;
  }

  .humor-continue-plaque,
  .humor-continue-plaque.secondary {
    min-height: 0;
    padding: 16px 12px;
  }

  .humor-continue-plaque strong {
    font-size: 21px;
  }

  .humor-continue-plaque b {
    font-size: 24px;
    margin-top: 6px;
  }

  #humor-postcards,
  #humor-gallery-rooms {
    padding: 24px 16px 40px !important;
  }

  .humor-thumbnail-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .humor-thumbnail-card {
    min-width: 0;
  }

  .humor-thumbnail-plaque {
    overflow-wrap: anywhere;
  }

  #humor-gallery-rooms > div:last-child {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  #humor-gallery-rooms article {
    min-height: 0 !important;
    padding: 24px !important;
  }

  .humor-page > section:nth-of-type(4) {
    padding: 40px 16px !important;
  }

  .humor-page > section:nth-of-type(4) > div {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 24px !important;
  }

  .humor-page > section:nth-of-type(5) {
    padding: 40px 16px !important;
  }

  .humor-page > section:nth-of-type(6) {
    padding: 0 16px 40px !important;
  }

  .humor-page > section:nth-of-type(6) > div {
    padding: 28px 18px !important;
  }

  .humor-page > section h2 {
    font-size: 30px !important;
  }

  .humor-page > footer {
    padding: 35px 16px !important;
  }

  .humor-page > footer h2 {
    font-size: 25px !important;
  }
}@media (max-width: 560px) {
  .humor-featured-wrap > section {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100%;
  }

  .humor-featured-wrap > section > div {
    padding: 18px 12px !important;
    border-width: 6px !important;
  }

  .humor-featured-wrap > section > div > p:first-child {
    font-size: 11px;
    letter-spacing: 1.5px !important;
    line-height: 1.5;
  }

  .humor-featured-wrap > section > div > h2 {
    font-size: 27px !important;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .humor-featured-wrap > section > div > h2 + p {
    font-size: 16px !important;
    line-height: 1.5 !important;
    margin-bottom: 20px !important;
  }

  .humor-featured-wrap .vpm-postcard-stage {
    padding: 10px !important;
  }

  .humor-featured-wrap .vpm-postcard-face {
    border-width: 4px;
  }

  .humor-featured-wrap .vpm-museum-control {
    min-width: 0 !important;
    width: 100%;
    box-sizing: border-box;
    padding: 13px 8px !important;
    white-space: normal;
  }

  .humor-featured-wrap > section > div > div:last-child {
    padding: 12px !important;
    overflow-wrap: anywhere;
  }
}
  
      `}</style>

      <header
        style={{
          background:
            "linear-gradient(180deg, #2c2117 0%, #5f4523 58%, #9a6b24 100%)",
          color: "#fff7e8",
          borderBottom: "7px solid #d2aa58",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "25px 24px 18px",
          }}
        >
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              paddingBottom: "18px",
              borderBottom: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#f0d391",
                textDecoration: "none",
                fontSize: "16px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              ← Museum Entrance
            </Link>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "22px",
                fontSize: "16px",
              }}
            >
              <Link
                href="/grand-gallery"
                style={{ color: "#fff7e8", textDecoration: "none" }}
              >
                Grand Gallery
              </Link>

              <Link
                href="/collection"
                style={{ color: "#fff7e8", textDecoration: "none" }}
              >
                Collections
              </Link>

              <Link
                href="/history"
                style={{ color: "#fff7e8", textDecoration: "none" }}
              >
                History of Postcards
              </Link>
            </div>
          </nav>
        </div>

        <section
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            padding: "66px 24px 125px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 18px",
              color: "#efd18c",
              fontWeight: "bold",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            The Lighter Side of Postcard History
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "18px 38px",
              border: "2px solid #dfbe76",
              outline: "5px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(91,61,21,0.96), rgba(156,105,33,0.96))",
              boxShadow:
                "0 16px 38px rgba(0,0,0,0.3), inset 0 0 25px rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                color: "#fff0bd",
                fontSize: "clamp(42px, 7vw, 72px)",
                letterSpacing: "4px",
                textTransform: "uppercase",
                textShadow: "0 3px 0 #4f3514",
              }}
            >
              Humor
            </span>
          </div>

          <h1
            style={{
              margin: "24px 0 0",
              fontSize: "clamp(46px, 8vw, 82px)",
              lineHeight: "1.05",
              fontWeight: "normal",
              textShadow: "0 5px 18px rgba(0,0,0,0.3)",
            }}
          >
            Humor Gallery
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "25px auto 0",
              fontSize: "clamp(20px, 3vw, 26px)",
              lineHeight: "1.65",
              color: "#f0dfca",
              fontStyle: "italic",
            }}
          >
            A cheerful exhibition of comic artwork, playful messages,
            exaggeration, and the jokes that traveled through the mail.
          </p>
        </section>
      </header>

      <section
        style={{
          maxWidth: "1180px",
          margin: "-58px auto 46px",
          padding: "0 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "24px",
            background:
              "linear-gradient(145deg, #fffaf0 0%, #e7d2a4 50%, #fff8e9 100%)",
            border: "9px solid #3d2d20",
            outline: "3px solid #bd944c",
            boxShadow: "0 22px 58px rgba(45, 29, 21, 0.28)",
          }}
        >
          <div className="humor-featured-layout">
            <div>
              <div className="humor-featured-compact">
                <div className="humor-frame-shell">
                  <div
                    className={`humor-featured-wrap ${
                      humorNightDisplay === "neon"
                        ? "night-neon"
                        : humorNightDisplay === "subtle"
                        ? "night-subtle"
                        : ""
                    }`}
                  >
                    <PostcardExhibit
                      exhibitLabel="Featured Comic Exhibit"
                      title={featuredPostcard?.title || "Humor Featured Postcard"}
                      description={
                        featuredPostcard?.description ||
                        "Turn the postcard over to examine the message side, then use the magnify control for a closer museum view."
                      }
                      frontImage={featuredPostcard?.front_image_url || undefined}
                      backImage={featuredPostcard?.back_image_url || undefined}
                      accessionNumber={
                        featuredPostcard
                          ? `VPM ${String(featuredPostcard.id).padStart(4, "0")}`
                          : "Museum Accession No. Pending"
                      }
                      location={
                        featuredPostcard
                          ? [featuredPostcard.city, featuredPostcard.state]
                              .filter(Boolean)
                              .join(", ") || "Humor Collection"
                          : "Humor Collection"
                      }
                      date={featuredPostcard?.postcard_date || undefined}
                      curatorNote={
                        featuredPostcard
                          ? "Featured Humor museum postcard"
                          : "Postcard selection pending"
                      }
                      displayRotation={featuredPostcard?.display_rotation || 0}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  maxWidth: "520px",
                  margin: "14px auto 0",
                  padding: "12px 18px",
                  color: "#251b0f",
                  border: "2px solid #725119",
                  background:
                    "linear-gradient(180deg, #d7b561 0%, #a8782f 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.5), 0 5px 13px rgba(62,39,12,0.25)",
                  textAlign: "center",
                }}
              >
                <strong style={{ display: "block", fontSize: "17px" }}>
                  {featuredPostcard?.title || "Postcard selection pending"}
                </strong>
                <span style={{ display: "block", marginTop: "5px", fontSize: "13px" }}>
                  {featuredPostcard
                    ? `VPM ${String(featuredPostcard.id).padStart(4, "0")}`
                    : "Museum Accession No. Pending"}
                </span>
              </div>
            </div>

            <div className="humor-side-actions">
              <a
                className="humor-continue-plaque"
                href="#humor-postcards"
                aria-label="View all Humor Gallery postcards"
              >
                <div>
                  <span>View the Collection</span>
                  <strong>Humor Postcards</strong>
                  <b aria-hidden="true">↓</b>
                </div>
              </a>

              <a
                className="humor-continue-plaque secondary"
                href="#humor-gallery-rooms"
                aria-label="Continue to the Humor Gallery rooms"
              >
                <div>
                  <span>Explore by Theme</span>
                  <strong>Gallery Rooms</strong>
                  <b aria-hidden="true">↓</b>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="humor-postcards"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "24px 24px 72px",
          scrollMarginTop: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p
            style={{
              color: "#8a5d18",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            The Humor Collection
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(34px, 5vw, 52px)",
              color: "#3e2c22",
              fontWeight: "normal",
            }}
          >
            Postcards on Display
          </h2>
          <p style={{ color: "#6a594d", fontSize: "18px" }}>
            {humorPostcards.length} {humorPostcards.length === 1 ? "postcard" : "postcards"}
          </p>
        </div>

        {humorPostcards.length === 0 ? (
          <div
            style={{
              padding: "38px 20px",
              textAlign: "center",
              background: "#fffaf0",
              border: "1px solid #cfb47d",
              color: "#69584b",
            }}
          >
            Humor postcards will appear here as they are published.
          </div>
        ) : (
          <div className="humor-thumbnail-grid">
            {humorPostcards.map((postcard) => (
              <article className="humor-thumbnail-card" key={postcard.id}>
                <div className="humor-thumbnail-stage">
                  {postcard.front_image_url ? (
                    <img
                      src={postcard.front_image_url}
                      alt={postcard.title || "Humor postcard"}
                      style={{
                        transform: `rotate(${postcard.display_rotation ?? 0}deg)`,
                        maxWidth:
                          (postcard.display_rotation ?? 0) % 180 === 90
                            ? "190px"
                            : "100%",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#725f48" }}>Image coming soon</span>
                  )}
                </div>

                <div className="humor-thumbnail-plaque">
                  <strong>{postcard.title || "Untitled Humor Postcard"}</strong>
                  <span style={{ display: "block", marginTop: "3px", fontSize: "12px" }}>
                    VPM {String(postcard.id).padStart(4, "0")}
                  </span>
                </div>

                <Link
                  className="humor-thumbnail-link"
                  href={`/reading-room?id=${postcard.id}&from=humor`}
                >
                  Open Exhibit →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        id="humor-gallery-rooms"
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "20px 24px 90px",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto 46px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#8a5d18",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Explore the Collection
          </p>

          <h2
            style={{
              margin: "0",
              fontSize: "clamp(37px, 5vw, 57px)",
              fontWeight: "normal",
              color: "#3e2c22",
            }}
          >
            Humor Gallery Rooms
          </h2>

          <p
            style={{
              color: "#6a594d",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Each room will open as humorous postcards are scanned,
            researched, and prepared for exhibition.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {humorRooms.map((room) => (
            <article
              key={room.title}
              style={{
                minHeight: "285px",
                padding: "31px",
                color: "#fff9ed",
                background: room.background,
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "5px",
                boxShadow: "0 13px 27px rgba(53,36,27,0.2)",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "18px" }}>
                {room.icon}
              </div>

              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: "29px",
                  fontWeight: "normal",
                }}
              >
                {room.title}
              </h3>

              <p
                style={{
                  margin: "0",
                  color: "rgba(255,249,237,0.88)",
                  lineHeight: "1.7",
                }}
              >
                {room.description}
              </p>

              <p
                style={{
                  marginTop: "23px",
                  color: "rgba(255,249,237,0.72)",
                  fontSize: "13px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Gallery Opening Soon
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "78px 24px",
          background:
            "linear-gradient(135deg, #6c4a1d 0%, #3d2b1f 52%, #2b4e51 100%)",
          color: "#fff8e9",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "52px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#e7c87c",
                fontWeight: "bold",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Laughter Across Generations
            </p>

            <h2
              style={{
                margin: "13px 0 0",
                fontSize: "clamp(38px, 5vw, 57px)",
                fontWeight: "normal",
              }}
            >
              Jokes Sent Through the Mail
            </h2>
          </div>

          <div
            style={{
              color: "#eadccd",
              fontSize: "18px",
              lineHeight: "1.85",
            }}
          >
            <p>
              Humorous postcards offered an inexpensive way to share a joke,
              tease a friend, or brighten someone&apos;s day.
            </p>

            <p>
              Their illustrations preserve old slang, social customs,
              stereotypes, fashions, and changing ideas about what people
              considered funny.
            </p>

            <p>
              Together, they form a lively record of popular humor from a
              different time.
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
            color: "#8a5d18",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Humor Gallery by the Numbers
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: "20px",
            marginTop: "35px",
          }}
        >
          {humorHighlights.map(([number, label]) => (
            <div
              key={label}
              style={{
                padding: "35px 20px",
                backgroundColor: "#fffaf0",
                border: "1px solid #cfb47d",
                boxShadow: "0 8px 18px rgba(65,43,27,0.1)",
              }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: "#8a5d18",
                  fontSize: "36px",
                }}
              >
                {number}
              </strong>

              <span style={{ color: "#69584b", lineHeight: "1.4" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          padding: "0 24px 85px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "clamp(40px, 6vw, 64px)",
            color: "#fff8eb",
            background:
              "linear-gradient(135deg, #5c421f 0%, #2e241d 58%, #2f5a5d 100%)",
            border: "2px solid #b98e49",
            boxShadow: "0 18px 38px rgba(47,31,23,0.24)",
          }}
        >
          <div style={{ fontSize: "52px" }}>😄</div>

          <h2
            style={{
              margin: "18px 0",
              fontSize: "clamp(34px, 5vw, 50px)",
              fontWeight: "normal",
            }}
          >
            The Fun Is Just Beginning
          </h2>

          <p
            style={{
              maxWidth: "670px",
              margin: "0 auto",
              color: "#eadccc",
              fontSize: "18px",
              lineHeight: "1.75",
            }}
          >
            New humorous postcards will be added as the museum collection is
            scanned, researched, and prepared for visitors.
          </p>

          <Link
            href="/grand-gallery"
            style={{
              display: "inline-block",
              marginTop: "30px",
              padding: "14px 25px",
              color: "#271b0e",
              backgroundColor: "#d4ae61",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Return to the Grand Gallery
          </Link>
        </div>
      </section>

      <footer
        style={{
          padding: "55px 24px",
          textAlign: "center",
          color: "#d8c8b2",
          backgroundColor: "#181512",
          borderTop: "6px solid #9e7537",
        }}
      >
        <h2
          style={{
            margin: "0",
            color: "#fff2db",
            fontSize: "30px",
            fontWeight: "normal",
          }}
        >
          The Virtual Postcard Museum
        </h2>

        <p style={{ margin: "14px 0 0" }}>
          Founded &amp; Curated by Clarence E. Pridemore Jr.
        </p>

        <p
          style={{
            margin: "26px 0 0",
            color: "#bcad98",
            fontStyle: "italic",
          }}
        >
          Every Postcard Has a Story.
        </p>

        <p
          style={{
            margin: "22px 0 0",
            color: "#8e806e",
            fontSize: "14px",
          }}
        >
          © 2026 The Virtual Postcard Museum
        </p>
      </footer>
    </main>
  );
}