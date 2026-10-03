import Link from "next/link";

const timeline = [
  {
    years: "1860s–1870s",
    title: "The Postcard Emerges",
    description:
      "Early postal cards introduced a simple and inexpensive way to send brief written messages through the mail.",
  },
  {
    years: "1893–1898",
    title: "Picture Postcards Gain Attention",
    description:
      "Illustrated souvenir cards became increasingly popular after major exhibitions and public events introduced them to large audiences.",
  },
  {
    years: "1898–1901",
    title: "The Private Mailing Card Era",
    description:
      "Privately printed cards could be mailed at postcard rates, helping publishers create a growing variety of illustrated cards.",
  },
  {
    years: "1901–1907",
    title: "The Undivided-Back Era",
    description:
      "The address occupied the entire back of the card, so senders often wrote short messages in open spaces on the picture side.",
  },
  {
    years: "1907–1915",
    title: "The Divided-Back Golden Age",
    description:
      "A divided back allowed the message and address to share the same side, while the entire front could display an image.",
  },
  {
    years: "1915–1930",
    title: "The White-Border Era",
    description:
      "Many American cards featured printed scenes surrounded by white borders as domestic production became more common.",
  },
  {
    years: "1930–1945",
    title: "The Linen Era",
    description:
      "Textured paper and richly exaggerated colors created the distinctive linen postcards associated with roadside America.",
  },
  {
    years: "1945–Present",
    title: "The Photochrome Era",
    description:
      "Improved color photography and printing produced the glossy scenic postcards familiar to modern travelers.",
  },
];

const printingMethods = [
  {
    title: "Lithography",
    icon: "🖨️",
    description:
      "Artists and printers used lithographic techniques to reproduce detailed illustrations, lettering, and colorful scenes.",
  },
  {
    title: "Hand Coloring",
    icon: "🎨",
    description:
      "Some early photographic cards were carefully colored by hand, giving each example subtle individual differences.",
  },
  {
    title: "Real Photo Postcards",
    icon: "📷",
    description:
      "Photographic images printed directly onto postcard stock documented families, businesses, disasters, streets, and local events.",
  },
  {
    title: "Linen Printing",
    icon: "🧵",
    description:
      "A textured paper surface and bold inks created bright, stylized views of towns, highways, hotels, and attractions.",
  },
  {
    title: "Photochrome Printing",
    icon: "🌈",
    description:
      "Modern color reproduction created smooth, detailed images that closely resembled color photographs.",
  },
  {
    title: "Embossing & Decoration",
    icon: "✨",
    description:
      "Holiday and greeting postcards often featured raised designs, metallic accents, glitter, ribbons, or other decorative finishes.",
  },
];

const museumLessons = [
  {
    title: "Architecture",
    icon: "🏛️",
    text: "Postcards preserve images of buildings, streets, hotels, stations, theaters, and neighborhoods that may no longer exist.",
  },
  {
    title: "Travel & Tourism",
    icon: "🧳",
    text: "They reveal how destinations advertised themselves and what earlier travelers considered exciting, beautiful, or modern.",
  },
  {
    title: "Everyday Life",
    icon: "🏡",
    text: "Messages, postmarks, clothing, automobiles, stores, and ordinary scenes provide evidence of daily life across generations.",
  },
  {
    title: "Printing & Design",
    icon: "🎨",
    text: "Postcard artwork records changing styles in photography, illustration, typography, advertising, and commercial printing.",
  },
];

export default function HistoryPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#eee2c9",
        color: "#34291f",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <header
        style={{
          color: "#f8ecd1",
          background:
            "linear-gradient(180deg, #211914 0%, #3c2920 55%, #6f312d 100%)",
          borderBottom: "8px solid #b38a48",
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
              borderBottom: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#e7c982",
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
                style={{ color: "#f8ecd1", textDecoration: "none" }}
              >
                Grand Gallery
              </Link>

              <Link
                href="/collection"
                style={{ color: "#f8ecd1", textDecoration: "none" }}
              >
                Collections
              </Link>

              <Link
                href="/collection/florida"
                style={{ color: "#f8ecd1", textDecoration: "none" }}
              >
                Florida Gallery
              </Link>

              <Link
                href="/california"
                style={{ color: "#f8ecd1", textDecoration: "none" }}
              >
                California Gallery
              </Link>
            </div>
          </nav>
        </div>

        <section
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "70px 24px 130px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 17px",
              color: "#e5c57c",
              fontWeight: "bold",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Special Museum Exhibition
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "16px 34px",
              border: "2px solid #c7a15b",
              outline: "5px solid rgba(255,255,255,0.07)",
              background:
                "linear-gradient(135deg, rgba(85,37,32,0.95), rgba(119,54,48,0.95))",
              boxShadow:
                "0 16px 40px rgba(0,0,0,0.34), inset 0 0 28px rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                color: "#f9dfa0",
                fontSize: "clamp(35px, 6vw, 62px)",
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              Every Card
            </span>
          </div>

          <h1
            style={{
              margin: "25px 0 0",
              fontSize: "clamp(48px, 8vw, 84px)",
              lineHeight: "1.04",
              fontWeight: "normal",
              textShadow: "0 5px 20px rgba(0,0,0,0.34)",
            }}
          >
            Has a History
          </h1>

          <p
            style={{
              maxWidth: "790px",
              margin: "26px auto 0",
              color: "#eadac1",
              fontSize: "clamp(20px, 3vw, 26px)",
              lineHeight: "1.65",
              fontStyle: "italic",
            }}
          >
            Explore more than a century of communication, travel, printing,
            photography, art, and everyday life through the story of the
            postcard.
          </p>
        </section>
      </header>

      <section
        style={{
          maxWidth: "1040px",
          margin: "-74px auto 82px",
          padding: "0 24px",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "clamp(32px, 6vw, 62px)",
            background:
              "linear-gradient(145deg, #fff8e8 0%, #dcc399 50%, #fff5df 100%)",
            border: "12px solid #3d2b21",
            outline: "3px solid #aa7d3c",
            boxShadow: "0 22px 58px rgba(45,29,20,0.3)",
            textAlign: "center",
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
            Introduction to the Exhibition
          </p>

          <div
            style={{
              marginTop: "25px",
              padding: "clamp(30px, 5vw, 52px)",
              border: "1px solid #b89661",
              background:
                "radial-gradient(circle at center, #fffdf6 0%, #e7d5b4 100%)",
              boxShadow: "inset 0 0 48px rgba(81,54,30,0.18)",
            }}
          >
            <div style={{ fontSize: "66px", marginBottom: "18px" }}>📜</div>

            <h2
              style={{
                margin: "0",
                color: "#493327",
                fontWeight: "normal",
                fontSize: "clamp(32px, 5vw, 49px)",
              }}
            >
              Small Objects, Remarkable Stories
            </h2>

            <p
              style={{
                maxWidth: "740px",
                margin: "22px auto 0",
                color: "#665142",
                fontSize: "19px",
                lineHeight: "1.85",
              }}
            >
              Postcards have connected people for more than 150 years. They
              carried greetings, news, jokes, advertisements, travel memories,
              and personal messages while creating an extraordinary visual
              record of communities around the world.
            </p>

            <p
              style={{
                maxWidth: "740px",
                margin: "18px auto 0",
                color: "#665142",
                fontSize: "19px",
                lineHeight: "1.85",
              }}
            >
              A single card may preserve a vanished hotel, a forgotten
              roadside attraction, a family message, an old postmark, or the
              only known view of a changing neighborhood.
            </p>
          </div>

          <div
            style={{
              maxWidth: "610px",
              margin: "30px auto 0",
              padding: "18px 22px",
              color: "#24180c",
              border: "2px solid #684817",
              background:
                "linear-gradient(180deg, #d8b361 0%, #a27531 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.5), 0 5px 13px rgba(62,39,12,0.25)",
            }}
          >
            <strong style={{ display: "block", fontSize: "19px" }}>
              History of Postcards
            </strong>

            <span style={{ display: "block", marginTop: "7px" }}>
              Permanent Educational Exhibition
            </span>

            <em style={{ display: "block", marginTop: "7px" }}>
              The Virtual Postcard Museum
            </em>
          </div>
        </div>
      </section>

      <section
        aria-label="Continue to the postcard timeline"
        style={{
          maxWidth: "760px",
          margin: "-42px auto 58px",
          padding: "0 24px",
          position: "relative",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <a
          href="#postcard-timeline"
          style={{
            display: "inline-block",
            width: "100%",
            maxWidth: "560px",
            padding: "24px 24px 20px",
            color: "#f8e7bd",
            textDecoration: "none",
            background:
              "linear-gradient(135deg, #2a2019 0%, #4c3429 55%, #6f332e 100%)",
            border: "2px solid #b88d49",
            outline: "4px solid rgba(104,72,23,0.16)",
            boxShadow:
              "0 14px 30px rgba(58,39,25,0.24), inset 0 0 24px rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "30px",
              marginBottom: "8px",
            }}
          >
            🏛️
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "clamp(20px, 3vw, 27px)",
              fontWeight: "normal",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Continue Your Visit Below
          </strong>

          <span
            className="history-scroll-arrow"
            style={{
              display: "block",
              marginTop: "10px",
              color: "#ddb867",
              fontSize: "34px",
              lineHeight: "1",
            }}
          >
            ▼
          </span>
        </a>
      </section>

      <section
        id="postcard-timeline"
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "20px 24px 90px",
          scrollMarginTop: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "780px",
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
            Walk Through Time
          </p>

          <h2
            style={{
              margin: "0",
              color: "#3d2c22",
              fontWeight: "normal",
              fontSize: "clamp(38px, 5vw, 58px)",
            }}
          >
            The Postcard Timeline
          </h2>

          <p
            style={{
              color: "#68584b",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Postcards changed as postal regulations, printing technology,
            photography, travel, and popular taste evolved.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {timeline.map((era, index) => (
            <article
              key={era.title}
              style={{
                marginBottom: "24px",
                padding: "28px",
                display: "grid",
                gridTemplateColumns: "minmax(130px, 180px) 1fr",
                gap: "28px",
                alignItems: "start",
                backgroundColor: index % 2 === 0 ? "#fff8e8" : "#ead9bb",
                borderLeft: "7px solid #8d3c34",
                boxShadow: "0 9px 20px rgba(66,46,31,0.12)",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#8a3a32",
                    fontSize: "20px",
                    lineHeight: "1.3",
                  }}
                >
                  {era.years}
                </strong>
              </div>

              <div>
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#402e24",
                    fontSize: "27px",
                    fontWeight: "normal",
                  }}
                >
                  {era.title}
                </h3>

                <p
                  style={{
                    margin: "0",
                    color: "#675548",
                    lineHeight: "1.75",
                    fontSize: "17px",
                  }}
                >
                  {era.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "82px 24px",
          color: "#f8ecd4",
          background:
            "linear-gradient(135deg, #2a211b 0%, #473129 52%, #70352f 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: "770px",
              margin: "0 auto 48px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#dfbe77",
                fontWeight: "bold",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              The Golden Age
            </p>

            <h2
              style={{
                margin: "12px 0 18px",
                fontSize: "clamp(38px, 5vw, 58px)",
                fontWeight: "normal",
              }}
            >
              When Postcards Became a Worldwide Craze
            </h2>

            <p
              style={{
                color: "#e5d5bd",
                fontSize: "19px",
                lineHeight: "1.85",
              }}
            >
              During the early twentieth century, postcards became one of the
              fastest and most popular ways to communicate. People mailed them
              from vacations, exchanged them with collectors, saved them in
              albums, and used them to share images of places they might never
              visit in person.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
              gap: "22px",
            }}
          >
            {[
              ["✉️", "Quick Communication", "A postcard offered a brief, affordable way to send news and greetings."],
              ["🚂", "Expanding Travel", "Railroads, resorts, hotels, and tourist attractions created endless postcard subjects."],
              ["📚", "Collecting Albums", "Families and collectors organized cards into albums as personal visual libraries."],
              ["🌍", "Views of the World", "Postcards allowed people to see cities, landscapes, and customs far beyond home."],
            ].map(([icon, title, text]) => (
              <article
                key={title}
                style={{
                  padding: "30px",
                  backgroundColor: "rgba(255,248,230,0.08)",
                  border: "1px solid rgba(226,191,119,0.38)",
                }}
              >
                <div style={{ fontSize: "45px", marginBottom: "17px" }}>
                  {icon}
                </div>

                <h3
                  style={{
                    margin: "0 0 12px",
                    color: "#f4dfab",
                    fontSize: "26px",
                    fontWeight: "normal",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    margin: "0",
                    color: "#dfd0ba",
                    lineHeight: "1.7",
                  }}
                >
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          padding: "88px 24px",
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
            How Postcards Were Made
          </p>

          <h2
            style={{
              margin: "12px 0",
              color: "#3c2b22",
              fontWeight: "normal",
              fontSize: "clamp(38px, 5vw, 58px)",
            }}
          >
            Printing & Production
          </h2>

          <p
            style={{
              color: "#68574a",
              fontSize: "19px",
              lineHeight: "1.75",
            }}
          >
            Different printing methods gave each era its own recognizable
            colors, textures, details, and artistic character.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: "24px",
          }}
        >
          {printingMethods.map((method) => (
            <article
              key={method.title}
              style={{
                minHeight: "250px",
                padding: "31px",
                backgroundColor: "#fff8e9",
                border: "1px solid #c8aa76",
                boxShadow: "0 11px 24px rgba(65,44,28,0.12)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "17px" }}>
                {method.icon}
              </div>

              <h3
                style={{
                  margin: "0 0 13px",
                  color: "#4b3026",
                  fontSize: "28px",
                  fontWeight: "normal",
                }}
              >
                {method.title}
              </h3>

              <p
                style={{
                  margin: "0",
                  color: "#68574a",
                  lineHeight: "1.72",
                }}
              >
                {method.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "82px 24px",
          backgroundColor: "#6f332e",
          color: "#fff3dc",
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
                color: "#ebc984",
                fontWeight: "bold",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              The Message Side
            </p>

            <h2
              style={{
                margin: "13px 0 0",
                fontSize: "clamp(38px, 5vw, 57px)",
                fontWeight: "normal",
              }}
            >
              Handwriting, Stamps & Postmarks
            </h2>
          </div>

          <div
            style={{
              color: "#ead9c4",
              fontSize: "18px",
              lineHeight: "1.85",
            }}
          >
            <p>
              The back of a postcard can be just as important as the picture.
              Handwritten messages preserve personal voices, relationships,
              humor, travel experiences, and everyday concerns.
            </p>

            <p>
              Stamps and postmarks may help identify when and where a card was
              mailed, while publisher names and printed markings can assist
              with research and dating.
            </p>

            <p>
              For this reason, the Virtual Postcard Museum will preserve and
              display both the front and back of cards whenever possible.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "88px 24px",
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
            Why Preserve Postcards?
          </p>

          <h2
            style={{
              margin: "12px 0",
              color: "#3e2d23",
              fontWeight: "normal",
              fontSize: "clamp(38px, 5vw, 58px)",
            }}
          >
            Windows Into the Past
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
            gap: "23px",
          }}
        >
          {museumLessons.map((lesson) => (
            <article
              key={lesson.title}
              style={{
                padding: "30px",
                background:
                  "linear-gradient(145deg, #fff9eb 0%, #e6d4b3 100%)",
                borderTop: "6px solid #8b3a32",
                boxShadow: "0 10px 22px rgba(63,42,27,0.12)",
              }}
            >
              <div style={{ fontSize: "46px", marginBottom: "16px" }}>
                {lesson.icon}
              </div>

              <h3
                style={{
                  margin: "0 0 12px",
                  color: "#493126",
                  fontSize: "27px",
                  fontWeight: "normal",
                }}
              >
                {lesson.title}
              </h3>

              <p
                style={{
                  margin: "0",
                  color: "#665448",
                  lineHeight: "1.72",
                }}
              >
                {lesson.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: "930px",
          margin: "0 auto",
          padding: "0 24px 88px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "clamp(42px, 6vw, 68px)",
            color: "#fff2dc",
            background:
              "linear-gradient(135deg, #2f241d 0%, #52352b 52%, #783830 100%)",
            border: "3px solid #b8914c",
            boxShadow: "0 18px 40px rgba(47,31,23,0.27)",
          }}
        >
          <div style={{ fontSize: "56px" }}>🏛️</div>

          <h2
            style={{
              margin: "18px 0",
              fontSize: "clamp(34px, 5vw, 51px)",
              fontWeight: "normal",
            }}
          >
            Preserving History, One Postcard at a Time
          </h2>

          <p
            style={{
              maxWidth: "690px",
              margin: "0 auto",
              color: "#e6d5c0",
              fontSize: "18px",
              lineHeight: "1.8",
            }}
          >
            The Virtual Postcard Museum is dedicated to preserving these
            historic objects, documenting their stories, and making them
            accessible to visitors around the world.
          </p>

          <Link
            href="/grand-gallery"
            style={{
              display: "inline-block",
              marginTop: "30px",
              padding: "14px 25px",
              color: "#281b0d",
              backgroundColor: "#d2aa5c",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Continue to the Grand Gallery
          </Link>
          <Link
  href="/collection/florida"
  style={{
    display: "inline-block",
    marginTop: "14px",
    padding: "14px 25px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #0aa7a5, #ff5fa2)",
    textDecoration: "none",
    fontWeight: "bold",
    border: "2px solid #ffd36a",
    boxShadow: "0 0 14px rgba(255, 95, 162, 0.45)",
  }}
>
  Visit the Florida Gallery
</Link>
        </div>
      </section>

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .history-scroll-arrow {
          animation: historyArrowFloat 1.8s ease-in-out infinite;
        }

        @keyframes historyArrowFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .history-scroll-arrow {
            animation: none;
          }
        }
      `}</style>

      <footer
        style={{
          padding: "56px 24px",
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