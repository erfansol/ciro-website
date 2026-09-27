/**
 * The Ciro films — hand-drawn motion pieces rendered live in the browser.
 *
 * Each film is a small HTML/SVG page in /public/films that exposes a
 * frame-exact `renderAt(t)` function. The site plays the film's mixed
 * soundtrack (MP3) and drives the drawing from the audio clock, so picture
 * and sound stay locked and every chapter is seekable.
 */

export type FilmKind = "intro" | "feature" | "rome";

export type Chapter = { t: number; label: string };

export type Film = {
  id: string;
  kind: FilmKind;
  title: string;
  /** Short line under the title on cards. */
  blurb: string;
  aspect: "16/9" | "9/16";
  duration: number;
  /** Time (s) of the frame shown before playback. */
  posterT: number;
  chapters: Chapter[];
  /** Music credit — CC BY 4.0 requires it wherever the film plays. */
  music: string;
};

const END = (t: number): Chapter => ({ t, label: "Ciro" });

export const FILMS: ReadonlyArray<Film> = [
  {
    id: "intro",
    kind: "intro",
    title: "Every street has a story",
    blurb: "Ciro in thirty-five seconds.",
    aspect: "16/9",
    duration: 35.5,
    posterT: 13.3,
    chapters: [
      { t: 0, label: "Every street" },
      { t: 5, label: "Rome, drawn" },
      { t: 10.2, label: "Stories float up" },
      { t: 16, label: "Walk real streets" },
      { t: 24, label: "Close the case" },
      END(29.4),
    ],
    music: "“Evening” and “SCP-x6x (Hopes)” by Kevin MacLeod",
  },
  {
    id: "intro-vertical",
    kind: "intro",
    title: "Every street has a story",
    blurb: "The same film, cut for your phone.",
    aspect: "9/16",
    duration: 35.5,
    posterT: 13.3,
    chapters: [
      { t: 0, label: "Every street" },
      { t: 5, label: "Rome, drawn" },
      { t: 10.2, label: "Stories float up" },
      { t: 16, label: "Walk real streets" },
      { t: 24, label: "Close the case" },
      END(29.4),
    ],
    music: "“Evening” and “SCP-x6x (Hopes)” by Kevin MacLeod",
  },
  {
    id: "voice",
    kind: "feature",
    title: "Ask the city anything",
    blurb: "Talk, interrupt, switch language.",
    aspect: "9/16",
    duration: 20.5,
    posterT: 7.4,
    chapters: [
      { t: 0, label: "Piazza Navona" },
      { t: 3.3, label: "Your question" },
      { t: 5.2, label: "Il Corvo answers" },
      { t: 9.4, label: "Interrupt him" },
      { t: 13.2, label: "In Italian" },
      END(16),
    ],
    music: "“Ashton Manor” by Kevin MacLeod",
  },
  {
    id: "balloons",
    kind: "feature",
    title: "Look up. Stories are floating.",
    blurb: "Every balloon marks a story nearby.",
    aspect: "9/16",
    duration: 20.5,
    posterT: 14.6,
    chapters: [
      { t: 0, label: "Look up" },
      { t: 1.8, label: "Balloons appear" },
      { t: 7.8, label: "Stories nearby" },
      { t: 12.2, label: "Tap one" },
      END(16),
    ],
    music: "“Dreamy Flashback” by Kevin MacLeod",
  },
  {
    id: "together",
    kind: "feature",
    title: "Rome is better with friends",
    blurb: "One code. Everyone walks the story.",
    aspect: "9/16",
    duration: 20.5,
    posterT: 9.2,
    chapters: [
      { t: 0, label: "Group session" },
      { t: 1.9, label: "Invite code" },
      { t: 5.9, label: "Friends join" },
      { t: 10.1, label: "Walk it live" },
      END(16),
    ],
    music: "“Bushwick Tarantella” by Kevin MacLeod",
  },
  {
    id: "foryou",
    kind: "feature",
    title: "Your Rome, not everyone’s",
    blurb: "Tell it what moves you.",
    aspect: "9/16",
    duration: 20.5,
    posterT: 13.8,
    chapters: [
      { t: 0, label: "What moves you" },
      { t: 5, label: "How you explore" },
      { t: 7.6, label: "Your time" },
      { t: 10, label: "Your day in Rome" },
      END(16),
    ],
    music: "“Stoic Morning” by Kevin MacLeod",
  },
  {
    id: "ar",
    kind: "feature",
    title: "History, right in front of you",
    blurb: "Il Corvo lands, and sends you inside.",
    aspect: "9/16",
    duration: 20.5,
    posterT: 13.8,
    chapters: [
      { t: 0, label: "San Luigi dei Francesi" },
      { t: 2.6, label: "Il Corvo arrives" },
      { t: 5.8, label: "He speaks" },
      { t: 8.4, label: "A clue" },
      { t: 13, label: "Found it" },
      END(16),
    ],
    music: "“Sneaky Adventure” by Kevin MacLeod",
  },
  ...(
    [
      ["colosseum", "The Colosseum", "What happened beneath the arena?", 5.5, ["100 days", "50,000", "Below the sand"]],
      ["trevi", "Trevi Fountain", "Why throw a coin over your shoulder?", 8.4, ["19 BC", "One coin", "€1 million a year"]],
      ["pantheon", "The Pantheon", "Why is there a hole in the roof?", 11.6, ["43 metres", "Agrippa", "Open sky"]],
      ["stpeters", "St. Peter’s Basilica", "One church. A hundred and twenty years.", 8.6, ["1506", "136 metres", "284 columns"]],
      ["forum", "The Roman Forum", "Rome’s old heart, still beating.", 5.6, ["44 BC", "Cow field", "Via Sacra"]],
      ["castel", "Castel Sant’Angelo", "A tomb. A fortress. A pope’s escape route.", 8.6, ["AD 139", "1527", "Tosca"]],
    ] as const
  ).map(
    ([key, title, hook, posterT, facts]): Film => ({
      id: `rome-${key}`,
      kind: "rome",
      title,
      blurb: hook,
      aspect: "9/16",
      duration: 20.5,
      posterT,
      chapters: [
        { t: 0, label: "The question" },
        { t: 4.1, label: facts[0] },
        { t: 7.2, label: facts[1] },
        { t: 10.3, label: facts[2] },
        { t: 13.5, label: "Stand here" },
        END(16.1),
      ],
      music: "“Morning” by Kevin MacLeod",
    }),
  ),
];

export const filmById = (id: string) => FILMS.find((f) => f.id === id);
export const filmsOfKind = (kind: FilmKind) => FILMS.filter((f) => f.kind === kind);

export const FILM_ASSET = (id: string) => ({
  src: `/films/${id}.html?render`,
  audio: `/films/${id}.mp3`,
  poster: `/films/${id}.webp`,
});
