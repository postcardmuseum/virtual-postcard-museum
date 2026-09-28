"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../california/lib/supabase";


type CommentStatus = "Pending" | "Approved" | "Hidden";

type PostcardComment = {
  id: number;
  postcard_id: number;
  visitor_name: string;
  visitor_email: string | null;
  comment_text: string;
  status: CommentStatus;
  created_at: string;
  approved_at: string | null;
  postcards:
    | {
        id: number;
        title: string | null;
        front_image_url: string | null;
      }
    | {
        id: number;
        title: string | null;
        front_image_url: string | null;
      }[]
    | null;
};

const museumStatistics = [
  { label: "Total Postcards", value: "5,000+", note: "Complete museum collection", symbol: "VPM" },
  { label: "Florida Postcards", value: "1,000+", note: "Largest state collection", symbol: "FL" },
  { label: "California Postcards", value: "200+", note: "Golden State collection", symbol: "CA" },
  { label: "Published Galleries", value: "6", note: "Public museum exhibits", symbol: "EX" },
];

const officeTools = [
  {
    title: "Catalog a New Postcard",
    description: "Upload the front and back scans and create a permanent museum record.",
    href: "/dashboard/add-postcard",
    status: "Open Catalog Desk",
    active: true,
    icon: "✒",
  },
  {
    title: "Manage Collection",
    description: "Search, review, organize, and inspect every postcard record in the museum catalog.",
    href: "/dashboard/manage",
    status: "Open Collection Catalog",
    active: true,
    icon: "▤",
  },
  {
    title: "Visitor Comment Review",
    description: "Review, approve, hide, or delete memories and comments submitted by museum visitors.",
    href: "#comment-review",
    status: "Review Comments",
    active: true,
    icon: "✉",
  },
  {
    title: "Featured Exhibit Manager",
    description: "Choose postcards for homepage features and special museum displays.",
    status: "Coming Soon",
    active: false,
    icon: "★",
  },
  {
    title: "Curator Calendar",
    description: "Plan weekly additions, daily exhibits, and On This Day displays.",
    status: "Coming Soon",
    active: false,
    icon: "◫",
  },
];

const officeNotes = [
  "Manage Collection catalog added to the Curator’s Office.",
  "Reading Room updated with turn, magnify, and rotate controls.",
  "Grand Gallery entrance and Museum Directory completed.",
];

export default function DashboardPage() {
  const [comments, setComments] = useState<PostcardComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentFilter, setCommentFilter] = useState<CommentStatus | "All">("Pending");

  async function loadComments() {
    setCommentsLoading(true);
    setCommentMessage("");

    let query = supabase
      .from("postcard_comments")
      .select(
        "id, postcard_id, visitor_name, visitor_email, comment_text, status, created_at, approved_at, postcards(id, title, front_image_url)"
      )
      .order("created_at", { ascending: false });

    if (commentFilter !== "All") {
      query = query.eq("status", commentFilter);
    }

    const { data, error } = await query;

    if (error) {
      setComments([]);
      setCommentMessage(`Comments could not be loaded: ${error.message}`);
    } else {
      setComments((data as PostcardComment[]) || []);
    }

    setCommentsLoading(false);
  }

  useEffect(() => {
    void loadComments();
  }, [commentFilter]);

  async function updateCommentStatus(
    commentId: number,
    nextStatus: CommentStatus
  ) {
    setCommentMessage("");

    const { error } = await supabase
      .from("postcard_comments")
      .update({
        status: nextStatus,
        approved_at: nextStatus === "Approved" ? new Date().toISOString() : null,
      })
      .eq("id", commentId);

    if (error) {
      setCommentMessage(`The comment could not be updated: ${error.message}`);
      return;
    }

    setCommentMessage(
      nextStatus === "Approved"
        ? "Comment approved and now visible in the Reading Room."
        : `Comment marked ${nextStatus.toLowerCase()}.`
    );
    await loadComments();
  }

  async function deleteComment(commentId: number) {
    const confirmed = window.confirm(
      "Delete this visitor comment permanently? This cannot be undone."
    );

    if (!confirmed) return;

    setCommentMessage("");

    const { error } = await supabase
      .from("postcard_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      setCommentMessage(`The comment could not be deleted: ${error.message}`);
      return;
    }

    setCommentMessage("Comment deleted.");
    await loadComments();
  }

  return (
    <main className="office-page">
      <style>{`
        :root {
          --brass: #c69a45;
          --brass-light: #f0d58b;
          --paper: #f4e7c9;
          --ink: #2e1d13;
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        .office-page {
          min-height: 100vh;
          color: var(--paper);
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at 50% 0%, rgba(222,179,83,.15), transparent 28%),
            repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 1px, transparent 1px 82px),
            linear-gradient(180deg, #28170f, #150c08);
        }
        .top-bar { border-bottom: 1px solid rgba(226,192,118,.35); background: rgba(13,8,5,.92); }
        .top-bar-inner {
          max-width: 1240px; margin: 0 auto; padding: 17px 24px;
          display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .private-label { color: var(--brass-light); text-transform: uppercase; letter-spacing: 3px; font-size: 13px; font-weight: bold; }
        .top-links { display: flex; gap: 22px; flex-wrap: wrap; }
        .top-links a { color: #f5dfaa; text-decoration: none; }
        .hero { max-width: 1240px; margin: 0 auto; padding: 28px 24px 22px; text-align: center; }
        .office-seal {
          width: 68px; height: 68px; margin: 0 auto 12px; display: grid; place-items: center;
          border: 4px double var(--brass-light); border-radius: 50%;
          background: radial-gradient(circle, #754d28 0 47%, #24140c 48%);
          color: #f5d98f; font-weight: bold; box-shadow: 0 12px 24px rgba(0,0,0,.4);
        }
        .hero-kicker { margin: 0 0 8px; color: var(--brass); letter-spacing: 4px; text-transform: uppercase; font-size: 13px; font-weight: bold; }
        .hero h1 { margin: 0; color: #fff1cb; font-size: clamp(38px,6vw,64px); font-weight: normal; text-shadow: 0 4px 10px rgba(0,0,0,.55); }
        .hero p:last-child { max-width: 760px; margin: 13px auto 0; color: #d8c19b; font-size: 17px; line-height: 1.65; font-style: italic; }
        .office-shell { max-width: 1240px; margin: 0 auto; padding: 0 24px 66px; }
        .office-room {
          position: relative; overflow: hidden; min-height: 460px; padding: 28px; border: 7px solid #5d351d;
          background:
            linear-gradient(rgba(255,255,255,.025), rgba(0,0,0,.2)),
            repeating-linear-gradient(90deg,#2c180d 0 38px,#3a2112 38px 76px,#26130a 76px 114px);
          box-shadow: 0 0 0 3px #b5873d,0 24px 48px rgba(0,0,0,.5),inset 0 0 50px rgba(0,0,0,.62);
        }
        .wall-decor { position: absolute; inset: 0; pointer-events: none; }
        .window {
          position: absolute; top: 55px; width: 130px; height: 220px; border: 7px solid #4d2d19;
          background: radial-gradient(circle at 50% 30%,rgba(255,224,157,.58),transparent 46%),linear-gradient(180deg,#7b5d42,#c89455 50%,#4d3528);
          box-shadow: 0 0 0 3px #b5863d,inset 0 0 26px rgba(255,212,126,.2),0 13px 23px rgba(0,0,0,.4);
        }
        .window.left { left: 38px; } .window.right { right: 38px; }
        .window::before,.window::after { content:""; position:absolute; background:rgba(60,36,21,.88); }
        .window::before { top:0; bottom:0; left:50%; width:5px; transform:translateX(-50%); }
        .window::after { left:0; right:0; top:49%; height:5px; }
        .portrait {
          position:absolute; top:55px; left:50%; width:185px; height:128px; transform:translateX(-50%);
          padding:10px; border:6px solid #7a4d25; background:#d6bb84;
          box-shadow:0 0 0 2px #d0a654,0 13px 22px rgba(0,0,0,.42),inset 0 0 0 3px #3a2113;
        }
        .portrait-inner {
          height:100%; display:grid; place-items:center; text-align:center; color:#efd69d; letter-spacing:2px; line-height:1.5;
          background:radial-gradient(circle at 50% 28%,rgba(229,190,106,.28),transparent 44%),linear-gradient(rgba(18,11,7,.25),rgba(18,11,7,.4)),#4b2f1d;
          border:2px solid #aa7a35;
        }
        .desk-lamp { position:absolute; top:177px; left:50%; width:190px; transform:translateX(-50%); z-index:2; }
        .lamp-shade { width:150px; height:43px; margin:0 auto; border:3px solid #b88a3f; border-radius:55% 55% 11px 11px; background:linear-gradient(#34725a,#14392c); box-shadow:0 16px 32px rgba(244,204,112,.24),inset 0 -8px 13px rgba(0,0,0,.35); }
        .lamp-stem { width:9px; height:42px; margin:-1px auto 0; background:linear-gradient(90deg,#6e481f,#e0bb68,#6f4a22); }
        .lamp-base { width:78px; height:12px; margin:0 auto; border-radius:50%; background:linear-gradient(#d4ad58,#76501f); }
        .desk {
          position:relative; z-index:3; margin-top:215px; padding:24px; border:5px solid #2b160c;
          background:linear-gradient(90deg,rgba(255,255,255,.035),transparent 23%,transparent 77%,rgba(0,0,0,.12)),linear-gradient(#714326,#3a2012);
          box-shadow:inset 0 0 0 4px #b17f3b,0 20px 34px rgba(0,0,0,.45);
        }
        .desk-plaque { width:min(560px,94%); margin:0 auto 20px; padding:8px 15px; border:2px solid #efd48a; background:linear-gradient(#9d7436,#5d3d1c); color:#ffe8ae; text-align:center; letter-spacing:2px; text-transform:uppercase; }
        .primary-tools { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
        .tool-card { min-height:220px; padding:22px 18px; border:1px solid #b98a3d; background:linear-gradient(145deg,#f7edd9,#d9c39e); color:var(--ink); box-shadow:0 12px 22px rgba(0,0,0,.28); }
        .tool-card.active { color:#fff2cf; background:linear-gradient(145deg,#274f40,#123126); border:2px solid #d7ad5a; }
        .tool-icon { width:48px; height:48px; display:grid; place-items:center; margin-bottom:14px; border:2px solid #9d7634; border-radius:50%; color:#633b21; background:#f2dfb7; font-size:24px; font-weight:bold; }
        .tool-card.active .tool-icon { color:#f5dc9d; background:#6a4825; border-color:#f0d58b; }
        .tool-card h2 { margin:0 0 10px; font-size:24px; font-weight:normal; }
        .tool-card p { margin:0; line-height:1.6; color:#604b37; }
        .tool-card.active p { color:#d9c7a9; }
        .tool-action,.tool-status { margin-top:18px; display:inline-block; padding:10px 13px; border:1px solid #c69a45; color:#f8df9f; background:linear-gradient(#7f2f28,#501b18); text-decoration:none; text-transform:uppercase; letter-spacing:1px; font-size:12px; font-weight:bold; }
        .tool-status { color:#805e2d; background:rgba(255,255,255,.36); }
        .lower-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:24px; margin-top:28px; }
        .panel { border:1px solid #b98a3d; background:linear-gradient(145deg,#f7edd9,#d9c39e); color:var(--ink); box-shadow:0 14px 26px rgba(0,0,0,.3); }
        .panel-heading { margin:0; padding:14px 18px; color:#f4e2b7; background:linear-gradient(#274f40,#143126); font-size:18px; font-weight:normal; letter-spacing:1px; text-transform:uppercase; }
        .panel-content { padding:20px; }
        .statistics-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:13px; }
        .stat-card { padding:16px 12px; text-align:center; border:1px solid rgba(115,78,36,.35); background:rgba(255,250,240,.6); }
        .stat-symbol { width:38px; height:38px; margin:0 auto 9px; display:grid; place-items:center; border-radius:50%; color:#f4dfaa; background:#6a3d23; font-size:11px; font-weight:bold; }
        .stat-value { display:block; color:#74352d; font-size:25px; margin-bottom:5px; }
        .stat-label { display:block; color:#3f2c23; font-size:14px; font-weight:bold; }
        .stat-note { margin-top:7px; color:#6d5946; font-size:12px; line-height:1.4; }
        .office-note { padding:13px 0; border-bottom:1px solid rgba(91,63,30,.25); color:#5a4632; line-height:1.55; }
        .office-note:last-child { border-bottom:0; }
        .quick-links { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-top:24px; }
        .quick-links a { padding:13px 12px; border:1px solid #b98a3d; color:#f5e1ac; background:linear-gradient(#245242,#123329); text-align:center; text-decoration:none; font-weight:bold; }
        .comment-review {
          margin-top: 28px;
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg,#f7edd9,#d9c39e);
          color: var(--ink);
          box-shadow: 0 14px 26px rgba(0,0,0,.3);
        }
        .comment-review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 14px 18px;
          background: linear-gradient(#274f40,#143126);
        }
        .comment-review-header h2 {
          margin: 0;
          color: #f4e2b7;
          font-size: 18px;
          font-weight: normal;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .comment-filter {
          min-height: 38px;
          padding: 7px 10px;
          border: 1px solid #c69a45;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }
        .comment-review-content {
          padding: 20px;
        }
        .comment-message {
          margin: 0 0 16px;
          padding: 11px 13px;
          border: 1px solid #a77d3b;
          background: #fff6df;
          color: #4b321f;
        }
        .comment-list {
          display: grid;
          gap: 15px;
        }
        .comment-record {
          display: grid;
          grid-template-columns: 110px minmax(0,1fr) 190px;
          gap: 17px;
          padding: 16px;
          border: 1px solid #bd9450;
          background: linear-gradient(145deg,#fffaf0,#e3cfaa);
          box-shadow: 0 10px 20px rgba(0,0,0,.2);
        }
        .comment-postcard-image {
          height: 90px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 4px solid #f5ecd8;
          outline: 2px solid #9c7c47;
          background: #d8c7a8;
          color: #70583e;
          font-size: 12px;
          text-align: center;
        }
        .comment-postcard-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #eee6d8;
        }
        .comment-meta {
          margin: 0 0 8px;
          color: #805c2d;
          font-size: 12px;
          letter-spacing: .8px;
          text-transform: uppercase;
        }
        .comment-record h3 {
          margin: 0 0 8px;
          color: #4a2817;
          font-size: 21px;
          font-weight: normal;
        }
        .visitor-line {
          margin: 0 0 8px;
          color: #624d38;
          font-size: 14px;
        }
        .visitor-comment {
          margin: 0;
          color: #4f3a28;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .comment-actions {
          display: grid;
          gap: 8px;
          align-content: start;
        }
        .comment-actions button,
        .comment-actions a {
          min-height: 38px;
          display: grid;
          place-items: center;
          padding: 8px 11px;
          border: 1px solid #b98a3d;
          background: linear-gradient(#245242,#123329);
          color: #f5e1ac;
          text-decoration: none;
          text-align: center;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }
        .comment-actions .hide-button {
          background: linear-gradient(#8a632e,#5b3f1d);
        }
        .comment-actions .delete-button {
          background: linear-gradient(#7f2f28,#501b18);
        }
        .comment-status-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 3px 7px;
          border: 1px solid #9b7236;
          background: rgba(255,255,255,.45);
          color: #65451f;
          font-size: 10px;
          font-weight: bold;
        }
        .footer { padding:38px 20px; border-top:5px solid #9f7331; background:#110a07; color:#cfb991; text-align:center; }
        .footer strong { color:#f5dfaa; font-size:22px; font-weight:normal; }
        @media (max-width:1000px) {
          .primary-tools { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .statistics-grid,.quick-links { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .lower-grid { grid-template-columns:1fr; }
        }
        @media (max-width:700px) {
          .window { opacity:.35; }
          .office-room { padding:16px; }
          .desk { padding:16px; }
          .primary-tools,.statistics-grid,.quick-links { grid-template-columns:1fr; }
          .tool-card { min-height:0; }
          .comment-record { grid-template-columns:1fr; }
          .comment-postcard-image { height:180px; }
        }
      `}</style>

      <header className="top-bar">
        <div className="top-bar-inner">
          <div className="private-label">Private Museum Administration</div>
          <nav className="top-links">
            <Link href="/">Museum Entrance</Link>
            <Link href="/grand-gallery">Grand Gallery</Link>
            <Link href="/reading-room">Reading Room</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="office-seal">VPM</div>
        <p className="hero-kicker">Welcome, Curator</p>
        <h1>The Curator&apos;s Office</h1>
        <p>Catalog the Clarence E. Pridemore Jr. Collection, prepare exhibits, and manage the growing digital archive of The Virtual Postcard Museum.</p>
      </section>

      <section className="office-shell">
        <div className="office-room">
          <div className="wall-decor" aria-hidden="true">
            <div className="window left" />
            <div className="portrait"><div className="portrait-inner">THE VIRTUAL<br />POSTCARD MUSEUM</div></div>
            <div className="window right" />
          </div>

          <div className="desk-lamp" aria-hidden="true">
            <div className="lamp-shade" />
            <div className="lamp-stem" />
            <div className="lamp-base" />
          </div>

          <div className="desk">
            <div className="desk-plaque">Office of the Founder &amp; Curator</div>

            <div className="primary-tools">
              {officeTools.map((tool) => (
                <article className={`tool-card ${tool.active ? "active" : ""}`} key={tool.title}>
                  <div className="tool-icon">{tool.icon}</div>
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                  {tool.active && tool.href ? (
                    <Link className="tool-action" href={tool.href}>{tool.status}</Link>
                  ) : (
                    <span className="tool-status">{tool.status}</span>
                  )}
                </article>
              ))}
            </div>

            <div className="lower-grid">
              <section className="panel">
                <h2 className="panel-heading">Museum by the Numbers</h2>
                <div className="panel-content">
                  <div className="statistics-grid">
                    {museumStatistics.map((stat) => (
                      <article className="stat-card" key={stat.label}>
                        <div className="stat-symbol">{stat.symbol}</div>
                        <strong className="stat-value">{stat.value}</strong>
                        <span className="stat-label">{stat.label}</span>
                        <div className="stat-note">{stat.note}</div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel">
                <h2 className="panel-heading">Office Notes</h2>
                <div className="panel-content">
                  {officeNotes.map((note) => <div className="office-note" key={note}>{note}</div>)}
                </div>
              </section>
            </div>

            <section className="comment-review" id="comment-review">
              <div className="comment-review-header">
                <h2>Visitor Comment Review</h2>

                <select
                  className="comment-filter"
                  value={commentFilter}
                  onChange={(event) =>
                    setCommentFilter(
                      event.target.value as CommentStatus | "All"
                    )
                  }
                  aria-label="Filter visitor comments"
                >
                  <option value="Pending">Pending Comments</option>
                  <option value="Approved">Approved Comments</option>
                  <option value="Hidden">Hidden Comments</option>
                  <option value="All">All Comments</option>
                </select>
              </div>

              <div className="comment-review-content">
                {commentMessage && (
                  <p className="comment-message" role="status">
                    {commentMessage}
                  </p>
                )}

                {commentsLoading ? (
                  <p>Loading visitor comments...</p>
                ) : comments.length === 0 ? (
                  <p>
                    No {commentFilter === "All" ? "" : commentFilter.toLowerCase()} visitor
                    comments are waiting in this section.
                  </p>
                ) : (
                  <div className="comment-list">
                    {comments.map((comment) => {
                      const postcard = Array.isArray(comment.postcards)
                        ? comment.postcards[0]
                        : comment.postcards;

                      return (
                        <article className="comment-record" key={comment.id}>
                          <div className="comment-postcard-image">
                            {postcard?.front_image_url ? (
                              <img
                                src={postcard.front_image_url}
                                alt={postcard.title || "Postcard"}
                              />
                            ) : (
                              "Postcard image unavailable"
                            )}
                          </div>

                          <div>
                            <p className="comment-meta">
                              VPM {String(comment.postcard_id).padStart(4, "0")}
                              <span className="comment-status-badge">
                                {comment.status}
                              </span>
                            </p>

                            <h3>{postcard?.title || "Untitled Postcard"}</h3>

                            <p className="visitor-line">
                              <strong>{comment.visitor_name}</strong>
                              {comment.visitor_email
                                ? ` • ${comment.visitor_email}`
                                : ""}
                              {" • "}
                              {new Date(comment.created_at).toLocaleString()}
                            </p>

                            <p className="visitor-comment">
                              {comment.comment_text}
                            </p>
                          </div>

                          <div className="comment-actions">
                            {comment.status !== "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  void updateCommentStatus(
                                    comment.id,
                                    "Approved"
                                  )
                                }
                              >
                                Approve Comment
                              </button>
                            )}

                            {comment.status !== "Hidden" && (
                              <button
                                className="hide-button"
                                type="button"
                                onClick={() =>
                                  void updateCommentStatus(comment.id, "Hidden")
                                }
                              >
                                Hide Comment
                              </button>
                            )}

                            <Link
                              href={`/reading-room?id=${comment.postcard_id}`}
                            >
                              Open Postcard
                            </Link>

                            <button
                              className="delete-button"
                              type="button"
                              onClick={() => void deleteComment(comment.id)}
                            >
                              Delete Permanently
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <nav className="quick-links">
              <Link href="/dashboard/add-postcard">Catalog Postcard</Link>
              <Link href="/dashboard/manage">Manage Collection</Link>
              <a href="#comment-review">Review Comments</a>
              <Link href="/history">History Exhibit</Link>
              <Link href="/">View Public Museum</Link>
            </nav>
          </div>
        </div>
      </section>

      <footer className="footer">
        <strong>The Virtual Postcard Museum</strong>
        <p>Founded &amp; Curated by Clarence E. Pridemore Jr.</p>
        <p style={{ marginTop: "18px", fontStyle: "italic" }}>Every Postcard Has a Story.</p>
      </footer>
    </main>
  );
}