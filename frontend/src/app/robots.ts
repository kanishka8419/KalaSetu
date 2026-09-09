import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/upload/", "/my-products/", "/enquiries/", "/admin/", "/profile/"],
      },
    ],
    sitemap: "https://kalasetu.com/sitemap.xml",
  };
}
