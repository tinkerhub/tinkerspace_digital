// No browser API distinguishes a laptop from a desktop tower — mobile and
// smart TV platforms self-identify in the user agent, but the laptop/desktop
// split below is a best-effort guess from screen resolution + pixel ratio.
export function classifyDevice({ userAgent = '', width = 0, devicePixelRatio = 1 } = {}) {
  if (/SmartTV|Tizen|WebOS|CrKey|AFTB|AFTS|AFTT|GoogleTV|HbbTV|VIDAA|NetCast|BRAVIA|RokuOS/i.test(userAgent)) {
    return 'tv';
  }
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'mobile';
  }
  if (!width) return 'unknown';
  if (devicePixelRatio >= 2) return 'laptop'; // HiDPI panels are overwhelmingly built-in
  return width >= 1920 ? 'desktop' : 'laptop';
}
