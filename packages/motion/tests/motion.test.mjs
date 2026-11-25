import assert from "node:assert/strict";
import test from "node:test";
import {
  springValue,
  springs,
  springKeyframes,
  prefersReducedMotion,
  setReducedMotionOverride,
  clearReducedMotionOverride,
  recipes,
} from "../dist/index.js";

test("spring starts at the initial value and settles at the target", () => {
  const config = springs.snappy;
  assert.equal(springValue(config, 0, 0, 1), 0);
  assert.ok(Math.abs(springValue(config, 2000, 0, 1) - 1) < 0.0001);
});

test("spring handles under, critical, and over damping without NaN", () => {
  const cases = [
    { stiffness: 300, damping: 20, mass: 1 },
    { stiffness: 300, damping: 34.641, mass: 1 },
    { stiffness: 300, damping: 80, mass: 1 },
  ];

  for (const config of cases) {
    for (const t of [0, 16, 120, 600, 2000]) {
      const value = springValue(config, t, -1, 1, 0.5);
      assert.equal(Number.isFinite(value), true);
    }
  }
});

test("spring keyframes cover a full 0 to 1 timeline", () => {
  const frames = springKeyframes({ property: "--x", from: 10, to: 20, steps: 10 });
  assert.equal(frames.length, 11);
  assert.equal(frames[0].offset, 0);
  assert.equal(frames.at(-1).offset, 1);
  assert.equal(frames[0]["--x"], "10");
  assert.equal(frames.at(-1)["--x"], "20");
});

test("reduced motion can be overridden for docs and tests", () => {
  clearReducedMotionOverride();
  assert.equal(prefersReducedMotion(), false);
  setReducedMotionOverride(true);
  assert.equal(prefersReducedMotion(), true);
  setReducedMotionOverride(false);
  assert.equal(prefersReducedMotion(), false);
  clearReducedMotionOverride();
});

test("stateful recipes snap to their final state under reduced motion", () => {
  for (const name of ["toggle-on", "toggle-off", "hover-lift"]) {
    const recipe = recipes[name];
    assert.deepEqual(recipe.reducedFrom, recipe.to);
    assert.deepEqual(recipe.reducedTo, recipe.to);
  }
});
