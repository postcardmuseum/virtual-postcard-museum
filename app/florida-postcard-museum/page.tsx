import Link from "next/link";

export default function FloridaPostcardMuseum() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #071f2b 0%, #0d3540 25%, #f4dfbd 25%, #f7ead2 100%)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#1d2c2f",
        border: "3px solid #69f3e5",
        boxShadow:
          "inset 0 0 14px rgba(105,243,229,.75), inset 0 0 34px rgba(255,105,145,.18)",
      }}
    >
      {/* TOP ART DECO HEADER */}
      <section
        style={{
          textAlign: "center",
          padding: "16px 20px 10px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "78px",
            height: "36px",
            borderRadius: "78px 78px 0 0",
            background:
              "repeating-linear-gradient(90deg, #eeb95c 0 4px, transparent 4px 10px)",
            margin: "0 auto 5px",
            opacity: 0.9,
          }}
        />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            borderTop: "3px solid #d9aa52",
            borderBottom: "3px solid #d9aa52",
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              color: "#f4d48a",
              fontSize: "24px",
              letterSpacing: "5px",
              marginBottom: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            The
          </div>

          <h1
            style={{
              margin: 0,
              color: "#fff4db",
              fontSize: "clamp(34px, 5.8vw, 60px)",
              letterSpacing: "5px",
              fontWeight: 700,
              textTransform: "uppercase",
              textShadow:
                "0 0 7px rgba(255,120,150,.75), 0 0 16px rgba(255,90,140,.45)",
            }}
          >
            Florida
          </h1>

          <div
            style={{
              color: "#77f2e5",
              fontSize: "clamp(20px, 3.3vw, 32px)",
              letterSpacing: "6px",
              textTransform: "uppercase",
              marginTop: "2px",
              textShadow:
                "0 0 6px #53dccc, 0 0 14px rgba(83,220,204,.7)",
            }}
          >
            Postcard Museum
          </div>
        </div>

        <p
          style={{
            margin: "6px auto 0",
            color: "#f8e4bc",
            fontSize: "17px",
            fontStyle: "italic",
            letterSpacing: "1px",
          }}
        >
          Vintage Florida, One Postcard at a Time
        </p>
      </section>

      {/* INTRODUCTION */}
      <section
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "14px 24px 4px",
        }}
      >
        <div
          style={{
            background: "#fff7e7",
            border: "2px solid #c4944d",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,.15)",
            padding: "18px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#b57c32",
              fontSize: "20px",
              letterSpacing: "8px",
              marginBottom: "6px",
            }}
          >
            ◆ ◆ ◆
          </div>

          <h2
            style={{
              fontSize: "28px",
              color: "#174c52",
              margin: "0 0 10px",
            }}
          >
            A Journey Through Old Florida
          </h2>

          <p
            style={{
              maxWidth: "780px",
              margin: "0 auto",
              lineHeight: 1.6,
              fontSize: "17px",
            }}
          >
            Discover Florida&apos;s past through vintage postcards depicting its
            cities, beaches, hotels, roadside attractions, architecture,
            businesses, transportation, and everyday life.
          </p>

          <p
            style={{
              maxWidth: "780px",
              margin: "9px auto 0",
              lineHeight: 1.6,
              fontSize: "16px",
            }}
          >
            The Florida Postcard Museum is a special exhibit of
            <strong> The Virtual Postcard Museum</strong>, preserving and sharing
            Florida history one postcard at a time.
          </p>

          <p
            style={{
              maxWidth: "780px",
              margin: "11px auto 0",
              lineHeight: 1.6,
              fontSize: "16px",
              color: "#174c52",
              fontWeight: "bold",
            }}
          >
            Explore more than 1,250 Florida postcards, with new postcards
            posted weekly.
          </p>
        </div>
      </section>

      {/* FLORIDA COLLECTION ENTRANCES */}
      <section
        id="florida-collection-links"
        style={{
          maxWidth: "1050px",
          margin: "12px auto 24px",
          padding: "0 24px",
        }}
      >
        {/* CONTINUE BELOW PLAQUE */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2px",
          }}
        >
          <a
            href="#florida-collection-links"
            style={{
              display: "inline-block",
              textDecoration: "none",
              color: "#24170a",
            }}
          >
            <div
              style={{
                padding: "9px 15px 11px",
                background:
                  "linear-gradient(180deg, #e6c777 0%, #bd8c38 100%)",
                border: "2px ridge #765019",
                outline: "1px solid rgba(105,243,229,0.45)",
                boxShadow:
                  "0 6px 12px rgba(66,42,20,0.22), 0 0 12px rgba(105,243,229,0.42), 0 0 22px rgba(255,105,145,0.16)",
                textAlign: "center",
                minWidth: "170px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Continue Below
              </div>

              <div
                style={{
                  fontSize: "12px",
                  marginTop: "2px",
                }}
              >
                Florida Exhibits
              </div>

              <div
                style={{
                  fontSize: "18px",
                  lineHeight: 1,
                  marginTop: "3px",
                }}
              >
                ▼
              </div>
            </div>
          </a>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "14px",
            color: "#174c52",
            fontSize: "17px",
            fontWeight: "bold",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Explore the Florida Collection
        </div>

        {/* MIAMI - KEEP SQUARE */}
        <Link
          href="/collection/florida?city=Miami"
          style={{
            display: "block",
            textDecoration: "none",
            marginBottom: "17px",
          }}
        >
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              background:
                "linear-gradient(135deg, #103d46 0%, #183f53 55%, #492f50 100%)",
              border: "3px solid #68f0e2",
              boxShadow:
                "0 0 9px rgba(104,240,226,.9), 0 0 22px rgba(255,103,148,.55)",
            }}
          >
            <div
              style={{
                color: "#ff78a2",
                fontSize: "clamp(34px, 5.5vw, 52px)",
                fontWeight: "bold",
                letterSpacing: "8px",
                textShadow:
                  "0 0 6px #ff78a2, 0 0 16px rgba(255,120,162,.85)",
              }}
            >
              MIAMI
            </div>

            <div
              style={{
                color: "#8dfff2",
                marginTop: "4px",
                fontSize: "15px",
                letterSpacing: "3px",
              }}
            >
              Explore Miami Postcards
            </div>
          </div>
        </Link>

        {/* REGIONAL COLLECTIONS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))",
            gap: "15px",
            alignItems: "stretch",
          }}
        >
          {/* FORT LAUDERDALE / HOLLYWOOD */}
          <Link
            href="/collection/florida?city=Fort%20Lauderdale"
            style={collectionLink}
          >
            <div style={collectionPanel}>
              <div style={collectionTitle}>
                Fort Lauderdale / Hollywood
              </div>

              <div style={collectionDescription}>
                Beaches, hotels, streets, landmarks and South Florida life from
                neighboring Fort Lauderdale and Hollywood.
              </div>
            </div>
          </Link>

          {/* PALM BEACH */}
          <Link
            href="/collection/florida?city=Palm%20Beach"
            style={collectionLink}
          >
            <div style={collectionPanel}>
              <div style={collectionTitle}>Palm Beach</div>

              <div style={collectionDescription}>
                Hotels, resorts, landmarks and historic Palm Beach views.
              </div>
            </div>
          </Link>

          {/* OLD FLORIDA */}
          <Link
            href="/collection/florida?era=old-florida"
            style={collectionLink}
          >
            <div style={collectionPanel}>
              <div style={collectionTitle}>Old Florida</div>

              <div
                style={{
                  marginTop: "3px",
                  color: "#8b5e2b",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  fontSize: "13px",
                }}
              >
                1920 AND BEFORE
              </div>

              <div style={collectionDescription}>
                Early Florida postcards from the first decades of the postcard
                era.
              </div>
            </div>
          </Link>
        </div>

        {/* VIEW ENTIRE FLORIDA COLLECTION */}
        <div
          style={{
            textAlign: "center",
            margin: "22px 0 6px",
          }}
        >
          <Link
            href="/collection/florida"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "22px",
              width: "100%",
              maxWidth: "900px",
              margin: "0 auto",
              boxSizing: "border-box",
              padding: "16px 30px",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, #173f47 0%, #0d6872 58%, #32505a 100%)",
              color: "#fff3cf",
              border: "2px solid #e3b65b",
              outline: "1px solid rgba(105,243,229,.45)",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "18px",
              letterSpacing: "1.5px",
              boxShadow:
                "0 7px 16px rgba(0,0,0,.18), 0 0 10px rgba(105,243,229,.38), 0 0 18px rgba(255,105,145,.14)",
            }}
          >
            <span
              style={{
                color: "#e9bd61",
                fontSize: "18px",
              }}
            >
              ◆
            </span>

            <span>VIEW THE ENTIRE FLORIDA COLLECTION</span>

            <span
              style={{
                color: "#e9bd61",
                fontSize: "18px",
              }}
            >
              ◆
            </span>
          </Link>
        </div>
      </section>

      {/* FEATURED POSTCARD */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "18px auto 24px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            border: "4px double #b88645",
            padding: "12px",
            background: "#0e4045",
            boxShadow: "0 12px 30px rgba(0,0,0,.25)",
          }}
        >
          <div
            style={{
              background: "#f8ead2",
              padding: "26px",
              textAlign: "center",
              border: "2px solid #d7a95b",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                letterSpacing: "5px",
                color: "#98672b",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Featured Florida Postcard
            </div>

            <div
              style={{
                maxWidth: "680px",
                height: "320px",
                margin: "0 auto",
                background:
                  "linear-gradient(145deg, #69c9c2, #f0c37d 58%, #e77c84)",
                border: "12px solid #fff9ec",
                boxShadow: "0 7px 20px rgba(0,0,0,.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "46px", marginBottom: "7px" }}>
                  🌴
                </div>

                <div
                  style={{
                    fontSize: "23px",
                    color: "#174c52",
                    fontWeight: "bold",
                  }}
                >
                  Florida Postcard Image
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "15px",
                    color: "#4c5555",
                  }}
                >
                  We can replace this with one of your actual postcards.
                </div>
              </div>
            </div>

            <Link
              href="/collection/florida"
              style={{
                display: "inline-block",
                marginTop: "23px",
                padding: "14px 30px",
                borderRadius: "8px",
                background: "#103b42",
                border: "2px solid #67eee0",
                color: "#aafff5",
                textDecoration: "none",
                fontSize: "18px",
                fontWeight: "bold",
                letterSpacing: "2px",
                boxShadow:
                  "0 0 8px rgba(92,240,224,.9), 0 0 18px rgba(92,240,224,.55)",
                textTransform: "uppercase",
              }}
            >
              Enter the Florida Collection
            </Link>
          </div>
        </div>
      </section>

      {/* LOWER MUSEUM LINKS */}
      <section
        style={{
          maxWidth: "1050px",
          margin: "32px auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "22px",
        }}
      >
        <Link href="/collection/florida" style={collectionLink}>
          <div style={panelStyle}>
            <div style={panelIcon}>🌴</div>

            <h3 style={panelHeading}>Florida Collection</h3>

            <p style={panelText}>
              Browse the complete Florida postcard collection.
            </p>
          </div>
        </Link>

        <Link href="/" style={collectionLink}>
          <div style={panelStyle}>
            <div style={panelIcon}>🏛️</div>

            <h3 style={panelHeading}>The Virtual Postcard Museum</h3>

            <p style={panelText}>
              Continue through the main museum and explore postcards from
              Florida and beyond.
            </p>
          </div>
        </Link>
      </section>

      {/* FRIENDS OF THE MUSEUM */}
      <section
        style={{
          maxWidth: "800px",
          margin: "24px auto 10px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "#fff7e7",
            border: "2px solid #c4944d",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 6px 16px rgba(55,45,25,.12)",
          }}
        >
          <div
            style={{
              color: "#b57c32",
              fontSize: "18px",
              letterSpacing: "7px",
              marginBottom: "6px",
            }}
          >
            ◆ ◆ ◆
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#174c52",
              fontSize: "23px",
            }}
          >
            Become a Friend of the Museum
          </h3>

          <p
            style={{
              margin: "0 auto 14px",
              maxWidth: "600px",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#51473e",
            }}
          >
            Stay connected with the Florida Postcard Museum and receive news
            about new postcards, exhibits and museum updates.
          </p>

          <a
            href="mailto:curator@virtualpostcardmuseum.org?subject=Become%20a%20Friend%20of%20the%20Museum"
            style={{
              display: "inline-block",
              padding: "11px 24px",
              borderRadius: "8px",
              background: "#103b42",
              border: "2px solid #67eee0",
              color: "#aafff5",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "bold",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              boxShadow:
                "0 0 7px rgba(92,240,224,.75), 0 0 15px rgba(92,240,224,.35)",
            }}
          >
            Become a Friend of the Museum
          </a>
        </div>
      </section>

      {/* ART DECO DIVIDER */}
      <div
        style={{
          maxWidth: "800px",
          margin: "22px auto",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          padding: "0 24px",
        }}
      >
        <div style={{ height: "2px", background: "#b88645", flex: 1 }} />

        <div style={{ color: "#b88645", fontSize: "24px" }}>◆</div>

        <div style={{ height: "2px", background: "#b88645", flex: 1 }} />
      </div>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "22px 20px 36px",
          color: "#4f5754",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            marginBottom: "7px",
            color: "#174c52",
            fontWeight: "bold",
          }}
        >
          Part of The Virtual Postcard Museum
        </p>

        <p
          style={{
            margin: "6px 0",
            fontSize: "15px",
          }}
        >
          Founded &amp; Curated by Clarence E. Pridemore Jr.
        </p>

        <div
          style={{
            marginTop: "17px",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "18px",
          }}
        >
          <Link href="/collection/florida" style={footerLink}>
            Florida Collection
          </Link>

          <Link href="/" style={footerLink}>
            Museum Entrance
          </Link>

          <Link href="/history" style={footerLink}>
            History of Postcards
          </Link>

          <a
            href="mailto:curator@virtualpostcardmuseum.org?subject=Become%20a%20Friend%20of%20the%20Museum"
            style={footerLink}
          >
            Become a Friend of the Museum
          </a>
        </div>
      </footer>
    </main>
  );
}

const collectionLink = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
  height: "100%",
};

const collectionPanel = {
  background: "#fff7e7",
  border: "2px solid #c4944d",
  borderRadius: "10px",
  padding: "20px 16px",
  textAlign: "center" as const,
  minHeight: "155px",
  height: "100%",
  boxShadow: "0 6px 16px rgba(55,45,25,.15)",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "flex-start" as const,
  alignItems: "center" as const,
};

const collectionTitle = {
  color: "#174c52",
  fontSize: "23px",
  fontWeight: "bold" as const,
  minHeight: "34px",
};

const collectionDescription = {
  marginTop: "10px",
  color: "#51473e",
  lineHeight: 1.5,
  fontSize: "14px",
};

const panelStyle = {
  background: "#fff7e7",
  border: "2px solid #c4944d",
  borderRadius: "10px",
  minHeight: "185px",
  padding: "24px 22px",
  textAlign: "center" as const,
  boxShadow: "0 6px 16px rgba(55,45,25,.15)",
};

const panelIcon = {
  fontSize: "31px",
  minHeight: "42px",
  fontWeight: "bold" as const,
  letterSpacing: "3px",
  color: "#17646a",
};

const panelHeading = {
  color: "#174c52",
  fontSize: "22px",
  margin: "10px 0",
};

const panelText = {
  lineHeight: 1.6,
  fontSize: "15px",
  margin: 0,
};

const footerLink = {
  color: "#17646a",
  fontWeight: "bold" as const,
  textDecoration: "none",
};