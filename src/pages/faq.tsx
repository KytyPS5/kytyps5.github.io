import { MessageSquare } from "lucide-react";
import { Seo, softwareJsonLd } from "@/lib/seo";
import { FAQS } from "@/lib/content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { REPO_URL } from "@/lib/github";

export function FaqPage() {
  return (
    <>
      <Seo
        title="FAQ"
        description="Frequently asked questions about KytyPS5: which games work, system requirements, building from source, reporting bugs and more."
        path="/faq"
        jsonLd={softwareJsonLd()}
      />
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Straight answers, sourced from the repository. If a question isn't covered here, the issues tracker is the best place to ask."
      />
      <Section className="!pt-4">
        <Accordion
          type="single"
          collapsible
          className="mx-auto max-w-3xl rounded-panel border border-border bg-surface px-6 sm:px-10"
        >
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="grid size-12 place-items-center rounded-control border border-border bg-elevated text-accent">
            <MessageSquare className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Still have questions?
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-text-secondary">
            Ask the maintainers and community on GitHub. Search existing issues first — the answer
            may already be there.
          </p>
          <Button asChild variant="secondary">
            <a href={`${REPO_URL}/discussions`} target="_blank" rel="noreferrer noopener">
              Ask on GitHub
            </a>
          </Button>
        </div>
      </Section>
    </>
  );
}
