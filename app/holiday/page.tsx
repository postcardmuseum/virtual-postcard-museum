"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../california/lib/supabase";


type FeaturedHolidayPostcard = {
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

const holidayRooms = [
  {
    title: "Christmas",
    icon: "🎄",
    description:
      "Santa Claus, decorated trees, snowy villages, toys, churches, family greetings, and the magic of Christmas past.",
    background: "linear-gradient(135deg, #244b38, #3f7757)",
  },
  {
    title: "Valentine’s Day",
    icon: "💌",
    description:
      "Romantic greetings, cupids, flowers, courtship, friendship, and sentimental messages from another era.",
    background: "linear-gradient(135deg, #8a3142, #c35d70)",
  },
  {
    title: "Easter",
    icon: "🐰",
    description:
      "Spring flowers, rabbits, chicks, decorated eggs, religious scenes, and cheerful Easter greetings.",
    background: "linear-gradient(135deg, #5d547c, #9586b5)",
  },
  {
    title: "Halloween",
    icon: "🎃",
    description:
      "Witches, black cats, pumpkins, fortune-telling, moonlit scenes, and wonderfully strange vintage Halloween imagery.",
    background: "linear-gradient(135deg, #4a2d42, #a55a24)",
  },
  {
    title: "Thanksgiving",
    icon: "🦃",
    description:
      "Turkeys, autumn harvests, family tables, patriotic symbolism, and traditional expressions of gratitude.",
    background: "linear-gradient(135deg, #75431f, #ae773a)",
  },
  {
    title: "New Year",
    icon: "🎆",
    description:
      "Midnight celebrations, lucky symbols, calendars, clocks, champagne, and hopeful greetings for the year ahead.",
    background: "linear-gradient(135deg, #263a63, #6c5b96)",
  },
  {
    title: "Patriotic Holidays",
    icon: "🇺🇸",
    description:
      "Fourth of July greetings, flags, eagles, monuments, military tributes, and celebrations of American history.",
    background: "linear-gradient(135deg, #273d61, #8b3540)",
  },
  {
    title: "Special Days",
    icon: "🌷",
    description:
      "Mother’s Day, Father’s Day, St. Patrick’s Day, birthdays, anniversaries, and other treasured occasions.",
    background: "linear-gradient(135deg, #396347, #9d7044)",
  },
];

const seasonalHighlights = [
  ["10", "Holiday Categories"],
  ["1", "Seasonal Exhibit Hall"],
  ["Year-Round", "Rotating Displays"],
  ["Weekly", "New Museum Additions"],
];

export default function HolidayPage() {
  const [featuredPostcard, setFeaturedPostcard] =
    useState<FeaturedHolidayPostcard | null>(null);
  const [holidayPostcards, setHolidayPostcards] =
    useState<FeaturedHolidayPostcard[]>([]);

  useEffect(() => {
    async function loadHolidayPostcards() {
      const { data, error } = await supabase
        .from("postcards")
        .select(
          "id, title, city, state, postcard_date, description, front_image_url, back_image_url, display_rotation, night_display, created_at"
        )
        .eq("status", "Published")
        .ilike("gallery", "%Holiday%")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        const loaded = data as FeaturedHolidayPostcard[];
        setHolidayPostcards(loaded);
        setFeaturedPostcard(loaded[0] || null);
      }
    }

    void loadHolidayPostcards();
  }, []);

  const holidayNightDisplay =
    featuredPostcard?.night_display?.toLowerCase() || "off";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f6efe3",
        color: "#33271f",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <style>{`
        .holiday-featured-wrap {
          position: relative;
        }

        /* Holiday gallery frame treatment:
           dark cherry / mahogany with warm brass accents. */
        .holiday-featured-wrap > div {
          border-radius: 2px;
        }

        .holiday-featured-wrap img {
          position: relative;
          z-index: 1;
        }

        .holiday-featured-wrap.night-subtle img {
          filter: saturate(.96) contrast(1.03);
        }

        .holiday-featured-wrap.night-neon img {
          filter: saturate(1.06) contrast(1.05);
        }

        .holiday-frame-shell {
          padding: 9px;
          background:
            linear-gradient(145deg, #4a181c 0%, #7a2e32 20%, #2c1013 48%, #6a2529 78%, #381316 100%);
          border: 3px solid #2a0f12;
          outline: 2px solid #c59a4d;
          box-shadow:
            inset 0 0 0 2px rgba(232,193,116,.34),
            inset 0 0 22px rgba(0,0,0,.34),
            0 18px 38px rgba(53,28,24,.28);
        }

        .holiday-night-swatch {
          position: relative;
          overflow: hidden;
        }

        .holiday-night-swatch.night-subtle::after,
        .holiday-night-swatch.night-neon::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
        }

        .holiday-night-swatch.night-subtle::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(8,18,36,0) 0%,
              rgba(8,18,36,0) 58%,
              rgba(5,15,32,.14) 76%,
              rgba(2,8,20,.34) 100%
            );
        }

        .holiday-night-swatch.night-neon::after {
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
            inset 0 0 25px rgba(7,24,52,.24),
            inset 0 0 48px rgba(3,11,28,.22);
        }

        .holiday-feature-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 250px;
          gap: 24px;
          align-items: center;
        }

        .holiday-compact-card {
          max-width: 720px;
          margin: 0 auto;
          padding: 18px;
          border: 8px solid #3a1519;
          outline: 2px solid #c59a4d;
          background: linear-gradient(145deg, #fff8e9, #e4cda0);
          box-shadow: 0 18px 34px rgba(53,28,24,.24);
        }

        .holiday-compact-image-wrap {
          min-height: 250px;
          display: grid;
          place-items: center;
          padding: 12px;
          overflow: hidden;
          background: #efe3ca;
          border: 1px solid #816442;
        }

        .holiday-compact-image {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          transform-origin: center center;
        }

        .holiday-compact-copy {
          padding: 16px 10px 2px;
          text-align: center;
        }

        .holiday-compact-copy h2 {
          margin: 0;
          color: #4a1b20;
          font-size: clamp(26px, 3vw, 38px);
          font-weight: normal;
        }

        .holiday-compact-copy p {
          margin: 9px auto 0;
          max-width: 620px;
          color: #6a5242;
          line-height: 1.5;
        }

        .holiday-feature-meta {
          margin-top: 12px;
          color: #7a5b39;
          font-size: 14px;
        }

        .holiday-feature-link {
          display: inline-block;
          margin-top: 14px;
          padding: 10px 16px;
          border: 1px solid #d2aa58;
          background: linear-gradient(180deg, #5f1d27, #2c1116);
          color: #fff0bd;
          text-decoration: none;
          font-weight: bold;
        }

        .holiday-side-actions {
          display: grid;
          gap: 16px;
        }

        .holiday-direction-plaque {
          display: grid;
          place-items: center;
          min-height: 142px;
          padding: 20px 16px;
          border: 3px double #e2c06f;
          outline: 4px solid #431519;
          background: linear-gradient(180deg, #8f2a35 0%, #5f1d27 50%, #2c1116 100%);
          color: #fff0bd;
          text-align: center;
          text-decoration: none;
          box-shadow: inset 0 0 0 4px rgba(255,230,169,.10), 0 16px 30px rgba(52,31,16,.28);
        }

        .holiday-direction-plaque.secondary {
          min-height: 104px;
          background: linear-gradient(180deg, #315a49 0%, #214334 50%, #13291f 100%);
        }

        .holiday-direction-plaque span {
          display: block;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .holiday-direction-plaque strong {
          display: block;
          margin-top: 7px;
          font-size: 22px;
          line-height: 1.2;
          font-weight: normal;
        }

        .holiday-direction-plaque b {
          display: block;
          margin-top: 9px;
          font-size: 28px;
          line-height: 1;
          color: #f0cf7f;
        }

        .holiday-thumbnail-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 26px;
        }

        .holiday-thumbnail-card {
          padding: 10px;
          background: linear-gradient(145deg, #4a181c 0%, #7a2e32 20%, #2c1013 48%, #6a2529 78%, #381316 100%);
          border: 3px solid #2a0f12;
          outline: 1px solid #c59a4d;
          box-shadow: 0 13px 27px rgba(53,28,24,.22);
        }

        .holiday-thumbnail-stage {
          min-height: 220px;
          display: grid;
          place-items: center;
          padding: 8px;
          overflow: hidden;
          background: #efe3ca;
          border: 1px solid #816442;
        }

        .holiday-thumbnail-stage img {
          display: block;
          max-width: 100%;
          max-height: 220px;
          width: auto;
          height: auto;
          object-fit: contain;
          transform-origin: center center;
        }

        .holiday-thumbnail-plaque {
          margin-top: 9px;
          padding: 9px 10px;
          text-align: center;
          background: linear-gradient(180deg, #d7b561 0%, #a8782f 100%);
          border: 2px ridge #725119;
          color: #251b0f;
        }

        .holiday-thumbnail-link {
          display: block;
          margin-top: 8px;
          padding: 8px 10px;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          color: #fff0bd;
          background: linear-gradient(180deg, #5f1d27, #2c1116);
          border: 1px solid #d2aa58;
        }

        @media (max-width: 980px) {
          .holiday-thumbnail-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .holiday-feature-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .holiday-thumbnail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header
        style={{
          background:
            "linear-gradient(180deg, #162f27 0%, #24493a 58%, #6f1f2b 100%)",
          color: "#fff7e8",
          borderBottom: "7px solid #c7a45a",
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
            padding: "24px 24px 42px",
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
            Greetings Through the Seasons
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "18px 38px",
              border: "2px solid #d7b76f",
              outline: "5px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(102,24,34,0.95), rgba(130,39,49,0.95))",
              boxShadow:
                "0 16px 38px rgba(0,0,0,0.3), inset 0 0 25px rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                color: "#ffedbc",
                fontSize: "clamp(42px, 7vw, 72px)",
                letterSpacing: "4px",
                textTransform: "uppercase",
                textShadow: "0 3px 0 #4f101a",
              }}
            >
              Holiday
            </span>
          </div>

          <h1
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(46px, 8vw, 82px)",
              lineHeight: "1.05",
              fontWeight: "normal",
              textShadow: "0 5px 18px rgba(0,0,0,0.3)",
            }}
          >
            Holiday Gallery
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "14px auto 0",
              fontSize: "clamp(20px, 3vw, 26px)",
              lineHeight: "1.65",
              color: "#f0dfca",
              fontStyle: "italic",
            }}
          >
            A nostalgic celebration of vintage greetings, cherished
            traditions, and special occasions throughout the year.
          </p>
        </section>
      </header>

      <section
        style={{
          maxWidth: "1180px",
          margin: "-48px auto 34px",
          padding: "0 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "20px",
            background:
              "linear-gradient(145deg, #fffaf0 0%, #e4cda0 50%, #fff8e9 100%)",
            border: "8px solid #3c2a21",
            outline: "3px solid #bd944c",
            boxShadow: "0 20px 48px rgba(45, 29, 21, 0.24)",
          }}
        >
          <div className="holiday-feature-layout">
            <div className="holiday-compact-card">
              <div className="holiday-compact-image-wrap">
                {featuredPostcard?.front_image_url ? (
                  <img
                    className="holiday-compact-image"
                    src={featuredPostcard.front_image_url}
                    alt={featuredPostcard.title || "Holiday featured postcard"}
                    style={{
                      transform: `rotate(${featuredPostcard.display_rotation ?? 0}deg)`,
                      maxWidth:
                        (featuredPostcard.display_rotation ?? 0) % 180 === 90
                          ? "300px"
                          : "100%",
                    }}
                  />
                ) : (
                  <div style={{ color: "#725f48", textAlign: "center" }}>
                    No published Holiday postcard is available yet.
                  </div>
                )}
              </div>

              <div className="holiday-compact-copy">
                <h2>
                  {featuredPostcard?.title || "Holiday Featured Postcard"}
                </h2>

                {featuredPostcard?.description && (
                  <p>{featuredPostcard.description}</p>
                )}

                <div className="holiday-feature-meta">
                  {featuredPostcard
                    ? [
                        [featuredPostcard.city, featuredPostcard.state]
                          .filter(Boolean)
                          .join(", "),
                        featuredPostcard.postcard_date,
                        `VPM ${String(featuredPostcard.id).padStart(4, "0")}`,
                      ]
                        .filter(Boolean)
                        .join(" • ")
                    : "Holiday Collection"}
                </div>

                {featuredPostcard && (
                  <Link
                    className="holiday-feature-link"
                    href={`/reading-room?id=${featuredPostcard.id}&from=holiday`}
                  >
                    View Full Exhibit →
                  </Link>
                )}
              </div>
            </div>

            <div className="holiday-side-actions">
              <a className="holiday-direction-plaque" href="#holiday-postcards">
                <div>
                  <span>Please Continue</span>
                  <strong>Holiday Collection</strong>
                  <b>↓</b>
                </div>
              </a>

              <a
                className="holiday-direction-plaque secondary"
                href="#holiday-gallery-rooms"
              >
                <div>
                  <span>Explore by Theme</span>
                  <strong>Gallery Rooms</strong>
                  <b>↓</b>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="holiday-postcards"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "18px 24px 66px",
          scrollMarginTop: "20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p
            style={{
              color: "#8b2633",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            The Holiday Collection
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
            {holidayPostcards.length} {holidayPostcards.length === 1 ? "postcard" : "postcards"}
          </p>
        </div>

        {holidayPostcards.length === 0 ? (
          <div
            style={{
              padding: "38px 20px",
              textAlign: "center",
              background: "#fffaf0",
              border: "1px solid #cfb47d",
              color: "#69584b",
            }}
          >
            Holiday postcards will appear here as they are published.
          </div>
        ) : (
          <div className="holiday-thumbnail-grid">
            {holidayPostcards.map((postcard) => (
              <article className="holiday-thumbnail-card" key={postcard.id}>
                <div className="holiday-thumbnail-stage">
                  {postcard.front_image_url ? (
                    <img
                      src={postcard.front_image_url}
                      alt={postcard.title || "Holiday postcard"}
                      style={{
                        transform: `rotate(${postcard.display_rotation ?? 0}deg)`,
                        maxWidth:
                          (postcard.display_rotation ?? 0) % 180 === 90
                            ? "200px"
                            : "100%",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#725f48" }}>Image coming soon</span>
                  )}
                </div>

                <div className="holiday-thumbnail-plaque">
                  <strong>{postcard.title || "Untitled Holiday Postcard"}</strong>
                  <span style={{ display: "block", marginTop: "3px", fontSize: "12px" }}>
                    VPM {String(postcard.id).padStart(4, "0")}
                  </span>
                </div>

                <Link
                  className="holiday-thumbnail-link"
                  href={`/reading-room?id=${postcard.id}&from=holiday`}
                >
                  Open Exhibit →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        id="holiday-gallery-rooms"
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
              color: "#8b2633",
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
            Holiday Gallery Rooms
          </h2>

          <p
            style={{
              color: "#6a594d",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Each room will open as postcards are prepared for exhibition.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {holidayRooms.map((room) => (
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
            "linear-gradient(135deg, #6c1d2a 0%, #3c2425 52%, #17352b 100%)",
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
              Greetings Across Generations
            </p>

            <h2
              style={{
                margin: "13px 0 0",
                fontSize: "clamp(38px, 5vw, 57px)",
                fontWeight: "normal",
              }}
            >
              Traditions Sent Through the Mail
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
              Holiday postcards carried affection, humor, faith, celebration,
              and remembrance between family members and friends.
            </p>

            <p>
              Their illustrations preserve changing fashions, customs,
              decorations, printing styles, and ideas about special occasions.
            </p>

            <p>
              Together, they create a colorful record of how generations marked
              the passing seasons and celebrated meaningful days.
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
            color: "#8b2633",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          Holiday Gallery by the Numbers
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: "20px",
            marginTop: "35px",
          }}
        >
          {seasonalHighlights.map(([number, label]) => (
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
                  color: "#7b2430",
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
              "linear-gradient(135deg, #234535 0%, #1b3329 58%, #6d1f2b 100%)",
            border: "2px solid #b98e49",
            boxShadow: "0 18px 38px rgba(47,31,23,0.24)",
          }}
        >
          <div style={{ fontSize: "52px" }}>✨</div>

          <h2
            style={{
              margin: "18px 0",
              fontSize: "clamp(34px, 5vw, 50px)",
              fontWeight: "normal",
            }}
          >
            The Celebration Is Just Beginning
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
            New holiday postcards will be added as the museum collection is
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