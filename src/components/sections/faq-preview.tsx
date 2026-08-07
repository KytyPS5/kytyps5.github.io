import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { FAQS } from "@/lib/content";
import { Reveal } from "@/components/layout/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqPreview() {
  return (
    <Reveal from="left" className="mx-auto max-w-3xl">
      <Accordion type="single" collapsible className="rounded-panel border border-border bg-surface px-6">
        {FAQS.slice(0, 4).map((faq, i) => (
          <AccordionItem key={faq.q} value={`faq-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-8 text-center">
        <Link
          to="/faq"
          className="group inline-flex items-center gap-2 rounded-md text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-2 focus-visible:outline-2 focus-visible:outline-accent"
        >
          View all questions
          <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </Reveal>
  );
}
