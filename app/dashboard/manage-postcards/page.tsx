"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../california/lib/supabase";

type Postcard = {
  id: number;
  created_at: string | null;
  title: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  landmark: string | null;
  postcard_date: string | null;
  gallery: string | null;
  status: string | null;
  featured: boolean | null;
  description?: string | null;
};

const cardStyle = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(250,243,225,0.97))",
  border: "1px solid #c7a45a",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 9px 24px rgba(55, 35, 15, 0.12)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  borderRadius: "8px",
  border: "1px solid #b99a62",
  backgroundColor: "#fffdf8",
  color: "#2f241a",
  fontSize: "15px",
};

export default function ManagePostcardsPage() {
  const router = useRouter();

  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading museum records...");
  const [isLoading, setIsLoading] = useState(true);
  const [editingPostcard, setEditingPostcard] = useState<Postcard | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingPostcardId, setDeletingPostcardId] = useState<number | null>(null);

  async function loadPostcards() {
    setIsLoading(true);
    setMessage("Loading museum records...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/curator-login");
      return;
    }

    const { data, error } = await supabase
      .from("postcards")
      .select(
        "id, created_at, title, country, state, city, landmark, postcard_date, gallery, status, featured, description"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Could not load postcards: ${error.message}`);
      setPostcards([]);
    } else {
      setPostcards((data as Postcard[]) || []);
      setMessage("");
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void loadPostcards();
  }, []);

  const filteredPostcards = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return postcards;
    }

    return postcards.filter((postcard) =>
      [
        postcard.title,
        postcard.country,
        postcard.state,
        postcard.city,
        postcard.landmark,
        postcard.postcard_date,
        postcard.gallery,
        postcard.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [postcards, search]);

  const draftCount = postcards.filter(
    (postcard) => postcard.status === "Draft"
  ).length;

  const publishedCount = postcards.filter(
    (postcard) => postcard.status === "Published"
  ).length;

  async function saveEditedPostcard() {
    if (!editingPostcard) return;

    setIsSavingEdit(true);
    setMessage("");

    const { data, error } = await supabase
      .from("postcards")
      .update({
        title: editingPostcard.title?.trim() || null,
        country: editingPostcard.country?.trim() || null,
        state: editingPostcard.state?.trim() || null,
        city: editingPostcard.city?.trim() || null,
        landmark: editingPostcard.landmark?.trim() || null,
        postcard_date: editingPostcard.postcard_date?.trim() || null,
        gallery: editingPostcard.gallery?.trim() || null,
        status: editingPostcard.status?.trim() || "Draft",
        featured: Boolean(editingPostcard.featured),
        description: editingPostcard.description?.trim() || null,
      })
      .eq("id", editingPostcard.id)
      .select(
        "id, created_at, title, country, state, city, landmark, postcard_date, gallery, status, featured, description"
      )
      .single();

    if (error) {
      setMessage(`Could not save changes: ${error.message}`);
      setIsSavingEdit(false);
      return;
    }

    setPostcards((current) =>
      current.map((postcard) =>
        postcard.id === editingPostcard.id ? (data as Postcard) : postcard
      )
    );

    setMessage(`"${data.title || "Untitled Postcard"}" was updated.`);
    setEditingPostcard(null);
    setIsSavingEdit(false);
  }

  async function updatePostcardStatus(
    postcard: Postcard,
    changes: Partial<Pick<Postcard, "status" | "featured">>
  ) {
    setMessage("");

    const { data, error } = await supabase
      .from("postcards")
      .update(changes)
      .eq("id", postcard.id)
      .select(
        "id, created_at, title, country, state, city, landmark, postcard_date, gallery, status, featured, description"
      )
      .single();

    if (error) {
      setMessage(`Could not update the postcard: ${error.message}`);
      return;
    }

    setPostcards((current) =>
      current.map((item) =>
        item.id === postcard.id ? (data as Postcard) : item
      )
    );

    const title = data.title || "Untitled Postcard";

    if (changes.status === "Published") {
      setMessage(`"${title}" was published to the museum.`);
    } else if (changes.status === "Draft") {
      setMessage(`"${title}" was returned to Draft.`);
    } else if (changes.featured === true) {
      setMessage(`"${title}" was marked as a Featured Postcard.`);
    } else if (changes.featured === false) {
      setMessage(`"${title}" was removed from Featured Postcards.`);
    }
  }

  async function deletePostcard(postcard: Postcard) {
    const title = postcard.title || `Postcard #${postcard.id}`;
    const recordType =
      postcard.status === "Published"
        ? "published museum exhibit"
        : "draft museum record";

    const confirmed = window.confirm(
      `Permanently delete "${title}" (${recordType})?\n\nThis removes the postcard record from the museum and cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingPostcardId(postcard.id);
    setMessage(`Deleting "${title}"...`);

    const { error } = await supabase
      .from("postcards")
      .delete()
      .eq("id", postcard.id);

    if (error) {
      setMessage(`Could not delete the postcard: ${error.message}`);
      setDeletingPostcardId(null);
      return;
    }

    setPostcards((current) =>
      current.filter((item) => item.id !== postcard.id)
    );

    if (editingPostcard?.id === postcard.id) {
      setEditingPostcard(null);
    }

    setMessage(`"${title}" was permanently deleted.`);
    setDeletingPostcardId(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/curator-login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "34px 20px 70px",
        background:
          "radial-gradient(circle at top, #f7e8bd 0%, #e8d4a7 38%, #c9af7c 100%)",
        color: "#302217",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <header
          style={{
            borderRadius: "22px",
            padding: "34px 22px",
            marginBottom: "24px",
            textAlign: "center",
            color: "#fff8e7",
            border: "2px solid #d2b36c",
            background:
              "linear-gradient(135deg, rgba(73,34,20,0.98), rgba(111,62,33,0.98))",
            boxShadow: "0 16px 38px rgba(45, 27, 12, 0.25)",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#e8ca82",
              letterSpacing: "3px",
              fontWeight: "bold",
            }}
          >
            CURATOR&apos;S OFFICE
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 6vw, 58px)",
            }}
          >
            Museum Collection Manager
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "16px auto 0",
              color: "#f1dfbc",
              fontSize: "18px",
              lineHeight: "1.6",
            }}
          >
            Search, review, organize, publish, and maintain the permanent
            postcard catalog.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              backgroundColor: "#5b3420",
              color: "#fff8e7",
              padding: "12px 18px",
              borderRadius: "9px",
              border: "1px solid #c8a35d",
              fontWeight: "bold",
            }}
          >
            ← Return to Curator&apos;s Office
          </Link>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/dashboard/add-postcard"
              style={{
                textDecoration: "none",
                backgroundColor: "#b88935",
                color: "#fffdf7",
                padding: "12px 18px",
                borderRadius: "9px",
                border: "1px solid #f0d48a",
                fontWeight: "bold",
              }}
            >
              + Catalog New Postcard
            </Link>

            <button
              type="button"
              onClick={signOut}
              style={{
                backgroundColor: "#fff8e7",
                color: "#683820",
                padding: "12px 18px",
                borderRadius: "9px",
                border: "1px solid #b88a3b",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Total Records", postcards.length],
            ["Draft Records", draftCount],
            ["Published Records", publishedCount],
            ["Search Results", filteredPostcards.length],
          ].map(([label, value]) => (
            <div key={String(label)} style={cardStyle}>
              <div
                style={{
                  color: "#7a361e",
                  fontSize: "34px",
                  fontWeight: "bold",
                }}
              >
                {value}
              </div>
              <div
                style={{
                  marginTop: "7px",
                  color: "#543620",
                  fontWeight: "bold",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </section>

        <section style={{ ...cardStyle, marginBottom: "22px" }}>
          <label
            htmlFor="postcardSearch"
            style={{
              display: "block",
              color: "#5b3420",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Search the Museum Catalog
          </label>

          <input
            id="postcardSearch"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, city, state, landmark, gallery, date, or status..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #b99a62",
              backgroundColor: "#fffdf8",
              color: "#2f241a",
              fontSize: "16px",
            }}
          />
        </section>

        {message && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "22px",
              color: message.startsWith("Could not") ? "#8a241e" : "#315a2b",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {!isLoading && filteredPostcards.length === 0 && !message && (
          <section style={{ ...cardStyle, textAlign: "center" }}>
            <h2 style={{ color: "#6d321f" }}>No Postcards Found</h2>
            <p>
              No museum records match your search. You can catalog a new
              postcard or change the search words.
            </p>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredPostcards.map((postcard) => (
            <article key={postcard.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#9a6a22",
                      fontSize: "13px",
                      letterSpacing: "1px",
                      fontWeight: "bold",
                    }}
                  >
                    MUSEUM RECORD #{postcard.id}
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#642f1e",
                      fontSize: "25px",
                    }}
                  >
                    {postcard.title || "Untitled Postcard"}
                  </h2>
                </div>

                <span
                  style={{
                    backgroundColor:
                      postcard.status === "Published" ? "#dfeeda" : "#efe2bd",
                    color:
                      postcard.status === "Published" ? "#315a2b" : "#74491e",
                    padding: "7px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {postcard.status || "Unclassified"}
                </span>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  lineHeight: "1.7",
                  color: "#513823",
                }}
              >
                <div>
                  <strong>Location:</strong>{" "}
                  {[postcard.city, postcard.state, postcard.country]
                    .filter(Boolean)
                    .join(", ") || "Not recorded"}
                </div>

                <div>
                  <strong>Landmark:</strong>{" "}
                  {postcard.landmark || "Not recorded"}
                </div>

                <div>
                  <strong>Date:</strong>{" "}
                  {postcard.postcard_date || "Not recorded"}
                </div>

                <div>
                  <strong>Gallery:</strong>{" "}
                  {postcard.gallery || "Not assigned"}
                </div>

                <div>
                  <strong>Featured:</strong>{" "}
                  {postcard.featured ? "Yes" : "No"}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostcard({ ...postcard });
                    setMessage("");
                  }}
                  style={{
                    border: "1px solid #c49a4a",
                    borderRadius: "8px",
                    padding: "11px",
                    backgroundColor: "#efe4c9",
                    color: "#6d4b2c",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Edit Record
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void updatePostcardStatus(postcard, {
                      status:
                        postcard.status === "Published"
                          ? "Draft"
                          : "Published",
                    })
                  }
                  style={{
                    border: "1px solid #7d9b66",
                    borderRadius: "8px",
                    padding: "11px",
                    backgroundColor:
                      postcard.status === "Published" ? "#efe2bd" : "#dfeeda",
                    color:
                      postcard.status === "Published" ? "#74491e" : "#315a2b",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {postcard.status === "Published"
                    ? "Return to Draft"
                    : "Publish to Museum"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void updatePostcardStatus(postcard, {
                      featured: !postcard.featured,
                    })
                  }
                  style={{
                    border: "1px solid #c49a4a",
                    borderRadius: "8px",
                    padding: "11px",
                    backgroundColor: postcard.featured ? "#f2d58b" : "#fff8e7",
                    color: "#6d4b2c",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {postcard.featured
                    ? "Remove Featured"
                    : "Feature Postcard"}
                </button>

                <button
                  type="button"
                  onClick={() => void deletePostcard(postcard)}
                  disabled={deletingPostcardId === postcard.id}
                  style={{
                    border: "1px solid #9f4a3e",
                    borderRadius: "8px",
                    padding: "11px",
                    backgroundColor: "#7c3429",
                    color: "#fff8ed",
                    fontWeight: "bold",
                    cursor:
                      deletingPostcardId === postcard.id
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      deletingPostcardId === postcard.id ? 0.7 : 1,
                  }}
                >
                  {deletingPostcardId === postcard.id
                    ? "Deleting..."
                    : "Delete Postcard"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {editingPostcard && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(35, 22, 12, 0.72)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <section
              style={{
                ...cardStyle,
                width: "min(760px, 100%)",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "2px solid #c7a45a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#9a6a22",
                      fontWeight: "bold",
                    }}
                  >
                    MUSEUM RECORD #{editingPostcard.id}
                  </p>
                  <h2 style={{ margin: 0, color: "#642f1e" }}>
                    Edit Postcard
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPostcard(null)}
                  style={{
                    border: "1px solid #b88a3b",
                    borderRadius: "8px",
                    backgroundColor: "#fff8e7",
                    color: "#683820",
                    padding: "9px 13px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {[
                  ["Title", "title"],
                  ["Country", "country"],
                  ["State", "state"],
                  ["City", "city"],
                  ["Landmark", "landmark"],
                  ["Postcard Date", "postcard_date"],
                  ["Gallery", "gallery"],
                ].map(([label, field]) => (
                  <label
                    key={field}
                    style={{ fontWeight: "bold", color: "#53371f" }}
                  >
                    {label}
                    <input
                      value={String(
                        editingPostcard[field as keyof Postcard] || ""
                      )}
                      onChange={(event) =>
                        setEditingPostcard((current) =>
                          current
                            ? { ...current, [field]: event.target.value }
                            : current
                        )
                      }
                      style={{ ...inputStyle, marginTop: "7px" }}
                    />
                  </label>
                ))}

                <label style={{ fontWeight: "bold", color: "#53371f" }}>
                  Status
                  <select
                    value={editingPostcard.status || "Draft"}
                    onChange={(event) =>
                      setEditingPostcard((current) =>
                        current
                          ? { ...current, status: event.target.value }
                          : current
                      )
                    }
                    style={{ ...inputStyle, marginTop: "7px" }}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                  </select>
                </label>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: "16px",
                  fontWeight: "bold",
                  color: "#53371f",
                }}
              >
                Description
                <textarea
                  value={editingPostcard.description || ""}
                  onChange={(event) =>
                    setEditingPostcard((current) =>
                      current
                        ? { ...current, description: event.target.value }
                        : current
                    )
                  }
                  style={{
                    ...inputStyle,
                    minHeight: "120px",
                    resize: "vertical",
                    marginTop: "7px",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  marginTop: "16px",
                  fontWeight: "bold",
                  color: "#53371f",
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(editingPostcard.featured)}
                  onChange={(event) =>
                    setEditingPostcard((current) =>
                      current
                        ? { ...current, featured: event.target.checked }
                        : current
                    )
                  }
                />
                Mark as Featured Postcard
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingPostcard(null)}
                  disabled={isSavingEdit}
                  style={{
                    border: "1px solid #b88a3b",
                    borderRadius: "8px",
                    backgroundColor: "#fff8e7",
                    color: "#683820",
                    padding: "12px 18px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void saveEditedPostcard()}
                  disabled={isSavingEdit}
                  style={{
                    border: "1px solid #f0d48a",
                    borderRadius: "8px",
                    backgroundColor: "#b88935",
                    color: "#fffdf7",
                    padding: "12px 18px",
                    cursor: isSavingEdit ? "not-allowed" : "pointer",
                    opacity: isSavingEdit ? 0.7 : 1,
                    fontWeight: "bold",
                  }}
                >
                  {isSavingEdit ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}