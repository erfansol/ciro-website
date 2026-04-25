export type CityStatus = "live" | "soon";

export type City = {
  slug: string;
  name: string;
  country: string;
  status: CityStatus;
  storiesCount: number;
  releaseTarget?: string;
  teaser: string;
  description: string;
  highlights: string[];
  keywords: string[];
  gradient: string;
  image: {
    src: string;
    alt: string;
  };
};

export const CITIES: City[] = [
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    status: "live",
    storiesCount: 47,
    teaser:
      "Walk where emperors plotted, where Bernini chiseled, where Caravaggio brawled. Rome is layers — every step uncovers another century.",
    description:
      "Rome is the first city fully mapped by Ciro. From the underground basilicas of San Clemente to the conspiratorial cafes of Trastevere, Ciro narrates the city in real time as you walk — surfacing the stories textbooks skip and locals whisper. Hidden frescoes, gladiator gossip, and the truth behind the obelisks: Rome, unlocked layer by layer.",
    highlights: [
      "47 hand-crafted location stories across 9 neighborhoods",
      "AR overlays at the Colosseum, Pantheon, and Forum",
      "Audio in English, Italian, and Farsi — narrated cinematic-style",
      "Hidden-gem trails curated with Roman storytellers",
    ],
    keywords: [
      "things to do in Rome",
      "hidden places in Rome",
      "Rome AR tour",
      "Rome travel app",
      "best Rome walking tour",
    ],
    gradient: "from-amber-400 via-rose-500 to-violet-600",
    image: {
      src: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
      alt: "Colosseum at golden hour",
    },
  },
  {
    slug: "milan",
    name: "Milan",
    country: "Italy",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "Summer 2026",
    teaser:
      "Beyond the catwalks, Milan hides Leonardo's locks, Verdi's grief, and the engineers who built modern Italy in a single courtyard.",
    description:
      "Milan is more than fashion — it's the city of canals, manifestos, and quiet genius. Ciro's Milan edition pairs the Duomo's rooftop with the studios where postwar design was born, the Navigli with the espresso bars where La Scala's stars still argue.",
    highlights: [
      "Stories rooted in design, opera, and industrial history",
      "AR previews of Leonardo's lost canals",
      "Curated routes for fashion week and quiet weekends alike",
    ],
    keywords: [
      "things to do in Milan",
      "Milan travel app",
      "hidden places Milan",
      "Milan AR experience",
    ],
    gradient: "from-fuchsia-500 via-violet-600 to-indigo-700",
    image: {
      src: "https://images.unsplash.com/photo-1520440229-6469a149ac15?auto=format&fit=crop&w=1600&q=80",
      alt: "Milan Duomo facade",
    },
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "Autumn 2026",
    teaser:
      "Hemingway's bar tabs, Nadar's hot air balloon, and a sewer system once toured by candlelight. Paris was never just romantic.",
    description:
      "Ciro's Paris journey moves past the postcard. Each story is a lens — onto the Commune, the salons, the surrealists, the Algerian cafés of Belleville — narrated as you cross the city on foot or by metro.",
    highlights: [
      "Literary trails through the Latin Quarter and Montmartre",
      "AR moments at the Louvre, Père Lachaise, and the Catacombs",
      "Stories in English and French",
    ],
    keywords: [
      "things to do in Paris",
      "Paris travel app",
      "Paris AR tour",
      "hidden Paris",
    ],
    gradient: "from-rose-400 via-pink-500 to-violet-600",
    image: {
      src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
      alt: "Eiffel Tower at dusk",
    },
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "Winter 2026",
    teaser:
      "Gaudí's unfinished cathedral, the anarchist printshops of Raval, and a beach that didn't exist before the '92 Olympics.",
    description:
      "Barcelona's Ciro edition threads Gothic stone, Modernisme, and the politics that shaped Catalonia — surfacing the city as a living argument about identity, art, and play.",
    highlights: [
      "Modernisme architecture trail with AR reveals",
      "Stories in Catalan, Spanish, and English",
      "Curated tapas and sobremesa walks",
    ],
    keywords: [
      "things to do in Barcelona",
      "Barcelona AR tour",
      "Barcelona travel app",
      "hidden Barcelona",
    ],
    gradient: "from-amber-300 via-orange-500 to-rose-600",
    image: {
      src: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80",
      alt: "Sagrada Familia at sunset",
    },
  },
];

export const getCityBySlug = (slug: string) =>
  CITIES.find((c) => c.slug === slug);

export const liveCities = () => CITIES.filter((c) => c.status === "live");
export const upcomingCities = () => CITIES.filter((c) => c.status === "soon");
