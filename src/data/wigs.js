// Style catalogue used by try-on, the AI stylist, the care tracker and community tags.
// This is NOT a shop: no prices, no cart.

export const STYLES = [
  {
    id: "aurora",
    name: "Aurora",
    kind: "long",
    color: "#B4522E",
    length: "long",
    material: "synthetic",
    faces: ["oval", "heart", "square"],
    tones: ["warm", "neutral"],
    goals: ["daily", "cosplay"],
  },
  {
    id: "lilu",
    name: "Lilu",
    kind: "long",
    color: "#8A6A4F",
    length: "medium",
    material: "human",
    faces: ["oval", "round", "heart"],
    tones: ["neutral", "warm"],
    goals: ["daily", "hairloss"],
  },
  {
    id: "amelie",
    name: "Amélie",
    kind: "curly",
    color: "#D6AE6A",
    length: "long",
    material: "synthetic",
    faces: ["oval", "square", "heart"],
    tones: ["warm", "neutral"],
    goals: ["daily", "cosplay"],
  },
  {
    id: "sylvia",
    name: "Sylvia",
    kind: "bob",
    color: "#6B4A38",
    length: "bob",
    material: "human",
    faces: ["oval", "round", "square", "heart"],
    tones: ["neutral", "warm", "cool"],
    goals: ["daily", "hairloss"],
  },
  {
    id: "nora",
    name: "Nora",
    kind: "short",
    color: "#2E2A36",
    length: "short",
    material: "synthetic",
    faces: ["oval", "heart", "round"],
    tones: ["cool", "neutral"],
    goals: ["daily", "cosplay"],
  },
  {
    id: "ivy",
    name: "Ivy",
    kind: "long",
    color: "#D877A5",
    length: "long",
    material: "synthetic",
    faces: ["oval", "heart", "round"],
    tones: ["cool", "neutral"],
    goals: ["cosplay"],
  },
  {
    id: "clara",
    name: "Clara",
    kind: "bob",
    color: "#C9A27A",
    length: "bob",
    material: "human",
    faces: ["round", "square", "oval"],
    tones: ["warm", "neutral"],
    goals: ["daily", "hairloss"],
  },
  {
    id: "mira",
    name: "Mira",
    kind: "short",
    color: "#A9A5B8",
    length: "short",
    material: "synthetic",
    faces: ["oval", "square", "heart"],
    tones: ["cool"],
    goals: ["cosplay", "daily"],
  },
];

export const COLORS = [
  { id: "black", hex: "#1F1B24" },
  { id: "chestnut", hex: "#5B3A29" },
  { id: "auburn", hex: "#B4522E" },
  { id: "blonde", hex: "#D6AE6A" },
  { id: "platinum", hex: "#E6DDC8" },
  { id: "rose", hex: "#D877A5" },
  { id: "violet", hex: "#7C5AC7" },
  { id: "ash", hex: "#A9A5B8" },
];

export const QUIZ = [
  { id: "face", options: ["oval", "round", "square", "heart"] },
  { id: "tone", options: ["cool", "neutral", "warm"] },
  { id: "length", options: ["short", "bob", "medium", "long"] },
  { id: "goal", options: ["daily", "cosplay", "hairloss"] },
];

const LENGTH_ORDER = ["short", "bob", "medium", "long"];

export const getStyle = (id) => STYLES.find((s) => s.id === id);

// How often a wig should be washed (days of wear), by material.
export const washInterval = (style) => (style.material === "human" ? 10 : 15);

export function scoreStyle(style, a) {
  let s = 0;
  if (style.faces.includes(a.face)) s += 30;
  if (style.tones.includes(a.tone)) s += 20;
  const gap = Math.abs(
    LENGTH_ORDER.indexOf(style.length) - LENGTH_ORDER.indexOf(a.length),
  );
  if (gap === 0) s += 30;
  else if (gap === 1) s += 12;
  if (style.goals.includes(a.goal)) s += 20;
  return s;
}

// 3–5 best matches.
export function recommend(answers) {
  const ranked = STYLES.map((style) => ({
    style,
    score: scoreStyle(style, answers),
  })).sort((a, b) => b.score - a.score);
  const good = ranked.filter((r) => r.score >= 60).slice(0, 5);
  return (good.length >= 3 ? good : ranked.slice(0, 3)).map((r) => ({
    style: r.style,
    percent: Math.min(99, r.score),
  }));
}

export const SEED_POSTS = [
  {
    id: "p1",
    author: "Kateřina",
    styleId: "aurora",
    hours: 2,
    likes: 24,
    beforeAfter: true,
  },
  {
    id: "p2",
    author: "Marek",
    styleId: "nora",
    hours: 5,
    likes: 11,
    beforeAfter: false,
  },
  {
    id: "p3",
    author: "Anna",
    styleId: "amelie",
    hours: 9,
    likes: 37,
    beforeAfter: false,
  },
  {
    id: "p4",
    author: "Julie",
    styleId: "sylvia",
    hours: 26,
    likes: 18,
    beforeAfter: true,
  },
  {
    id: "p5",
    author: "Petra",
    styleId: "ivy",
    hours: 50,
    likes: 42,
    beforeAfter: false,
  },
];

export const REWARDS = [
  { id: "guide", cost: 80 },
  { id: "badge", cost: 120 },
  { id: "early", cost: 150 },
  { id: "consult", cost: 300 },
];

export const LEVELS = [
  { id: "silk", from: 0 },
  { id: "satin", from: 200 },
  { id: "velvet", from: 600 },
];

export const EARN = [
  { id: "checkin", pts: 5 },
  { id: "quiz", pts: 20 },
  { id: "post", pts: 50 },
  { id: "booking", pts: 40 },
  { id: "share", pts: 10 },
];
