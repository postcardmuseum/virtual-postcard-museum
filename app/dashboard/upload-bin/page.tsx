"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { supabase } from "../../california/lib/supabase";

type Side = "front" | "back";

type UploadSlot = {
  pairNumber: number;
  front: File | null;
  back: File | null;
  frontPreview: string;
  backPreview: string;
};

const makeEmptySlots = (): UploadSlot[] =>
  Array.from({ length: 6 }, (_, index) => ({
    pairNumber: index + 1,
    front: null,
    back: null,
    frontPreview: "",
    backPreview: "",
  }));

function safeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

export default function MobileUploadBinPage() {
  const [batchName, setBatchName] = useState("");
  const [slots, setSlots] = useState<UploadSlot[]>(makeEmptySlots);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(
    "Choose up to six postcard fronts and six matching backs."
  );

  const selectedCount = useMemo(
    () =>
      slots.reduce(
        (total, slot) =>
          total + (slot.front ? 1 : 0) + (slot.back ? 1 : 0),
        0
      ),
    [slots]
  );

  function chooseFile(
    pairNumber: number,
    side: Side,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    if (file && !file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file && file.size > 20 * 1024 * 1024) {
      setMessage("Each photo must be smaller than 20 MB.");
      event.target.value = "";
      return;
    }

    setSlots((current) =>
      current.map((slot) => {
        if (slot.pairNumber !== pairNumber) return slot;

        const previewField =
          side === "front" ? "frontPreview" : "backPreview";

        if (slot[previewField]) {
          URL.revokeObjectURL(slot[previewField]);
        }

        return {
          ...slot,
          [side]: file,
          [previewField]: file ? URL.createObjectURL(file) : "",
        };
      })
    );

    setMessage(
      file
        ? `Pair ${pairNumber} ${side} selected: ${file.name}`
        : "Choose up to six postcard fronts and six matching backs."
    );
  }

  function clearBinForm() {
    slots.forEach((slot) => {
      if (slot.frontPreview) URL.revokeObjectURL(slot.frontPreview);
      if (slot.backPreview) URL.revokeObjectURL(slot.backPreview);
    });

    setSlots(makeEmptySlots());
    setBatchName("");
    setMessage("Upload form cleared.");
  }

  async function uploadImage(
    file: File,
    batchId: string,
    pairNumber: number,
    side: Side
  ) {
    const extension = safeExtension(file);
    const storagePath = `upload-bin/${batchId}/pair-${pairNumber}-${side}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("postcard-images")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Could not upload Pair ${pairNumber} ${side}: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("postcard-images")
      .getPublicUrl(storagePath);

    return {
      imageUrl: data.publicUrl,
      storagePath,
    };
  }

  async function sendToUploadBin() {
    if (selectedCount === 0) {
      setMessage("Choose at least one postcard photo before uploading.");
      return;
    }

    setUploading(true);
    const batchId = crypto.randomUUID();

    const rows: Array<{
      batch_id: string;
      batch_name: string | null;
      pair_number: number;
      side: Side;
      original_filename: string;
      image_url: string;
      storage_path: string;
      status: string;
    }> = [];

    try {
      for (const slot of slots) {
        for (const side of ["front", "back"] as const) {
          const file = slot[side];
          if (!file) continue;

          setMessage(`Uploading Pair ${slot.pairNumber} ${side}...`);

          const uploaded = await uploadImage(
            file,
            batchId,
            slot.pairNumber,
            side
          );

          rows.push({
            batch_id: batchId,
            batch_name: batchName.trim() || null,
            pair_number: slot.pairNumber,
            side,
            original_filename: file.name,
            image_url: uploaded.imageUrl,
            storage_path: uploaded.storagePath,
            status: "Waiting",
          });
        }
      }

      setMessage("Saving the batch in the Curator’s Upload Bin...");

      const { error } = await supabase
        .from("upload_bin_items")
        .insert(rows);

      if (error) {
        throw new Error(
          `The photos uploaded, but the bin record could not be saved: ${error.message}`
        );
      }

      slots.forEach((slot) => {
        if (slot.frontPreview) URL.revokeObjectURL(slot.frontPreview);
        if (slot.backPreview) URL.revokeObjectURL(slot.backPreview);
      });

      setSlots(makeEmptySlots());
      setBatchName("");
      setMessage(
        `${rows.length} photo${rows.length === 1 ? "" : "s"} placed in the Mobile Upload Bin successfully.`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The upload could not be completed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="upload-page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        .upload-page {
          min-height: 100vh;
          color: #f3e6c8;
          font-family: Georgia, "Times New Roman", serif;
          background:
            radial-gradient(circle at 50% 0%, rgba(223,180,86,.14), transparent 28%),
            linear-gradient(180deg, #28170f, #130b07);
        }

        .topbar {
          border-bottom: 1px solid rgba(226,192,118,.35);
          background: rgba(13,8,5,.92);
        }

        .topbar-inner {
          max-width: 1180px;
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

        .private-label {
          color: #f1d690;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-size: 13px;
          font-weight: bold;
        }

        .hero {
          max-width: 1180px;
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
          border: 4px double #efd58d;
          border-radius: 50%;
          background: radial-gradient(circle, #744b27 0 47%, #24140c 48%);
          color: #f4d78d;
          font-weight: bold;
        }

        .hero h1 {
          margin: 0;
          color: #fff0c8;
          font-size: clamp(38px, 7vw, 62px);
          font-weight: normal;
        }

        .hero p {
          max-width: 780px;
          margin: 12px auto 0;
          color: #d6be98;
          font-size: 17px;
          line-height: 1.65;
          font-style: italic;
        }

        .shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px 68px;
        }

        .upload-desk {
          padding: 22px;
          border: 7px solid #5e361d;
          background: linear-gradient(#714326, #3a2012);
          box-shadow: 0 0 0 3px #b5873d, 0 24px 50px rgba(0,0,0,.5);
        }

        .plaque {
          width: min(650px, 96%);
          margin: 0 auto 20px;
          padding: 8px 16px;
          border: 2px solid #ead18c;
          background: linear-gradient(#9d7438, #5d3d1c);
          color: #ffe8ae;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .batch-panel,
        .slot,
        .actions {
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: #2f1d13;
        }

        .batch-panel {
          padding: 18px;
          margin-bottom: 18px;
        }

        .field {
          display: grid;
          gap: 7px;
        }

        .field label {
          color: #60411f;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .field input {
          width: 100%;
          min-height: 44px;
          padding: 10px 11px;
          border: 1px solid #99713a;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .slots {
          display: grid;
          gap: 17px;
        }

        .slot {
          padding: 16px;
        }

        .slot h2 {
          margin: 0 0 14px;
          color: #5c331d;
          font-size: 23px;
          font-weight: normal;
        }

        .pair-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .photo-box {
          padding: 13px;
          border: 1px solid #a77c3d;
          background: rgba(255,250,240,.6);
        }

        .photo-box h3 {
          margin: 0 0 10px;
          color: #62401f;
          font-size: 16px;
        }

        .preview {
          min-height: 160px;
          margin-top: 12px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 5px solid #f5ecd8;
          background: #d8c7a8;
          color: #70583e;
          text-align: center;
          font-style: italic;
        }

        .preview img {
          width: 100%;
          max-height: 260px;
          object-fit: contain;
          background: #eee6d8;
        }

        .actions {
          margin-top: 20px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .button {
          min-height: 44px;
          padding: 10px 16px;
          border: 1px solid #c79a46;
          background: linear-gradient(#245242, #123329);
          color: #f5e1ac;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .button.secondary {
          background: linear-gradient(#7f2f28, #501b18);
        }

        .instructions {
          margin-top: 18px;
          padding: 15px 17px;
          border-left: 5px solid #9a6a2c;
          background: rgba(255,250,240,.6);
          color: #604b37;
          line-height: 1.65;
        }

        @media (max-width: 700px) {
          .pair-grid {
            grid-template-columns: 1fr;
          }

          .upload-desk {
            padding: 12px;
          }

          .button {
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/dashboard">← Return to Curator&apos;s Office</Link>
          <div className="private-label">Private Mobile Intake</div>
          <Link href="/dashboard/manage">Manage Collection</Link>
        </div>
      </header>

      <section className="hero">
        <div className="seal">VPM</div>
        <h1>Mobile Upload Bin</h1>
        <p>
          Send as many as six postcard fronts and six matching backs from an
          iPhone or computer into the private Curator&apos;s Office review queue.
        </p>
      </section>

      <section className="shell">
        <div className="upload-desk">
          <div className="plaque">Postcard Photograph Intake Desk</div>

          <section className="batch-panel">
            <div className="field">
              <label htmlFor="batch-name">Optional Batch Name</label>
              <input
                id="batch-name"
                value={batchName}
                onChange={(event) => setBatchName(event.target.value)}
                placeholder="Example: Florida batch — August 3"
              />
            </div>

            <p>{selectedCount} of 12 possible photos selected.</p>
          </section>

          <div className="slots">
            {slots.map((slot) => (
              <section className="slot" key={slot.pairNumber}>
                <h2>Postcard Pair {slot.pairNumber}</h2>

                <div className="pair-grid">
                  <article className="photo-box">
                    <h3>Front Photograph</h3>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        chooseFile(slot.pairNumber, "front", event)
                      }
                    />
                    <div className="preview">
                      {slot.frontPreview ? (
                        <img src={slot.frontPreview} alt="Front preview" />
                      ) : (
                        "Front photo preview"
                      )}
                    </div>
                  </article>

                  <article className="photo-box">
                    <h3>Back Photograph</h3>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) =>
                        chooseFile(slot.pairNumber, "back", event)
                      }
                    />
                    <div className="preview">
                      {slot.backPreview ? (
                        <img src={slot.backPreview} alt="Back preview" />
                      ) : (
                        "Back photo preview"
                      )}
                    </div>
                  </article>
                </div>
              </section>
            ))}
          </div>

          <div className="actions">
            <p>{message}</p>
            <div>
              <button
                className="button secondary"
                type="button"
                onClick={clearBinForm}
                disabled={uploading}
              >
                Clear Selected Photos
              </button>{" "}
              <button
                className="button"
                type="button"
                onClick={sendToUploadBin}
                disabled={uploading || selectedCount === 0}
              >
                {uploading
                  ? "Sending to Upload Bin..."
                  : `Send ${selectedCount} Photo${
                      selectedCount === 1 ? "" : "s"
                    } to Upload Bin`}
              </button>
            </div>
          </div>

          <div className="instructions">
            Photograph each postcard directly overhead in bright, even light.
            Avoid flash glare and leave a small border around every edge. Keep
            each front and matching back in the same numbered pair.
          </div>
        </div>
      </section>
    </main>
  );
}