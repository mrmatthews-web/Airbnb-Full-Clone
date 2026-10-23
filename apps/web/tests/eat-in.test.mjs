import test from "node:test";
import assert from "node:assert/strict";
import {
  cooks,
  quote,
  shoppingList,
  availableDates,
  validateBooking,
} from "../src/lib/eat-in.ts";

const today = new Date(2026, 9, 23, 12);
const cook = cooks[0];
const menu = cook.menus[0];
const date = availableDates(cook, [], today)[0];
const input = {
  service: "prep",
  date,
  time: "18:00",
  diners: 4,
  signature: "Demo Guest",
  accepted: true,
};

test("quotes show AUD service costs, dining supplement and a 10% fee, excluding groceries", () => {
  assert.deepEqual(quote(menu, 4, "prep"), {
    foodService: 220,
    dining: 0,
    fee: 22,
    total: 242,
  });
  assert.deepEqual(quote(menu, 4, "dining"), {
    foodService: 220,
    dining: 80,
    fee: 30,
    total: 330,
  });
});
test("shopping quantities scale with diner count without modifying the menu", () => {
  const original = structuredClone(menu.ingredients);
  const list = shoppingList(menu, 6);
  assert.equal(list.find((i) => i.name === "Tomatoes").quantity, 1200);
  assert.equal(list.find((i) => i.name === "Lemons").quantity, 3);
  assert.deepEqual(menu.ingredients, original);
});
test("availability respects weekly schedules and excludes today and active reservations", () => {
  const dates = availableDates(cook, [], today);
  assert.ok(dates.length > 0);
  assert.ok(
    dates.every(
      (d) =>
        d > "2026-10-23" &&
        cook.weekdays.includes(new Date(d + "T12:00:00").getDay()),
    ),
  );
  const booking = { cookId: cook.id, date, status: "confirmed" };
  assert.ok(!availableDates(cook, [booking], today).includes(date));
  assert.ok(
    !availableDates(
      cook,
      [{ ...booking, status: "completed" }],
      today,
    ).includes(date),
  );
  assert.ok(
    availableDates(cook, [{ ...booking, status: "cancelled" }], today).includes(
      date,
    ),
  );
});
test("a valid booking passes; missing consent, identity, time, unavailable date and diner limits fail", () => {
  assert.equal(validateBooking(cook, menu, input, [], today), null);
  for (const change of [
    { accepted: false },
    { signature: "" },
    { date: "2020-01-01" },
    { date: "2027-12-31" },
    { time: "03:00" },
    { diners: 1 },
    { diners: 11 },
    { diners: 2.5 },
  ]) {
    assert.ok(
      validateBooking(cook, menu, { ...input, ...change }, [], today),
      JSON.stringify(change),
    );
  }
});
test("cannot book a cook with an unsupported service, menu or occupied date", () => {
  const mei = cooks[2];
  assert.ok(
    validateBooking(
      mei,
      mei.menus[0],
      { ...input, service: "dining" },
      [],
      today,
    ),
  );
  assert.ok(validateBooking(cook, mei.menus[0], input, [], today));
  assert.ok(
    validateBooking(
      cook,
      menu,
      input,
      [{ cookId: cook.id, date, status: "confirmed" }],
      today,
    ),
  );
});
