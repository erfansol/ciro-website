export type Story = {
  id: string;
  title: string;
  citySlug: string;
  cityName: string;
  location: string;
  duration: string;
  narrative: string;
  emoji: string;
  gradient: string;
  ar: boolean;
  tags: string[];
};

export const STORIES: Story[] = [
  {
    id: "rome-colosseum-night",
    title: "The Night the Colosseum Sang",
    citySlug: "rome",
    cityName: "Rome",
    location: "Colosseum, Rome",
    duration: "8 min",
    narrative:
      "It was December, AD 80. The arena was inaugurated with 100 days of games — and an audience of 50,000 voices that, when synchronized, could be heard across the Tiber. Ciro recreates that roar in AR as you stand on the arena floor.",
    emoji: "🏛️",
    gradient: "from-amber-400 via-rose-500 to-violet-700",
    ar: true,
    tags: ["history", "AR", "ancient Rome"],
  },
  {
    id: "rome-bernini-secret",
    title: "Bernini's Hidden Signature",
    citySlug: "rome",
    cityName: "Rome",
    location: "Piazza Navona, Rome",
    duration: "5 min",
    narrative:
      "Look closely at the Fountain of the Four Rivers. Bernini placed a coded insult to his rival Borromini in marble — and only locals know exactly where to stand to see it.",
    emoji: "⛲",
    gradient: "from-sky-400 via-violet-500 to-indigo-700",
    ar: true,
    tags: ["art", "rivalry", "Baroque"],
  },
  {
    id: "rome-caravaggio-brawl",
    title: "Caravaggio's Last Roman Night",
    citySlug: "rome",
    cityName: "Rome",
    location: "Campo de' Fiori, Rome",
    duration: "7 min",
    narrative:
      "Before he fled to Naples, Caravaggio painted, drank, and dueled within a few blocks of this square. Ciro retraces his steps from the church where he hid his enemies in altarpieces.",
    emoji: "🗡️",
    gradient: "from-red-500 via-rose-700 to-stone-900",
    ar: false,
    tags: ["art", "noir", "Baroque"],
  },
  {
    id: "rome-trastevere-secrets",
    title: "Trastevere After Midnight",
    citySlug: "rome",
    cityName: "Rome",
    location: "Trastevere, Rome",
    duration: "12 min",
    narrative:
      "The neighborhood has its own dialect, its own saints, its own grievances. Walk with us through alleys where Roman and Jewish histories braid, and where the city still resists being a museum.",
    emoji: "🌙",
    gradient: "from-violet-700 via-fuchsia-600 to-rose-500",
    ar: false,
    tags: ["neighborhood", "nightlife", "culture"],
  },
  {
    id: "rome-pantheon-oculus",
    title: "The Oculus and the Rain",
    citySlug: "rome",
    cityName: "Rome",
    location: "Pantheon, Rome",
    duration: "4 min",
    narrative:
      "The hole in the dome isn't a flaw — it's a sundial, a chimney, and a portal. Ciro's AR overlay shows where the noon shaft of light lands on each equinox.",
    emoji: "☀️",
    gradient: "from-yellow-300 via-amber-500 to-orange-600",
    ar: true,
    tags: ["architecture", "AR", "mystery"],
  },
  {
    id: "rome-appian-way",
    title: "The Road That Ate Empires",
    citySlug: "rome",
    cityName: "Rome",
    location: "Via Appia Antica",
    duration: "15 min",
    narrative:
      "From Spartacus' crucified army to the popes' processions, the Appian Way is the longest open-air theater of Roman history. Walk a kilometer and listen as Ciro layers six centuries on top of each other.",
    emoji: "🛣️",
    gradient: "from-emerald-500 via-teal-600 to-slate-800",
    ar: true,
    tags: ["history", "walking", "AR"],
  },
  {
    id: "milan-duomo-rooftop",
    title: "Up Among Milan's Saints",
    citySlug: "milan",
    cityName: "Milan",
    location: "Duomo Rooftop, Milan",
    duration: "6 min",
    narrative:
      "There are 3,400 statues on the Duomo. One is a Madonna with a weather vane on her head. Another is a saint holding his own skin. Ciro tells you who they were and why they ended up six stories above the city.",
    emoji: "✨",
    gradient: "from-violet-500 via-indigo-600 to-blue-800",
    ar: true,
    tags: ["architecture", "religion", "AR"],
  },
  {
    id: "paris-pere-lachaise",
    title: "The Lovers of Père Lachaise",
    citySlug: "paris",
    cityName: "Paris",
    location: "Père Lachaise Cemetery, Paris",
    duration: "10 min",
    narrative:
      "Édith Piaf, Oscar Wilde, Jim Morrison, Héloïse and Abélard. The most visited cemetery on Earth is a city of romances, scandals, and reburials. We walk its slopes story by story.",
    emoji: "🥀",
    gradient: "from-rose-500 via-pink-600 to-violet-800",
    ar: false,
    tags: ["culture", "history", "walking"],
  },
  {
    id: "barcelona-sagrada",
    title: "Gaudí's Forest of Stone",
    citySlug: "barcelona",
    cityName: "Barcelona",
    location: "Sagrada Família, Barcelona",
    duration: "9 min",
    narrative:
      "Gaudí designed every column to lean like a tree. He died before seeing his roof. Ciro's AR shows the cathedral at its 2026 completion — a forest finally finished, 144 years on.",
    emoji: "🌲",
    gradient: "from-amber-300 via-orange-500 to-rose-600",
    ar: true,
    tags: ["architecture", "Modernisme", "AR"],
  },
];

export const storiesByCity = (slug: string) =>
  STORIES.filter((s) => s.citySlug === slug);
