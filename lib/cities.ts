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
    storiesCount: 0,
    teaser:
      "Walk where emperors plotted, where Bernini carved and where Caravaggio picked his fights. Most streets here hold more than one century.",
    description:
      "Rome is Ciro’s first city. From the basilicas buried under San Clemente to the small squares of Trastevere, a narrator tells you what happened where you are standing, while you walk. Frescoes you would walk past, what the crowds said about gladiators, and how Egyptian obelisks ended up in Roman piazzas.",
    highlights: [
      "Hand-written stories tied to real places in the historic centre",
      "AR moments at selected landmarks",
      "Narrated in English, Italian and Farsi",
      "Walking routes checked on foot before they ship",
    ],
    keywords: [
      "things to do in Rome",
      "hidden places in Rome",
      "Rome AR tour",
      "Rome travel app",
      "best Rome walking tour",
    ],
    gradient: "bg-[#c4573a]",
    image: {
      src: "/cities/rome.jpg",
      alt: "Colosseum at golden hour",
    },
  },
  {
    slug: "milan",
    name: "Milan",
    country: "Italy",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "later",
    teaser:
      "Beyond the catwalks, Milan hides Leonardo's locks, Verdi's grief, and the engineers who built modern Italy in a single courtyard.",
    description:
      "Milan is not only fashion. It is a city of canals, manifestos and quiet engineering. The Milan stories will pair the Duomo’s roof with the studios where post-war design began, and the Navigli with the bars where singers from La Scala still argue after the show.",
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
    gradient: "bg-[#1f2a44]",
    image: {
      src: "/cities/milan.jpg",
      alt: "Milan Duomo facade",
    },
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "later",
    teaser:
      "Hemingway's bar tabs, Nadar's hot air balloon, and a sewer system once toured by candlelight. Paris was never just romantic.",
    description:
      "The Paris stories go past the postcard: the Commune, the salons, the surrealists and the Algerian cafés of Belleville, told as you cross the city on foot or by metro.",
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
    gradient: "bg-[#6b8ca6]",
    image: {
      src: "/cities/paris.jpg",
      alt: "Eiffel Tower at dusk",
    },
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    status: "soon",
    storiesCount: 0,
    releaseTarget: "later",
    teaser:
      "Gaudí's unfinished cathedral, the anarchist printshops of Raval, and a beach that didn't exist before the '92 Olympics.",
    description:
      "The Barcelona stories will follow Gothic stone, Modernisme and the politics that shaped Catalonia, street by street.",
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
    gradient: "bg-[#d99b1e]",
    image: {
      src: "/cities/barcelona.jpg",
      alt: "Sagrada Familia at sunset",
    },
  },
];

export const getCityBySlug = (slug: string) =>
  CITIES.find((c) => c.slug === slug);

export const liveCities = () => CITIES.filter((c) => c.status === "live");
export const upcomingCities = () => CITIES.filter((c) => c.status === "soon");
