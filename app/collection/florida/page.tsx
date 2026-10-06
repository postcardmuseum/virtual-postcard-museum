"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../california/lib/supabase";

type FloridaPostcard = {
  id: number;
  title: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  landmark: string | null;
  postcard_date: string | null;
  gallery: string | null;
  description: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  display_rotation: number | null;
  night_display: string | null;
  featured: boolean | null;
  created_at: string | null;
};

const floridaCategories = [
  "All Florida",
  "Miami",
  "Hotels",
  "Roadside",
  "Beaches",
  "Cities & Towns",
  "Old Florida",
];

const floridaRegions: Record<string, string[]> = {
  miami: [
    "miami",
    "miami beach",
    "coral gables",
    "coconut grove",
  ],

  "fort-lauderdale-hollywood": [
    "fort lauderdale",
    "hollywood",
  ],

  "palm-beach": [
    "palm beach",
    "west palm beach",
  ],
};

export default function FloridaPage() {
  const [postcards, setPostcards] = useState<FloridaPostcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Florida");

  const [selectedRegion, setSelectedRegion] = useState("");

  const [enlargedPostcard, setEnlargedPostcard] =
    useState<FloridaPostcard | null>(null);

  const [detectedPortrait, setDetectedPortrait] =
    useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadFloridaPostcards() {
      setLoading(true);

      const { data, error } = await supabase
        .from("postcards")
        .select(
          "id, title, city, state, country, landmark, postcard_date, gallery, description, front_image_url, back_image_url, display_rotation, night_display, featured, created_at"
        )
        .eq("status", "Published")
        .or("state.ilike.%Florida%,gallery.ilike.%Florida%")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Could not load Florida postcards:",
          error.message
        );

        setPostcards([]);
      } else {
        setPostcards((data as FloridaPostcard[]) || []);
      }

      setLoading(false);
    }

    void loadFloridaPostcards();
  }, []);

  /* READ REGIONAL FILTER FROM URL */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const region = params.get("region") || "";

    setSelectedRegion(region);
  }, []);

  /* ESCAPE KEY CLOSES ENLARGED CARD */
  useEffect(() => {
    if (!enlargedPostcard) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEnlargedPostcard(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enlargedPostcard]);

  const featuredFloridaPostcard =
    postcards.find((postcard) => postcard.featured) ||
    postcards[0] ||
    null;

  const filteredPostcards = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    return postcards.filter((postcard) => {
      const searchableText = [
        postcard.title,
        postcard.city,
        postcard.state,
        postcard.country,
        postcard.landmark,
        postcard.postcard_date,
        postcard.gallery,
        postcard.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const city =
        (postcard.city || "").trim().toLowerCase();

      /* ===================================== */
      /* REGIONAL FILTER FROM LANDING PAGE */
      /* ===================================== */

      if (selectedRegion === "old-florida") {
        if (!isOldFloridaDate(postcard.postcard_date)) {
          return false;
        }
      } else if (selectedRegion) {
        const regionCities =
          floridaRegions[selectedRegion];

        if (
          regionCities &&
          !regionCities.includes(city)
        ) {
          return false;
        }
      }

      /* ===================================== */
      /* SEARCH BOX */
      /* ===================================== */

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      /* ===================================== */
      /* CATEGORY FILTER */
      /* ===================================== */

      if (selectedCategory === "All Florida") {
        return true;
      }

      if (selectedCategory === "Miami") {
        return [
          "miami",
          "miami beach",
          "coral gables",
          "coconut grove",
        ].includes(city);
      }

      if (selectedCategory === "Hotels") {
        return (
          searchableText.includes("hotel") ||
          searchableText.includes("motel") ||
          searchableText.includes("resort")
        );
      }

      if (selectedCategory === "Roadside") {
        return (
          searchableText.includes("roadside") ||
          searchableText.includes("highway") ||
          searchableText.includes("restaurant") ||
          searchableText.includes("attraction")
        );
      }

      if (selectedCategory === "Beaches") {
        return (
          searchableText.includes("beach") ||
          searchableText.includes("coast") ||
          searchableText.includes("ocean") ||
          searchableText.includes("waterfront")
        );
      }

      if (selectedCategory === "Cities & Towns") {
        return Boolean(postcard.city);
      }

      if (selectedCategory === "Old Florida") {
        return (
          searchableText.includes("spring") ||
          searchableText.includes("garden") ||
          searchableText.includes("wildlife") ||
          searchableText.includes("palm") ||
          searchableText.includes("old florida")
        );
      }

      return true;
    });
  }, [
    postcards,
    searchText,
    selectedCategory,
    selectedRegion,
  ]);

  const featuredLocation =
    featuredFloridaPostcard
      ? [
          featuredFloridaPostcard.city,
          featuredFloridaPostcard.state,
          featuredFloridaPostcard.country,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  const featuredNightDisplay =
    featuredFloridaPostcard?.night_display
      ?.toLowerCase() || "off";

  function isOldFloridaDate(value: string | null) {
    if (!value) return false;
    const years =
      value.match(/\b(?:18|19|20)\d{2}\b/g)?.map(Number) || [];
    return years.length > 0 && Math.max(...years) <= 1920;
  }

  function detectPortrait(
    postcard: FloridaPostcard,
    image: HTMLImageElement
  ) {
    const rotation =
      (((postcard.display_rotation ?? 0) % 360) + 360) % 360;

    const quarterTurn = rotation === 90 || rotation === 270;

    const portraitFromImage = quarterTurn
      ? image.naturalWidth > image.naturalHeight
      : image.naturalHeight > image.naturalWidth;

    setDetectedPortrait((current) => {
      if (current[postcard.id] === portraitFromImage) return current;
      return { ...current, [postcard.id]: portraitFromImage };
    });
  }

  function regionalTitle() {
    if (selectedRegion === "miami") {
      return "Miami & Greater Miami";
    }

    if (
      selectedRegion ===
      "fort-lauderdale-hollywood"
    ) {
      return "Fort Lauderdale / Hollywood";
    }

    if (selectedRegion === "palm-beach") {
      return "Palm Beach";
    }

    return "";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
  "linear-gradient(180deg, #071e2b 0%, #0b3444 55%, #082b38 100%)",
        color: "#32251d",
        fontFamily:
          "Georgia, 'Times New Roman', serif",
      }}
    >
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        * {
          box-sizing: border-box;
        }

        .florida-card {
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .florida-card:hover {
          transform: translateY(-7px);
          box-shadow:
            0 20px 34px rgba(52,34,18,.22),
            0 0 24px rgba(255,199,104,.16);
          filter: brightness(1.03);
        }

        .florida-card-neon {
  border: 2px solid #67eee0 !important;
  outline: 2px solid rgba(255,105,180,.75);
  box-shadow:
    0 13px 27px rgba(66,42,23,.18),
    0 0 8px rgba(103,238,224,.95),
    0 0 18px rgba(103,238,224,.75),
    0 0 28px rgba(255,105,180,.65),
    0 0 40px rgba(255,105,180,.35) !important;
}

        .florida-wood-frame {
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              #c58a4c 0%,
              #e8c27f 18%,
              #a96d38 46%,
              #dcb170 74%,
              #8b562d 100%
            );
          border: 2px solid #6e4423;
          outline: 1px solid #ddb66f;
          box-shadow:
            inset 0 0 0 1px rgba(255,240,198,.40),
            inset 0 0 14px rgba(78,46,22,.22),
            0 13px 27px rgba(66,42,23,.18);
        }

        .florida-outer-mat {
          border-radius: 8px;
          background:
            linear-gradient(
              180deg,
              #e9d8b7 0%,
              #dbc6a0 100%
            );
          border: 1px solid #9d7440;
        }

        .florida-inner-mat {
          border-radius: 6px;
          background:
            linear-gradient(
              180deg,
              #f8f2e6 0%,
              #eee3cc 100%
            );
          border: 1px solid #8d6638;
        }

        .florida-postcard-image-frame {
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 8px;
        }

        .florida-postcard-image-frame.landscape-frame {
          aspect-ratio: 3 / 2;
        }

        .florida-postcard-image-frame.portrait-frame {
          width: min(100%, 315px);
          height: 390px;
          margin-left: auto;
          margin-right: auto;
          padding: 10px;
        }

        .florida-image-stage.portrait-stage {
          width: 300px;
          height: 350px;
          max-width: 100%;
          margin: 0 auto;
        }

        .florida-postcard-image {
          display: block;
          object-fit: contain;
          background: #ece5d8;
          transform-origin: center center;
        }

        .florida-landscape-image {
          width: 100%;
          height: 100%;
          max-height: 300px;
        }

        .florida-portrait-image {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 330px;
          height: auto;
          max-width: none;
          max-height: none;
        }

        .florida-grid {
          background-image:
            radial-gradient(circle at center, rgba(224,184,101,.14) 0 2px, transparent 3px),
            repeating-conic-gradient(
              from 0deg at 50% 50%,
              rgba(224,184,101,.055) 0deg 4deg,
              transparent 4deg 30deg
            );
          background-size: 230px 230px;
          background-position: center;
        }

        .florida-image-stage {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          background:
            linear-gradient(
              145deg,
              #fbf6ea 0%,
              #e8dcc1 100%
            );
          border: 1px solid #6e4a2a;
        }

        .florida-image-stage.night-subtle::after,
        .florida-image-stage.night-neon::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .florida-image-stage.night-subtle::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(10,22,42,0) 0%,
              rgba(10,22,42,0) 66%,
              rgba(5,17,37,.12) 82%,
              rgba(3,10,25,.28) 100%
            );
        }

        .florida-image-stage.night-neon::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(5,16,35,0) 0%,
              rgba(5,16,35,0) 64%,
              rgba(3,14,34,.18) 78%,
              rgba(2,9,24,.40) 90%,
              rgba(1,5,15,.58) 100%
            );
        }

        .florida-thumbnail-button {
          width: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: zoom-in;
          font: inherit;
        }

        .florida-lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(6,12,16,.88);
          backdrop-filter: blur(4px);
        }

        .florida-lightbox-card {
          position: relative;
          width: min(94vw,1100px);
          height: min(92vh,900px);
          display: grid;
          place-items: center;
          padding: 24px;
          border: 3px solid #d7ae61;
          background:
            linear-gradient(
              145deg,
              #2b1b12,
              #0d161a 72%
            );
          box-shadow:
            0 24px 70px rgba(0,0,0,.65);
        }

        .florida-lightbox-stage {
          width: 100%;
          height: calc(100% - 72px);
          display: grid;
          place-items: center;
        }

        .florida-lightbox-image {
          display: block;
          width: auto;
          height: auto;
          max-width: min(84vw,940px);
          max-height: 68vh;
          object-fit: contain;
          background: #efe6d2;
          box-shadow:
            0 12px 36px rgba(0,0,0,.5);
        }

        .florida-lightbox-image.rotated-quarter {
          max-width: 64vh;
          max-height: 78vw;
        }

        .florida-lightbox-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #e5c777;
          background: #4a1f19;
          color: #fff3d0;
          font-size: 24px;
          cursor: pointer;
        }

        @media (max-width: 980px) {
          .florida-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 680px) {
          .florida-grid {
            grid-template-columns:
              1fr !important;
          }
        }

        @media (max-width: 820px) {
          .florida-feature-grid {
            grid-template-columns:
              1fr !important;
          }
        }

        @media (max-width: 620px) {
          .florida-gallery-search-grid {
            grid-template-columns:
              1fr !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <header
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "14px 24px 8px",
          color: "#fff8e9",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            borderBottom:
              "1px solid rgba(255,255,255,.24)",
            paddingBottom: "16px",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#fff7e5",
              textDecoration: "none",
              fontSize: "17px",
            }}
          >
            ← Museum Entrance
          </Link>

          <div
            style={{
              display: "flex",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/grand-gallery"
              style={{
                color: "#fff7e5",
                textDecoration: "none",
              }}
            >
              Grand Gallery
            </Link>

            <Link
              href="/collection"
              style={{
                color: "#7df9ff",
                textDecoration: "none",
              }}
            >
              All Collections
            </Link>
          </div>
        </nav>
      </header>

      {/* TITLE */}
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "10px 24px 14px",
          textAlign: "center",
          color: "#fff8ed",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            color: "#ff9fcf",
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          The Sunshine State Collection
        </p>

        <div style={{ fontSize: "30px" }}>
          🌴
        </div>

        <h1
          style={{
            margin: "6px 0 0",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize:
              "clamp(44px,7vw,72px)",
            letterSpacing: "4px",
            color: "#7df9ff",
            textTransform: "uppercase",
            textShadow:
              "0 0 5px #7df9ff, 0 0 14px #27dce8, 3px 3px 0 #d74291",
          }}
        >
          Florida
        </h1>

        <div
          style={{
            marginTop: "7px",
            color: "#ff8ec7",
            letterSpacing: "6px",
            fontSize:
              "clamp(17px,3vw,22px)",
            textTransform: "uppercase",
          }}
        >
          Gallery
        </div>

        <p
          style={{
            maxWidth: "760px",
            margin: "18px auto 0",
            fontSize: "18px",
            lineHeight: 1.55,
            color: "#d9edf0",
          }}
        >
          Explore Florida&apos;s hotels,
          restaurants, beaches, attractions,
          cities, highways, and changing
          landscapes through the postcards
          that preserved them.
        </p>
      </section>

      {/* FEATURED EXHIBIT */}
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto 28px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(145deg,#fff8e8,#ecd2a8 52%,#fff4dc)",
            border: "3px solid #ff79bd",
            outline:
              "2px solid rgba(125,249,255,.65)",
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              textAlign: "center",
              color: "#9a6b20",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Featured Florida Exhibit
          </p>

          {loading ? (
            <div
              style={{
                minHeight: "260px",
                display: "grid",
                placeItems: "center",
              }}
            >
              Opening the Florida Gallery...
            </div>
          ) : featuredFloridaPostcard ? (
            <div
              className="florida-feature-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(320px,1.45fr) minmax(260px,.75fr)",
                gap: "22px",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  className="florida-wood-frame"
                  style={{
                    padding: "6px",
                  }}
                >
                  <div
                    className="florida-outer-mat"
                    style={{ padding: "10px" }}
                  >
                    <div
                      className="florida-inner-mat"
                      style={{ padding: "8px" }}
                    >
                      <div
                        className={`florida-image-stage ${
                          featuredNightDisplay ===
                          "neon"
                            ? "night-neon"
                            : featuredNightDisplay ===
                              "subtle"
                            ? "night-subtle"
                            : ""
                        }`}
                        style={{ padding: "4px" }}
                      >
                        {featuredFloridaPostcard.front_image_url ? (
                          <button
                            type="button"
                            className="florida-thumbnail-button"
                            onClick={() =>
                              setEnlargedPostcard(
                                featuredFloridaPostcard
                              )
                            }
                          >
                            <img
                              src={
                                featuredFloridaPostcard.front_image_url
                              }
                              alt={
                                featuredFloridaPostcard.title ||
                                "Featured Florida postcard"
                              }
                              style={{
                                width: "100%",
                                display: "block",
                                maxHeight: "320px",
                                objectFit: "contain",
                                transform: `rotate(${
                                  featuredFloridaPostcard.display_rotation ??
                                  0
                                }deg)`,
                              }}
                            />
                          </button>
                        ) : (
                          <div
                            style={{
                              minHeight: "260px",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            Front image not available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p
                  style={{
                    color: "#a26055",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  Curator&apos;s Selection
                </p>

                <h2
                  style={{
                    color: "#472e21",
                    fontSize:
                      "clamp(27px,3.3vw,38px)",
                    fontWeight: "normal",
                  }}
                >
                  {featuredFloridaPostcard.title ||
                    "Untitled Florida Postcard"}
                </h2>

                {featuredLocation && (
                  <p>{featuredLocation}</p>
                )}

                {featuredFloridaPostcard.postcard_date && (
                  <p
                    style={{
                      fontStyle: "italic",
                    }}
                  >
                    {
                      featuredFloridaPostcard.postcard_date
                    }
                  </p>
                )}

                {featuredFloridaPostcard.description && (
                  <p
                    style={{
                      lineHeight: 1.5,
                    }}
                  >
                    {
                      featuredFloridaPostcard.description
                    }
                  </p>
                )}

                <Link
                  href={`/reading-room?id=${featuredFloridaPostcard.id}&from=florida`}
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    padding: "10px 15px",
                    background: "#4a2a15",
                    border:
                      "1px solid #d7ae61",
                    color: "#fff1d5",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  View Full Exhibit →
                </Link>

                <Link
                  href="/reading-room?from=florida&tour=1"
                  style={{
                    display: "inline-block",
                    margin: "12px 0 0 10px",
                    padding: "10px 15px",
                    background: "#167f89",
                    border:
                      "1px solid #d7ae61",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  ▶ Begin Automated Florida Gallery Tour
                </Link>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              No published Florida postcards
              are available yet.
            </div>
          )}
        </div>
      </section>
{/* FLORIDA REGIONAL NAVIGATION */}
<section
  style={{
    maxWidth: "1050px",
    margin: "6px auto 10px",
    padding: "0 24px",
    textAlign: "center",
  }}
>
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px",
    }}
  >
    <Link
      href="/collection/florida?region=miami"
      onClick={() => {
        setSelectedRegion("miami");
        setSelectedCategory("All Florida");
        setSearchText("");
      }}
      style={{
        display: "inline-block",
        padding: "10px 16px",
        borderRadius: "7px",
        background: "#103b42",
        border: "2px solid #67eee0",
        color: "#bffff7",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "bold",
        letterSpacing: "1.4px",
        textTransform: "uppercase",
        boxShadow:
          "0 0 6px rgba(103,238,224,.85), 0 0 12px rgba(103,238,224,.45)",
      }}
    >
      Miami
    </Link>

    <Link
      href="/collection/florida?region=fort-lauderdale-hollywood"
      onClick={() => {
        setSelectedRegion("fort-lauderdale-hollywood");
        setSelectedCategory("All Florida");
        setSearchText("");
      }}
      style={regionalButton}
    >
      Ft Lauderdale / Hollywood
    </Link>

    <Link
      href="/collection/florida?region=palm-beach"
      onClick={() => {
        setSelectedRegion("palm-beach");
        setSelectedCategory("All Florida");
        setSearchText("");
      }}
      style={regionalButton}
    >
      Palm Beach
    </Link>

    <Link
      href="/collection/florida?region=old-florida"
      onClick={() => {
        setSelectedRegion("old-florida");
        setSelectedCategory("All Florida");
        setSearchText("");
      }}
      style={regionalButton}
    >
      Old Florida
    </Link>
  </div>

  <div style={{ marginTop: "12px" }}>
    <Link
      href="/collection/florida"
      onClick={() => {
        setSelectedRegion("");
        setSelectedCategory("All Florida");
        setSearchText("");
      }}
      style={{
        display: "inline-block",
        width: "100%",
        maxWidth: "430px",
        padding: "10px 16px",
        borderRadius: "7px",
        background:
          "linear-gradient(135deg, #173f47 0%, #0d6872 58%, #32505a 100%)",
        border: "2px solid #e3b65b",
        color: "#fff3cf",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: "bold",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        boxShadow:
          "0 5px 12px rgba(0,0,0,.18), 0 0 8px rgba(105,243,229,.3)",
      }}
    >
      <span style={{ color: "#e9bd61" }}>◆</span>
      {" "}
      All Florida Exhibits
      {" "}
      <span style={{ color: "#e9bd61" }}>◆</span>
    </Link>
  </div>
</section>
    
        
 
      {/* COLLECTION */}
      <section
        id="florida-exhibits"
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "8px 24px 48px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "14px",
          }}
        >
          <p
            style={{
              color: "#ad6256",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            The Florida Collection
          </p>

          <h2
            style={{
              margin: "4px 0 6px",
              fontSize:
                "clamp(38px,6vw,56px)",
              color: "#fff1c2",
              fontWeight: "normal",
              textShadow:
                "0 2px 10px rgba(0,0,0,.65)",
            }}
          >
            {regionalTitle() ||
              "Gallery Exhibits"}
          </h2>

          <p>
            {filteredPostcards.length}{" "}
            {filteredPostcards.length === 1
              ? "postcard"
              : "postcards"}{" "}
            on display
          </p>
        </div>

        {/* SEARCH */}
        <div
          style={{
            maxWidth: "820px",
            margin: "0 auto 16px",
            padding: "14px 16px",
            background:
              "linear-gradient(135deg,#17313a,#0f4851 58%,#5b2947)",
            border: "1px solid #e08bb8",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              marginBottom: "9px",
              color: "#fff2d8",
              fontWeight: "bold",
              letterSpacing: "1.7px",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Search the Florida Collection
          </div>

          <div
            className="florida-gallery-search-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px,1fr) minmax(170px,.42fr)",
              gap: "12px",
            }}
          >
            <input
              type="search"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search by city, title, landmark, or date..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "4px",
                border:
                  "1px solid #c7a578",
                background: "#fffaf0",
                fontSize: "14px",
              }}
            />

            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(
                  event.target.value
                );

                setSelectedRegion("");
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "4px",
                border:
                  "1px solid #c7a578",
                background: "#fffaf0",
                fontSize: "14px",
              }}
            >
              {floridaCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {selectedRegion && (
            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              <Link
                href="/collection/florida"
                style={{
                  color: "#7df9ff",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                View Entire Florida Collection
              </Link>
            </div>
          )}
        </div>

        {/* POSTCARD GRID */}
        {loading ? (
          <p style={{ textAlign: "center" }}>
            Loading Florida postcards...
          </p>
        ) : (
          <div
            className="florida-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3,minmax(0,1fr))",
              gap: "22px",
              alignItems: "start",
            }}
          >
            {filteredPostcards.map(
              (postcard) => {
                const location = [
                  postcard.city,
                  postcard.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                const savedRotation =
                  (((postcard.display_rotation ?? 0) % 360) + 360) % 360;

                const portraitDisplay =
                  savedRotation === 90 ||
                  savedRotation === 270 ||
                  Boolean(detectedPortrait[postcard.id]);

                const nightDisplay =
                  postcard.night_display
                    ?.toLowerCase() || "off";

                return (
                  <article
                    key={postcard.id}
                    className={`florida-card florida-wood-frame ${
  nightDisplay === "neon" ||
  ["miami", "miami beach", "coral gables", "coconut grove"].includes(
    (postcard.city || "").trim().toLowerCase()
  )
    ? "florida-card-neon"
    : ""
}`}
                    style={{
                      padding: "9px",
                    }}
                  >
                    <div
                      className={`florida-postcard-image-frame ${
                        portraitDisplay ? "portrait-frame" : "landscape-frame"
                      }`}
                    >
                      <div
                        className="florida-outer-mat"
                        style={{
                          width: "100%",
                          height: "100%",
                          padding: "9px",
                          display: "grid",
                        }}
                      >
                        <div
                          className="florida-inner-mat"
                          style={{
                            width: "100%",
                            height: "100%",
                            padding: "7px",
                            display: "grid",
                          }}
                        >
                          <div
                            className={`florida-image-stage ${
                              portraitDisplay ? "portrait-stage" : ""
                            } ${
                              nightDisplay === "neon"
                                ? "night-neon"
                                : nightDisplay === "subtle"
                                ? "night-subtle"
                                : ""
                            }`}
                            style={{
                              width: "100%",
                              height: "100%",
                              padding: "5px",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {postcard.front_image_url ? (
                              <button
                                type="button"
                                className="florida-thumbnail-button"
                                onClick={() =>
                                  setEnlargedPostcard(postcard)
                                }
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "grid",
                                  placeItems: "center",
                                }}
                              >
                                <img
                                  className={`florida-postcard-image ${
                                    portraitDisplay
                                      ? "florida-portrait-image"
                                      : "florida-landscape-image"
                                  }`}
                                  src={postcard.front_image_url}
                                  alt={
                                    postcard.title ||
                                    "Florida postcard"
                                  }
                                  onLoad={(event) =>
                                    detectPortrait(
                                      postcard,
                                      event.currentTarget
                                    )
                                  }
                                  style={{
                                    transform: portraitDisplay
                                      ? `translate(-50%, -50%) rotate(${savedRotation}deg)`
                                      : `rotate(${savedRotation}deg)`,
                                  }}
                                />
                              </button>
                            ) : (
                              <div>
                                Image coming soon
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign:
                          "center",
                        color: "#fff0d1",
                        padding:
                          "10px 8px 4px",
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                        }}
                      >
                        {postcard.title ||
                          "Untitled Florida Postcard"}
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            "3px",
                          fontSize:
                            "13px",
                        }}
                      >
                        {[
                          location,
                          postcard.postcard_date,
                          `Exhibit #${postcard.id}`,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " • "
                          )}
                      </span>
                    </div>

                    <Link
                      href={`/reading-room?id=${postcard.id}&from=florida`}
                      style={{
                        display:
                          "block",
                        margin:
                          "10px auto 2px",
                        width:
                          "fit-content",
                        color:
                          "#fff0d1",
                        textDecoration:
                          "none",
                        fontWeight:
                          "bold",
                        fontSize:
                          "14px",
                      }}
                    >
                      Open Exhibit →
                    </Link>
                  </article>
                );
              }
            )}

            {/* COMING NEXT WEEK */}
            <article
              className="florida-card florida-wood-frame"
              style={{
                padding: "9px",
              }}
            >
              <div
                className="florida-image-stage"
                style={{
                  minHeight: "300px",
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#5a321b",
                      fontSize: "26px",
                      fontWeight: "bold",
                    }}
                  >
                    More Postcards Coming
                    Next Week
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      color: "#8a6432",
                      fontStyle: "italic",
                    }}
                  >
                    Please Come Back Soon
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}
      </section>

      {/* LIGHTBOX */}
      {enlargedPostcard?.front_image_url && (
        <div
          className="florida-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() =>
            setEnlargedPostcard(null)
          }
        >
          <div
            className="florida-lightbox-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="florida-lightbox-close"
              onClick={() =>
                setEnlargedPostcard(null)
              }
            >
              ×
            </button>

            <div className="florida-lightbox-stage">
              <img
                className={`florida-lightbox-image ${
                  (enlargedPostcard.display_rotation ??
                    0) %
                    180 ===
                  90
                    ? "rotated-quarter"
                    : ""
                }`}
                src={
                  enlargedPostcard.front_image_url
                }
                alt={
                  enlargedPostcard.title ||
                  "Florida postcard"
                }
                style={{
                  transform: `rotate(${
                    enlargedPostcard.display_rotation ??
                    0
                  }deg)`,
                }}
              />
            </div>

            <div
              style={{
                color: "#f8e8c7",
                textAlign: "center",
                fontSize: "18px",
              }}
            >
              {enlargedPostcard.title ||
                "Untitled Florida Postcard"}
            </div>

            <p
              style={{
                color: "#cdbb99",
                textAlign: "center",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              Click outside the postcard or
              press Esc to close.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer
        style={{
          background: "#171411",
          color: "#cfbfaa",
          padding: "48px 24px",
          textAlign: "center",
          borderTop:
            "4px solid #a67b36",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "20px",
            color: "#fff0d1",
          }}
        >
          The Virtual Postcard Museum
        </p>

        <p
          style={{
            margin: "0 0 20px",
          }}
        >
          Founded &amp; Curated by Clarence E.
          Pridemore Jr.
        </p>

        <Link
          href="/"
          style={{
            color: "#7df9ff",
            textDecoration: "none",
          }}
        >
          Return to the Museum Entrance
        </Link>

        <p
          style={{
            margin: "22px 0 0",
            fontStyle: "italic",
            color: "#a99983",
          }}
        >
          Every Postcard Has a Story.
        </p>
      </footer>
    </main>
  );
}
const regionalButton = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: "7px",
  background: "#fff7e7",
  border: "2px solid #c4944d",
  color: "#174c52",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "bold" as const,
  letterSpacing: "1.2px",
  textTransform: "uppercase" as const,
  boxShadow: "0 4px 10px rgba(55,45,25,.12)",
};
