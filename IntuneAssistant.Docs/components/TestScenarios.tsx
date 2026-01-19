// TypeScript
"use client";

import { useMemo, useState } from "react";

type TestScenario = {
  id: string;
  category: string;
  whatItTests: string;
  scenario: string;
  input: string;
  expectedResult: string;
  whyItMatters: string;
  businessValue: string;
  testedFor: string;
  migrationStatus?: string;
};

const SCENARIOS: TestScenario[] = [
  {
    id: "6.1",
    category: "Complete Workflow Tests",
    whatItTests: "Basic assignment creation workflow",
    scenario: 'Administrator wants to assign a policy to "Test Group"',
    input: 'Add "Test Group" to a policy with no existing assignments',
    expectedResult: [
      "No errors occur",
      "System confirms 1 successful assignment",
      "Policy service is called correctly",
      "Migration completes",
    ].join("\n"),
    whyItMatters: "Core functionality validation",
    businessValue: "Confirms basic feature works",
    testedFor: "Settings Catalog policies",
  },
  {
    id: "6.2",
    category: "Complete Workflow Tests",
    whatItTests: "Efficient bulk assignment across policies",
    scenario: "Administrator assigns groups to 2 different policies",
    input: ['Add "Group A" to Policy 1', 'Add "Group B" to Policy 2'].join(
      "\n",
    ),
    expectedResult: [
      "2 successful assignments confirmed",
      "Each policy service called correctly",
      "Migration processes both policies",
    ].join("\n"),
    whyItMatters: "Validates batch processing efficiency",
    businessValue: "Time savings for administrators",
    testedFor: "Settings Catalog policies, Device Compliance policies",
  },
  {
    id: "6.3",
    category: "Complete Workflow Tests",
    whatItTests: "Prevention of contradictory operations",
    scenario: [
      'Add "Test Group" to Policy A',
      'Remove "Test Group" from Policy A (in same batch)',
    ].join("\n"),
    input: "Single batch request containing conflicting add/remove operations",
    expectedResult: "System rejects with clear conflict message",
    whyItMatters: "Prevents logical errors and data inconsistency",
    businessValue: "Data integrity protection, clear error feedback",
    testedFor: "Settings Catalog policies, Device Compliance policies",
    migrationStatus: "NOT executed (conflict prevented it)",
  },
  {
    id: "6.4",
    category: "Complete Workflow Tests",
    whatItTests: "Conflict detection including filter configurations",
    scenario: [
      'Add "Test Group" with "Filter X" (Include)',
      'Remove "Test Group" with "Filter X" (Include) (in same batch)',
    ].join("\n"),
    input: "Single batch with conflicting include filters for the same group",
    expectedResult: "System detects conflict including filter details",
    whyItMatters: "Ensures comprehensive conflict detection",
    businessValue: "Prevents complex configuration errors",
    testedFor: "Settings Catalog policies, Device Compliance policies",
  },
  {
    id: "6.5",
    category: "Complete Workflow Tests",
    whatItTests: "Complex batch with different operation types",
    scenario: [
      'Policy 1: Add "Test Group"',
      'Policy 2: Remove "Second Group"',
      'Policy 3: Replace all assignments with "Test Group"',
    ].join("\n"),
    input: "Single batch containing add, remove and replace operations",
    expectedResult: [
      "3 assignments confirmed",
      "All different operation types processed correctly",
      "Migration completes for all 3 policies",
    ].join("\n"),
    whyItMatters: "Validates real-world complex scenarios",
    businessValue: "Supports sophisticated assignment management workflows",
    testedFor: "Settings Catalog policies, Device Compliance policies",
  },
];

function renderMultiline(text: string) {
  return text.split("\n").map((line, idx) => (
    <span key={idx} className="block">
      {line}
    </span>
  ));
}

export function TestScenarios() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allCategories = useMemo(
    () =>
      Array.from(new Set(SCENARIOS.map((s) => s.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [],
  );

  const allPolicyTypes = useMemo(() => {
    const set = new Set<string>();
    for (const s of SCENARIOS) {
      s.testedFor
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => set.add(p));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredScenarios = useMemo(() => {
    const q = search.trim().toLowerCase();

    return SCENARIOS.filter((s) => {
      if (categoryFilter !== "all" && s.category !== categoryFilter) {
        return false;
      }

      if (policyTypeFilter !== "all") {
        const policyTypes = s.testedFor
          .split(",")
          .map((p) => p.trim().toLowerCase());
        if (!policyTypes.includes(policyTypeFilter.toLowerCase())) {
          return false;
        }
      }

      if (!q) return true;

      const haystack = [
        s.id,
        s.category,
        s.whatItTests,
        s.scenario,
        s.input,
        s.expectedResult,
        s.whyItMatters,
        s.businessValue,
        s.testedFor,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [search, categoryFilter, policyTypeFilter]);

  return (
    <div className="not-prose">
      {/* Hero / header */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-sky-900/40 via-neutral-950 to-slate-950 px-6 py-8 shadow-2xl">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Quality coverage
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-50 md:text-3xl">
              Tested scenarios catalog
            </h1>
            <p className="mt-3 text-sm text-neutral-200 md:text-base">
              A human\-friendly view of what your automated tests actually
              cover: workflows, edge cases and business value. Use search and
              filters to check whether your scenario is supported.
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/40 bg-black/40 px-4 py-3 text-xs text-neutral-200 shadow-lg backdrop-blur">
            <p className="text-[11px] uppercase tracking-wide text-sky-300">
              Overview
            </p>
            <p className="mt-1">
              <span className="text-2xl font-semibold text-neutral-50">
                {filteredScenarios.length}
              </span>{" "}
              <span className="text-neutral-400">
                of {SCENARIOS.length} scenarios
              </span>
            </p>
            <p className="mt-1 text-[11px] text-neutral-400">
              Filtered by search, category and policy type.
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Search scenarios
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                🔍
              </span>
              <input
                type="search"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900/80 pl-8 pr-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Search by scenario, policy, business value, etc."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                Category
              </label>
              <select
                className="min-w-[11rem] rounded-lg border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-400">
                Policy type
              </label>
              <select
                className="min-w-[12rem] rounded-lg border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-neutral-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={policyTypeFilter}
                onChange={(e) => setPolicyTypeFilter(e.target.value)}
              >
                <option value="all">All policy types</option>
                {allPolicyTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {(search || categoryFilter !== "all" || policyTypeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setPolicyTypeFilter("all");
                }}
                className="text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mt-6">
        {filteredScenarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
            No scenarios match the current filters.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredScenarios.map((s) => {
              const isExpanded = expandedId === s.id;
              const policyTags = s.testedFor
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean);

              return (
                <article
                  key={s.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-slate-950 p-4 shadow-lg transition hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                        Test {s.id}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 text-right">
                      {s.category}
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-neutral-50">
                    {s.whatItTests}
                  </h2>

                  {policyTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {policyTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {s.migrationStatus && (
                    <p className="mt-1 text-[11px] text-amber-300">
                      <span className="font-medium">Migration status:</span>{" "}
                      {s.migrationStatus}
                    </p>
                  )}

                  <p className="mt-1 text-[11px] text-neutral-300">
                    <span className="font-medium text-neutral-200">
                      Business value:
                    </span>{" "}
                    {s.businessValue}
                  </p>

                  <p className="text-[11px] text-neutral-400">
                    <span className="font-medium text-neutral-200">
                      Why it matters:
                    </span>{" "}
                    {s.whyItMatters}
                  </p>

                  {/* Collapsible details */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : s.id)
                    }
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300"
                  >
                    {isExpanded ? "Hide details" : "View details"}
                    <span className="text-[9px]">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 text-[11px] text-neutral-300">
                      <div>
                        <span className="font-medium text-neutral-100">
                          Scenario
                        </span>
                        <div className="mt-0.5 text-neutral-300">
                          {renderMultiline(s.scenario)}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-neutral-100">
                          Input
                        </span>
                        <div className="mt-0.5 text-neutral-300">
                          {renderMultiline(s.input)}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-neutral-100">
                          Expected result
                        </span>
                        <div className="mt-0.5 text-neutral-300">
                          {renderMultiline(s.expectedResult)}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}