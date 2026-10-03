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
  night_display: string | null;
  created_at: string | null;
};

const galleries = [
  { href: "/collection/florida", label: "Florida Gallery", icon: "🌴", tone: "florida" },
  { href: "/california", label: "California Gallery", icon: "🌉", tone: "california" },
  { href: "/holiday", label: "Holiday Gallery", icon: "🎄", tone: "holiday" },
  { href: "/humor", label: "Humor Gallery", icon: "☺", tone: "humor" },
  { href: "/history", label: "History of Postcards", icon: "✒", tone: "history" },
];

export default function GrandGalleryPage() {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Opening the Grand Gallery...");
  const [isLoading, setIsLoading] = useState(true);
  const [showingBack, setShowingBack] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadPublishedPostcards() {
      setIsLoading(true);
      setMessage("Opening the Grand Gallery...");

      const { data, error } = await supabase
        .from("postcards")
        .select(
          "id, title, country, state, city, landmark, postcard_date, gallery, status, featured, description, front_image_url, back_image_url, display_rotation, night_display, created_at"
        )
        .eq("status", "Published")
        .order("created_at", { ascending: false });

      if (error) {
        setPostcards([]);
        setMessage(`The gallery could not be opened: ${error.message}`);
      } else {
        setPostcards((data as Postcard[]) || []);
        setMessage("");
      }

      setIsLoading(false);
    }

    void loadPublishedPostcards();
  }, []);

  const filteredPostcards = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return postcards;

    return postcards.filter((postcard) =>
      [
        postcard.title,
        postcard.country,
        postcard.state,
        postcard.city,
        postcard.landmark,
        postcard.postcard_date,
        postcard.gallery,
        postcard.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [postcards, search]);

  const featuredCount = postcards.filter((postcard) => postcard.featured).length;

  function togglePostcard(id: number) {
    setShowingBack((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <main className="museum-page">
      <style>{`
        :root {
          --ink: #241710;
          --brass: #c59a47;
          --brass-light: #f0d38b;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        @keyframes floridaGrandGlow {
          0%, 100% {
            color: #7df9ff;
            text-shadow:
              0 0 6px rgba(125,249,255,.82),
              0 0 15px rgba(39,220,232,.55);
          }
          33% {
            color: #ff8ec7;
            text-shadow:
              0 0 6px rgba(255,142,199,.82),
              0 0 15px rgba(255,105,180,.52);
          }
          66% {
            color: #ffd27a;
            text-shadow:
              0 0 6px rgba(255,210,122,.82),
              0 0 15px rgba(255,166,77,.48);
          }
        }

        @keyframes floridaPlaqueGlow {
          0%, 100% {
            box-shadow:
              inset 0 0 0 2px rgba(38,22,10,.35),
              0 0 8px rgba(125,249,255,.48),
              0 0 16px rgba(125,249,255,.22);
          }
          50% {
            box-shadow:
              inset 0 0 0 2px rgba(38,22,10,.35),
              0 0 10px rgba(255,142,199,.58),
              0 0 22px rgba(255,210,122,.24);
          }
        }

        .museum-page {
          min-height: 100vh;
          color: var(--ink);
          background: #f7f0e3;
          font-family: Georgia, "Times New Roman", serif;
        }

        .topbar {
          background: #16100c;
          border-bottom: 1px solid rgba(231, 194, 117, .45);
          color: #f8edd7;
        }

        .topbar-inner {
          max-width: 1220px;
          margin: 0 auto;
          padding: 17px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .topbar a {
          color: #f1d28f;
          text-decoration: none;
          transition: transform .2s ease, filter .2s ease, color .2s ease;
        }

        .topbar a:hover {
          filter: brightness(1.14);
        }

        .top-links {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
        }

        .top-florida-link {
          position: relative;
          display: inline-block;
          padding: 2px 7px 4px;
          border-radius: 999px;
          font-weight: bold;
          animation: floridaGrandGlow 5.5s ease-in-out infinite;
        }

        .top-florida-link::after {
          content: "";
          position: absolute;
          left: 15%;
          right: 15%;
          bottom: 0;
          height: 1px;
          background:
            linear-gradient(90deg, transparent, #7df9ff, #ff8ec7, #ffd27a, transparent);
          opacity: .84;
        }

        .entrance {
          position: relative;
          overflow: hidden;
          min-height: 585px;
          padding: 6px 20px 0;
          background:
            radial-gradient(circle at 50% 14%, rgba(238, 190, 95, .23), transparent 28%),
            linear-gradient(180deg, #21160f 0%, #342116 58%, #17100c 100%);
          color: #fff2d6;
          border-bottom: 6px solid #9b6e2e;
        }

        .entrance::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,.018) 0 1px, transparent 1px 70px),
            linear-gradient(90deg, rgba(0,0,0,.3), transparent 20%, transparent 80%, rgba(0,0,0,.3));
        }

        .crest {
          position: relative;
          z-index: 2;
          width: 54px;
          height: 54px;
          margin: 0 auto 5px;
          display: grid;
          place-items: center;
          border: 4px double var(--brass-light);
          border-radius: 50%;
          background: radial-gradient(circle, #6b4826 0 48%, #2a170d 49% 100%);
          box-shadow: 0 0 0 7px rgba(37, 22, 12, .8), 0 12px 25px rgba(0,0,0,.45);
          color: #f4d892;
          font-size: 23px;
          font-weight: bold;
          letter-spacing: 2px;
          padding-top: 2px;
        }

        .crest::after {
          content: "✦";
          position: absolute;
          bottom: 7px;
          font-size: 13px;
          color: #d6ad58;
        }

        .entrance-heading {
          position: relative;
          z-index: 2;
          width: min(450px, 88vw);
          margin: 0 auto 6px;
          padding: 2px 22px 2px;
          text-align: center;
          color: #ffe9b4;
          background: linear-gradient(180deg, #8a622b, #4a2c16 48%, #24150e);
          border: 2px solid #dfbd6d;
          box-shadow: 0 13px 28px rgba(0,0,0,.42), inset 0 0 0 4px rgba(43,25,13,.65);
          clip-path: polygon(5% 0, 95% 0, 100% 25%, 100% 75%, 95% 100%, 5% 100%, 0 75%, 0 25%);
        }

        .entrance-heading h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 43px);
          font-weight: normal;
          letter-spacing: clamp(3px, .8vw, 8px);
          text-transform: uppercase;
          text-shadow:
            0 2px 2px #130b07,
            0 0 12px rgba(240,211,139,.10);
        }

        .architecture {
          position: relative;
          z-index: 2;
          max-width: 1090px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 120px minmax(0, 730px) 120px;
          justify-content: center;
          align-items: end;
          gap: 26px;
        }

        .column {
          position: relative;
          height: 370px;
          border-radius: 5px;
          background:
            linear-gradient(90deg, rgba(64,56,48,.38), transparent 16%, transparent 84%, rgba(64,56,48,.38)),
            repeating-linear-gradient(90deg, #8a857d 0 7px, #eeeae2 7px 14px, #fffdf8 14px 21px, #c1bbb1 21px 29px);
          box-shadow: 0 24px 31px rgba(0,0,0,.5), inset 15px 0 19px rgba(255,255,255,.24), inset -15px 0 19px rgba(52,44,37,.25);
        }

        .column::before {
          content: "";
          position: absolute;
          left: -26px;
          right: -26px;
          top: -50px;
          height: 54px;
          border: 2px solid #999187;
          border-radius: 12px 12px 3px 3px;
          background:
            radial-gradient(ellipse at 25% 55%, #fffdf7 0 12%, #bdb5aa 13% 29%, transparent 30%),
            radial-gradient(ellipse at 75% 55%, #fffdf7 0 12%, #bdb5aa 13% 29%, transparent 30%),
            linear-gradient(#fffdf7, #b2aaa0);
          box-shadow: 0 8px 12px rgba(0,0,0,.36);
        }

        .column::after {
          content: "";
          position: absolute;
          left: -25px;
          right: -25px;
          bottom: -25px;
          height: 30px;
          border: 2px solid #8e867c;
          border-radius: 3px 3px 8px 8px;
          background: linear-gradient(#e6e0d7, #91897e);
          box-shadow: 0 9px 12px rgba(0,0,0,.45);
        }

        .doorway {
        .door-crest {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 7;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 3px double var(--brass-light);
  border-radius: 50%;
  background: radial-gradient(circle, #6b4826 0 48%, #2a170d 49% 100%);
  color: #f4d892;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 5px 12px rgba(0,0,0,.45);
}
          position: relative;
          height: 405px;
          border: 9px solid #6e4925;
          border-bottom-width: 13px;
          background:
            linear-gradient(180deg, rgba(20,12,8,.15), rgba(7,5,4,.84)),
            radial-gradient(circle at 50% 12%, rgba(255,222,151,.42), transparent 38%),
            #130c08;
          box-shadow: 0 0 0 4px #bd9144, 0 0 0 10px #29170d, 0 28px 45px rgba(0,0,0,.58), inset 0 0 45px #000;
          overflow: hidden;
        }

        .doorway::before {
          content: "";
          position: absolute;
          left: 8%;
          right: 8%;
          top: 0;
          height: 35px;
          background: linear-gradient(#704722, #2b190e);
          border-bottom: 2px solid #c69b4d;
          z-index: 6;
        }

        .directory {
          position: absolute;
          z-index: 1;
          top: 58px;
          left: 50%;
          width: min(72%, 390px);
          transform: translateX(-50%) scale(.82);
          transform-origin: top center;
          padding: 15px 16px 17px;
          background: linear-gradient(145deg, #ead9b7, #b99258);
          border: 5px solid #4b2d17;
          box-shadow: 0 0 0 2px #c79d50, 0 22px 28px rgba(0,0,0,.55);
          color: #2e1a0f;
          text-align: center;
        }

        .directory h2 {
          margin: 0 0 11px;
          padding-bottom: 7px;
          border-bottom: 2px solid #684321;
          font-size: 22px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .directory-list { display: grid; gap: 7px; }

        .directory-plaque {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid rgba(255,255,255,.46);
          box-shadow: inset 0 0 0 2px rgba(38,22,10,.35);
          color: #fff9e9;
          text-decoration: none;
          font-weight: bold;
          font-size: 13px;
          letter-spacing: .5px;
          text-shadow: 0 1px 1px #201108;
          transition:
            transform .2s ease,
            filter .2s ease,
            box-shadow .2s ease;
        }

        .directory-plaque:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .florida {
          background:
            linear-gradient(120deg, #0b6470 0%, #168e96 35%, #d66f88 72%, #dfaa61 100%);
          border-color: #ffd99a;
          animation: floridaPlaqueGlow 5.5s ease-in-out infinite;
        }

        .florida span:last-child {
          animation: floridaGrandGlow 5.5s ease-in-out infinite;
          font-weight: bold;
        }
        .california { background: linear-gradient(135deg, #355f78, #203b50); }
        .holiday { background: linear-gradient(135deg, #7d2631, #45151d); }
        .humor { background: linear-gradient(135deg, #a67b2c, #5d431c); }
        .history { background: linear-gradient(135deg, #665047, #352822); }

        .door {
          position: absolute;
          z-index: 4;
          top: 36px;
          bottom: 0;
          width: 39%;
          border: 5px solid #a97838;
          background:
            repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 2px, transparent 2px 29px),
            linear-gradient(90deg, #1d0f08, #5a3219 45%, #2a150b);
          box-shadow: inset 0 0 0 6px #2c160b, inset 0 0 0 9px #b08340, inset 0 0 34px #0b0604, 0 16px 25px rgba(0,0,0,.5);
        }

        .door-left {
          left: 0;
          transform: perspective(750px) rotateY(42deg);
          transform-origin: left center;
        }

        .door-right {
          right: 0;
          transform: perspective(750px) rotateY(-42deg);
          transform-origin: right center;
        }

        .door-glass {
          position: absolute;
          inset: 13% 14% 20%;
          display: grid;
          place-items: center;
          padding: 10px;
          border: 4px double #d0a75a;
          background:
            linear-gradient(rgba(18,10,6,.25), rgba(18,10,6,.5)),
            repeating-linear-gradient(45deg, rgba(230,202,143,.16) 0 2px, transparent 2px 14px),
            #221811;
          color: #f1d28d;
          font-size: clamp(17px, 2.3vw, 28px);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-align: center;
          writing-mode: horizontal-tb;
          text-orientation: mixed;
          text-shadow: 0 2px 2px #000;
        }

        .door-left .door-glass { transform: none; }

        .door-handle {
          position: absolute;
          top: 51%;
          width: 10px;
          height: 73px;
          border-radius: 10px;
          background: linear-gradient(90deg, #70471f, #e4c16c, #745020);
          box-shadow: 0 3px 7px #000;
        }

        .door-left .door-handle { right: 17px; }
        .door-right .door-handle { left: 17px; }

        .floor {
          position: relative;
          z-index: 3;
          max-width: 930px;
          height: 96px;
          margin: -5px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #876022;
          text-decoration: none;
          background:
            linear-gradient(105deg, transparent 0 16%, rgba(108,101,91,.32) 16.3% 16.7%, transparent 17% 47%, rgba(108,101,91,.28) 47.3% 47.7%, transparent 48% 78%, rgba(108,101,91,.26) 78.3% 78.7%, transparent 79%),
            linear-gradient(15deg, transparent 0 33%, rgba(105,98,88,.25) 33.3% 33.7%, transparent 34% 69%, rgba(105,98,88,.22) 69.3% 69.7%, transparent 70%),
            linear-gradient(180deg, #f4f1eb, #c9c2b8);
          clip-path: polygon(15% 0, 85% 0, 100% 100%, 0 100%);
          box-shadow: 0 -8px 18px rgba(0,0,0,.38), inset 0 3px 0 rgba(255,255,255,.8);
        }

        .floor span {
          font-size: clamp(18px, 3vw, 29px);
          font-weight: bold;
          letter-spacing: clamp(3px, .7vw, 8px);
          text-shadow: 0 1px 0 #fff4cf;
        }

        .floor b { margin-top: 2px; font-size: 31px; line-height: 1; }

        .floor {
          transition: filter .2s ease, transform .2s ease;
        }

        .floor:hover {
          filter: brightness(1.04);
          transform: translateY(1px);
        }

        .catalog {
          padding: 50px 22px 70px;
          background: radial-gradient(circle at 20% 0, rgba(193,154,83,.13), transparent 31%), #f8f2e7;
        }

        .catalog-inner { max-width: 1180px; margin: 0 auto; }
        .catalog-heading { text-align: center; margin-bottom: 27px; }

        .catalog-heading p {
          color: #7d5b33;
          text-transform: uppercase;
          letter-spacing: 4px;
          font-weight: bold;
          margin: 0 0 9px;
        }

        .catalog-heading h2 {
          margin: 0;
          color: #532c19;
          font-size: clamp(34px, 5vw, 55px);
          font-weight: normal;
        }

        .search-panel {
          display: grid;
          grid-template-columns: minmax(0, 1fr) repeat(3, minmax(125px, 180px));
          gap: 13px;
          padding: 18px;
          border: 1px solid #c39a53;
          background: rgba(255,250,240,.9);
          box-shadow: 0 12px 28px rgba(62,40,20,.12);
        }

        .search-panel input {
          width: 100%;
          min-height: 57px;
          padding: 0 17px;
          border: 2px solid #9d783b;
          background: #fffefa;
          color: #3b271b;
          font: inherit;
          font-size: 16px;
          outline: none;
        }

        .search-panel input:focus {
          border-color: #5f351d;
          box-shadow: 0 0 0 3px rgba(176,129,55,.2);
        }

        .stat {
          min-height: 57px;
          display: grid;
          place-items: center;
          padding: 7px 10px;
          background: linear-gradient(#5d3820, #311c10);
          border: 1px solid #c99d50;
          color: #fff1cf;
          text-align: center;
        }

        .stat strong { display: block; font-size: 23px; color: #f2d58c; }
        .stat span { display: block; margin-top: 2px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

        .message {
          margin: 28px 0 0;
          padding: 20px;
          border: 1px solid #c9a35d;
          background: #fff9ec;
          color: #6d4524;
          text-align: center;
        }

        .postcard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(285px, 1fr));
          gap: 25px;
          margin-top: 31px;
        }

        .postcard-card {

          position: relative;
          overflow: hidden;
          border: 1px solid #c7a45a;
          border-radius: 4px;
          background:
            radial-gradient(circle, rgba(140,105,60,.07) 1px, transparent 1.5px) 0 0 / 24px 24px,
            repeating-linear-gradient(45deg, rgba(140,105,60,.025) 0 1px, transparent 1px 18px),
            linear-gradient(145deg, #fffefa, #efe2c8);
          box-shadow: 0 15px 30px rgba(55,35,15,.16);
        }
          .coming-soon-card {
  min-height: 360px;
  display: grid;
  place-items: center;
  padding: 18px;
  border: 3px solid #2a160b;
  background:
    linear-gradient(145deg, #4a2a15 0%, #7b4a24 20%, #2b160b 48%, #6b3d1d 78%, #3a2111 100%);
  box-shadow:
    inset 0 0 0 2px rgba(208,163,83,.72),
    inset 0 0 0 7px rgba(61,32,14,.72),
    inset 0 0 24px rgba(0,0,0,.48),
    0 15px 30px rgba(55,35,15,.16);
}

.coming-soon-inner {
  width: 100%;
  min-height: 250px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 14px;
  padding: 28px;
  border: 6px solid #d8c49a;
  background: #efe3c8;
  box-shadow:
    inset 0 0 18px rgba(82,52,24,.18),
    0 0 0 1px #8c6a3b;
  text-align: center;
}

.coming-soon-title {
  color: #5a321b;
  font-size: 26px;
  line-height: 1.3;
  font-weight: bold;
}

.coming-soon-subtitle {
  color: #8a6432;
  font-size: 17px;
  font-style: italic;
}

        .postcard-image-frame {
          position: relative;
          min-height: 250px;
          padding: 15px;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            linear-gradient(145deg, #4a2a15 0%, #7b4a24 20%, #2b160b 48%, #6b3d1d 78%, #3a2111 100%);
          border: 3px solid #2a160b;
          box-shadow:
            inset 0 0 0 2px rgba(208,163,83,.72),
            inset 0 0 0 7px rgba(61,32,14,.72),
            inset 0 0 24px rgba(0,0,0,.48),
            0 8px 18px rgba(50,29,14,.24);
        }

        .postcard-image-frame::before {
          content: "";
          position: absolute;
          inset: 7px;
          pointer-events: none;
          border: 1px solid rgba(226,190,115,.72);
          box-shadow: inset 0 0 0 2px rgba(53,27,12,.55);
          z-index: 3;
        }

        .postcard-image-frame.landscape-frame {
          aspect-ratio: 3 / 2;
        }

        .postcard-image-frame.portrait-frame {
          width: min(100%, 315px);
          height: auto;
          aspect-ratio: 2 / 3;
          margin-left: auto;
          margin-right: auto;
          padding: 10px;
        }

        .image-stage {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #d8c8a8;
          border: 6px solid #d8c49a;
          box-shadow:
            inset 0 0 18px rgba(82,52,24,.22),
            0 0 0 1px #8c6a3b;
        }

        .image-stage.portrait-stage {
          width: 100%;
          height: 100%;
        }

        .image-stage.night-subtle::after,
        .image-stage.night-neon::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
        }

        .image-stage.night-subtle::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(12,22,39,0) 0%,
              rgba(12,22,39,0) 58%,
              rgba(8,18,35,.16) 76%,
              rgba(4,10,22,.34) 100%
            );
        }

        .image-stage.night-neon::after {
          background:
            radial-gradient(
              ellipse at center,
              rgba(6,16,34,0) 0%,
              rgba(6,16,34,0) 56%,
              rgba(4,13,31,.20) 70%,
              rgba(2,8,22,.48) 87%,
              rgba(1,5,14,.70) 100%
            );
          box-shadow:
            inset 0 0 26px rgba(8,23,51,.28),
            inset 0 0 52px rgba(3,11,28,.26);
        }

        .postcard-image {
          position: relative;
          z-index: 1;
          display: block;
          object-fit: contain;
          background: #ece5d8;
          box-shadow: 0 4px 12px rgba(0,0,0,.25);
          transform-origin: center center;
        }

        .landscape-image {
          width: 100%;
          height: 100%;
          max-height: 250px;
        }

        .portrait-image {
          width: 150%;
          height: auto;
          max-width: none;
          max-height: none;
        }

        .image-missing {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          background: #e8dfcf;
          color: #775e43;
          font-style: italic;
          text-align: center;
        }

        .featured-ribbon {
          position: absolute;
          z-index: 3;
          top: 22px;
          left: -36px;
          width: 150px;
          padding: 7px;
          transform: rotate(-39deg);
          background: #8a3a25;
          color: #fff7dd;
          text-align: center;
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 3px 8px rgba(0,0,0,.35);
        }

        .card-content { padding: 20px 21px 23px; }
        .card-content h3 { margin: 0; color: #572d19; font-size: 24px; font-weight: normal; }

        .accession {
          margin-top: 7px;
          color: #946c31;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .details { margin-top: 15px; color: #513923; line-height: 1.65; font-size: 15px; }
        .description { margin: 15px 0 0; color: #6c5843; line-height: 1.65; }

        .flip-button {
          width: 100%;
          margin-top: 18px;
          padding: 11px 14px;
          border: 1px solid #7b4d25;
          background: linear-gradient(#c99b4b, #9a6c2f);
          color: #26170d;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .flip-button:disabled { cursor: not-allowed; opacity: .52; }

        .view-exhibit-link {
          display: block;
          width: 100%;
          margin-top: 10px;
          padding: 11px 14px;
          border: 1px solid #7b4d25;
          background: linear-gradient(#5d3820, #311c10);
          color: #fff1cf;
          text-align: center;
          text-decoration: none;
          font-weight: bold;
          letter-spacing: .3px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
        }

        .view-exhibit-link:hover {
          filter: brightness(1.08);
        }

        .postcard-image-link {
          display: block;
          width: 100%;
          height: 100%;
          color: inherit;
          text-decoration: none;
        }

        .grand-wayfinder {
          position: absolute;
          right: 22px;
          top: 46%;
          z-index: 8;
          width: 128px;
          padding: 11px 9px 12px;
          border: 1px solid #d0a552;
          outline: 2px solid rgba(73,43,18,.75);
          background:
            linear-gradient(180deg, rgba(76,45,22,.96), rgba(37,21,12,.97));
          color: #f4d58c;
          text-align: center;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-size: 11px;
          line-height: 1.45;
          box-shadow:
            inset 0 0 0 2px rgba(225,184,95,.14),
            0 8px 18px rgba(0,0,0,.42);
        }

        .grand-wayfinder strong {
          display: block;
          margin-top: 5px;
          font-size: 24px;
          line-height: 1;
          color: #f0c969;
        }

        .grand-wayfinder:hover {
          filter: brightness(1.08);
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 44px 20px;
          border: 1px dashed #b4935a;
          background: rgba(255,255,255,.48);
          text-align: center;
          color: #735333;
        }

        .footer {
          padding: 44px 24px;
          background: #17100c;
          border-top: 5px solid #a87b35;
          color: #d8c7a9;
          text-align: center;
        }

        .footer h2 { margin: 0; color: #fff0ce; font-size: 28px; font-weight: normal; }

        @media (max-width: 900px) {
          .architecture { grid-template-columns: 76px minmax(0, 1fr) 76px; gap: 14px; }
          .column { height: 380px; }
          .doorway { height: 420px; }
          .search-panel { grid-template-columns: 1fr 1fr 1fr; }
          .search-panel input { grid-column: 1 / -1; }
        }

        @media (max-width: 640px) {
          .grand-wayfinder {
            right: 8px;
            top: 42%;
            width: 94px;
            padding: 8px 6px;
            font-size: 9px;
          }

          .topbar-inner, .top-links { justify-content: center; text-align: center; }
          .entrance { min-height: 610px; padding-left: 10px; padding-right: 10px; }
          .crest { width: 78px; height: 78px; font-size: 23px; }
          .architecture { grid-template-columns: 1fr; }
          .column { display: none; }
          .doorway { width: min(100%, 520px); height: 395px; margin: 0 auto; }
          .directory { top: 61px; width: 76%; transform: translateX(-50%) scale(.76); }
          .door { width: 42%; }
          .floor { width: 100%; height: 100px; }
          .search-panel { grid-template-columns: 1fr; }
          .search-panel input { grid-column: auto; }

        }
      `}</style>

      <div className="topbar">
        <div className="topbar-inner">
          <Link href="/">← Museum Entrance</Link>
          <div className="top-links">
            <Link href="/collection/florida" className="top-florida-link">Florida</Link>
            <Link href="/california">California</Link>
            <Link href="/holiday">Holiday</Link>
            <Link href="/humor">Humor</Link>
          </div>
        </div>
      </div>

      <header className="entrance">
        <a
          href="#live-catalog"
          className="grand-wayfinder"
          aria-label="Continue to the Grand Gallery Collection"
        >
          Continue to the
          <br />
          Grand Gallery
          <strong aria-hidden="true">↓</strong>
        </a>

      

        <div className="entrance-heading">
          <h1>Grand Gallery</h1>
        </div>

        <div className="architecture">
          <div className="column" aria-hidden="true" />

          <div className="doorway">
            <div className="door-crest" aria-label="Virtual Postcard Museum crest">
  VPM
</div>
            <div className="directory">
              <h2>Museum Directory</h2>
              <div className="directory-list">
                {galleries.map((gallery) => (
                  <Link key={gallery.href} href={gallery.href} className={`directory-plaque ${gallery.tone}`}>
                    <span aria-hidden="true">{gallery.icon}</span>
                    <span>{gallery.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="door door-left" aria-hidden="true">
              <div className="door-glass">Grand</div>
              <div className="door-handle" />
            </div>

            <div className="door door-right" aria-hidden="true">
              <div className="door-glass">Gallery</div>
              <div className="door-handle" />
            </div>
          </div>

          <div className="column" aria-hidden="true" />
        </div>

        <a href="#live-catalog" className="floor" aria-label="Continue to the live museum catalog">
          <span>Please Continue</span>
          <b aria-hidden="true">↓</b>
        </a>
      </header>

      <section id="live-catalog" className="catalog">
        <div className="catalog-inner">
          <div className="catalog-heading">
            <p>The Grand Gallery Collection</p>
            <h2>Live Museum Catalog</h2>
          </div>

          <div className="search-panel">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, place, landmark, date, gallery, or description..."
              aria-label="Search the museum catalog"
            />

            <div className="stat"><div><strong>{postcards.length}</strong><span>Published</span></div></div>
            <div className="stat"><div><strong>{featuredCount}</strong><span>Featured</span></div></div>
            <div className="stat"><div><strong>{filteredPostcards.length}</strong><span>Showing</span></div></div>
          </div>

          {(isLoading || message) && (
            <div className="message">{isLoading ? "Opening the Grand Gallery..." : message}</div>
          )}

          {!isLoading && !message && (
            <div className="postcard-grid">
              {filteredPostcards.length === 0 ? (
                <div className="empty-state">
                  No postcards match that search. Try another place, date, landmark, or gallery.
                </div>
              ) : (
                filteredPostcards.map((postcard) => {
                  const backIsShowing = Boolean(showingBack[postcard.id]);
                  const imageUrl =
                    backIsShowing && postcard.back_image_url
                      ? postcard.back_image_url
                      : postcard.front_image_url;
                  const location =
                    [postcard.city, postcard.state, postcard.country]
                      .filter(Boolean)
                      .join(", ") || "Location not recorded";

                  const savedRotation = postcard.display_rotation ?? 0;
                  const portraitDisplay =
                    savedRotation === 90 || savedRotation === 270;

                  const nightDisplay =
                    !backIsShowing && postcard.night_display
                      ? postcard.night_display.toLowerCase()
                      : "off";

                  return (
                    <article className="postcard-card" key={postcard.id}>
                      {postcard.featured && <div className="featured-ribbon">Featured</div>}

                      <div
                        className={`postcard-image-frame ${
                          portraitDisplay ? "portrait-frame" : "landscape-frame"
                        }`}
                      >
                        {imageUrl ? (
                          backIsShowing ? (
                            <div
                              className={`image-stage ${
                                portraitDisplay ? "portrait-stage" : ""
                              }`}
                            >
                              <img
                                className={`postcard-image ${
                                  portraitDisplay
                                    ? "portrait-image"
                                    : "landscape-image"
                                }`}
                                src={imageUrl}
                                alt={`${postcard.title || "Museum postcard"} back`}
                                style={{
                                  transform: `rotate(${savedRotation}deg)`,
                                }}
                              />
                            </div>
                          ) : (
                            <Link
                              href={`/reading-room?id=${postcard.id}&from=grand-gallery`}
                              className="postcard-image-link"
                              aria-label={`View ${postcard.title || "postcard"} in the Reading Room`}
                            >
                              <div
                                className={`image-stage ${
                                  portraitDisplay ? "portrait-stage" : ""
                                } ${
                                  nightDisplay === "neon"
                                    ? "night-neon"
                                    : nightDisplay === "subtle"
                                    ? "night-subtle"
                                    : ""
                                }`}
                              >
                                <img
                                  className={`postcard-image ${
                                    portraitDisplay
                                      ? "portrait-image"
                                      : "landscape-image"
                                  }`}
                                  src={imageUrl}
                                  alt={`${postcard.title || "Museum postcard"} front`}
                                  style={{
                                    transform: `rotate(${savedRotation}deg)`,
                                  }}
                                />
                              </div>
                            </Link>
                          )
                        ) : (
                          <div className="image-missing">
                            {backIsShowing
                              ? "No back scan is available."
                              : "Image coming soon."}
                          </div>
                        )}
                      </div>

                      <div className="card-content">
                        <h3>{postcard.title || "Untitled Postcard"}</h3>
                        <div className="accession">VPM {String(postcard.id).padStart(4, "0")}</div>

                        <div className="details">
                          <div><strong>Location:</strong> {location}</div>
                          <div><strong>Landmark:</strong> {postcard.landmark || "Not recorded"}</div>
                          <div><strong>Date:</strong> {postcard.postcard_date || "Not recorded"}</div>
                          <div><strong>Gallery:</strong> {postcard.gallery || "Grand Gallery"}</div>
                        </div>

                        {postcard.description && <p className="description">{postcard.description}</p>}

                        <button
                          type="button"
                          className="flip-button"
                          onClick={() => togglePostcard(postcard.id)}
                          disabled={!postcard.back_image_url}
                        >
                          {!postcard.back_image_url
                            ? "Back Scan Not Available"
                            : backIsShowing
                            ? "Turn Card to Front"
                            : "Turn Card Over"}
                        </button>

                        <Link
                          href={`/reading-room?id=${postcard.id}&from=grand-gallery`}
                          className="view-exhibit-link"
                        >
                          View Full Exhibit →
                        </Link>
                      </div>
                    </article>
                  );
                })
              )}
              <div className="coming-soon-card">
  <div className="coming-soon-inner">
    <div className="coming-soon-title">
      More Postcards Coming Next Week
    </div>

    <div className="coming-soon-subtitle">
      Please Come Back Soon
    </div>
  </div>
</div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <h2>The Virtual Postcard Museum</h2>
        <p>Founded &amp; Curated by Clarence E. Pridemore Jr.</p>
        <p style={{ marginTop: "21px", fontStyle: "italic" }}>Every Postcard Has a Story.</p>
        <p style={{ marginTop: "18px", fontSize: "13px", opacity: .7 }}>© 2026 The Virtual Postcard Museum</p>
      </footer>
    </main>
  );
}