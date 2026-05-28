export function formatYoutubeUrl(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("loop", "1");
    u.searchParams.set("mute", "1");
    const videoId = u.pathname.split("/").pop() ?? "";
    if (videoId) u.searchParams.set("playlist", videoId);
    return u.toString();
  } catch {
    return url;
  }
}
