import test from "node:test";
import assert from "node:assert/strict";

import { normalizeInvestmentSectionKey } from "../web/investment-route.mjs";

test("normalizeInvestmentSectionKey maps Turkish route names", () => {
  assert.equal(normalizeInvestmentSectionKey("altin"), "gold");
  assert.equal(normalizeInvestmentSectionKey("doviz"), "fx");
  assert.equal(normalizeInvestmentSectionKey("borsa"), "stock");
  assert.equal(normalizeInvestmentSectionKey("fon"), "fund");
  assert.equal(normalizeInvestmentSectionKey("mevduat"), "silver");
  assert.equal(normalizeInvestmentSectionKey("gumus"), "silver");
});

test("normalizeInvestmentSectionKey keeps internal keys stable", () => {
  assert.equal(normalizeInvestmentSectionKey("gold"), "gold");
  assert.equal(normalizeInvestmentSectionKey("fx"), "fx");
  assert.equal(normalizeInvestmentSectionKey("stock"), "stock");
  assert.equal(normalizeInvestmentSectionKey("fund"), "fund");
  assert.equal(normalizeInvestmentSectionKey("silver"), "silver");
});

test("normalizeInvestmentSectionKey returns empty string for unknown values", () => {
  assert.equal(normalizeInvestmentSectionKey(""), "");
  assert.equal(normalizeInvestmentSectionKey("kripto"), "");
  assert.equal(normalizeInvestmentSectionKey(null), "");
});
