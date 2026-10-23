export type Service = "prep" | "dining";
export const serviceLabels: Record<Service, string> = {
  prep: "Meal preparation",
  dining: "Full dining service",
};
export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
};
export type Menu = {
  id: string;
  name: string;
  description: string;
  courses: string[];
  price: number;
  ingredients: Ingredient[];
};
export type Cook = {
  id: string;
  name: string;
  initials: string;
  city: string;
  cuisine: string;
  colour: string;
  intro: string;
  bio: string;
  image: string;
  imageAlt: string;
  services: Service[];
  weekdays: number[];
  maxDiners: number;
  equipment: string[];
  menus: Menu[];
};
export const cooks: Cook[] = [
  {
    id: "anna",
    name: "Anna Bennett",
    initials: "AB",
    city: "Hobart",
    cuisine: "Italian",
    colour: "#a95c39",
    intro: "A little Italy, around your table.",
    bio: "Sample cook · Slow Sundays, handmade pasta and recipes passed around my family table. I love making a dinner feel like an occasion, without making it feel formal.",
    image: "/images/italian.jpg",
    imageAlt: "Fresh pasta with tomatoes and herbs",
    services: ["prep", "dining"],
    weekdays: [4, 5, 6, 0],
    maxDiners: 10,
    equipment: ["Stovetop", "Oven", "Large saucepan", "Clear bench space"],
    menus: [
      {
        id: "italian-table",
        name: "The Italian table",
        description: "Three generous courses, made for sharing.",
        price: 55,
        courses: [
          "Tomato & basil bruschetta",
          "Fresh tomato and basil pasta",
          "Lemon mascarpone cups",
        ],
        ingredients: [
          { name: "Tomatoes", quantity: 200, unit: "g", category: "Produce" },
          { name: "Basil", quantity: 10, unit: "g", category: "Produce" },
          { name: "Lemons", quantity: 0.5, unit: "whole", category: "Produce" },
          { name: "Fresh pasta", quantity: 125, unit: "g", category: "Pantry" },
          {
            name: "Sourdough",
            quantity: 2,
            unit: "slices",
            category: "Bakery",
          },
          { name: "Mascarpone", quantity: 75, unit: "g", category: "Dairy" },
          { name: "Olive oil", quantity: 20, unit: "ml", category: "Pantry" },
          { name: "Sugar", quantity: 15, unit: "g", category: "Pantry" },
        ],
      },
      {
        id: "risotto-night",
        name: "A cosy risotto night",
        description: "An earthy, vegetarian evening.",
        price: 49,
        courses: [
          "Rocket & parmesan salad",
          "Mushroom risotto",
          "Berries & vanilla cream",
        ],
        ingredients: [
          { name: "Mushrooms", quantity: 180, unit: "g", category: "Produce" },
          { name: "Rocket", quantity: 30, unit: "g", category: "Produce" },
          { name: "Berries", quantity: 100, unit: "g", category: "Produce" },
          {
            name: "Arborio rice",
            quantity: 100,
            unit: "g",
            category: "Pantry",
          },
          {
            name: "Vegetable stock",
            quantity: 350,
            unit: "ml",
            category: "Pantry",
          },
          { name: "Parmesan", quantity: 30, unit: "g", category: "Dairy" },
          { name: "Cream", quantity: 60, unit: "ml", category: "Dairy" },
          { name: "Onion", quantity: 0.25, unit: "whole", category: "Produce" },
        ],
      },
    ],
  },
  {
    id: "liam",
    name: "Liam Cooper",
    initials: "LC",
    city: "Launceston",
    cuisine: "Modern Australian",
    colour: "#61715b",
    intro: "Local produce. A proper feast.",
    bio: "Sample cook · My happy place is beside the barbecue. Expect seasonal vegetables, generous plates and a relaxed evening built around Tasmanian produce.",
    image: "/images/barbecue.jpg",
    imageAlt: "A grilled dinner with seasonal vegetables",
    services: ["dining"],
    weekdays: [5, 6, 0],
    maxDiners: 12,
    equipment: ["Barbecue", "Oven", "Fridge space", "Serving platters"],
    menus: [
      {
        id: "backyard-feast",
        name: "The backyard feast",
        description: "Fire, fresh sides and something sweet.",
        price: 65,
        courses: [
          "Grilled seasonal vegetables",
          "Barbecue steak & herb potatoes",
          "Strawberries & cream",
        ],
        ingredients: [
          { name: "Steak", quantity: 250, unit: "g", category: "Meat" },
          { name: "Potatoes", quantity: 200, unit: "g", category: "Produce" },
          { name: "Zucchini", quantity: 100, unit: "g", category: "Produce" },
          { name: "Capsicum", quantity: 100, unit: "g", category: "Produce" },
          {
            name: "Strawberries",
            quantity: 120,
            unit: "g",
            category: "Produce",
          },
          { name: "Cream", quantity: 60, unit: "ml", category: "Dairy" },
          { name: "Olive oil", quantity: 20, unit: "ml", category: "Pantry" },
          { name: "Mixed herbs", quantity: 10, unit: "g", category: "Produce" },
        ],
      },
    ],
  },
  {
    id: "mei",
    name: "Mei Chen",
    initials: "MC",
    city: "Hobart",
    cuisine: "Chinese",
    colour: "#b18b45",
    intro: "Family favourites, freshly made.",
    bio: "Sample cook · I cook the comforting food I grew up with: fragrant rice, colourful vegetables and dishes everyone can pass around the table. I prepare everything, ready for you to serve.",
    image: "/images/dumplings.jpg",
    imageAlt: "Fresh Asian vegetables and a shared meal",
    services: ["prep"],
    weekdays: [1, 2, 3, 4, 6],
    maxDiners: 8,
    equipment: [
      "Stovetop",
      "Large frying pan",
      "Rice cooker or saucepan",
      "Food storage containers",
    ],
    menus: [
      {
        id: "family-table",
        name: "Around the family table",
        description: "A comforting spread to serve your way.",
        price: 45,
        courses: [
          "Ginger cucumber salad",
          "Soy & ginger chicken with rice",
          "Sesame greens",
        ],
        ingredients: [
          { name: "Chicken thigh", quantity: 200, unit: "g", category: "Meat" },
          { name: "Jasmine rice", quantity: 90, unit: "g", category: "Pantry" },
          { name: "Cucumber", quantity: 100, unit: "g", category: "Produce" },
          {
            name: "Asian greens",
            quantity: 150,
            unit: "g",
            category: "Produce",
          },
          { name: "Ginger", quantity: 15, unit: "g", category: "Produce" },
          { name: "Soy sauce", quantity: 20, unit: "ml", category: "Pantry" },
          { name: "Sesame oil", quantity: 5, unit: "ml", category: "Pantry" },
          { name: "Garlic", quantity: 1, unit: "cloves", category: "Produce" },
        ],
      },
    ],
  },
];
export type DemoBooking = {
  id: string;
  cookId: string;
  menuId: string;
  service: Service;
  date: string;
  time: string;
  diners: number;
  signature: string;
  total: number;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
  termsVersion: string;
  customerRating?: number;
  cookRating?: number;
};
export const termsVersion = "prototype-2026-10-v1";
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function quote(menu: Menu, diners: number, service: Service) {
  const foodService = menu.price * diners;
  const dining = service === "dining" ? 80 : 0;
  const fee = Math.round((foodService + dining) * 0.1 * 100) / 100;
  return { foodService, dining, fee, total: foodService + dining + fee };
}
export function shoppingList(menu: Menu, diners: number) {
  return menu.ingredients.map((item) => ({
    ...item,
    quantity: Math.ceil(item.quantity * diners * 100) / 100,
  }));
}
export function availableDates(
  cook: Cook,
  bookings: DemoBooking[],
  today = new Date(),
) {
  const dates: string[] = [];
  for (let offset = 1; offset <= 35; offset++) {
    const day = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + offset,
      12,
    );
    const key = dateKey(day);
    if (
      cook.weekdays.includes(day.getDay()) &&
      !bookings.some(
        (b) =>
          b.cookId === cook.id && b.date === key && b.status !== "cancelled",
      )
    )
      dates.push(key);
  }
  return dates;
}
export function validateBooking(
  cook: Cook,
  menu: Menu,
  input: {
    service: Service;
    date: string;
    time: string;
    diners: number;
    signature: string;
    accepted: boolean;
  },
  bookings: DemoBooking[],
  today = new Date(),
) {
  if (!cook.menus.some((m) => m.id === menu.id))
    return "Choose a menu offered by this cook.";
  if (!cook.services.includes(input.service))
    return "This cook does not offer that service.";
  if (
    !Number.isInteger(input.diners) ||
    input.diners < 2 ||
    input.diners > cook.maxDiners
  )
    return `Choose between 2 and ${cook.maxDiners} diners.`;
  if (!availableDates(cook, bookings, today).includes(input.date))
    return "Choose an available future date.";
  if (!["12:00", "17:00", "18:00", "19:00"].includes(input.time))
    return "Choose an available start time.";
  if (input.signature.trim().length < 2 || input.signature.trim().length > 80)
    return "Enter a demo name between 2 and 80 characters.";
  if (!input.accepted) return "Please accept the prototype booking terms.";
  return null;
}
export function money(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(amount);
}
export function prettyDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}
