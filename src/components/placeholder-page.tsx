import { AppShell } from "@/components/app-shell";

type PlaceholderPageProps = {
  title: string;
  summary: string;
};

export function PlaceholderPage({ title, summary }: PlaceholderPageProps) {
  return (
    <AppShell>
      <main className="placeholder-main">
        <section className="placeholder-panel">
          <p className="eyebrow">Foundation route</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <p>
            This destination is reachable from the shell and ready for the next
            vertical slice.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
