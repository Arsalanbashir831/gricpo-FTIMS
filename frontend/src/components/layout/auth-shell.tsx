import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: AuthShellProps) {
  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.08fr_0.92fr]">
      <section className="auth-atmosphere relative flex min-h-56 overflow-hidden px-6 py-7 text-primary-foreground sm:px-10 lg:min-h-dvh lg:px-16 lg:py-12 xl:px-24">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-25"
          viewBox="0 0 900 1000"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M-70 890C190 670 240 265 860 85" stroke="currentColor" />
          <path d="M-10 970C250 750 300 345 920 165" stroke="currentColor" />
          <path d="M70 1040C330 820 380 415 1000 235" stroke="currentColor" />
          <path d="M-120 420L525 45L690 1000" stroke="currentColor" />
          <path d="M-80 535L575 160L760 1000" stroke="currentColor" />
        </svg>

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col">
          <div className="w-fit rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <Image
              src="/logo.avif"
              alt="GRIPCO"
              width={148}
              height={53}
              className="h-auto w-[9.25rem]"
              priority
            />
          </div>

          <div className="mt-auto hidden max-w-xl flex-col gap-6 pb-[12vh] lg:flex">
            <p className="text-sm font-medium tracking-[0.14em] text-white/65">
              FIELD OPERATIONS, CONNECTED
            </p>
            <h2 className="font-heading text-5xl font-semibold leading-[1.04] tracking-[-0.04em] xl:text-6xl">
              Better field work starts with clear coordination.
            </h2>
            <p className="max-w-lg text-lg leading-8 text-white/72">
              One secure workspace for technicians and supervisors to keep
              teams, tasks, and field activity moving together.
            </p>
          </div>

          <p className="mt-auto hidden text-sm text-white/50 lg:block">
            © 2026 GRICPO. All rights reserved.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="w-full max-w-[28rem]">
          <div className="mb-9">
            <p className="mb-3 text-sm font-semibold tracking-[0.08em] text-primary">
              {eyebrow}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md text-[0.95rem] leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
