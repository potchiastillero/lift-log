import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lift Log",
    short_name: "Lift Log",
    description: "A minimal workout logging app built for fast daily use during workouts.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1018",
    theme_color: "#ff3c00",
    orientation: "portrait",
    categories: ["health", "fitness", "productivity"],
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png"
      },
      {
        src: "/icons/apple",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
