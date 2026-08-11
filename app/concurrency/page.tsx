'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ChevronDown, ChevronUp, GitFork, Timer, Lock, Waves } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  {
    id: 'forkjoin',
    title: 'Fork/Join Framework',
    icon: GitFork,
    color: '#3B82F6',
    tagline: 'Divide-and-conquer parallelism (Java 7)',
  },
  {
    id: 'phaser',
    title: 'Phaser & Barriers',
    icon: Timer,
    color: '#10B981',
    tagline: 'Multi-phase coordination',
  },
  {
    id: 'locks',
    title: 'StampedLock & Advanced Locks',
    icon: Lock,
    color: '#F59E0B',
    tagline: 'Optimistic reads, lock-free tricks',
  },
  {
    id: 'reactive',
    title: 'Reactive Streams',
    icon: Waves,
    color: '#8B5CF6',
    tagline: 'Flow API & backpressure (Java 9)',
  },
];

const concepts = [
  {
    id: 'forkjoin',
    title: 'Fork/Join Framework',
    color: '#3B82F6',
    history: 'JSR 166y, Java 7 (2011). Doug Lea designed it based on the Cilk work-stealing model from MIT. The insight: when a thread finishes its own tasks, it steals from the tail of another thread\'s deque — this keeps all cores busy without centralized scheduling. parallelStream() uses ForkJoinPool.commonPool() under the hood.',
    keyPoints: [
      'Designed for CPU-bound divide-and-conquer problems — not I/O-bound work',
      'ForkJoinPool uses work-stealing: idle threads steal tasks from busy threads\' deques',
      'Two task types: RecursiveTask<V> (returns a value) and RecursiveAction (void)',
      'fork() pushes a subtask to the deque; join() waits for its result',
      'The common pool\'s parallelism = Runtime.getRuntime().availableProcessors() - 1',
      'parallelStream() submits to the common pool — blocking I/O there starves the whole JVM',
      'For custom parallelism: new ForkJoinPool(n).submit(() -> stream.parallel()...)',
      'Threshold tuning: split until chunk ≤ threshold, then solve sequentially — too fine = overhead',
    ],
    code: `// RECURSIVE TASK — parallel sum of a large array
public class ParallelSum extends RecursiveTask<Long> {
    private static final int THRESHOLD = 10_000;
    private final long[] array;
    private final int lo, hi;

    public ParallelSum(long[] array, int lo, int hi) {
        this.array = array; this.lo = lo; this.hi = hi;
    }

    @Override
    protected Long compute() {
        if (hi - lo <= THRESHOLD) {
            // BASE CASE — sequential when chunk is small enough
            long sum = 0;
            for (int i = lo; i < hi; i++) sum += array[i];
            return sum;
        }
        // DIVIDE
        int mid = (lo + hi) >>> 1;
        ParallelSum left  = new ParallelSum(array, lo, mid);
        ParallelSum right = new ParallelSum(array, mid, hi);

        left.fork();                   // push left to deque (async)
        long rightResult = right.compute();  // compute right in THIS thread
        long leftResult  = left.join();      // wait for the forked left

        return leftResult + rightResult;     // COMBINE
    }
}

// USAGE
long[] data = new long[10_000_000];
ForkJoinPool pool = ForkJoinPool.commonPool();
long sum = pool.invoke(new ParallelSum(data, 0, data.length));

// HOW WORK-STEALING WORKS
// Each thread has a double-ended queue (deque):
//   - Pushes new subtasks to the TAIL (LIFO for its own tasks → locality)
//   - Other threads steal from the HEAD (FIFO → coarsest remaining task)
// This minimizes contention: a thread touches its own tail; thieves touch the head.
// Result: near-perfect CPU utilization with minimal synchronization.

// COMMON POOL — shared by ALL parallelStream() in the JVM
ForkJoinPool.commonPool().getParallelism(); // typically cores - 1
// Set at startup: -Djava.util.concurrent.ForkJoinPool.common.parallelism=8

// THE parallelStream() TRAP
List<String> urls = List.of(/* 1000 URLs */);
urls.parallelStream()
    .map(url -> httpGet(url))     // BLOCKS a common-pool thread per URL!
    .toList();
// This starves parallelStream() everywhere else in the JVM.
// Fix: use a dedicated pool for blocking work, or virtual threads (Java 21).

// CUSTOM POOL — isolate your parallelism
ForkJoinPool custom = new ForkJoinPool(16);
List<String> results = custom.submit(() ->
    urls.parallelStream().map(this::httpGet).toList()
).join();
custom.shutdown();

// RECURSIVE ACTION — no return value (e.g., parallel sort)
public class ParallelMergeSort extends RecursiveAction {
    @Override protected void compute() {
        if (array.length <= THRESHOLD) { Arrays.sort(array); return; }
        // split, fork left, compute right, join, merge
    }
}`,
  },
  {
    id: 'phaser',
    title: 'Phaser, CyclicBarrier & CountDownLatch',
    color: '#10B981',
    history: 'CountDownLatch and CyclicBarrier came with java.util.concurrent in Java 5 (JSR 166). Phaser (Java 7) generalized both — it supports dynamic registration, multiple phases, and tiered (tree-structured) parallelism, making it suitable for iterative algorithms like parallel graph traversals.',
    keyPoints: [
      'CountDownLatch: one-shot — N threads count down, waiting threads release when count hits 0',
      'CyclicBarrier: reusable — N threads wait at the barrier, all released together, resets automatically',
      'Phaser: dynamic parties, multiple phases, supports arrival without waiting (arriveAndDeregister)',
      'Phaser replaces both Latch and Barrier for complex coordination scenarios',
      'All three are about threads waiting for each other — synchronization points',
      'CyclicBarrier can run an action when the barrier trips (e.g., merge results between phases)',
      'Phaser\'s onAdvance() hook lets you terminate the phaser after a certain phase',
    ],
    code: `// COUNTDOWN LATCH — "wait for N things to complete"
// Use case: main thread waits for all workers to finish setup
CountDownLatch latch = new CountDownLatch(3);

for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        initialize();
        latch.countDown();       // "I'm done" — decrements by 1
    }).start();
}

latch.await();                   // blocks until count reaches 0
System.out.println("All 3 initialized, proceeding");
// Latch is one-shot — cannot reset. Use CyclicBarrier if you need reuse.

// CYCLIC BARRIER — "all N threads wait for each other, then proceed together"
// Use case: simulation steps where all threads must finish step N before step N+1
int workers = 4;
CyclicBarrier barrier = new CyclicBarrier(workers, () -> {
    // This action runs ONCE when all threads arrive — merge results
    System.out.println("--- Phase complete, merging ---");
});

for (int i = 0; i < workers; i++) {
    new Thread(() -> {
        for (int phase = 0; phase < 10; phase++) {
            computePhase(phase);
            try {
                barrier.await();     // wait for all 4 threads
            } catch (Exception e) { break; }
            // All proceed to next phase together
        }
    }).start();
}
// Barrier resets automatically after each trip — reusable for multiple rounds.

// PHASER — dynamic parties, multiple phases, most flexible
Phaser phaser = new Phaser(1); // register self as a party

for (int i = 0; i < 5; i++) {
    phaser.register();           // add a party dynamically
    new Thread(() -> {
        for (int phase = 0; phase < 3; phase++) {
            work(phase);
            phaser.arriveAndAwaitAdvance();  // like barrier.await()
        }
        phaser.arriveAndDeregister();        // "I'm done permanently"
    }).start();
}

// Coordinator advances phases
phaser.arriveAndDeregister();    // remove self, let workers drive

// PHASER TERMINATION — override onAdvance
Phaser bounded = new Phaser() {
    @Override
    protected boolean onAdvance(int phase, int registeredParties) {
        return phase >= 5 || registeredParties == 0;  // terminate after 5 phases
    }
};

// COMPARISON
// CountDownLatch: one-shot, count goes to 0, waiters release. Cannot reuse.
// CyclicBarrier:  reusable, fixed party count, all-or-nothing rendezvous.
// Phaser:         reusable, dynamic parties, multi-phase, flexible termination.
//
// Rule of thumb:
// - "Wait for N tasks to finish" → CountDownLatch
// - "All threads synchronize between rounds" → CyclicBarrier
// - "Dynamic workers, multiple phases, some drop out" → Phaser`,
  },
  {
    id: 'locks',
    title: 'StampedLock & Advanced Locking',
    color: '#F59E0B',
    history: 'StampedLock was added in Java 8 (JEP 171) by Doug Lea as a higher-performance alternative to ReadWriteLock for read-dominated workloads. Its optimistic read mode allows reads without acquiring any lock at all — just a stamp validation — eliminating reader-writer contention in hot paths like caches.',
    keyPoints: [
      'ReadWriteLock: multiple readers OR one writer — but readers still acquire a read lock (costs)',
      'StampedLock adds OPTIMISTIC READ: no lock at all, just validates the stamp afterward',
      'Optimistic read: tryOptimisticRead() → read data → validate(stamp) → if invalid, fall back to read lock',
      'StampedLock is NOT reentrant — acquiring twice from the same thread deadlocks',
      'StampedLock does NOT implement Lock interface — no try-with-resources, manual unlock in finally',
      'Write lock is exclusive; read lock is shared; optimistic read is lockless',
      'For most apps: synchronized is fine. Use StampedLock only when profiling shows read contention',
      'LongAdder/LongAccumulator: for counters under high contention — striped CAS, no single hot field',
    ],
    code: `// READ-WRITE LOCK — the baseline
ReadWriteLock rwl = new ReentrantReadWriteLock();

// Readers
rwl.readLock().lock();
try { return cache.get(key); }
finally { rwl.readLock().unlock(); }

// Writer
rwl.writeLock().lock();
try { cache.put(key, value); }
finally { rwl.writeLock().unlock(); }
// Problem: even readers must acquire the read lock — under millions of reads/sec,
// the lock's internal counter becomes a contention point.

// STAMPED LOCK — optimistic read eliminates reader contention
private final StampedLock sl = new StampedLock();
private double x, y;

// OPTIMISTIC READ — the fast path (no lock acquired!)
public double distanceFromOrigin() {
    long stamp = sl.tryOptimisticRead();    // returns a stamp, acquires NOTHING
    double currentX = x, currentY = y;      // read the fields
    if (!sl.validate(stamp)) {              // did a write happen during our read?
        // FALLBACK: a write occurred — acquire a real read lock
        stamp = sl.readLock();
        try {
            currentX = x;
            currentY = y;
        } finally {
            sl.unlockRead(stamp);
        }
    }
    return Math.sqrt(currentX * currentX + currentY * currentY);
}

// WRITE — exclusive, like any other lock
public void move(double deltaX, double deltaY) {
    long stamp = sl.writeLock();
    try {
        x += deltaX;
        y += deltaY;
    } finally {
        sl.unlockWrite(stamp);
    }
}

// LOCK UPGRADE — read lock → write lock (conditional)
public void moveIfAtOrigin(double newX, double newY) {
    long stamp = sl.readLock();
    try {
        while (x == 0.0 && y == 0.0) {
            long ws = sl.tryConvertToWriteLock(stamp);
            if (ws != 0L) {
                stamp = ws;        // upgrade succeeded
                x = newX; y = newY;
                break;
            } else {
                sl.unlockRead(stamp);
                stamp = sl.writeLock();  // fallback: release read, acquire write
            }
        }
    } finally {
        sl.unlock(stamp);               // works for both read and write stamps
    }
}

// LONGADDER — striped counter for extreme write contention
LongAdder counter = new LongAdder();
// 16 threads hammering increment():
counter.increment();                    // internally: CAS on a random cell
counter.sum();                          // aggregate (slightly stale under contention)
// 5-10x faster than AtomicLong under high contention because there's no single hot field.

// WHEN TO USE WHAT
// Low contention:         synchronized (simple, proven, JIT-optimised)
// Read-heavy, low write:  StampedLock with optimistic reads
// Write-heavy counter:    LongAdder
// Need reentrancy:        ReentrantLock / ReentrantReadWriteLock
// Need try-lock:          ReentrantLock.tryLock(timeout)
// Need condition vars:    ReentrantLock + Condition`,
  },
  {
    id: 'reactive',
    title: 'Reactive Streams & Flow API (Java 9)',
    color: '#8B5CF6',
    history: 'The Reactive Streams specification (2014) was a cross-vendor effort by Netflix (RxJava), Lightbend (Akka), Pivotal (Reactor), and Oracle. Java 9 (JEP 266) embedded the four interfaces as java.util.concurrent.Flow — making backpressure a JDK-standard concept without requiring an external dependency.',
    keyPoints: [
      'Four interfaces: Publisher<T>, Subscriber<T>, Subscription, Processor<T,R>',
      'The core problem: a fast producer overwhelming a slow consumer (backpressure)',
      'Subscription.request(n): subscriber asks for EXACTLY n items — pull-based flow control',
      'Subscription.cancel(): subscriber can stop the stream at any time',
      'onNext/onError/onComplete must be called sequentially — no concurrent onNext calls',
      'SubmissionPublisher (JDK built-in) is a concrete Publisher with per-subscriber buffering',
      'Reactor (Spring WebFlux) and RxJava implement these interfaces with rich operators',
      'Virtual threads (Java 21) reduce the need for reactive — blocking becomes cheap again',
    ],
    code: `// THE FOUR INTERFACES (java.util.concurrent.Flow)
public interface Publisher<T> {
    void subscribe(Subscriber<? super T> subscriber);
}

public interface Subscriber<T> {
    void onSubscribe(Subscription subscription);  // receive the handle
    void onNext(T item);                          // receive one item
    void onError(Throwable throwable);            // terminal: error
    void onComplete();                            // terminal: done
}

public interface Subscription {
    void request(long n);    // "give me n more items" — BACKPRESSURE
    void cancel();           // "I'm done, stop sending"
}

public interface Processor<T, R> extends Subscriber<T>, Publisher<R> { }

// THE PROTOCOL — strict ordering
// 1. Publisher calls subscriber.onSubscribe(subscription)
// 2. Subscriber calls subscription.request(n) when ready
// 3. Publisher delivers at most n items via onNext()
// 4. Subscriber requests more when ready — pull-based flow control
// 5. Terminates with onComplete() or onError() — exactly once, never both

// SUBMISSION PUBLISHER — the JDK's built-in publisher
SubmissionPublisher<String> publisher = new SubmissionPublisher<>();

// A simple subscriber
Flow.Subscriber<String> subscriber = new Flow.Subscriber<>() {
    private Flow.Subscription subscription;

    @Override
    public void onSubscribe(Flow.Subscription sub) {
        this.subscription = sub;
        sub.request(1);                    // request one item to start
    }

    @Override
    public void onNext(String item) {
        System.out.println("Received: " + item);
        subscription.request(1);           // request one more after processing
    }

    @Override
    public void onError(Throwable t) { t.printStackTrace(); }

    @Override
    public void onComplete() { System.out.println("Done"); }
};

publisher.subscribe(subscriber);
publisher.submit("Hello");
publisher.submit("World");
publisher.close();                         // triggers onComplete

// BACKPRESSURE IN ACTION
// If subscriber only requests 1 at a time, and the publisher has 1 million items,
// the publisher BLOCKS (or buffers per policy) until the subscriber asks for more.
// This prevents OutOfMemoryError from unbounded buffering.

// PROCESSOR — transform in the middle (map/filter)
public class UpperCaseProcessor
    extends SubmissionPublisher<String>
    implements Flow.Processor<String, String> {

    private Flow.Subscription upstream;

    @Override
    public void onSubscribe(Flow.Subscription sub) {
        this.upstream = sub;
        sub.request(1);
    }

    @Override
    public void onNext(String item) {
        submit(item.toUpperCase());        // transform and pass downstream
        upstream.request(1);               // pull one more from upstream
    }

    @Override public void onError(Throwable t) { closeExceptionally(t); }
    @Override public void onComplete() { close(); }
}

// WHY VIRTUAL THREADS CHANGE THE EQUATION
// Reactive was invented because blocking threads are expensive (1MB each).
// Virtual threads cost ~1KB → blocking becomes cheap again.
// You can write synchronous blocking code on virtual threads at scale.
// Reactive remains useful for: event-driven architectures, streaming data,
// and cases where you genuinely model data as infinite asynchronous sequences.`,
  },
];

const concurrencyEvolution = [
  { version: 'Java 1.0 (1996)', feature: 'synchronized, wait/notify, Thread class', note: 'Gosling built threading in from day one — rare for 1996' },
  { version: 'Java 5 (2004)', feature: 'java.util.concurrent — Doug Lea\'s JSR 166', note: 'Executors, ConcurrentHashMap, locks, atomics, barriers' },
  { version: 'Java 7 (2011)', feature: 'Fork/Join, Phaser, TransferQueue', note: 'Work-stealing parallelism for CPU-bound tasks' },
  { version: 'Java 8 (2014)', feature: 'CompletableFuture, StampedLock, LongAdder', note: 'Async composition, optimistic locking, striped counters' },
  { version: 'Java 9 (2017)', feature: 'Flow API (Reactive Streams)', note: 'Backpressure as a JDK standard' },
  { version: 'Java 19 (2022)', feature: 'Virtual Threads (preview)', note: 'Lightweight threads for blocking I/O at scale' },
  { version: 'Java 21 (2023)', feature: 'Virtual Threads (final), Structured Concurrency (preview)', note: 'One-thread-per-task model viable for millions of tasks' },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is work-stealing and why does Fork/Join use it?',
    a: 'Work-stealing means idle threads steal tasks from the tail of busy threads\' deques. Fork/Join uses it because divide-and-conquer creates uneven subtask trees — one thread may finish its half quickly while another is still busy. Stealing ensures all cores stay utilized without a centralized task queue becoming a bottleneck. Each thread touches only its own deque tail (LIFO for locality), while thieves access the head (FIFO for coarsest remaining work).',
    difficulty: 'Intermediate',
  },
  {
    q: 'When should you NOT use parallelStream()?',
    a: 'When the work is I/O-bound (HTTP calls, DB queries) — it blocks common-pool threads, starving all other parallel streams in the JVM. When the collection is small (overhead outweighs gains). When the source is poorly splittable (LinkedList, Iterator). When order matters and the stream has stateful ops. When the operation mutates shared state. Rule: only for CPU-bound work on large, easily-splittable collections (ArrayList, arrays, IntStream.range).',
    difficulty: 'Intermediate',
  },
  {
    q: 'What is the difference between CountDownLatch and CyclicBarrier?',
    a: 'CountDownLatch is one-shot: N threads count down to zero, and waiting threads release. It cannot be reset. CyclicBarrier is reusable: N threads arrive, all block until the last arrives, then all proceed and the barrier resets for the next round. Use Latch for "wait for N things to finish" (like startup initialization). Use Barrier for "all threads synchronize between iterative phases" (like simulation steps).',
    difficulty: 'Intermediate',
  },
  {
    q: 'Explain StampedLock\'s optimistic read and when it helps.',
    a: 'tryOptimisticRead() returns a stamp without acquiring any lock. You read the shared fields, then call validate(stamp). If no write occurred during your read, validation succeeds and you\'re done — zero contention. If a write did occur, you fall back to a normal read lock. This helps in read-dominated workloads (caches, lookups) where writes are rare: readers never block each other or writers, eliminating the internal state contention that even a ReadWriteLock\'s read lock causes.',
    difficulty: 'Advanced',
  },
  {
    q: 'What problem does Reactive Streams / backpressure solve?',
    a: 'A fast producer overwhelming a slow consumer. Without backpressure, the producer buffers all items in memory → OutOfMemoryError. With backpressure, the subscriber calls request(n) to say "I can handle n more items." The publisher must respect this and not emit more than requested. This gives the consumer flow control without blocking the producer thread — it can choose to buffer, drop, or slow down based on the consumer\'s pace.',
    difficulty: 'Intermediate',
  },
  {
    q: 'Why is StampedLock not reentrant, and why does that matter?',
    a: 'StampedLock uses a simple state word and stamp for maximum performance — tracking reentrancy would add overhead. If the same thread calls writeLock() twice without unlocking, it deadlocks on itself because the lock does not recognize the holder. This means you cannot use StampedLock in recursive algorithms or methods that call other synchronized code paths. For reentrant needs, use ReentrantReadWriteLock instead.',
    difficulty: 'Advanced',
  },
  {
    q: 'How does Phaser improve over CyclicBarrier?',
    a: 'Phaser supports dynamic registration (parties can join or leave mid-execution), which CyclicBarrier does not. It also supports multiple named phases with an onAdvance() hook for termination logic. A thread can arriveAndDeregister() — completing its part without blocking others. CyclicBarrier requires a fixed party count set at construction and all parties must participate every round. Phaser is the right choice for iterative algorithms where workers may complete at different rates.',
    difficulty: 'Advanced',
  },
  {
    q: 'Do virtual threads make reactive programming obsolete?',
    a: 'Not entirely, but they eliminate its primary justification. Reactive was adopted because blocking a platform thread (1MB stack) is expensive at scale. Virtual threads (~1KB) make blocking cheap again, so you can write simple synchronous code handling millions of concurrent I/O operations. Reactive remains valuable for: genuinely event-driven architectures, streaming/infinite data processing, and combining multiple async sources declaratively. But for typical request-response microservices, virtual threads with blocking code is simpler and often sufficient.',
    difficulty: 'Advanced',
  },
];

export default function ConcurrencyPage() {
  const [activeConcept, setActiveConcept] = useState('forkjoin');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Advanced — Deep Concurrency"
        title="Concurrency"
        titleHighlight="Deep Dive"
        description="Fork/Join work-stealing, Phaser coordination, StampedLock optimistic reads, and Reactive Streams backpressure — the advanced concurrency primitives that power high-performance Java systems. From Doug Lea's JSR 166 to Java 21's virtual threads."
        icon={Network}
        iconColor="#F59E0B"
        gradient="from-amber-500 via-orange-500 to-red-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Concurrency Evolution */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Java Concurrency Evolution</h3>
            <p className="text-sm text-slate-400 mb-6">
              From Gosling&apos;s synchronized (1996) to virtual threads (2023) — each era solved a scaling ceiling
            </p>
            <div className="space-y-2">
              {concurrencyEvolution.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <code className="text-[11px] font-mono text-amber-400 font-medium">{item.version}</code>
                  <span className="text-xs text-slate-300">{item.feature}</span>
                  <span className="text-xs text-slate-500">{item.note}</span>
                </motion.div>
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
                    layoutId="activeConcurrency"
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

                <div className="mb-5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Historical Context</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentConcept.history}</p>
                </div>

                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {currentConcept.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ background: currentConcept.color }}
                      />
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
            <Badge variant="orange">Concurrency</Badge>
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
