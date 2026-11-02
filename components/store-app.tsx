"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, Copy, Edit3, Eye, EyeOff,
  AtSign, Glasses, Grid2X2, Heart, Home, ImagePlus, LogOut,
  MapPin, MenuSquare, Minus, PackagePlus, Plus, RotateCcw, Search, Settings2,
  ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Trash2, Upload, X, ZoomIn,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categories, demoProducts } from "@/lib/demo-products";
import type { Product, ProductStatus, StoreSettings } from "@/lib/store-types";
import { StoreProvider, useStore } from "./store-provider";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const statusLabel: Record<ProductStatus, string> = {
  disponivel: "Disponível", reservado: "Reservado", vendido: "Vendido", indisponivel: "Indisponível",
};

type Navigate = (path: string) => void;

function usePathname() {
  const [path, setPath] = useState("/");
  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const navigate = useCallback((next: string) => {
    window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return { path, navigate };
}

function Header({ path, navigate }: { path: string; navigate: Navigate }) {
  const { cart, settings } = useStore();
  const count = Object.values(cart).reduce((sum, item) => sum + item, 0);
  const links = [["/", "Início"], ["/catalogo", "Catálogo"], ["/favoritos", "Favoritos"], ["/sobre", "A ótica"]];
  return (
    <header className="site-header glass">
      <button className="wordmark" onClick={() => navigate("/")} aria-label="Ir para o início">
        <Glasses size={26} strokeWidth={1.5} /><span>{settings.storeName}</span>
      </button>
      <nav className="desktop-nav" aria-label="Navegação principal">
        {links.map(([href, label]) => <button key={href} className={path === href ? "active" : ""} onClick={() => navigate(href)}>{label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="icon-button search-shortcut" onClick={() => navigate("/buscar")} aria-label="Buscar"><Search size={20} /></button>
        <button className="icon-button bag-shortcut" onClick={() => navigate("/sacola")} aria-label={`Sacola com ${count} itens`}>
          <ShoppingBag size={20} />{count > 0 && <span className="count-badge">{count}</span>}
        </button>
      </div>
    </header>
  );
}

function BottomNav({ path, navigate }: { path: string; navigate: Navigate }) {
  const { cart } = useStore();
  const count = Object.values(cart).reduce((sum, item) => sum + item, 0);
  const items = [
    { href: "/", label: "Início", icon: Home },
    { href: "/catalogo", label: "Catálogo", icon: Grid2X2 },
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/sacola", label: "Sacola", icon: ShoppingBag, badge: count },
  ];
  return (
    <nav className="bottom-nav glass" aria-label="Navegação inferior">
      {items.map(({ href, label, icon: Icon, badge }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return <button key={href} className={active ? "active" : ""} onClick={() => navigate(href)} aria-current={active ? "page" : undefined}>
          <span className="nav-icon"><Icon size={22} strokeWidth={active ? 2.2 : 1.6} />{!!badge && <span className="nav-badge">{badge}</span>}</span>
          <span>{label}</span>{active && <motion.i layoutId="nav-indicator" />}
        </button>;
      })}
    </nav>
  );
}

function ProductCard({ product, navigate, onNotice }: { product: Product; navigate: Navigate; onNotice: (text: string) => void }) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const favorite = favorites.includes(product.id);
  const blocked = product.status === "vendido" || product.status === "indisponivel";
  return (
    <motion.article className="product-card" layout whileHover={{ y: -4 }}>
      <div className="product-visual">
        <button className="product-open" onClick={() => navigate(`/produto/${product.slug}`)} aria-label={`Ver ${product.name}`}>
          <img src={product.image} alt={`${product.name}, produto ilustrativo`} style={{ objectPosition: product.imagePosition }} loading="lazy" />
        </button>
        <button className={`favorite-button ${favorite ? "selected" : ""}`} onClick={() => { toggleFavorite(product.id); onNotice(favorite ? "Removido dos favoritos" : "Salvo nos favoritos"); }} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
          <Heart size={19} fill={favorite ? "currentColor" : "none"} />
        </button>
        {product.status !== "disponivel" && <span className={`status-chip ${product.status}`}>{statusLabel[product.status]}</span>}
      </div>
      <div className="product-info">
        <button className="product-title" onClick={() => navigate(`/produto/${product.slug}`)}><span>{product.categoryLabel}</span><strong>{product.name}</strong></button>
        <div className="product-price"><span>{money.format(product.price)}</span><small>ilustrativo</small></div>
        <button className="quick-add" disabled={blocked} onClick={() => { addToCart(product.id); onNotice(`${product.name} foi para a sacola`); }}>
          {blocked ? statusLabel[product.status] : <><ShoppingBag size={17} /> Adicionar</>}
        </button>
      </div>
    </motion.article>
  );
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{action && <button onClick={onAction}>{action}<ArrowRight size={17} /></button>}</div>;
}

function ProductRail({ products, navigate, onNotice }: { products: Product[]; navigate: Navigate; onNotice: (text: string) => void }) {
  return <div className="product-rail">{products.map((product) => <ProductCard key={product.id} product={product} navigate={navigate} onNotice={onNotice} />)}</div>;
}

function HomePage({ navigate, onNotice }: { navigate: Navigate; onNotice: (text: string) => void }) {
  const { products, settings } = useStore();
  const visible = products.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured).slice(0, 6);
  const newest = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  return <>
    <section className="hero-section">
      <motion.img initial={{ scale: 1.04, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .8 }} src={settings.heroImage} alt="Armações sofisticadas em cenário de estúdio" />
      <div className="hero-shade" />
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12, duration: .65 }}>
        <span className="eyebrow-light"><Sparkles size={14} /> Curadoria Vanazzi</span>
        <h1>Seu estilo.<br />Seu olhar.</h1>
        <p>Armações escolhidas para revelar o que há de mais singular em você.</p>
        <button className="primary-button light" onClick={() => navigate("/catalogo")}>Explorar coleção <ArrowRight size={18} /></button>
      </motion.div>
      <div className="hero-note glass"><BadgeCheck size={17} /><span>Atendimento próximo e personalizado<br /><small>{settings.city}</small></span></div>
    </section>

    <section className="page-section categories-section">
      <SectionHeading eyebrow="Encontre o seu" title="Escolha por categoria" />
      <div className="category-rail">{categories.map((category, index) => <motion.button key={category.id} whileTap={{ scale: .98 }} onClick={() => navigate(`/catalogo?categoria=${category.id}`)} className="category-card">
        <img src={category.image} alt="" style={{ objectPosition: index % 2 ? "72% 30%" : "25% 35%" }} /><span>{category.label}</span><ArrowRight size={17} />
      </motion.button>)}</div>
    </section>

    <section className="page-section"><SectionHeading eyebrow="Seleção especial" title="Destaques da curadoria" action="Ver tudo" onAction={() => navigate("/catalogo")} /><ProductRail products={featured} navigate={navigate} onNotice={onNotice} /></section>

    <section className="editorial-banner page-section">
      <div className="editorial-image"><img src="/images/optical-collection.png" alt="Coleção de armações ópticas em tons naturais" /></div>
      <div className="editorial-copy"><span className="eyebrow">Novos clássicos</span><h2>Leveza que transforma o olhar.</h2><p>Metais delicados, acetatos translúcidos e uma paleta inspirada na luz da Serra.</p><button className="text-button" onClick={() => navigate("/catalogo?categoria=grau")}>Descobrir armações <ArrowRight size={18} /></button></div>
    </section>

    <section className="page-section"><SectionHeading eyebrow="Recém-chegados" title="Novidades na Vanazzi" /><ProductRail products={newest} navigate={navigate} onNotice={onNotice} /></section>

    <section className="service-section page-section">
      <div><span className="eyebrow">Atendimento humano</span><h2>Gostou de uma peça?</h2><p>Monte sua seleção e receba um atendimento personalizado. Nesta demonstração, a mensagem é preparada sem enviar para um número real.</p></div>
      <button className="primary-button" onClick={() => navigate("/sacola")}><ShoppingBag size={18} /> Montar minha seleção</button>
    </section>
  </>;
}

function FilterPanel({ category, setCategory, status, setStatus, close }: { category: string; setCategory: (v: string) => void; status: string; setStatus: (v: string) => void; close?: () => void }) {
  return <div className="filter-content"><div className="filter-mobile-head"><h3>Filtrar produtos</h3>{close && <button className="icon-button" onClick={close} aria-label="Fechar filtros"><X /></button>}</div>
    <label>Categoria<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="todos">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
    <label>Disponibilidade<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="todos">Todos os status</option><option value="disponivel">Disponíveis</option><option value="reservado">Reservados</option></select></label>
    <button className="secondary-button" onClick={() => { setCategory("todos"); setStatus("todos"); }}>Limpar filtros</button>
    {close && <button className="primary-button filter-apply" onClick={close}>Ver resultados</button>}
  </div>;
}

function CatalogPage({ navigate, onNotice }: { navigate: Navigate; onNotice: (text: string) => void }) {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const initialCategory = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("categoria") || "todos" : "todos";
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("todos");
  const [sort, setSort] = useState("recentes");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const result = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const list = products.filter((p) => !p.hidden && (category === "todos" || p.category === category) && (status === "todos" || p.status === status) && (!normalized || `${p.name} ${p.code} ${p.categoryLabel}`.toLowerCase().includes(normalized)));
    return [...list].sort((a, b) => sort === "menor" ? a.price - b.price : sort === "maior" ? b.price - a.price : b.createdAt.localeCompare(a.createdAt));
  }, [products, category, status, query, sort]);
  return <div className="catalog-page page-section">
    <div className="page-intro"><span className="eyebrow">Catálogo ilustrativo</span><h1>Uma curadoria para cada olhar.</h1><p>Explore {products.filter((p) => !p.hidden).length} peças demonstrativas e salve suas favoritas.</p></div>
    <div className="catalog-toolbar glass"><div className="search-field"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome, categoria ou código" aria-label="Buscar no catálogo" />{query && <button onClick={() => setQuery("")} aria-label="Limpar busca"><X size={17} /></button>}</div><button className="filter-trigger" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Filtrar</button><label className="sort-field"><span>Ordenar</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recentes">Mais recentes</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option></select><ChevronDown size={15} /></label></div>
    <div className="catalog-layout"><aside className="desktop-filters"><h3>Filtros</h3><FilterPanel category={category} setCategory={setCategory} status={status} setStatus={setStatus} /></aside><div className="catalog-results"><div className="result-count"><span>{result.length} {result.length === 1 ? "produto" : "produtos"}</span>{category !== "todos" && <button onClick={() => setCategory("todos")}>{categories.find((c) => c.id === category)?.label}<X size={14} /></button>}</div>{result.length ? <motion.div layout className="product-grid">{result.map((p) => <ProductCard key={p.id} product={p} navigate={navigate} onNotice={onNotice} />)}</motion.div> : <EmptyState icon={Search} title="Nenhuma peça encontrada" text="Experimente ajustar a busca ou limpar os filtros." action="Limpar filtros" onAction={() => { setQuery(""); setCategory("todos"); setStatus("todos"); }} />}</div></div>
    <AnimatePresence>{filtersOpen && <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)}><motion.aside className="filter-sheet glass" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} onClick={(e) => e.stopPropagation()}><FilterPanel category={category} setCategory={setCategory} status={status} setStatus={setStatus} close={() => setFiltersOpen(false)} /></motion.aside></motion.div>}</AnimatePresence>
  </div>;
}

function SearchPage({ navigate, onNotice }: { navigate: Navigate; onNotice: (text: string) => void }) {
  const { products } = useStore();
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const result = query.trim() ? products.filter((p) => !p.hidden && `${p.name} ${p.code} ${p.categoryLabel}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12) : [];
  return <div className="search-page page-section"><div className="search-hero"><span className="eyebrow">Busca rápida</span><h1>O que combina com você?</h1><div className="search-field large glass"><Search /><input ref={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busque por nome, código ou categoria" />{query && <button onClick={() => setQuery("")} aria-label="Limpar"><X /></button>}</div></div>{query ? (result.length ? <div className="product-grid search-results">{result.map((p) => <ProductCard key={p.id} product={p} navigate={navigate} onNotice={onNotice} />)}</div> : <EmptyState icon={Search} title="Nenhum resultado" text="Tente buscar por “sol”, “grau” ou pelo código da peça." />) : <div className="search-suggestions"><span>Buscas sugeridas</span>{["Óculos de sol", "Armações femininas", "Tartaruga", "Acessórios"].map((item) => <button key={item} onClick={() => setQuery(item)}>{item}<ArrowRight size={16} /></button>)}</div>}</div>;
}

function FavoritesPage({ navigate, onNotice }: { navigate: Navigate; onNotice: (text: string) => void }) {
  const { products, favorites } = useStore();
  const result = products.filter((p) => favorites.includes(p.id) && !p.hidden);
  return <div className="page-section standard-page"><div className="page-intro"><span className="eyebrow">Sua seleção</span><h1>Favoritos</h1><p>As peças que chamaram sua atenção ficam guardadas neste dispositivo.</p></div>{result.length ? <div className="product-grid">{result.map((p) => <ProductCard key={p.id} product={p} navigate={navigate} onNotice={onNotice} />)}</div> : <EmptyState icon={Heart} title="Sua lista está vazia" text="Toque no coração de uma peça para encontrá-la aqui depois." action="Explorar catálogo" onAction={() => navigate("/catalogo")} />}</div>;
}

function buildMessage(items: { product: Product; quantity: number }[], single?: Product) {
  if (single) return `Olá! Tenho interesse no produto ${single.name} (${single.code}). Valor demonstrativo: ${money.format(single.price)}. Link: ${typeof window !== "undefined" ? `${window.location.origin}/produto/${single.slug}` : ""}`;
  const lines = items.map(({ product, quantity }) => `• ${product.name} (${product.code}) — ${quantity}x ${money.format(product.price)}`);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return `Olá! Gostaria de solicitar um orçamento para:\n\n${lines.join("\n")}\n\nTotal demonstrativo: ${money.format(total)}\n\nEnviado pelo catálogo Ótica Vanazzi.`;
}

function QuoteModal({ message, onClose }: { message: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div className="quote-modal glass" initial={{ opacity: 0, scale: .96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} onClick={(e) => e.stopPropagation()}><button className="modal-close icon-button" onClick={onClose}><X /></button><div className="modal-icon"><ShieldCheck /></div><span className="eyebrow">Modo demonstração seguro</span><h2>Mensagem pronta.</h2><p>Nenhum WhatsApp real será aberto. Copie a mensagem para validar o fluxo comercial com segurança.</p><textarea readOnly value={message} /><button className="primary-button" onClick={async () => { await navigator.clipboard.writeText(message); setCopied(true); }}>{copied ? <><Check size={18} /> Copiado</> : <><Copy size={18} /> Copiar mensagem</>}</button></motion.div></motion.div>;
}

function CartPage({ navigate, onQuote }: { navigate: Navigate; onQuote: (message: string) => void }) {
  const { products, cart, setQuantity, clearCart } = useStore();
  const items = Object.entries(cart).map(([id, quantity]) => ({ product: products.find((p) => p.id === id), quantity })).filter((item): item is { product: Product; quantity: number } => !!item.product);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <div className="cart-page page-section"><div className="page-intro"><span className="eyebrow">Orçamento sem compromisso</span><h1>Sua sacola</h1><p>Revise a seleção antes de preparar a mensagem de atendimento.</p></div>{items.length ? <div className="cart-layout"><div className="cart-list">{items.map(({ product, quantity }) => <article key={product.id} className="cart-item"><button className="cart-image" onClick={() => navigate(`/produto/${product.slug}`)}><img src={product.image} alt="" style={{ objectPosition: product.imagePosition }} /></button><div className="cart-copy"><small>{product.code}</small><button onClick={() => navigate(`/produto/${product.slug}`)}>{product.name}</button><span>{money.format(product.price)}</span><div className="quantity-control"><button onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Diminuir quantidade"><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity(product.id, quantity + 1)} aria-label="Aumentar quantidade"><Plus size={15} /></button></div></div><button className="remove-item" onClick={() => setQuantity(product.id, 0)} aria-label="Remover item"><Trash2 size={18} /></button></article>)}<button className="clear-cart" onClick={clearCart}><Trash2 size={16} /> Limpar sacola</button></div><aside className="cart-summary glass"><h2>Resumo</h2><div><span>{items.reduce((s, i) => s + i.quantity, 0)} itens</span><strong>{money.format(total)}</strong></div><small>Valores e disponibilidade são ilustrativos. O orçamento final será confirmado no atendimento.</small><button className="whatsapp-button" onClick={() => onQuote(buildMessage(items))}><ShoppingBag size={18} /> Solicitar orçamento</button><p><ShieldCheck size={15} /> Modo demonstração: envio real desativado.</p></aside></div> : <EmptyState icon={ShoppingBag} title="Sua sacola está vazia" text="Adicione peças para preparar uma solicitação de orçamento." action="Explorar catálogo" onAction={() => navigate("/catalogo")} />}</div>;
}

function ProductPage({ slug, navigate, onNotice, onQuote }: { slug: string; navigate: Navigate; onNotice: (text: string) => void; onQuote: (message: string) => void }) {
  const { products, favorites, toggleFavorite, addToCart } = useStore();
  const [zoom, setZoom] = useState(false);
  const product = products.find((p) => p.slug === slug && !p.hidden);
  if (!product) return <div className="page-section standard-page"><EmptyState icon={Glasses} title="Peça não encontrada" text="Este item pode ter sido removido ou ocultado." action="Voltar ao catálogo" onAction={() => navigate("/catalogo")} /></div>;
  const favorite = favorites.includes(product.id);
  const related = products.filter((p) => !p.hidden && p.category === product.category && p.id !== product.id).slice(0, 4);
  const blocked = product.status === "vendido" || product.status === "indisponivel";
  return <div className="product-page page-section"><button className="back-button" onClick={() => navigate("/catalogo")}><ArrowLeft size={18} /> Catálogo</button><div className="product-detail"><div className="gallery"><button className={`gallery-main ${zoom ? "zoomed" : ""}`} onClick={() => setZoom(!zoom)} aria-label="Ampliar imagem"><img src={product.image} alt={`${product.name}, visualização ampliada`} style={{ objectPosition: product.imagePosition }} /><span className="glass"><ZoomIn size={17} /> {zoom ? "Reduzir" : "Ampliar"}</span></button><div className="gallery-thumbs">{[product.image, product.image].map((image, i) => <button className={i === 0 ? "active" : ""} key={i}><img src={image} alt="" style={{ objectPosition: i ? "center" : product.imagePosition }} /></button>)}</div></div><div className="product-detail-copy"><span className="eyebrow">{product.categoryLabel}</span><h1>{product.name}</h1><p className="product-code">Código {product.code}</p><span className={`availability ${product.status}`}><i />{statusLabel[product.status]}</span><div className="detail-price">{money.format(product.price)}<small>Preço demonstrativo</small></div><p className="detail-description">{product.description} Imagens, preço e especificações compõem um catálogo ilustrativo para apresentação comercial.</p><div className="detail-actions"><button className="primary-button" disabled={blocked} onClick={() => { addToCart(product.id); onNotice("Adicionado à sacola"); }}>{blocked ? statusLabel[product.status] : <><ShoppingBag size={18} /> Adicionar à sacola</>}</button><button className={`favorite-detail ${favorite ? "selected" : ""}`} onClick={() => toggleFavorite(product.id)}><Heart size={19} fill={favorite ? "currentColor" : "none"} /> {favorite ? "Salvo" : "Favoritar"}</button></div><button className="interest-button" onClick={() => onQuote(buildMessage([], product))}>Tenho interesse nesta peça <ArrowRight size={18} /></button><div className="detail-trust"><span><BadgeCheck size={18} /> Curadoria especializada</span><span><ShieldCheck size={18} /> Atendimento personalizado</span></div></div></div>{related.length > 0 && <section className="related-section"><SectionHeading eyebrow="Você também pode gostar" title="Peças relacionadas" /><ProductRail products={related} navigate={navigate} onNotice={onNotice} /></section>}</div>;
}

function AboutPage({ navigate }: { navigate: Navigate }) {
  return <div className="about-page"><section className="about-hero page-section"><div><span className="eyebrow">Ótica Vanazzi</span><h1>Ver bem também é sentir-se bem.</h1><p>Uma experiência digital criada para valorizar atendimento próximo, curadoria e estilo — com a leveza de uma boutique contemporânea.</p><button className="primary-button" onClick={() => navigate("/catalogo")}>Conhecer a coleção</button></div><img src="/images/hero-frames.png" alt="Armações em composição editorial" /></section><section className="values-grid page-section"><article><span>01</span><h2>Curadoria</h2><p>Uma seleção com personalidade, conforto e proporções para diferentes rostos.</p></article><article><span>02</span><h2>Proximidade</h2><p>Atendimento humano e orientação para tornar a escolha mais simples.</p></article><article><span>03</span><h2>Confiança</h2><p>Disponibilidade e orçamento confirmados diretamente antes de qualquer decisão.</p></article></section></div>;
}

function EmptyState({ icon: Icon, title, text, action, onAction }: { icon: typeof Heart; title: string; text: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><div><Icon size={29} /></div><h2>{title}</h2><p>{text}</p>{action && <button className="primary-button" onClick={onAction}>{action}</button>}</div>;
}

function AdminPage({ navigate, onNotice }: { navigate: Navigate; onNotice: (text: string) => void }) {
  const { products, setProducts, settings, setSettings, resetDemo } = useStore();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"products" | "settings">("products");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAuthenticated(window.sessionStorage.getItem("vanazzi-admin") === "ok"));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const login = (e: FormEvent) => { e.preventDefault(); if (password === "vanazzi2026") { window.sessionStorage.setItem("vanazzi-admin", "ok"); setAuthenticated(true); } else onNotice("Senha demonstrativa incorreta"); };
  if (!authenticated) return <div className="admin-login"><button className="wordmark" onClick={() => navigate("/")}><Glasses /> Ótica Vanazzi</button><form className="admin-login-card glass" onSubmit={login}><div className="modal-icon"><ShieldCheck /></div><span className="eyebrow">Área protegida</span><h1>Painel administrativo</h1><p>Para esta demonstração local, use a senha abaixo. Em produção, ative autenticação Supabase.</p><label>Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite a senha" autoFocus /></label><button className="primary-button" type="submit">Entrar no painel</button><button type="button" className="demo-password" onClick={() => setPassword("vanazzi2026")}><Copy size={15} /> Usar senha: <strong>vanazzi2026</strong></button></form></div>;
  return <div className="admin-shell"><aside className="admin-sidebar glass"><button className="wordmark" onClick={() => navigate("/")}><Glasses /> Ótica Vanazzi</button><div className="admin-nav"><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}><MenuSquare /> Produtos</button><button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}><Settings2 /> Configurações</button></div><button className="admin-exit" onClick={() => { window.sessionStorage.removeItem("vanazzi-admin"); setAuthenticated(false); }}><LogOut /> Sair</button></aside><main className="admin-main"><div className="admin-top"><div><span className="eyebrow">Demonstração local</span><h1>{tab === "products" ? "Catálogo" : "Configurações"}</h1></div><button className="view-store" onClick={() => navigate("/")}><Eye size={17} /> Ver loja</button></div><div className="backend-notice"><ShieldCheck /><div><strong>Persistência neste dispositivo</strong><span>As alterações são reais nesta demonstração, mas ficam no localStorage. Conecte Supabase para banco, autenticação e uploads de produção.</span></div></div>{tab === "products" ? <AdminProducts products={products} setProducts={setProducts} editing={editing} setEditing={setEditing} showForm={showForm} setShowForm={setShowForm} onNotice={onNotice} /> : <AdminSettings settings={settings} setSettings={setSettings} resetDemo={resetDemo} onNotice={onNotice} />}</main></div>;
}

function AdminProducts({ products, setProducts, editing, setEditing, showForm, setShowForm, onNotice }: { products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>>; editing: Product | null; setEditing: (p: Product | null) => void; showForm: boolean; setShowForm: (v: boolean) => void; onNotice: (v: string) => void }) {
  const beginNew = () => { setEditing(null); setShowForm(true); };
  return <><div className="admin-stats"><article><span>Produtos</span><strong>{products.length}</strong><PackagePlus /></article><article><span>Disponíveis</span><strong>{products.filter((p) => p.status === "disponivel" && !p.hidden).length}</strong><BadgeCheck /></article><article><span>Reservados</span><strong>{products.filter((p) => p.status === "reservado").length}</strong><ShoppingBag /></article></div><div className="admin-card"><div className="admin-card-head"><div><h2>Produtos cadastrados</h2><p>Edite status, dados e visibilidade do catálogo.</p></div><button className="primary-button" onClick={beginNew}><Plus size={18} /> Novo produto</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th>Visibilidade</th><th>Ações</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt="" style={{ objectPosition: product.imagePosition }} /><span><strong>{product.name}</strong><small>{product.code}</small></span></div></td><td>{product.categoryLabel}</td><td>{money.format(product.price)}</td><td><select className={`status-select ${product.status}`} value={product.status} onChange={(e) => setProducts((list) => list.map((p) => p.id === product.id ? { ...p, status: e.target.value as ProductStatus } : p))}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td><button className="visibility-toggle" onClick={() => setProducts((list) => list.map((p) => p.id === product.id ? { ...p, hidden: !p.hidden } : p))}>{product.hidden ? <><EyeOff /> Oculto</> : <><Eye /> Visível</>}</button></td><td><div className="row-actions"><button onClick={() => { setEditing(product); setShowForm(true); }} aria-label="Editar"><Edit3 /></button><button className="danger" onClick={() => { if (window.confirm(`Excluir ${product.name}?`)) setProducts((list) => list.filter((p) => p.id !== product.id)); }} aria-label="Excluir"><Trash2 /></button></div></td></tr>)}</tbody></table></div></div><AnimatePresence>{showForm && <ProductForm product={editing} onClose={() => setShowForm(false)} onSave={(product) => { setProducts((list) => editing ? list.map((item) => item.id === product.id ? product : item) : [product, ...list]); setShowForm(false); onNotice(editing ? "Produto atualizado" : "Produto cadastrado"); }} />}</AnimatePresence></>;
}

function ProductForm({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: (p: Product) => void }) {
  const initial: Product = product || { id: crypto.randomUUID(), slug: "", name: "", code: "", category: "sol", categoryLabel: "Óculos de sol", price: 0, description: "", status: "disponivel", featured: false, hidden: false, createdAt: new Date().toISOString(), image: "/images/sunglasses-collection.png", imagePosition: "center" };
  const [form, setForm] = useState(initial);
  const update = <K extends keyof Product>(key: K, value: Product[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (e: FormEvent) => { e.preventDefault(); const cat = categories.find((c) => c.id === form.category); onSave({ ...form, slug: form.slug || form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), categoryLabel: cat?.label || form.categoryLabel }); };
  const upload = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => update("image", String(reader.result)); reader.readAsDataURL(file); };
  return <motion.div className="modal-backdrop admin-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.form className="product-form glass" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30 }} onSubmit={submit} onClick={(e) => e.stopPropagation()}><div className="form-head"><div><span className="eyebrow">{product ? "Editar produto" : "Novo produto"}</span><h2>{product?.name || "Cadastrar peça"}</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><div className="form-grid"><label className="image-upload"><img src={form.image} alt="Prévia do produto" style={{ objectPosition: form.imagePosition }} /><span><Upload size={18} /> Enviar fotografia</span><input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label><label>Nome<input required value={form.name} onChange={(e) => update("name", e.target.value)} /></label><label>Código<input required value={form.code} onChange={(e) => update("code", e.target.value)} /></label><label>Categoria<select value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label>Preço demonstrativo<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", Number(e.target.value))} /></label><label>Status<select value={form.status} onChange={(e) => update("status", e.target.value as ProductStatus)}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="wide">Descrição<textarea required value={form.description} onChange={(e) => update("description", e.target.value)} /></label><label className="check-label"><input type="checkbox" checked={!!form.featured} onChange={(e) => update("featured", e.target.checked)} /> Destaque na página inicial</label><label className="check-label"><input type="checkbox" checked={!!form.hidden} onChange={(e) => update("hidden", e.target.checked)} /> Ocultar no catálogo</label></div><div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">Salvar produto</button></div></motion.form></motion.div>;
}

function AdminSettings({ settings, setSettings, resetDemo, onNotice }: { settings: StoreSettings; setSettings: React.Dispatch<React.SetStateAction<StoreSettings>>; resetDemo: () => void; onNotice: (v: string) => void }) {
  const [form, setForm] = useState(settings);
  const upload = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((s) => ({ ...s, heroImage: String(reader.result) })); reader.readAsDataURL(file); };
  return <div className="settings-grid"><form className="admin-card settings-form" onSubmit={(e) => { e.preventDefault(); setSettings(form); onNotice("Configurações salvas"); }}><div className="admin-card-head"><div><h2>Informações da ótica</h2><p>Dados exibidos na experiência pública.</p></div></div><label>Nome da marca<input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></label><label>Cidade / região<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label>Instagram <small>(opcional, somente após confirmar)</small><input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario" /></label><label>WhatsApp <small>(DDD + número, somente após autorização)</small><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, "") })} placeholder="Ex.: 5554999999999" /></label><label className="check-label safe-mode"><input type="checkbox" checked={form.demoMode} onChange={(e) => setForm({ ...form, demoMode: e.target.checked })} /><span><strong>Modo demonstração seguro</strong><small>Prepara a mensagem sem abrir um WhatsApp real.</small></span></label><label className="banner-upload"><img src={form.heroImage} alt="Banner atual" /><span><ImagePlus /> Trocar imagem do banner</span><input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label><button className="primary-button" type="submit">Salvar configurações</button></form><div className="admin-card reset-card"><RotateCcw /><h2>Restaurar demonstração</h2><p>Apaga alterações locais, favoritos e itens da sacola, restaurando os {demoProducts.length} produtos originais.</p><button className="secondary-button danger-outline" onClick={() => { if (window.confirm("Restaurar toda a demonstração?")) { resetDemo(); setForm(settings); onNotice("Demonstração restaurada"); } }}>Restaurar dados</button></div></div>;
}

function Footer({ navigate }: { navigate: Navigate }) {
  const { settings } = useStore();
  const instagramUrl = settings.instagram.startsWith("http") ? settings.instagram : `https://www.instagram.com/${settings.instagram.replace("@", "")}/`;
  return <footer className="site-footer"><div className="footer-top"><div><button className="wordmark" onClick={() => navigate("/")}><Glasses /> {settings.storeName}</button><p>Curadoria de óculos e acessórios para destacar o seu jeito de ver o mundo.</p></div><div><span>Descubra</span><button onClick={() => navigate("/catalogo")}>Catálogo</button><button onClick={() => navigate("/favoritos")}>Favoritos</button><button onClick={() => navigate("/sobre")}>A ótica</button></div><div><span>Localização</span><p><MapPin size={15} /> {settings.city}</p>{settings.instagram && <a href={instagramUrl} target="_blank" rel="noreferrer"><AtSign size={15} /> {settings.instagram}</a>}</div></div><div className="footer-bottom"><span>© 2026 Ótica Vanazzi — Demonstração comercial.</span><span>Produtos, preços e imagens ilustrativos.</span><button onClick={() => navigate("/admin")}>Administração</button></div></footer>;
}

function StoreExperience() {
  const { settings } = useStore();
  const { path, navigate } = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [notice, setNotice] = useState("");
  const [quote, setQuote] = useState("");
  const onNotice = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 2300); };
  const onQuote = (message: string) => {
    if (!settings.demoMode && settings.whatsapp) {
      window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
    setQuote(message);
  };
  const isAdmin = path.startsWith("/admin");
  let page: React.ReactNode;
  if (path === "/" || path === "") page = <HomePage navigate={navigate} onNotice={onNotice} />;
  else if (path.startsWith("/catalogo")) page = <CatalogPage navigate={navigate} onNotice={onNotice} />;
  else if (path.startsWith("/buscar")) page = <SearchPage navigate={navigate} onNotice={onNotice} />;
  else if (path.startsWith("/favoritos")) page = <FavoritesPage navigate={navigate} onNotice={onNotice} />;
  else if (path.startsWith("/sacola")) page = <CartPage navigate={navigate} onQuote={onQuote} />;
  else if (path.startsWith("/produto/")) page = <ProductPage slug={decodeURIComponent(path.split("/").pop() || "")} navigate={navigate} onNotice={onNotice} onQuote={onQuote} />;
  else if (path.startsWith("/admin")) page = <AdminPage navigate={navigate} onNotice={onNotice} />;
  else if (path.startsWith("/sobre")) page = <AboutPage navigate={navigate} />;
  else page = <div className="page-section standard-page"><EmptyState icon={Glasses} title="Página não encontrada" text="O caminho que você procurou não existe." action="Voltar ao início" onAction={() => navigate("/")} /></div>;
  if (isAdmin) return <>{page}<AnimatePresence>{notice && <motion.div className="toast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}</motion.div>}</AnimatePresence></>;
  return <div className="store-shell"><Header path={path} navigate={navigate} /><AnimatePresence mode="wait"><motion.main key={path} initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0 }} transition={{ duration: .22 }}>{page}</motion.main></AnimatePresence><Footer navigate={navigate} /><BottomNav path={path} navigate={navigate} /><AnimatePresence>{notice && <motion.div className="toast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{notice}</motion.div>}{quote && <QuoteModal message={quote} onClose={() => setQuote("")} />}</AnimatePresence></div>;
}

export default function StoreApp() { return <StoreProvider><StoreExperience /></StoreProvider>; }

