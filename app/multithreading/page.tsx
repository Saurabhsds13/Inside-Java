'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ChevronDown, ChevronUp, Play, Users, Hourglass, GitMerge, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  {
    id: 'lifecycle',
    title: 'Thread Lifecycle',
    icon: Play,
    color: '#3B82F6',
    tagline: 'NEW → TERMINATED',
  },
  {
    id: 'executors',
    title: 'ExecutorService',
    icon: Users,
    color: '#10B981',
    tagline: 'Managed thread pools',
  },
  {
    id: 'callable-future',
    title: 'Callable & Future',
    icon: Hourglass,
    color: '#F59E0B',
    tagline: 'Results from tasks',
  },
  {
    id: 'completable-future',
    title: 'CompletableFuture',
    icon: GitMerge,
    color: '#8B5CF6',
    tagline: 'Async composition',
  },
  {
    id: 'safety',
    title: 'Thread Safety',
    icon: ShieldAlert,
    color: '#EF4444',
    tagline: 'synchronized, volatile, locks',
  },
];

const concepts = [
  {
    id: 'lifecycle',
    title: 'Thread Lifecycle',
    color: '#3B82F6',
    keyPoints: [
      'Six states in Thread.State: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED',
      'start() moves NEW → RUNNABLE. Calling start() twice throws IllegalThreadStateException',
      'Calling run() directly executes on the CURRENT thread — no new thread is created',
      'RUNNABLE covers both "ready" and "actually running" — the JVM does not distinguish',
      'BLOCKED = waiting to acquire a monitor lock. WAITING = waiting on another thread indefinitely',
      'A TERMINATED thread cannot be restarted — create a new Thread object',
      'Daemon threads do not prevent JVM shutdown; set via setDaemon(true) before start()',
    ],
    code: `// TWO WAYS to define work (prefer Runnable — leaves inheritance free)
class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " working");
    }
}

Thread t1 = new Thread(new MyTask(), "worker-1");
Thread t2 = new Thread(() -> System.out.println("lambda task"), "worker-2");

// THE CLASSIC MISTAKE
t1.run();    // runs on MAIN thread — no concurrency at all
t1.start();  // spawns a real OS thread, then invokes run()

// STATE TRANSITIONS
Thread t = new Thread(() -> {
    try {
        Thread.sleep(1000);       // RUNNABLE → TIMED_WAITING
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt(); // restore the flag!
    }
});

System.out.println(t.getState());  // NEW
t.start();
System.out.println(t.getState());  // RUNNABLE
Thread.sleep(100);
System.out.println(t.getState());  // TIMED_WAITING
t.join();                          // main waits for t to finish
System.out.println(t.getState());  // TERMINATED

// INTERRUPTION — cooperative, not forced
Thread worker = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        doChunkOfWork();
    }
    System.out.println("exiting cleanly");
});
worker.start();
worker.interrupt();   // requests stop; does NOT kill the thread

// stop(), suspend(), resume() are DEPRECATED and unsafe — never use them

// DAEMON threads — die with the JVM
Thread housekeeping = new Thread(this::flushMetrics);
housekeeping.setDaemon(true);   // must be before start()
housekeeping.start();

// UNCAUGHT EXCEPTIONS
t.setUncaughtExceptionHandler((thread, ex) ->
    log.error("thread {} died", thread.getName(), ex));`,
  },
  {
    id: 'executors',
    title: 'ExecutorService & Thread Pools',
    color: '#10B981',
    keyPoints: [
      'Decouples task submission from thread management — never hand-roll threads in app code',
      'Reuses threads: thread creation costs ~1MB stack plus OS scheduling overhead',
      'newFixedThreadPool(n) — bounded threads, UNBOUNDED queue (OOM risk under load)',
      'newCachedThreadPool() — unbounded threads (thread explosion risk), 60s idle reaping',
      'newSingleThreadExecutor() — serial execution, preserves submission order',
      'Always shut down: shutdown() drains gracefully, shutdownNow() interrupts running tasks',
      'For production, construct ThreadPoolExecutor directly with a bounded queue and a rejection policy',
    ],
    code: `// FACTORY METHODS — convenient, but know their trade-offs
ExecutorService fixed  = Executors.newFixedThreadPool(4);
ExecutorService cached = Executors.newCachedThreadPool();
ExecutorService single = Executors.newSingleThreadExecutor();
ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(2);

// SUBMIT WORK
fixed.execute(() -> System.out.println("fire and forget"));  // Runnable, no result
Future<String> f = fixed.submit(() -> "result");             // Callable, returns Future

// SHUTDOWN — the step everyone forgets
executor.shutdown();                                  // no new tasks; finish queued ones
if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
    executor.shutdownNow();                           // interrupt stragglers
}

// Try-with-resources (Java 19+) — ExecutorService is AutoCloseable
try (ExecutorService ex = Executors.newFixedThreadPool(4)) {
    ex.submit(task);
}   // close() shuts down and awaits termination

// PRODUCTION-GRADE POOL — explicit and bounded
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4,                                       // corePoolSize
    16,                                      // maximumPoolSize
    60L, TimeUnit.SECONDS,                   // keepAlive for non-core threads
    new ArrayBlockingQueue<>(1000),          // BOUNDED queue — backpressure
    new ThreadFactoryBuilder().setNameFormat("api-%d").build(),
    new ThreadPoolExecutor.CallerRunsPolicy() // rejection: throttle the caller
);

// How ThreadPoolExecutor grows:
// 1. threads < corePoolSize        → create a new thread
// 2. core full                     → queue the task
// 3. queue full                    → create threads up to maximumPoolSize
// 4. queue full AND max reached    → apply the RejectedExecutionHandler

// REJECTION POLICIES
// AbortPolicy         — throw RejectedExecutionException (default)
// CallerRunsPolicy    — run on the calling thread (natural backpressure)
// DiscardPolicy       — silently drop the task
// DiscardOldestPolicy — evict the oldest queued task, then retry

// SCHEDULING
scheduled.schedule(task, 5, TimeUnit.SECONDS);                    // once
scheduled.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS);      // fixed cadence
scheduled.scheduleWithFixedDelay(task, 0, 1, TimeUnit.SECONDS);   // gap after completion

// VIRTUAL THREADS (Java 21) — one thread per task becomes viable
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) ex.submit(this::blockingIoCall);
}`,
  },
  {
    id: 'callable-future',
    title: 'Callable & Future',
    color: '#F59E0B',
    keyPoints: [
      'Runnable returns void and cannot throw checked exceptions',
      'Callable<V> returns V and CAN throw checked exceptions',
      'submit() returns a Future — a handle to a result that may not exist yet',
      'future.get() BLOCKS until the task completes — this is the main limitation',
      'Always prefer get(timeout, unit) over get() to avoid indefinite hangs',
      'Task exceptions surface wrapped in ExecutionException; unwrap with getCause()',
      'invokeAll() blocks for all tasks; invokeAny() returns the first success and cancels the rest',
    ],
    code: `// RUNNABLE vs CALLABLE
Runnable r = () -> System.out.println("no result, no checked exceptions");

Callable<Integer> c = () -> {
    Thread.sleep(100);      // checked exception is fine here
    return 42;              // and it returns a value
};

// SUBMIT AND RETRIEVE
ExecutorService ex = Executors.newFixedThreadPool(4);
Future<Integer> future = ex.submit(c);

// Non-blocking check
if (future.isDone()) { /* ... */ }

// BLOCKING retrieval — always bound the wait
try {
    Integer result = future.get(2, TimeUnit.SECONDS);
} catch (TimeoutException e) {
    future.cancel(true);              // true = interrupt if already running
} catch (ExecutionException e) {
    Throwable cause = e.getCause();   // the ACTUAL exception from the task
    log.error("task failed", cause);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

// THE PROBLEM with Future — sequential blocking
Future<Integer> a = ex.submit(() -> slowCall(1));   // both start concurrently
Future<Integer> b = ex.submit(() -> slowCall(2));
int total = a.get() + b.get();   // but we block on a, THEN on b
// Cannot express "when both finish, combine them" without blocking

// INVOKE ALL — wait for every task
List<Callable<String>> tasks = List.of(
    () -> fetch("/users"),
    () -> fetch("/orders"),
    () -> fetch("/products")
);
List<Future<String>> results = ex.invokeAll(tasks);   // blocks until all done
for (Future<String> f : results) {
    System.out.println(f.get());   // guaranteed complete, will not block
}

// INVOKE ANY — first successful result wins, others are cancelled
String fastest = ex.invokeAny(List.of(
    () -> queryReplica("us-east"),
    () -> queryReplica("eu-west")
));

// COMPLETION SERVICE — process results as they arrive
CompletionService<String> cs = new ExecutorCompletionService<>(ex);
tasks.forEach(cs::submit);
for (int i = 0; i < tasks.size(); i++) {
    String next = cs.take().get();   // returns in COMPLETION order, not submission order
    process(next);
}`,
  },
  {
    id: 'completable-future',
    title: 'CompletableFuture',
    color: '#8B5CF6',
    keyPoints: [
      'Java 8 answer to Future\'s blocking problem — build async pipelines declaratively',
      'supplyAsync() for work that returns a value, runAsync() for fire-and-forget',
      'thenApply = sync transform, thenApplyAsync = transform on another pool thread',
      'thenCompose flattens a nested CompletableFuture (the async flatMap)',
      'thenCombine merges two independent futures when both complete',
      'Defaults to ForkJoinPool.commonPool() — pass your own Executor for blocking I/O',
      'exceptionally / handle / whenComplete for error recovery without blocking',
    ],
    code: `// CREATION
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetchUser(id));
CompletableFuture<Void>   run = CompletableFuture.runAsync(() -> audit(id));
CompletableFuture<String> done = CompletableFuture.completedFuture("immediate");

// Always pass an executor for blocking I/O — do not starve commonPool
Executor io = Executors.newFixedThreadPool(20);
CompletableFuture.supplyAsync(() -> httpGet(url), io);

// CHAINING — non-blocking transforms
CompletableFuture<Integer> pipeline = CompletableFuture
    .supplyAsync(() -> fetchUser(id))       // CompletableFuture<User>
    .thenApply(User::getName)               // sync transform → CF<String>
    .thenApply(String::length);             // → CF<Integer>

// thenApply vs thenCompose — the map/flatMap distinction
// thenApply with a CF-returning mapper gives you a NESTED future:
CompletableFuture<CompletableFuture<Order>> nested =
    userFuture.thenApply(u -> fetchOrderAsync(u));   // wrong shape

// thenCompose flattens it:
CompletableFuture<Order> flat =
    userFuture.thenCompose(u -> fetchOrderAsync(u)); // correct

// COMBINING two independent calls — truly parallel, no blocking
CompletableFuture<User>    userF  = CompletableFuture.supplyAsync(() -> fetchUser(id), io);
CompletableFuture<Account> acctF  = CompletableFuture.supplyAsync(() -> fetchAccount(id), io);

CompletableFuture<Profile> profile = userF.thenCombine(acctF, Profile::new);

// WAIT FOR MANY
CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2, f3);
List<String> results = all.thenApply(v ->
    Stream.of(f1, f2, f3).map(CompletableFuture::join).toList()
).join();

CompletableFuture<Object> firstDone = CompletableFuture.anyOf(f1, f2, f3);

// ERROR HANDLING
cf.exceptionally(ex -> "fallback value")            // recover, same type
  .handle((result, ex) -> ex != null ? "failed" : result)  // see both outcomes
  .whenComplete((result, ex) -> log.info("finished")); // observe, do not alter

// TIMEOUTS (Java 9+)
cf.orTimeout(2, TimeUnit.SECONDS)                        // fail with TimeoutException
  .completeOnTimeout("default", 2, TimeUnit.SECONDS);    // substitute a value instead

// join() vs get(): join() throws unchecked CompletionException — nicer in streams`,
  },
  {
    id: 'safety',
    title: 'Thread Safety',
    color: '#EF4444',
    keyPoints: [
      'Race condition: correctness depends on thread timing (e.g. non-atomic count++)',
      'synchronized gives BOTH mutual exclusion and visibility (happens-before)',
      'volatile gives visibility ONLY — it does not make compound operations atomic',
      'count++ is three operations: read, increment, write — volatile cannot protect it',
      'AtomicInteger uses CAS (compare-and-swap) — lock-free and atomic',
      'ReentrantLock adds tryLock, timeouts, fairness and interruptible acquisition',
      'Deadlock prevention: acquire locks in a consistent global order, or use tryLock with timeout',
      'Best strategy: avoid shared mutable state entirely — prefer immutability and confinement',
    ],
    code: `// THE RACE CONDITION
class Counter {
    private int count = 0;
    public void increment() { count++; }   // NOT atomic: read, add, write
}
// 1000 threads incrementing 1000 times → final value is far below 1_000_000

// FIX 1: synchronized — mutual exclusion + visibility
class SyncCounter {
    private int count = 0;

    public synchronized void increment() { count++; }   // locks on "this"
    public synchronized int get() { return count; }
}

// Synchronized block — hold the lock for less time
private final Object lock = new Object();
public void update() {
    doExpensiveUnsharedWork();     // outside the lock
    synchronized (lock) {
        sharedState++;             // only the critical section is locked
    }
}

// FIX 2: volatile — VISIBILITY only, no atomicity
class Flag {
    private volatile boolean running = true;   // correct use: a simple flag

    public void stop() { running = false; }    // other threads see it immediately
    public void loop() { while (running) work(); }
}

private volatile int counter = 0;
public void bad() { counter++; }   // STILL BROKEN — volatile ≠ atomic

// FIX 3: Atomics — lock-free CAS
AtomicInteger atomic = new AtomicInteger();
atomic.incrementAndGet();                       // atomic read-modify-write
atomic.compareAndSet(5, 10);                    // CAS
atomic.updateAndGet(v -> v * 2);
LongAdder highContention = new LongAdder();     // better than AtomicLong under heavy write contention

// FIX 4: ReentrantLock — when synchronized is not enough
private final ReentrantLock lock = new ReentrantLock();

if (lock.tryLock(1, TimeUnit.SECONDS)) {        // give up instead of blocking forever
    try {
        mutate();
    } finally {
        lock.unlock();                          // ALWAYS in finally
    }
}

// DEADLOCK — two threads, opposite lock order
// Thread A: synchronized(lockX) { synchronized(lockY) { } }
// Thread B: synchronized(lockY) { synchronized(lockX) { } }   ← deadlock
// Fix: every thread acquires lockX before lockY, always.

// wait/notify — must hold the monitor
synchronized (queue) {
    while (queue.isEmpty()) {       // while, NOT if — guards spurious wakeups
        queue.wait();
    }
    process(queue.poll());
    queue.notifyAll();
}
// Prefer BlockingQueue — it does all of this correctly for you

// CONCURRENT COLLECTIONS
Map<String, Integer> map = new ConcurrentHashMap<>();
map.compute("k", (k, v) -> v == null ? 1 : v + 1);   // atomic per key
BlockingQueue<Task> q = new LinkedBlockingQueue<>(1000);
List<String> snapshot = new CopyOnWriteArrayList<>();  // read-heavy only`,
  },
];

const threadStates = [
  {
    state: 'NEW',
    color: '#64748B',
    trigger: 'new Thread(task)',
    meaning: 'The Thread object exists but start() has not been called. No OS thread allocated yet.',
    exits: 'start() → RUNNABLE',
  },
  {
    state: 'RUNNABLE',
    color: '#10B981',
    trigger: 'thread.start()',
    meaning: 'Eligible to run. Note the JVM does not separate "ready" from "actually executing on a core" — both report RUNNABLE.',
    exits: 'lock contention → BLOCKED · wait()/join() → WAITING · sleep(n) → TIMED_WAITING · run() returns → TERMINATED',
  },
  {
    state: 'BLOCKED',
    color: '#EF4444',
    trigger: 'entering a synchronized block held by another thread',
    meaning: 'Waiting to acquire a monitor lock. Purely about intrinsic locks — nothing else puts a thread here.',
    exits: 'lock acquired → RUNNABLE',
  },
  {
    state: 'WAITING',
    color: '#F59E0B',
    trigger: 'wait() · join() · LockSupport.park()',
    meaning: 'Waiting indefinitely for another thread to act. No timeout — it waits until explicitly signalled.',
    exits: 'notify()/notifyAll() · target thread finishes · unpark() → RUNNABLE or BLOCKED',
  },
  {
    state: 'TIMED_WAITING',
    color: '#8B5CF6',
    trigger: 'sleep(n) · wait(n) · join(n) · tryLock(n)',
    meaning: 'Same as WAITING but with a deadline. Returns on its own once the timeout elapses.',
    exits: 'timeout elapses · signalled early → RUNNABLE',
  },
  {
    state: 'TERMINATED',
    color: '#475569',
    trigger: 'run() completes or throws',
    meaning: 'Execution finished. This is final — calling start() again throws IllegalThreadStateException.',
    exits: 'none — terminal state',
  },
];

const runnableVsCallable = [
  { feature: 'Introduced', runnable: 'Java 1.0', callable: 'Java 5' },
  { feature: 'Method', runnable: 'run()', callable: 'call()' },
  { feature: 'Return value', runnable: 'void — none', callable: 'V — a typed result' },
  { feature: 'Checked exceptions', runnable: 'Cannot throw', callable: 'Can throw' },
  { feature: 'Submit via', runnable: 'execute() or submit()', callable: 'submit() only' },
  { feature: 'Result handle', runnable: 'Future<?> resolving to null', callable: 'Future<V> with the value' },
];

const syncComparison = [
  { aspect: 'Atomicity', sync: 'Yes', volatileCol: 'No', atomic: 'Yes (single op)' },
  { aspect: 'Visibility', sync: 'Yes', volatileCol: 'Yes', atomic: 'Yes' },
  { aspect: 'Blocking', sync: 'Yes — threads park', volatileCol: 'No', atomic: 'No — CAS retry loop' },
  { aspect: 'Compound ops (i++)', sync: 'Safe', volatileCol: 'BROKEN', atomic: 'Safe' },
  { aspect: 'Cost', sync: 'Highest', volatileCol: 'Lowest', atomic: 'Low, rises with contention' },
  { aspect: 'Use for', sync: 'Multi-step critical sections', volatileCol: 'Simple flags', atomic: 'Counters, accumulators' },
];

const interviewQuestions = [
  {
    q: 'What is the difference between start() and run()?',
    a: 'start() creates a new OS thread and invokes run() on it, so the work happens concurrently. Calling run() directly is an ordinary method call — the code executes on the current thread with no concurrency at all. This is the single most common threading mistake. Also, start() can only be called once per Thread object; a second call throws IllegalThreadStateException.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Runnable vs Callable — when would you use each?',
    a: 'Runnable returns void and cannot throw checked exceptions, so it suits fire-and-forget work. Callable<V> returns a typed value and can throw checked exceptions, so it suits work whose result or failure you need to observe via a Future. Prefer Callable whenever the task computes something you care about.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Why is volatile not enough for a counter?',
    a: 'volatile guarantees visibility — every thread reads the latest value — but not atomicity. count++ compiles to three separate steps: read, increment, write. Two threads can both read 5, both write 6, and one increment is lost. You need synchronized, AtomicInteger, or LongAdder to make the whole read-modify-write indivisible.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What is the difference between BLOCKED and WAITING?',
    a: 'BLOCKED means the thread is trying to enter a synchronized region whose monitor lock another thread holds — it is purely about intrinsic locks. WAITING means the thread voluntarily suspended itself via wait(), join(), or LockSupport.park() and will stay suspended until another thread signals it. BLOCKED resolves automatically when the lock frees; WAITING requires an explicit notify, target-thread completion, or unpark.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What problem does CompletableFuture solve that Future does not?',
    a: 'Future only offers blocking retrieval via get(), so you cannot express "when this finishes, do that" without a thread sitting idle. CompletableFuture adds non-blocking composition: thenApply to transform, thenCompose to chain dependent async calls, thenCombine to merge independent ones, allOf to fan in, plus exceptionally and handle for recovery. You describe the dependency graph and nothing blocks until you actually need the value.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'thenApply vs thenCompose — what is the difference?',
    a: 'They are map and flatMap. thenApply takes a function returning a plain value, so if your mapper itself returns a CompletableFuture you end up with CompletableFuture<CompletableFuture<T>>. thenCompose takes a function that returns a CompletableFuture and flattens the result to a single CompletableFuture<T>. Use thenCompose whenever the next step is itself asynchronous.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why is newFixedThreadPool risky in production?',
    a: 'It is backed by an unbounded LinkedBlockingQueue. If tasks arrive faster than the fixed threads can drain them, the queue grows without limit until the heap is exhausted — an OutOfMemoryError with no backpressure signal beforehand. Construct ThreadPoolExecutor directly with a bounded queue and an explicit rejection policy (CallerRunsPolicy gives natural throttling) so overload surfaces as rejected tasks rather than a dead JVM.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'How do you prevent deadlock?',
    a: 'The reliable fix is lock ordering: define a global order and have every thread acquire locks in that order, which makes a cycle impossible. Beyond that — use tryLock with a timeout so a thread can back off and retry, hold locks for the shortest possible span, avoid calling unknown code while holding a lock, and prefer higher-level constructs like BlockingQueue or ConcurrentHashMap that handle the locking internally. The best defence is not sharing mutable state in the first place.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'What does thread interruption actually do?',
    a: 'It sets a boolean flag on the target thread — nothing more. It does not stop or kill anything. Cooperative code checks Thread.currentThread().isInterrupted() and returns early. Methods like sleep, wait, and join throw InterruptedException and, importantly, clear the flag when they do — so a catch block should either propagate the exception or call Thread.currentThread().interrupt() to restore it. Swallowing InterruptedException silently is a common bug that makes threads unstoppable.',
    difficulty: 'Advanced' as const,
  },
];

export default function MultithreadingPage() {
  const [activeConcept, setActiveConcept] = useState('lifecycle');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [activeState, setActiveState] = useState(1);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — Concurrency"
        title="Multi"
        titleHighlight="threading"
        description="Thread lifecycle, ExecutorService, Callable/Future and CompletableFuture — plus the thread-safety rules that decide whether concurrent code is correct or quietly broken."
        icon={Cpu}
        iconColor="#10B981"
        gradient="from-emerald-500 via-teal-500 to-cyan-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Thread State Machine */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Thread State Machine</h3>
            <p className="text-sm text-slate-400 mb-6">
              The six values of <code className="font-mono text-emerald-400">Thread.State</code> — click one to see what moves a thread in and out of it
            </p>

            {/* State pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {threadStates.map((s, idx) => (
                <button
                  key={s.state}
                  onClick={() => setActiveState(idx)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                  style={
                    activeState === idx
                      ? { borderColor: `${s.color}60`, backgroundColor: `${s.color}18`, color: s.color }
                      : { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: '#94a3b8' }
                  }
                >
                  {s.state}
                </button>
              ))}
            </div>

            {/* Active state detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeState}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: `${threadStates[activeState].color}25`,
                  backgroundColor: `${threadStates[activeState].color}08`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: threadStates[activeState].color }} />
                  <code className="text-sm font-mono font-semibold" style={{ color: threadStates[activeState].color }}>
                    {threadStates[activeState].state}
                  </code>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {threadStates[activeState].meaning}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Entered by</p>
                    <code className="text-xs font-mono text-slate-300">{threadStates[activeState].trigger}</code>
                  </div>
                  <div className="p-2.5 rounded bg-black/20 border border-white/[0.05]">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Exits to</p>
                    <code className="text-xs font-mono text-slate-300">{threadStates[activeState].exits}</code>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </AnimatedSection>

        {/* Topic Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
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
                    layoutId="activeThread"
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
                <h2 className="text-lg font-semibold text-white mb-4">{currentConcept.title}</h2>
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

              <CodeBlock
                code={currentConcept.code}
                title={`${activeConcept}.java`}
                showLineNumbers
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* synchronized vs volatile vs Atomic */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              <code className="font-mono text-red-400">synchronized</code> vs{' '}
              <code className="font-mono text-yellow-400">volatile</code> vs{' '}
              <code className="font-mono text-emerald-400">Atomic</code>
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              The row that trips people up is <span className="text-slate-300">compound operations</span> — volatile does not help there
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Aspect</th>
                    <th className="text-left py-3 px-3 text-red-400 font-medium font-mono">synchronized</th>
                    <th className="text-left py-3 px-3 text-yellow-400 font-medium font-mono">volatile</th>
                    <th className="text-left py-3 px-3 text-emerald-400 font-medium font-mono">Atomic*</th>
                  </tr>
                </thead>
                <tbody>
                  {syncComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.aspect}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.sync}</td>
                      <td className={`py-2.5 px-3 text-xs ${row.volatileCol === 'BROKEN' ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                        {row.volatileCol}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.atomic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Runnable vs Callable */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              <code className="font-mono text-blue-400">Runnable</code> vs{' '}
              <code className="font-mono text-orange-400">Callable&lt;V&gt;</code>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Feature</th>
                    <th className="text-left py-3 px-3 text-blue-400 font-medium font-mono">Runnable</th>
                    <th className="text-left py-3 px-3 text-orange-400 font-medium font-mono">Callable&lt;V&gt;</th>
                  </tr>
                </thead>
                <tbody>
                  {runnableVsCallable.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.feature}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.runnable}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.callable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="green">Multithreading</Badge>
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
