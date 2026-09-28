"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../california/lib/supabase";

type PostcardForm = {
  title: string;
  country: string;
  state: string;
  city: string;
  landmark: string;
  postcard_date: string;
  gallery: string;
  status: string;
  featured: boolean;
  description: string;
  front_image_url: string;
  back_image_url: string;
  display_rotation: number;
  night_display: "off" | "subtle" | "neon";
};

const emptyForm: PostcardForm = {
  title: "",
  country: "",
  state: "",
  city: "",
  landmark: "",
  postcard_date: "",
  gallery: "Grand Gallery",
  status: "Uploaded",
  featured: false,
  description: "",
  front_image_url: "",
  back_image_url: "",
  display_rotation: 0,
  night_display: "off",
};

export default function EditPostcardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postcardId = Number(params.id);

  const [form, setForm] = useState<PostcardForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("Opening postcard record...");

  useEffect(() => {
    async function loadPostcard() {
      if (!Number.isFinite(postcardId)) {
        setMessage("This postcard record number is not valid.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("postcards")
        .select(
          "title, country, state, city, landmark, postcard_date, gallery, status, featured, description, front_image_url, back_image_url, display_rotation, night_display"
        )
        .eq("id", postcardId)
        .single();

      if (error) {
        setMessage(`The postcard record could not be opened: ${error.message}`);
        setLoading(false);
        return;
      }

      setForm({
        title: data.title || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        landmark: data.landmark || "",
        postcard_date: data.postcard_date || "",
        gallery: data.gallery || "Grand Gallery",
        status: data.status || "Uploaded",
        featured: Boolean(data.featured),
        description: data.description || "",
        front_image_url: data.front_image_url || "",
        back_image_url: data.back_image_url || "",
        display_rotation: Number(data.display_rotation || 0),
        night_display:
          data.night_display === "subtle" || data.night_display === "neon"
            ? data.night_display
            : "off",
      });

      setMessage("");
      setLoading(false);
    }

    void loadPostcard();
  }, [postcardId]);

  function updateField<K extends keyof PostcardForm>(
    field: K,
    value: PostcardForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("postcards")
      .update({
        title: form.title.trim() || null,
        country: form.country.trim() || null,
        state: form.state.trim() || null,
        city: form.city.trim() || null,
        landmark: form.landmark.trim() || null,
        postcard_date: form.postcard_date.trim() || null,
        gallery: form.gallery.trim() || null,
        status: form.status,
        featured: form.featured,
        description: form.description.trim() || null,
        front_image_url: form.front_image_url.trim() || null,
        back_image_url: form.back_image_url.trim() || null,
        display_rotation: form.display_rotation,
        night_display: form.night_display,
      })
      .eq("id", postcardId);

    if (error) {
      setMessage(`The record could not be saved: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Postcard record saved successfully.");
    setSaving(false);
  }

  async function deleteRecord() {
    const confirmed = window.confirm(
      `Permanently delete VPM ${String(postcardId).padStart(4, "0")} from the museum catalog? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    const { error } = await supabase
      .from("postcards")
      .delete()
      .eq("id", postcardId);

    if (error) {
      setMessage(`The postcard record could not be deleted: ${error.message}`);
      setDeleting(false);
      return;
    }

    router.push("/dashboard/manage");
    router.refresh();
  }

  return (
    <main className="edit-page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .edit-page {
          min-height: 100vh;
          color: #f3e6c8;
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at 50% 0%, rgba(223,180,86,.14), transparent 28%),
            linear-gradient(180deg, #28170f, #130b07);
        }

        .topbar {
          background: rgba(13,8,5,.92);
          border-bottom: 1px solid rgba(226,192,118,.35);
        }

        .topbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 17px 24px;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .topbar a {
          color: #f1d690;
          text-decoration: none;
        }

        .hero {
          max-width: 1160px;
          margin: 0 auto;
          padding: 30px 24px 24px;
          text-align: center;
        }

        .hero h1 {
          margin: 0;
          color: #fff0c8;
          font-size: clamp(36px, 6vw, 58px);
          font-weight: normal;
        }

        .hero p {
          color: #d6be98;
          font-style: italic;
        }

        .form-shell {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 24px 68px;
        }

        .desk {
          padding: 24px;
          border: 7px solid #5e361d;
          background: linear-gradient(#714326, #3a2012);
          box-shadow: 0 0 0 3px #b5873d, 0 24px 50px rgba(0,0,0,.5);
        }

        .desk-plaque {
          width: min(620px, 96%);
          margin: 0 auto 22px;
          padding: 8px 16px;
          border: 2px solid #ead18c;
          background: linear-gradient(#9d7438, #5d3d1c);
          color: #ffe8ae;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .record-form {
          padding: 24px;
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: #2f1d13;
        }

        .section {
          margin-bottom: 24px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(104,72,35,.3);
        }

        .section h2 {
          margin: 0 0 17px;
          color: #5c331d;
          font-size: 22px;
          font-weight: normal;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .field {
          display: grid;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          color: #60411f;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          min-height: 44px;
          padding: 10px 11px;
          border: 1px solid #99713a;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .field textarea {
          min-height: 150px;
          resize: vertical;
        }

        .featured-check {
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #99713a;
          background: #fffaf0;
        }

        .scan-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 16px;
        }

        .scan-preview {
          min-height: 220px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 7px solid #f5ecd8;
          outline: 2px solid #9c7c47;
          background: #d8c7a8;
          color: #70583e;
          text-align: center;
        }

        .scan-preview img {
          width: auto;
          max-width: 100%;
          max-height: 320px;
          object-fit: contain;
          transform-origin: center center;
        }

        .orientation-note {
          margin: 9px 0 0;
          color: #6b543f;
          font-size: 13px;
          line-height: 1.5;
          font-style: italic;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .button,
        .secondary-link {
          min-height: 43px;
          display: inline-grid;
          place-items: center;
          padding: 10px 16px;
          border: 1px solid #c79a46;
          background: linear-gradient(#245242, #123329);
          color: #f5e1ac;
          text-decoration: none;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .secondary-link {
          background: linear-gradient(#7f2f28, #501b18);
        }

        .delete-button {
          min-height: 43px;
          display: inline-grid;
          place-items: center;
          padding: 10px 16px;
          border: 1px solid #8b1e18;
          background: linear-gradient(#b63b30, #6f1712);
          color: #fff3df;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
        }

        .delete-button:disabled,
        .button:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .danger-zone {
          margin-top: 26px;
          padding: 18px;
          border: 2px solid #9d3228;
          background: rgba(127, 35, 28, .08);
        }

        .danger-zone h3 {
          margin: 0 0 8px;
          color: #7b221c;
          font-size: 18px;
        }

        .danger-zone p {
          margin: 0 0 14px;
          color: #5f382d;
          line-height: 1.5;
        }

        .status-message {
          min-height: 260px;
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

        @media (max-width: 820px) {
          .grid,
          .grid.two,
          .scan-preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/dashboard/manage">← Return to Manage Collection</Link>
          <Link href={`/reading-room?id=${postcardId}`}>
            Open in Reading Room
          </Link>
        </div>
      </header>

      <section className="hero">
        <h1>Edit Postcard Record</h1>
        <p>VPM {String(postcardId || 0).padStart(4, "0")}</p>
      </section>

      <section className="form-shell">
        <div className="desk">
          <div className="desk-plaque">Permanent Museum Catalog Record</div>

          {loading ? (
            <div className="status-message">{message}</div>
          ) : (
            <form className="record-form" onSubmit={saveRecord}>
              <section className="section">
                <h2>Artifact Identity</h2>
                <div className="grid">
                  <div className="field full">
                    <label htmlFor="title">Postcard Title</label>
                    <input id="title" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="city">City</label>
                    <input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="state">State</label>
                    <input id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="country">Country</label>
                    <input id="country" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="landmark">Landmark</label>
                    <input id="landmark" value={form.landmark} onChange={(e) => updateField("landmark", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="postcard-date">Postcard or Postmark Date</label>
                    <input id="postcard-date" value={form.postcard_date} onChange={(e) => updateField("postcard_date", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="gallery">Gallery</label>
                    <select id="gallery" value={form.gallery} onChange={(e) => updateField("gallery", e.target.value)}>
                      <option>Grand Gallery</option>
                      <option>Florida</option>
                      <option>California</option>
                      <option>Humor</option>
                      <option>Holiday</option>
                      <option>Postcard Folders</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2>Publication and Exhibit Status</h2>
                <div className="grid two">
                  <div className="field">
                    <label htmlFor="status">Catalog Status</label>
                    <select id="status" value={form.status} onChange={(e) => updateField("status", e.target.value)}>
                      <option>Uploaded</option>
                      <option>Draft</option>
                      <option>Published</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Featured Exhibit</label>
                    <div className="featured-check">
                      <input
                        id="featured"
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => updateField("featured", e.target.checked)}
                      />
                      <label htmlFor="featured">Display as a featured artifact</label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2>Permanent Display Orientation</h2>

                <div className="grid two">
                  <div className="field">
                    <label htmlFor="display-rotation">Museum Display Rotation</label>
                    <select
                      id="display-rotation"
                      value={form.display_rotation}
                      onChange={(e) =>
                        updateField("display_rotation", Number(e.target.value))
                      }
                    >
                      <option value={0}>Automatic / No Rotation</option>
                      <option value={90}>Rotate 90° Clockwise</option>
                      <option value={180}>Rotate 180°</option>
                      <option value={270}>Rotate 90° Counterclockwise</option>
                    </select>

                    <p className="orientation-note">
                      Use 90° or 270° for a postcard scanned sideways. Use 180°
                      only when the postcard is upside down.
                    </p>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2>Night Display</h2>

                <div className="grid two">
                  <div className="field">
                    <label htmlFor="night-display">After-Dark Presentation</label>
                    <select
                      id="night-display"
                      value={form.night_display}
                      onChange={(e) =>
                        updateField(
                          "night_display",
                          e.target.value as PostcardForm["night_display"]
                        )
                      }
                    >
                      <option value="off">Off — Normal Daytime Display</option>
                      <option value="subtle">Subtle Night — Moonlight & Soft Glow</option>
                      <option value="neon">Neon Night — Strong Sign & City Glow</option>
                    </select>

                    <p className="orientation-note">
                      This does not alter the original postcard scan. It only
                      changes how the postcard is presented to museum visitors.
                    </p>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2>Curator&apos;s Notes</h2>
                <div className="field">
                  <label htmlFor="description">Historical Description and Research Notes</label>
                  <textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} />
                </div>
              </section>

              <section className="section">
                <h2>Postcard Scans</h2>
                <div className="grid two">
                  <div className="field">
                    <label htmlFor="front-url">Front Image URL</label>
                    <input id="front-url" value={form.front_image_url} onChange={(e) => updateField("front_image_url", e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="back-url">Back Image URL</label>
                    <input id="back-url" value={form.back_image_url} onChange={(e) => updateField("back_image_url", e.target.value)} />
                  </div>
                </div>

                <div className="scan-preview-grid">
                  <div className="scan-preview">
                    {form.front_image_url ? (
                      <img
                        src={form.front_image_url}
                        alt="Postcard front scan"
                        style={{
                          transform: `rotate(${form.display_rotation}deg)`,
                          maxWidth:
                            form.display_rotation % 180 === 90 ? "70%" : "100%",
                          maxHeight:
                            form.display_rotation % 180 === 90 ? "240px" : "320px",
                        }}
                      />
                    ) : (
                      "No front scan recorded."
                    )}
                  </div>
                  <div className="scan-preview">
                    {form.back_image_url ? (
                      <img
                        src={form.back_image_url}
                        alt="Postcard back scan"
                        style={{
                          transform: `rotate(${form.display_rotation}deg)`,
                          maxWidth:
                            form.display_rotation % 180 === 90 ? "70%" : "100%",
                          maxHeight:
                            form.display_rotation % 180 === 90 ? "240px" : "320px",
                        }}
                      />
                    ) : (
                      "No back scan recorded."
                    )}
                  </div>
                </div>
              </section>

              <div className="actions">
                <p>{message}</p>
                <div>
                  <Link className="secondary-link" href="/dashboard/manage">Cancel</Link>{" "}
                  <button className="button" type="submit" disabled={saving || deleting}>
                    {saving ? "Saving Record..." : "Save Postcard Record"}
                  </button>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Permanent Record Deletion</h3>
                <p>
                  This permanently removes this postcard record from the museum catalog.
                  You will be asked to confirm before anything is deleted.
                </p>
                <button
                  className="delete-button"
                  type="button"
                  onClick={deleteRecord}
                  disabled={saving || deleting}
                >
                  {deleting ? "Deleting Postcard..." : "Delete Postcard Permanently"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="footer">
        <strong>The Virtual Postcard Museum</strong>
        <p>Founded &amp; Curated by Clarence E. Pridemore Jr.</p>
      </footer>
    </main>
  );
}