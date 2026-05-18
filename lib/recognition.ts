/**
 * Single source of truth for every third-party recognition, award, and
 * institutional touchpoint Ciro can point to publicly. Used by the
 * /press page, the homepage "Recognized by" strip, the /about page,
 * and the JSON-LD organization graph.
 *
 * Keep this file boring data. Add a new entry when something verifiable
 * happens; remove or downgrade an entry the moment it stops being true.
 */

export type RecognitionKind =
  | "award"
  | "competition"
  | "academic"
  | "event"
  | "grant";

export type Recognition = {
  id: string;
  /** Short, scannable label for the strip and badge UI. */
  short: string;
  /** Longer headline for the dedicated press card. */
  title: string;
  /** The institution / programme behind it. */
  issuer: string;
  /** Where it took place or is administered. */
  location: string;
  /** Human-readable date (kept short — month + year). */
  date: string;
  /** ISO date for sorting; freeze when published. */
  isoDate: string;
  kind: RecognitionKind;
  /** Two-to-three-sentence body for the press card. */
  body: string;
  /** External link to verify the claim, when one exists. */
  verifyUrl?: string;
  /** Label for the verify link. */
  verifyLabel?: string;
};

export const RECOGNITION: ReadonlyArray<Recognition> = [
  {
    id: "startcup-lazio-2025",
    short: "Startcup Lazio 2025 — Finalist",
    title: "Startcup Lazio 2025 · Regional Business Plan Competition",
    issuer: "Start Cup Lazio — network of Lazio region universities",
    location: "Rome, Italy",
    date: "2025",
    isoDate: "2025-09-01",
    kind: "competition",
    body:
      "Selected as a finalist in the student-team track of Start Cup Lazio 2025 under the title \"Ciro — AI & AR per il turismo intelligente.\" Start Cup Lazio is the regional qualifier for the Italian PNI national innovation prize, run by the consortium of universities in Lazio.",
    verifyUrl: "https://startcuplazio.it/formazione-scl-2025/",
    verifyLabel: "startcuplazio.it",
  },
  {
    id: "edeh-2025",
    short: "European Parliament · EDEH 2025",
    title: "European Digital Education Hub — Selected Project, Spazio Europa",
    issuer:
      "Sapienza Università di Roma · European Parliament and European Commission Office in Italy",
    location: "Spazio Europa, Via IV Novembre 149, Rome",
    date: "December 2025",
    isoDate: "2025-12-09",
    kind: "award",
    body:
      "Ciro was selected and presented at the international conference \"From Access to Empowerment — Addressing Digital Education Poverty and Promoting Wellbeing,\" held at Spazio Europa in Rome on 9 December 2025. The venue is jointly managed by the Office in Italy of the European Parliament and the Representation in Italy of the European Commission. Certificate of Appreciation issued by Prof.ssa Ida Cortoni, President of the master's programme in Design, Visual & Multimedia Communication, Sapienza.",
    verifyUrl: "https://digital-skills-jobs.europa.eu/en/edeh",
    verifyLabel: "European Digital Education Hub",
  },
  {
    id: "maker-faire-rome-2024",
    short: "Maker Faire Rome 2024",
    title: "Maker Faire Rome 2024 · Public AR field test",
    issuer: "Camera di Commercio di Roma · Innova Camera",
    location: "Gazometro, Rome, Italy",
    date: "October 2024",
    isoDate: "2024-10-25",
    kind: "event",
    body:
      "Ciro ran a public AR + multilingual storytelling field test at Maker Faire Rome 2024 (Gazometro). Hundreds of visitors tried the app on-site, with an average engagement of around 8 minutes per visitor — the core validation that voice + AR + on-the-spot generation actually holds attention in the wild.",
    verifyUrl: "https://makerfairerome.eu",
    verifyLabel: "makerfairerome.eu",
  },
  {
    id: "sapienza-thesis-2024",
    short: "Sapienza Università di Roma · M.Des. 2024",
    title:
      "Sapienza Università di Roma — M.Des. thesis on the Ciro framework",
    issuer:
      "Sapienza Università di Roma · Faculty of Architecture · Dept. of Planning, Design, Technology of Architecture (PDTA)",
    location: "Rome, Italy",
    date: "October 2024",
    isoDate: "2024-10-22",
    kind: "academic",
    body:
      "Founder Erfan Soleymanzadeh defended his master's thesis on Ciro at Sapienza University of Rome (M.Des. in Design, Visual & Multimedia Communication, LM-12). The thesis frames Ciro as an applied research artefact at the intersection of geospatial AI and AR for cultural engagement.",
  },
] as const;

/** Date-descending sort for press lists. */
export const RECOGNITION_BY_DATE: ReadonlyArray<Recognition> = [...RECOGNITION].sort(
  (a, b) => b.isoDate.localeCompare(a.isoDate),
);
