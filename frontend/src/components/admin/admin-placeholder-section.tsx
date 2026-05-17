import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { AdminPageShell } from '@/components/admin/admin-page-shell';
import { DashboardHero, DashboardHeroPill, DashboardPanel } from '@/components/dashboard/dashboard-surfaces';
import { Card, CardContent } from '@/components/ui/card';

interface AdminPlaceholderSectionProps {
  title: string;
  description: string;
  capabilities: string[];
}

export function AdminPlaceholderSection({
  title,
  description,
  capabilities,
}: AdminPlaceholderSectionProps) {
  return (
    <AdminPageShell
      title={title}
      description={description}
      status="Scaffolded for phased implementation"
    >
      <DashboardHero
        eyebrow="Admin roadmap"
        title={`${title} is staged and ready for data-backed expansion.`}
        description="This section already lives inside the control plane. The remaining work is to replace the scaffold with operational queries, moderation tools, tables, and intervention workflows."
        icon={ShieldCheck}
      >
        <DashboardHeroPill
          icon={Workflow}
          label="Navigation"
          value="Live in shell"
          note="The route, sidebar entry, and role gate are already active for admins."
        />
        <DashboardHeroPill
          icon={Sparkles}
          label="Next step"
          value="Wire real data"
          note="Swap the placeholder for searchable queues, filters, and action paths."
        />
        <DashboardHeroPill
          icon={Clock3}
          label="Implementation"
          value="Phased rollout"
          note="Designed to accept real operational data without changing the IA."
        />
      </DashboardHero>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DashboardPanel
          title="Planned Capabilities"
          description="These are the first operational controls this section is expected to own."
          icon={CheckCircle2}
        >
          {capabilities.map((capability) => (
            <div
              key={capability}
              className="flex items-start gap-3 rounded-3xl border border-border/70 bg-background/90 px-4 py-4"
            >
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <p className="text-sm leading-6 text-foreground/90">{capability}</p>
            </div>
          ))}
        </DashboardPanel>

        <Card className="border-border/70 bg-card/80 shadow-[0_22px_70px_-48px_rgba(15,37,64,0.68)]">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 text-primary" />
                <p>
                  Route, role gate, and navigation are active so admins can move through the full
                  control-plane structure today.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/90 px-4 py-4">
              <div className="flex items-start gap-3">
                <ArrowRight className="mt-0.5 size-4 text-primary" />
                <p>
                  Replace this placeholder with real queries, filters, tables, and action workflows
                  in the next implementation batches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
}
