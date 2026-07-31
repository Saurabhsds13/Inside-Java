import type { NavItem } from '@/types';

export const navItems: NavItem[] = [
  // Beginner
  { label: 'OOPs Concepts', href: '/oops', description: 'Four pillars of OOP' },
  { label: 'String Handling', href: '/strings', description: 'Immutability & pool' },
  { label: 'Exception Handling', href: '/exceptions', description: 'Checked vs unchecked' },
  { label: 'Collections', href: '/collections', description: 'List, Set, Map, Queue' },
  { label: 'Generics', href: '/generics', description: 'Type erasure & bounds' },
  { label: 'Keywords Deep Dive', href: '/keywords', description: 'static, final, this, super' },
  // Intermediate
  { label: 'Java 8 Features', href: '/java8', description: 'Lambdas & Streams' },
  { label: 'Multithreading', href: '/multithreading', description: 'Concurrency basics' },
  { label: 'Collections Internals', href: '/collections-internals', description: 'HashMap internals' },
  { label: 'Design Patterns', href: '/design-patterns', description: 'GOF patterns in Java' },
  { label: 'Java I/O & NIO', href: '/io-nio', description: 'Streams & channels' },
  { label: 'Annotations & Reflection', href: '/annotations', description: 'Runtime metadata' },
  // Advanced
  { label: 'Java 17-21', href: '/modern-java', description: 'Records, sealed, patterns' },
  { label: 'Concurrency Deep Dive', href: '/concurrency', description: 'Fork/Join & locks' },
  { label: 'Serialization', href: '/serialization', description: 'Java & JSON serialization' },
  { label: 'Memory Management', href: '/memory', description: 'Reference types' },
  { label: 'Java Security', href: '/security', description: 'ClassLoader & crypto' },
  { label: 'Testing & Best Practices', href: '/testing', description: 'JUnit 5 & TDD' },
];
