"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Blocks,
  Bot,
  Check,
  Clock,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Github,
  Globe,
  History,
  Mail,
  Menu,
  Moon,
  Play,
  Server,
  Star,
  Sun,
  Twitter,
  Webhook,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description:
      "Drag, drop, and connect nodes to build powerful automations without writing a single line of code.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Integrate LLM-powered agents that reason, decide, and execute complex multi-step tasks autonomously.",
  },
  {
    icon: Webhook,
    title: "Webhook Support",
    description:
      "Trigger workflows from any external service with instant webhook capture and response handling.",
  },
  {
    icon: Clock,
    title: "Scheduling",
    description:
      "Run workflows on cron schedules, intervals, or specific dates with timezone-aware precision.",
  },
  {
    icon: Blocks,
    title: "100+ Integrations",
    description:
      "Connect with the tools you already use — from Slack and GitHub to AWS and OpenAI.",
  },
  {
    icon: History,
    title: "Execution History",
    description:
      "Full audit trail of every run with detailed logs, error tracing, and replay capability.",
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description:
      "Watch workflows execute live with streaming logs, metrics, and instant failure alerts.",
  },
  {
    icon: Code2,
    title: "Open Source",
    description:
      "Self-host on your infrastructure. Full source access, community plugins, and no vendor lock-in.",
  },
];

const integrations = [
  "GitHub",
  "Slack",
  "Discord",
  "Google",
  "AWS",
  "OpenAI",
  "Telegram",
  "Docker",
  "Kubernetes",
  "Redis",
  "MongoDB",
  "Stripe",
  "Supabase",
  "Notion",
  "GitLab",
  "Linear",
  "Figma",
  "Vercel",
  "Datadog",
  "Sentry",
];

const stats = [
  { value: 100, suffix: "K+", label: "Workflows" },
  { value: 2, suffix: "M+", label: "Executions" },
  { value: 500, suffix: "+", label: "Integrations" },
  { value: 99.99, suffix: "%", label: "Uptime" },
];

const templates = [
  {
    title: "AI Chatbot",
    description:
      "Build a conversational AI that answers questions from your knowledge base.",
    difficulty: "Intermediate",
    time: "15 min",
    color: "from-amber-500/20 to-orange-500/10",
  },
  {
    title: "Slack Notifications",
    description:
      "Send custom Slack alerts when specific events happen in your tools.",
    difficulty: "Beginner",
    time: "5 min",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "Email Automation",
    description: "Automate email sequences, follow-ups, and drip campaigns.",
    difficulty: "Beginner",
    time: "10 min",
    color: "from-blue-500/20 to-indigo-500/10",
  },
  {
    title: "Invoice Generator",
    description:
      "Auto-generate and send invoices from payment or order events.",
    difficulty: "Intermediate",
    time: "20 min",
    color: "from-violet-500/20 to-purple-500/10",
  },
  {
    title: "GitHub CI",
    description:
      "Trigger workflows on PR, merge, or release events across your repos.",
    difficulty: "Advanced",
    time: "10 min",
    color: "from-sky-500/20 to-cyan-500/10",
  },
  {
    title: "CRM Sync",
    description:
      "Keep your CRM in sync with your app's user, deal, and activity data.",
    difficulty: "Intermediate",
    time: "15 min",
    color: "from-rose-500/20 to-pink-500/10",
  },
];

const steps = [
  {
    icon: Plug,
    title: "Connect",
    description:
      "Connect your apps, APIs, and databases in seconds with pre-built authentication.",
  },
  {
    icon: Workflow,
    title: "Build",
    description:
      "Design your workflow visually — add logic, conditions, AI, and transformations.",
  },
  {
    icon: Cloud,
    title: "Deploy",
    description:
      "Go live with one click. Monitor, iterate, and scale from a single dashboard.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Engineering Lead @ Ramp",
    content:
      "Nodebase replaced three separate automation tools. The visual builder is intuitive, and the AI agent support is a game-changer.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "CTO @ ScaleOps",
    content:
      "We migrated 200+ workflows from n8n in two days. The execution history and debugging tools are miles ahead.",
    avatar: "MJ",
  },
  {
    name: "Priya Patel",
    role: "Head of Automation @ Loom",
    content:
      "The open-source model gives us full control. Self-hosting was trivial, and the community plugins ecosystem is growing fast.",
    avatar: "PP",
  },
  {
    name: "Alex Rivera",
    role: "Founder @ Replicate",
    content:
      "Finally, an automation platform that doesn't get in your way. The webhook support and scheduling are rock solid.",
    avatar: "AR",
  },
];

const faqItems = [
  {
    q: "What makes Nodebase different from n8n?",
    a: "Nodebase is built from the ground up with modern AI agent support, a reimagined visual builder, real-time collaboration, and a plugin ecosystem. While inspired by n8n's approach, we focus on developer experience, performance at scale, and native AI integration.",
  },
  {
    q: "Can I self-host Nodebase?",
    a: "Yes. Nodebase is fully open-source and can be self-hosted on any infrastructure — bare metal, Docker, Kubernetes, or cloud VMs. We provide one-line deploy scripts for popular platforms.",
  },
  {
    q: "What AI models are supported?",
    a: "We support OpenAI, Anthropic, Google AI, Mistral, and any OpenAI-compatible endpoint. You can use LLMs for text generation, classification, extraction, and agentic workflows.",
  },
  {
    q: "How does pricing work?",
    a: "The Community edition is free and self-hosted. Pro (coming soon) adds team collaboration, SSO, priority support, and advanced monitoring. Enterprise includes dedicated infrastructure and custom SLAs.",
  },
  {
    q: "Can I contribute?",
    a: "Absolutely. Nodebase is open source under a permissive license. Check our GitHub for contribution guidelines, feature requests, and the public roadmap.",
  },
];

function Plug(props: ComponentProps<typeof Server>) {
  return <Server {...props} />;
}

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(251, 191, 36, 0.15); }
    50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes particle {
    0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
    10% { opacity: 0.8; }
    90% { opacity: 0.6; }
    100% { opacity: 0; transform: translateY(-100vh) scale(0.5); }
  }
  @keyframes node-enter {
    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes line-flow {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shine {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-float-1 { animation: float 4s ease-in-out 0.5s infinite; }
  .animate-float-2 { animation: float 4s ease-in-out 1s infinite; }
  .animate-float-3 { animation: float 4s ease-in-out 1.5s infinite; }
  .animate-float-4 { animation: float 4s ease-in-out 2s infinite; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-marquee { animation: marquee 40s linear infinite; }
  .animate-gradient { animation: gradient-shift 8s ease infinite; background-size: 200% 200%; }
  .animate-shine { background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%); background-size: 200% 100%; animation: shine 3s linear infinite; }
  .node-enter { animation: node-enter 0.6s ease-out forwards; }
  .node-enter:nth-child(1) { animation-delay: 0.1s; }
  .node-enter:nth-child(2) { animation-delay: 0.3s; }
  .node-enter:nth-child(3) { animation-delay: 0.5s; }
  .node-enter:nth-child(4) { animation-delay: 0.7s; }
  .node-enter:nth-child(5) { animation-delay: 0.9s; }
  .line-animate { stroke-dasharray: 100; animation: line-flow 1s ease-out forwards; }
  .line-animate:nth-child(1) { animation-delay: 0.2s; }
  .line-animate:nth-child(2) { animation-delay: 0.4s; }
  .line-animate:nth-child(3) { animation-delay: 0.6s; }
  .line-animate:nth-child(4) { animation-delay: 0.8s; }
  @keyframes pulse-dot {
    0%, 100% { opacity: 0.12; }
    50% { opacity: 0.30; }
  }
  @keyframes scale-in-hero {
    0% { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }
  @keyframes slide-left {
    0% { opacity: 0; transform: translateX(-20px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  .animate-pulse-dot { animation: pulse-dot 4s ease-in-out infinite; }
  .animate-scale-in-hero { animation: scale-in-hero 0.6s ease-out 0.2s both; }
  .animate-breathe-icon { animation: breathe 2.5s ease-in-out infinite; }
  .animate-slide-left { animation: slide-left 0.4s ease-out both; }
  @keyframes data-flow {
    0% { opacity: 0; transform: translateY(0); }
    15% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translateY(80px); }
  }
  .data-packet {
    animation: data-flow 2.2s ease-in-out infinite backwards;
    filter: drop-shadow(0 0 4px var(--primary));
  }
  @keyframes badge-shine {
    0% { transform: translateX(-100%); }
    55% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
  }
  .animate-badge-shine { animation: badge-shine 3.5s ease-in-out infinite; }
  @keyframes flow-x {
    0% { opacity: 0; transform: translateX(0); }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; transform: translateX(14px); }
  }
  @keyframes flow-across {
    0% { left: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: calc(100% - 8px); opacity: 0; }
  }
  .animate-flow-across { animation: flow-across 3s ease-in-out infinite; }
  @media (max-width: 768px) {
    .animate-marquee { animation-duration: 30s; }
  }
`;

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useMouseParallax(strength = 16) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 2;
        const dy = (e.clientY / window.innerHeight - 0.5) * 2;
        el.style.setProperty("--px", `${dx * strength}px`);
        el.style.setProperty("--py", `${dy * strength}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [strength]);
  return ref;
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? window.scrollY / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
    >
      <div
        className="h-full bg-primary shadow-[0_0_10px_var(--primary)]"
        style={{
          width: `${Math.min(100, progress * 100)}%`,
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

function CountUp({
  value,
  suffix = "",
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, value, duration]);
  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.09, delayChildren: delay / 1000 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  badge,
  title,
  subtitle,
  tone = "primary",
  className,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  tone?: "primary" | "secondary";
  className?: string;
}) {
  const isSecondary = tone === "secondary";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative text-center max-w-2xl mx-auto mb-16 ${className ?? ""}`}
    >
      <span
        className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-[0.14em] ${
          isSecondary
            ? "border-secondary/30 text-secondary bg-secondary/5"
            : "border-primary/30 text-primary bg-primary/5"
        }`}
      >
        <span
          className={`size-1.5 rounded-full ${isSecondary ? "bg-secondary" : "bg-primary"} animate-pulse`}
        />
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
        className="mx-auto mt-6 h-px w-24 origin-center bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
    </motion.div>
  );
}

function FlowConnector({ delay = 0 }: { delay?: number }) {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-5"
    >
      <div className="relative h-px bg-border overflow-visible">
        <span
          className="absolute -top-[3.5px] left-0 size-2 rounded-full bg-primary/90 shadow-[0_0_6px_var(--primary)]"
          style={{
            animation: `flow-x 1.8s ease-in-out ${delay}s infinite backwards`,
          }}
        />
      </div>
    </div>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="mt-6"
    >
      <h4 className="text-sm font-semibold mb-2">Stay in the loop</h4>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Product updates and workflow tips. No spam.
      </p>
      {done ? (
        <p className="text-sm font-medium text-primary">
          You&rsquo;re on the list. Welcome aboard!
        </p>
      ) : (
        <div className="flex gap-2 max-w-xs">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-label="Email address for newsletter"
            className="h-9"
          />
          <Button type="submit" size="sm" className="shrink-0 gap-1.5">
            Subscribe
          </Button>
        </div>
      )}
    </form>
  );
}

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 4}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 12}s`,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            animation: `particle ${p.duration} ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = resolvedTheme !== "light";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Templates", href: "#templates" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "#" },
    { label: "GitHub", href: "https://github.com", icon: Github },
  ];

  return (
    <header
      data-od-id="navbar"
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group animate-slide-left"
          >
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Nodebase
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const isExternal = l.href.startsWith("http");
              const Comp = isExternal ? "a" : Link;
              const props = isExternal
                ? { href: l.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: l.href };
              return (
                <Comp
                  key={l.label}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                  {...props}
                >
                  {Icon && <Icon className="size-4" />}
                  {l.label}
                </Comp>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className="size-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                aria-label={
                  isDark ? "Switch to light theme" : "Switch to dark theme"
                }
              >
                {isDark ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden size-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((l) => {
              const Icon = l.icon;
              const isExternal = l.href.startsWith("http");
              const Comp = isExternal ? "a" : Link;
              const props = isExternal
                ? { href: l.href, target: "_blank", rel: "noopener noreferrer" }
                : { href: l.href };
              return (
                <Comp
                  key={l.label}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent/50 transition-colors"
                  {...props}
                >
                  {Icon && <Icon className="size-4" />}
                  {l.label}
                </Comp>
              );
            })}
            <div className="pt-2 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function WorkflowNodes() {
  const nodes = [
    {
      icon: Webhook,
      label: "Webhook",
      color: "from-amber-500/30 to-amber-600/20",
      border: "border-amber-500/30",
    },
    {
      icon: Bot,
      label: "AI Agent",
      color: "from-violet-500/30 to-violet-600/20",
      border: "border-violet-500/30",
    },
    {
      icon: GitBranch,
      label: "Condition",
      color: "from-emerald-500/30 to-emerald-600/20",
      border: "border-emerald-500/30",
    },
    {
      icon: Globe,
      label: "HTTP Request",
      color: "from-blue-500/30 to-blue-600/20",
      border: "border-blue-500/30",
    },
    {
      icon: Database,
      label: "Database",
      color: "from-cyan-500/30 to-cyan-600/20",
      border: "border-cyan-500/30",
    },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 120 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {nodes.slice(0, -1).map((n, i) => (
          <line
            key={`conn-${n.label}`}
            x1="60"
            y1={65 + i * 72}
            x2="60"
            y2={65 + (i + 1) * 72 - 8}
            stroke="currentColor"
            className="text-border line-animate"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}
        {nodes.slice(0, -1).map((n) => (
          <polygon
            key={`arrow-${n.label}`}
            points="56,60 64,60 60,68"
            fill="currentColor"
            className="text-border"
            opacity="0.6"
          />
        ))}
        {nodes.slice(0, -1).map((n, i) => (
          <circle
            key={`pkt-${n.label}`}
            cx="60"
            cy={65 + i * 72}
            r="3"
            fill="var(--primary)"
            className="data-packet"
            style={{ animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </svg>
      {nodes.map((node, i) => {
        const Icon = node.icon;
        const floatClass = [
          "animate-float",
          "animate-float-1",
          "animate-float-2",
          "animate-float-3",
          "animate-float-4",
        ][i];
        return (
          <div
            key={node.label}
            className={cn(
              "node-enter relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl border bg-card/80 backdrop-blur-sm shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 group",
              node.border,
              floatClass,
              "w-[180px]",
            )}
            style={{ marginBottom: i < nodes.length - 1 ? "44px" : "0" }}
          >
            <div
              className={cn(
                "size-10 rounded-lg bg-gradient-to-br flex items-center justify-center",
                node.color,
              )}
            >
              <Icon className="size-5 text-foreground" />
            </div>
            <span className="text-sm font-medium">{node.label}</span>
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/workflows");
    }
  }, [session, isPending, router]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const parallaxRef = useMouseParallax(18);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <>
      <style>{styles}</style>

      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Navbar */}
        <ScrollProgress />
        <Navbar />

        {/* ============ HERO ============ */}
        <section
          data-od-id="hero"
          className="relative min-h-[calc(100vh-64px)] flex items-center pt-24 pb-16 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              ref={parallaxRef}
              className="absolute inset-0 will-change-transform"
              style={{
                transform: "translate(var(--px, 0px), var(--py, 0px))",
              }}
            >
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] transition-transform duration-700 ease-out" />
              <div
                className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-secondary/5 rounded-full blur-[100px] transition-transform duration-700 ease-out"
                style={{
                  transform:
                    "translate(calc(var(--px, 0px) * -0.6), calc(var(--py, 0px) * -0.6))",
                }}
              />
            </div>
            <div
              className="absolute inset-0 animate-pulse-dot"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 0.5px, transparent 0.5px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <Particles />
          </div>

          <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="mb-6 px-3 py-1 text-xs font-medium tracking-wider uppercase border-primary/30 text-primary bg-primary/5 animate-in relative overflow-hidden"
                  >
                    AI-Powered Workflow Automation
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 animate-badge-shine bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                    />
                  </Badge>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
                >
                  Build powerful{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                    automations
                  </span>{" "}
                  visually
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed"
                >
                  Connect any app, add AI agents, and automate complex workflows
                  — all through an intuitive drag-and-drop canvas.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-wrap gap-3"
                >
                  <Button
                    size="lg"
                    className="gap-2 relative overflow-hidden group"
                    asChild
                  >
                    <Link href="/signup">
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started Free{" "}
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 group"
                    asChild
                  >
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="size-4 transition-transform duration-300 group-hover:scale-110" />{" "}
                      View on GitHub
                    </a>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center gap-4 mt-10 text-sm text-muted-foreground"
                >
                  <div className="flex -space-x-2">
                    {["SC", "MJ", "PP", "AR"].map((init) => (
                      <div
                        key={init}
                        className="size-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-medium text-primary hover:scale-110 transition-transform"
                      >
                        {init}
                      </div>
                    ))}
                  </div>
                  <span>Trusted by 2,000+ teams</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="hidden lg:flex justify-center"
              >
                <WorkflowNodes />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section
          data-od-id="features"
          id="features"
          className="relative py-24 lg:py-32"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px] -translate-x-1/2" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Features"
              title="Everything you need to automate"
              subtitle="From simple triggers to complex AI agents — build, debug, and deploy with confidence."
            />

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <StaggerItem key={f.title}>
                    <div className="group relative p-6 rounded-xl border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-default overflow-hidden">
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                      <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors animate-breathe-icon">
                        <Icon className="size-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                      </div>
                      <h3 className="font-semibold mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ============ WORKFLOW SHOWCASE ============ */}
        <section
          data-od-id="workflow-showcase"
          className="relative py-24 lg:py-32 bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Visual Builder"
              title="See your workflows come to life"
              subtitle="Our canvas gives you full visibility into every step of your automation."
              tone="secondary"
            />

            <FadeIn delay={150}>
              <div className="relative rounded-2xl border bg-card p-2 shadow-xl overflow-hidden">
                <div className="rounded-xl border bg-background/50 p-6 sm:p-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="size-3 rounded-full bg-red-500/70" />
                    <div className="size-3 rounded-full bg-amber-500/70" />
                    <div className="size-3 rounded-full bg-emerald-500/70" />
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      workflow-canvas.tsx
                    </span>
                  </div>
                  <div className="flex flex-wrap items-start justify-center gap-6 lg:gap-10">
                    {[
                      {
                        icon: Webhook,
                        label: "Webhook Trigger",
                        desc: "Incoming POST",
                        color:
                          "bg-amber-500/10 border-amber-500/20 text-amber-500",
                      },
                      {
                        icon: Cpu,
                        label: "AI Agent",
                        desc: "GPT-4o analysis",
                        color:
                          "bg-violet-500/10 border-violet-500/20 text-violet-500",
                      },
                      {
                        icon: GitBranch,
                        label: "Condition",
                        desc: "Score > 0.8",
                        color:
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                      },
                      {
                        icon: Globe,
                        label: "HTTP Request",
                        desc: "POST /api/data",
                        color:
                          "bg-blue-500/10 border-blue-500/20 text-blue-500",
                      },
                      {
                        icon: Database,
                        label: "Database",
                        desc: "Write to SQL",
                        color:
                          "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
                      },
                    ].map((n, i) => {
                      const Icon = n.icon;
                      const floatClasses = [
                        "animate-float",
                        "animate-float-1",
                        "animate-float-2",
                        "animate-float-3",
                        "animate-float-4",
                      ];
                      return (
                        <div
                          key={n.label}
                          className={cn(
                            "group relative flex flex-col items-center gap-3 p-5 rounded-xl border bg-card/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg w-[140px]",
                            floatClasses[i],
                          )}
                        >
                          <div
                            className={cn(
                              "size-12 rounded-lg border flex items-center justify-center",
                              n.color,
                            )}
                          >
                            <Icon className="size-6" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{n.label}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {n.desc}
                            </div>
                          </div>
                          {i < 4 && <FlowConnector delay={0.4 + i * 0.4} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 group animate-pulse-glow"
                      asChild
                    >
                      <Link href="#">
                        <Play className="size-3.5 transition-transform duration-300 group-hover:scale-110" />{" "}
                        Run Workflow
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ============ INTEGRATIONS ============ */}
        <section
          data-od-id="integrations"
          id="integrations"
          className="relative py-24 lg:py-32 overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Integrations"
              title="Works with your stack"
              subtitle="Connect seamlessly with 500+ apps and services."
              className="mb-12"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="flex overflow-hidden py-4">
              <div className="flex items-center gap-8 animate-marquee shrink-0 group-hover:[animation-play-state:paused]">
                {integrations.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-5 py-3 rounded-full border bg-card/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 hover:scale-105 transition-all duration-300 whitespace-nowrap shrink-0"
                  >
                    {name}
                  </div>
                ))}
                {integrations.map((name) => (
                  <div
                    key={`${name}-dup`}
                    className="flex items-center gap-2 px-5 py-3 rounded-full border bg-card/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 hover:scale-105 transition-all duration-300 whitespace-nowrap shrink-0"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATISTICS ============ */}
        <section
          data-od-id="statistics"
          className="relative py-24 lg:py-32 bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <div className="text-center group">
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-2">
                      {s.value >= 100 ? (
                        <CountUp value={s.value} suffix={s.suffix} />
                      ) : (
                        <>
                          <CountUp value={Math.floor(s.value)} />
                          {s.suffix}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mb-3">
                      {s.label}
                    </div>
                    <motion.div
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.7,
                        delay: 0.25,
                        ease: "easeOut",
                      }}
                      className="mx-auto h-px w-16 origin-center bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                    />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ TEMPLATES ============ */}
        <section
          data-od-id="templates"
          id="templates"
          className="relative py-24 lg:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Templates"
              title="Start from a template"
              subtitle="Pre-built workflows for common scenarios. Customize in minutes."
            />

            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {templates.map((t) => (
                <StaggerItem key={t.title}>
                  <div className="group relative rounded-xl border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden cursor-default">
                    <div
                      className={cn(
                        "relative h-32 bg-gradient-to-br flex items-center justify-center overflow-hidden",
                        t.color,
                      )}
                    >
                      <div className="size-12 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <Blocks className="size-6 text-foreground/70" />
                      </div>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold mb-1.5">{t.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                          {t.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {t.time}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section
          data-od-id="how-it-works"
          className="relative py-24 lg:py-32 bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="How It Works"
              title="From idea to automation in three steps"
              tone="secondary"
            />

            <div className="relative">
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-border"
              >
                <span className="absolute -top-[3.5px] left-0 size-2 rounded-full bg-secondary shadow-[0_0_6px_var(--secondary)] animate-flow-across" />
              </div>
              <Stagger className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <StaggerItem key={s.title}>
                      <div className="relative text-center group">
                        <div className="size-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                          <Icon className="size-7 text-primary" />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 size-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                          {s.description}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section data-od-id="testimonials" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Testimonials"
              title="Loved by engineering teams"
            />

            <section
              ref={carouselRef}
              className="relative max-w-3xl mx-auto"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              aria-label="Testimonials carousel"
            >
              <div className="overflow-hidden rounded-xl border bg-card p-8 sm:p-10 shadow-lg min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIdx}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="flex items-start gap-1 mb-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star
                          key={i}
                          className="size-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <p className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-6">
                      &ldquo;{testimonials[testimonialIdx].content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                        {testimonials[testimonialIdx].avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {testimonials[testimonialIdx].name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {testimonials[testimonialIdx].role}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-2 mt-6">
                {testimonials.map((t, i) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTestimonialIdx(i)}
                    className={cn(
                      "size-2 rounded-full transition-all duration-300",
                      i === testimonialIdx
                        ? "bg-primary w-6"
                        : "bg-border hover:bg-muted-foreground/40",
                    )}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section
          data-od-id="pricing"
          id="pricing"
          className="relative py-24 lg:py-32 bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="Pricing"
              title="Simple, transparent pricing"
              subtitle="Start free. Scale as you grow."
            />

            <div className="grid lg:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <FadeIn>
                <div className="relative rounded-xl border bg-card p-8 shadow-lg hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-1">Community</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Self-hosted, full-featured, always free.
                  </p>
                  <div className="text-4xl font-bold mb-6">Free</div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited workflows",
                      "All nodes & integrations",
                      "AI agent support",
                      "Community plugins",
                      "Self-hosted",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="size-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </FadeIn>

              <FadeIn delay={150}>
                <div className="relative rounded-xl border-2 border-primary/40 bg-card p-8 shadow-xl shadow-primary/5 hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 animate-shine pointer-events-none" />
                  <Badge className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-medium uppercase tracking-wider">
                    Coming Soon
                  </Badge>
                  <h3 className="text-xl font-bold mb-1">Pro</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    For teams that need more power.
                  </p>
                  <div className="text-4xl font-bold mb-1">$29</div>
                  <div className="text-sm text-muted-foreground mb-6">
                    per user / month
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Everything in Community",
                      "Team collaboration",
                      "SSO & RBAC",
                      "Priority support",
                      "Advanced monitoring",
                      "Custom execution environments",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="size-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="#">
                      Join Waitlist <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section data-od-id="faq" className="relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              badge="FAQ"
              title="Frequently asked questions"
              className="mb-12"
            />

            <FadeIn delay={100}>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={item.q} value={`item-${i}`}>
                    <AccordionTrigger className="text-base font-medium text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section data-od-id="final-cta" className="relative py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background animate-gradient" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          </div>
          <FadeIn className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Start building your workflows today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of teams automating their work with Nodebase. No
              credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 relative overflow-hidden group"
                asChild
              >
                <Link href="/signup">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free <ArrowRight className="size-4" />
                  </span>
                  <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" /> Star on GitHub
                </a>
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* ============ FOOTER ============ */}
        <footer
          data-od-id="footer"
          className="border-t border-border bg-muted/20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
              <div className="sm:col-span-2">
                <Link href="/" className="flex items-center gap-2.5 mb-4">
                  <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                    <Zap className="size-4 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">
                    Nodebase
                  </span>
                </Link>
                <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                  Open-source AI workflow automation platform. Build, deploy,
                  and scale automations visually.
                </p>
                <div className="flex items-center gap-3">
                  {[
                    {
                      icon: Github,
                      href: "https://github.com",
                      label: "GitHub",
                    },
                    {
                      icon: Twitter,
                      href: "https://twitter.com",
                      label: "Twitter",
                    },
                    {
                      href: "https://discord.com",
                      label: "Discord",
                    },
                    {
                      icon: Mail,
                      href: "mailto:hello@nodebase.dev",
                      label: "Email",
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-9 rounded-lg border bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                        aria-label={s.label}
                      >
                        {Icon ? (
                          <Icon className="size-4" />
                        ) : (
                          <DiscordIcon className="size-4" />
                        )}
                      </a>
                    );
                  })}
                </div>
                <NewsletterForm />
              </div>

              {[
                {
                  title: "Product",
                  links: [
                    { label: "Features", href: "#features" },
                    { label: "Templates", href: "#templates" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Integrations", href: "#integrations" },
                    { label: "Changelog", href: "#" },
                  ],
                },
                {
                  title: "Resources",
                  links: [
                    { label: "Documentation", href: "#" },
                    { label: "API Reference", href: "#" },
                    { label: "Community", href: "#" },
                    { label: "Blog", href: "#" },
                    { label: "Status", href: "#" },
                  ],
                },
                {
                  title: "Company",
                  links: [
                    { label: "About", href: "#" },
                    { label: "Careers", href: "#" },
                    { label: "Privacy", href: "#" },
                    { label: "Terms", href: "#" },
                    { label: "Contact", href: "#" },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                &copy; {new Date().getFullYear()} Nodebase. Open source under
                MIT license.
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
