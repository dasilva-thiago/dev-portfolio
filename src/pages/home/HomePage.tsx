import { useEntryRedirect } from "~/features/locale-entry/useEntryRedirect";
import { SkipLink } from "~/shared/ui/SkipLink";
import { AboutSection } from "~/widgets/about/AboutSection";
import { ContactSection } from "~/widgets/contact/ContactSection";
import { Footer } from "~/widgets/footer/Footer";
import { Hero } from "~/widgets/hero/Hero";
import { ProjectsShowcase } from "~/widgets/projects/ProjectsShowcase";
import { SiteNav } from "~/widgets/site-nav/SiteNav";
import { SkillsSection } from "~/widgets/skills/SkillsSection";

export function HomePage() {
  useEntryRedirect();

  return (
    <>
      <SkipLink />
      <SiteNav />
      <main id="main-content">
        <Hero />
        <AboutSection />
        <SkillsSection />
        <ProjectsShowcase />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
