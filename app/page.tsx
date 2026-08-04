'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, ArrowRight, BookOpen, Code2, Layers, Zap, Shield, Trophy } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';

const levels = [
  {
    title: 'Beginner',
    subtitle: 'TCS / Infosys / Fresher Level',
    color: '#10B981',
    icon: BookOpen,
    topics: [
      { name: 'OOPs Concepts', href: '/oops' },
      { name: 'String Handling', href: '/strings' },
      { name: 'Exception Handling', href: '/exceptions' },
      { name: 'Collections Framework', href: '/collections' },
      { name: 'Generics & Type Erasure', href: '/generics' },
      { name: 'Keywords Deep Dive', href: '/keywords' },
    ],
  },
  {
    title: 'Intermediate',
    subtitle: 'Product Company Level',
    color: '#3B82F6',
    icon: Code2,
    topics: [
      { name: 'Java 8 Features', href: '/java8' },
      { name: 'Multithreading', href: '/multithreading' },
      { name: 'Collections Internals', href: '/collections-internals' },
      { name: 'Design Patterns', href: '/design-patterns' },
      { name: 'Java I/O & NIO', href: '/io-nio' },
      { name: 'Annotations & Reflection', href: '/annotations' },
    ],
  },
  {
    title: 'Advanced',
    subtitle: 'MAANG / Oracle Level',
    color: '#8B5CF6',
    icon: Trophy,
    topics: [
      { name: 'Java 17-21 Features', href: '/modern-java' },
      { name: 'Concurrency Deep Dive', href: '/concurrency' },
      { name: 'Serialization', href: '/serialization' },
      { name: 'Memory Management', href: '/memory' },
      { name: 'Java Security', href: '/security' },
      { name: 'Testing & Best Practices', href: '/testing' },
    ],
  },
];

const features = [
  {
    icon: Layers,
    title: 'Interactive Visualizations',
    description: 'Not just text — see how Java works through animated diagrams and live code.',
    color: '#06B6D4',
  },
  {
    icon: Code2,
    title: 'Real Code Examples',
    description: 'Every concept backed with production-quality Java code you can copy and run.',
    color: '#10B981',
  },
  {
    icon: Zap,
    title: 'Interview Ready',
    description: 'Each page ends with curated interview questions from TCS to MAANG level.',
    color: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Deep Internals',
    description: 'Go beyond syntax — understand how HashMap works internally, why String is immutable.',
    color: '#8B5CF6',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 blur-3xl pointer-events-none bg-gradient-radial from-blue-500/40 via-purple-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] text-sm text-slate-400 mb-8"
            >
              <Coffee className="w-4 h-4 text-orange-400" />
              From Fresher to MAANG — The Complete Java Journey
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]"
            >
              Inside
              <span className="gradient-text">Java</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              The most interactive Core Java learning platform on the web. 
              Master every concept with live visualizations, real code examples, 
              and interview-focused content.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/oops"
                className="px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:from-orange-500 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-orange-500/20 flex items-center gap-2"
              >
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/interview"
                className="px-6 py-3 text-sm font-medium rounded-lg border border-white/[0.1] text-slate-300 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.05] transition-all duration-200"
              >
                Interview Prep
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <GlassCard className="p-6 h-full">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Learning Roadmap */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="section-heading text-white mb-4">
              Learning <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              Structured path from absolute beginner to advanced Java developer. 
              Each topic builds on the previous one.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {levels.map((level, idx) => (
              <AnimatedSection key={level.title} delay={idx * 0.1}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${level.color}15`, border: `1px solid ${level.color}30` }}
                    >
                      <level.icon className="w-5 h-5" style={{ color: level.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{level.title}</h3>
                      <p className="text-xs text-slate-500">{level.subtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {level.topics.map((topic) => (
                      <Link
                        key={topic.href}
                        href={topic.href}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all group"
                      >
                        <span>{topic.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
