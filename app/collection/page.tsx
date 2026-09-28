import Link from "next/link";

const openGalleries = [
  {
    title: "The Grand Gallery",
    subtitle: "The Heart of the Museum",
    icon: "🏛️",
    href: "/grand-gallery",
    description:
      "Enter the museum’s central hall and explore regional, topical, and special exhibitions from across the collection.",
    details: "Regional galleries • Special exhibits • Museum highlights",
  },
  {
    title: "Florida Gallery",
    subtitle: "The Sunshine State Collection",
    icon: "🌴",
    href: "/florida",
    description:
      "Explore Florida’s beaches, cities, hotels, roadside attractions, natural wonders, and changing communities.",
    details: "Over 1,000 Florida postcards",
  },
  {
    title: "California Gallery",
    subtitle: "The Golden Coast Collection",
    icon: "🌉",
    href: "/california",
    description:
      "Travel from San Francisco and Southern California to the redwoods, mountains, national parks, and Route 66.",
    details: "Cities • Coastlines • Parks • Roadside history",
  },
  {
    title: "Holiday Gallery",
    subtitle: "Greetings Through the Seasons",
    icon: "🎄",
    href: "/holiday",
    description:
      "Discover Christmas, Valentine’s Day, Easter, Halloween, Thanksgiving, New Year, and patriotic postcards.",
    details: "Holiday artwork • Traditions • Vintage greetings",
  },
  {
    title: "Humor Gallery",
    subtitle: "Postcards With a Punchline",
    icon: "😂",
    href: "/humor",
    description:
      "Enjoy comic characters, travel troubles, romance, military jokes, tall tales, and everyday mischief.",
    details: "Comic cards • Novelty humor • Social history",
  },
  {
    title: "History of Postcards",
    subtitle: "Permanent Educational Exhibition",
    icon: "📜",
    href: "/history",
    description:
      "Walk through more than 150 years of postcard history, printing methods, postal changes, and collecting.",
    details: "Timeline • Printing • Postal history • Preservation",
  },
];

const futureGalleries = [
  {
    title: "Railroads & Stations",
    icon: "🚂",
    description:
      "Locomotives, depots, railway hotels, scenic routes, and the golden age of train travel.",
  },
  {
    title: "Ocean Liners & Steamships",
    icon: "🚢",
    description:
      "Passenger ships, ports, cruise travel, maritime views, and ocean transportation.",
  },
  {
    title: "Aviation",
    icon: "✈️",
    description:
      "Early aircraft, airports, airlines, military aviation, and the excitement of flight.",
  },
  {
    title: "Hotels & Resorts",
    icon: "🏨",
    description:
      "Grand hotels, seaside resorts, motor courts, dining rooms, and vacation destinations.",
  },
  {
    title: "National Parks",
    icon: "🏞️",
    description:
      "Historic views of America’s treasured landscapes, wildlife, lodges, and scenic roads.",
  },
  {
    title: "Postcard Folders",
    icon: "🗂️",
    description:
      "Fold-out souvenir folders, panoramic views, connected postcard sets, and unusual formats.",
  },
  {
    title: "Route 66 & Roadside America",
    icon: "🚗",
    description:
      "Motels, diners, service stations, tourist courts, highways, and roadside attractions.",
  },
  {
    title: "World’s Fairs & Expositions",
    icon: "🎡",
    description:
      "Architecture, exhibits, midway attractions, monuments, and souvenirs from historic fairs.",
  },
  {
    title: "Military & Naval",
    icon: "⚓",
    description:
      "Military camps, forts, ships, training centers, patriotic greetings, and service life.",
  },
  {
    title: "Advertising & Novelty",
    icon: "🎭",
    description:
      "Business advertising, unusual designs, mechanical cards, product promotions, and curiosities.",
  },
  {
    title: "International Collection",
    icon: "🌎",
    description:
      "Cities, landmarks, landscapes, and everyday scenes from countries around the world.",
  },
  {
    title: "Greetings From America",
    icon: "📮",
    description:
      "Large-letter postcards, state greetings, city souvenirs, and colorful travel designs.",
  },
];

const collectionFacts = [
  {
    number: "5,000+",
    label: "Postcards Preserved",
    icon: "📬",
  },
  {
    number: "1,000+",
    label: "Florida Postcards",
    icon: "🌴",
  },
  {
    number: "150+",
    label: "Years of History",
    icon: "🕰️",
  },
  {
    number: "Weekly",
    label: "New Museum Additions",
    icon: "⭐",
  },
];

export default function CollectionPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#eee3cb",
        color: "#392c23",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <style>{`
        .collection-wayfinder {
          position: fixed;
          right: 22px;
          top: 44%;
          z-index: 20;
          width: 124px;
          padding: 11px 9px 12px;
          border: 1px solid #d0a552;
          outline: 2px solid rgba(73,43,18,.75);
          background: linear-gradient(180deg, rgba(76,45,22,.96), rgba(37,21,12,.97));
          color: #f4d58c;
          text-align: center;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-size: 11px;
          line-height: 1.45;
          box-shadow:
            inset 0 0 0 2px rgba(225,184,95,.14),
            0 8px 18px rgba(0,0,0,.42);
        }

        .collection-wayfinder strong {
          display: block;
          margin-top: 5px;
          font-size: 23px;
          line-height: 1;
          color: #f0c969;
        }

        .collection-wayfinder:hover {
          filter: brightness(1.08);
        }

        @media (max-width: 700px) {
          .collection-wayfinder {
            right: 8px;
            top: 42%;
            width: 92px;
            padding: 8px 6px;
            font-size: 9px;
          }
        }
      `}</style>

      <a
        href="#featured-galleries"
        className="collection-wayfinder"
        aria-label="Choose a gallery"
      >
        Choose a
        <br />
        Gallery
        <strong aria-hidden="true">↓</strong>
      </a>

      <header
        style={{
          color: "#fff3dc",
          background:
            "linear-gradient(180deg, #181310 0%, #35261f 50%, #71352f 100%)",
          borderBottom: "8px solid #b78b43",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "24px 24px 18px",
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
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#e8c979",
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
                style={{
                  color: "#fff3dc",
                  textDecoration: "none",
                }}
              >
                Grand Gallery
              </Link>

              <Link
                href="/history"
                style={{
                  color: "#fff3dc",
                  textDecoration: "none",
                }}
              >
                Postcard History
              </Link>

              <Link
                href="/florida"
                style={{
                  color: "#fff3dc",
                  textDecoration: "none",
                }}
              >
                Florida
              </Link>

              <Link
                href="/california"
                style={{
                  color: "#fff3dc",
                  textDecoration: "none",
                }}
              >
                California
              </Link>
            </div>
          </nav>
        </div>

        <section
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "36px 24px 72px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#e5c477",
              fontWeight: "bold",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Visitor Directory
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "9px 22px",
              border: "2px solid #c89c52",
              outline: "5px solid rgba(255,255,255,0.07)",
              background:
                "linear-gradient(135deg, rgba(89,40,34,0.95), rgba(121,57,49,0.95))",
              boxShadow:
                "0 15px 40px rgba(0,0,0,0.35), inset 0 0 25px rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                color: "#f9dfa3",
                fontSize: "clamp(21px, 4vw, 36px)",
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              The Virtual Postcard Museum
            </span>
          </div>

          <h1
            style={{
              margin: "17px 0 0",
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: "1.04",
              fontWeight: "normal",
              textShadow: "0 5px 20px rgba(0,0,0,0.35)",
            }}
          >
            Collections Directory
          </h1>

          <p
            style={{
              maxWidth: "790px",
              margin: "17px auto 0",
              color: "#eadbc5",
              fontSize: "clamp(18px, 2.3vw, 22px)",
              lineHeight: "1.65",
              fontStyle: "italic",
            }}
          >
            Choose a gallery, enter an exhibition, and discover the places,
            people, celebrations, humor, and history preserved within more than
            5,000 vintage postcards.
          </p>
        </section>
      </header>

      <section
        style={{
          maxWidth: "1040px",
          margin: "-38px auto 50px",
          padding: "0 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "12px 18px 14px",
            textAlign: "center",
            background:
              "linear-gradient(145deg, #fff9e9 0%, #ddc69e 52%, #fff5df 100%)",
            border: "8px solid #3d2c22",
            outline: "3px solid #ae833f",
            boxShadow: "0 22px 58px rgba(45,29,20,0.3)",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#87362f",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            Welcome to the Galleries
          </p>

          <div
            style={{
              marginTop: "8px",
              padding: "7px 13px",
              border: "1px solid #b99b68",
              background:
                "radial-gradient(circle at center, #fffdf5 0%, #e8d7b8 100%)",
              boxShadow: "inset 0 0 48px rgba(81,54,30,0.17)",
            }}
          >
            <div style={{ fontSize: "30px", marginBottom: "4px" }}>🗝️</div>

            <h2
              style={{
                margin: "0",
                color: "#493327",
                fontWeight: "normal",
                fontSize: "clamp(22px, 3.5vw, 32px)",
              }}
            >
              Your Guide to the Museum
            </h2>

            <p
              style={{
                maxWidth: "760px",
                margin: "7px auto 0",
                color: "#665244",
                fontSize: "16px",
                lineHeight: "1.4",
              }}
            >
              The museum is organized into regional, historical, holiday,
              humorous, and special-interest galleries. Open galleries may be
              entered today, while future gallery plaques offer a preview of
              exhibitions being prepared for the collection.
            </p>
          </div>

          <div
            style={{
              maxWidth: "620px",
              margin: "9px auto 0",
              padding: "10px 16px",
              color: "#26190d",
              border: "2px solid #694817",
              background:
                "linear-gradient(180deg, #d8b361 0%, #a47632 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.5), 0 5px 13px rgba(62,39,12,0.25)",
            }}
          >
            <strong style={{ display: "block", fontSize: "15px" }}>
              Museum Collections Directory
            </strong>

            <span style={{ display: "block", marginTop: "7px" }}>
              Open galleries and future exhibitions
            </span>
          </div>
        </div>
      </section>

      <section
        id="featured-galleries"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "16px 24px 92px",
        }}
      >
        <div
          style={{
            maxWidth: "790px",
            margin: "0 auto 50px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              marginBottom: "12px",
              color: "#87362f",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Now Open
          </p>

          <h2
            style={{
              margin: "0",
              color: "#3e2c22",
              fontWeight: "normal",
              fontSize: "clamp(38px, 5vw, 58px)",
            }}
          >
            Featured Museum Galleries
          </h2>

          <p
            style={{
              color: "#68574a",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Select any open gallery to continue your visit.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "27px",
          }}
        >
          {openGalleries.map((gallery) => (
            <Link
              key={gallery.title}
              href={gallery.href}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <article
                style={{
                  height: "100%",
                  minHeight: "380px",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#fff9eb",
                  border: "1px solid #b9965f",
                  boxShadow: "0 13px 29px rgba(64,42,26,0.15)",
                }}
              >
                <div
                  style={{
                    minHeight: "138px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "69px",
                    color: "#fff4dd",
                    background:
                      "linear-gradient(135deg, #33251e 0%, #66342e 100%)",
                    borderBottom: "6px solid #b58942",
                  }}
                >
                  {gallery.icon}
                </div>

                <div
                  style={{
                    flex: "1",
                    padding: "29px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 9px",
                      color: "#913e35",
                      fontSize: "13px",
                      fontWeight: "bold",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    {gallery.subtitle}
                  </p>

                  <h3
                    style={{
                      margin: "0",
                      color: "#412d23",
                      fontSize: "31px",
                      fontWeight: "normal",
                    }}
                  >
                    {gallery.title}
                  </h3>

                  <p
                    style={{
                      color: "#685649",
                      fontSize: "17px",
                      lineHeight: "1.72",
                    }}
                  >
                    {gallery.description}
                  </p>

                  <p
                    style={{
                      marginTop: "auto",
                      paddingTop: "18px",
                      color: "#74552a",
                      borderTop: "1px solid #d1ba94",
                      fontSize: "15px",
                      fontStyle: "italic",
                    }}
                  >
                    {gallery.details}
                  </p>

                  <div
                    style={{
                      marginTop: "17px",
                      padding: "12px 17px",
                      textAlign: "center",
                      color: "#fff7e8",
                      backgroundColor: "#7a3831",
                      fontWeight: "bold",
                      letterSpacing: "1px",
                    }}
                  >
                    Enter Gallery →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "86px 24px",
          color: "#f8ecd5",
          background:
            "linear-gradient(135deg, #211a16 0%, #433027 52%, #6f342e 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1150px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: "790px",
              margin: "0 auto 50px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#dfbd73",
                fontWeight: "bold",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Exhibitions in Preparation
            </p>

            <h2
              style={{
                margin: "12px 0 18px",
                fontSize: "clamp(38px, 5vw, 58px)",
                fontWeight: "normal",
              }}
            >
              Future Museum Galleries
            </h2>

            <p
              style={{
                color: "#e2d3bd",
                fontSize: "19px",
                lineHeight: "1.8",
              }}
            >
              These galleries will open as postcards are scanned, cataloged,
              researched, and prepared for public exhibition.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "22px",
            }}
          >
            {futureGalleries.map((gallery) => (
              <article
                key={gallery.title}
                style={{
                  minHeight: "255px",
                  padding: "28px",
                  backgroundColor: "rgba(255,248,230,0.07)",
                  border: "1px solid rgba(226,190,117,0.37)",
                  boxShadow: "inset 0 0 25px rgba(255,255,255,0.025)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div style={{ fontSize: "46px" }}>{gallery.icon}</div>

                  <span
                    style={{
                      padding: "7px 10px",
                      color: "#e8c97f",
                      border: "1px solid #a98142",
                      fontSize: "11px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    Coming Soon
                  </span>
                </div>

                <h3
                  style={{
                    margin: "20px 0 11px",
                    color: "#f3dfad",
                    fontSize: "25px",
                    fontWeight: "normal",
                  }}
                >
                  {gallery.title}
                </h3>

                <p
                  style={{
                    margin: "0",
                    color: "#dbcdb8",
                    lineHeight: "1.7",
                  }}
                >
                  {gallery.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1130px",
          margin: "0 auto",
          padding: "90px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto 48px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#87362f",
              fontWeight: "bold",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            The Museum by the Numbers
          </p>

          <h2
            style={{
              margin: "12px 0",
              color: "#3e2d23",
              fontWeight: "normal",
              fontSize: "clamp(38px, 5vw, 58px)",
            }}
          >
            A Collection Still Growing
          </h2>

          <p
            style={{
              color: "#68574a",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Each new scan, description, and exhibition adds another piece to
            the museum’s visual record of history.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "23px",
          }}
        >
          {collectionFacts.map((fact) => (
            <article
              key={fact.label}
              style={{
                padding: "31px 24px",
                textAlign: "center",
                background:
                  "linear-gradient(145deg, #fff9e9 0%, #e3cfaa 100%)",
                borderTop: "6px solid #873a33",
                boxShadow: "0 10px 23px rgba(65,43,27,0.13)",
              }}
            >
              <div style={{ fontSize: "45px", marginBottom: "11px" }}>
                {fact.icon}
              </div>

              <strong
                style={{
                  display: "block",
                  color: "#71332d",
                  fontSize: "39px",
                  fontWeight: "normal",
                }}
              >
                {fact.number}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: "#665247",
                  fontSize: "17px",
                }}
              >
                {fact.label}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "82px 24px",
          color: "#fff2dc",
          backgroundColor: "#76382f",
        }}
      >
        <div
          style={{
            maxWidth: "1050px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                margin: "0",
                color: "#f0cf8d",
                fontWeight: "bold",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              A Museum Tradition
            </p>

            <h2
              style={{
                margin: "14px 0 0",
                fontSize: "clamp(38px, 5vw, 57px)",
                fontWeight: "normal",
              }}
            >
              On This Day in Postcard History
            </h2>
          </div>

          <div>
            <p
              style={{
                margin: "0",
                color: "#ead9c2",
                fontSize: "18px",
                lineHeight: "1.85",
              }}
            >
              A future daily exhibit will connect postcards with holidays,
              anniversaries, historic events, state celebrations, landmarks,
              transportation milestones, and important moments from the past.
            </p>

            <p
              style={{
                color: "#ead9c2",
                fontSize: "18px",
                lineHeight: "1.85",
              }}
            >
              Visitors will be invited to return regularly and discover a new
              story selected from the museum collection.
            </p>

            <div
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "11px 16px",
                border: "1px solid #dfbd76",
                color: "#f3dca8",
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "12px",
              }}
            >
              Exhibit in Development
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "940px",
          margin: "0 auto",
          padding: "88px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "clamp(42px, 6vw, 68px)",
            color: "#fff2dc",
            background:
              "linear-gradient(135deg, #2e231c 0%, #51352b 52%, #78382f 100%)",
            border: "3px solid #b9914a",
            boxShadow: "0 18px 40px rgba(47,31,23,0.27)",
          }}
        >
          <div style={{ fontSize: "57px" }}>🏛️</div>

          <h2
            style={{
              margin: "18px 0",
              fontSize: "clamp(35px, 5vw, 51px)",
              fontWeight: "normal",
            }}
          >
            Begin Your Museum Visit
          </h2>

          <p
            style={{
              maxWidth: "690px",
              margin: "0 auto",
              color: "#e6d6c0",
              fontSize: "18px",
              lineHeight: "1.8",
            }}
          >
            Start in the Grand Gallery for an overview of the museum, or choose
            one of the featured collections above and begin exploring.
          </p>

          <div
            style={{
              marginTop: "31px",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <Link
              href="/grand-gallery"
              style={{
                display: "inline-block",
                padding: "14px 24px",
                color: "#281b0d",
                backgroundColor: "#d4ac60",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Enter the Grand Gallery
            </Link>

            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "13px 24px",
                color: "#f6dfad",
                border: "1px solid #c99c52",
                textDecoration: "none",
              }}
            >
              Return to Museum Entrance
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "57px 24px",
          textAlign: "center",
          color: "#d8c9b5",
          backgroundColor: "#171310",
          borderTop: "6px solid #9c7439",
        }}
      >
        <h2
          style={{
            margin: "0",
            color: "#fff0d5",
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
            color: "#b9aa96",
            fontStyle: "italic",
          }}
        >
          Every Postcard Has a Story.
        </p>

        <p
          style={{
            margin: "22px 0 0",
            color: "#8d806e",
            fontSize: "14px",
          }}
        >
          © 2026 The Virtual Postcard Museum
        </p>
      </footer>
    </main>
  );
}