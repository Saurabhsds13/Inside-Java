'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, Zap, Waves, PackageOpen, Link2, FunctionSquare } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const features = [
  {
    id: 'lambdas',
    title: 'Lambdas',
    icon: Zap,
    color: '#3B82F6',
    tagline: 'Anonymous functions',
  },
  {
    id: 'functional-interfaces',
    title: 'Functional Interfaces',
    icon: FunctionSquare,
    color: '#10B981',
    tagline: 'Single abstract method',
  },
  {
    id: 'streams',
    title: 'Streams',
    icon: Waves,
    color: '#F59E0B',
    tagline: 'Declarative data pipelines',
  },
  {
    id: 'optional',
    title: 'Optional',
    icon: PackageOpen,
    color: '#8B5CF6',
    tagline: 'Null-safety container',
  },
  {
    id: 'method-references',
    title: 'Method References',
    icon: Link2,
    color: '#EC4899',
    tagline: 'Shorthand for lambdas',
  },
];

const concepts = [
  {
    id: 'lambdas',
    title: 'Lambda Expressions',
    color: '#3B82F6',
    keyPoints: [
      'Anonymous function — no name, no modifiers, no return type declaration',
      'Syntax: (params) -> expression  or  (params) -> { statements; }',
      'Can only be assigned to a functional interface type',
      'Captures effectively-final local variables (no reassignment allowed)',
      '"this" inside a lambda refers to the ENCLOSING class, not the lambda',
      'Compiled to invokedynamic — NOT an anonymous inner class (no extra .class file)',
      'Type inference: parameter types usually omitted, compiler infers them',
    ],
    code: `// BEFORE Java 8 — anonymous inner class
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Running");
    }
};

// AFTER — lambda expression
Runnable r = () -> System.out.println("Running");

// Syntax variations
() -> 42                            // no params, expression body
x -> x * 2                          // single param (parens optional)
(x, y) -> x + y                     // multiple params
(int x, int y) -> x + y             // explicit types
(x) -> { return x * 2; }            // block body needs return

// Comparator — the classic use case
List<String> names = new ArrayList<>(List.of("Charlie", "Alice", "Bob"));

names.sort((a, b) -> a.compareTo(b));                  // natural
names.sort((a, b) -> b.compareTo(a));                  // reverse
names.sort(Comparator.comparing(String::length));      // by length
names.sort(Comparator.comparing(String::length)
                     .thenComparing(Comparator.naturalOrder())); // chained

// VARIABLE CAPTURE — must be effectively final
int multiplier = 3;                 // effectively final
Function<Integer, Integer> triple = x -> x * multiplier;  // OK
// multiplier = 4;                  // COMPILE ERROR — breaks capture

// "this" semantics differ from anonymous classes
public class Demo {
    private String name = "Demo";

    void anonymous() {
        Runnable r = new Runnable() {
            public void run() {
                // "this" = the anonymous Runnable instance
                System.out.println(this.getClass()); // Demo$1
            }
        };
    }

    void lambda() {
        Runnable r = () -> {
            // "this" = the enclosing Demo instance
            System.out.println(this.name); // "Demo"
        };
    }
}`,
  },
  {
    id: 'functional-interfaces',
    title: 'Functional Interfaces',
    color: '#10B981',
    keyPoints: [
      'Interface with exactly ONE abstract method (SAM — Single Abstract Method)',
      '@FunctionalInterface annotation enforces this at compile time (optional but recommended)',
      'Can have any number of default and static methods',
      'Methods inherited from Object (equals, hashCode, toString) do not count',
      'Built-in set lives in java.util.function',
      'Primitive specializations (IntPredicate, LongFunction) avoid boxing overhead',
    ],
    code: `// Custom functional interface
@FunctionalInterface
public interface Validator<T> {
    boolean validate(T input);           // the single abstract method

    // Default methods are allowed
    default Validator<T> and(Validator<T> other) {
        return input -> this.validate(input) && other.validate(input);
    }

    // Static methods are allowed
    static <T> Validator<T> alwaysTrue() {
        return input -> true;
    }
}

Validator<String> notEmpty = s -> s != null && !s.isBlank();
Validator<String> maxLen   = s -> s.length() <= 20;
Validator<String> combined = notEmpty.and(maxLen);
combined.validate("hello"); // true

// THE BIG FOUR from java.util.function
Predicate<String>          isEmpty  = String::isEmpty;        // T -> boolean
Function<String, Integer>  length   = String::length;         // T -> R
Consumer<String>           printer  = System.out::println;    // T -> void
Supplier<LocalDate>        today    = LocalDate::now;         // () -> T

// Others you will actually use
BiFunction<Integer, Integer, Integer> add    = (a, b) -> a + b;   // (T,U) -> R
UnaryOperator<String>                 upper  = String::toUpperCase; // T -> T
BinaryOperator<Integer>               max    = Integer::max;        // (T,T) -> T
BiConsumer<String, Integer>           logKV  = (k, v) -> System.out.println(k + "=" + v);

// Composition
Function<Integer, Integer> doubled = x -> x * 2;
Function<Integer, Integer> squared = x -> x * x;
doubled.andThen(squared).apply(3);  // (3*2)^2 = 36
doubled.compose(squared).apply(3);  // (3^2)*2 = 18

Predicate<String> valid = notEmptyPredicate.and(shortEnough).negate();

// PRIMITIVE SPECIALIZATIONS — avoid autoboxing
IntPredicate      isEven  = n -> n % 2 == 0;      // no Integer boxing
IntFunction<String> toStr  = n -> "n=" + n;
ToIntFunction<String> len  = String::length;
IntSupplier       roll     = () -> new Random().nextInt(6) + 1;`,
  },
  {
    id: 'streams',
    title: 'Stream API',
    color: '#F59E0B',
    keyPoints: [
      'A pipeline over a data source — NOT a data structure, stores nothing',
      'Three parts: source → intermediate operations → terminal operation',
      'Intermediate ops are LAZY — nothing runs until a terminal op is called',
      'Streams are single-use — reusing a consumed stream throws IllegalStateException',
      'Short-circuiting ops (findFirst, anyMatch, limit) can stop early',
      'parallelStream() uses the common ForkJoinPool — only helps for large CPU-bound work',
      'Never mutate external state inside a stream (breaks under parallelism)',
    ],
    code: `List<Employee> staff = List.of(
    new Employee("Alice", "ENG", 120_000),
    new Employee("Bob",   "ENG",  95_000),
    new Employee("Cara",  "SALES", 80_000),
    new Employee("Dan",   "SALES", 85_000)
);

// FILTER → MAP → COLLECT (the bread and butter)
List<String> engineerNames = staff.stream()
    .filter(e -> e.getDept().equals("ENG"))
    .map(Employee::getName)
    .collect(Collectors.toList());          // [Alice, Bob]

// Java 16+ shorthand for an unmodifiable list
List<String> names = staff.stream().map(Employee::getName).toList();

// LAZINESS — nothing prints until collect() runs
Stream<String> lazy = staff.stream()
    .map(e -> { System.out.println("mapping " + e); return e.getName(); });
// (no output yet)
lazy.toList();  // NOW the mapping runs

// REDUCTION
double payroll = staff.stream().mapToDouble(Employee::getSalary).sum();
Optional<Employee> top = staff.stream().max(Comparator.comparingDouble(Employee::getSalary));
long engCount = staff.stream().filter(e -> e.getDept().equals("ENG")).count();

// GROUPING — the most useful Collector
Map<String, List<Employee>> byDept = staff.stream()
    .collect(Collectors.groupingBy(Employee::getDept));

Map<String, Long> countByDept = staff.stream()
    .collect(Collectors.groupingBy(Employee::getDept, Collectors.counting()));

Map<String, Double> avgByDept = staff.stream()
    .collect(Collectors.groupingBy(Employee::getDept,
             Collectors.averagingDouble(Employee::getSalary)));

// PARTITIONING — groupingBy with a boolean key
Map<Boolean, List<Employee>> split = staff.stream()
    .collect(Collectors.partitioningBy(e -> e.getSalary() > 90_000));

// FLATMAP — flatten nested structures
List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3, 4));
List<Integer> flat = nested.stream()
    .flatMap(List::stream)
    .toList();                              // [1, 2, 3, 4]

// SHORT-CIRCUITING — stops as soon as it can
boolean anyRich = staff.stream().anyMatch(e -> e.getSalary() > 100_000);  // true, stops at Alice
Optional<Employee> first = staff.stream().filter(e -> e.getSalary() < 90_000).findFirst();

// STATEFUL ops — need to see elements before emitting
staff.stream().sorted(Comparator.comparing(Employee::getName)).toList();
staff.stream().distinct().toList();   // relies on equals/hashCode
staff.stream().skip(1).limit(2).toList();

// ANTI-PATTERN — do not do this
List<String> bad = new ArrayList<>();
staff.parallelStream().forEach(e -> bad.add(e.getName())); // RACE CONDITION
// Use .collect() instead — it handles merging safely`,
  },
  {
    id: 'optional',
    title: 'Optional',
    color: '#8B5CF6',
    keyPoints: [
      'A container that may or may not hold a non-null value',
      'Designed as a RETURN type — signals "this might legitimately be absent"',
      'Do NOT use for fields, method parameters, or in collections',
      'Optional itself can be null — never return null from an Optional-returning method',
      'get() throws NoSuchElementException — prefer orElse/orElseThrow/ifPresent',
      'orElse() always evaluates its argument; orElseGet() is lazy',
      'Not Serializable — avoid in DTOs and entity classes',
    ],
    code: `// CREATION
Optional<String> present = Optional.of("value");        // NPE if null
Optional<String> maybe   = Optional.ofNullable(getName()); // null-safe
Optional<String> empty   = Optional.empty();

// THE PROBLEM Optional solves
// Before: nested null checks
String city = null;
if (user != null) {
    Address addr = user.getAddress();
    if (addr != null) {
        city = addr.getCity();
    }
}

// After: a readable chain
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");

// CONSUMING — pick the right one
opt.orElse("default");                    // eager fallback
opt.orElseGet(() -> expensiveDefault());  // lazy fallback
opt.orElseThrow();                        // NoSuchElementException (Java 10+)
opt.orElseThrow(() -> new UserNotFoundException(id));  // custom

opt.ifPresent(v -> System.out.println(v));
opt.ifPresentOrElse(
    v  -> System.out.println("found " + v),
    () -> System.out.println("nothing")   // Java 9+
);

// orElse vs orElseGet — subtle but important
Optional<String> hasValue = Optional.of("x");
hasValue.orElse(buildDefault());      // buildDefault() STILL RUNS (wasted work)
hasValue.orElseGet(this::buildDefault); // buildDefault() is NOT called

// FILTERING and CHAINING
Optional<User> adult = Optional.ofNullable(user)
    .filter(u -> u.getAge() >= 18);

// flatMap when the mapper itself returns Optional
Optional<String> email = findUser(id)          // Optional<User>
    .flatMap(User::findEmail);                 // User::findEmail returns Optional<String>
    // .map() here would give Optional<Optional<String>>

// STREAM INTEROP (Java 9+)
List<User> found = ids.stream()
    .map(this::findUser)      // Stream<Optional<User>>
    .flatMap(Optional::stream) // drops the empties
    .toList();

// GOOD: Optional as a return type
public Optional<User> findById(String id) { ... }

// BAD: Optional as a field or parameter
class User {
    private Optional<String> email;              // don't — use null or empty String
}
void process(Optional<String> maybe) { }         // don't — overload instead`,
  },
  {
    id: 'method-references',
    title: 'Method References',
    color: '#EC4899',
    keyPoints: [
      'Shorthand for a lambda that does nothing but call one existing method',
      'Four kinds: static, bound instance, unbound instance, constructor',
      'Syntax: ClassName::staticMethod, instance::method, ClassName::instanceMethod, ClassName::new',
      'Unbound form (String::length) treats the receiver as the first parameter',
      'Cannot be used when you need to pass extra literal arguments',
      'Compiler resolves overloads by the target functional interface signature',
    ],
    code: `// 1. STATIC method reference — ClassName::staticMethod
Function<String, Integer> parse = Integer::parseInt;
// equivalent to: s -> Integer.parseInt(s)

List<Integer> nums = strings.stream().map(Integer::parseInt).toList();

// 2. BOUND instance reference — specificObject::method
String prefix = "LOG: ";
Function<String, String> tag = prefix::concat;
// equivalent to: s -> prefix.concat(s)

PrintStream out = System.out;
Consumer<String> printer = out::println;   // receiver is fixed

// 3. UNBOUND instance reference — ClassName::instanceMethod
Function<String, Integer> len = String::length;
// equivalent to: s -> s.length()
// The stream element BECOMES the receiver

names.stream().map(String::toUpperCase).toList();
names.sort(String::compareToIgnoreCase);   // (a, b) -> a.compareToIgnoreCase(b)

// 4. CONSTRUCTOR reference — ClassName::new
Supplier<ArrayList<String>> newList = ArrayList::new;
Function<String, User>      newUser = User::new;        // one-arg constructor
BiFunction<String, Integer, User> newUser2 = User::new; // two-arg constructor

List<User> users = names.stream().map(User::new).toList();

// Array constructor reference
IntFunction<String[]> arrayMaker = String[]::new;
String[] arr = names.stream().toArray(String[]::new);

// WHEN YOU CANNOT use a method reference
// Extra arguments or any logic beyond a single call → stay with a lambda
list.stream().map(s -> s.substring(0, 3)).toList();      // literal args → lambda
list.stream().map(s -> s.trim().toLowerCase()).toList(); // two calls → lambda
list.stream().filter(s -> s.length() > 5).toList();      // comparison → lambda

// Readability comparison
staff.stream().map(e -> e.getName()).toList();  // lambda
staff.stream().map(Employee::getName).toList(); // method ref — prefer this`,
  },
];

const pipelineStages = [
  {
    stage: 'Source',
    code: 'staff.stream()',
    output: '[Alice/120k, Bob/95k, Cara/80k, Dan/85k]',
    note: 'Creates the stream. Nothing is consumed yet.',
    color: '#3B82F6',
    lazy: false,
  },
  {
    stage: 'filter',
    code: '.filter(e -> e.salary() > 84_000)',
    output: '[Alice/120k, Bob/95k, Dan/85k]',
    output2: 'Cara dropped (80k)',
    note: 'Intermediate + LAZY. Returns a new stream, runs nothing.',
    color: '#F59E0B',
    lazy: true,
  },
  {
    stage: 'map',
    code: '.map(Employee::getName)',
    output: '[Alice, Bob, Dan]',
    note: 'Intermediate + LAZY. Transforms each element 1:1.',
    color: '#F59E0B',
    lazy: true,
  },
  {
    stage: 'sorted',
    code: '.sorted()',
    output: '[Alice, Bob, Dan]',
    output2: 'STATEFUL — must buffer all elements',
    note: 'Intermediate but stateful. Cannot emit until it has seen everything.',
    color: '#EC4899',
    lazy: true,
  },
  {
    stage: 'toList',
    code: '.toList()',
    output: 'List<String> [Alice, Bob, Dan]',
    note: 'TERMINAL. This is what actually triggers the whole pipeline.',
    color: '#10B981',
    lazy: false,
  },
];

const functionalInterfaces = [
  { name: 'Predicate<T>', method: 'test(T)', signature: 'T → boolean', useCase: 'filter(), conditions' },
  { name: 'Function<T,R>', method: 'apply(T)', signature: 'T → R', useCase: 'map(), transformations' },
  { name: 'Consumer<T>', method: 'accept(T)', signature: 'T → void', useCase: 'forEach(), side effects' },
  { name: 'Supplier<T>', method: 'get()', signature: '() → T', useCase: 'lazy values, factories' },
  { name: 'UnaryOperator<T>', method: 'apply(T)', signature: 'T → T', useCase: 'replaceAll(), same-type map' },
  { name: 'BiFunction<T,U,R>', method: 'apply(T,U)', signature: '(T,U) → R', useCase: 'merge(), two-arg transform' },
  { name: 'BinaryOperator<T>', method: 'apply(T,T)', signature: '(T,T) → T', useCase: 'reduce(), accumulation' },
  { name: 'BiConsumer<T,U>', method: 'accept(T,U)', signature: '(T,U) → void', useCase: 'Map.forEach()' },
];

const opTypes = [
  { label: 'Intermediate — Stateless', ops: 'filter, map, flatMap, peek, mapToInt', note: 'Processes one element at a time, no memory of previous elements', color: '#F59E0B' },
  { label: 'Intermediate — Stateful', ops: 'sorted, distinct, limit, skip', note: 'Must buffer or track elements — can hurt parallel performance', color: '#EC4899' },
  { label: 'Terminal — Reducing', ops: 'collect, reduce, sum, count, min, max', note: 'Consumes the entire stream to produce one result', color: '#10B981' },
  { label: 'Terminal — Short-circuiting', ops: 'findFirst, findAny, anyMatch, allMatch, noneMatch', note: 'Can stop early without processing every element', color: '#3B82F6' },
];

const interviewQuestions = [
  {
    q: 'What is a functional interface?',
    a: 'An interface with exactly one abstract method (SAM). It can have any number of default and static methods. Methods inherited from Object (equals, hashCode, toString) do not count toward the limit. The @FunctionalInterface annotation makes the compiler enforce the rule. Lambdas and method references can only be assigned to functional interface types.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Are Java 8 streams lazy? What does that mean in practice?',
    a: 'Intermediate operations (filter, map, sorted) are lazy — they build up a pipeline description but execute nothing. Only a terminal operation (collect, forEach, reduce, count) triggers execution. In practice this enables fusion: filter and map run in a single pass over the data, and short-circuiting ops like findFirst can stop before touching every element.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What is the difference between orElse() and orElseGet()?',
    a: 'orElse(T) takes a value, so its argument is always evaluated — even when the Optional has a value. orElseGet(Supplier) takes a supplier that is only invoked when the Optional is empty. If the fallback is expensive (a DB call, an object construction), orElse() silently wastes that work. Prefer orElseGet() for anything non-trivial.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Can you reuse a stream?',
    a: 'No. A stream can be consumed only once. Calling a second terminal operation on the same stream throws IllegalStateException: "stream has already been operated upon or closed". If you need to traverse the data twice, either collect it to a List first, or create a fresh stream from the source via a Supplier<Stream<T>>.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'How are lambdas compiled? Are they just anonymous inner classes?',
    a: 'No. An anonymous inner class generates a separate .class file (Outer$1) and a new object per instantiation. A lambda compiles to a private synthetic method plus an invokedynamic instruction. At first execution, LambdaMetafactory spins up the implementing class at runtime. Stateless lambdas are also cached and reused rather than reallocated, so they are lighter on both class count and allocation.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'What does "this" refer to inside a lambda?',
    a: 'The enclosing instance — the class where the lambda is written. This differs from an anonymous inner class, where "this" refers to the anonymous instance itself. Lambdas do not introduce a new scope for this, super, or local variable shadowing; they are lexically scoped like the surrounding block.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why must variables captured by a lambda be effectively final?',
    a: 'Captured locals are copied into the lambda, because a local variable lives on the stack and may be gone by the time the lambda runs. If reassignment were allowed, the lambda and the enclosing method would see diverging values. Requiring effective finality removes that ambiguity and keeps lambdas safe to hand off across threads. Instance and static fields are not captured this way — they are read through the object reference, so they can change freely.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'When does parallelStream() actually help?',
    a: 'Only when you have a large dataset, CPU-bound work per element, and a splittable source (ArrayList, arrays, IntStream.range — not LinkedList or an iterator). It uses the shared ForkJoinPool.commonPool, so blocking I/O inside a parallel stream starves every other parallel task in the JVM. For small collections or I/O-bound work, sequential is usually faster. Always measure before reaching for it.',
    difficulty: 'Advanced' as const,
  },
];

export default function Java8Page() {
  const [activeConcept, setActiveConcept] = useState('lambdas');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [pipelineStep, setPipelineStep] = useState(0);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — Modern Java"
        title="Java 8"
        titleHighlight="Features"
        description="Lambdas, Streams, Optional, Functional Interfaces and Method References — the release that changed how Java is written. Expected knowledge at every product company."
        icon={Sparkles}
        iconColor="#06B6D4"
        gradient="from-cyan-500 via-blue-500 to-purple-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stream Pipeline Visualizer */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Stream Pipeline Walkthrough</h3>
            <p className="text-sm text-slate-400 mb-6">
              Click each stage to trace what happens — and notice nothing actually runs until the terminal operation
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stage list */}
              <div className="space-y-2">
                {pipelineStages.map((stage, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPipelineStep(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      pipelineStep === idx
                        ? 'bg-white/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                    style={pipelineStep === idx ? { borderColor: `${stage.color}50` } : undefined}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: stage.color }}>
                        {stage.stage}
                      </span>
                      {stage.lazy && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                          LAZY
                        </span>
                      )}
                    </div>
                    <code className="text-xs font-mono text-slate-300">{stage.code}</code>
                  </button>
                ))}
              </div>

              {/* Stage detail */}
              <div className="lg:sticky lg:top-24 h-fit">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pipelineStep}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: `${pipelineStages[pipelineStep].color}25`,
                      backgroundColor: `${pipelineStages[pipelineStep].color}08`,
                    }}
                  >
                    <h4
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: pipelineStages[pipelineStep].color }}
                    >
                      Stream contents after {pipelineStages[pipelineStep].stage}
                    </h4>
                    <code className="block text-xs font-mono text-slate-200 p-2.5 rounded bg-black/30 mb-3 break-all">
                      {pipelineStages[pipelineStep].output}
                    </code>
                    {pipelineStages[pipelineStep].output2 && (
                      <p className="text-xs text-slate-500 mb-3">
                        → {pipelineStages[pipelineStep].output2}
                      </p>
                    )}
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {pipelineStages[pipelineStep].note}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Feature Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveConcept(feature.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activeConcept === feature.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <feature.icon className="w-5 h-5 mb-2" style={{ color: feature.color }} />
                <div className="text-sm font-medium text-white">{feature.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{feature.tagline}</div>
                {activeConcept === feature.id && (
                  <motion.div
                    layoutId="activeJava8"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${feature.color}50` }}
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

        {/* Built-in Functional Interfaces */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Built-in Functional Interfaces</h3>
            <p className="text-sm text-slate-400 mb-6">
              From <code className="font-mono text-cyan-400">java.util.function</code> — memorise these four rows and most stream code reads itself
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Interface</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Method</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Shape</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Typical use</th>
                  </tr>
                </thead>
                <tbody>
                  {functionalInterfaces.map((fi, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3">
                        <code className="text-xs font-mono text-cyan-400">{fi.name}</code>
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="text-xs font-mono text-slate-400">{fi.method}</code>
                      </td>
                      <td className="py-2.5 px-3">
                        <code className="text-xs font-mono text-purple-400">{fi.signature}</code>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{fi.useCase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Operation Types */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Stream Operation Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opTypes.map((op, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${op.color}25`, backgroundColor: `${op.color}08` }}
                >
                  <h4 className="text-sm font-medium mb-2" style={{ color: op.color }}>
                    {op.label}
                  </h4>
                  <code className="block text-xs font-mono text-slate-300 mb-2">{op.ops}</code>
                  <p className="text-xs text-slate-500 leading-relaxed">{op.note}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="cyan">Java 8</Badge>
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
