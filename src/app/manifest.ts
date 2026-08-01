import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "สิทธิไปต่อ",
    short_name: "สิทธิไปต่อ",
    description: "ผู้ช่วยก่อนร้องเรียนที่ทำงานในโหมดพื้นฐานได้แม้ไม่มีอินเทอร์เน็ต",
    start_url: "./",
    scope: "./",
    display: "standalone",
    background_color: "#f4f7f5",
    theme_color: "#102c3d",
    lang: "th",
    icons: [
      {
        src: "./rightpath-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
