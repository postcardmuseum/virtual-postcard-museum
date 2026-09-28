"use client";

import { useState } from "react";

export type PostcardExhibitProps = {
  exhibitLabel?: string;
  title?: string;
  description?: string;
  frontImage?: string;
  backImage?: string;
  frontAlt?: string;
  backAlt?: string;
  accessionNumber?: string;
  location?: string;
  date?: string;
  curatorNote?: string;
  collectionName?: string;
  placeholderTheme?: "california" | "florida" | "classic";
  displayRotation?: number;
  actionHref?: string;
  actionLabel?: string;
};

export default function PostcardExhibit({
  exhibitLabel = "Featured Museum Exhibit",
  title = "Featured Postcard",
  description = "Turn the postcard over to examine the message side, then use the magnify control for a closer museum view.",
  frontImage,
  backImage,
  frontAlt = "Front of postcard",
  backAlt = "Back of postcard",
  accessionNumber = "Museum Accession No. Pending",
  location,
  date,
  curatorNote,
  collectionName = "Clarence E. Pridemore Jr. Collection",
  placeholderTheme = "classic",
  displayRotation = 0,
  actionHref,
  actionLabel,
}: PostcardExhibitProps) {
  const [showBack, setShowBack] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const normalizedRotation =
    ((Number(displayRotation || 0) % 360) + 360) % 360;

  const portraitDisplay =
    normalizedRotation === 90 || normalizedRotation === 270;

  const placeholderFront =
    placeholderTheme === "florida"
      ? "linear-gradient(180deg,#68c8cc 0%,#f1b857 43%,#2e8b8d 44%,#174b51 100%)"
      : placeholderTheme === "california"
      ? "linear-gradient(180deg,#f1b16a 0%,#dc6c53 43%,#457c89 44%,#183f49 100%)"
      : "linear-gradient(180deg,#ddb678 0%,#b76d52 48%,#536f74 49%,#263f43 100%)";

  return (
    <section
      style={{
        maxWidth: "1050px",
        margin: "-82px auto 78px",
        padding: "0 24px",
        position: "relative",
        zIndex: 7,
      }}
    >
      <style>{`
        .vpm-postcard-stage { perspective: 1500px; }

        .vpm-postcard-flipper {
          position: relative;
          width: 100%;
          transform-style: preserve-3d;
          transition: transform .85s cubic-bezier(.2,.7,.2,1);
        }

        .vpm-postcard-flipper.landscape-display {
          aspect-ratio: 3 / 2;
        }

        .vpm-postcard-flipper.portrait-display {
          width: min(500px, 82%);
          aspect-ratio: 2 / 3;
          margin: 0 auto;
        }

        .vpm-postcard-flipper.is-flipped {
          transform: rotateY(180deg);
        }

        .vpm-postcard-face {
          position: absolute;
          inset: 0;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border: 10px solid #f7eedb;
          outline: 2px solid #8d642f;
          box-shadow:
            0 18px 34px rgba(45,27,17,.36),
            inset 0 0 22px rgba(69,42,20,.18);
          background-position: center;
          background-repeat: no-repeat;
          background-size: contain;
        }

        .vpm-postcard-image-layer {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .vpm-postcard-image-layer img {
          display: block;
          object-fit: contain;
          transform-origin: center center;
        }

        .vpm-postcard-image-layer.landscape-image img {
          width: 100%;
          height: 100%;
        }

        .vpm-postcard-image-layer.portrait-image img {
          width: 150%;
          height: auto;
          max-width: none;
          max-height: none;
        }

        .vpm-postcard-back {
          transform: rotateY(180deg);
        }

        .vpm-postcard-zoom {
          position: relative;
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .vpm-postcard-zoom.is-zoomed {
          transform: scale(1.12);
          box-shadow: 0 30px 65px rgba(35,20,13,.48);
          z-index: 20;
        }

        .vpm-museum-control {
          transition: transform .2s ease, filter .2s ease;
        }

        .vpm-museum-control:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        @media (max-width: 650px) {
          .vpm-postcard-face { border-width: 6px; }

          .vpm-postcard-flipper.portrait-display {
            width: min(440px, 92%);
          }

          .vpm-postcard-zoom.is-zoomed {
            transform: scale(1.04);
          }
        }
      `}</style>

      <div
        style={{
          background:
            "linear-gradient(145deg,#fff5e3 0%,#e3c18c 50%,#fff0d8 100%)",
          border: "12px solid #4c3125",
          outline: "3px solid #c29245",
          boxShadow: "0 22px 55px rgba(50,29,20,.3)",
          padding: "clamp(28px,6vw,60px)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 12px",
            color: "#955e1d",
            fontWeight: "bold",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          {exhibitLabel}
        </p>

        <h2
          style={{
            margin: "8px 0 12px",
            fontSize: "clamp(31px,5vw,48px)",
            fontWeight: "normal",
            color: "#4e2d20",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            maxWidth: "680px",
            margin: "0 auto 30px",
            color: "#6a4f3b",
            fontSize: "18px",
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>

        <div
          className="vpm-postcard-stage"
          style={{
            maxWidth: "790px",
            margin: "0 auto",
            padding: "clamp(18px,4vw,38px)",
            background:
              "radial-gradient(circle at center,#fffaf0 0%,#d6b172 100%)",
            border: "1px solid #bd9457",
            boxShadow:
              "inset 0 0 44px rgba(94,56,25,.24),0 12px 25px rgba(74,45,23,.18)",
          }}
        >
          <div
            className={`vpm-postcard-zoom ${
              zoomed ? "is-zoomed" : ""
            }`}
          >
            <div
              className={`vpm-postcard-flipper ${
                portraitDisplay ? "portrait-display" : "landscape-display"
              } ${showBack ? "is-flipped" : ""}`}
            >
              <div
                className="vpm-postcard-face"
                aria-label={frontAlt}
                style={{
                  backgroundColor: "#e7d7bb",
                  backgroundImage: frontImage ? undefined : placeholderFront,
                }}
              >
                {frontImage && (
                  <div
                    className={`vpm-postcard-image-layer ${
                      portraitDisplay ? "portrait-image" : "landscape-image"
                    }`}
                  >
                    <img
                      src={frontImage}
                      alt={frontAlt}
                      style={{
                        transform: `rotate(${normalizedRotation}deg)`,
                      }}
                    />
                  </div>
                )}

                {!frontImage && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: "8%",
                        right: "8%",
                        bottom: "17%",
                        height: "8%",
                        background: "#71372d",
                        boxShadow: "0 4px 0 rgba(37,24,22,.5)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "19%",
                        bottom: "20%",
                        width: "7px",
                        height: "44%",
                        background: "#71372d",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "19%",
                        bottom: "20%",
                        width: "7px",
                        height: "44%",
                        background: "#71372d",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "19%",
                        right: "19%",
                        top: "31%",
                        height: "28%",
                        borderTop: "5px solid #71372d",
                        borderRadius: "50%",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "5%",
                        right: "5%",
                        bottom: "5%",
                        padding: "12px 18px",
                        color: "#fff1c8",
                        background: "rgba(30,20,18,.72)",
                        borderTop: "1px solid rgba(236,196,113,.75)",
                        fontSize: "clamp(17px,3vw,28px)",
                        letterSpacing: "2px",
                        textShadow: "0 2px 5px rgba(0,0,0,.55)",
                      }}
                    >
                      {location
                        ? `Greetings from ${location}`
                        : "Vintage Postcard"}
                    </div>
                  </>
                )}
              </div>

              <div
                className="vpm-postcard-face vpm-postcard-back"
                aria-label={backAlt}
                style={{
                  backgroundColor: "#eee4cf",
                  backgroundImage: backImage
                    ? undefined
                    : "linear-gradient(100deg,rgba(125,93,51,.08),transparent 28%),repeating-linear-gradient(0deg,#eee4cf 0 28px,#d8ccb6 29px 30px)",
                }}
              >
                {backImage && (
                  <div
                    className={`vpm-postcard-image-layer ${
                      portraitDisplay ? "portrait-image" : "landscape-image"
                    }`}
                  >
                    <img
                      src={backImage}
                      alt={backAlt}
                      style={{
                        transform: `rotate(${normalizedRotation}deg)`,
                      }}
                    />
                  </div>
                )}

                {!backImage && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: "8%",
                        bottom: "9%",
                        left: "50%",
                        width: 1,
                        background: "#9b8c74",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "6%",
                        top: "10%",
                        width: "39%",
                        textAlign: "left",
                        fontFamily:
                          "'Segoe Print','Comic Sans MS',cursive",
                        fontSize: "clamp(13px,2.2vw,20px)",
                        lineHeight: 1.7,
                        transform: "rotate(-2deg)",
                        color: "#4f4031",
                      }}
                    >
                      Dear Friend,
                      <br />
                      <br />
                      This space will show the actual handwritten message from
                      the scanned postcard back.
                      <br />
                      <br />
                      Wish you were here!
                    </div>

                    <div
                      style={{
                        position: "absolute",
                        right: "6%",
                        top: "9%",
                        width: "38%",
                        height: "82%",
                        textAlign: "left",
                        color: "#4f4031",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: "32%",
                          aspectRatio: "4 / 5",
                          display: "grid",
                          placeItems: "center",
                          border: "2px dashed #8d6d49",
                          background: "#c69f69",
                          color: "#4b3017",
                          fontSize: "clamp(9px,1.5vw,13px)",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        Postage
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          left: "2%",
                          right: "3%",
                          top: "43%",
                          fontFamily:
                            "'Segoe Print','Comic Sans MS',cursive",
                          fontSize: "clamp(13px,2.1vw,20px)",
                          lineHeight: 1.9,
                          transform: "rotate(1deg)",
                        }}
                      >
                        Recipient Name
                        <br />
                        Street Address
                        <br />
                        City and State
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          <button
            className="vpm-museum-control"
            type="button"
            onClick={() => setShowBack((current) => !current)}
            style={{
              minWidth: "220px",
              padding: "15px 23px",
              border: "2px solid #6f4718",
              background:
                "linear-gradient(180deg,#deb25f,#a97029)",
              color: "#26170b",
              fontWeight: "bold",
              letterSpacing: "1px",
              cursor: "pointer",
              boxShadow: "0 7px 14px rgba(67,42,16,.28)",
            }}
          >
            ↻ {showBack ? "Show Postcard Front" : "Turn Postcard Over"}
          </button>

          <button
            className="vpm-museum-control"
            type="button"
            onClick={() => setZoomed((current) => !current)}
            style={{
              minWidth: "175px",
              padding: "15px 23px",
              border: "2px solid #705021",
              background:
                "linear-gradient(180deg,#5a3829,#302019)",
              color: "#f2d69f",
              fontWeight: "bold",
              letterSpacing: "1px",
              cursor: "pointer",
              boxShadow: "0 7px 14px rgba(67,42,16,.28)",
            }}
          >
            {zoomed ? "− Return to Normal" : "＋ Magnify Postcard"}
          </button>

          {actionHref && actionLabel && (
            <a
              className="vpm-museum-control"
              href={actionHref}
              style={{
                minWidth: "205px",
                padding: "15px 23px",
                border: "2px solid #8a5a24",
                background:
                  "linear-gradient(180deg,#9a5a32,#5b2f20)",
                color: "#ffe2a8",
                fontWeight: "bold",
                letterSpacing: "1px",
                textDecoration: "none",
                boxShadow: "0 7px 14px rgba(67,42,16,.28)",
              }}
            >
              {actionLabel}
            </a>
          )}
        </div>

        <p
          aria-live="polite"
          style={{
            margin: "18px 0 0",
            color: "#745437",
            fontWeight: "bold",
          }}
        >
          Currently viewing: {showBack ? "postcard back" : "postcard front"}
        </p>

        <div
          style={{
            maxWidth: "650px",
            margin: "30px auto 0",
            padding: "19px",
            background:
              "linear-gradient(180deg,#d2a551,#9f6c26)",
            border: "2px solid #775019",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.45),0 5px 12px rgba(67,43,14,.25)",
            color: "#25180b",
          }}
        >
          <strong style={{ display: "block", fontSize: "19px" }}>
            {title}
          </strong>

          {(location || date) && (
            <span style={{ display: "block", marginTop: "8px" }}>
              {[location, date].filter(Boolean).join(" • ")}
            </span>
          )}

          <span style={{ display: "block", marginTop: "7px" }}>
            {accessionNumber}
          </span>

          {curatorNote && (
            <span style={{ display: "block", marginTop: "7px" }}>
              {curatorNote}
            </span>
          )}

          <em style={{ display: "block", marginTop: "7px" }}>
            {collectionName}
          </em>
        </div>
      </div>
    </section>
  );
}