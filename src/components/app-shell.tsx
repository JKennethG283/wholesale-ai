"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  Gauge,
  LifeBuoy,
  Menu,
  Network,
  ScanLine,
  Search,
  ShoppingCart,
  Sparkles,
  Wine,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { navigationItems } from "@/lib/navigation";

const iconByHref: Record<string, LucideIcon> = {
  "/catalogue": Wine,
  "/cart": ShoppingCart,
  "/buyer-dashboard": Gauge,
  "/pos": ScanLine,
  "/ai-recommendations": Sparkles,
  "/ai-assistant": Bot,
  "/support": LifeBuoy,
  "/admin": BarChart3,
  "/workflow-log": Workflow,
  "/architecture": Network,
};

const navGroups = [
  { title: "Ordering", hrefs: ["/catalogue", "/cart"] },
  {
    title: "Intelligence",
    hrefs: ["/buyer-dashboard", "/pos", "/ai-recommendations", "/ai-assistant"],
  },
  { title: "Operations", hrefs: ["/support", "/admin", "/workflow-log"] },
  { title: "Platform", hrefs: ["/architecture"] },
] as const;

const labelByHref = new Map(navigationItems.map((item) => [item.href, item.label]));

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="app" data-drawer={drawerOpen ? "open" : "closed"}>
      <button
        type="button"
        className="app-overlay"
        aria-hidden={!drawerOpen}
        tabIndex={drawerOpen ? 0 : -1}
        aria-label="Close navigation"
        onClick={closeDrawer}
      />

      <aside className="sidebar" aria-label="Sidebar">
        <Link className="sidebar-brand" href="/" aria-label="LiquorOps AI overview" onClick={closeDrawer}>
          <span className="sidebar-mark">LO</span>
          <span className="sidebar-brand-text">
            <strong>LiquorOps AI</strong>
            <span>Wholesale trading desk</span>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Primary">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-group-title">{group.title}</p>
              <ul>
                {group.hrefs.map((href) => {
                  const Icon = iconByHref[href];
                  const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className="nav-link"
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeDrawer}
                      >
                        {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                        <span>{labelByHref.get(href)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <p className="sidebar-foot">
          <span className="env-dot" aria-hidden="true" />
          Synthetic demo data
        </p>
      </aside>

      <div className="app-body">
        <header className="app-topbar">
          <button
            type="button"
            className="drawer-toggle"
            aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            {drawerOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <Link className="topbar-brand" href="/" aria-label="LiquorOps AI overview" onClick={closeDrawer}>
            <span className="sidebar-mark">LO</span>
            <strong>LiquorOps AI</strong>
          </Link>
          <div className="topbar-search" role="search">
            <Search size={16} aria-hidden="true" />
            <span>Search orders, buyers, products</span>
          </div>
          <span className="topbar-chip">Prototype · synthetic data</span>
          <button type="button" className="topbar-icon-button" aria-label="Notifications">
            <Bell size={17} aria-hidden="true" />
          </button>
          <button type="button" className="topbar-account" aria-label="Open account menu">
            <span>Ops</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
