import type { Product, StoreSettings } from "./store-types";

const base = [
  ["Aura Noir", "OV-S001", "sol", "Óculos de sol", 489, "Cat-eye escultural em acetato preto polido e lentes em degradê.", "/images/sunglasses-collection.png", "18% 17%"],
  ["Dolce Âmbar", "OV-S002", "sol", "Óculos de sol", 459, "Volumes suaves em acetato translúcido âmbar, leve e luminoso.", "/images/sunglasses-collection.png", "78% 25%"],
  ["Riviera", "OV-S003", "sol", "Óculos de sol", 429, "Clássico tartaruga com linhas contemporâneas e proteção solar.", "/images/sunglasses-collection.png", "22% 65%"],
  ["Nero 90", "OV-S004", "masculino", "Armações masculinas", 399, "Retangular de perfil baixo com acabamento preto acetinado.", "/images/sunglasses-collection.png", "76% 78%"],
  ["Luce Gold", "OV-G001", "grau", "Óculos de grau", 519, "Aro redondo delicado em metal champanhe com plaquetas ajustáveis.", "/images/optical-collection.png", "24% 14%"],
  ["Rosé Studio", "OV-F001", "feminino", "Armações femininas", 469, "Armação soft-square rosé translúcida para um olhar leve.", "/images/optical-collection.png", "73% 29%"],
  ["Oliva", "OV-G002", "grau", "Óculos de grau", 449, "Acetato verde oliva com desenho orgânico e presença serena.", "/images/optical-collection.png", "22% 61%"],
  ["Cristal 01", "OV-G003", "grau", "Óculos de grau", 439, "Transparência cristal e linhas precisas em uma peça versátil.", "/images/optical-collection.png", "72% 82%"],
  ["Mini Sol Caramelo", "OV-I001", "infantil", "Óculos infantis", 289, "Armação infantil flexível em tom caramelo com lentes solares.", "/images/sunglasses-collection.png", "75% 28%"],
  ["Mini Cristal", "OV-I002", "infantil", "Óculos infantis", 269, "Modelo leve e confortável para acompanhar a rotina das crianças.", "/images/optical-collection.png", "72% 82%"],
  ["Case Siena", "OV-A001", "acessorios", "Pulseiras e acessórios", 119, "Estojo rígido revestido em material vegano caramelo.", "/images/accessories-collection.png", "47% 12%"],
  ["Corrente Tortoise", "OV-A002", "acessorios", "Pulseiras e acessórios", 149, "Corrente leve em elos tartaruga com terminais ajustáveis.", "/images/accessories-collection.png", "27% 72%"],
  ["Pulseira Linea", "OV-A003", "acessorios", "Pulseiras e acessórios", 129, "Pulseira minimalista em banho champanhe e fecho delicado.", "/images/accessories-collection.png", "79% 75%"],
  ["Kit Essencial", "OV-A004", "acessorios", "Pulseiras e acessórios", 79, "Flanela premium e solução para o cuidado diário das lentes.", "/images/accessories-collection.png", "72% 36%"],
  ["Brera Black", "OV-M001", "masculino", "Armações masculinas", 479, "Acetato preto com hastes finas e proporção arquitetônica.", "/images/sunglasses-collection.png", "76% 78%"],
  ["Miele", "OV-F002", "feminino", "Armações femininas", 499, "Geometria ampla em mel translúcido e acabamento de alto brilho.", "/images/sunglasses-collection.png", "78% 25%"],
  ["Milano Round", "OV-M002", "masculino", "Armações masculinas", 489, "Metal ultraleve e ponte dupla sutil para um visual contemporâneo.", "/images/optical-collection.png", "24% 14%"],
  ["Nude Muse", "OV-F003", "feminino", "Armações femininas", 459, "Acetato rosé translúcido com recorte delicado nas têmporas.", "/images/optical-collection.png", "73% 29%"],
  ["Solare", "OV-S005", "sol", "Óculos de sol", 539, "Armação ampla âmbar e lentes marrom em degradê suave.", "/images/sunglasses-collection.png", "78% 25%"],
  ["Noir Cat", "OV-F004", "feminino", "Armações femininas", 529, "Cat-eye preto de linhas ascendentes e personalidade elegante.", "/images/sunglasses-collection.png", "18% 17%"],
  ["Verde Bosco", "OV-G004", "grau", "Óculos de grau", 469, "Armação oliva inspirada em tons naturais da Serra Gaúcha.", "/images/optical-collection.png", "22% 61%"],
  ["Petit Rosé", "OV-I003", "infantil", "Óculos infantis", 279, "Soft-square rosé, leve e resistente para pequenos olhares.", "/images/optical-collection.png", "73% 29%"],
  ["Toscana", "OV-S006", "sol", "Óculos de sol", 499, "Tartaruga clássico com lentes quentes e acabamento artesanal.", "/images/sunglasses-collection.png", "22% 65%"],
  ["Clair", "OV-G005", "grau", "Óculos de grau", 419, "Cristal transparente com encaixe confortável e estética limpa.", "/images/optical-collection.png", "72% 82%"],
] as const;

export const demoProducts: Product[] = base.map((item, index) => ({
  id: `demo-${index + 1}`,
  slug: String(item[0]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name: item[0],
  code: item[1],
  category: item[2],
  categoryLabel: item[3],
  price: item[4],
  description: item[5],
  image: item[6],
  imagePosition: item[7],
  status: index === 9 ? "reservado" : index === 18 ? "vendido" : "disponivel",
  featured: [0, 1, 4, 6, 10, 14].includes(index),
  createdAt: new Date(2026, 9, Math.max(1, 28 - index)).toISOString(),
}));

export const defaultSettings: StoreSettings = {
  storeName: "Ótica Vanazzi",
  city: "Bento Gonçalves • RS",
  whatsapp: "",
  instagram: "@oticavanazzi",
  demoMode: true,
  heroImage: "/images/hero-frames.png",
};

export const categories = [
  { id: "sol", label: "Óculos de sol", image: "/images/sunglasses-collection.png" },
  { id: "grau", label: "Óculos de grau", image: "/images/optical-collection.png" },
  { id: "feminino", label: "Feminino", image: "/images/optical-collection.png" },
  { id: "masculino", label: "Masculino", image: "/images/sunglasses-collection.png" },
  { id: "infantil", label: "Infantil", image: "/images/optical-collection.png" },
  { id: "acessorios", label: "Acessórios", image: "/images/accessories-collection.png" },
];

