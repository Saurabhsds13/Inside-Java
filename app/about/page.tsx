'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, Github, Linkedin, Globe, Code2, BookOpen, Zap, Heart, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import Badge from '@/components/ui/Badge';

const techStack = [
  { name: 'Next.js 14', description: 'App Router, Static Export', color: '#000000' },
  { name: 'TypeScript', description: 'Type-safe development', color: '#3178C6' },
  { name: 'Tailwind CSS', description: 'Utility-first styling', color: '#06B6D4' },
  { name: 'Framer Motion', description: 'Fluid animations', color: '#FF0055' },
  { name: 'Lucide React', description: 'Beautiful icons', color: '#F56565' },
  { name: 'GitHub Pages', description: 'Free static hosting', color: '#181717' },
];

const stats = [
  { label: 'Topics Covered', value: '18' },
  { label: 'Interview Questions', value: '140+' },
  { label: 'Code Examples', value: '90+' },
  { label: 'Difficulty Levels', value: '3' },
];

const milestones = [
  { year: '1991', event: 'James Gosling begins "Oak" at Sun Microsystems — the language that became Java' },
  { year: '1995', event: 'Java 1.0 released — "Write Once, Run Anywhere" with applets and the JVM' },
  { year: '2004', event: 'Java 5 (Tiger) — Generics, Annotations, Enums, Autoboxing, for-each loop' },
  { year: '2014', event: 'Java 8 — Lambdas, Streams, Optional — the biggest shift in how Java is written' },
  { year: '2017', event: 'Java 9 — Modules (JPMS), six-month release cadence begins' },
  { year: '2021', event: 'Java 17 LTS — Records, Sealed Classes, Pattern Matching previews' },
  { year: '2023', event: 'Java 21 LTS — Virtual Threads, Record Patterns, Switch Patterns finalized' },
  { year: '2024', event: 'InsideJava — this platform, born from a desire to make Java internals visual and accessible' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 blur-3xl pointer-events-none bg-gradient-radial from-orange-500/30 via-amber-500/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] text-xs font-medium text-slate-400 mb-5"
            >
              <Coffee className="w-3.5 h-3.5 text-orange-400" />
              About this project
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.1]"
            >
              About{' '}
              <span className="gradient-text">InsideJava</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 leading-relaxed"
            >
              An interactive Core Java learning platform built to take you from your first
              &quot;Hello World&quot; to MAANG-level interview confidence — with visualizations,
              real code, and the deep &quot;why&quot; behind every concept.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats */}
        <AnimatedSection delay={0.1} className="mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <GlassCard key={stat.label} className="p-5 text-center">
                <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </GlassCard>
            ))}
          </div>
        </AnimatedSection>

        {/* Why I built this */}
        <AnimatedSection delay={0.15} className="mb-14">
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Why I Built This</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                When I was preparing for Java interviews, I noticed a gap: most resources either
                give you a shallow overview (&quot;HashMap uses hashing&quot;) or dump JDK source code
                without context. There was nothing that explained the <em>why</em> — why is capacity a
                power of two? Why did Gosling include finalize()? Why does ConcurrentHashMap ban null?
              </p>
              <p>
                InsideJava fills that gap. Every concept is traced from its historical origin
                (James Gosling&apos;s Oak project, Doug Lea&apos;s JSR 166, Brian Goetz&apos;s Project Amber)
                through its internal implementation to the interview questions that test your depth.
                The goal isn&apos;t memorization — it&apos;s understanding.
              </p>
              <p>
                This platform covers Java from absolute first principles to the latest Java 21
                features, designed to be equally useful whether you&apos;re a fresher targeting TCS/Infosys
                or an experienced developer preparing for MAANG/Oracle.
              </p>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Design Philosophy */}
        <AnimatedSection delay={0.2} className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">Design Philosophy</h2>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StaggerItem>
              <GlassCard className="p-6 h-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-blue-500/10 border border-blue-500/30">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">History First</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every concept starts with WHY it was added and what problem existed before.
                  Understanding the motivation makes the design decisions click into place.
                </p>
              </GlassCard>
            </StaggerItem>
            <StaggerItem>
              <GlassCard className="p-6 h-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-amber-500/10 border border-amber-500/30">
                  <Code2 className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">Real Code, Not Pseudocode</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every example compiles. Patterns use realistic domains (payments, orders, caches)
                  not Foo/Bar/Baz. Code you can actually copy into a project and learn from.
                </p>
              </GlassCard>
            </StaggerItem>
            <StaggerItem>
              <GlassCard className="p-6 h-full">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-green-500/10 border border-green-500/30">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">Interview-Devastating</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Each page ends with curated interview questions from fresher to MAANG level.
                  The answers go deep enough to impress any interviewer — not one-line definitions.
                </p>
              </GlassCard>
            </StaggerItem>
          </StaggerContainer>
        </AnimatedSection>

        {/* Java History Timeline */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Java Through the Years</h2>
            <p className="text-sm text-slate-400 mb-6">
              From Oak to Java 21 — the milestones that shaped the language this platform teaches
            </p>
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-4 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <code className="text-sm font-mono text-orange-400 font-bold flex-shrink-0 w-12">
                    {m.year}
                  </code>
                  <p className="text-sm text-slate-300 leading-relaxed">{m.event}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Tech Stack */}
        <AnimatedSection delay={0.3} className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-6">Built With</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {techStack.map((tech) => (
              <GlassCard key={tech.name} className="p-4 text-center">
                <p className="text-sm font-medium text-white mb-1">{tech.name}</p>
                <p className="text-[11px] text-slate-500">{tech.description}</p>
              </GlassCard>
            ))}
          </div>
        </AnimatedSection>

        {/* About the Author */}
        <AnimatedSection delay={0.35} className="mb-14">
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Coffee className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">Saurabh Sonawane</h2>
                <p className="text-sm text-slate-500 mb-4">Java Developer & Open-Source Learner</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  I&apos;m passionate about making complex concepts accessible. InsideJava is my second
                  interactive learning platform after{' '}
                  <a
                    href="https://github.com/Saurabhsds13/inside-jvm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
                  >
                    InsideJVM
                  </a>
                  . I believe the best way to learn is to teach — building these platforms forces me
                  to understand Java at the deepest level, and I hope it helps you too.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/Saurabhsds13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a
                    href="https://linkedin.com/in/saurabhsonawane13"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.4}>
          <GlassCard className="p-8 text-center">
            <Heart className="w-8 h-8 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Start Your Java Journey</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6">
              Whether you&apos;re preparing for your first interview or targeting MAANG, every topic
              is designed to build on the previous one. Start from OOPs and work your way up.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/oops"
                className="px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                Begin with OOPs
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/Saurabhsds13/Inside-Java"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-sm font-medium rounded-lg border border-white/[0.1] text-slate-300 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.05] transition-all duration-200 flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    </div>
  );
}
