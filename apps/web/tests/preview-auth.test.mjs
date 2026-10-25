import test from "node:test";
import assert from "node:assert/strict";
import {
  createPreviewSession,
  validPreviewSession,
  previewSessionSeconds,
} from "../src/lib/preview-auth.ts";
const password = "fixture-only-preview-password";
test("preview sessions expire and are invalidated by password changes", () => {
  const now = Date.now();
  const token = createPreviewSession(password, now);
  assert.equal(validPreviewSession(token, password, now), true);
  assert.equal(
    validPreviewSession(token, "a-different-fixture-password", now),
    false,
  );
  assert.equal(
    validPreviewSession(token, password, now + previewSessionSeconds * 1000),
    false,
  );
});
test("modified and malformed session tokens are rejected", () => {
  const token = createPreviewSession(password);
  for (const bad of [
    undefined,
    "",
    token + "x",
    token.slice(0, -1) + (token.endsWith("a") ? "b" : "a"),
    "9999999999.unsigned.signature",
  ]) {
    assert.equal(validPreviewSession(bad, password), false);
  }
});
