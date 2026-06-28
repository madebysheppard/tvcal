import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Streaming Guide",
    short_name: "Streaming Guide",
    description: "What's new to watch today and this week, across your streaming platforms.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0b0a",
    theme_color: "#0c0b0a",
  };
}
