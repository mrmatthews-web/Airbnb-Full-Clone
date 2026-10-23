"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Download,
  Heart,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShoppingBasket,
  Utensils,
  X,
} from "lucide-react";
import {
  availableDates,
  cooks,
  money,
  prettyDate,
  quote,
  serviceLabels,
  shoppingList,
  termsVersion,
  validateBooking,
  type Cook,
  type DemoBooking,
  type Service,
} from "@/lib/eat-in";

const storageKey = "eat-in-demo-v1";
type View = "discover" | "bookings" | "cook";
type StoredState = { bookings: DemoBooking[]; saved: string[] };
function readDemo(): StoredState {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      bookings: Array.isArray(value.bookings)
        ? value.bookings.filter((b: DemoBooking) => {
            const cook = cooks.find((c) => c.id === b.cookId);
            return (
              cook?.menus.some((m) => m.id === b.menuId) &&
              cook.services.includes(b.service) &&
              typeof b.id === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
              ["confirmed", "completed", "cancelled"].includes(b.status) &&
              Number.isInteger(b.diners) &&
              b.diners >= 2 &&
              b.diners <= cook.maxDiners &&
              typeof b.signature === "string" &&
              typeof b.total === "number"
            );
          })
        : [],
      saved: Array.isArray(value.saved)
        ? value.saved.filter((id: string) => cooks.some((c) => c.id === id))
        : [],
    };
  } catch {
    return { bookings: [], saved: [] };
  }
}

export default function EatIn() {
  const [view, setView] = useState<View>("discover");
  const [city, setCity] = useState("All Tasmania");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [cuisine, setCuisine] = useState("All food");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Cook | null>(null);
  const [bookings, setBookings] = useState<DemoBooking[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [cookId, setCookId] = useState(cooks[0].id);

  useEffect(() => {
    const state = readDemo();
    // Hydrate browser-only prototype data after the server-rendered page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookings(state.bookings);
    setSaved(state.saved);
    setReady(true);
    const sync = () => {
      const next = readDemo();
      setBookings(next.bookings);
      setSaved(next.saved);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function persist(nextBookings: DemoBooking[], nextSaved = saved) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ bookings: nextBookings, saved: nextSaved }),
      );
      setBookings(nextBookings);
      setSaved(nextSaved);
      return true;
    } catch {
      setNotice(
        "Your browser could not save this demo. Allow local storage and try again.",
      );
      return false;
    }
  }
  function toggleSaved(id: string) {
    persist(
      bookings,
      saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id],
    );
  }
  function navigate(next: View) {
    setView(next);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateBooking(id: string, change: Partial<DemoBooking>) {
    const current = readDemo().bookings;
    persist(current.map((b) => (b.id === id ? { ...b, ...change } : b)));
  }
  const filtered = cooks.filter(
    (c) =>
      (city === "All Tasmania" || c.city === city) &&
      (serviceFilter === "all" ||
        c.services.includes(serviceFilter as Service)) &&
      (cuisine === "All food" || c.cuisine === cuisine) &&
      (!savedOnly || saved.includes(c.id)),
  );

  return (
    <div className="eat-in">
      <div className="demo-strip">
        <span className="status-dot" /> A taste of what’s coming{" "}
        <span className="strip-divider">/</span> Private prototype · Sample
        cooks · No real payments
      </div>
      <header className="site-header">
        <button
          className="wordmark"
          aria-label="Eat In home"
          onClick={() => navigate("discover")}
        >
          <Utensils size={28} strokeWidth={1.6} />
          eat in<span className="brand-dot">.</span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={view === "discover" ? "nav-active" : ""}
            onClick={() => navigate("discover")}
          >
            Find a cook
          </button>
          <button
            className={view === "bookings" ? "nav-active" : ""}
            onClick={() => navigate("bookings")}
          >
            My bookings
            {bookings.length > 0 && (
              <span className="count">{bookings.length}</span>
            )}
          </button>
        </nav>
        <button
          className={`cook-link ${view === "cook" ? "nav-active" : ""}`}
          onClick={() => navigate("cook")}
        >
          <ChefHat size={18} /> Cook workspace{" "}
          <span className="demo-tag">Demo</span>
        </button>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {view === "discover" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> GOOD FOOD. YOUR PLACE.
              </div>
              <h1>
                The best table
                <br />
                in town?
                <br />
                <em>It’s yours.</em>
              </h1>
              <p>
                Find a local cook. Pick something delicious.
                <br className="desktop-break" /> Make a night of staying in.
              </p>
              <a className="primary-button" href="#cooks">
                Find your cook <ArrowDown size={18} />
              </a>
              <div className="hero-note">
                <Leaf size={17} /> Home cooking, with a little more occasion.
              </div>
            </div>
            <div className="hero-photo">
              <Image
                src="/images/table.jpg"
                alt="A beautifully set table ready for a dinner at home"
                fill
                priority
                sizes="(max-width: 760px) 100vw, 55vw"
                className="cover"
              />
              <div className="photo-note">
                <span className="small-star">✳</span>
                <div>
                  More time together.
                  <br />
                  <strong>Less time in the kitchen.</strong>
                </div>
              </div>
              <span className="photo-caption">
                A little inspiration for your next night in
              </span>
            </div>
          </section>
          <section className="how-strip" aria-label="How Eat In works">
            <div>
              <span>01</span>
              <p>
                <strong>Find your kind of cook</strong>
                <small>Local people. Food they love to make.</small>
              </p>
            </div>
            <div>
              <span>02</span>
              <p>
                <strong>Make a date of it</strong>
                <small>Choose your menu, service and evening.</small>
              </p>
            </div>
            <div>
              <span>03</span>
              <p>
                <strong>You shop. They cook.</strong>
                <small>We’ll make the shopping list for you.</small>
              </p>
            </div>
          </section>
          <section className="discover section-wrap" id="cooks">
            <div className="section-heading">
              <div>
                <div className="eyebrow">MEET YOUR NEXT FAVOURITE COOK</div>
                <h2>
                  Good company starts
                  <br className="mobile-break" /> with good food.
                </h2>
              </div>
              <span className="location-note">
                <MapPin size={16} /> Starting in Tasmania
              </span>
            </div>
            <div className="filters">
              <label>
                <span>Where</span>
                <select
                  aria-label="Location"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option>All Tasmania</option>
                  <option>Hobart</option>
                  <option>Launceston</option>
                </select>
              </label>
              <label>
                <span>How would you like it?</span>
                <select
                  aria-label="Service filter"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                >
                  <option value="all">Either service</option>
                  <option value="prep">Meal preparation</option>
                  <option value="dining">Full dining service</option>
                </select>
              </label>
              <button
                className={`save-filter ${savedOnly ? "selected" : ""}`}
                onClick={() => setSavedOnly(!savedOnly)}
                aria-pressed={savedOnly}
              >
                <Heart size={17} fill={savedOnly ? "currentColor" : "none"} />{" "}
                Saved cooks
              </button>
            </div>
            <div className="cuisine-tabs" aria-label="Cuisine filters">
              {["All food", "Italian", "Modern Australian", "Chinese"].map(
                (value) => (
                  <button
                    key={value}
                    aria-pressed={cuisine === value}
                    className={cuisine === value ? "active" : ""}
                    onClick={() => setCuisine(value)}
                  >
                    {value}
                  </button>
                ),
              )}
              <span>
                {filtered.length} sample{" "}
                {filtered.length === 1 ? "cook" : "cooks"}
              </span>
            </div>
            <div className="cook-grid">
              {filtered.map((cook) => (
                <article className="cook-card" key={cook.id}>
                  <div className="card-photo">
                    <button
                      className="photo-button"
                      onClick={() => setSelected(cook)}
                      aria-label={`View ${cook.name} menus`}
                    >
                      <Image
                        src={cook.image}
                        alt={cook.imageAlt}
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                        className="cover"
                      />
                    </button>
                    <span className="image-badge">{cook.cuisine}</span>
                    <button
                      className={`heart-button ${saved.includes(cook.id) ? "is-saved" : ""}`}
                      aria-label={`${saved.includes(cook.id) ? "Unsave" : "Save"} ${cook.name}`}
                      aria-pressed={saved.includes(cook.id)}
                      onClick={() => toggleSaved(cook.id)}
                    >
                      <Heart
                        size={19}
                        fill={saved.includes(cook.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="card-person">
                    <span
                      className="avatar"
                      style={{ background: cook.colour }}
                    >
                      {cook.initials}
                    </span>
                    <div>
                      <h3>{cook.name}</h3>
                      <span>
                        <MapPin size={12} />
                        {cook.city} · Sample profile
                      </span>
                    </div>
                  </div>
                  <p className="cook-intro">{cook.intro}</p>
                  <div className="service-pills">
                    {cook.services.map((s) => (
                      <span key={s}>
                        {s === "prep" ? (
                          <ShoppingBasket size={12} />
                        ) : (
                          <Utensils size={12} />
                        )}{" "}
                        {serviceLabels[s]}
                      </span>
                    ))}
                  </div>
                  <div className="card-bottom">
                    <p>
                      From{" "}
                      <strong>
                        {money(Math.min(...cook.menus.map((m) => m.price)))}
                      </strong>
                      <small> / person + fees & groceries</small>
                    </p>
                    <button
                      onClick={() => setSelected(cook)}
                      aria-label={`Explore ${cook.name} menus`}
                    >
                      <ArrowRight size={21} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <ShoppingBasket size={32} />
                <h3>No cooks match just yet.</h3>
                <p>Try another location, service or cuisine.</p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setCity("All Tasmania");
                    setCuisine("All food");
                    setServiceFilter("all");
                    setSavedOnly(false);
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
            <p className="sample-note">
              Meet our three fictional cooks. Photos are illustrative; all
              bookings are simulated and saved only in this browser.
            </p>
          </section>
          <section className="services-section section-wrap">
            <div>
              <div className="eyebrow">YOUR EVENING, YOUR WAY</div>
              <h2>
                A helping hand.
                <br />
                Or the whole occasion.
              </h2>
              <p>Choose how much you’d like to leave to your cook.</p>
            </div>
            <article>
              <ShoppingBasket size={27} />
              <h3>Meal preparation</h3>
              <p>
                Your cook prepares your chosen menu in your kitchen, then leaves
                it ready for you to serve and enjoy.
              </p>
              <span>
                You take it from here <ArrowRight size={15} />
              </span>
            </article>
            <article>
              <Utensils size={27} />
              <h3>Full dining service</h3>
              <p>
                Your cook prepares and serves the meal, stays through dinner and
                tidies the cooking area afterwards.
              </p>
              <span>
                Settle in and enjoy <ArrowRight size={15} />
              </span>
            </article>
          </section>
          <section className="closing-note">
            <span>✳</span>
            <h2>
              Stay in.
              <br />
              <em>Make it special.</em>
            </h2>
            <a href="#cooks" className="primary-button">
              Explore the menus <ArrowRight size={18} />
            </a>
          </section>
        </>
      )}

      {view === "bookings" && (
        <section className="section-wrap workspace">
          <div className="eyebrow">SOMETHING TO LOOK FORWARD TO</div>
          <h1>Your nights in.</h1>
          <p className="workspace-intro">
            Your demo confirmations, shopping lists and reviews, all in one
            place.
          </p>
          {!bookings.length ? (
            <div className="empty-state">
              <Utensils size={36} />
              <h2>Your table is waiting.</h2>
              <p>Choose a cook and make your first simulated booking.</p>
              <button
                className="primary-button"
                onClick={() => navigate("discover")}
              >
                Find a cook <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                role="customer"
                onChange={(change) => updateBooking(b.id, change)}
              />
            ))
          )}
        </section>
      )}

      {view === "cook" && (
        <section className="section-wrap workspace">
          <div className="eyebrow">ON THE OTHER SIDE OF THE TABLE</div>
          <h1>Cook workspace.</h1>
          <p className="workspace-intro">
            Preview the cook’s side of each booking. Switching sample profiles
            is for testing only.
          </p>
          <label className="workspace-select">
            Preview as
            <select
              aria-label="Sample cook"
              value={cookId}
              onChange={(e) => setCookId(e.target.value)}
            >
              {cooks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.city}
                </option>
              ))}
            </select>
          </label>
          <div className="cook-summary">
            <ChefHat size={28} />
            <div>
              <strong>{cooks.find((c) => c.id === cookId)?.name}</strong>
              <p>
                Sample profile · Available dates follow this cook’s weekly
                schedule.
              </p>
            </div>
          </div>
          {bookings.filter((b) => b.cookId === cookId).length === 0 ? (
            <div className="empty-state">
              <Clock3 size={32} />
              <h2>No demo bookings yet.</h2>
              <p>
                Book this cook from Find a cook, then return to see their
                confirmation.
              </p>
            </div>
          ) : (
            bookings
              .filter((b) => b.cookId === cookId)
              .map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  role="cook"
                  onChange={(change) => updateBooking(b.id, change)}
                />
              ))
          )}
        </section>
      )}

      <footer className="site-footer">
        <div className="wordmark">
          <Utensils size={23} />
          eat in<span className="brand-dot">.</span>
        </div>
        <p>Good food brings us home.</p>
        <span>Made for Tasmania · Prototype v0.1</span>
      </footer>
      {selected && (
        <BookingDialog
          key={selected.id}
          cook={selected}
          bookings={bookings}
          ready={ready}
          onClose={() => setSelected(null)}
          onBook={(booking) => {
            const current = readDemo();
            if (
              current.bookings.some(
                (b) =>
                  b.cookId === booking.cookId &&
                  b.date === booking.date &&
                  b.status !== "cancelled",
              )
            ) {
              setNotice(
                "That date was just booked in another tab. Please choose another date.",
              );
              setBookings(current.bookings);
              return false;
            }
            if (!persist([booking, ...current.bookings], current.saved))
              return false;
            setSelected(null);
            navigate("bookings");
            setNotice(
              "Demo booking confirmed. Your shopping list and the cook’s confirmation are ready below. Nothing was charged or sent.",
            );
            return true;
          }}
        />
      )}
    </div>
  );
}

function BookingDialog({
  cook,
  bookings,
  ready,
  onClose,
  onBook,
}: {
  cook: Cook;
  bookings: DemoBooking[];
  ready: boolean;
  onClose: () => void;
  onBook: (booking: DemoBooking) => boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [menuId, setMenuId] = useState(cook.menus[0].id);
  const [service, setService] = useState<Service>(cook.services[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [diners, setDiners] = useState(4);
  const [signature, setSignature] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [termsOpen, setTermsOpen] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  const menu = cook.menus.find((m) => m.id === menuId)!;
  const prices = quote(menu, diners, service);
  const dates = availableDates(cook, bookings);
  function submit(e: FormEvent) {
    e.preventDefault();
    const validation = validateBooking(
      cook,
      menu,
      { service, date, time, diners, signature, accepted },
      bookings,
    );
    if (validation) {
      setError(validation);
      return;
    }
    // getRandomValues also works on an HTTP LAN preview, unlike randomUUID.
    const reference = Array.from(
      crypto.getRandomValues(new Uint8Array(8)),
      (byte) => byte.toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase();
    const success = onBook({
      id: `EI-${reference}`,
      cookId: cook.id,
      menuId,
      service,
      date,
      time,
      diners,
      signature: signature.trim(),
      total: prices.total,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      termsVersion,
    });
    if (!success)
      setError(
        "The booking could not be saved. Check the notification and choose another available date if needed.",
      );
  }
  return (
    <dialog
      ref={dialog}
      className="booking-dialog"
      onCancel={onClose}
      aria-labelledby="booking-title"
    >
      <button
        className="close-dialog"
        onClick={onClose}
        aria-label="Close booking"
      >
        <X size={22} />
      </button>
      <div className="dialog-cover">
        <Image
          src={cook.image}
          alt={cook.imageAlt}
          fill
          sizes="800px"
          className="cover"
        />
        <span className="image-badge">
          {cook.cuisine} · {cook.city}
        </span>
      </div>
      <div className="dialog-content">
        <div className="card-person">
          <span className="avatar" style={{ background: cook.colour }}>
            {cook.initials}
          </span>
          <div>
            <h2 id="booking-title">Dinner with {cook.name.split(" ")[0]}</h2>
            <span>
              Sample cook · {cook.city} · 2–{cook.maxDiners} diners
            </span>
          </div>
        </div>
        <p className="bio">{cook.bio}</p>
        <form onSubmit={submit} noValidate>
          <h3>
            <span className="step-number">1</span> Something delicious
          </h3>
          <div className="menu-options">
            {cook.menus.map((m) => (
              <label
                key={m.id}
                className={`menu-option ${menuId === m.id ? "chosen" : ""}`}
              >
                <input
                  type="radio"
                  name="menu"
                  value={m.id}
                  checked={menuId === m.id}
                  onChange={() => setMenuId(m.id)}
                />
                <span>
                  <strong>{m.name}</strong>
                  <small>{m.description}</small>
                </span>
                <b>
                  {money(m.price)}
                  <small>/ person</small>
                </b>
              </label>
            ))}
          </div>
          <ol className="courses">
            {menu.courses.map((course, i) => (
              <li key={course}>
                <span>0{i + 1}</span>
                {course}
              </li>
            ))}
          </ol>
          <h3>
            <span className="step-number">2</span> Make it your evening
          </h3>
          <label className="field-label">
            Service
            <select
              aria-label="Booking service"
              value={service}
              onChange={(e) => setService(e.target.value as Service)}
            >
              {cook.services.map((s) => (
                <option key={s} value={s}>
                  {serviceLabels[s]}
                  {s === "dining" ? " (+$80 per event)" : ""}
                </option>
              ))}
            </select>
          </label>
          <p className="field-help">
            {service === "prep"
              ? "Prepared in your kitchen and left ready for you to serve."
              : "Your cook prepares, serves and tidies the cooking area. Allow around 4 hours."}
          </p>
          <div className="form-row">
            <label className="field-label">
              Available date
              <select
                aria-label="Available date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              >
                <option value="">Choose a date</option>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {prettyDate(d)}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Cook arrival
              <select
                aria-label="Cook arrival"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {["12:00", "17:00", "18:00", "19:00"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="field-help">
            Tasmania local time. One booking per cook per day in this demo; the
            next 35 days are shown.
          </p>
          <div className="diners">
            <div>
              <strong>People at your table</strong>
              <small>Minimum 2 · Maximum {cook.maxDiners}</small>
            </div>
            <div>
              <button
                type="button"
                aria-label="Fewer diners"
                disabled={diners <= 2}
                onClick={() => setDiners(diners - 1)}
              >
                <Minus size={16} />
              </button>
              <output aria-label="Diner count">{diners}</output>
              <button
                type="button"
                aria-label="More diners"
                disabled={diners >= cook.maxDiners}
                onClick={() => setDiners(diners + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="equipment">
            <strong>Your kitchen needs</strong>
            <p>{cook.equipment.join(" · ")}</p>
            <p>
              Allergies? Menus may contain wheat, dairy, soy, sesame or other
              allergens. A real booking will require a direct suitability check
              with the cook.
            </p>
          </div>
          <h3>
            <span className="step-number">3</span> Review your demo booking
          </h3>
          <div className="price-box">
            <div>
              <span>
                {money(menu.price)} × {diners} diners
              </span>
              <span>{money(prices.foodService)}</span>
            </div>
            {prices.dining > 0 && (
              <div>
                <span>Full dining service</span>
                <span>{money(prices.dining)}</span>
              </div>
            )}
            <div>
              <span>Eat In fee (10% · trial rate)</span>
              <span>{money(prices.fee)}</span>
            </div>
            <div className="total">
              <strong>Simulated total · AUD</strong>
              <strong>{money(prices.total)}</strong>
            </div>
            <small>
              Groceries are additional and bought by you. No card details,
              payment or actual reservation.
            </small>
          </div>
          <button
            type="button"
            className="terms-toggle"
            aria-expanded={termsOpen}
            onClick={() => setTermsOpen(!termsOpen)}
          >
            Read the prototype booking terms {termsOpen ? "−" : "+"}
          </button>
          {termsOpen && (
            <div className="prototype-terms">
              <strong>Prototype terms · {termsVersion}</strong>
              <p>
                This is a usability trial using fictional cooks. Your selection,
                typed demo name and acceptance time stay in this browser. No
                person is hired, no legal service contract is entered, no
                payment is made and no email is sent.
              </p>
              <p>
                Meal preparation means cooking and leaving food ready to serve.
                Full dining service also includes serving and tidying the
                cooking area. You would supply the listed ingredients and
                equipment. Quantities are illustrative and must be checked with
                a real cook.
              </p>
              <p>
                You can cancel or complete a simulated event from your bookings
                or the cook workspace. Real cancellation, refund, insurance,
                verification and food safety policies must be finalised before a
                live pilot. Use fictional details only.
              </p>
            </div>
          )}
          <label className="field-label">
            Demo booking signature
            <input
              aria-label="Demo booking signature"
              placeholder="Type a fictional name"
              maxLength={80}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I accept the prototype terms and understand this is a simulated
            booking.
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="primary-button book-button"
            type="submit"
            disabled={!ready}
          >
            Confirm demo booking <ArrowRight size={18} />
          </button>
          <p className="secure-note">
            <Check size={14} /> Nothing to pay. Just a taste of Eat In.
          </p>
        </form>
      </div>
    </dialog>
  );
}

function BookingCard({
  booking: b,
  role,
  onChange,
}: {
  booking: DemoBooking;
  role: "customer" | "cook";
  onChange: (change: Partial<DemoBooking>) => void;
}) {
  const cook = cooks.find((c) => c.id === b.cookId)!;
  const menu = cook.menus.find((m) => m.id === b.menuId)!;
  const items = shoppingList(menu, b.diners);
  const [listOpen, setListOpen] = useState(false);
  function download() {
    const text = [
      `Eat In — demo shopping list`,
      `${b.id} · ${menu.name}`,
      `${prettyDate(b.date)} · ${b.diners} diners`,
      "",
      ...items.map((i) => `${i.name}: ${i.quantity} ${i.unit}`),
      "",
      "Groceries are not included in your service price. Check quantities, pantry supplies and allergies with your cook before any real event.",
      "Illustrative prototype only. No actual booking or payment.",
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${b.id}-shopping-list.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <article className="booking-card">
      <div className="booking-main">
        <div className="booking-thumbnail">
          <Image
            src={cook.image}
            alt={cook.imageAlt}
            fill
            sizes="160px"
            className="cover"
          />
        </div>
        <div className="booking-description">
          <div className="booking-meta">
            <span className={`booking-status ${b.status}`}>
              {b.status === "confirmed" ? (
                <CheckCircle2 size={13} />
              ) : (
                <Check size={13} />
              )}{" "}
              {b.status}
            </span>
            <span>{b.id}</span>
          </div>
          <h2>{menu.name}</h2>
          <p>
            {role === "cook" ? `For ${b.signature}` : `With ${cook.name}`} ·{" "}
            {serviceLabels[b.service]}
          </p>
          <p>
            {prettyDate(b.date)} at {b.time} · {b.diners} diners · {cook.city}
          </p>
          <strong>
            {money(b.total)} AUD <small>simulated · no payment</small>
          </strong>
        </div>
      </div>
      <div className="confirmation-note">
        <CheckCircle2 size={18} />
        <p>
          {role === "cook"
            ? "Cook confirmation preview"
            : "Customer confirmation preview"}
          <span>
            {b.status === "cancelled"
              ? "This demo booking is cancelled. The cook’s date is available again."
              : "Booking details and shopping list are ready. Notifications are shown here only; no messages have been sent."}
          </span>
        </p>
      </div>
      <div className="booking-actions">
        <button
          className="secondary-button"
          onClick={() => setListOpen(!listOpen)}
          aria-expanded={listOpen}
        >
          <ShoppingBasket size={16} />
          {listOpen ? "Hide shopping list" : "View shopping list"}
        </button>
        <button className="text-button" onClick={download}>
          <Download size={16} /> Download list
        </button>
        {b.status === "confirmed" && (
          <>
            {role === "cook" && (
              <button
                className="text-button"
                onClick={() => onChange({ status: "completed" })}
              >
                Simulate service completed <Check size={16} />
              </button>
            )}
            <button
              className="text-button cancel-button"
              onClick={() => onChange({ status: "cancelled" })}
            >
              Cancel demo booking
            </button>
          </>
        )}
      </div>
      {listOpen && (
        <div className="shopping-list">
          <h3>Your shopping list · {b.diners} diners</h3>
          <p>Buy these before the cook arrives. Check what you already have.</p>
          {[...new Set(items.map((i) => i.category))].map((category) => (
            <div key={category}>
              <h4>{category}</h4>
              {items
                .filter((i) => i.category === category)
                .map((i) => (
                  <label key={i.name}>
                    <input type="checkbox" />
                    <span>{i.name}</span>
                    <strong>
                      {i.quantity} {i.unit}
                    </strong>
                  </label>
                ))}
            </div>
          ))}
          <small>
            Illustrative quantities. Groceries cost extra. Your kitchen needs:{" "}
            {cook.equipment.join(", ")}.
          </small>
        </div>
      )}
      {b.status === "completed" && (
        <div className="review-area">
          <h3>
            {role === "customer"
              ? "How was your cook?"
              : "How was your customer?"}
          </h3>
          <p>Leave a demo rating after the simulated service.</p>
          {(role === "customer" ? b.customerRating : b.cookRating) ? (
            <strong>
              <CheckCircle2 size={17} /> You rated{" "}
              {role === "customer" ? cook.name : b.signature}{" "}
              {role === "customer" ? b.customerRating : b.cookRating}/5.
            </strong>
          ) : (
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  aria-label={`Rate ${n} out of 5`}
                  onClick={() =>
                    onChange(
                      role === "customer"
                        ? { customerRating: n }
                        : { cookRating: n },
                    )
                  }
                >
                  {n} ★
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="booking-audit">
        Accepted by {b.signature} · Prototype terms {b.termsVersion} · Stored in
        this browser only
      </p>
    </article>
  );
}
