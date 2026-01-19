// TypeScript
// `IntuneAssistant.Docs/app/test-scenarios/page.tsx`
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
    input: [
      'Add "Group A" to Policy 1',
      'Add "Group B" to Policy 2',
    ].join("\n"),
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

function groupByCategory(scenarios: TestScenario[]): Record<string, TestScenario[]> {
  return scenarios.reduce<Record<string, TestScenario[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
}

function renderMultiline(text: string) {
  return text.split("\n").map((line, idx) => (
    <span key={idx} className="block">
      {line}
    </span>
  ));
}

export default function TestScenariosPage() {
  const grouped = groupByCategory(SCENARIOS);

  return (
    <main className="prose max-w-4xl mx-auto py-8">
      <h1>Tested Scenarios</h1>
      <p>
        This page summarizes real-world scenarios covered by automated tests.
        Use it to verify whether your workflow is currently supported.
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="mt-10">
          <h2>{category}</h2>

          {items.map((s) => (
            <article
              key={s.id}
              className="border border-neutral-700 rounded-md p-4 mt-4 bg-neutral-950/40"
            >
              <h3 className="mt-0">
                Test {s.id}: {s.whatItTests}
              </h3>

              <p>
                <strong>Scenario:</strong>
                <br />
                {renderMultiline(s.scenario)}
              </p>

              <p>
                <strong>Input:</strong>
                <br />
                {renderMultiline(s.input)}
              </p>

              <p>
                <strong>Expected result:</strong>
                <br />
                {renderMultiline(s.expectedResult)}
              </p>

              {s.migrationStatus && (
                <p>
                  <strong>Migration status:</strong> {s.migrationStatus}
                </p>
              )}

              <p>
                <strong>Why it matters:</strong> {s.whyItMatters}
              </p>

              <p>
                <strong>Business value:</strong> {s.businessValue}
              </p>

              <p>
                <strong>Tested for:</strong> {s.testedFor}
              </p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}