'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, ChevronDown, ChevronUp, Zap, Database, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const stringPoolVisualization = [
  { label: 'String s1 = "Hello"', pool: true, heap: false, note: 'Goes to String Pool' },
  { label: 'String s2 = "Hello"', pool: true, heap: false, note: 'Points to same pool object' },
  { label: 'String s3 = new String("Hello")', pool: false, heap: true, note: 'New object in Heap' },
  { label: 's1 == s2', pool: true, heap: false, note: '✅ true (same reference)' },
  { label: 's1 == s3', pool: false, heap: true, note: '❌ false (different references)' },
  { label: 's1.equals(s3)', pool: true, heap: true, note: '✅ true (same content)' },
];

const concepts = [
  {
    id: 'immutability',
    title: 'String Immutability',
    description: 'Strings in Java are immutable — once created, their value cannot be changed.',
    color: '#3B82F6',
    reasons: [
      'Security — Strings used in class loading, network connections, DB URLs must not change',
      'Thread Safety — Immutable objects are inherently thread-safe',
      'Caching — String Pool works because strings never change',
      'Hashcode Caching — hashCode() computed once, cached for HashMap keys',
      'Performance — JVM can optimize with known-constant strings',
    ],
    code: `String s = "Hello";
s.concat(" World"); // Creates NEW string, original unchanged
System.out.println(s); // "Hello" — still the same!

// Correct way
s = s.concat(" World"); // s now points to new String
System.out.println(s); // "Hello World"

// What happens internally?
// 1. "Hello" created in String Pool
// 2. concat() creates "Hello World" (new object)
// 3. Old "Hello" is still in the pool (eligible for GC only if no references)
// 4. s variable now points to "Hello World"`,
  },
  {
    id: 'pool',
    title: 'String Pool (Intern Pool)',
    description: 'A special memory area in Heap where Java stores string literals to save memory.',
    color: '#10B981',
    reasons: [
      'String literals automatically go to the pool',
      'new String() creates object in heap (NOT in pool)',
      'intern() method manually adds to pool',
      'Pool is in Heap since Java 7 (was in PermGen before)',
      'Reduces memory by reusing identical strings',
    ],
    code: `// String Pool behavior
String a = "Java";           // Pool
String b = "Java";           // Same pool object
String c = new String("Java"); // Heap (new object)
String d = c.intern();       // Returns pool reference

System.out.println(a == b);  // true  — same pool object
System.out.println(a == c);  // false — pool vs heap
System.out.println(a == d);  // true  — intern returns pool ref

// Memory count:
// "Java" in pool = 1 object
// new String("Java") in heap = 1 object
// Total: 2 objects created, 1 in pool, 1 in heap`,
  },
  {
    id: 'comparison',
    title: '== vs .equals()',
    description: 'The most common interview question — reference equality vs content equality.',
    color: '#F59E0B',
    reasons: [
      '== compares references (memory addresses)',
      '.equals() compares content (characters)',
      'Always use .equals() for String comparison',
      'String.equals() is overridden from Object.equals()',
      '== works for pool strings only (same reference)',
    ],
    code: `String s1 = "Hello";
String s2 = "Hello";
String s3 = new String("Hello");
String s4 = new String("Hello");

// == (Reference comparison)
s1 == s2   // true  — both point to same pool object
s1 == s3   // false — pool vs heap
s3 == s4   // false — two different heap objects

// .equals() (Content comparison)
s1.equals(s2)  // true  — same content
s1.equals(s3)  // true  — same content
s3.equals(s4)  // true  — same content

// Null safety tip:
String name = null;
// name.equals("Java")  // NullPointerException!
"Java".equals(name)     // false — safe! No NPE`,
  },
  {
    id: 'builder-buffer',
    title: 'StringBuilder vs StringBuffer',
    description: 'Mutable string classes for when you need to modify strings frequently.',
    color: '#8B5CF6',
    reasons: [
      'Both are mutable — can modify without creating new objects',
      'StringBuilder: NOT thread-safe, faster (single-thread use)',
      'StringBuffer: Thread-safe (synchronized), slower',
      'Use StringBuilder in 99% of cases (most code is single-threaded)',
      'String concatenation in loops → always use StringBuilder',
    ],
    code: `// BAD — creates many intermediate String objects
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i; // Creates new String each iteration!
}
// Creates ~1000 String objects → GC pressure

// GOOD — StringBuilder (mutable, fast)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i); // Modifies internal char array
}
String result = sb.toString(); // One final String

// StringBuffer — same API but synchronized
StringBuffer sbf = new StringBuffer();
sbf.append("Thread");
sbf.append("Safe");
// Each method call acquires a lock — slower

// Performance comparison (appending 100k strings):
// String concatenation: ~4000ms
// StringBuffer:         ~8ms
// StringBuilder:        ~5ms`,
  },
];

const interviewQuestions = [
  {
    q: 'Why is String immutable in Java?',
    a: 'For security (class loading, network), thread safety, String Pool optimization, hashcode caching, and performance. If Strings were mutable, the String Pool would be impossible since one reference could change the shared object.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'How many objects are created: String s = new String("Hello")?',
    a: 'Up to 2 objects. One in the String Pool (if "Hello" doesn\'t already exist there) for the literal, and one in the Heap (the new String()). If "Hello" already exists in the pool, only 1 heap object is created.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is String.intern() and when would you use it?',
    a: 'intern() returns a canonical reference from the String Pool. If the string already exists in the pool, it returns that reference; otherwise it adds the string to the pool. Use it when you have many duplicate strings from external sources (e.g., parsing large files) to save memory.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why is String a popular HashMap key?',
    a: 'Because it is immutable, so its hashCode never changes after creation. The hashCode is computed once and cached. This guarantees consistent bucket placement and prevents key corruption.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What happens when you concatenate strings with + operator?',
    a: 'The compiler converts it to StringBuilder.append() calls (since Java 5). However, inside loops, a new StringBuilder is created per iteration — which is why explicit StringBuilder is preferred in loops.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Explain the memory structure when String Pool moved from PermGen to Heap.',
    a: 'Before Java 7, String Pool was in PermGen (fixed size, could cause OutOfMemoryError: PermGen space). Since Java 7, it moved to Heap, benefiting from dynamic sizing and regular garbage collection. This means interned strings can now be GC\'d if unreachable.',
    difficulty: 'Advanced' as const,
  },
];

export default function StringsPage() {
  const [activeConcept, setActiveConcept] = useState('immutability');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [poolStep, setPoolStep] = useState(0);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — String Mastery"
        title="String"
        titleHighlight="Handling"
        description="String Pool, immutability, == vs .equals(), StringBuilder vs StringBuffer — the most asked topic in Java interviews at every level."
        icon={Type}
        iconColor="#10B981"
        gradient="from-green-500 via-emerald-500 to-cyan-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* String Pool Interactive Visualization */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">String Pool Visualization</h3>
            <p className="text-sm text-slate-400 mb-6">Step through each line to see where strings are stored</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Steps */}
              <div className="space-y-2">
                {stringPoolVisualization.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPoolStep(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      poolStep === idx
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <code className="text-xs font-mono text-slate-300">{step.label}</code>
                    {poolStep === idx && (
                      <p className="text-xs text-green-400 mt-1">{step.note}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Memory Diagram */}
              <div className="flex gap-4">
                {/* String Pool */}
                <div className="flex-1 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">String Pool</h4>
                  <div className="space-y-2">
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-2 rounded bg-green-500/10 border border-green-500/30"
                    >
                      <code className="text-xs text-green-300">&quot;Hello&quot;</code>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        refs: s1, s2{poolStep >= 5 ? ', (equals check)' : ''}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Heap */}
                <div className="flex-1 p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Heap Memory</h4>
                  <div className="space-y-2">
                    {poolStep >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 rounded bg-purple-500/10 border border-purple-500/30"
                      >
                        <code className="text-xs text-purple-300">&quot;Hello&quot;</code>
                        <p className="text-[10px] text-slate-500 mt-0.5">ref: s3 (new object)</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Concept Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {concepts.map((concept) => (
              <button
                key={concept.id}
                onClick={() => setActiveConcept(concept.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  activeConcept === concept.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
                }`}
              >
                <div className="text-sm font-medium text-white">{concept.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{concept.description}</div>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Active Concept */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeConcept}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-14"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-2">{currentConcept.title}</h2>
                <p className="text-sm text-slate-400 mb-5">{currentConcept.description}</p>

                <h3 className="text-sm font-medium text-white mb-3">Why it matters</h3>
                <ul className="space-y-2">
                  {currentConcept.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: currentConcept.color }} />
                      {reason}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <CodeBlock
                code={currentConcept.code}
                title={`${currentConcept.id}.java`}
                showLineNumbers
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Performance Comparison */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Performance: String vs StringBuilder vs StringBuffer</h3>
            <div className="space-y-4">
              <StatBar label="String concatenation (100k ops)" value={5} color="#EF4444" />
              <StatBar label="StringBuffer (100k ops)" value={75} color="#F59E0B" />
              <StatBar label="StringBuilder (100k ops)" value={95} color="#10B981" />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * StringBuilder is ~800x faster than String concatenation in loops. StringBuffer is slightly slower due to synchronization overhead.
            </p>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="green">Strings</Badge>
          </div>
          <div className="space-y-3">
            {interviewQuestions.map((item, idx) => (
              <GlassCard
                key={idx}
                className="overflow-hidden"
                hover
                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.difficulty === 'Beginner' ? 'green' :
                        item.difficulty === 'Intermediate' ? 'blue' : 'purple'
                      }
                      size="sm"
                    >
                      {item.difficulty}
                    </Badge>
                    <span className="text-sm text-slate-200">{item.q}</span>
                  </div>
                  {expandedQ === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </div>
                <AnimatePresence>
                  {expandedQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-sm text-slate-400 border-t border-white/[0.06] pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
