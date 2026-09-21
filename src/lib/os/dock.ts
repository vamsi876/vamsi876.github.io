/**
 * Compute the dock magnification scale factor for an icon at a given distance
 * from the cursor. Uses a cosine falloff curve.
 *
 * @param distPx - distance in pixels from cursor to icon center
 * @param opts.max - maximum scale at distance 0 (default 1.5)
 * @param opts.radius - influence radius in pixels (default 96)
 * @returns scale factor ≥ 1
 */
export function magnify(
  distPx: number,
  opts: { max?: number; radius?: number } = {},
): number {
  const max = opts.max ?? 1.5;
  const radius = opts.radius ?? 96;
  if (distPx >= radius) return 1;
  return 1 + (max - 1) * Math.cos((Math.PI * distPx) / (2 * radius));
}
