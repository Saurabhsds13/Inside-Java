'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryStick, ChevronDown, ChevronUp, Link2, Droplets, Ghost, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const topics = [
  {
    id: 'references',
    title: 'Reference Types',
    icon: Link2,
    color: '#3B82F6',
    tagline: 'Strong, Soft, Weak, Phantom',
  },
  {
    id: 'gc',
    title: 'GC from Java Perspective',
    icon: Trash2,
    color: '#10B981',
    tagline: 'How objects become garbage',
  },
  {
    id: 'leaks',
    title: 'Memory Leaks in Java',
    icon: Droplets,
    color: '#F59E0B',
    tagline: 'Yes, they happen in GC languages',
  },
  {
    id: 'finalization',
    title: 'Finalization & Cleaners',
    icon: Ghost,
    color: '#8B5CF6',
    tagline: 'finalize() is dead, long live Cleaner',
  },
];

const concepts = [
  {
    id: 'references',
    title: 'Reference Types (java.lang.ref)',
    color: '#3B82F6',
    history: 'Added in JDK 1.2 (1998). Before this, all references were "strong" — either reachable or not. The java.lang.ref package introduced a spectrum of reachability levels, letting developers cooperate with the GC: "keep this if memory allows, clear it if pressed." This enabled cache implementations that automatically shrink under memory pressure without manual eviction logic.',
    keyPoints: [
      'Strong reference: the default. Object cannot be GC\'d while any strong ref exists',
      'Soft reference: cleared BEFORE OutOfMemoryError. JVM keeps it while heap is plentiful',
      'Weak reference: cleared at the NEXT GC cycle, regardless of memory pressure',
      'Phantom reference: enqueued AFTER the object is finalized — for cleanup without resurrection',
      'ReferenceQueue: the GC places cleared refs here, letting your code react to reclamation',
      'WeakHashMap: keys are weak refs — entries vanish when the key is GC\'d (canonical use: caches)',
      'Soft refs are NOT a reliable cache — the JVM may clear them aggressively or keep them too long',
      'Modern alternative to Soft: explicit cache with size-bounded eviction (Caffeine, Guava Cache)',
    ],
    code: `// STRONG — the normal reference. Object lives as long as this variable is reachable.
Object strong = new Object();
// strong = null;  // only NOW can the object be collected

// SOFT — GC clears it only when memory is low (before throwing OOM)
SoftReference<byte[]> cache = new SoftReference<>(loadLargeImage());
byte[] img = cache.get();          // may return null if GC cleared it
if (img == null) {
    img = loadLargeImage();         // re-fetch on cache miss
    cache = new SoftReference<>(img);
}
// Use case: memory-sensitive caches that auto-shrink under pressure
// Problem: eviction timing is JVM-dependent and unpredictable

// WEAK — collected at the NEXT GC regardless of available memory
WeakReference<Session> weakSession = new WeakReference<>(session);
Session s = weakSession.get();     // null if already collected
// Use case: metadata about objects you don't own (listeners, canonicalization)

// WEAK HASH MAP — keys are weak references
WeakHashMap<ClassLoader, Metadata> loaderMeta = new WeakHashMap<>();
loaderMeta.put(Thread.currentThread().getContextClassLoader(), meta);
// When the ClassLoader is unloaded and GC'd, the entry disappears automatically.
// This prevents ClassLoader leaks in app servers.

// PHANTOM — you can NEVER retrieve the referent (.get() always returns null)
ReferenceQueue<HeavyResource> queue = new ReferenceQueue<>();
PhantomReference<HeavyResource> phantom =
    new PhantomReference<>(resource, queue);

// Cleanup thread polls the queue
new Thread(() -> {
    while (true) {
        Reference<? extends HeavyResource> ref = queue.remove(); // blocks
        // The referent is already gone — perform off-heap cleanup
        releaseNativeMemory(ref);
        ref.clear();
    }
}).start();
// Phantom refs let you do cleanup AFTER the object is gone without finalize().

// REFERENCE QUEUE — how you react to GC events
ReferenceQueue<Object> rq = new ReferenceQueue<>();
WeakReference<Object> wr = new WeakReference<>(new Object(), rq);
System.gc();   // hint (not guaranteed)
Reference<?> polled = rq.poll();   // non-null if the referent was collected

// THE REACHABILITY SPECTRUM
// 1. Strongly reachable   → live, never collected
// 2. Softly reachable     → collected under memory pressure
// 3. Weakly reachable     → collected at next GC
// 4. Phantom reachable    → finalized, awaiting cleanup notification
// 5. Unreachable          → eligible for immediate reclamation

// WHY NOT USE SoftReference AS A CACHE
// 1. JVM may clear ALL soft refs when heap grows, causing a stampede of re-fetches
// 2. Or keep them too long, wasting memory (no LRU or TTL policy)
// 3. No insight into hit rates, size, or eviction reason
// Better: Caffeine.newBuilder().maximumSize(10_000).expireAfterAccess(5, MINUTES).build()`,
  },
  {
    id: 'gc',
    title: 'Garbage Collection from the Developer\'s Perspective',
    color: '#10B981',
    history: 'Java was one of the first mainstream languages with automatic GC (1995). The JVM has evolved through Serial → Parallel → CMS → G1 (default since Java 9) → ZGC/Shenandoah (Java 15+). From a developer perspective, what matters is not the collector algorithm but what makes objects eligible and what accidentally keeps them alive.',
    keyPoints: [
      'An object is eligible for GC when no live thread can reach it through any chain of strong references',
      'Setting a reference to null does NOT force collection — it makes the object ELIGIBLE',
      'System.gc() is a hint, not a command — the JVM may ignore it entirely',
      'GC roots: local variables in active stack frames, static fields, JNI references, thread objects',
      'Generational hypothesis: most objects die young → young gen is small and collected often',
      'Full GC pauses can spike latency — the main motivation for G1/ZGC (sub-millisecond pauses)',
      'Object allocation is fast: bump a pointer in TLAB (thread-local allocation buffer) — cheaper than malloc',
      'The best GC tuning is reducing allocation: fewer objects = less work for any collector',
    ],
    code: `// WHAT MAKES AN OBJECT ELIGIBLE FOR GC
void method() {
    Object a = new Object();   // a is a GC root (local variable on stack)
    Object b = new Object();
    a = b;                     // original object that a pointed to is now unreachable
    // At method exit, both a and b go out of scope → both objects eligible
}

// ISLAND OF ISOLATION — circular references are collected
class Node {
    Node next;
}
Node a = new Node();
Node b = new Node();
a.next = b;
b.next = a;   // circular reference
a = null;
b = null;
// Both nodes are unreachable from any GC root → both collected
// Java GC traces from roots, unlike reference counting (which would leak here)

// GC ROOTS — where reachability tracing starts
// 1. Local variables and parameters of active (on-stack) methods
// 2. Static fields of loaded classes
// 3. Active Thread objects
// 4. JNI references held by native code
// 5. Objects used as monitors (currently locked)

// ALLOCATION IS FAST — the TLAB (Thread-Local Allocation Buffer)
// Each thread has a pre-allocated chunk of Eden space.
// new Object() = bump a pointer — no locking, no system call.
// When the TLAB is full, get a new chunk (lock-free via CAS).
// This makes Java allocation FASTER than malloc() in most cases.

// GENERATIONAL COLLECTION (G1 default since Java 9)
// Young Gen (Eden + Survivor): small, collected often (minor GC)
//   - 90%+ objects die here → very fast collection
// Old Gen: large, collected less often (mixed/full GC)
//   - Long-lived objects promoted here after surviving N minor GCs
// Metaspace: class metadata (was PermGen before Java 8)

// DEVELOPER ACTIONS THAT AFFECT GC
// 1. Reduce allocation rate (object pools for very hot paths, builders vs concat)
// 2. Avoid accidental retention (clear references, unregister listeners)
// 3. Right-size collections (new ArrayList<>(expected) avoids repeated resizing)
// 4. Avoid finalizers/cleaners — they add GC overhead and delay collection
// 5. Prefer short-lived objects — they die in Eden (cheapest to collect)

// USEFUL JVM FLAGS FOR OBSERVATION
// -verbose:gc                  — basic GC log
// -Xlog:gc*                    — detailed G1 logging (Java 9+)
// -XX:+HeapDumpOnOutOfMemoryError — capture heap on OOM
// -XX:+UseG1GC                 — G1 (default since Java 9)
// -XX:+UseZGC                  — ZGC (sub-ms pauses, Java 15+)
// -XX:MaxGCPauseMillis=200     — G1 target pause (soft goal)

// MONITORING
Runtime rt = Runtime.getRuntime();
long free  = rt.freeMemory();
long total = rt.totalMemory();
long max   = rt.maxMemory();         // -Xmx value
long used  = total - free;`,
  },
  {
    id: 'leaks',
    title: 'Memory Leaks in Java',
    color: '#F59E0B',
    history: 'Java developers believed GC made memory leaks impossible. In practice, "unintentional object retention" (objects reachable but no longer needed) became the #1 production memory issue. PermGen exhaustion in app servers, ClassLoader leaks, and listener accumulation are Java-specific leak patterns that have plagued the ecosystem since the early 2000s.',
    keyPoints: [
      'A Java memory leak = objects still reachable but never used again. GC cannot help.',
      'Collections that grow but never shrink: static Map accumulating entries without eviction',
      'Listener/callback leaks: registering without unregistering pins the listener (and its context)',
      'ClassLoader leaks: one retained reference to a class prevents unloading the entire ClassLoader',
      'ThreadLocal leaks: set without remove() in a thread-pool → value lives forever on pooled thread',
      'Inner classes hold an implicit reference to the enclosing instance (use static nested instead)',
      'InputStream/connection leaks: each holds an OS file descriptor — exhaust ulimit, then crash',
      'Diagnosis: heap dumps (jmap, -XX:+HeapDumpOnOutOfMemoryError) + MAT or VisualVM',
    ],
    code: `// LEAK 1: STATIC COLLECTION — grows forever
public class EventLog {
    private static final List<Event> history = new ArrayList<>();

    public static void log(Event e) {
        history.add(e);   // never removed → unbounded growth → OOM
    }
}
// Fix: bounded collection, TTL eviction, or weak references

// LEAK 2: LISTENER NOT UNREGISTERED
public class Screen {
    public Screen(EventBus bus) {
        bus.subscribe(this::onEvent);   // bus holds strong ref to Screen
    }
    // No unsubscribe → Screen cannot be GC'd even after it's "closed"
    // Fix: bus.unsubscribe(this::onEvent) in a close/dispose method
}

// LEAK 3: THREADLOCAL in a thread pool
private static final ThreadLocal<UserContext> CTX = new ThreadLocal<>();

public void handleRequest(Request req) {
    CTX.set(new UserContext(req.getUser()));
    try {
        process(req);
    } finally {
        CTX.remove();   // CRITICAL — without this, context lives on the pooled thread forever
    }
}
// In a 200-thread pool: 200 UserContext objects pinned indefinitely
// If UserContext holds a ClassLoader → ClassLoader leak → Metaspace OOM

// LEAK 4: INNER CLASS retains enclosing instance
public class Server {
    private byte[] largeBuffer = new byte[10_000_000]; // 10MB

    public Runnable createTask() {
        return new Runnable() {          // anonymous inner class
            @Override public void run() {
                System.out.println("working");
            }
        };
        // This Runnable holds an implicit reference to Server (and its 10MB buffer!)
    }
}
// Fix: use a static nested class or a lambda (lambdas capture only what they use)

// LEAK 5: ClassLoader leak (classic in app servers)
// One class from the old WAR is still referenced (e.g., via a static field in a JDK class)
// → its ClassLoader cannot be unloaded
// → ALL classes loaded by that ClassLoader stay in Metaspace
// → redeploy 5 times → Metaspace OOM
// Diagnosis: MAT → find GC root → trace the one reference holding the ClassLoader

// LEAK 6: UNCLOSED RESOURCES
public String read(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    return br.readLine();
    // br is never closed! File descriptor leaks.
    // After 1024 leaked FDs on Linux: "Too many open files"
}
// Fix: try-with-resources, always.

// DIAGNOSIS TOOLING
// 1. jmap -dump:format=b,file=heap.hprof <pid>     — capture a heap dump
// 2. -XX:+HeapDumpOnOutOfMemoryError                — auto-dump on OOM
// 3. Eclipse MAT: open dump → Leak Suspects → Dominator Tree
//    Shows which objects retain the most memory and the reference chain holding them
// 4. VisualVM / JConsole: live monitoring of heap usage and GC activity
// 5. jcmd <pid> GC.class_histogram                  — top memory consumers by class`,
  },
  {
    id: 'finalization',
    title: 'Finalization & Cleaners',
    color: '#8B5CF6',
    history: 'finalize() was part of Java since 1.0 — Gosling included it as a safety net for native resource cleanup. It turned out to be a terrible mechanism: unpredictable timing, single finalizer thread, resurrection bugs, GC overhead. It was deprecated for removal in Java 9 (JEP 421). java.lang.ref.Cleaner (Java 9) provides a safer, more predictable replacement. PhantomReference is the underlying mechanism.',
    keyPoints: [
      'finalize() is deprecated for removal — do not use it in new code',
      'Problems: no guaranteed timing, single thread (queue backs up), objects survive one extra GC cycle',
      'Finalizable objects require two GC cycles to collect: first to finalize, second to reclaim',
      'finalize() can RESURRECT an object by re-establishing a strong reference — a nightmare to reason about',
      'Cleaner (Java 9): register a Runnable that runs when the object becomes phantom-reachable',
      'Cleaner actions MUST NOT reference the object being cleaned — or it can never be collected',
      'The correct pattern: a static nested Runnable holding only the native handle, not the outer object',
      'Best practice: implement AutoCloseable + try-with-resources, use Cleaner only as a safety net',
    ],
    code: `// THE OLD WAY — finalize() (DO NOT USE)
public class OldResource {
    private long nativeHandle;

    @Override
    @Deprecated(since = "9", forRemoval = true)
    protected void finalize() throws Throwable {
        try {
            releaseNative(nativeHandle);   // might run minutes/hours later — or never
        } finally {
            super.finalize();
        }
    }
}
// PROBLEMS:
// 1. GC must queue the object on the finalizer thread → 2 GC cycles to reclaim
// 2. One slow finalizer blocks ALL others (single thread)
// 3. If finalize() throws, it's silently swallowed
// 4. The object can be resurrected: this.someStaticField = this; → never collected!
// 5. Adds ~430 bytes of overhead per finalizable object

// THE MODERN WAY — Cleaner (Java 9+)
public class NativeResource implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();

    private final Cleaner.Cleanable cleanable;
    private final CleanupAction action;
    private boolean closed = false;

    // IMPORTANT: CleanupAction must NOT reference NativeResource!
    // If it did, the reference would keep the object alive → cleaner never fires.
    private static class CleanupAction implements Runnable {
        private long nativeHandle;

        CleanupAction(long handle) { this.nativeHandle = handle; }

        @Override
        public void run() {
            if (nativeHandle != 0) {
                releaseNative(nativeHandle);
                nativeHandle = 0;
            }
        }
    }

    public NativeResource() {
        long handle = allocateNative();
        this.action = new CleanupAction(handle);
        this.cleanable = CLEANER.register(this, action);
    }

    // PRIMARY cleanup path — deterministic, via try-with-resources
    @Override
    public void close() {
        if (!closed) {
            closed = true;
            cleanable.clean();   // runs the action NOW and deregisters
        }
    }

    // If the user forgets close(), the Cleaner fires when GC collects this object.
    // This is the SAFETY NET, not the primary mechanism.
}

// USAGE — always prefer explicit close
try (var resource = new NativeResource()) {
    resource.doWork();
}   // close() called deterministically here

// IF THE USER FORGETS close():
// Eventually GC collects NativeResource → Cleaner runs CleanupAction
// Still works, just non-deterministic timing. Way better than finalize().

// WHY THE STATIC CLASS MATTERS
// WRONG:
// private Runnable action = () -> releaseNative(this.handle);
// "this" is captured → strong ref to NativeResource → never collected → cleaner never fires!
// RIGHT:
// static class with only the long handle — no reference to the outer object.

// AutoCloseable + Cleaner PATTERN SUMMARY
// 1. Implement AutoCloseable → the happy path (try-with-resources)
// 2. Register a Cleaner with a STATIC action → the safety net
// 3. In close(): call cleanable.clean() → deterministic cleanup + deregistration
// 4. Action class: static, holds ONLY the native resource handle`,
  },
];

const referenceStrength = [
  { type: 'Strong', cleared: 'Never (while reachable)', gcBehavior: 'Object cannot be collected', useCase: 'Normal variables — the default', color: '#10B981' },
  { type: 'Soft', cleared: 'Before OOM is thrown', gcBehavior: 'Cleared under memory pressure', useCase: 'Memory-sensitive caches', color: '#3B82F6' },
  { type: 'Weak', cleared: 'At next GC cycle', gcBehavior: 'Cleared eagerly, regardless of memory', useCase: 'Canonicalization, metadata maps', color: '#F59E0B' },
  { type: 'Phantom', cleared: 'After finalization', gcBehavior: 'get() always returns null', useCase: 'Post-mortem cleanup (native resources)', color: '#8B5CF6' },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is the difference between Soft and Weak references?',
    a: 'Both let the GC collect the referent, but the timing differs. A soft reference is cleared only when the JVM needs memory (before throwing OOM) — so the object stays alive as long as heap is plentiful. A weak reference is cleared at the very next GC cycle regardless of available memory. Use soft for caches where retention is helpful but not critical; use weak for metadata maps where you do not want to prevent collection at all (e.g., WeakHashMap, listener registries).',
    difficulty: 'Intermediate',
  },
  {
    q: 'Can circular references cause memory leaks in Java?',
    a: 'No. Java GC uses tracing from GC roots, not reference counting. If two objects reference each other but no GC root can reach either, both are collected. Reference counting (used in Python/Objective-C) WOULD leak on cycles, which is why they need cycle detectors. Java\'s tracing approach handles cycles naturally. The only thing that prevents collection is reachability from a root — not the number of references to an object.',
    difficulty: 'Beginner',
  },
  {
    q: 'What is a memory leak in Java if there is GC?',
    a: 'An unintentional object retention: objects that are still reachable (GC cannot collect them) but are never used again. Examples: static collections that grow without bounds, listeners registered without unregistering, ThreadLocals not removed in pooled threads. The GC cannot help because the objects ARE reachable — from its perspective, they are live. Diagnosis requires heap dump analysis (MAT) to find the reference chain keeping them alive.',
    difficulty: 'Intermediate',
  },
  {
    q: 'Why was finalize() deprecated and what replaces it?',
    a: 'finalize() had fatal design flaws: unpredictable timing (may run minutes later or never), a single finalizer thread (one slow finalizer blocks all others), two-GC-cycle cost (first cycle finalizes, second reclaims), possible resurrection, and silent exception swallowing. Java 9\'s Cleaner (backed by PhantomReference + a dedicated thread) replaces it: the cleanup action is a static Runnable that cannot resurrect the object, and multiple cleaners can run concurrently. The primary cleanup path should always be AutoCloseable.close() via try-with-resources.',
    difficulty: 'Advanced',
  },
  {
    q: 'What is a PhantomReference and when would you use it?',
    a: 'A PhantomReference\'s get() ALWAYS returns null — you can never access the referent through it. It is enqueued on a ReferenceQueue only after the object has been finalized and is about to be reclaimed. Use it for post-mortem cleanup of resources the object owned (native memory, file handles) without the risks of finalize(). The Cleaner API is built on top of PhantomReference internally. Direct use is rare — prefer Cleaner unless you need custom queue processing.',
    difficulty: 'Advanced',
  },
  {
    q: 'How does ThreadLocal cause memory leaks?',
    a: 'Thread pools reuse threads — they never terminate. A ThreadLocal value set during request handling remains on the Thread\'s ThreadLocalMap until explicitly removed. If the value references large objects (user sessions) or a web-app ClassLoader, those are pinned in memory for the lifetime of the thread. After N requests without remove(), N values accumulate. Fix: always call ThreadLocal.remove() in a finally block, or use a framework-managed request scope.',
    difficulty: 'Advanced',
  },
  {
    q: 'Why is object allocation in Java faster than malloc?',
    a: 'Each thread has a Thread-Local Allocation Buffer (TLAB) — a pre-allocated chunk of Eden space. Allocating an object is just bumping a pointer within the TLAB: one addition, no locking, no system call, no free-list search. When the TLAB fills, the thread gets a new chunk via a CAS. This makes allocation O(1) and lock-free. malloc must search a free list, handle fragmentation, and synchronize across threads. Java allocation is ~10ns; malloc is ~50-100ns.',
    difficulty: 'Advanced',
  },
  {
    q: 'What are GC roots?',
    a: 'GC roots are the starting points from which the GC traces reachability. The main roots are: local variables and parameters on active stack frames, static fields of loaded classes, active Thread objects, JNI references from native code, and objects used as synchronization monitors. Any object reachable from a root (directly or through a chain of strong references) is considered live and will not be collected. Everything else is garbage.',
    difficulty: 'Beginner',
  },
];

export default function MemoryPage() {
  const [activeConcept, setActiveConcept] = useState('references');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Advanced — JVM Memory"
        title="Memory"
        titleHighlight="Management"
        description="Reference types (Strong, Soft, Weak, Phantom), how GC decides what to collect, why memory leaks still happen in a GC language, and why finalize() was deprecated after 25 years."
        icon={MemoryStick}
        iconColor="#3B82F6"
        gradient="from-blue-500 via-indigo-500 to-violet-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Reference Strength Spectrum */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">The Reachability Spectrum</h3>
            <p className="text-sm text-slate-400 mb-6">
              From &quot;never collect&quot; to &quot;already gone&quot; — four levels of reference strength
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {referenceStrength.map((ref) => (
                <div
                  key={ref.type}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${ref.color}25`, backgroundColor: `${ref.color}08` }}
                >
                  <code className="text-sm font-mono font-semibold" style={{ color: ref.color }}>
                    {ref.type}
                  </code>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cleared when</p>
                      <p className="text-xs text-slate-300">{ref.cleared}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">GC behavior</p>
                      <p className="text-xs text-slate-300">{ref.gcBehavior}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Use case</p>
                      <p className="text-xs text-slate-400">{ref.useCase}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Topic Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveConcept(topic.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activeConcept === topic.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <topic.icon className="w-5 h-5 mb-2" style={{ color: topic.color }} />
                <div className="text-sm font-medium text-white">{topic.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{topic.tagline}</div>
                {activeConcept === topic.id && (
                  <motion.div
                    layoutId="activeMemory"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${topic.color}50` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
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
                <div className="mb-5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Historical Context</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentConcept.history}</p>
                </div>
                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {currentConcept.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: currentConcept.color }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
              <CodeBlock code={currentConcept.code} title={`${activeConcept}.java`} showLineNumbers />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="blue">Memory</Badge>
          </div>
          <div className="space-y-3">
            {interviewQuestions.map((item, idx) => (
              <GlassCard key={idx} className="overflow-hidden" hover onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.difficulty === 'Beginner' ? 'green' : item.difficulty === 'Intermediate' ? 'blue' : 'purple'} size="sm">{item.difficulty}</Badge>
                    <span className="text-sm text-slate-200">{item.q}</span>
                  </div>
                  {expandedQ === idx ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </div>
                <AnimatePresence>
                  {expandedQ === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-4 pb-4 text-sm text-slate-400 border-t border-white/[0.06] pt-3">{item.a}</div>
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
