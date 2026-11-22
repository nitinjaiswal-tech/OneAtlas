"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  Building2,
  Command,
  GitCompareArrows,
  Heart,
  LayoutDashboard,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Explore models", href: "/models", icon: Boxes },
  { label: "Compare", href: "/compare", icon: GitCompareArrows },
  { label: "Rankings", href: "/rankings", icon: BarChart3 },
  { label: "Providers", href: "/providers", icon: Building2 },
  { label: "Favorites", href: "/favorites", icon: Heart },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = search.trim();
    router.push(value ? `/models?search=${encodeURIComponent(value)}` : "/models");
    setSearch("");
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark"><span /></span>
            <span>oneatlas<span className="brand-dot">.</span></span>
          </Link>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-icon"><Command size={15} /></span>
          <span><strong>Model catalog</strong><small>Demo workspace</small></span>
        </div>
        <p className="nav-caption">DISCOVER</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} className={`nav-link ${active ? "nav-link-active" : ""}`} onClick={() => setMenuOpen(false)}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
                {href === "/favorites" && <span className="nav-new">Saved</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-card">
            <span className="status-indicator" />
            <span><strong>Catalog status</strong><small>Demo data · Local catalog</small></span>
          </div>
          <Link className="side-footer-link" href="/providers">
            <span className="avatar avatar-small">OA</span><span>Explore ecosystem</span><ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      <main className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={19} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{pageLabel(pathname)}</strong></div>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={15} />
            <input aria-label="Search AI models" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search models..." />
          </form>
          <Link className="topbar-cta" href="/finder"><Sparkles size={15} /><span>Model finder</span></Link>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function pageLabel(pathname: string) {
  if (pathname.startsWith("/models/")) return "Model details";
  if (pathname.startsWith("/providers/")) return "Provider details";
  const route = pathname.split("/")[1];
  return navigation.find((item) => item.href === `/${route}`)?.label ?? (route === "finder" ? "Smart model finder" : "Overview");
}
