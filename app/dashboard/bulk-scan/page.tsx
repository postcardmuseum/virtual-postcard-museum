"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../california/lib/supabase";

type LayoutMode = "single" | "3x1" | "1x3";

type Trim = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type CropPair = {
  number: number;
  front: string | null;
  back: string | null;
  frontRotation: number;
  backRotation: number;
  frontFineAngle: number;
  backFineAngle: number;
  frontTrim: Trim;
  backTrim: Trim;
};

type CatalogDraft = {
  title: string;
  country: string;
  state: string;
  city: string;
  landmark: string;
  postcardDate: string;
  gallery: string;
  description: string;
  displayRotation: number;
  nightDisplay: "off" | "subtle" | "neon";
  featured: boolean;
};

type AiCatalogSuggestion = {
  title?: string;
  country?: string;
  state?: string;
  city?: string;
  landmark?: string;
  postcardDate?: string;
  gallery?: string;
  description?: string;
  backText?: string;
};

type ExistingPostcard = {
  id: number | string;
  title: string | null;
  city: string | null;
  landmark: string | null;
  postcard_date: string | null;
  front_image_url: string | null;
  status: string | null;
};

type DuplicateMatch = {
  id: number | string;
  title: string;
  imageSimilarity: number;
  metadataScore: number;
  confidence: "strong" | "possible";
};

type PublishStatus = {
  state: "not-published" | "draft" | "published";
  id?: number | string;
  message: string;
};


const emptyTrim: Trim = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

const emptyPairs: CropPair[] = Array.from({ length: 3 }, (_, index) => ({
  number: index + 1,
  front: null,
  back: null,
  frontRotation: 0,
  backRotation: 0,
  frontFineAngle: 0,
  backFineAngle: 0,
  frontTrim: { ...emptyTrim },
  backTrim: { ...emptyTrim },
}));

function makeEmptyCatalogDrafts(): CatalogDraft[] {
  return Array.from({ length: 3 }, () => ({
    title: "",
    country: "United States",
    state: "",
    city: "",
    landmark: "",
    postcardDate: "",
    gallery: "",
    description: "",
    displayRotation: 0,
    nightDisplay: "off",
    featured: false,
  }));
}

const emptyCatalogDrafts: CatalogDraft[] = makeEmptyCatalogDrafts();

function layoutDimensions(layout: LayoutMode) {
  if (layout === "single") return { columns: 1, rows: 1 };
  if (layout === "1x3") return { columns: 1, rows: 3 };
  return { columns: 3, rows: 1 };
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The scan image could not be opened."));
    };

    image.src = objectUrl;
  });
}

async function splitScan(
  file: File,
  layout: LayoutMode,
  marginPercent: number,
  gutterPercent: number
): Promise<string[]> {
  const image = await loadImage(file);
  const { columns, rows } = layoutDimensions(layout);

  const marginX = image.width * (marginPercent / 100);
  const marginY = image.height * (marginPercent / 100);
  const usableWidth = image.width - marginX * 2;
  const usableHeight = image.height - marginY * 2;

  const gutterX = usableWidth * (gutterPercent / 100);
  const gutterY = usableHeight * (gutterPercent / 100);

  const cropWidth = (usableWidth - gutterX * (columns - 1)) / columns;
  const cropHeight = (usableHeight - gutterY * (rows - 1)) / rows;

  const results: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (results.length >= (layout === "single" ? 1 : 3)) break;

      const sourceX = marginX + column * (cropWidth + gutterX);
      const sourceY = marginY + row * (cropHeight + gutterY);

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(cropWidth));
      canvas.height = Math.max(1, Math.round(cropHeight));

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("The browser could not prepare the crop canvas.");
      }

      context.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      results.push(canvas.toDataURL("image/jpeg", 0.94));
    }
  }

  return results;
}


async function imageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("The postcard crop could not be opened."));
    image.src = dataUrl;
  });
}

async function applyFinalEdit(
  dataUrl: string,
  rotation: number,
  fineAngle: number,
  trim: Trim,
  safetyPaddingPercent: number
): Promise<string> {
  const image = await imageFromDataUrl(dataUrl);
  const angle = rotation + fineAngle;
  const radians = (angle * Math.PI) / 180;
  const sine = Math.abs(Math.sin(radians));
  const cosine = Math.abs(Math.cos(radians));

  const rotated = document.createElement("canvas");
  rotated.width = Math.ceil(image.width * cosine + image.height * sine);
  rotated.height = Math.ceil(image.width * sine + image.height * cosine);

  const rotatedContext = rotated.getContext("2d");
  if (!rotatedContext) {
    throw new Error("The browser could not straighten the postcard.");
  }

  rotatedContext.fillStyle = "#ffffff";
  rotatedContext.fillRect(0, 0, rotated.width, rotated.height);
  rotatedContext.translate(rotated.width / 2, rotated.height / 2);
  rotatedContext.rotate(radians);
  rotatedContext.drawImage(image, -image.width / 2, -image.height / 2);

  const left = rotated.width * (trim.left / 100);
  const right = rotated.width * (trim.right / 100);
  const top = rotated.height * (trim.top / 100);
  const bottom = rotated.height * (trim.bottom / 100);

  const width = Math.max(1, rotated.width - left - right);
  const height = Math.max(1, rotated.height - top - bottom);

  if (
    width < rotated.width * 0.55 ||
    height < rotated.height * 0.55
  ) {
    throw new Error(
      "That trim is too large and may cut off postcard edges or handwriting. Reduce the trim percentages and try again."
    );
  }

  const paddingX = width * (safetyPaddingPercent / 100);
  const paddingY = height * (safetyPaddingPercent / 100);

  const output = document.createElement("canvas");
  output.width = Math.round(width + paddingX * 2);
  output.height = Math.round(height + paddingY * 2);

  const outputContext = output.getContext("2d");
  if (!outputContext) {
    throw new Error("The browser could not create the final postcard crop.");
  }

  outputContext.fillStyle = "#ffffff";
  outputContext.fillRect(0, 0, output.width, output.height);

  outputContext.drawImage(
    rotated,
    left,
    top,
    width,
    height,
    paddingX,
    paddingY,
    width,
    height
  );

  return output.toDataURL("image/jpeg", 0.96);
}

function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function uploadPreparedImage(
  dataUrl: string,
  cardNumber: number,
  side: "front" | "back"
): Promise<string> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (sessionError || !token) {
    throw new Error("Please sign in as curator before uploading postcards.");
  }

  const blob = await dataUrlToBlob(dataUrl);
  if (blob.size > 30 * 1024 * 1024) {
    throw new Error(`Card ${cardNumber} ${side} exceeds the 30 MB upload limit.`);
  }

  const signingResponse = await fetch("/api/r2-upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cardNumber,
      side,
      contentType: "image/jpeg",
      fileSize: blob.size,
    }),
  });
  const signingResult: {
    uploadUrl?: string;
    publicUrl?: string;
    error?: string;
  } = await signingResponse.json();
  if (!signingResponse.ok || !signingResult.uploadUrl || !signingResult.publicUrl) {
    throw new Error(signingResult.error || `Could not prepare Card ${cardNumber} ${side} upload.`);
  }

  const uploadResponse = await fetch(signingResult.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Cloudflare could not upload Card ${cardNumber} ${side} (${uploadResponse.status}).`);
  }
  return signingResult.publicUrl;
}

async function prepareDataUrlForAi(
  dataUrl: string,
  maxDimension = 1600
): Promise<string> {
  const image = await imageFromDataUrl(dataUrl);
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The browser could not prepare the postcard for AI review.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.86);
}


function normalizeCatalogText(value: string | null | undefined) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenSimilarity(a: string | null | undefined, b: string | null | undefined) {
  const aTokens = new Set(normalizeCatalogText(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeCatalogText(b).split(" ").filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  let intersection = 0;
  aTokens.forEach((token) => {
    if (bTokens.has(token)) intersection += 1;
  });
  const union = new Set([...aTokens, ...bTokens]).size;
  return union ? intersection / union : 0;
}

async function createDifferenceHash(dataUrlOrUrl: string): Promise<string> {
  let imageSource = dataUrlOrUrl;
  let objectUrl: string | null = null;

  if (!dataUrlOrUrl.startsWith("data:")) {
    const response = await fetch(dataUrlOrUrl, { cache: "force-cache" });
    if (!response.ok) throw new Error("Could not load an existing postcard image for comparison.");
    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    imageSource = objectUrl;
  }

  try {
    const image = await imageFromDataUrl(imageSource);
    const canvas = document.createElement("canvas");
    canvas.width = 9;
    canvas.height = 8;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("The browser could not prepare the duplicate comparison.");
    context.drawImage(image, 0, 0, 9, 8);
    const pixels = context.getImageData(0, 0, 9, 8).data;
    const gray: number[] = [];
    for (let i = 0; i < pixels.length; i += 4) {
      gray.push(Math.round(pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114));
    }
    let bits = "";
    for (let row = 0; row < 8; row += 1) {
      for (let column = 0; column < 8; column += 1) {
        bits += gray[row * 9 + column] > gray[row * 9 + column + 1] ? "1" : "0";
      }
    }
    return bits;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function hashSimilarity(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return 0;
  let same = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] === b[i]) same += 1;
  return same / a.length;
}

function metadataSimilarity(draft: CatalogDraft, existing: ExistingPostcard) {
  const titleScore = tokenSimilarity(draft.title, existing.title);
  const landmarkScore = tokenSimilarity(draft.landmark, existing.landmark);
  const cityScore =
    normalizeCatalogText(draft.city) &&
    normalizeCatalogText(draft.city) === normalizeCatalogText(existing.city) ? 1 : 0;
  const dateScore =
    normalizeCatalogText(draft.postcardDate) &&
    normalizeCatalogText(draft.postcardDate) === normalizeCatalogText(existing.postcard_date) ? 1 : 0;

  return titleScore * 0.5 + landmarkScore * 0.2 + cityScore * 0.2 + dateScore * 0.1;
}



export default function BulkScanWorkbenchPage() {
  const [layout, setLayout] = useState<LayoutMode>("1x3");
  const [marginPercent, setMarginPercent] = useState(0);
  const [gutterPercent, setGutterPercent] = useState(0);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [pairs, setPairs] = useState<CropPair[]>(emptyPairs);
  const [activeNumber, setActiveNumber] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [safetyPaddingPercent, setSafetyPaddingPercent] = useState(3);
  const [message, setMessage] = useState(
    "Choose the front and back scanner images to begin."
  );
  const [catalogDrafts, setCatalogDrafts] =
    useState<CatalogDraft[]>(emptyCatalogDrafts);
  const [savingCard, setSavingCard] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [skipAiReview, setSkipAiReview] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [skipBackForAi, setSkipBackForAi] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiBackText, setAiBackText] = useState("");

  const [duplicateMatches, setDuplicateMatches] = useState<Array<DuplicateMatch | null>>([null, null, null]);
  const [duplicateChecking, setDuplicateChecking] = useState<boolean[]>([false, false, false]);
  const [allowDuplicatePublish, setAllowDuplicatePublish] = useState<boolean[]>([false, false, false]);
  const [publishStatuses, setPublishStatuses] = useState<PublishStatus[]>([
    { state: "not-published", message: "Card 1 — Not yet published" },
    { state: "not-published", message: "Card 2 — Not yet published" },
    { state: "not-published", message: "Card 3 — Not yet published" },
  ]);

  // Keeps automatic AI review from repeatedly running on the same card image.
  const reviewedFrontsRef = useRef<Record<number, string>>({});

  const activePair = useMemo(
    () => pairs.find((pair) => pair.number === activeNumber) || pairs[0],
    [pairs, activeNumber]
  );

  const activeCatalog = catalogDrafts[activeNumber - 1];
  const activeSkipAiReview = skipAiReview[activeNumber - 1] || false;
  const activeSkipBackForAi = skipBackForAi[activeNumber - 1] || false;
  const activeDuplicateMatch = duplicateMatches[activeNumber - 1];
  const activeDuplicateChecking = duplicateChecking[activeNumber - 1] || false;
  const activeAllowDuplicatePublish = allowDuplicatePublish[activeNumber - 1] || false;

  function handleFile(
    side: "front" | "back",
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    if (side === "front") {
      setFrontFile(file);
    } else {
      setBackFile(file);
    }

    setMessage(
      file
        ? `${side === "front" ? "Front" : "Back"} scan selected: ${file.name}`
        : "Choose the front and back scanner images to begin."
    );
  }

  async function processScans() {
    if (!frontFile && !backFile) {
      setMessage("Please choose at least one scanner image.");
      return;
    }

    setProcessing(true);
    setMessage(
      layout === "single"
        ? "Preparing the single postcard from the scanner image..."
        : "Separating the three postcards from the scanner image..."
    );

    try {
      const frontCrops = frontFile
        ? await splitScan(frontFile, layout, marginPercent, gutterPercent)
        : [];
      const backCrops = backFile
        ? await splitScan(backFile, layout, marginPercent, gutterPercent)
        : [];

      setPairs((current) =>
        current.map((pair, index) => ({
          ...pair,
          front: frontCrops[index] || null,
          back: backCrops[index] || null,
          frontRotation: 0,
          backRotation: 0,
          frontFineAngle: 0,
          backFineAngle: 0,
          frontTrim: { ...emptyTrim },
          backTrim: { ...emptyTrim },
        }))
      );

      // Start every new scan batch with clean card-specific catalog settings.
      setCatalogDrafts(makeEmptyCatalogDrafts());
      setCatalogMessage("");
      setAiMessage("");
      setAiBackText("");
      setSkipAiReview([false, false, false]);
      setSkipBackForAi([false, false, false]);
      setDuplicateMatches([null, null, null]);
      setDuplicateChecking([false, false, false]);
      setAllowDuplicatePublish([false, false, false]);
      setPublishStatuses([
        { state: "not-published", message: "Card 1 — Not yet published" },
        { state: "not-published", message: "Card 2 — Not yet published" },
        { state: "not-published", message: "Card 3 — Not yet published" },
      ]);
      reviewedFrontsRef.current = {};
      setActiveNumber(1);
      setMessage(
        layout === "single"
          ? "Single postcard is ready. Review the front and back, crop or straighten if needed, then catalog it."
          : "Three postcard positions are ready. Review each front-and-back pair before cataloging."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The scanner image could not be processed."
      );
    } finally {
      setProcessing(false);
    }
  }

  function rotate(side: "front" | "back") {
    setPairs((current) =>
      current.map((pair) =>
        pair.number === activeNumber
          ? {
              ...pair,
              [side === "front" ? "frontRotation" : "backRotation"]:
                (side === "front"
                  ? pair.frontRotation + 90
                  : pair.backRotation + 90) % 360,
            }
          : pair
      )
    );
  }


  function updateFineAngle(side: "front" | "back", value: number) {
    setPairs((current) =>
      current.map((pair) =>
        pair.number === activeNumber
          ? {
              ...pair,
              [side === "front" ? "frontFineAngle" : "backFineAngle"]:
                Math.max(-5, Math.min(5, value)),
            }
          : pair
      )
    );
  }

  function updateTrim(
    side: "front" | "back",
    edge: keyof Trim,
    value: number
  ) {
    const trimField = side === "front" ? "frontTrim" : "backTrim";

    setPairs((current) =>
      current.map((pair) =>
        pair.number === activeNumber
          ? {
              ...pair,
              [trimField]: {
                ...pair[trimField],
                [edge]: Math.max(0, Math.min(45, value)),
              },
            }
          : pair
      )
    );
  }

  async function applyEdit(side: "front" | "back") {
    const dataUrl = side === "front" ? activePair.front : activePair.back;
    if (!dataUrl) return;

    setApplying(true);
    setMessage(`Applying the ${side} edit for Card ${activeNumber}...`);

    try {
      const finished = await applyFinalEdit(
        dataUrl,
        side === "front"
          ? activePair.frontRotation
          : activePair.backRotation,
        side === "front"
          ? activePair.frontFineAngle
          : activePair.backFineAngle,
        side === "front" ? activePair.frontTrim : activePair.backTrim,
        safetyPaddingPercent
      );

      setPairs((current) =>
        current.map((pair) =>
          pair.number === activeNumber
            ? {
                ...pair,
                [side]: finished,
                [side === "front" ? "frontRotation" : "backRotation"]: 0,
                [side === "front" ? "frontFineAngle" : "backFineAngle"]: 0,
                [side === "front" ? "frontTrim" : "backTrim"]: {
                  ...emptyTrim,
                },
              }
            : pair
        )
      );

      setMessage(`Card ${activeNumber} ${side} edit applied successfully.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The postcard edit could not be applied."
      );
    } finally {
      setApplying(false);
    }
  }

  function resetActiveControls() {
    // Reset controls and catalog information for this card, but leave the
    // working crop/apply system itself untouched.
    setPairs((current) =>
      current.map((pair) =>
        pair.number === activeNumber
          ? {
              ...pair,
              frontRotation: 0,
              backRotation: 0,
              frontFineAngle: 0,
              backFineAngle: 0,
              frontTrim: { ...emptyTrim },
              backTrim: { ...emptyTrim },
            }
          : pair
      )
    );

    setCatalogDrafts((current) =>
      current.map((draft, index) =>
        index === activeNumber - 1 ? makeEmptyCatalogDrafts()[0] : draft
      )
    );

    setSkipAiReview((current) =>
      current.map((value, index) =>
        index === activeNumber - 1 ? false : value
      )
    );

    setSkipBackForAi((current) =>
      current.map((value, index) =>
        index === activeNumber - 1 ? false : value
      )
    );

    delete reviewedFrontsRef.current[activeNumber];
    setAiMessage("");
    setAiBackText("");
    setCatalogMessage("");

    setMessage(
      `Card ${activeNumber} controls and catalog fields were reset.`
    );
  }

  function clearWorkbench() {
    setFrontFile(null);
    setBackFile(null);
    setPairs(
      emptyPairs.map((pair) => ({
        ...pair,
        frontTrim: { ...emptyTrim },
        backTrim: { ...emptyTrim },
      }))
    );
    setCatalogDrafts(makeEmptyCatalogDrafts());
    setActiveNumber(1);
    setCatalogMessage("");
    setAiMessage("");
    setAiBackText("");
    setSkipAiReview([false, false, false]);
    setSkipBackForAi([false, false, false]);
    setDuplicateMatches([null, null, null]);
    setDuplicateChecking([false, false, false]);
    setAllowDuplicatePublish([false, false, false]);
    setPublishStatuses([
      { state: "not-published", message: "Card 1 — Not yet published" },
      { state: "not-published", message: "Card 2 — Not yet published" },
      { state: "not-published", message: "Card 3 — Not yet published" },
    ]);
    reviewedFrontsRef.current = {};
    setMessage("Workbench cleared. Choose new scanner images to begin.");
  }

  function updateCatalogField<K extends keyof CatalogDraft>(
    field: K,
    value: CatalogDraft[K]
  ) {
    setCatalogDrafts((current) =>
      current.map((draft, index) =>
        index === activeNumber - 1
          ? { ...draft, [field]: value }
          : draft
      )
    );
  }

  async function checkCardForDuplicate(
    cardNumber: number,
    draftOverride?: CatalogDraft
  ): Promise<DuplicateMatch | null> {
    const pair = pairs.find((item) => item.number === cardNumber);
    const draft = draftOverride || catalogDrafts[cardNumber - 1];
    if (!pair?.front) return null;

    setDuplicateChecking((current) =>
      current.map((value, index) => index === cardNumber - 1 ? true : value)
    );

    try {
      const { data, error } = await supabase
        .from("postcards")
        .select("id,title,city,landmark,postcard_date,front_image_url,status")
        .order("id", { ascending: false })
        .limit(5000);

      if (error) throw new Error(error.message);

      const existingCards = (data || []) as ExistingPostcard[];
      if (!existingCards.length) {
        setDuplicateMatches((current) =>
          current.map((match, index) => index === cardNumber - 1 ? null : match)
        );
        return null;
      }

      const ranked = existingCards
        .map((existing) => ({
          existing,
          metadataScore: metadataSimilarity(draft, existing),
        }))
        .sort((a, b) => b.metadataScore - a.metadataScore);

      const candidates = ranked.slice(0, 18);
      const currentHash = await createDifferenceHash(pair.front);
      let best: DuplicateMatch | null = null;

      for (const candidate of candidates) {
        const imageUrl = candidate.existing.front_image_url;
        if (!imageUrl) continue;

        try {
          const existingHash = await createDifferenceHash(imageUrl);
          const imageSimilarity = hashSimilarity(currentHash, existingHash);
          const metadataScore = candidate.metadataScore;

          let confidence: "strong" | "possible" | null = null;
          if (imageSimilarity >= 0.92 || (imageSimilarity >= 0.86 && metadataScore >= 0.35)) {
            confidence = "strong";
          } else if ((imageSimilarity >= 0.80 && metadataScore >= 0.45) || metadataScore >= 0.90) {
            confidence = "possible";
          }

          if (!confidence) continue;

          const proposed: DuplicateMatch = {
            id: candidate.existing.id,
            title: candidate.existing.title || "Untitled postcard",
            imageSimilarity,
            metadataScore,
            confidence,
          };

          if (!best || proposed.imageSimilarity + proposed.metadataScore > best.imageSimilarity + best.metadataScore) {
            best = proposed;
          }
        } catch {
          // Keep checking other records if one stored image cannot be loaded.
        }
      }

      if (!best && ranked[0]?.metadataScore >= 0.94) {
        best = {
          id: ranked[0].existing.id,
          title: ranked[0].existing.title || "Untitled postcard",
          imageSimilarity: 0,
          metadataScore: ranked[0].metadataScore,
          confidence: "possible",
        };
      }

      setDuplicateMatches((current) =>
        current.map((match, index) => index === cardNumber - 1 ? best : match)
      );
      setAllowDuplicatePublish((current) =>
        current.map((value, index) => index === cardNumber - 1 ? false : value)
      );
      return best;
    } catch (error) {
      setCatalogMessage(
        `Duplicate check could not be completed for Card ${cardNumber}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return null;
    } finally {
      setDuplicateChecking((current) =>
        current.map((value, index) => index === cardNumber - 1 ? false : value)
      );
    }
  }

  async function analyzeCardWithAi(cardNumber: number) {
    const pair = pairs.find((item) => item.number === cardNumber);
    if (!pair?.front) {
      if (cardNumber === activeNumber) {
        setAiMessage(
          `Card ${cardNumber} needs a prepared front image before AI can review it.`
        );
      }
      return;
    }

    const skipBack = skipBackForAi[cardNumber - 1] || false;

    setAiAnalyzing(true);
    if (cardNumber === activeNumber) {
      setAiMessage(`AI is reviewing Card ${cardNumber}...`);
      setAiBackText("");
    }

    try {
      const frontImage = await prepareDataUrlForAi(pair.front);
      const backImage =
        !skipBack && pair.back
          ? await prepareDataUrlForAi(pair.back)
          : null;

    const {
  data: { session },
  error: sessionError,
} = await supabase.auth.getSession();

if (sessionError || !session?.access_token) {
  throw new Error("Please sign in again as curator.");
}

const response = await fetch("/api/analyze-postcard", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    frontImage,
    backImage,
    includeBackText: !skipBack,
  }),
});

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "The AI review could not be completed.");
      }

      const suggestion = (result?.suggestion || {}) as AiCatalogSuggestion;

      const suggestedDraft: CatalogDraft = {
        ...catalogDrafts[cardNumber - 1],
        title: suggestion.title || "",
        country: suggestion.country || "United States",
        state: suggestion.state || "",
        city: suggestion.city || "",
        landmark: suggestion.landmark || "",
        postcardDate: suggestion.postcardDate || "",
        gallery: suggestion.gallery || "",
        description: suggestion.description || "",
      };

      // Replace card-specific AI fields with this card's values or blanks.
      // This prevents a previous card's city/date/landmark from carrying over.
      setCatalogDrafts((current) =>
        current.map((draft, index) =>
          index === cardNumber - 1 ? suggestedDraft : draft
        )
      );

      if (cardNumber === activeNumber) {
        setAiBackText(suggestion.backText || "");
        setAiMessage(
          `AI suggestions added to Card ${cardNumber}. Please review and correct them before saving.`
        );
      }

      void checkCardForDuplicate(cardNumber, suggestedDraft);
    } catch (error) {
      if (cardNumber === activeNumber) {
        setAiMessage(
          error instanceof Error
            ? error.message
            : "The AI review could not be completed."
        );
      }
    } finally {
      reviewedFrontsRef.current[cardNumber] = pair.front;
      setAiAnalyzing(false);
    }
  }

  // Automatic AI review for the selected card. This does not alter any crop code.
  useEffect(() => {
    const pair = pairs.find((item) => item.number === activeNumber);
    if (!pair?.front) return;
    if (skipAiReview[activeNumber - 1]) return;
    if (processing || applying || aiAnalyzing) return;

    const alreadyReviewed =
      reviewedFrontsRef.current[activeNumber] === pair.front;

    if (alreadyReviewed) return;

    const timer = window.setTimeout(() => {
      void analyzeCardWithAi(activeNumber);
    }, 500);

    return () => window.clearTimeout(timer);
    // analyzeCardWithAi intentionally uses the latest selected-card state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeNumber,
    pairs,
    skipAiReview,
    skipBackForAi,
    processing,
    applying,
    aiAnalyzing,
  ]);

  async function saveActiveCard(status: "Draft" | "Published") {
    if (!activePair.front) {
      setCatalogMessage(
        `Card ${activeNumber} needs a prepared front image before it can be saved.`
      );
      return;
    }

    if (!activeCatalog.title.trim()) {
      setCatalogMessage("Please enter a postcard title before saving.");
      return;
    }

    setSavingCard(true);

    try {
      if (status === "Published" && !activeAllowDuplicatePublish) {
        setCatalogMessage(
          `Checking Card ${activeNumber} for possible duplicates before publishing...`
        );

        const duplicate = await checkCardForDuplicate(activeNumber, activeCatalog);

        if (duplicate) {
          setCatalogMessage(
            `Possible duplicate found for Card ${activeNumber}. Review the warning below before publishing.`
          );
          return;
        }
      }

      setCatalogMessage(
        status === "Published"
          ? `Publishing Card ${activeNumber} to the museum...`
          : `Saving Card ${activeNumber} as a draft...`
      );
      const [frontImageUrl, backImageUrl] = await Promise.all([
        uploadPreparedImage(activePair.front, activeNumber, "front"),
        activePair.back
          ? uploadPreparedImage(activePair.back, activeNumber, "back")
          : Promise.resolve(null),
      ]);

      const { data, error } = await supabase
        .from("postcards")
        .insert({
          title: activeCatalog.title.trim(),
          country: activeCatalog.country.trim() || null,
          state: activeCatalog.state.trim() || null,
          city: activeCatalog.city.trim() || null,
          landmark: activeCatalog.landmark.trim() || null,
          postcard_date: activeCatalog.postcardDate.trim() || null,
          gallery: activeCatalog.gallery.trim() || null,
          description: activeCatalog.description.trim() || null,
          display_rotation: activeCatalog.displayRotation,
          night_display: activeCatalog.nightDisplay,
          featured: activeCatalog.featured,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl,
          status,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const vpmNumber = String(data.id).padStart(4, "0");

      setCatalogMessage(
        status === "Published"
          ? `Card ${activeNumber} published successfully as VPM ${vpmNumber}.`
          : `Card ${activeNumber} saved successfully as draft VPM ${vpmNumber}.`
      );

      setPublishStatuses((current) =>
        current.map((entry, index) =>
          index === activeNumber - 1
            ? {
                state: status === "Published" ? "published" : "draft",
                id: data.id,
                message:
                  status === "Published"
                    ? `Card ${activeNumber} — Published as VPM ${vpmNumber}`
                    : `Card ${activeNumber} — Saved as Draft VPM ${vpmNumber}`,
              }
            : entry
        )
      );

      setDuplicateMatches((current) =>
        current.map((match, index) =>
          index === activeNumber - 1 ? null : match
        )
      );

      setAllowDuplicatePublish((current) =>
        current.map((value, index) =>
          index === activeNumber - 1 ? false : value
        )
      );

      // Reset this card slot after save/publish so its date, rotation,
      // night-display choice, featured flag, and other fields do not carry forward.
      setCatalogDrafts((current) =>
        current.map((draft, index) =>
          index === activeNumber - 1 ? makeEmptyCatalogDrafts()[0] : draft
        )
      );
      setAiMessage("");
      setAiBackText("");

      setSkipAiReview((current) =>
        current.map((value, index) =>
          index === activeNumber - 1 ? false : value
        )
      );

      setSkipBackForAi((current) =>
        current.map((value, index) =>
          index === activeNumber - 1 ? false : value
        )
      );

      delete reviewedFrontsRef.current[activeNumber];
    } catch (error) {
      setCatalogMessage(
        `Card ${activeNumber} could not be saved: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSavingCard(false);
    }
  }

  return (
    <main className="workbench-page">
      <style>{`
        :root {
          --brass: #c79a46;
          --brass-light: #efd58d;
          --green: #173f31;
          --paper: #f3e6c8;
          --paper-light: #fffaf0;
          --ink: #2f1d13;
          --burgundy: #6f2c26;
        }

        * { box-sizing: border-box; }
        body { margin: 0; }

        .workbench-page {
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
          max-width: 800px;
          margin: 12px auto 0;
          color: #d6be98;
          font-size: 17px;
          line-height: 1.65;
          font-style: italic;
        }

        .shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 68px;
        }

        .workbench {
          padding: 24px;
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
        }

        .plaque {
          width: min(650px, 96%);
          margin: 0 auto 22px;
          padding: 8px 16px;
          border: 2px solid #ead18c;
          background: linear-gradient(#9d7438, #5d3d1c);
          color: #ffe8ae;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .setup-panel,
        .review-panel {
          padding: 20px;
          border: 1px solid #b98a3d;
          background: linear-gradient(145deg, #f7edd9, #d9c39e);
          color: var(--ink);
          box-shadow: 0 14px 26px rgba(0,0,0,.3);
        }

        .setup-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
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

        .field input,
        .field select {
          width: 100%;
          min-height: 44px;
          padding: 10px 11px;
          border: 1px solid #99713a;
          background: #fffaf0;
          color: #302015;
          font: inherit;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 16px;
        }

        .setup-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .button {
          min-height: 43px;
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

        .button:disabled {
          opacity: .6;
          cursor: wait;
        }

        .message {
          margin: 0;
          color: #64482d;
          font-style: italic;
        }

        .pair-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin: 20px 0;
        }

        .pair-tab {
          min-height: 52px;
          border: 1px solid #a77c3d;
          background: #f8ead0;
          color: #5b351d;
          font: inherit;
          font-weight: bold;
          cursor: pointer;
        }

        .pair-tab.active {
          color: #f5e1ac;
          background: linear-gradient(#245242, #123329);
        }

        .pair-tab.ready::after {
          content: " ✓";
        }

        .review-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .side-card {
          padding: 16px;
          border: 1px solid #a77c3d;
          background: rgba(255,250,240,.58);
        }

        .side-card h2 {
          margin: 0 0 13px;
          color: #5c331d;
          font-size: 22px;
          font-weight: normal;
        }

        .preview {
          min-height: 390px;
          display: grid;
          place-items: center;
          overflow: visible;
          padding: 28px;
          border: 7px solid #f5ecd8;
          outline: 2px solid #9c7c47;
          background: #d8c7a8;
          color: #70583e;
          text-align: center;
          font-style: italic;
        }

        .preview img {
          max-width: 88%;
          max-height: 310px;
          object-fit: contain;
          transform-origin: center center;
          transition: transform .25s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,.3);
        }

        .side-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .edit-controls {
          margin-top: 8px;
          padding: 8px 10px;
          border: 1px solid rgba(126,87,40,.38);
          background: rgba(255,255,255,.42);
        }

        .angle-row {
          display: grid;
          grid-template-columns: 1fr 88px;
          gap: 8px;
          align-items: center;
          margin-bottom: 6px;
        }

        .angle-row label {
          font-size: 12px;
        }

        .angle-row input[type="range"] {
          width: 100%;
          height: 18px;
        }

        .angle-row .button {
          min-height: 34px;
          padding: 6px 10px;
        }

        .trim-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 5px;
        }

        .trim-grid label {
          display: grid;
          gap: 2px;
          color: #60411f;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .trim-grid input {
          width: 100%;
          min-height: 30px;
          padding: 3px 5px;
          border: 1px solid #99713a;
          background: #fffaf0;
          font: inherit;
          font-size: 13px;
        }

        .trim-warning {
          margin: 10px 0 0;
          color: #7b2d25;
          font-size: 13px;
          font-weight: bold;
          line-height: 1.45;
        }

        .catalog-panel {
          margin-top: 20px;
          padding: 20px;
          border: 2px solid #c79a46;
          background: linear-gradient(145deg, #fffaf0, #ead8b4);
          color: var(--ink);
          box-shadow: 0 14px 26px rgba(0,0,0,.25);
        }

        .catalog-panel h2 {
          margin: 0 0 8px;
          color: #5b351d;
          font-size: 26px;
          font-weight: normal;
        }

        .catalog-panel p {
          color: #66503b;
          line-height: 1.55;
        }

        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 16px;
        }

        .catalog-grid .field.full {
          grid-column: 1 / -1;
        }

        .catalog-grid textarea {
          width: 100%;
          min-height: 110px;
          padding: 10px 11px;
          border: 1px solid #99713a;
          background: #fffaf0;
          color: #302015;
          font: inherit;
          resize: vertical;
        }

        .ai-assistant {
          margin-top: 18px;
          padding: 17px;
          border: 1px solid #8f6a31;
          background:
            radial-gradient(circle at 10% 0%, rgba(215,171,84,.18), transparent 30%),
            linear-gradient(145deg, #f8edcf, #e2c897);
        }

        .ai-assistant h3 {
          margin: 0;
          color: #57351e;
          font-size: 21px;
          font-weight: normal;
        }

        .ai-assistant p {
          margin: 7px 0 0;
        }

        .ai-options {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 13px;
        }

        .ai-options label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #51371f;
          font-weight: bold;
        }

        .ai-back-text {
          margin-top: 13px;
          padding: 12px;
          border: 1px dashed #98713b;
          background: rgba(255,250,240,.72);
          color: #4d3727;
          white-space: pre-wrap;
          line-height: 1.55;
        }

        .catalog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .catalog-message {
          margin: 15px 0 0;
          padding: 11px 13px;
          border: 1px solid #a77d3b;
          background: #fff6df;
          color: #4b321f;
          font-weight: bold;
          line-height: 1.45;
        }

        .duplicate-warning {
          margin-top: 16px;
          padding: 14px 16px;
          border: 2px solid #9b2f23;
          background: #fff0e7;
          color: #5a2119;
          line-height: 1.5;
        }

        .duplicate-warning strong {
          display: block;
          margin-bottom: 5px;
          font-size: 18px;
        }

        .duplicate-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .publish-summary {
          margin-top: 16px;
          padding: 14px 16px;
          border: 1px solid #9c763d;
          background: rgba(255,250,240,.72);
          color: #4b321f;
        }

        .publish-summary h3 {
          margin: 0 0 8px;
          color: #57351e;
          font-size: 18px;
          font-weight: normal;
        }

        .publish-status-line {
          margin: 4px 0;
          font-weight: bold;
        }

        .publish-status-line.published {
          color: #175335;
        }

        .publish-status-line.draft {
          color: #74501e;
        }

        .notice {
          margin-top: 18px;
          padding: 14px 16px;
          border-left: 5px solid #8c6128;
          background: rgba(255,250,240,.56);
          color: #614b37;
          line-height: 1.6;
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

        @media (max-width: 850px) {
          .setup-grid,
          .settings-grid,
          .review-grid {
            grid-template-columns: 1fr;
          }

          .trim-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .catalog-grid {
            grid-template-columns: 1fr;
          }

          .catalog-grid .field.full {
            grid-column: auto;
          }

          .pair-tabs {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .workbench {
            padding: 14px;
          }

          .preview {
            min-height: 330px;
            padding: 20px;
          }

          .preview img {
            max-height: 270px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
            <Link href="/">← Museum Entrance</Link>
            <Link href="/dashboard">Curator&apos;s Office</Link>
          </div>
          <div className="private-label">Private Image Preparation Room</div>
          <Link href="/dashboard/add-postcard">Catalog a New Postcard</Link>
        </div>
      </header>

      <section className="hero">
        <div className="seal">VPM</div>
        <p className="hero-kicker">Curator&apos;s Office</p>
        <h1>Three-Card Quick Review Desk</h1>
        <p className="hero-description">
          Scan three fronts and three matching backs, keep every pair together,
          then quickly crop and fine-straighten each side before cataloging.
        </p>
      </section>

      <section className="shell">
        <div className="workbench">
          <div className="plaque">Three-Postcard Quick Preparation Desk</div>

          <section className="setup-panel">
            <div className="setup-grid">
              <div className="field">
                <label htmlFor="front-scan">Full Front Scan</label>
                <input
                  id="front-scan"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFile("front", event)}
                />
              </div>

              <div className="field">
                <label htmlFor="back-scan">Matching Full Back Scan</label>
                <input
                  id="back-scan"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFile("back", event)}
                />
              </div>
            </div>

            <div className="settings-grid">
              <div className="field">
                <label htmlFor="layout">Scanner Arrangement</label>
                <select
                  id="layout"
                  value={layout}
                  onChange={(event) =>
                    setLayout(event.target.value as LayoutMode)
                  }
                >
                  <option value="single">Single Card</option>
                  <option value="3x1">3 Across × 1 Down</option>
                  <option value="1x3">1 Across × 3 Down</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="margin">Outer Margin Percentage</label>
                <input
                  id="margin"
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  value={marginPercent}
                  onChange={(event) =>
                    setMarginPercent(Number(event.target.value))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="gutter">Space Between Cards Percentage</label>
                <input
                  id="gutter"
                  type="number"
                  min="0"
                  max="15"
                  step="0.5"
                  value={gutterPercent}
                  onChange={(event) =>
                    setGutterPercent(Number(event.target.value))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="safety-padding">White Safety Border After Crop</label>
                <input
                  id="safety-padding"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={safetyPaddingPercent}
                  onChange={(event) =>
                    setSafetyPaddingPercent(Number(event.target.value))
                  }
                />
              </div>
            </div>

            <div className="setup-actions">
              <p className="message">{message}</p>

              <div>
                <button
                  className="button secondary"
                  type="button"
                  onClick={clearWorkbench}
                >
                  Clear Workbench
                </button>{" "}
                <button
                  className="button"
                  type="button"
                  onClick={processScans}
                  disabled={processing}
                >
                  {processing
                    ? layout === "single"
                      ? "Preparing Card..."
                      : "Separating Postcards..."
                    : layout === "single"
                    ? "Prepare Single Card"
                    : "Separate Three Postcards"}
                </button>
              </div>
            </div>
          </section>

          <div
            className="pair-tabs"
            style={{
              gridTemplateColumns:
                layout === "single"
                  ? "1fr"
                  : "repeat(3, minmax(0, 1fr))",
            }}
          >
            {pairs
              .filter((pair) => layout !== "single" || pair.number === 1)
              .map((pair) => (
              <button
                className={`pair-tab ${
                  pair.number === activeNumber ? "active" : ""
                } ${pair.front || pair.back ? "ready" : ""}`}
                type="button"
                key={pair.number}
                onClick={() => setActiveNumber(pair.number)}
              >
                Card {pair.number}
              </button>
            ))}
          </div>

          <section className="review-panel">
            <div className="review-grid">
              <article className="side-card">
                <h2>Card {activePair.number} — Front</h2>
                <div className="preview">
                  {activePair.front ? (
                    <img
                      src={activePair.front}
                      alt={`Postcard ${activePair.number} front crop`}
                      style={{
                        transform: `rotate(${
                          activePair.frontRotation +
                          activePair.frontFineAngle
                        }deg) scale(${
                          activePair.frontRotation % 180 === 90 ? 0.72 : 1
                        })`,
                        clipPath: `inset(${activePair.frontTrim.top}% ${activePair.frontTrim.right}% ${activePair.frontTrim.bottom}% ${activePair.frontTrim.left}%)`,
                      }}
                    />
                  ) : (
                    "The front crop will appear here."
                  )}
                </div>

                <div className="side-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => rotate("front")}
                    disabled={!activePair.front}
                  >
                    Rotate Front 90°
                  </button>

                  <button
                    className="button secondary"
                    type="button"
                    disabled={!activePair.front}
                    onClick={() =>
                      activePair.front &&
                      downloadImage(
                        activePair.front,
                        `postcard-${activePair.number}-front.jpg`
                      )
                    }
                  >
                    Download Front Crop
                  </button>
                </div>

                <div className="edit-controls">
                  <div className="angle-row">
                    <label>
                      Fine Straighten: {activePair.frontFineAngle.toFixed(1)}°
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={activePair.frontFineAngle}
                        onChange={(event) =>
                          updateFineAngle("front", Number(event.target.value))
                        }
                      />
                    </label>

                    <button
                      className="button"
                      type="button"
                      disabled={!activePair.front || applying}
                      onClick={() => applyEdit("front")}
                    >
                      Apply Front
                    </button>
                  </div>

                  <div className="trim-grid">
                    {(["left", "right", "top", "bottom"] as const).map(
                      (edge) => (
                        <label key={edge}>
                          {edge} %
                          <input
                            type="number"
                            min="0"
                            max="45"
                            step="0.5"
                            value={activePair.frontTrim[edge]}
                            onChange={(event) =>
                              updateTrim(
                                "front",
                                edge,
                                Number(event.target.value)
                              )
                            }
                          />
                        </label>
                      )
                    )}
                  </div>

                  {(activePair.frontTrim.left > 15 ||
                    activePair.frontTrim.right > 15 ||
                    activePair.frontTrim.top > 15 ||
                    activePair.frontTrim.bottom > 15 ||
                    activePair.frontTrim.left + activePair.frontTrim.right > 30 ||
                    activePair.frontTrim.top + activePair.frontTrim.bottom > 30) && (
                    <p className="trim-warning">
                      Large trim detected. Reduce the percentages if any postcard edge or writing disappears.
                    </p>
                  )}
                </div>
              </article>

              <article className="side-card">
                <h2>Card {activePair.number} — Back</h2>
                <div className="preview">
                  {activePair.back ? (
                    <img
                      src={activePair.back}
                      alt={`Postcard ${activePair.number} back crop`}
                      style={{
                        transform: `rotate(${
                          activePair.backRotation +
                          activePair.backFineAngle
                        }deg) scale(${
                          activePair.backRotation % 180 === 90 ? 0.72 : 1
                        })`,
                        clipPath: `inset(${activePair.backTrim.top}% ${activePair.backTrim.right}% ${activePair.backTrim.bottom}% ${activePair.backTrim.left}%)`,
                      }}
                    />
                  ) : (
                    "The matching back crop will appear here."
                  )}
                </div>

                <div className="side-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => rotate("back")}
                    disabled={!activePair.back}
                  >
                    Rotate Back 90°
                  </button>

                  <button
                    className="button secondary"
                    type="button"
                    disabled={!activePair.back}
                    onClick={() =>
                      activePair.back &&
                      downloadImage(
                        activePair.back,
                        `postcard-${activePair.number}-back.jpg`
                      )
                    }
                  >
                    Download Back Crop
                  </button>
                </div>

                <div className="edit-controls">
                  <div className="angle-row">
                    <label>
                      Fine Straighten: {activePair.backFineAngle.toFixed(1)}°
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.1"
                        value={activePair.backFineAngle}
                        onChange={(event) =>
                          updateFineAngle("back", Number(event.target.value))
                        }
                      />
                    </label>

                    <button
                      className="button"
                      type="button"
                      disabled={!activePair.back || applying}
                      onClick={() => applyEdit("back")}
                    >
                      Apply Back
                    </button>
                  </div>

                  <div className="trim-grid">
                    {(["left", "right", "top", "bottom"] as const).map(
                      (edge) => (
                        <label key={edge}>
                          {edge} %
                          <input
                            type="number"
                            min="0"
                            max="45"
                            step="0.5"
                            value={activePair.backTrim[edge]}
                            onChange={(event) =>
                              updateTrim(
                                "back",
                                edge,
                                Number(event.target.value)
                              )
                            }
                          />
                        </label>
                      )
                    )}
                  </div>

                  {(activePair.backTrim.left > 15 ||
                    activePair.backTrim.right > 15 ||
                    activePair.backTrim.top > 15 ||
                    activePair.backTrim.bottom > 15 ||
                    activePair.backTrim.left + activePair.backTrim.right > 30 ||
                    activePair.backTrim.top + activePair.backTrim.bottom > 30) && (
                    <p className="trim-warning">
                      Large trim detected. Reduce the percentages if any postcard edge or writing disappears.
                    </p>
                  )}
                </div>
              </article>
            </div>

            <div className="setup-actions" style={{ marginTop: "18px" }}>
              <p className="message">
                Review Card {activeNumber}, then continue to the next pair.
              </p>

              <button
                className="button secondary"
                type="button"
                onClick={resetActiveControls}
              >
                Reset Card {activeNumber} Controls
              </button>
            </div>

            <section className="catalog-panel">
              <h2>Catalog Card {activeNumber}</h2>
              <p>
                After the front and back look correct, enter the basic museum
                information here. The prepared crops will be uploaded directly
                with this postcard record.
              </p>

              <div className="ai-assistant">
                <h3>AI Catalog Assistant</h3>
                <p>
                  AI reviews the prepared postcard automatically and suggests
                  the title, location, date, gallery, landmark, and museum
                  description. Use the options below only when you want to skip
                  AI review or skip reading the back. Nothing is saved automatically.
                </p>

                <div className="ai-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={activeSkipAiReview}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setSkipAiReview((current) =>
                          current.map((value, index) =>
                            index === activeNumber - 1 ? checked : value
                          )
                        );

                        if (!checked) {
                          delete reviewedFrontsRef.current[activeNumber];
                        }
                      }}
                    />
                    Don&apos;t AI Review This Card
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={activeSkipBackForAi}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setSkipBackForAi((current) =>
                          current.map((value, index) =>
                            index === activeNumber - 1 ? checked : value
                          )
                        );

                        delete reviewedFrontsRef.current[activeNumber];
                      }}
                    />
                    Don&apos;t Read Back for This Card
                  </label>

                  <button
                    className="button"
                    type="button"
                    disabled={
                      aiAnalyzing || !activePair.front || activeSkipAiReview
                    }
                    onClick={() => {
                      delete reviewedFrontsRef.current[activeNumber];
                      void analyzeCardWithAi(activeNumber);
                    }}
                  >
                    {aiAnalyzing
                      ? "AI Reviewing Card..."
                      : `Review Card ${activeNumber} Again`}
                  </button>
                </div>

                {aiMessage && (
                  <p className="catalog-message" role="status">
                    {aiMessage}
                  </p>
                )}

                {aiBackText && (
                  <div className="ai-back-text">
                    <strong>AI reading of postcard back:</strong>
                    <br />
                    {aiBackText}
                  </div>
                )}
              </div>

              <div className="catalog-grid">
                <div className="field full">
                  <label htmlFor={`title-${activeNumber}`}>Postcard Title</label>
                  <input
                    id={`title-${activeNumber}`}
                    value={activeCatalog.title}
                    onChange={(event) =>
                      updateCatalogField("title", event.target.value)
                    }
                    placeholder="Example: The San Juan Hotel and Bar"
                  />
                </div>

                <div className="field">
                  <label htmlFor={`country-${activeNumber}`}>Country</label>
                  <input
                    id={`country-${activeNumber}`}
                    value={activeCatalog.country}
                    onChange={(event) =>
                      updateCatalogField("country", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor={`state-${activeNumber}`}>State</label>
                  <input
                    id={`state-${activeNumber}`}
                    value={activeCatalog.state}
                    onChange={(event) =>
                      updateCatalogField("state", event.target.value)
                    }
                    placeholder="Florida"
                  />
                </div>

                <div className="field">
                  <label htmlFor={`city-${activeNumber}`}>City</label>
                  <input
                    id={`city-${activeNumber}`}
                    value={activeCatalog.city}
                    onChange={(event) =>
                      updateCatalogField("city", event.target.value)
                    }
                    placeholder="Miami"
                  />
                </div>

                <div className="field">
                  <label htmlFor={`landmark-${activeNumber}`}>
                    Landmark / Subject
                  </label>
                  <input
                    id={`landmark-${activeNumber}`}
                    value={activeCatalog.landmark}
                    onChange={(event) =>
                      updateCatalogField("landmark", event.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor={`date-${activeNumber}`}>
                    Date / Approximate Date
                  </label>
                  <input
                    id={`date-${activeNumber}`}
                    value={activeCatalog.postcardDate}
                    onChange={(event) =>
                      updateCatalogField("postcardDate", event.target.value)
                    }
                    placeholder="c. 1940"
                  />
                </div>

                <div className="field">
                  <label htmlFor={`gallery-${activeNumber}`}>Gallery</label>
                  <select
                    id={`gallery-${activeNumber}`}
                    value={activeCatalog.gallery}
                    onChange={(event) =>
                      updateCatalogField("gallery", event.target.value)
                    }
                  >
                    <option value="">Select gallery</option>
                    <option>Florida Gallery</option>
                    <option>California Gallery</option>
                    <option>Holiday Gallery</option>
                    <option>Humor Gallery</option>
                    <option>Grand Gallery</option>
                    <option>History of Postcards</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor={`rotation-${activeNumber}`}>
                    Permanent Display Rotation
                  </label>
                  <select
                    id={`rotation-${activeNumber}`}
                    value={activeCatalog.displayRotation}
                    onChange={(event) =>
                      updateCatalogField(
                        "displayRotation",
                        Number(event.target.value)
                      )
                    }
                  >
                    <option value={0}>Automatic / No Rotation</option>
                    <option value={90}>Rotate 90° Clockwise</option>
                    <option value={180}>Rotate 180°</option>
                    <option value={270}>Rotate 90° Counterclockwise</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor={`night-display-${activeNumber}`}>
                    Night Display
                  </label>
                  <select
                    id={`night-display-${activeNumber}`}
                    value={activeCatalog.nightDisplay}
                    onChange={(event) =>
                      updateCatalogField(
                        "nightDisplay",
                        event.target.value as CatalogDraft["nightDisplay"]
                      )
                    }
                  >
                    <option value="off">Off — Normal Daytime Display</option>
                    <option value="subtle">
                      Subtle Night — Moonlight &amp; Soft Glow
                    </option>
                    <option value="neon">
                      Neon Night — Strong Sign &amp; City Glow
                    </option>
                  </select>
                </div>

                <div className="field full">
                  <label htmlFor={`description-${activeNumber}`}>
                    Museum Description
                  </label>
                  <textarea
                    id={`description-${activeNumber}`}
                    value={activeCatalog.description}
                    onChange={(event) =>
                      updateCatalogField("description", event.target.value)
                    }
                    placeholder="Optional description or historical note."
                  />
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "bold",
                    color: "#53371f",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={activeCatalog.featured}
                    onChange={(event) =>
                      updateCatalogField("featured", event.target.checked)
                    }
                  />
                  Mark as Featured Postcard
                </label>
              </div>

              {activeDuplicateChecking && (
                <div className="catalog-message" role="status">
                  Checking Card {activeNumber} against the curator database for
                  possible duplicates...
                </div>
              )}

              {activeDuplicateMatch && (
                <div className="duplicate-warning">
                  <strong>
                    ⚠{" "}
                    {activeDuplicateMatch.confidence === "strong"
                      ? "Likely Duplicate Found"
                      : "Possible Duplicate Found"}
                  </strong>

                  <div>
                    Card {activeNumber} may match VPM{" "}
                    {String(activeDuplicateMatch.id).padStart(4, "0")} —{" "}
                    {activeDuplicateMatch.title}
                  </div>

                  <div style={{ marginTop: "5px", fontSize: "13px" }}>
                    Image similarity:{" "}
                    {Math.round(activeDuplicateMatch.imageSimilarity * 100)}%
                    {" · "}
                    Catalog similarity:{" "}
                    {Math.round(activeDuplicateMatch.metadataScore * 100)}%
                  </div>

                  <div className="duplicate-actions">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        setAllowDuplicatePublish((current) =>
                          current.map((value, index) =>
                            index === activeNumber - 1 ? true : value
                          )
                        )
                      }
                    >
                      I Checked It — Allow Publish Anyway
                    </button>

                    <button
                      className="button"
                      type="button"
                      onClick={() =>
                        void checkCardForDuplicate(activeNumber, activeCatalog)
                      }
                    >
                      Check Again
                    </button>
                  </div>

                  {activeAllowDuplicatePublish && (
                    <div style={{ marginTop: "9px", fontWeight: "bold" }}>
                      Override enabled for Card {activeNumber}. You may publish
                      it if this is intentionally a second copy.
                    </div>
                  )}
                </div>
              )}

              <div className="catalog-actions">
                <button
                  className="button secondary"
                  type="button"
                  disabled={savingCard}
                  onClick={() => void saveActiveCard("Draft")}
                >
                  {savingCard ? "Saving..." : "Save Card as Draft"}
                </button>

                <button
                  className="button"
                  type="button"
                  disabled={savingCard}
                  onClick={() => void saveActiveCard("Published")}
                >
                  {savingCard ? "Publishing..." : "Publish Card to Museum"}
                </button>
              </div>

              {catalogMessage && (
                <p className="catalog-message" role="status">
                  {catalogMessage}
                </p>
              )}

              <div className="publish-summary">
                <h3>This Scan Batch</h3>
                {publishStatuses
                  .filter((_, index) => layout !== "single" || index === 0)
                  .map((entry, index) => (
                    <div
                      key={index}
                      className={`publish-status-line ${entry.state}`}
                    >
                      {entry.message}
                    </div>
                  ))}
              </div>
            </section>

            <div className="notice">
              Use Single Card when only one postcard is on the scanner bed.
              Use one of the three-card arrangements only when three postcards
              are scanned together. The workbench keeps front-and-back pairing,
              limits excessive trimming, and adds a white safety border after
              every applied crop. Nothing is changed permanently until you click
              Apply Front or Apply Back.
            </div>
          </section>
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