const revealCards = document.querySelectorAll(".reveal-card");
const cursorGlow = document.querySelector(".cursor-glow");
const languageButton = document.querySelector(".language-button");
const cover = document.querySelector(".cover");
const coverPortrait = document.querySelector(".cover-portrait");
const coverTitle = document.querySelector(".cover-copy h1");
const lineSolid = document.querySelector(".cover-copy .line.solid");
const lineOutline = document.querySelector(".cover-copy .line.outline");
const scrubTexts = document.querySelectorAll(".scrub-text");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

revealCards.forEach((card) => observer.observe(card));

scrubTexts.forEach((node) => {
  const text = node.textContent;
  node.textContent = "";

  [...text].forEach((character) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = character;
    node.appendChild(span);
  });
});

const updateScrubText = () => {
  if (reduceMotion) return;

  scrubTexts.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const progress = 1 - Math.min(Math.max((rect.top - window.innerHeight * 0.24) / (window.innerHeight * 0.58), 0), 1);
    const chars = node.querySelectorAll(".char");
    const litCount = Math.ceil(progress * chars.length);

    chars.forEach((char, index) => {
      char.classList.toggle("is-lit", index < litCount);
    });
  });
};

window.addEventListener("pointermove", (event) => {
  if (cursorGlow) {
    cursorGlow.style.opacity = "1";
    cursorGlow.style.transform = `translate(${event.clientX - 110}px, ${event.clientY - 110}px)`;
  }

  if (!cover || !coverPortrait || reduceMotion) return;

  const rect = cover.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  // Layer 1 — portrait (frontmost, moves most)
  coverPortrait.style.setProperty("--portrait-x", `${x * 36}px`);
  coverPortrait.style.setProperty("--portrait-y", `${y * 24}px`);
  coverPortrait.style.setProperty("--portrait-rx", `${y * -2.4}deg`);
  coverPortrait.style.setProperty("--portrait-ry", `${x * 3.6}deg`);

  // Layer 2 — solid "AI" (mid layer, moderate movement)
  if (lineSolid) {
    lineSolid.style.transform = `translate3d(${x * 12}px, ${y * 8}px, 0px) rotateX(${y * -1.0}deg) rotateY(${x * 1.4}deg)`;
  }

  // Layer 3 — outline "TRANSFORMATION" (rear, barely moves)
  if (lineOutline) {
    lineOutline.style.transform = `translate3d(${x * -6}px, ${y * -4}px, -120px) rotateX(${y * 0.4}deg) rotateY(${x * -0.7}deg)`;
  }
});

cover?.addEventListener("pointerleave", () => {
  if (!coverPortrait) return;
  coverPortrait.style.setProperty("--portrait-x", "0px");
  coverPortrait.style.setProperty("--portrait-y", "0px");
  coverPortrait.style.setProperty("--portrait-rx", "0deg");
  coverPortrait.style.setProperty("--portrait-ry", "0deg");
  if (lineSolid) {
    lineSolid.style.transform = "translate3d(0px, 0px, 0px)";
  }
  if (lineOutline) {
    lineOutline.style.transform = "translate3d(0px, 0px, -120px)";
  }
});

window.addEventListener("scroll", updateScrubText, { passive: true });
window.addEventListener("resize", updateScrubText);
updateScrubText();

window.addEventListener("pointerleave", () => {
  if (!cursorGlow) return;
  cursorGlow.style.opacity = "0";
});

// ── Mobile hamburger menu ─────────────────────────────────────────────────────
(function initMobileNav() {
  const btn = document.getElementById("nav-hamburger");
  const overlay = document.getElementById("mobile-nav");
  if (!btn || !overlay) return;

  function openMenu() {
    btn.setAttribute("aria-expanded", "true");
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    btn.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is tapped
  overlay.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  // Close on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });
})();

// ── Glass navbar scroll tint ─────────────────────────────────────────────────
(function initGlassNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ── Active nav section tracking ───────────────────────────────────────────────
(function initActiveNav() {
  const navLinks = document.querySelectorAll(".site-nav a[href^='#'], .mobile-nav-link[href^='#']");
  if (!navLinks.length) return;

  const desktopLinks = document.querySelectorAll(".site-nav a[href^='#']");
  const sectionIds = Array.from(desktopLinks).map(a => a.getAttribute("href").slice(1));
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function setActive(id) {
    navLinks.forEach(a => {
      const isActive = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("nav-active", isActive);
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

  sections.forEach(s => io.observe(s));

  // Set initial active based on scroll position
  setActive(sectionIds[0]);
}());

// ── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    "nav.home": "Home", "nav.about": "About Me", "nav.maturity": "AI Maturity Check",
    "nav.resources": "AI Resources", "nav.articles": "AI Articles", "nav.contact": "Contact Me",
    "hero.cta": "How AI-ready is your organisation?", "hero.contact": "Contact me",
    "meta.right": "Expert",
    "about.label": "About Me",
    "about.title": "I help organisations turn AI potential into operating practice.",
    "about.lead": "My work sits at the intersection of AI Development and AI Enablement — I can build the tool, and then help the organisation actually adopt it. That combination is rarer than it sounds.",
    "about.proof1.title": "AI Agent Development",
    "about.proof1.text": " — Identify operational pain points and translate them into working AI agents — giving teams self-service access to knowledge, without relying on colleagues.",
    "about.proof2.title": "AI Use Case Discovery & Scaling",
    "about.proof2.text": " — Facilitate structured processes to surface, score, and prioritise AI opportunities across an organisation. From idea to implementation roadmap.",
    "about.proof3.title": "AI Maturity Uplift",
    "about.proof3.text": " — Assess where teams actually stand on AI readiness. Design the training, governance, and adoption rhythm that makes AI stick beyond the pilot.",
    "about.tag1": "AI Development", "about.tag2": "AI Enablement", "about.tag3": "AI Project Management",
    "about.tag4": "Digital Transformation", "about.tag5": "Change Management", "about.tag6": "Project Management",
    "maturity.label": "AI Maturity Check",
    "maturity.landing.title": "Where does your organisation stand on AI?",
    "maturity.landing.p": "10 questions. About 3 minutes. A clear picture across five dimensions — with no sign-up required.",
    "maturity.start": "Start the assessment",
    "maturity.progress": (n, t) => `Question ${n} of ${t}`,
    "maturity.back": "← Previous question",
    "maturity.result.label": "Your AI Maturity Level",
    "maturity.restart": "Retake",
    "maturity.result.cta.p": "Want to understand what the next step looks like for your organisation?",
    "maturity.result.cta.link": "Let's talk",
    "resources.label": "AI Resources", "resources.title": "Curated tools and frameworks.",
    "resources.p": "A growing library of resources for teams getting serious about AI — tools, guides, and experts worth knowing.",
    "resources.soon.label": "Coming soon",
    "resources.soon.p": "This section is under development. Check back soon — or follow along on LinkedIn.",
    "articles.label": "AI Articles", "articles.title": "Thinking on AI transformation.",
    "articles.p": "Articles on what actually works when organisations try to adopt AI — beyond the hype and the demos.",
    "articles.soon.label": "Coming soon", "articles.soon.p": "Writing in progress. First articles dropping soon.",
    "contact.label": "Contact Me",
    "contact.title": "Based in Germany. Building and enabling AI transformation across Europe.",
    "contact.email": "Email me", "contact.linkedin": "Connect on LinkedIn",
    DIMS: ["Strategy", "Data", "Adoption", "Delivery", "Governance"],
    QUESTIONS: [
      { dim: 0, text: "How clearly defined is your organisation's AI direction?", options: ["We have no AI direction yet", "AI comes up, but priorities aren't clear", "We have an AI roadmap in development", "AI is a defined part of our business strategy"] },
      { dim: 0, text: "How aligned is leadership on AI priorities?", options: ["AI is not discussed at leadership level", "Some awareness, limited agreement", "Leadership is broadly aligned and supportive", "AI is a regular boardroom agenda item"] },
      { dim: 1, text: "How accessible and usable is your data for AI?", options: ["Data is scattered and hard to access", "Some data is organised but not AI-ready", "Key datasets are accessible and fairly clean", "Data is well-structured, governed, and AI-ready"] },
      { dim: 1, text: "Do you have data governance practices in place?", options: ["No formal data governance exists", "Basic practices, nothing formally documented", "Some governance policies are in place", "Strong data governance framework in place"] },
      { dim: 2, text: "What share of your team actively uses AI tools in daily work?", options: ["Almost nobody", "A few early adopters (under 20%)", "A significant portion (20–60%)", "Most of the team (over 60%)"] },
      { dim: 2, text: "How does your organisation respond to new AI tools?", options: ["Skepticism or resistance", "Cautious interest, slow to try", "Open to experimenting", "Proactive adoption culture"] },
      { dim: 3, text: "Has your organisation built or deployed AI-powered tools?", options: ["No, we haven't started", "We've done some small experiments", "We have 1–2 tools running in production", "Multiple AI tools deployed and actively used"] },
      { dim: 3, text: "How quickly can your team go from AI idea to working prototype?", options: ["We don't have this capability", "Months, usually with external help", "A few weeks with internal effort", "Days to weeks — fairly routine"] },
      { dim: 4, text: "Do you have guidelines for responsible AI use?", options: ["No guidelines exist", "Informal discussions, nothing documented", "Some guidelines are being developed", "Clear policies and accountability in place"] },
      { dim: 4, text: "How do you manage AI-related risks in your organisation?", options: ["We haven't thought about this", "We're aware of risks but have no process", "Some risk awareness and ad-hoc mitigation", "Structured AI risk management in place"] },
    ],
    ENCOURAGEMENTS: ["Good signal. Keep going →", "That tracks. One more →", "Noted. Moving on →", "Useful data point →", "Clear picture forming →", "Sharp. Next question →", "That tells a story →", "Understood. Onwards →", "This matters. Next →", "Almost there →"],
    LEVELS: [
      { min: 1, max: 1.7, name: "AI Curious", summary: "You're at the beginning of the journey — aware that AI matters, but yet to translate that into a clear direction or concrete action. The opportunity ahead is significant." },
      { min: 1.7, max: 2.5, name: "AI Exploring", summary: "You've started experimenting, but there are gaps between intent and execution. Some parts of the organisation are moving; others aren't. Consistency is the next challenge." },
      { min: 2.5, max: 3.3, name: "AI Developing", summary: "A solid foundation is taking shape. AI is real in your organisation — but scaling it further requires closing the gaps between your strongest and weakest dimensions." },
      { min: 3.3, max: 4.1, name: "AI Scaling", summary: "You're ahead of most organisations. AI is embedded in strategy, delivered with confidence, and adopted broadly. The work now is about deepening and governing what you've built." },
    ],
    DIM_NOTES: [
      ["Define a clear AI vision with leadership buy-in.", "AI is embedded in your strategic roadmap."],
      ["Build a data foundation before scaling AI.", "Your data is ready to fuel AI at scale."],
      ["Focus on cultural adoption and team enablement.", "AI is genuinely part of how your team works."],
      ["Build the capability to prototype and ship AI tools.", "You can turn AI ideas into real things reliably."],
      ["Establish guidelines and risk ownership for AI.", "Governance gives your AI work credibility and safety."],
    ],
  },

  de: {
    "nav.home": "Startseite", "nav.about": "Über mich", "nav.maturity": "KI-Reife Check",
    "nav.resources": "KI-Ressourcen", "nav.articles": "KI-Artikel", "nav.contact": "Kontakt",
    "hero.cta": "Wie KI-bereit ist Ihre Organisation?", "hero.contact": "Kontakt",
    "meta.right": "Experte",
    "about.label": "Über mich",
    "about.title": "Ich helfe Organisationen, KI-Potenzial in gelebte Praxis zu verwandeln.",
    "about.lead": "Meine Arbeit liegt an der Schnittstelle von KI-Entwicklung und KI-Enablement — ich kann das Tool bauen und die Organisation gleichzeitig dabei begleiten, es wirklich zu nutzen. Diese Kombination ist seltener als sie klingt.",
    "about.proof1.title": "KI-Agent-Entwicklung",
    "about.proof1.text": " — Operative Schwachstellen identifizieren und in funktionierende KI-Agenten übersetzen — Teams erhalten 24/7 Self-Service-Zugang zu Wissen, ohne auf Kollegen angewiesen zu sein.",
    "about.proof2.title": "KI Use Case Identifikation & Skalierung",
    "about.proof2.text": " — Strukturierte Prozesse zur Identifikation, Bewertung und Priorisierung von KI-Chancen in der Organisation. Von der Idee zur Implementierungs-Roadmap.",
    "about.proof3.title": "KI-Reife Uplift",
    "about.proof3.text": " — Den tatsächlichen KI-Stand der Teams bewerten. Training, Governance und Adoptions-Rhythmus gestalten, der KI über den Pilot hinaus verankert.",
    "about.tag1": "KI-Entwicklung", "about.tag2": "KI-Enablement", "about.tag3": "KI-Projektmanagement",
    "about.tag4": "Digitale Transformation", "about.tag5": "Change Management", "about.tag6": "Projektmanagement",
    "maturity.label": "KI-Reife Check",
    "maturity.landing.title": "Wo steht Ihre Organisation beim Thema KI?",
    "maturity.landing.p": "10 Fragen. Etwa 3 Minuten. Ein klares Bild über fünf Dimensionen — ohne Anmeldung.",
    "maturity.start": "Assessment starten",
    "maturity.progress": (n, t) => `Frage ${n} von ${t}`,
    "maturity.back": "← Vorherige Frage",
    "maturity.result.label": "Ihr KI-Reifegrad",
    "maturity.restart": "Wiederholen",
    "maturity.result.cta.p": "Möchten Sie verstehen, wie der nächste Schritt für Ihre Organisation aussieht?",
    "maturity.result.cta.link": "Gespräch beginnen",
    "resources.label": "KI-Ressourcen", "resources.title": "Kuratierte Tools und Frameworks.",
    "resources.p": "Eine wachsende Bibliothek von Ressourcen für Teams, die KI ernst nehmen — Tools, Leitfäden und Experten, die es wert sind.",
    "resources.soon.label": "Demnächst",
    "resources.soon.p": "Dieser Bereich befindet sich im Aufbau. Schauen Sie bald wieder vorbei — oder folgen Sie mir auf LinkedIn.",
    "articles.label": "KI-Artikel", "articles.title": "Gedanken zur KI-Transformation.",
    "articles.p": "Artikel darüber, was wirklich funktioniert, wenn Organisationen KI einführen — jenseits des Hypes und der Demos.",
    "articles.soon.label": "Demnächst", "articles.soon.p": "Texte in Arbeit. Erste Artikel erscheinen bald.",
    "contact.label": "Kontakt",
    "contact.title": "Ansässig in Deutschland. KI-Transformation in ganz Europa aufbauen und begleiten.",
    "contact.email": "E-Mail schreiben", "contact.linkedin": "Auf LinkedIn verbinden",
    DIMS: ["Strategie", "Daten", "Adoption", "Umsetzung", "Governance"],
    QUESTIONS: [
      { dim: 0, text: "Wie klar ist die KI-Strategie Ihrer Organisation?", options: ["Wir haben keine KI-Strategie", "KI steht auf der Agenda, aber ohne klare Richtung", "Eine KI-Vision ist vorhanden, aber die Umsetzung ist unklar", "Klare KI-Strategie mit definierten Prioritäten und Ressourcen"] },
      { dim: 0, text: "Wie stark wird KI in Ihrer Organisation priorisiert?", options: ["KI ist kein aktives Thema", "Vereinzeltes Interesse, aber kaum Ressourcen", "KI ist ein Fokus mit ersten Budgets", "KI ist strategisch verankert mit dedizierter Investition"] },
      { dim: 1, text: "Wie beschreiben Sie die Datenverfügbarkeit für KI in Ihrer Organisation?", options: ["Daten sind fragmentiert und schwer zugänglich", "Einige Daten sind strukturiert, aber Silos bestehen", "Gute Datenbasis, aber Qualität variiert", "Saubere, strukturierte Daten sind organisationsweit verfügbar"] },
      { dim: 1, text: "Wie werden Daten in Ihrer Organisation genutzt?", options: ["Hauptsächlich für Reporting, kaum Analyse", "Gelegentliche Analysen, keine Systematik", "Regelmäßige datengestützte Entscheidungen in einigen Bereichen", "Daten sind zentral für die Entscheidungsfindung im gesamten Unternehmen"] },
      { dim: 2, text: "Wie viele Ihrer Mitarbeitenden nutzen KI-Tools aktiv im Arbeitsalltag?", options: ["Kaum jemand", "Einige Early Adopters (unter 20 %)", "Ein bedeutender Anteil (20–60 %)", "Der Großteil des Teams (über 60 %)"] },
      { dim: 2, text: "Wie reagiert Ihre Organisation auf neue KI-Tools?", options: ["Skepsis oder Widerstand", "Vorsichtiges Interesse, langsame Adoption", "Offenheit zum Experimentieren", "Proaktive Adoptionskultur"] },
      { dim: 3, text: "Hat Ihre Organisation KI-gestützte Tools entwickelt oder eingesetzt?", options: ["Nein, wir haben noch nicht begonnen", "Wir haben kleinere Experimente durchgeführt", "Wir haben 1–2 Tools produktiv im Einsatz", "Mehrere KI-Tools sind aktiv deployed und werden genutzt"] },
      { dim: 3, text: "Wie schnell kann Ihr Team von einer KI-Idee zum funktionierenden Prototyp gelangen?", options: ["Diese Fähigkeit haben wir nicht", "Monate, meist mit externer Hilfe", "Einige Wochen mit internem Aufwand", "Tage bis Wochen — recht routiniert"] },
      { dim: 4, text: "Haben Sie Richtlinien für einen verantwortungsvollen KI-Einsatz?", options: ["Keine Richtlinien vorhanden", "Informelle Diskussionen, nichts dokumentiert", "Erste Richtlinien sind in Entwicklung", "Klare Richtlinien und Verantwortlichkeiten etabliert"] },
      { dim: 4, text: "Wie managen Sie KI-bezogene Risiken in Ihrer Organisation?", options: ["Wir haben darüber noch nicht nachgedacht", "Risiken sind bekannt, aber kein Prozess vorhanden", "Einige Risikobewusstsein und Ad-hoc-Maßnahmen", "Strukturiertes KI-Risikomanagement etabliert"] },
    ],
    ENCOURAGEMENTS: ["Gutes Signal. Weiter →", "Passt. Nächste →", "Notiert. Weiter →", "Interessanter Datenpunkt →", "Klares Bild entsteht →", "Scharf. Nächste Frage →", "Das sagt viel →", "Verstanden. Weiter →", "Das ist wichtig. Nächste →", "Fast geschafft →"],
    LEVELS: [
      { min: 1, max: 1.7, name: "KI-Neugierig", summary: "Sie stehen am Anfang der Reise — KI ist im Bewusstsein, aber noch nicht in klare Richtung oder konkrete Maßnahmen übersetzt. Das Potenzial ist groß." },
      { min: 1.7, max: 2.5, name: "KI-Explorativ", summary: "Erste Schritte sind gemacht, aber es gibt Lücken zwischen Absicht und Umsetzung. Teile der Organisation bewegen sich, andere noch nicht. Konsistenz ist die nächste Herausforderung." },
      { min: 2.5, max: 3.3, name: "KI in Entwicklung", summary: "Eine solide Grundlage nimmt Form an. KI ist real in Ihrer Organisation — aber zur weiteren Skalierung müssen die Lücken zwischen stärksten und schwächsten Dimensionen geschlossen werden." },
      { min: 3.3, max: 4.1, name: "KI-Skalierend", summary: "Sie sind den meisten Organisationen voraus. KI ist in der Strategie verankert, wird mit Zuversicht umgesetzt und breit adoptiert. Es geht jetzt darum, das Erreichte zu vertiefen und zu steuern." },
    ],
    DIM_NOTES: [
      ["Eine klare KI-Vision mit Leadership-Rückhalt definieren.", "KI ist in Ihrer strategischen Roadmap verankert."],
      ["Datenfundament aufbauen, bevor KI skaliert wird.", "Ihre Daten sind bereit, KI im großen Maßstab zu befeuern."],
      ["Kulturelle Adoption und Team-Enablement priorisieren.", "KI ist echte Bestandteil der täglichen Arbeit Ihres Teams."],
      ["Kompetenz aufbauen, um KI-Tools zu prototypisieren und zu liefern.", "Sie können KI-Ideen zuverlässig in reale Lösungen verwandeln."],
      ["Richtlinien und Risikoverantwortung für KI etablieren.", "Governance verleiht Ihrer KI-Arbeit Glaubwürdigkeit und Sicherheit."],
    ],
  },

  zh: {
    "nav.home": "首页", "nav.about": "关于我", "nav.maturity": "AI成熟度测评",
    "nav.resources": "AI资源", "nav.articles": "AI文章", "nav.contact": "联系我",
    "hero.cta": "您的组织AI准备好了吗？", "hero.contact": "联系我",
    "meta.right": "专家",
    "about.label": "关于我",
    "about.title": "我帮助组织将AI潜力转化为实际运营实践。",
    "about.lead": "我的工作处于AI开发与AI赋能的交叉点——我既能构建工具，也能帮助组织真正采用它。这种组合比听起来更稀缺。",
    "about.proof1.title": "AI Agent开发",
    "about.proof1.text": " — 识别运营痛点，将其转化为可运行的AI Agent——让团队全天候自助获取所需知识，无需依赖同事。",
    "about.proof2.title": "AI用例发现与规模化",
    "about.proof2.text": " — 通过结构化流程，发现、评分并优先排列组织内的AI机会。从想法到实施路线图。",
    "about.proof3.title": "AI成熟度提升",
    "about.proof3.text": " — 评估团队真实的AI准备状态，设计让AI在试点之后真正落地的培训、治理与推广节奏。",
    "about.tag1": "AI开发", "about.tag2": "AI赋能", "about.tag3": "AI项目管理",
    "about.tag4": "数字化转型", "about.tag5": "变革管理", "about.tag6": "项目管理",
    "maturity.label": "AI成熟度测评",
    "maturity.landing.title": "您的组织在AI方面处于什么水平？",
    "maturity.landing.p": "10个问题，约3分钟，涵盖五个维度的清晰画像——无需注册。",
    "maturity.start": "开始测评",
    "maturity.progress": (n, t) => `第${n}题，共${t}题`,
    "maturity.back": "← 返回上一题",
    "maturity.result.label": "您的AI成熟度等级",
    "maturity.restart": "重新测评",
    "maturity.result.cta.p": "想了解您的组织下一步该怎么走？",
    "maturity.result.cta.link": "与我交流",
    "resources.label": "AI资源", "resources.title": "精选工具与框架。",
    "resources.p": "一个持续更新的资源库，为认真对待AI的团队准备——值得了解的工具、指南与专家。",
    "resources.soon.label": "即将上线",
    "resources.soon.p": "本板块正在建设中，敬请期待。也欢迎在LinkedIn上关注我的动态。",
    "articles.label": "AI文章", "articles.title": "关于AI转型的思考。",
    "articles.p": "记录组织真正推行AI时的有效做法——超越炒作与演示的真实洞见。",
    "articles.soon.label": "即将上线", "articles.soon.p": "文章撰写中，首批内容即将发布。",
    "contact.label": "联系我",
    "contact.title": "常驻德国，在欧洲各地推动AI转型落地。",
    "contact.email": "发邮件给我", "contact.linkedin": "LinkedIn联系",
    DIMS: ["战略", "数据", "采纳", "落地", "治理"],
    QUESTIONS: [
      { dim: 0, text: "您的组织对AI战略的清晰度如何？", options: ["我们没有AI战略", "AI在议程上，但方向不清晰", "我们有AI愿景，但落地路径不明确", "我们有明确的AI战略，并有清晰的优先级和资源"] },
      { dim: 0, text: "AI在您的组织中的优先级如何？", options: ["AI不是我们的主动议题", "有零散的兴趣，但缺乏资源", "AI是重点方向，已有初步预算", "AI已战略性嵌入，有专项投入"] },
      { dim: 1, text: "您如何描述贵组织的数据可用性？", options: ["数据分散，难以获取", "部分数据已结构化，但存在数据孤岛", "数据基础良好，但质量参差不齐", "全组织范围内有清晰、结构化的高质量数据"] },
      { dim: 1, text: "数据在您的组织中是如何被使用的？", options: ["主要用于报表，几乎不做分析", "偶尔分析，但缺乏系统性", "部分团队已有基于数据的定期决策", "数据是全组织决策的核心"] },
      { dim: 2, text: "您的团队中有多少人在日常工作中主动使用AI工具？", options: ["几乎没有人", "少数早期采用者（20%以下）", "相当一部分人（20–60%）", "大多数团队成员（60%以上）"] },
      { dim: 2, text: "贵组织如何回应新的AI工具？", options: ["怀疑或抵触", "谨慎感兴趣，行动迟缓", "愿意尝试和探索", "积极的采纳文化"] },
      { dim: 3, text: "贵组织是否已经构建或部署了AI驱动的工具？", options: ["没有，尚未开始", "做过一些小实验", "有1-2个工具在生产中运行", "多个AI工具已部署并被积极使用"] },
      { dim: 3, text: "您的团队从AI想法到可用原型需要多长时间？", options: ["我们没有这种能力", "通常需要数月，且依赖外部帮助", "内部努力需要几周", "数天到数周——相当常规"] },
      { dim: 4, text: "您是否有负责任AI使用的指导方针？", options: ["没有任何指导方针", "非正式讨论，没有文档记录", "部分指导方针正在制定中", "明确的政策和问责机制已到位"] },
      { dim: 4, text: "您如何管理组织中与AI相关的风险？", options: ["我们还没有考虑过这个问题", "我们意识到风险，但没有流程", "有一些风险意识和临时应对", "结构化的AI风险管理已建立"] },
    ],
    ENCOURAGEMENTS: ["好的信号，继续 →", "记录在案，下一题 →", "已记录，继续 →", "有价值的数据点 →", "清晰的画面正在形成 →", "犀利，下一题 →", "这很能说明问题 →", "明白了，继续 →", "这很重要，下一题 →", "快完成了 →"],
    LEVELS: [
      { min: 1, max: 1.7, name: "AI好奇者", summary: "您的组织正在探索AI，但尚缺乏结构化的推进步骤。意识已有，现在需要转化为清晰方向和具体行动。" },
      { min: 1.7, max: 2.5, name: "AI探索者", summary: "已迈出第一步，但意图与执行之间存在差距。组织的部分在行动，其他部分还没有。一致性是下一个挑战。" },
      { min: 2.5, max: 3.3, name: "AI成长期", summary: "扎实的基础正在形成。AI在您的组织中已是现实——但要进一步扩展，需要弥合最强和最弱维度之间的差距。" },
      { min: 3.3, max: 4.1, name: "AI规模化", summary: "您已领先于大多数组织。AI嵌入战略，交付有信心，采纳广泛。现在的工作是深化和治理已有成果。" },
    ],
    DIM_NOTES: [
      ["制定清晰的AI愿景，获得领导层支持。", "AI已嵌入您的战略路线图。"],
      ["在扩展AI之前先构建数据基础。", "您的数据已准备好为大规模AI提供支撑。"],
      ["专注于文化采纳和团队赋能。", "AI已真正成为团队日常工作的一部分。"],
      ["构建原型化和交付AI工具的能力。", "您能够可靠地将AI想法转化为真实成果。"],
      ["建立AI指导方针和风险责任机制。", "治理为您的AI工作赋予了可信度和安全性。"],
    ],
  },
};

let currentLang = localStorage.getItem("lang") || "en";

function t(key) {
  const val = TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS.en[key];
  return typeof val === "function" ? val : val ?? key;
}

function setLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Update all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const val = TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key];
    if (typeof val === "string") el.textContent = val;
  });

  // Update lang buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  // Refresh maturity quiz if visible
  if (window.maturityRefreshLang) window.maturityRefreshLang();
}

// Language switcher click handlers
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

// Apply saved language on load
if (currentLang !== "en") setLang(currentLang);

// ── AI Maturity Assessment ────────────────────────────────────────────────────
(function initMaturity() {
  // Pull language-specific quiz data dynamically
  function ld() { return TRANSLATIONS[currentLang] || TRANSLATIONS.en; }

  const LEVEL_ICONS = {
    "AI Curious": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <ellipse cx="26" cy="27" rx="16" ry="10" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="26" cy="27" r="4" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="26" cy="27" r="1.5" fill="var(--lemon)"/>
      <line x1="26" y1="10" x2="26" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="36" y1="13" x2="33.5" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="13" x2="18.5" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,

    "AI Exploring": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="17" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="26" cy="26" r="2.5" fill="var(--lemon)"/>
      <line x1="26" y1="9" x2="26" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="26" y1="37" x2="26" y2="43" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="9" y1="26" x2="15" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="37" y1="26" x2="43" y2="26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <polygon points="26,15 28.5,24 26,22 23.5,24" fill="currentColor" opacity="0.7"/>
    </svg>`,

    "AI Developing": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="6"  y="34" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="21" y="24" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="36" y="12" width="10" height="32" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="41" cy="12" r="3" fill="var(--lemon)" opacity="0.9"/>
      <polyline points="11,33 26,23 41,11" stroke="var(--lemon)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3" opacity="0.7"/>
    </svg>`,

    "AI Scaling": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="26" r="4" fill="var(--lemon)" opacity="0.95"/>
      <circle cx="10" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="42" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="36" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="42" cy="36" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="26" cy="8"  r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="26" cy="44" r="3" stroke="currentColor" stroke-width="1.5"/>
      <line x1="26" y1="22" x2="13"  y2="19" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="26" y1="22" x2="39"  y2="19" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="26" y1="30" x2="13"  y2="35" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="26" y1="30" x2="39"  y2="35" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="26" y1="22" x2="26"  y2="11" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
      <line x1="26" y1="30" x2="26"  y2="41" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
    </svg>`,
  };

  const LEVELS = [
    {
      min: 1, max: 1.7,
      name: "AI Curious",
      summary: "You're at the beginning of the journey — aware that AI matters, but yet to translate that into a clear direction or concrete action. The opportunity ahead is significant.",
    },
    {
      min: 1.7, max: 2.5,
      name: "AI Exploring",
      summary: "You've started experimenting, but there are gaps between intent and execution. Some parts of the organisation are moving; others aren't. Consistency is the next challenge.",
    },
    {
      min: 2.5, max: 3.3,
      name: "AI Developing",
      summary: "A solid foundation is taking shape. AI is real in your organisation — but scaling it further requires closing the gaps between your strongest and weakest dimensions.",
    },
    {
      min: 3.3, max: 4.1,
      name: "AI Scaling",
      summary: "You're ahead of most organisations. AI is embedded in strategy, delivered with confidence, and adopted broadly. The work now is about deepening and governing what you've built.",
    },
  ];

  const DIM_NOTES = [
    ["Define a clear AI vision with leadership buy-in.", "AI is embedded in your strategic roadmap."],
    ["Build a data foundation before scaling AI.", "Your data is ready to fuel AI at scale."],
    ["Focus on cultural adoption and team enablement.", "AI is genuinely part of how your team works."],
    ["Build the capability to prototype and ship AI tools.", "You can turn AI ideas into real things reliably."],
    ["Establish guidelines and risk ownership for AI.", "Governance gives your AI work credibility and safety."],
  ];

  const ENCOURAGEMENTS = [
    "Good signal. Keep going →",
    "That tracks. One more →",
    "Noted. Moving on →",
    "Useful data point →",
    "Clear picture forming →",
    "Sharp. Next question →",
    "That tells a story →",
    "Understood. Onwards →",
    "This matters. Next →",
    "Almost there →",
  ];

  // DOM refs
  const landing  = document.getElementById("maturity-landing");
  const quiz     = document.getElementById("maturity-quiz");
  const result   = document.getElementById("maturity-result");
  const startBtn = document.getElementById("maturity-start");
  const backBtn  = document.getElementById("maturity-back");
  const restartBtn = document.getElementById("maturity-restart");
  const progressFill  = document.getElementById("maturity-progress-fill");
  const progressLabel = document.getElementById("maturity-progress-label");
  const dimLabel  = document.getElementById("maturity-dim-label");
  const qText     = document.getElementById("maturity-q-text");
  const optionsEl = document.getElementById("maturity-options");

  if (!startBtn) return;

  let current = 0;
  let answers = new Array(10).fill(null);
  let advanceTimer = null;

  function show(state) {
    landing.hidden = state !== "landing";
    quiz.hidden    = state !== "quiz";
    result.hidden  = state !== "result";
  }

  function advance() {
    if (current < ld().QUESTIONS.length - 1) {
      current++;
      renderQuestion(current);
    } else {
      renderResult();
    }
  }

  function renderQuestion(idx) {
    clearTimeout(advanceTimer);

    const d = ld();
    const q = d.QUESTIONS[idx];
    progressFill.style.width = `${((idx + 1) / d.QUESTIONS.length) * 100}%`;
    const progFn = TRANSLATIONS[currentLang]["maturity.progress"] || TRANSLATIONS.en["maturity.progress"];
    progressLabel.textContent = progFn(idx + 1, d.QUESTIONS.length);
    dimLabel.textContent = d.DIMS[q.dim];
    qText.textContent = q.text;
    optionsEl.innerHTML = "";

    // Encouragement element (persists between renders)
    let encEl = quiz.querySelector(".maturity-encouragement");
    if (!encEl) {
      encEl = document.createElement("p");
      encEl.className = "maturity-encouragement";
      optionsEl.after(encEl);
    }
    encEl.classList.remove("visible");
    encEl.textContent = "";

    // Back link visibility
    backBtn.style.visibility = idx === 0 ? "hidden" : "visible";

    const labels = ["A", "B", "C", "D"];
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "maturity-option" + (answers[idx] === i + 1 ? " selected" : "");
      btn.type = "button";
      btn.innerHTML = `<span class="maturity-option-num">${labels[i]}</span><span>${opt}</span>`;
      btn.addEventListener("click", () => {
        clearTimeout(advanceTimer);
        answers[idx] = i + 1;
        optionsEl.querySelectorAll(".maturity-option").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        // Show encouragement then auto-advance
        encEl.textContent = ld().ENCOURAGEMENTS[idx];
        encEl.classList.add("visible");
        advanceTimer = setTimeout(advance, 1100);
      });
      optionsEl.appendChild(btn);
    });
  }

  function computeScores() {
    const d = ld();
    const totals = new Array(d.DIMS.length).fill(0);
    const counts = new Array(d.DIMS.length).fill(0);
    d.QUESTIONS.forEach((q, i) => {
      if (answers[i] !== null) {
        totals[q.dim] += answers[i];
        counts[q.dim]++;
      }
    });
    return totals.map((t, i) => counts[i] ? t / counts[i] : 1);
  }

  function drawRadar(scores) {
    const canvas = document.getElementById("maturity-radar");
    if (!canvas) return;

    // Retina sharpness
    const dpr = window.devicePixelRatio || 1;
    const CW = 480, CH = 440;
    canvas.width  = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width  = CW + "px";
    canvas.style.height = CH + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const cx = CW / 2, cy = CH / 2 + 4;
    const R = 150;
    const N = ld().DIMS.length;
    const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;

    // Polygon path helper
    const polyPath = (t) => {
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = angle(i);
        const x = cx + R * t * Math.cos(a);
        const y = cy + R * t * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const drawFrame = (progress) => {
      ctx.clearRect(0, 0, CW, CH);

      // Background rings
      [1, 0.75, 0.5, 0.25].forEach((t) => {
        polyPath(t);
        if (t === 1) {
          ctx.fillStyle = "rgba(21,21,21,0.025)";
          ctx.fill();
        }
        ctx.strokeStyle = t === 1 ? "rgba(21,21,21,0.16)" : "rgba(21,21,21,0.07)";
        ctx.lineWidth = t === 1 ? 1.5 : 1;
        ctx.stroke();
      });

      // Ring level labels (1–4) along top axis
      ctx.font = `600 9px Inter, sans-serif`;
      ctx.fillStyle = "rgba(21,21,21,0.3)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      [1, 2, 3, 4].forEach((lvl) => {
        const t = (lvl - 1) / 3;
        const a = angle(0);
        const lx = cx + R * t * Math.cos(a) - 10;
        const ly = cy + R * t * Math.sin(a);
        ctx.fillText(lvl, lx, ly);
      });

      // Axis lines
      for (let i = 0; i < N; i++) {
        const a = angle(i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
        ctx.strokeStyle = "rgba(21,21,21,0.10)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Animated user polygon
      ctx.beginPath();
      scores.forEach((s, i) => {
        const t = ((s - 1) / 3) * progress;
        const a = angle(i);
        const x = cx + R * t * Math.cos(a);
        const y = cy + R * t * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();

      // Lemon fill with subtle glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, "rgba(232,255,61,0.45)");
      grad.addColorStop(1, "rgba(185,200,20,0.15)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(185,200,20,1)";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Vertex dots
      scores.forEach((s, i) => {
        const t = ((s - 1) / 3) * progress;
        const a = angle(i);
        const px = cx + R * t * Math.cos(a);
        const py = cy + R * t * Math.sin(a);
        // Outer ring
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232,255,61,0.5)";
        ctx.fill();
        // Inner dot
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#151515";
        ctx.fill();
      });

      // Axis labels
      const labelPad = 26;
      ld().DIMS.forEach((d, i) => {
        const a = angle(i);
        const lx = cx + (R + labelPad) * Math.cos(a);
        const ly = cy + (R + labelPad) * Math.sin(a);

        // Highlight label for top scorer
        const maxScore = Math.max(...scores);
        const isTop = scores[i] === maxScore;

        ctx.font = `${isTop ? "860" : "700"} 10.5px Inter, sans-serif`;
        ctx.fillStyle = isTop ? "rgba(21,21,21,0.9)" : "rgba(21,21,21,0.5)";
        ctx.letterSpacing = "0.06em";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.toUpperCase(), lx, ly);
      });
    };

    // Animate polygon drawing in
    const duration = 900;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      drawFrame(eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  function renderResult() {
    const scores = computeScores();
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const LEVELS = ld().LEVELS;
    const DIM_NOTES = ld().DIM_NOTES;
    const DIMS = ld().DIMS;
    const level = LEVELS.find(l => avg >= l.min && avg < l.max) || LEVELS[LEVELS.length - 1];

    const levelEl = document.getElementById("maturity-result-level");
    levelEl.innerHTML = `
      <span class="maturity-level-icon">${LEVEL_ICONS[level.name] || ""}</span>
      ${level.name}
    `;
    document.getElementById("maturity-result-summary").textContent = level.summary;

    // Score bars
    const scoresEl = document.getElementById("maturity-scores");
    scoresEl.innerHTML = "";
    const weakIdx = scores.indexOf(Math.min(...scores));
    scores.forEach((s, i) => {
      const pct = ((s - 1) / 3) * 100;
      const isWeak = i === weakIdx;
      const noteIdx = s >= 2.5 ? 1 : 0;
      scoresEl.innerHTML += `
        <div class="maturity-score-item">
          <div class="maturity-score-header">
            <span class="maturity-score-name">${DIMS[i]}</span>
            <span class="maturity-score-value">${s.toFixed(1)} / 4</span>
          </div>
          <div class="maturity-score-track">
            <div class="maturity-score-bar${isWeak ? " weak" : ""}" style="width:${pct}%"></div>
          </div>
          <p class="maturity-score-note">${DIM_NOTES[i][noteIdx]}</p>
        </div>`;
    });

    show("result");
    // Small delay so canvas is visible before drawing
    requestAnimationFrame(() => drawRadar(scores));
  }

  // Event listeners
  startBtn.addEventListener("click", () => {
    current = 0;
    answers = new Array(ld().QUESTIONS.length).fill(null);
    show("quiz");
    renderQuestion(0);
    document.getElementById("maturity").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  backBtn.addEventListener("click", () => {
    clearTimeout(advanceTimer);
    if (current > 0) {
      current--;
      renderQuestion(current);
    }
  });

  restartBtn.addEventListener("click", () => {
    clearTimeout(advanceTimer);
    current = 0;
    answers = new Array(ld().QUESTIONS.length).fill(null);
    show("quiz");
    renderQuestion(0);
  });

  // Expose language refresh hook
  window.maturityRefreshLang = () => {
    if (!quiz.hidden) renderQuestion(current);
    if (!result.hidden) renderResult();
    // Re-apply static text to quiz elements
    const progFn = TRANSLATIONS[currentLang]["maturity.progress"] || TRANSLATIONS.en["maturity.progress"];
    if (!quiz.hidden) {
      const d = ld();
      progressLabel.textContent = progFn(current + 1, d.QUESTIONS.length);
      dimLabel.textContent = d.DIMS[d.QUESTIONS[current].dim];
    }
  };
}());

// ── About photo orbit animation ───────────────────────────────────────────────
(function initOrbit() {
  const canvas = document.getElementById("about-orbit-canvas");
  if (!canvas || reduceMotion) return;

  const photoContainer = canvas.closest(".about-photo");
  if (!photoContainer) return;

  const dpr = window.devicePixelRatio || 1;
  let W, H, cx, cy, rx, ry, angle = 0;

  function resize() {
    const rect = photoContainer.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    // Orbit ellipse: centred on the figure, slightly inset
    cx = W * 0.48;
    cy = H * 0.44;
    rx = W * 0.38;
    ry = H * 0.46;
  }

  resize();
  window.addEventListener("resize", resize);

  function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // --- faint guide ring ---
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(232,255,61,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- draw comet tail (arc behind the head) ---
    const tailLen = Math.PI * 0.38; // arc length of tail
    const segments = 40;
    for (let i = 0; i < segments; i++) {
      const t  = i / segments;
      const a  = angle - tailLen * t;
      const x  = cx + rx * Math.cos(a);
      const y  = cy + ry * Math.sin(a);
      const alpha = (1 - t) * 0.22 * (1 - t * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 2.5 - t * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,255,61,${alpha})`;
      ctx.fill();
    }

    // --- comet head: bright glowing dot ---
    const hx = cx + rx * Math.cos(angle);
    const hy = cy + ry * Math.sin(angle);

    // outer glow
    const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14);
    glow.addColorStop(0, "rgba(255,255,200,0.55)");
    glow.addColorStop(0.4, "rgba(232,255,61,0.22)");
    glow.addColorStop(1, "rgba(232,255,61,0)");
    ctx.beginPath();
    ctx.arc(hx, hy, 14, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // bright core
    const core = ctx.createRadialGradient(hx, hy, 0, hx, hy, 4);
    core.addColorStop(0, "rgba(255,255,240,0.95)");
    core.addColorStop(1, "rgba(232,255,61,0)");
    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    ctx.restore();

    angle += 0.008; // speed — ~7s per revolution
    requestAnimationFrame(draw);
  }

  draw();
}());

