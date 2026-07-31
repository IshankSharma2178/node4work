import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const styles = `
  @keyframes particle-up {
    0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
    10% { opacity: 0.6; }
    90% { opacity: 0.4; }
    100% { opacity: 0; transform: translateY(-100vh) scale(0.5); }
  }
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient { animation: gradient-shift 8s ease infinite; background-size: 200% 200%; }
`;

function AuthParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${2 + Math.random() * 3}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${10 + Math.random() * 15}s`,
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
            animation: `particle-up ${p.duration} ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* Decorative left panel — hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-muted/50 overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, var(--border) 0.5px, transparent 0.5px)",
                backgroundSize: "40px 40px",
                opacity: 0.3,
              }}
            />
            <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 right-10 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
            <AuthParticles />
          </div>

          <div className="relative z-10 max-w-md text-center">
            <div className="size-16 mx-auto mb-8 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg
                className="size-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-3">
              Build automations visually
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect any app, add AI agents, and automate complex workflows
              through an intuitive drag-and-drop canvas.
            </p>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">100K+</div>
                <div>Workflows</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div>Integrations</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">99.9%</div>
                <div>Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-10">
          <div className="absolute inset-0 pointer-events-none lg:hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, var(--border) 0.5px, transparent 0.5px)",
                backgroundSize: "40px 40px",
                opacity: 0.2,
              }}
            />
            <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
            <AuthParticles />
          </div>

          <div className="absolute end-4 top-4 md:end-6 md:top-6 z-20">
            <ThemeToggle />
          </div>

          <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 self-center font-medium group"
            >
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <svg
                  className="size-4 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Nodebase
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
