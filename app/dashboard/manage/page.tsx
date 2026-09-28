"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../california/lib/supabase";

type Postcard = {
  id: number;
  title: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  landmark: string | null;
  postcard_date: string | null;
  gallery: string | null;
  status: string | null;
  featured: boolean | null;
  description: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  created_at: string | null;
};

type FilterStatus = "All" | "Published" | "Uploaded" | "Draft";

export default function ManageCollectionPage() {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Opening the museum catalog...");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [sortMode, setSortMode] = useState("newest");

  useEffect(() => {
    let cancelled = false;

    async function loadPostcards() {
      setLoading(true);
      const pageSize = 500;
      const allPostcards: Postcard[] = [];
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("postcards")
          .select(
            "id, title, country, state, city, landmark, postcard_date, gallery, status, featured, description, front_image_url, back_image_url, created_at"
          )
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (cancelled) return;
        if (error) {
          setPostcards([]);
          setMessage(`The collection could not be loaded: ${error.message}`);
          setLoading(false);
          return;
        }

        const batch = (data as Postcard[]) || [];
        allPostcards.push(...batch);
        if (batch.length < pageSize) break;
        offset += pageSize;
      }

      if (cancelled) return;
      setPostcards(allPostcards);
      setMessage(
        allPostcards.length === 0
          ? "No postcard records have been added to the catalog yet."
          : ""
      );
      setLoading(false);
    }

    void loadPostcards();
    return () => {
      cancelled = true;
    };
  }, []);

  const galleries = useMemo(() => {
    const values = postcards
      .map((card) => card.gallery)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [postcards]);

  const filteredPostcards = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = postcards.filter((card) => {
      const haystack = [
        card.id,
        card.title,
        card.city,
        card.state,
        card.country,
        card.landmark,
        card.postcard_date,
        card.gallery,
        card.status,
        card.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      const matchesStatus =
        statusFilter === "All" || card.status === statusFilter;
      const matchesGallery =
        galleryFilter === "All" || card.gallery === galleryFilter;

      return matchesSearch && matchesStatus && matchesGallery;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "oldest") {
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
      }

      if (sortMode === "title") {
        return (a.title || "Untitled").localeCompare(b.title || "Untitled");
      }

      if (sortMode === "vpm") {
        return a.id - b.id;
      }

      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });
  }, [postcards, search, statusFilter, galleryFilter, sortMode]);

  const publishedCount = postcards.filter(
    (card) => card.status === "Published"
  ).length;
  const featuredCount = postcards.filter((card) => card.featured).length;
  const frontScanCount = postcards.filter(
    (card) => Boolean(card.front_image_url)
  ).length;
  const backScanCount = postcards.filter(
    (card) => Boolean(card.back_image_url)
  ).length;

  return (
    <main className="catalog-page">
      <style>{`
        :root {
          --walnut-dark: #180e08;
          --walnut: #4d2b18;
          --brass: #c79a46;
          --brass-light: #efd58d;
          --green: #173f31;
          --green-light: #2b5d49;
          --paper: #f3e6c8;
          --paper-light: #fffaf0;
          --ink: #2f1d13;
          --burgundy: #6f2c26;
        }

        * { box-sizing: border-box; }
        body { margin: 0; }

        .catalog-page {
          min-height: 100vh;
          color: var(--paper);
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at 50% 0%, rgba(223,180,86,.14), transparent 28%),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.018) 0 1px,
              transparent 1px 82px
            ),
            linear-gradient(180deg, #28170f, #130b07);
        }

        .topbar {
          border-bottom: 1px solid rgba(226,192,118,.35);
          background: rgba(13,8,5,.92);
        }

        .topbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 17px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .topbar a {
          color: #f1d690;
          text-decoration: none;
        }

        .topbar-label {
          color: #f1d690;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-size: 13px;
          font-weight: bold;
        }

        .topbar-links {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .hero {
          max-width: 1280px;
          margin: 0 auto;
          padding: 30px 24px 24px;
          text-align: center;
        }

        .seal {
          width: 66px;
          height: 66px;
          margin: 0 auto 12px;
          display: grid;
          place-items: center;
          border: 4px double var(--brass-light);
          border-radius: 50%;
          background: radial-gradient(circle, #744b27 0 47%, #24140c 48%);
          color: #f4d78d;
          font-weight: bold;
          box-shadow: 0 12px 24px rgba(0,0,0,.4);
        }

        .hero-kicker {
          margin: 0 0 7px;
          color: var(--brass);
          letter-spacing: 4px;
          text-transform: uppercase;
          font-size: 13px;
          font-weight: bold;
        }

        .hero h1 {
          margin: 0;
          color: #fff0c8;
          font-size: clamp(38px, 6vw, 62px);
          font-weight: normal;
          text-shadow: 0 4px 10px rgba(0,0,0,.55);
        }

        .hero-description {
          max-width: 760px;
          margin: 12px auto 0;
          color: #d6be98;
          font-size: 17px;
          line-height: 1.65;
          font-style: italic;
        }

        .catalog-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 68px;
        }

        .catalog-cabinet {
          border: 7px solid #5e361d;
          background:
            linear-gradient(rgba(255,255,255,.025), rgba(0,0,0,.2)),
            repeating-linear-gradient(
              90deg,
              #2f190e 0 38px,
              #3c2112 38px 76px,
              #27140b 76px 114px
            );
          box-shadow:
            0 0 0 3px #b5873d,
            0 24px 50px rgba(0,0,0,.5),
            inset 0 0 45px rgba(0,0,0,.62);
          padding: 24px;
        }

        .cabinet-plaque {
          width: min(620px, 96%);
          margin: 0 auto 22px;
          padding: 8px 16px;
          border: 2px solid #ead18c;
          background: linear-gradient(#9d7438, #5d3d1c);
          color: #ffe8ae;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: inset 0 0 0 3px rgba(38,21,10,.55);
        }

        .statistics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .stat {
          padding: 17px;
          border: 1px solid #c39a54;
          background: linear-gradient(145deg, #f8eedb, #ddc7a0);
          color: var(--ink);
          text-align: center;
          box-shadow: 0 10px 20px rgba(0,0,0,.22);
        }

        .stat strong {
          display: block;
          color: var(--burgundy);
          font-size: 28px;
          margin-bottom: 5px;
        }

        .stat span {
          color: #5e4936;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .control-panel {
          padding: 18px;
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: var(--ink);
          box-shadow: 0 14px 26px rgba(0,0,0,.3);
        }

        .controls {
          display: grid;
          grid-template-columns: minmax(240px, 1.5fr) repeat(3, minmax(150px, .7fr));
          gap: 12px;
        }

        .field {
          display: grid;
          gap: 6px;
        }

        .field label {
          color: #60411f;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 43px;
          padding: 9px 11px;
          border: 1px solid #99713a;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .result-line {
          margin: 14px 0 0;
          color: #604d3a;
          font-style: italic;
        }

        .records {
          margin-top: 22px;
          display: grid;
          gap: 16px;
        }

        .record {
          display: grid;
          grid-template-columns: 135px minmax(0, 1fr) 190px;
          gap: 18px;
          align-items: center;
          padding: 17px;
          border: 1px solid #bd9450;
          background: linear-gradient(145deg, #fffaf0, #e3cfaa);
          color: var(--ink);
          box-shadow: 0 12px 24px rgba(0,0,0,.26);
        }

        .thumbnail {
          height: 100px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 5px solid #f5ecd8;
          outline: 2px solid #9c7c47;
          background: #d8c7a8;
          color: #70583e;
          font-size: 12px;
          text-align: center;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #eee6d8;
        }

        .accession {
          margin: 0 0 6px;
          color: #8c6329;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: bold;
        }

        .record h2 {
          margin: 0 0 9px;
          color: #4a2817;
          font-size: 25px;
          font-weight: normal;
        }

        .record-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 15px;
          color: #624d38;
          line-height: 1.45;
          font-size: 14px;
        }

        .badge {
          display: inline-block;
          margin-top: 11px;
          padding: 5px 9px;
          border: 1px solid #9b7236;
          background: rgba(255,255,255,.45);
          color: #65451f;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: bold;
        }

        .badge.published {
          color: #f3dfab;
          background: var(--green);
          border-color: #c79a46;
        }

        .record-actions {
          display: grid;
          gap: 9px;
        }

        .record-actions a,
        .record-actions button {
          min-height: 39px;
          display: grid;
          place-items: center;
          padding: 9px 12px;
          border: 1px solid #b98a3d;
          background: linear-gradient(#245242, #123329);
          color: #f5e1ac;
          text-align: center;
          text-decoration: none;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .record-actions button {
          color: #805e2d;
          background: rgba(255,255,255,.45);
          cursor: default;
        }

        .status-message {
          min-height: 240px;
          display: grid;
          place-items: center;
          padding: 30px;
          color: #dcc59d;
          text-align: center;
        }

        .footer {
          padding: 38px 20px;
          border-top: 5px solid #9f7331;
          background: #110a07;
          color: #cfb991;
          text-align: center;
        }

        .footer strong {
          color: #f5dfaa;
          font-size: 22px;
          font-weight: normal;
        }

        @media (max-width: 980px) {
          .statistics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .controls {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .record {
            grid-template-columns: 120px minmax(0, 1fr);
          }

          .record-actions {
            grid-column: 1 / -1;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .catalog-cabinet {
            padding: 14px;
          }

          .statistics,
          .controls {
            grid-template-columns: 1fr;
          }

          .record {
            grid-template-columns: 1fr;
          }

          .thumbnail {
            height: 180px;
          }

          .record-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/dashboard">← Return to Curator&apos;s Office</Link>

          <div className="topbar-label">Private Museum Catalog</div>

          <nav className="topbar-links" aria-label="Catalog navigation">
            <Link href="/dashboard/add-postcard">Catalog New Postcard</Link>
            <Link href="/">View Museum</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="seal">VPM</div>
        <p className="hero-kicker">Curator&apos;s Office</p>
        <h1>Manage Collection</h1>
        <p className="hero-description">
          Search and review the museum catalog, confirm scans, and open any
          published postcard in the Reading Room.
        </p>
      </section>

      <section className="catalog-shell">
        <div className="catalog-cabinet">
          <div className="cabinet-plaque">
            Clarence E. Pridemore Jr. Collection Catalog
          </div>

          <div className="statistics">
            <div className="stat">
              <strong>{postcards.length}</strong>
              <span>Catalog Records</span>
            </div>
            <div className="stat">
              <strong>{publishedCount}</strong>
              <span>Published</span>
            </div>
            <div className="stat">
              <strong>{featuredCount}</strong>
              <span>Featured</span>
            </div>
            <div className="stat">
              <strong>
                {frontScanCount}/{backScanCount}
              </strong>
              <span>Front / Back Scans</span>
            </div>
          </div>

          <section className="control-panel">
            <div className="controls">
              <div className="field">
                <label htmlFor="catalog-search">Search Catalog</label>
                <input
                  id="catalog-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title, city, state, date, landmark, or VPM number"
                />
              </div>

              <div className="field">
                <label htmlFor="status-filter">Status</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as FilterStatus)
                  }
                >
                  <option>All</option>
                  <option>Published</option>
                  <option>Uploaded</option>
                  <option>Draft</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="gallery-filter">Gallery</label>
                <select
                  id="gallery-filter"
                  value={galleryFilter}
                  onChange={(event) => setGalleryFilter(event.target.value)}
                >
                  <option>All</option>
                  {galleries.map((gallery) => (
                    <option value={gallery} key={gallery}>
                      {gallery}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="sort-mode">Sort</label>
                <select
                  id="sort-mode"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A–Z</option>
                  <option value="vpm">VPM Number</option>
                </select>
              </div>
            </div>

            <p className="result-line">
              Showing {filteredPostcards.length} of {postcards.length} catalog
              records.
            </p>
          </section>

          {loading || message ? (
            <div className="status-message">
              {loading ? "Opening the museum catalog..." : message}
            </div>
          ) : (
            <div className="records">
              {filteredPostcards.map((card) => {
                const location =
                  [card.city, card.state, card.country]
                    .filter(Boolean)
                    .join(", ") || "Location not recorded";

                return (
                  <article className="record" key={card.id}>
                    <div className="thumbnail">
                      {card.front_image_url ? (
                        <img
                          src={card.front_image_url}
                          alt={card.title || "Postcard front"}
                        />
                      ) : (
                        "Front scan not available"
                      )}
                    </div>

                    <div>
                      <p className="accession">
                        VPM {String(card.id).padStart(4, "0")}
                      </p>
                      <h2>{card.title || "Untitled Postcard"}</h2>

                      <div className="record-meta">
                        <span>
                          <strong>Location:</strong> {location}
                        </span>
                        <span>
                          <strong>Date:</strong>{" "}
                          {card.postcard_date || "Not recorded"}
                        </span>
                        <span>
                          <strong>Gallery:</strong>{" "}
                          {card.gallery || "Grand Gallery"}
                        </span>
                        <span>
                          <strong>Back scan:</strong>{" "}
                          {card.back_image_url ? "Available" : "Missing"}
                        </span>
                      </div>

                      <span
                        className={`badge ${
                          card.status === "Published" ? "published" : ""
                        }`}
                      >
                        {card.status || "Status not recorded"}
                      </span>

                      {card.featured ? (
                        <span className="badge" style={{ marginLeft: "8px" }}>
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <div className="record-actions">
                      <Link href={`/reading-room?id=${card.id}`}>
                        Open in Reading Room
                      </Link>
                      <Link href={`/dashboard/manage/${card.id}`}>
                        Edit Postcard Record
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <strong>The Virtual Postcard Museum</strong>
        <p>Founded &amp; Curated by Clarence E. Pridemore Jr.</p>
        <p style={{ marginTop: "18px", fontStyle: "italic" }}>
          Every Postcard Has a Story.
        </p>
      </footer>
    </main>
  );
}