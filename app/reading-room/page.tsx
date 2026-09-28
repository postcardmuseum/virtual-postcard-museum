"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../california/lib/supabase";

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
  display_rotation: number | null;
  night_display: "off" | "subtle" | "neon" | null;
  created_at: string | null;
};

type PostcardComment = {
  id: number;
  visitor_name: string;
  comment_text: string;
  created_at: string;
};

export default function ReadingRoomPage() {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showingBack, setShowingBack] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [imageNaturalPortrait, setImageNaturalPortrait] = useState(false);
  const [message, setMessage] = useState("Preparing the Reading Room...");
  const [loading, setLoading] = useState(true);
  const [returnHref, setReturnHref] = useState("/grand-gallery");
  const [returnLabel, setReturnLabel] = useState("Grand Gallery");
  const [tourActive, setTourActive] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const [tourScope, setTourScope] = useState("grand-gallery");

  const [comments, setComments] = useState<PostcardComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentStatus, setCommentStatus] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
    async function loadReadingRoom() {
      setLoading(true);

      const pageSize = 500;
      const loaded: Postcard[] = [];
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("postcards")
          .select(
            "id, title, country, state, city, landmark, postcard_date, gallery, status, featured, description, front_image_url, back_image_url, display_rotation, night_display, created_at"
          )
          .eq("status", "Published")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + pageSize - 1);

        if (error) {
          setMessage(`The Reading Room could not be opened: ${error.message}`);
          setPostcards([]);
          setLoading(false);
          return;
        }

        const batch = (data as Postcard[]) || [];
        loaded.push(...batch);

        if (batch.length < pageSize) break;
        offset += pageSize;
      }

      setPostcards(loaded);

      const searchParams = new URLSearchParams(window.location.search);
      const idText = searchParams.get("id");
      const requestedId = idText === null ? null : Number(idText);
      const from = searchParams.get("from")?.toLowerCase() || "";
      const requestedTour = searchParams.get("tour") === "1";

      setTourActive(requestedTour);
      setTourPaused(false);
      setTourScope(from || "grand-gallery");

      const returnDestinations: Record<
        string,
        { href: string; label: string }
      > = {
        florida: { href: "/florida", label: "Florida Gallery" },
        california: { href: "/california", label: "California Gallery" },
        humor: { href: "/humor", label: "Humor Gallery" },
        holiday: { href: "/holiday", label: "Holiday Gallery" },
        "grand-gallery": {
          href: "/grand-gallery",
          label: "Grand Gallery",
        },
      };

      const destination =
        returnDestinations[from] || returnDestinations["grand-gallery"];

      setReturnHref(destination.href);
      setReturnLabel(destination.label);

      const requestedCard =
        requestedId !== null && Number.isInteger(requestedId)
          ? loaded.find((card) => card.id === requestedId)
          : null;

      const selectedCard =
        idText === null ? loaded[0] || null : requestedCard || null;

      setSelectedId(selectedCard?.id ?? null);
      setMessage(
        loaded.length === 0
          ? "No published postcards are available for study yet."
          : idText !== null && !requestedCard
          ? `Postcard VPM ${idText} could not be found in the published collection.`
          : ""
      );
      setLoading(false);

      if (selectedCard) {
        window.setTimeout(() => setDrawerOpen(true), 250);
      }
    }

    void loadReadingRoom();
  }, []);

  useEffect(() => {
    async function loadApprovedComments() {
      if (!selectedId) {
        setComments([]);
        return;
      }

      setCommentsLoading(true);

      const { data, error } = await supabase
        .from("postcard_comments")
        .select("id, visitor_name, comment_text, created_at")
        .eq("postcard_id", selectedId)
        .eq("status", "Approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load approved comments:", error.message);
        setComments([]);
      } else {
        setComments((data as PostcardComment[]) || []);
      }

      setCommentsLoading(false);
    }

    setCommentStatus("");
    void loadApprovedComments();
  }, [selectedId]);

  const selectedCard = useMemo(
    () => postcards.find((card) => card.id === selectedId) || null,
    [postcards, selectedId]
  );

  const tourPostcards = useMemo(() => {
    if (tourScope === "florida") {
      return postcards.filter((card) => {
        const gallery = card.gallery?.toLowerCase() || "";
        const state = card.state?.toLowerCase() || "";
        return gallery.includes("florida") || state.includes("florida");
      });
    }

    return postcards;
  }, [postcards, tourScope]);

  const imageUrl =
    showingBack && selectedCard?.back_image_url
      ? selectedCard.back_image_url
      : selectedCard?.front_image_url;

  const location =
    [selectedCard?.city, selectedCard?.state, selectedCard?.country]
      .filter(Boolean)
      .join(", ") || "Location not recorded";

  const isMiamiCard =
    selectedCard?.title?.toLowerCase().includes("miami") ?? false;

  const nightDisplay = selectedCard?.night_display || "off";
  const nightMode = !showingBack && nightDisplay !== "off";
  const neonNight = !showingBack && nightDisplay === "neon";

  const galleryName = selectedCard?.gallery?.toLowerCase() || "";
  const isFloridaGallery = galleryName.includes("florida");
  const isCaliforniaGallery = galleryName.includes("california");
  const isHolidayGallery = galleryName.includes("holiday");
  const isHumorGallery = galleryName.includes("humor");

  const savedRotation = selectedCard?.display_rotation ?? 0;
  const effectiveRotation = ((savedRotation + rotation) % 360 + 360) % 360;
  const quarterTurn = effectiveRotation === 90 || effectiveRotation === 270;
  const displayPortrait = quarterTurn
    ? !imageNaturalPortrait
    : imageNaturalPortrait;

  function chooseCard(id: number) {
    setDrawerOpen(false);
    setShowingBack(false);
    setZoomLevel(0);
    setRotation(0);
    setImageNaturalPortrait(false);
    setCommentStatus("");
    window.setTimeout(() => {
      setSelectedId(id);
      setDrawerOpen(true);
    }, 240);
  }

  const selectedIndex = postcards.findIndex((card) => card.id === selectedId);

  function choosePreviousCard() {
    if (postcards.length === 0) return;
    const previousIndex =
      selectedIndex <= 0 ? postcards.length - 1 : selectedIndex - 1;
    chooseCard(postcards[previousIndex].id);
  }

  function chooseNextCard() {
    if (postcards.length === 0) return;
    const nextIndex =
      selectedIndex < 0 || selectedIndex >= postcards.length - 1
        ? 0
        : selectedIndex + 1;
    chooseCard(postcards[nextIndex].id);
  }

  useEffect(() => {
    if (!tourActive || tourPaused || tourPostcards.length <= 1 || zoomLevel > 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setShowingBack(false);
      setRotation(0);
      setZoomLevel(0);
      setDrawerOpen(false);

      setSelectedId((currentId) => {
        const currentIndex = tourPostcards.findIndex((card) => card.id === currentId);
        const nextIndex =
          currentIndex < 0 || currentIndex >= tourPostcards.length - 1
            ? 0
            : currentIndex + 1;

        window.setTimeout(() => setDrawerOpen(true), 220);
        return tourPostcards[nextIndex].id;
      });
    }, 10000);

    return () => window.clearInterval(timer);
  }, [tourActive, tourPaused, tourPostcards, zoomLevel]);

  function startTour() {
    setTourActive(true);
    setTourPaused(false);
    setShowingBack(false);
    setZoomLevel(0);
    setRotation(0);
  }

  function exitTour() {
    setTourActive(false);
    setTourPaused(false);
  }

  const zoomScales = [1, 1.18, 1.38, 1.62];
  const zoomScale = zoomScales[zoomLevel] ?? 1;

  function increaseZoom() {
    setZoomLevel((current) =>
      current >= zoomScales.length - 1 ? 0 : current + 1
    );
  }

  function resetZoom() {
    setZoomLevel(0);
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCard) {
      setCommentStatus("Please select a postcard before submitting a comment.");
      return;
    }

    const cleanName = visitorName.trim();
    const cleanEmail = visitorEmail.trim();
    const cleanComment = commentText.trim();

    if (cleanName.length < 1 || cleanName.length > 60) {
      setCommentStatus("Please enter a name between 1 and 60 characters.");
      return;
    }

    if (cleanComment.length < 2 || cleanComment.length > 1000) {
      setCommentStatus("Please enter a comment between 2 and 1,000 characters.");
      return;
    }

    setSubmittingComment(true);
    setCommentStatus("");

    const { error } = await supabase.from("postcard_comments").insert({
      postcard_id: selectedCard.id,
      visitor_name: cleanName,
      visitor_email: cleanEmail || null,
      comment_text: cleanComment,
      status: "Pending",
      approved_at: null,
    });

    if (error) {
      setCommentStatus(`Your comment could not be submitted: ${error.message}`);
      setSubmittingComment(false);
      return;
    }

    setVisitorName("");
    setVisitorEmail("");
    setCommentText("");
    setCommentStatus(
      "Thank you. Your memory or comment was submitted for curator review."
    );
    setSubmittingComment(false);
  }

  return (
    <main className="reading-room">
      <style>{`
        :root {
          --walnut-dark: #1c100a;
          --walnut: #4b2b17;
          --walnut-light: #76502d;
          --brass: #c49a49;
          --brass-light: #efd58e;
          --green: #214a3b;
          --green-dark: #102c23;
          --paper: #f4ead5;
          --ink: #2d1c12;
        }

        * { box-sizing: border-box; }
        body { margin: 0; }

        .reading-room {
          min-height: 100vh;
          color: var(--paper);
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at 50% 5%, rgba(219, 176, 86, .17), transparent 28%),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.018) 0 1px,
              transparent 1px 78px
            ),
            linear-gradient(180deg, #25160f, #120b07 68%);
        }

        .room-header {
          border-bottom: 1px solid rgba(226, 192, 118, .35);
          background: rgba(13, 8, 5, .88);
        }

        .room-header-inner {
          max-width: 1220px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .room-header a {
          color: #efd58e;
          text-decoration: none;
        }

        .room-title {
        padding: 4px 20px 2px;
          text-align: center;
        }

        .crest {
          width: 38px;
height: 38px;
margin: 0 auto 2px;
          display: grid;
          place-items: center;
          border: 3px double var(--brass-light);
          border-radius: 50%;
          background: radial-gradient(circle, #6b4826 0 48%, #24140c 49% 100%);
          color: #f4d892;
          font-weight: bold;
          letter-spacing: 1.2px;
          box-shadow: 0 12px 25px rgba(0,0,0,.45);
        }

        .room-title p {
          margin: 0 0 3px;
          color: #caa75e;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-size: 13px;
        }

        .room-title h1 {
          margin: 0;
          color: #fff0c9;
          font-size: clamp(26px, 3.6vw, 40px);
          font-weight: normal;
          text-shadow: 0 3px 8px #000;
        }

        .room-title .subtitle {
          margin-top: 3px;
          color: #d6c09b;
          font-size: 15px;
          font-style: italic;
          letter-spacing: normal;
          text-transform: none;
        }

        .room-shell {
          max-width: 1220px;
          margin: 0 auto;
          padding: 0 22px 65px;
          margin-top: -2px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 28px;
        }

        .study-area {
          position: relative;
          min-height: 590px;
          padding: 18px 28px 24px;
          border: 7px solid #5d351d;
          background:
            linear-gradient(rgba(255,255,255,.035), rgba(0,0,0,.18)),
            repeating-linear-gradient(
              90deg,
              #2f190e 0 34px,
              #3c2112 34px 68px,
              #27140b 68px 102px
            );
          box-shadow:
            0 0 0 3px #b5873d,
            0 24px 50px rgba(0,0,0,.5),
            inset 0 0 45px rgba(0,0,0,.65);
          overflow: hidden;
        }

        .room-decor {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .window {
          position: absolute;
          top: 88px;
          width: 112px;
          height: 290px;
          border: 7px solid #4d2d19;
          background:
            linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.02)),
            linear-gradient(180deg, #72563f 0%, #bf8f55 45%, #4d3528 100%);
          box-shadow:
            0 0 0 3px #b5863d,
            inset 0 0 28px rgba(255, 212, 126, .28),
            0 14px 24px rgba(0,0,0,.4);
          overflow: hidden;
        }

        .window-left { left: 28px; }
        .window-right { right: 28px; }

        .window::before,
        .window::after {
          content: "";
          position: absolute;
          background: rgba(61, 37, 22, .85);
        }

        .window::before {
          top: 0;
          bottom: 0;
          left: 50%;
          width: 5px;
          transform: translateX(-50%);
        }

        .window::after {
          left: 0;
          right: 0;
          top: 49%;
          height: 5px;
        }

        .window-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 35%, rgba(255, 224, 157, .52), transparent 62%);
        }

        .window-frame-lines {
          position: absolute;
          inset: 12px;
          border: 2px solid rgba(244, 220, 165, .38);
        }

        .bookcase {
          position: absolute;
          top: 110px;
          width: 126px;
          height: 320px;
          padding: 12px;
          border: 7px solid #4d2a17;
          background: linear-gradient(90deg, #2a160c, #5d351d 50%, #2a160c);
          box-shadow:
            0 0 0 3px #97652e,
            0 18px 30px rgba(0,0,0,.48),
            inset 0 0 25px rgba(0,0,0,.55);
        }

        .bookcase-left { left: 158px; }
        .bookcase-right { right: 158px; }

        .shelf {
          position: relative;
          height: 88px;
          margin-bottom: 10px;
          padding: 10px 7px 8px;
          display: flex;
          align-items: end;
          gap: 4px;
          border-bottom: 7px solid #7b4b25;
          background: linear-gradient(#28150c, #1b0e08);
        }

        .shelf span {
          display: block;
          width: 15px;
          border-radius: 2px 2px 0 0;
          background: linear-gradient(90deg, #5f2440, #9a6b2d);
          box-shadow: inset -2px 0 0 rgba(255,255,255,.08);
        }

        .shelf span:nth-child(1) { height: 48px; }
        .shelf span:nth-child(2) { height: 62px; background: linear-gradient(90deg, #214a3b, #6b8c64); }
        .shelf span:nth-child(3) { height: 55px; background: linear-gradient(90deg, #7a2f24, #b56a3c); }
        .shelf span:nth-child(4) { height: 66px; background: linear-gradient(90deg, #384d6d, #7283a0); }
        .shelf span:nth-child(5) { height: 45px; background: linear-gradient(90deg, #6b4a22, #b18a46); }

        .framed-print {
          position: absolute;
          top: 132px;
          width: 150px;
          height: 112px;
          padding: 9px;
          border: 6px solid #7a4d25;
          background: #d6bb84;
          box-shadow:
            0 0 0 2px #d0a654,
            0 13px 22px rgba(0,0,0,.42),
            inset 0 0 0 3px #3a2113;
        }

        .framed-print-left { left: 308px; }
        .framed-print-right { right: 308px; }

        .print-scene {
          height: 100%;
          display: grid;
          place-items: center;
          text-align: center;
          color: #f1d9a6;
          font-size: 12px;
          letter-spacing: 2px;
          line-height: 1.5;
          background:
            linear-gradient(rgba(18,11,7,.24), rgba(18,11,7,.42)),
            radial-gradient(circle at 50% 20%, rgba(228, 188, 104, .35), transparent 46%),
            #4b2f1d;
          border: 2px solid #aa7a35;
        }

        .lamp {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 210px;
          height: 82px;
          z-index: 4;
        }

        .lamp-shade {
          width: 165px;
          height: 48px;
          margin: 0 auto;
          border-radius: 55% 55% 12px 12px;
          background: linear-gradient(#2f6a53, #123629);
          border: 3px solid #b88a3f;
          box-shadow:
            0 18px 35px rgba(244, 204, 112, .25),
            inset 0 -8px 14px rgba(0,0,0,.35);
        }

        .lamp-stem {
          width: 10px;
          height: 36px;
          margin: -1px auto 0;
          background: linear-gradient(90deg, #6e481f, #e0bb68, #6f4a22);
        }

        .lamp-light {
          position: absolute;
          top: 46px;
          left: 50%;
          width: 500px;
          height: 380px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at top, rgba(255, 223, 151, .34), transparent 67%);
          pointer-events: none;
          z-index: 1;
        }


        .study-area.night-room .window {
          background:
            linear-gradient(rgba(20,35,55,.14), rgba(4,10,20,.22)),
            linear-gradient(180deg, #3f4550 0%, #59606a 43%, #202733 100%);
          box-shadow:
            0 0 0 3px #8c6a35,
            inset 0 0 30px rgba(112,150,205,.18),
            0 14px 24px rgba(0,0,0,.48);
        }

        .study-area.night-room .window-glow {
          background:
            radial-gradient(circle at 50% 35%, rgba(118,159,219,.24), transparent 62%);
        }

        .study-area.night-room .lamp-shade {
          background: linear-gradient(#24503f, #0d281f);
          filter: brightness(.82);
        }

        .study-area.night-room .lamp-stem {
          filter: brightness(.78);
        }

        .study-area.night-room .lamp-light {
          background:
            radial-gradient(ellipse at top, rgba(255,211,122,.24), transparent 66%);
        }

        .study-area.night-room-neon .lamp-light {
          background:
            radial-gradient(ellipse at top, rgba(255,204,108,.28), transparent 64%);
        }

        .cabinet {
          position: relative;
          z-index: 2;
        margin-top: 34px;
          padding: 16px 20px 20px;
          border: 5px solid #86552d;
          background:
            linear-gradient(90deg, rgba(255,255,255,.035), transparent 25%, transparent 75%, rgba(0,0,0,.12)),
            linear-gradient(#5f381f, #321b10);
          box-shadow:
            0 20px 36px rgba(0,0,0,.45),
            inset 0 0 0 3px #2a150c,
            inset 0 0 0 5px #b1823c;
        }

        .cabinet-plaque {
          width: min(560px, 94%);
          margin: 0 auto 8px;
          padding: 6px 14px;
          border: 2px solid #ead18c;
          background: linear-gradient(#9c7438, #5e3e1d);
          color: #ffe8ae;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: inset 0 0 0 3px rgba(38,21,10,.55);
        }

        .drawer {
          position: relative;
          min-height: 315px;
          padding: 14px 16px 16px;
          border: 4px solid #2c170d;
          background: linear-gradient(#7b5130, #4a2c19);
          box-shadow:
            inset 0 0 0 4px #b07f3d,
            inset 0 0 28px rgba(0,0,0,.5),
            0 18px 25px rgba(0,0,0,.35);
          transform: translateY(85px) scale(.97);
          opacity: .25;
          transition: transform .75s ease, opacity .55s ease;
        }

        .drawer.open {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .drawer-handle {
          width: 130px;
          height: 25px;
          margin: -3px auto 10px;
          border: 2px solid #6f461e;
          border-radius: 15px;
          background: linear-gradient(#e0bd69, #90662d);
          box-shadow: 0 4px 9px rgba(0,0,0,.4);
        }

        .archival-mat {
          min-height: 235px;
          padding: 10px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 28% 20%, rgba(255,255,255,.08), transparent 30%),
            radial-gradient(circle at 72% 76%, rgba(0,0,0,.18), transparent 34%),
            repeating-linear-gradient(
              35deg,
              rgba(255,255,255,.018) 0 2px,
              rgba(0,0,0,.018) 2px 4px
            ),
            linear-gradient(145deg, #6f3040 0%, #4d1f2a 48%, #32151d 100%);
          border: 2px solid #b58949;
          box-shadow:
            inset 0 0 0 4px #ead9b7,
            inset 0 0 0 7px #8b6536,
            inset 0 0 28px rgba(0,0,0,.38),
            0 10px 20px rgba(0,0,0,.35);
        }

        .postcard-stage {
          width: 100%;
          display: grid;
          place-items: center;
        }
        .archival-mat.portrait-frame {
          width: min(500px, 100%);
          min-height: 390px;
          margin: 0 auto;
        }

        .postcard-stage.portrait-stage {
          min-height: 360px;
        }


        .artifact-image {
          max-width: 100%;
          width: auto;
          max-height: 340px;
          object-fit: contain;
          background: #eee7da;
          box-shadow: 0 12px 22px rgba(0,0,0,.35);
          transition: transform .3s ease;
          cursor: zoom-in;
        }

        .artifact-image.zoomed {
          cursor: zoom-in;
          z-index: 5;
        }

        .magnified-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(10, 6, 4, .91);
          backdrop-filter: blur(4px);
        }

        .magnified-overlay-card {
          position: relative;
          width: min(94vw, 1240px);
          height: min(92vh, 900px);
          display: grid;
          grid-template-columns: 1fr 210px;
grid-template-rows: 1fr;
          align-items: center;
          justify-items: center;
          gap: 14px;
          padding: 24px 24px 18px;
          border: 3px solid #c49a49;
          background:
            radial-gradient(circle at 50% 0%, rgba(239,213,142,.13), transparent 34%),
            linear-gradient(145deg, #2b1a10, #0f0a07 72%);
          box-shadow: 0 28px 80px rgba(0,0,0,.72);
          overflow: hidden;
        }

        .magnified-image-stage {
          width: 100%;
          height: 100%;
          min-height: 0;
          display: grid;
          place-items: center;
          overflow: visible;
        }

        .magnified-artifact-image {
          display: block;
          width: auto;
          height: auto;
          object-fit: contain;
          background: #eee7da;
          box-shadow: 0 16px 42px rgba(0,0,0,.58);
          transform-origin: center center;
          cursor: zoom-in;
        }

        .magnified-overlay-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  gap: 10px;
  width: 210px;
}

        .magnified-overlay-controls button {
          padding: 10px 16px;
          border: 1px solid #d7ae61;
          background: linear-gradient(#d2a756, #80551f);
          color: #24150c;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .magnified-overlay-controls button:last-child {
          background: linear-gradient(#6b3c20, #341b0e);
          color: #fff0d1;
        }

        .magnified-close {
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
          line-height: 1;
          cursor: pointer;
          z-index: 2;
        }

        .image-placeholder {
          min-height: 270px;
          width: 100%;
          display: grid;
          place-items: center;
          color: #6d573e;
          background: #eee5d5;
          text-align: center;
          font-style: italic;
        }

        .artifact-top-row {
          display: flex;
          justify-content: flex-start;
          margin: 0 0 10px;
        }

        .brass-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border: 1px solid #6f461e;
          border-radius: 4px;
          background: linear-gradient(#efd58e, #b78335 55%, #80551f);
          color: #26150b;
          text-decoration: none;
          font-weight: bold;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.6),
            inset 0 -2px 0 rgba(62,35,12,.35),
            0 4px 9px rgba(0,0,0,.35);
        }

        .brass-back-button:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .miami-neon-mat {
          border-color: #ffcf4f;
          box-shadow:
            inset 0 0 0 4px #fff4c7,
            inset 0 0 0 6px #f2b632,
            0 0 10px #ffb000,
            0 0 24px rgba(255, 74, 190, .72),
            0 10px 20px rgba(0,0,0,.35);
        }

        .florida-collection-mat {
          background:
            radial-gradient(circle at 28% 18%, rgba(255,255,255,.10), transparent 28%),
            radial-gradient(circle at 75% 74%, rgba(255,122,132,.18), transparent 30%),
            repeating-linear-gradient(
              35deg,
              rgba(255,255,255,.018) 0 2px,
              rgba(0,0,0,.018) 2px 4px
            ),
            linear-gradient(145deg, #2f8f95 0%, #24747d 48%, #1b5963 100%);
          border-color: #e7a28d;
          box-shadow:
            inset 0 0 0 4px #f9e9d3,
            inset 0 0 0 7px #d97f70,
            inset 0 0 28px rgba(0,0,0,.28),
            0 0 18px rgba(255,127,112,.16),
            0 10px 20px rgba(0,0,0,.35);
        }

        .california-collection-mat {
          background:
            radial-gradient(circle at 28% 20%, rgba(255,255,255,.07), transparent 30%),
            repeating-linear-gradient(
              35deg,
              rgba(255,255,255,.016) 0 2px,
              rgba(0,0,0,.018) 2px 4px
            ),
            linear-gradient(145deg, #9b5a3d 0%, #7b432f 48%, #5b3023 100%);
          border-color: #d4b07a;
          box-shadow:
            inset 0 0 0 4px #ead9b7,
            inset 0 0 0 7px #b8794d,
            inset 0 0 28px rgba(0,0,0,.34),
            0 10px 20px rgba(0,0,0,.35);
        }

        .holiday-collection-mat {
          background:
            radial-gradient(circle at 72% 18%, rgba(255,214,144,.10), transparent 28%),
            repeating-linear-gradient(
              35deg,
              rgba(255,255,255,.014) 0 2px,
              rgba(0,0,0,.018) 2px 4px
            ),
            linear-gradient(145deg, #244d3b 0%, #17372c 52%, #10261f 100%);
          border-color: #b88f48;
          box-shadow:
            inset 0 0 0 4px #ead9b7,
            inset 0 0 0 7px #7e2c2d,
            inset 0 0 28px rgba(0,0,0,.38),
            0 10px 20px rgba(0,0,0,.35);
        }

        .humor-collection-mat {
          background:
            radial-gradient(circle at 28% 20%, rgba(255,255,255,.07), transparent 30%),
            repeating-linear-gradient(
              35deg,
              rgba(255,255,255,.016) 0 2px,
              rgba(0,0,0,.018) 2px 4px
            ),
            linear-gradient(145deg, #9c7a2f 0%, #75581e 50%, #4f3a14 100%);
          border-color: #d9b965;
          box-shadow:
            inset 0 0 0 4px #f0dfb4,
            inset 0 0 0 7px #8d6a28,
            inset 0 0 28px rgba(0,0,0,.34),
            0 10px 20px rgba(0,0,0,.35);
        }

        .night-subtle-mat {
          position: relative;
          border-color: #8fa7c9;
          background:
            radial-gradient(circle at 50% 12%, rgba(180,210,255,.20), transparent 34%),
            linear-gradient(180deg, rgba(18,27,46,.38), rgba(4,8,18,.50)),
            #c7c5bd;
          box-shadow:
            inset 0 0 0 4px rgba(224,235,255,.76),
            inset 0 0 0 6px rgba(92,114,153,.72),
            0 0 20px rgba(109,143,203,.28),
            0 12px 28px rgba(0,0,0,.48);
        }

        .night-subtle-image {
          filter: saturate(.96) contrast(1.03);
          box-shadow:
            0 0 14px rgba(120,156,214,.16),
            0 12px 24px rgba(0,0,0,.42);
        }

        .night-neon-mat {
          position: relative;
          border-color: #ffe55f;
          background:
            radial-gradient(circle at 28% 18%, rgba(255,48,196,.20), transparent 26%),
            radial-gradient(circle at 72% 22%, rgba(63,230,255,.18), transparent 28%),
            linear-gradient(180deg, #1a1428, #080712 72%);
          box-shadow:
            inset 0 0 0 4px #fff4bd,
            inset 0 0 0 6px #eaa91f,
            0 0 12px rgba(255,215,74,.72),
            0 0 28px rgba(255,66,192,.62),
            0 0 46px rgba(57,211,255,.40),
            0 14px 30px rgba(0,0,0,.58);
        }

        .night-neon-image {
          filter: saturate(1.06) contrast(1.05);
          box-shadow:
            0 0 10px rgba(255,218,84,.22),
            0 0 20px rgba(255,55,190,.16),
            0 0 28px rgba(52,211,255,.14),
            0 14px 26px rgba(0,0,0,.48);
        }

        .postcard-stage.night-vignette-subtle,
        .postcard-stage.night-vignette-neon {
          position: relative;
          overflow: hidden;
        }

        .postcard-stage.night-vignette-subtle::after,
        .postcard-stage.night-vignette-neon::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
        }

        .postcard-stage.night-vignette-subtle::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(8,18,36,0) 0%,
              rgba(8,18,36,0) 58%,
              rgba(5,15,32,.14) 76%,
              rgba(2,8,20,.34) 100%
            );
        }

        .postcard-stage.night-vignette-neon::after {
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

        .night-badge {
          display: inline-block;
          margin-left: 8px;
          padding: 4px 8px;
          border: 1px solid #9b7236;
          background: rgba(255,255,255,.45);
          color: #65451f;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: bold;
        }

        .tour-controls {
          margin: 14px auto 0;
          padding: 8px 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          border: 1px solid #b98a3d;
          background:
            linear-gradient(180deg, rgba(39,79,64,.96), rgba(20,49,38,.98));
          color: #f4e2b7;
          box-shadow: 0 8px 18px rgba(0,0,0,.28);
        }

        .tour-controls strong {
          margin-right: 4px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 13px;
        }

        .tour-controls button {
          padding: 7px 14px;
          border: 1px solid #d3ad60;
          background: linear-gradient(#efd58e, #a8732d);
          color: #25150b;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .tour-controls .tour-exit {
          background: linear-gradient(#7c352c, #4a1d19);
          color: #fff0d1;
        }

        .artifact-controls {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 14px;
        }

        .artifact-controls button {
          padding: 11px 17px;
          border: 1px solid #6d451f;
          background: linear-gradient(#d2a756, #94682d);
          color: #24150c;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .artifact-controls button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .study-note {
          margin: 12px 0 0;
          text-align: center;
          color: #e6cf9f;
          font-style: italic;
        }

        .sidebar {
          display: grid;
          gap: 19px;
          align-content: start;
        }

        .panel {
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: #2d1c12;
          box-shadow: 0 14px 26px rgba(0,0,0,.32);
        }

        .panel h2 {
          margin: 0;
          padding: 6px 10px;
          background: linear-gradient(#274f40, #143126);
          color: #f4e2b7;
          font-size: 13px;
          font-weight: normal;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .panel-content {
        padding: 7px 10px;
        }

        .catalog-select {
          width: 100%;
          min-height: 45px;
          padding: 9px 10px;
          border: 1px solid #8e6932;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .selector-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 11px;
        }

        .selector-buttons button {
          min-height: 39px;
          border: 1px solid #b98a3d;
          background: linear-gradient(#245242, #123329);
          color: #f5e1ac;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .quick-information {
          display: grid;
          gap: 12px;
        }

        .quick-information div {
          display: grid;
          gap: 3px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(91, 63, 30, .25);
        }

        .quick-information div:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .quick-information strong {
          color: #5b351d;
          font-size: 13px;
          letter-spacing: .7px;
          text-transform: uppercase;
        }

        .quick-information span {
          color: #59442f;
          line-height: 1.45;
        }

        .return-gallery-button {
          display: grid;
          gap: 4px;
          padding: 13px 15px;
          border: 1px solid #d0a052;
          background: linear-gradient(#7f2f28, #501b18);
          color: #ffe5a8;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          letter-spacing: .8px;
          text-transform: uppercase;
          box-shadow: inset 0 0 0 3px rgba(43, 17, 12, .55);
        }

        .return-gallery-button small {
          color: #e7c990;
          font-size: 12px;
          font-style: italic;
          font-weight: normal;
          letter-spacing: normal;
          text-transform: none;
        }

        .accession {
          margin: 0 0 12px;
          color: #8a632c;
          font-weight: bold;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          font-size: 12px;
        }

        .artifact-title {
          margin: 0 0 4px;
          color: #4b2716;
          font-size: 17px;
          font-weight: normal;
        }

        .metadata {
          line-height: 1.25;
          font-size: 12px;
        }

        .curator-notes {
          margin: 0;
          line-height: 1.7;
          color: #5a4632;
        }

        .comment-jump-wrap {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .comment-jump-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid #6d451f;
          border-radius: 4px;
          background: linear-gradient(#efd58e, #b78335 55%, #80551f);
          color: #26150b;
          text-decoration: none;
          font-weight: bold;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.6),
            inset 0 -2px 0 rgba(62,35,12,.35),
            0 4px 9px rgba(0,0,0,.35);
        }

        .comment-jump-button:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .comment-jump-note {
          margin: 8px 0 0;
          text-align: center;
          color: #e6cf9f;
          font-size: 14px;
          font-style: italic;
        }

        .comments-section {
          max-width: 1220px;
          margin: 0 auto;
          padding: 0 22px 65px;
        }

        .comments-card {
          border: 2px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: #2d1c12;
          box-shadow: 0 18px 34px rgba(0,0,0,.35);
        }

        .comments-heading {
          margin: 0;
          padding: 18px 20px;
          background: linear-gradient(#274f40, #143126);
          color: #f4e2b7;
          font-size: 24px;
          font-weight: normal;
          text-align: center;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .comments-content {
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
          gap: 26px;
          padding: 24px;
        }

        .comment-form {
          display: grid;
          gap: 13px;
          align-content: start;
        }

        .comment-form label {
          display: grid;
          gap: 6px;
          color: #4d321f;
          font-weight: bold;
        }

        .comment-form input,
        .comment-form textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #9a7440;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .comment-form textarea {
          min-height: 150px;
          resize: vertical;
        }

        .comment-form button {
          width: fit-content;
          padding: 11px 18px;
          border: 1px solid #6d451f;
          background: linear-gradient(#d2a756, #94682d);
          color: #24150c;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .comment-form button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .comment-help {
          margin: 0;
          color: #6b563f;
          line-height: 1.55;
          font-size: 14px;
        }

        .comment-status {
          margin: 0;
          padding: 10px 12px;
          border: 1px solid #a77d3b;
          background: #fff6df;
          color: #4b321f;
          line-height: 1.45;
        }

        .approved-comments {
          display: grid;
          gap: 14px;
          align-content: start;
        }

        .approved-comments h3 {
          margin: 0;
          color: #4b2716;
          font-size: 22px;
          font-weight: normal;
        }

        .comment-entry {
          padding: 15px 16px;
          border-left: 4px solid #b98a3d;
          background: rgba(255,250,240,.72);
        }

        .comment-entry-header {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 7px;
          color: #6a4b2a;
          font-size: 13px;
        }

        .comment-entry p {
          margin: 0;
          color: #4f3a28;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .status-message {
          min-height: 250px;
          display: grid;
          place-items: center;
          text-align: center;
          color: #d9c299;
          padding: 30px;
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

        @media (max-width: 1080px) {
          .window,
          .bookcase,
          .framed-print {
            opacity: .42;
          }

          .bookcase-left { left: 95px; }
          .bookcase-right { right: 95px; }
          .framed-print-left { left: 232px; }
          .framed-print-right { right: 232px; }
        }

        @media (max-width: 920px) {
          .window,
          .bookcase,
          .framed-print {
            display: none;
          }

          .room-shell {
            grid-template-columns: 1fr;
          }

          .sidebar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 620px) {
          .room-header-inner {
            justify-content: center;
            text-align: center;
          }

          .study-area {
            min-height: 520px;
            padding: 18px 12px;
          }

          .cabinet {
            margin-top: 55px;
            padding: 13px 10px 16px;
          }

          .drawer {
            padding: 15px;
          }

          .archival-mat {
            padding: 7px;
            min-height: 210px;
          }

          .archival-mat.portrait-frame {
            min-height: 330px;
          }

          .postcard-stage.portrait-stage {
            min-height: 305px;
          }

          .artifact-image {
            max-height: 245px;
          }


          .sidebar {
            grid-template-columns: 1fr;
          }

          .comments-content {
            grid-template-columns: 1fr;
            padding: 17px;
          }
        }
      `}</style>

      <header className="room-header">
        <div className="room-header-inner">
          <Link href={returnHref}>← Return to {returnLabel}</Link>
          <Link href="/">Museum Entrance</Link>
        </div>
      </header>

    

      <section className="room-shell">
        <div
          className={`study-area ${
            nightMode ? "night-room" : ""
          } ${neonNight ? "night-room-neon" : ""}`}
        >
          <div className="room-decor" aria-hidden="true">
            <div className="window window-left">
              <div className="window-glow" />
              <div className="window-frame-lines" />
            </div>

            <div className="bookcase bookcase-left">
              <div className="shelf shelf-one">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="shelf shelf-two">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="shelf shelf-three">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="framed-print framed-print-left">
              <div className="print-scene">POSTCARD<br />ARCHIVE</div>
            </div>

            <div className="framed-print framed-print-right">
              <div className="print-scene">HISTORIC<br />VIEWS</div>
            </div>

            <div className="bookcase bookcase-right">
              <div className="shelf shelf-one">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="shelf shelf-two">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="shelf shelf-three">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="window window-right">
              <div className="window-glow" />
              <div className="window-frame-lines" />
            </div>
          </div>

          <div className="lamp" aria-hidden="true">
            <div className="lamp-shade" />
            <div className="lamp-stem" />
          </div>
          <div className="lamp-light" aria-hidden="true" />

          {loading || message ? (
            <div className="status-message">
              {loading ? "Preparing the Reading Room..." : message}
            </div>
          ) : (
            <div className="cabinet">
            

              <div className={`drawer ${drawerOpen ? "open" : ""}`}>
                <div className="drawer-handle" />

              

                <div
                  className={`archival-mat ${
                    neonNight
                      ? "night-neon-mat"
                      : nightMode
                      ? "night-subtle-mat"
                      : isMiamiCard
                      ? "miami-neon-mat"
                      : isFloridaGallery
                      ? "florida-collection-mat"
                      : isCaliforniaGallery
                      ? "california-collection-mat"
                      : isHolidayGallery
                      ? "holiday-collection-mat"
                      : isHumorGallery
                      ? "humor-collection-mat"
                      : ""
                  } ${displayPortrait ? "portrait-frame" : ""}`}
                >
                  <div
                    className={`postcard-stage ${
                      displayPortrait ? "portrait-stage" : ""
                    } ${
                      neonNight
                        ? "night-vignette-neon"
                        : nightMode
                        ? "night-vignette-subtle"
                        : ""
                    }`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${selectedCard?.title || "Museum postcard"} ${
                          showingBack ? "back" : "front"
                        }`}
                        className={`artifact-image ${
                          zoomLevel > 0 ? "zoomed" : ""
                        } ${
                          neonNight
                            ? "night-neon-image"
                            : nightMode
                            ? "night-subtle-image"
                            : ""
                        }`}
                        style={{
                          maxWidth: quarterTurn ? "340px" : "100%",
                          maxHeight: displayPortrait ? "360px" : "340px",
                          transform: `rotate(${effectiveRotation}deg)`,
                        }}
                        onLoad={(event) => {
                          const image = event.currentTarget;
                          setImageNaturalPortrait(
                            image.naturalHeight > image.naturalWidth
                          );
                        }}
                        onClick={increaseZoom}
                      />
                    ) : (
                      <div className="image-placeholder">
                        {showingBack
                          ? "No back scan is available for this postcard."
                          : "This postcard does not yet have a front scan."}
                      </div>
                    )}
                  </div>
                </div>

                <div className="tour-controls" aria-label="Gallery tour controls">
                  <strong>
                    {tourActive
                      ? tourPaused
                        ? "Gallery Tour Paused"
                        : tourScope === "florida"
                        ? "Florida Gallery Tour — 10 Seconds per Postcard"
                        : "Grand Gallery Tour — 10 Seconds per Postcard"
                      : "Self-Guided Reading Room"}
                  </strong>

                  {!tourActive ? (
                    <button type="button" onClick={startTour}>
                      ▶ Start Gallery Tour
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setTourPaused((current) => !current)}
                      >
                        {tourPaused ? "▶ Resume Tour" : "Ⅱ Pause Tour"}
                      </button>

                      <button type="button" onClick={choosePreviousCard}>
                        ◀ Previous
                      </button>

                      <button type="button" onClick={chooseNextCard}>
                        Next ▶
                      </button>

                      <button
                        type="button"
                        className="tour-exit"
                        onClick={exitTour}
                      >
                        Exit Tour
                      </button>
                    </>
                  )}
                </div>

              

                <p className="study-note">
                  Click the postcard to open a full-card magnified view. Each magnification level keeps the entire postcard visible. Gallery Tour advances automatically every 10 seconds and pauses while magnification is open.
                  {nightMode
                    ? ` Night presentation: ${
                        neonNight ? "Neon Night" : "Subtle Night"
                      }.`
                    : ""}
                </p>

          
              </div>
            </div>
          )}
        </div>

        {zoomLevel > 0 && imageUrl && (
          <div
            className="magnified-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Magnified view of ${selectedCard?.title || "museum postcard"}`}
            onClick={resetZoom}
          >
            <div
              className="magnified-overlay-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="magnified-close"
                onClick={resetZoom}
                aria-label="Close magnified view"
              >
                ×
              </button>

              <div className="magnified-image-stage">
                <img
                  src={imageUrl}
                  alt={`${selectedCard?.title || "Museum postcard"} ${
                    showingBack ? "back" : "front"
                  } magnified`}
                  className={`magnified-artifact-image ${
                    neonNight
                      ? "night-neon-image"
                      : nightMode
                      ? "night-subtle-image"
                      : ""
                  }`}
                  style={{
                    maxWidth: quarterTurn
                      ? `${[0, 60, 70, 80][zoomLevel]}vh`
                      : `${[0, 64, 76, 88][zoomLevel]}vw`,
                    maxHeight: quarterTurn
                      ? `${[0, 64, 76, 88][zoomLevel]}vw`
                      : `${[0, 60, 70, 80][zoomLevel]}vh`,
                    transform: `rotate(${effectiveRotation}deg)`,
                  }}
                onClick={(event) => {
  event.stopPropagation();

  if (zoomLevel < zoomScales.length - 1) {
    increaseZoom();
  }
}}
                />
              </div>

              <div className="magnified-overlay-controls">
  <button
    type="button"
    onClick={increaseZoom}
    disabled={zoomLevel >= zoomScales.length - 1}
  >
    {zoomLevel >= zoomScales.length - 1
      ? "Maximum Magnification"
      : `Magnify More (${zoomLevel + 1}/${zoomScales.length - 1})`}
  </button>

  <button type="button" onClick={resetZoom}>
    Return to Normal Size
  </button>

  <Link
    href={returnHref}
    style={{
      padding: "10px 16px",
      border: "1px solid #d7ae61",
      background: "linear-gradient(#6b3c20, #341b0e)",
      color: "#fff0d1",
      textDecoration: "none",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    Return to {returnLabel}
  </Link>
</div>
            </div>
          </div>
        )}

        <aside className="sidebar">
          <div
  style={{
    padding: "9px 12px",
    textAlign: "center",
    background:
      "linear-gradient(180deg, #e0bd69 0%, #9a6b2e 100%)",
    border: "2px ridge #6d451f",
    color: "#28180d",
    fontWeight: "bold",
    fontSize: "13px",
    letterSpacing: "1px",
    lineHeight: "1.35",
    boxShadow: "0 5px 12px rgba(0,0,0,.28)",
  }}
>
  The Clarence E. Pridemore Jr.
  <br />
  Reading Room
</div>
          <section className="panel">
            <h2>Artifact Information</h2>
            <div className="panel-content">
              <p className="accession">
                VPM {String(selectedCard?.id ?? 0).padStart(4, "0")}
              </p>
              <h3 className="artifact-title">
                {selectedCard?.title || "Untitled Postcard"}
              </h3>

              <div className="metadata">
                <div><strong>Location:</strong> {location}</div>
                <div>
                  <strong>Landmark:</strong>{" "}
                  {selectedCard?.landmark || "Not recorded"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {selectedCard?.postcard_date || "Not recorded"}
                </div>
                <div>
                  <strong>Gallery:</strong>{" "}
                  {selectedCard?.gallery || "Grand Gallery"}
                </div>

              </div>
            </div>
          </section>

          <section className="panel">
  
  <h2>Exhibit Controls</h2>

  <div
    className="panel-content"
    style={{
      display: "grid",
      gap: "9px",
    }}
  >
    <button
      type="button"
      onClick={() => {
        setShowingBack((current) => !current);
        setZoomLevel(0);
        setRotation(0);
      }}
      disabled={!selectedCard?.back_image_url}
      style={{
        padding: "7px 10px",
        border: "1px solid #8e6932",
        background: "linear-gradient(#d2a756, #94682d)",
        color: "#24150c",
        fontFamily: "inherit",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {!selectedCard?.back_image_url
        ? "Back Scan Not Available"
        : showingBack
        ? "Turn Card to Front"
        : "Turn Card Over"}
    </button>

    <button
      type="button"
      onClick={increaseZoom}
      disabled={!imageUrl}
      style={{
        padding: "7px 10px",
        border: "1px solid #8e6932",
        background: "linear-gradient(#d2a756, #94682d)",
        color: "#24150c",
        fontFamily: "inherit",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Magnify Artifact
    </button>

    <button
      type="button"
      onClick={() =>
        setRotation((current) => (current - 90 + 360) % 360)
      }
      disabled={!imageUrl}
      style={{
        padding: "10px 12px",
        border: "1px solid #8e6932",
        background: "linear-gradient(#d2a756, #94682d)",
        color: "#24150c",
        fontFamily: "inherit",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Rotate Left 90°
    </button>

    <a
      href="#comments"
      style={{
        padding: "10px 12px",
        border: "1px solid #8e6932",
        background: "linear-gradient(#274f40, #143126)",
        color: "#f4e2b7",
        textDecoration: "none",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      Share a Memory or Comment
    </a>

    <Link
      href={returnHref}
      style={{
        padding: "10px 12px",
        border: "1px solid #d0a052",
        background: "linear-gradient(#7f2f28, #501b18)",
        color: "#ffe5a8",
        textDecoration: "none",
        textAlign: "center",
        fontWeight: "bold",
      }}
    >
      Return to {returnLabel}
    </Link>
  </div>
</section>
            <h2>Curator&apos;s Notes</h2>
            <div className="panel-content">
              <p className="curator-notes">
                {selectedCard?.description ||
                  "Curator's notes have not yet been added for this artifact. This space will eventually preserve historical details, publishing information, architectural observations, and stories connected with the postcard."}
              </p>
            </div>

          <section className="panel">
            <h2>Postcard Selector</h2>
            <div className="panel-content">
              <select
                className="catalog-select"
                value={selectedId ?? ""}
                onChange={(event) => chooseCard(Number(event.target.value))}
                disabled={postcards.length === 0}
              >
                {postcards.map((card) => (
                  <option value={card.id} key={card.id}>
                    VPM {String(card.id).padStart(4, "0")} —{" "}
                    {card.title || "Untitled Postcard"}
                  </option>
                ))}
              </select>

              <div className="selector-buttons">
                <button type="button" onClick={choosePreviousCard}>
                  ◀ Previous
                </button>
                <button type="button" onClick={chooseNextCard}>
                  Next ▶
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Quick Information</h2>
            <div className="panel-content quick-information">
              <div>
                <strong>Postmark Date</strong>
                <span>{selectedCard?.postcard_date || "Not recorded"}</span>
              </div>
              <div>
                <strong>Collection</strong>
                <span>{selectedCard?.gallery || "Grand Gallery"}</span>
              </div>
              <div>
                <strong>Artifact Status</strong>
                <span>Preserved and cataloged</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2>Actions</h2>
            <div className="panel-content">
              <Link className="return-gallery-button" href={returnHref}>
                Return to {returnLabel}
                <small>Return to the previous gallery</small>
              </Link>
            </div>
          </section>
        </aside>
      </section>

      <section className="comments-section" id="comments">
        <div className="comments-card">
          <h2 className="comments-heading">Share a Memory or Comment</h2>

          <div className="comments-content">
            <form className="comment-form" onSubmit={submitComment}>
              <p className="comment-help">
                Share a memory, historical detail, correction, or observation
                about <strong>{selectedCard?.title || "this postcard"}</strong>.
                Comments are reviewed by the curator before they appear publicly.
              </p>

              <label>
                Display Name
                <input
                  type="text"
                  value={visitorName}
                  onChange={(event) => setVisitorName(event.target.value)}
                  maxLength={60}
                  required
                  placeholder="Your name"
                />
              </label>

              <label>
                Email Address — Optional and Private
                <input
                  type="email"
                  value={visitorEmail}
                  onChange={(event) => setVisitorEmail(event.target.value)}
                  maxLength={150}
                  placeholder="Your email will not be displayed"
                />
              </label>

              <label>
                Memory or Comment
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  minLength={2}
                  maxLength={1000}
                  required
                  placeholder="Share what you remember or know about this postcard..."
                />
              </label>

              <p className="comment-help">
                {commentText.length}/1000 characters
              </p>

              <button
                type="submit"
                disabled={submittingComment || !selectedCard}
              >
                {submittingComment
                  ? "Submitting..."
                  : "Submit for Curator Review"}
              </button>

              {commentStatus && (
                <p className="comment-status" role="status">
                  {commentStatus}
                </p>
              )}
            </form>

            <div className="approved-comments">
              <h3>Visitor Memories and Comments</h3>

              {commentsLoading ? (
                <p className="comment-help">Loading approved comments...</p>
              ) : comments.length === 0 ? (
                <p className="comment-help">
                  No approved visitor comments have been posted for this
                  postcard yet. You may be the first to share a memory.
                </p>
              ) : (
                comments.map((comment) => (
                  <article className="comment-entry" key={comment.id}>
                    <div className="comment-entry-header">
                      <strong>{comment.visitor_name}</strong>
                      <span>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{comment.comment_text}</p>
                  </article>
                ))
              )}
            </div>
          </div>
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