import { tokens } from "@glasskit/tokens";

export type SpringPresetName = keyof typeof tokens.motion.spring;
export type DurationName = keyof typeof tokens.motion.duration;
export type EaseName = keyof typeof tokens.motion.ease;

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export const springs: Record<SpringPresetName, SpringConfig> = tokens.motion.spring;

export function getSpring(name: SpringPresetName = "snappy"): SpringConfig {
  return springs[name];
}

export function duration(name: DurationName): string {
  return tokens.motion.duration[name];
}

export function ease(name: EaseName): string {
  return tokens.motion.ease[name];
}

let reducedMotionOverride: boolean | null = null;

/** Force reduced motion on/off for testing and docs. `null` follows the OS. */
export function setReducedMotionOverride(value: boolean | null): void {
  reducedMotionOverride = value;
}

export function clearReducedMotionOverride(): void {
  reducedMotionOverride = null;
}

export function prefersReducedMotion(): boolean {
  if (reducedMotionOverride !== null) return reducedMotionOverride;
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Analytic damped-harmonic spring. Returns a value for an elapsed time without
 * keeping mutable state, so it can be sampled to build WAAPI keyframes.
 */
export function springValue(
  preset: SpringConfig,
  timeMs: number,
  from = 0,
  to = 1,
  velocity = 0,
): number {
  const t = Math.max(0, timeMs) / 1000;
  const k = Math.max(preset.stiffness, 0.000001);
  const m = Math.max(preset.mass, 0.000001);
  const c = Math.max(preset.damping, 0);
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const a = from - to;

  if (zeta < 1 - 0.000001) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t);
    const b = (velocity + zeta * omega0 * a) / omegaD;
    return to + decay * (a * Math.cos(omegaD * t) + b * Math.sin(omegaD * t));
  }

  if (zeta <= 1 + 0.000001) {
    const decay = Math.exp(-omega0 * t);
    const b = velocity + omega0 * a;
    return to + (a + b * t) * decay;
  }

  const root = omega0 * Math.sqrt(zeta * zeta - 1);
  const r1 = -zeta * omega0 + root;
  const r2 = -zeta * omega0 - root;
  const c1 = (velocity - r2 * a) / (r1 - r2);
  const c2 = a - c1;
  return to + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
}

export interface SpringKeyframeOptions {
  property: string;
  from?: number;
  to?: number;
  velocity?: number;
  unit?: string;
  preset?: SpringPresetName;
  config?: SpringConfig;
  durationMs?: number;
  steps?: number;
}

function keyframe(offset: number, property: string, value: number, unit: string): Keyframe {
  return { offset, [property]: `${value}${unit}` } as Keyframe;
}

/** Sample a spring into Web Animations API keyframes. */
export function springKeyframes(options: SpringKeyframeOptions): Keyframe[] {
  const {
    property,
    from = 0,
    to = 1,
    velocity = 0,
    unit = "",
    preset = "snappy",
    durationMs = 420,
  } = options;
  const steps = Math.max(2, options.steps ?? 40);
  const config = options.config ?? getSpring(preset);

  return Array.from({ length: steps + 1 }, (_, index) => {
    const offset = index / steps;
    // Pin the endpoints. A spring can overshoot at the final sample, which
    // would make the last WAAPI keyframe miss the requested target.
    const value =
      index === 0
        ? from
        : index === steps
          ? to
          : springValue(config, offset * durationMs, from, to, velocity);
    return keyframe(offset, property, value, unit);
  });
}

export interface SpringAnimationOptions extends Omit<SpringKeyframeOptions, "property"> {
  fill?: FillMode;
}

export function animateSpring(
  element: Element,
  property: string,
  options: SpringAnimationOptions = {},
): Animation {
  const durationMs = options.durationMs ?? 420;
  const unit = options.unit ?? "";
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  const frames = prefersReducedMotion()
    ? [
        keyframe(0, property, from, unit),
        keyframe(1, property, to, unit),
      ]
    : springKeyframes({ ...options, property, from, to, durationMs, unit });

  return element.animate(frames, {
    duration: prefersReducedMotion() ? 1 : durationMs,
    easing: "linear",
    fill: options.fill ?? "both",
  });
}

export interface MotionRecipe {
  preset: SpringPresetName;
  durationMs: number;
  from: Keyframe;
  to: Keyframe;
  reducedFrom: Keyframe;
  reducedTo: Keyframe;
}

export const recipes = {
  "panel-in": {
    preset: "snappy",
    durationMs: 420,
    from: { opacity: 0, transform: "translateY(8px) scale(0.985)" },
    to: { opacity: 1, transform: "none" },
    reducedFrom: { opacity: 0 },
    reducedTo: { opacity: 1 },
  },
  "panel-out": {
    preset: "gentle",
    durationMs: 260,
    from: { opacity: 1, transform: "none" },
    to: { opacity: 0, transform: "translateY(8px) scale(0.985)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 0 },
  },
  "sheet-in": {
    preset: "sheet",
    durationMs: 520,
    from: { opacity: 0, transform: "translateY(24px) scale(0.98)" },
    to: { opacity: 1, transform: "none" },
    reducedFrom: { opacity: 0 },
    reducedTo: { opacity: 1 },
  },
  "sheet-out": {
    preset: "sheet",
    durationMs: 320,
    from: { opacity: 1, transform: "none" },
    to: { opacity: 0, transform: "translateY(24px) scale(0.98)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 0 },
  },
  "popover-in": {
    preset: "snappy",
    durationMs: 320,
    from: { opacity: 0, transform: "scale(0.96)" },
    to: { opacity: 1, transform: "none" },
    reducedFrom: { opacity: 0 },
    reducedTo: { opacity: 1 },
  },
  "popover-out": {
    preset: "snappy",
    durationMs: 220,
    from: { opacity: 1, transform: "none" },
    to: { opacity: 0, transform: "scale(0.96)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 0 },
  },
  "toggle-on": {
    preset: "snappy",
    durationMs: 300,
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(16px)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 1 },
  },
  "toggle-off": {
    preset: "snappy",
    durationMs: 260,
    from: { transform: "translateX(16px)" },
    to: { transform: "translateX(0)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 1 },
  },
  "row-insert": {
    preset: "gentle",
    durationMs: 380,
    from: { opacity: 0, transform: "translateX(-8px)" },
    to: { opacity: 1, transform: "none" },
    reducedFrom: { opacity: 0 },
    reducedTo: { opacity: 1 },
  },
  "row-remove": {
    preset: "gentle",
    durationMs: 260,
    from: { opacity: 1, transform: "none" },
    to: { opacity: 0, transform: "translateX(-8px)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 0 },
  },
  "tab-switch": {
    preset: "snappy",
    durationMs: 260,
    from: { opacity: 0.6, transform: "translateY(2px)" },
    to: { opacity: 1, transform: "none" },
    reducedFrom: { opacity: 0.6 },
    reducedTo: { opacity: 1 },
  },
  "hover-lift": {
    preset: "snappy",
    durationMs: 240,
    from: { transform: "none" },
    to: { transform: "translateY(-2px)" },
    reducedFrom: { opacity: 1 },
    reducedTo: { opacity: 1 },
  },
} satisfies Record<string, MotionRecipe>;

export type RecipeName = keyof typeof recipes;

export function recipeOptions(
  name: RecipeName,
  overrides: Partial<KeyframeAnimationOptions> = {},
): KeyframeAnimationOptions {
  const recipe = recipes[name];
  return {
    duration: prefersReducedMotion() ? 1 : recipe.durationMs,
    easing: "linear",
    fill: "both",
    ...overrides,
  };
}

export function animateRecipe(
  element: Element,
  name: RecipeName,
  keyframes?: Keyframe[],
  overrides: Partial<KeyframeAnimationOptions> = {},
): Animation {
  const recipe = recipes[name];
  const reduced = prefersReducedMotion();
  const frames = keyframes ?? [
    reduced ? recipe.reducedFrom : recipe.from,
    reduced ? recipe.reducedTo : recipe.to,
  ];
  return element.animate(frames, recipeOptions(name, overrides));
}
