export type ProductStatus = "disponivel" | "reservado" | "vendido" | "indisponivel";

export type Product = {
  id: string;
  slug: string;
  name: string;
  code: string;
  category: string;
  categoryLabel: string;
  price: number;
  description: string;
  status: ProductStatus;
  hidden?: boolean;
  featured?: boolean;
  createdAt: string;
  image: string;
  imagePosition?: string;
};

export type StoreSettings = {
  storeName: string;
  city: string;
  whatsapp: string;
  instagram: string;
  demoMode: boolean;
  heroImage: string;
};

export type Cart = Record<string, number>;

