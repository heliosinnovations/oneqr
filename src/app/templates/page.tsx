"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  templates,
  categories,
  type Template,
  type TemplateCategory,
} from "@/lib/templates/types";
import {
  getTemplateIcon,
  iconColorClasses,
  SearchIcon,
  ChevronDownIcon,
} from "@/components/templates/TemplateIcons";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Group templates by category for display
  const groupedTemplates = useMemo(() => {
    const grouped: Record<TemplateCategory, Template[]> = {
      popular: [],
      communication: [],
      business: [],
    };

    filteredTemplates.forEach((template) => {
      grouped[template.category].push(template);
    });

    return grouped;
  }, [filteredTemplates]);

  const handleTemplateClick = (template: Template) => {
    router.push(`/templates/${template.id}`);
  };

  // Get currently selected template for mobile view (first one by default)
  const currentTemplate = filteredTemplates[0] || templates[0];
  const CurrentIcon = getTemplateIcon(currentTemplate.id);

  return (
    <>
      <Navigation />

      {/* Mobile Template Selector */}
      <div className="block bg-white p-4 lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-4"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconColorClasses[currentTemplate.id]}`}
          >
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <strong className="block text-[15px]">
              {currentTemplate.name}
            </strong>
            <span className="text-xs text-muted">Tap to change template</span>
          </div>
          <ChevronDownIcon
            className={`h-5 w-5 text-muted transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-white p-2">
            {templates.map((template) => {
              const Icon = getTemplateIcon(template.id);
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    handleTemplateClick(template);
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses[template.id]}`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{template.name}</div>
                    <div className="truncate text-xs text-muted">
                      {template.description}
                    </div>
                  </div>
                  {template.badge && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      {template.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Page Layout */}
      <div className="grid min-h-[calc(100vh-60px)] lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] overflow-y-auto border-r border-border bg-white p-6 lg:block">
          <div className="mb-6">
            <h2 className="font-serif text-2xl">Templates</h2>
            <p className="text-sm text-muted">10 smart templates</p>
          </div>

          {/* Search */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-surface p-3">
            <SearchIcon className="h-4 w-4 flex-shrink-0 text-muted" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>

          {/* Category Groups */}
          {categories.map((category) => {
            const categoryTemplates = groupedTemplates[category.id];
            if (categoryTemplates.length === 0) return null;

            return (
              <div key={category.id} className="mb-6">
                <div className="mb-2 pl-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                  {category.label}
                </div>
                <ul className="space-y-1">
                  {categoryTemplates.map((template) => {
                    const Icon = getTemplateIcon(template.id);
                    return (
                      <li key={template.id}>
                        <Link
                          href={`/templates/${template.id}`}
                          className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-surface"
                        >
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconColorClasses[template.id]}`}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 text-sm font-semibold">
                              {template.name}
                            </div>
                            <div className="truncate text-xs text-muted">
                              {template.description}
                            </div>
                          </div>
                          {template.badge && (
                            <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                              {template.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="bg-surface p-6 lg:p-12">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 font-serif text-3xl lg:text-4xl">
                Smart QR Templates
              </h1>
              <p className="mx-auto max-w-lg text-muted">
                Choose a template below to quickly create specialized QR codes.
                Each template auto-formats your data for maximum compatibility.
              </p>
            </div>

            {/* Template Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const Icon = getTemplateIcon(template.id);
                return (
                  <Link
                    key={template.id}
                    href={`/templates/${template.id}`}
                    className="group flex flex-col rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconColorClasses[template.id]}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {template.badge && (
                        <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          {template.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 font-serif text-lg">{template.name}</h3>
                    <p className="mb-4 flex-1 text-sm text-muted">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-accent transition-colors group-hover:text-fg">
                      Use template
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredTemplates.length === 0 && (
              <div className="rounded-2xl bg-white p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
                  <SearchIcon className="h-8 w-8 text-muted" />
                </div>
                <h3 className="mb-2 font-serif text-xl">No templates found</h3>
                <p className="text-muted">
                  Try adjusting your search or browse all templates.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-fg"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">2M+</div>
                <div className="text-xs text-muted">QR codes created</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">Free</div>
                <div className="text-xs text-muted">Forever</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl text-accent">∞</div>
                <div className="text-xs text-muted">Edits allowed</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
