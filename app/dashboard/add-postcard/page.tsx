"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "../../california/lib/supabase";

const sectionStyle = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(250,243,225,0.96))",
  border: "1px solid #c7a45a",
  borderRadius: "18px",
  padding: "26px",
  boxShadow: "0 10px 30px rgba(55, 35, 15, 0.12)",
  marginBottom: "24px",
};

const labelStyle = {
  display: "block",
  color: "#4d321d",
  fontWeight: "bold",
  marginBottom: "8px",
  fontSize: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "9px",
  border: "1px solid #b99a62",
  backgroundColor: "#fffdf8",
  color: "#2f241a",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "130px",
  resize: "vertical" as const,
  fontFamily: "Arial, sans-serif",
};

const fieldGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

export default function AddPostcardPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");

  async function uploadPostcardImage(
    file: File,
    side: "front" | "back"
  ) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${side === "front" ? "Front" : "Back"} file must be an image.`);
    }

    const maxFileSize = 15 * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new Error(
        `${side === "front" ? "Front" : "Back"} image must be smaller than 15 MB.`
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `${new Date().getFullYear()}/${Date.now()}-${crypto.randomUUID()}-${side}.${safeExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("postcard-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Could not upload the ${side} image: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("postcard-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function savePostcard(
    event: FormEvent<HTMLFormElement>,
    status: "Draft" | "Published"
  ) {
    event.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const cabinet = String(formData.get("cabinet") || "").trim();
    const drawer = String(formData.get("drawer") || "").trim();
    const binder = String(formData.get("binder") || "").trim();
    const pagePocket = String(formData.get("pagePocket") || "").trim();

    const storageLocation = [
      cabinet && `Cabinet/Box: ${cabinet}`,
      drawer && `Drawer/Divider: ${drawer}`,
      binder && `Binder/Album: ${binder}`,
      pagePocket && `Page/Pocket: ${pagePocket}`,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const frontImageEntry = formData.get("frontImage");
      const backImageEntry = formData.get("backImage");

      const frontImage =
        frontImageEntry instanceof File && frontImageEntry.size > 0
          ? frontImageEntry
          : null;

      const backImage =
        backImageEntry instanceof File && backImageEntry.size > 0
          ? backImageEntry
          : null;

      setSaveMessage(
        frontImage || backImage
          ? "Uploading postcard images..."
          : "Saving museum record..."
      );

      const [frontImageUrl, backImageUrl] = await Promise.all([
        frontImage ? uploadPostcardImage(frontImage, "front") : Promise.resolve(null),
        backImage ? uploadPostcardImage(backImage, "back") : Promise.resolve(null),
      ]);

      setSaveMessage("Saving museum record...");

      const { error } = await supabase.from("postcards").insert({
      title: String(formData.get("title") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      landmark: String(formData.get("landmark") || "").trim() || null,
      postcard_date:
        String(formData.get("postcardDate") || "").trim() || null,
      era: String(formData.get("era") || "").trim() || null,
      publisher: String(formData.get("publisher") || "").trim() || null,
      printer: String(formData.get("printer") || "").trim() || null,
      description:
        String(formData.get("description") || "").trim() || null,
      message:
        String(formData.get("messageTranscription") || "").trim() || null,
      postmark: String(formData.get("postmark") || "").trim() || null,
      gallery: String(formData.get("gallery") || "").trim() || null,
      subject: String(formData.get("subject") || "").trim() || null,
      keywords: String(formData.get("keywords") || "").trim() || null,
      featured: formData.get("featured") === "on",
      curator_notes:
        String(formData.get("curatorNotes") || "").trim() || null,
      storage_location: storageLocation || null,
      display_rotation: Number(formData.get("displayRotation") || 0),
      front_image_url: frontImageUrl,
      back_image_url: backImageUrl,
      status,
    });

        if (error) {
        throw new Error(error.message);
      }

      setSaveMessage(
        status === "Draft"
          ? "Draft and postcard images saved successfully."
          : "Postcard and images published successfully to the museum."
      );

      const frontInput = form.elements.namedItem("frontImage") as HTMLInputElement | null;
      const backInput = form.elements.namedItem("backImage") as HTMLInputElement | null;

      if (frontInput) frontInput.value = "";
      if (backInput) backInput.value = "";

      setFrontPreview("");
      setBackPreview("");

      if (status === "Published") {
        form.reset();
      }
    } catch (error) {
      console.error(error);
      setSaveMessage(
        `Could not save the postcard: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #f7e8bd 0%, #e8d4a7 35%, #c9af7c 100%)",
        padding: "35px 20px 70px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#2f241a",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(73,34,20,0.97), rgba(111,62,33,0.97))",
            color: "#fff8e7",
            border: "2px solid #d2b36c",
            borderRadius: "22px",
            padding: "34px 22px",
            boxShadow: "0 16px 38px rgba(45, 27, 12, 0.25)",
            marginBottom: "26px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#e8ca82",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Curator&apos;s Office
          </p>

          <h1
            style={{
              margin: "0",
              fontSize: "clamp(34px, 6vw, 58px)",
              lineHeight: "1.05",
            }}
          >
            Catalog a New Postcard
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "16px auto 0",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "#f2e5c7",
            }}
          >
            Create a permanent museum record for the next artifact entering
            The Virtual Postcard Museum.
          </p>

          <p
            style={{
              margin: "18px 0 0",
              fontSize: "15px",
              color: "#dec58f",
            }}
          >
            Founded &amp; Curated by Clarence E. Pridemore Jr.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              textDecoration: "none",
              backgroundColor: "#5b3420",
              color: "#fff8e7",
              padding: "11px 18px",
              borderRadius: "9px",
              border: "1px solid #c8a35d",
              fontWeight: "bold",
            }}
          >
            ← Return to Curator&apos;s Office
          </Link>

          <div
            style={{
              backgroundColor: "#fff8e7",
              border: "1px solid #b88a3b",
              borderRadius: "10px",
              padding: "11px 18px",
              color: "#69401f",
              fontWeight: "bold",
            }}
          >
            Record Status: New Artifact
          </div>
        </div>

        <form onSubmit={(event) => savePostcard(event, "Draft")}>
          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              1. Museum Accession Record
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label style={labelStyle}>Accession Number</label>
                <input
                  type="text"
                  value="VPM-000001"
                  readOnly
                  style={{
                    ...inputStyle,
                    backgroundColor: "#efe4c9",
                    fontWeight: "bold",
                    color: "#7a361e",
                  }}
                />
                <p
                  style={{
                    margin: "7px 0 0",
                    fontSize: "13px",
                    color: "#775f46",
                    lineHeight: "1.5",
                  }}
                >
                  This will later be assigned automatically in numeric order.
                </p>
              </div>

              <div>
                <label htmlFor="recordStatus" style={labelStyle}>
                  Catalog Status
                </label>
                <select id="recordStatus" name="recordStatus" style={inputStyle}>
                  <option>Uploaded</option>
                  <option>Cataloging</option>
                  <option>Researching</option>
                  <option>Ready for Review</option>
                  <option>Published</option>
                  <option>Featured Exhibit</option>
                </select>
              </div>

              <div>
                <label htmlFor="acquisitionDate" style={labelStyle}>
                  Acquisition Date
                </label>
                <input
                  id="acquisitionDate"
                  name="acquisitionDate"
                  type="date"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              2. Postcard Images
            </h2>

            <div style={fieldGridStyle}>
              <div
                style={{
                  border: "2px dashed #ae874a",
                  borderRadius: "14px",
                  padding: "26px",
                  textAlign: "center",
                  backgroundColor: "#fffaf0",
                }}
              >
                <div style={{ fontSize: "42px", marginBottom: "10px" }}>🖼️</div>
                <label htmlFor="frontImage" style={labelStyle}>
                  Front Scan
                </label>
                <input
                  id="frontImage"
                  name="frontImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      setFrontPreview("");
                      return;
                    }

                    setFrontPreview(URL.createObjectURL(file));
                  }}
                  style={{ width: "100%" }}
                />

                {frontPreview && (
                  <img
                    src={frontPreview}
                    alt="Selected postcard front preview"
                    style={{
                      width: "100%",
                      maxHeight: "260px",
                      objectFit: "contain",
                      marginTop: "16px",
                      borderRadius: "9px",
                      border: "1px solid #c7a45a",
                      backgroundColor: "#f4ead5",
                    }}
                  />
                )}

                <p
                  style={{
                    color: "#766049",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  Upload the picture side of the postcard.
                </p>
              </div>

              <div
                style={{
                  border: "2px dashed #ae874a",
                  borderRadius: "14px",
                  padding: "26px",
                  textAlign: "center",
                  backgroundColor: "#fffaf0",
                }}
              >
                <div style={{ fontSize: "42px", marginBottom: "10px" }}>✉️</div>
                <label htmlFor="backImage" style={labelStyle}>
                  Back Scan
                </label>
                <input
                  id="backImage"
                  name="backImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      setBackPreview("");
                      return;
                    }

                    setBackPreview(URL.createObjectURL(file));
                  }}
                  style={{ width: "100%" }}
                />

                {backPreview && (
                  <img
                    src={backPreview}
                    alt="Selected postcard back preview"
                    style={{
                      width: "100%",
                      maxHeight: "260px",
                      objectFit: "contain",
                      marginTop: "16px",
                      borderRadius: "9px",
                      border: "1px solid #c7a45a",
                      backgroundColor: "#f4ead5",
                    }}
                  />
                )}

                <p
                  style={{
                    color: "#766049",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  Upload the address, message, and postmark side.
                </p>
              </div>
            </div>
          </section>

          <section
            style={{
              ...sectionStyle,
              background:
                "linear-gradient(145deg, rgba(255,248,231,0.98), rgba(236,220,184,0.98))",
              border: "2px solid #b88a3b",
            }}
          >
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              Museum Display Orientation
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "#6a513c",
                lineHeight: "1.6",
              }}
            >
              Use this only when a scanned postcard is sideways or upside down.
              The museum will remember this setting and display the card in the
              correct position in the gallery and Reading Room.
            </p>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="displayRotation" style={labelStyle}>
                  Permanent Display Rotation
                </label>
                <select
                  id="displayRotation"
                  name="displayRotation"
                  defaultValue="0"
                  style={inputStyle}
                >
                  <option value="0">Automatic / No Rotation</option>
                  <option value="90">Rotate 90° Clockwise</option>
                  <option value="180">Rotate 180°</option>
                  <option value="270">Rotate 90° Counterclockwise</option>
                </select>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#775f46",
                    fontSize: "13px",
                    lineHeight: "1.5",
                  }}
                >
                  A vertical postcard scanned sideways will usually need 90° or
                  270°. The frame will automatically change to portrait shape.
                </p>
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              3. Basic Artifact Information
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="title" style={labelStyle}>
                  Postcard Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Example: The San Juan Hotel and Bar"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="postcardDate" style={labelStyle}>
                  Date or Approximate Date
                </label>
                <input
                  id="postcardDate"
                  name="postcardDate"
                  type="text"
                  placeholder="Example: c. 1941"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="era" style={labelStyle}>
                  Postcard Era
                </label>
                <select id="era" name="era" style={inputStyle}>
                  <option value="">Select an era</option>
                  <option>Pioneer Era</option>
                  <option>Private Mailing Card Era</option>
                  <option>Undivided Back Era</option>
                  <option>Divided Back Era</option>
                  <option>White Border Era</option>
                  <option>Linen Era</option>
                  <option>Photochrome Era</option>
                  <option>Modern Era</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div>
                <label htmlFor="condition" style={labelStyle}>
                  Condition
                </label>
                <select id="condition" name="condition" style={inputStyle}>
                  <option value="">Select condition</option>
                  <option>Excellent</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="publisher" style={labelStyle}>
                  Publisher
                </label>
                <input
                  id="publisher"
                  name="publisher"
                  type="text"
                  placeholder="Publisher name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="printer" style={labelStyle}>
                  Printer or Manufacturer
                </label>
                <input
                  id="printer"
                  name="printer"
                  type="text"
                  placeholder="Printer or manufacturer"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              4. Location
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="country" style={labelStyle}>
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  defaultValue="United States"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="state" style={labelStyle}>
                  State or Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Example: Florida"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="city" style={labelStyle}>
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Example: Miami"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="landmark" style={labelStyle}>
                  Landmark, Building, or Subject
                </label>
                <input
                  id="landmark"
                  name="landmark"
                  type="text"
                  placeholder="Hotel, bridge, park, street, etc."
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              5. Museum Classification
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="gallery" style={labelStyle}>
                  Primary Gallery
                </label>
                <select id="gallery" name="gallery" style={inputStyle}>
                  <option value="">Select a gallery</option>
                  <option>Florida Gallery</option>
                  <option>California Gallery</option>
                  <option>Holiday Gallery</option>
                  <option>Humor Gallery</option>
                  <option>Grand Gallery</option>
                  <option>History of Postcards</option>
                  <option>Future Gallery</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" style={labelStyle}>
                  Subject Category
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Hotels, beaches, transportation, humor..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="keywords" style={labelStyle}>
                  Keywords
                </label>
                <input
                  id="keywords"
                  name="keywords"
                  type="text"
                  placeholder="Separate keywords with commas"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="visibility" style={labelStyle}>
                  Museum Visibility
                </label>
                <select id="visibility" name="visibility" style={inputStyle}>
                  <option>Private Draft</option>
                  <option>Ready for Review</option>
                  <option>Public Museum Display</option>
                </select>
              </div>
            </div>

            <div
              style={{
                marginTop: "22px",
                display: "flex",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontWeight: "bold",
                  color: "#53371f",
                }}
              >
                <input type="checkbox" name="featured" />
                Mark as Featured Postcard
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontWeight: "bold",
                  color: "#53371f",
                }}
              >
                <input type="checkbox" name="multipleGalleries" />
                Eligible for Multiple Galleries
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              6. Public Museum Description
            </h2>

            <label htmlFor="description" style={labelStyle}>
              Story and Historical Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what visitors are seeing, why the postcard is interesting, and any known history connected to it."
              style={textareaStyle}
            />

            <div style={{ marginTop: "20px" }}>
              <label htmlFor="messageTranscription" style={labelStyle}>
                Message Transcription
              </label>
              <textarea
                id="messageTranscription"
                name="messageTranscription"
                placeholder="Type the handwritten or printed message from the back of the postcard."
                style={textareaStyle}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label htmlFor="postmark" style={labelStyle}>
                Postmark Information
              </label>
              <input
                id="postmark"
                name="postmark"
                type="text"
                placeholder="Example: Miami, Florida — July 14, 1942"
                style={inputStyle}
              />
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              7. Private Curator Information
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="source" style={labelStyle}>
                  Acquisition Source
                </label>
                <input
                  id="source"
                  name="source"
                  type="text"
                  placeholder="Purchase, gift, estate, personal collection..."
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="purchasePrice" style={labelStyle}>
                  Purchase Price — Optional
                </label>
                <input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="text"
                  placeholder="$0.00"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label htmlFor="curatorNotes" style={labelStyle}>
                Private Curator Notes
              </label>
              <textarea
                id="curatorNotes"
                name="curatorNotes"
                placeholder="Add private research notes, questions, condition details, or reminders. Visitors will not see this information."
                style={textareaStyle}
              />
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              8. Physical Storage Location
            </h2>

            <div style={fieldGridStyle}>
              <div>
                <label htmlFor="cabinet" style={labelStyle}>
                  Cabinet or Box
                </label>
                <input
                  id="cabinet"
                  name="cabinet"
                  type="text"
                  placeholder="Example: Cabinet A or Box 12"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="drawer" style={labelStyle}>
                  Drawer or Divider
                </label>
                <input
                  id="drawer"
                  name="drawer"
                  type="text"
                  placeholder="Example: Drawer 2"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="binder" style={labelStyle}>
                  Binder or Album
                </label>
                <input
                  id="binder"
                  name="binder"
                  type="text"
                  placeholder="Example: Binder 7"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="pagePocket" style={labelStyle}>
                  Page or Pocket
                </label>
                <input
                  id="pagePocket"
                  name="pagePocket"
                  type="text"
                  placeholder="Example: Page 18, Pocket 4"
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2
              style={{
                marginTop: "0",
                color: "#6d321f",
                borderBottom: "2px solid #c7a45a",
                paddingBottom: "12px",
              }}
            >
              9. Research Checklist
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "14px",
              }}
            >
              {[
                "Front scan completed",
                "Back scan completed",
                "Postmark recorded",
                "Message transcribed",
                "Publisher identified",
                "Approximate date assigned",
                "City verified",
                "State verified",
                "Gallery assigned",
                "Public description written",
                "Curator notes added",
                "Ready for museum display",
              ].map((item) => (
                <label
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    border: "1px solid #d1ba89",
                    borderRadius: "9px",
                    backgroundColor: "#fffaf0",
                    color: "#50371f",
                    fontWeight: "bold",
                  }}
                >
                  <input type="checkbox" name="researchChecklist" />
                  {item}
                </label>
              ))}
            </div>
          </section>

          <section
            style={{
              ...sectionStyle,
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(85,47,28,0.98), rgba(119,72,39,0.98))",
              color: "#fff8e7",
            }}
          >
            <h2
              style={{
                marginTop: "0",
                fontSize: "30px",
                color: "#fff4d3",
              }}
            >
              Complete the Museum Record
            </h2>

            <p
              style={{
                maxWidth: "700px",
                margin: "0 auto 24px",
                color: "#ead8b5",
                lineHeight: "1.7",
              }}
            >
              Save an unfinished record as a private draft, or publish the
              completed postcard record to the museum database.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  border: "1px solid #d8ba73",
                  borderRadius: "10px",
                  padding: "14px 24px",
                  backgroundColor: "#f6ead0",
                  color: "#60351e",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? "Uploading & Saving..." : "Save as Draft"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={(event) => {
                  const form = event.currentTarget.form;
                  if (form) {
                    void savePostcard(
                      {
                        preventDefault: () => undefined,
                        currentTarget: form,
                      } as FormEvent<HTMLFormElement>,
                      "Published"
                    );
                  }
                }}
                style={{
                  border: "1px solid #f0d48a",
                  borderRadius: "10px",
                  padding: "14px 24px",
                  backgroundColor: "#b88935",
                  color: "#fffdf7",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                Publish to Museum
              </button>
            </div>

            {saveMessage && (
              <p
                role="status"
                style={{
                  margin: "20px auto 0",
                  maxWidth: "760px",
                  padding: "13px 16px",
                  borderRadius: "10px",
                  backgroundColor: saveMessage.startsWith("Could not")
                    ? "#f7d7d4"
                    : "#e4f2df",
                  color: saveMessage.startsWith("Could not")
                    ? "#7b211c"
                    : "#285a24",
                  fontWeight: "bold",
                }}
              >
                {saveMessage}
              </p>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}