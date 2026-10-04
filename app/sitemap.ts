import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://virtualpostcardmuseum.org";

  const pages = [
    "",
    "/collection",
    "/florida-postcard-museum",
    "/california",
    "/grand-gallery",
    "/holiday",
    "/humor",
    "/history",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}