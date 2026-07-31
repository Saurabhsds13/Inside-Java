'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ChevronDown, ChevronUp, Shapes, Shrink, HelpCircle, Brackets } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const categories = [
  {
    id: 'basics',
    title: 'Generic Basics',
    icon: Shapes,
    color: '#3B82F6',
    tagline: 'Type-safe code without casts',
  },
  {
    id: 'bounded',
    title: 'Bounded Types',
    icon: Brackets,
    color: '#10B981',
    tagline: 'Restricting type parameters',
  },
  {
    id: 'wildcards',
    title: 'Wildcards',
    icon: HelpCircle,
    color: '#F59E0B',
    tagline: '?, extends, super',
  },
  {
    id: 'erasure',
    title: 'Type Erasure',
    icon: Shrink,
    color: '#8B5CF6',
    tagline: 'What happens at compile time',
  },
];

const concepts = [
  {
    id: 'basics',
    title: 'Generic Basics',
    color: '#3B82F6',
    keyPoints: [
      'Generics add compile-time type safety — catch errors early, not at runtime',
      'Convention: T (Type), E (Element), K (Key), V (Value), N (Number)',
      'Generic classes: class Box<T> { T value; }',
      'Generic methods: <T> T getFirst(List<T> list)',
      'Eliminates explicit casting — compiler inserts casts automatically',
      'Raw types (using generics without <>) lose type safety — avoid them',
    ],
    code: `// WITHOUT Generics (pre-Java 5) — dangerous
List list = new ArrayList();
list.add("Hello");
list.add(123);  // No compile error!
String s = (String) list.get(1); // ClassCastException at RUNTIME!

// WITH Generics — compile-time safety
List<String> list = new ArrayList<>();
list.add("Hello");
// list.add(123);  // COMPILE ERROR! Cannot add Integer to List<String>
String s = list.get(0); // No cast needed

// Generic Class
public class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}
Pair<String, Integer> age = new Pair<>("Alice", 30);

// Generic Method — type parameter declared before return type
public static <T> T getFirst(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}
// Usage — compiler infers T
String first = getFirst(List.of("A", "B", "C"));
Integer num = getFirst(List.of(1, 2, 3));

// Generic Interface
public interface Repository<T, ID> {
    T findById(ID id);
    List<T> findAll();
    void save(T entity);
    void delete(ID id);
}`,
  },
  {
    id: 'bounded',
    title: 'Bounded Type Parameters',
    color: '#10B981',
    keyPoints: [
      'Upper bound: <T extends Number> — T must be Number or its subclass',
      'Multiple bounds: <T extends Comparable<T> & Serializable>',
      'Class bound must come first, then interfaces',
      'Bounded types let you call methods of the bound type on T',
      'Without bounds, T is treated as Object — very limited methods',
      'Bounded types are resolved at compile time for type safety',
    ],
    code: `// Upper Bounded Type — T must extend Number
public class MathBox<T extends Number> {
    private T value;

    public MathBox(T value) {
        this.value = value;
    }

    // Can call Number methods on T!
    public double sqrt() {
        return Math.sqrt(value.doubleValue());
    }

    public boolean isPositive() {
        return value.doubleValue() > 0;
    }
}

MathBox<Integer> intBox = new MathBox<>(25);
MathBox<Double> dblBox = new MathBox<>(3.14);
// MathBox<String> strBox = new MathBox<>("hi"); // COMPILE ERROR!

// Multiple bounds — class first, then interfaces
public <T extends Comparable<T> & Serializable> T findMax(List<T> list) {
    T max = list.get(0);
    for (T item : list) {
        if (item.compareTo(max) > 0) {
            max = item;
        }
    }
    return max;
}

// Recursive bound — common pattern for fluent APIs
public abstract class Builder<T extends Builder<T>> {
    private String name;

    @SuppressWarnings("unchecked")
    public T withName(String name) {
        this.name = name;
        return (T) this;  // returns the concrete subtype
    }
}

// Without bound: T is Object — limited
public <T> void print(T item) {
    // item.compareTo(...) → ERROR! Object has no compareTo
    System.out.println(item.toString()); // Only Object methods
}`,
  },
  {
    id: 'wildcards',
    title: 'Wildcards (?, extends, super)',
    color: '#F59E0B',
    keyPoints: [
      '? (unbounded) — unknown type. List<?> can hold any List',
      '? extends T (upper bound) — read-only. "Producer Extends"',
      '? super T (lower bound) — write-only. "Consumer Super"',
      'PECS: Producer Extends, Consumer Super (Joshua Bloch\'s rule)',
      'Cannot add to List<? extends T> (except null)',
      'Cannot read specific type from List<? super T> (only Object)',
    ],
    code: `// Unbounded Wildcard — accepts any parameterized type
public void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
    // list.add("test"); // COMPILE ERROR! Cannot add to List<?>
}
printAll(List.of(1, 2, 3));      // works
printAll(List.of("A", "B"));      // works

// Upper Bounded — ? extends T (PRODUCER — read from it)
public double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue(); // Can READ as Number
    }
    // numbers.add(42); // COMPILE ERROR! Cannot write
    return total;
}
sum(List.of(1, 2, 3));           // List<Integer> ✓
sum(List.of(1.5, 2.5));          // List<Double> ✓

// Lower Bounded — ? super T (CONSUMER — write to it)
public void addNumbers(List<? super Integer> list) {
    list.add(1);    // Can WRITE Integer and subtypes
    list.add(2);
    // Integer n = list.get(0); // ERROR! Can only read as Object
    Object obj = list.get(0);   // Only Object guaranteed
}
addNumbers(new ArrayList<Integer>());  // ✓
addNumbers(new ArrayList<Number>());   // ✓
addNumbers(new ArrayList<Object>());   // ✓

// PECS in practice — Collections.copy() signature:
// public static <T> void copy(
//     List<? super T> dest,     // CONSUMER (writes T)
//     List<? extends T> src     // PRODUCER (reads T)
// )
List<Number> dest = new ArrayList<>();
List<Integer> src = List.of(1, 2, 3);
Collections.copy(dest, src); // Integer extends Number ✓`,
  },
  {
    id: 'erasure',
    title: 'Type Erasure',
    color: '#8B5CF6',
    keyPoints: [
      'Java generics are a compile-time feature ONLY — erased at runtime',
      'After compilation: List<String> becomes List (raw type)',
      'Bounded types erased to bound: <T extends Number> → Number',
      'Unbounded T → Object after erasure',
      'Cannot use instanceof with generics: !(obj instanceof List<String>)',
      'Cannot create generic arrays: new T[] is illegal',
    ],
    code: `// What the compiler sees vs what the JVM sees:

// SOURCE CODE (compile time):
public class Box<T> {
    private T value;
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}
Box<String> box = new Box<>();
box.set("Hello");
String s = box.get();

// AFTER ERASURE (runtime — what JVM actually executes):
public class Box {
    private Object value;           // T → Object
    public Object get() { return value; }
    public void set(Object value) { this.value = value; }
}
Box box = new Box();
box.set("Hello");
String s = (String) box.get();     // Compiler inserts cast!

// CONSEQUENCES of Type Erasure:

// 1. Cannot check generic type at runtime
if (list instanceof List<String>) {} // COMPILE ERROR!
if (list instanceof List<?>) {}      // OK (unbounded only)

// 2. Cannot create generic arrays
T[] arr = new T[10];                 // COMPILE ERROR!
Object[] arr = new Object[10];       // Workaround

// 3. Cannot overload by generic type
void process(List<String> list) {}
void process(List<Integer> list) {} // ERROR! Same erasure

// 4. Bounded type erasure
public <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
// Erased to:
public Comparable max(Comparable a, Comparable b) {
    return a.compareTo(b) > 0 ? a : b;
}

// 5. Bridge methods — compiler generates synthetic methods
// to maintain polymorphism after erasure`,
  },
];

const pecsRules = [
  { scenario: 'Read items from a collection (produce values)', rule: '? extends T', example: 'List<? extends Number>', action: 'READ', color: '#10B981' },
  { scenario: 'Write items to a collection (consume values)', rule: '? super T', example: 'List<? super Integer>', action: 'WRITE', color: '#F59E0B' },
  { scenario: 'Both read and write', rule: 'Exact type T', example: 'List<T>', action: 'READ+WRITE', color: '#3B82F6' },
  { scenario: 'Only care about structure, not element type', rule: '?', example: 'List<?>', action: 'NEITHER', color: '#8B5CF6' },
];

const erasureComparison = [
  { before: 'List<String>', after: 'List', note: 'Generic type argument removed' },
  { before: 'Map<String, Integer>', after: 'Map', note: 'Both type arguments removed' },
  { before: '<T> T getValue()', after: 'Object getValue()', note: 'Unbounded T → Object' },
  { before: '<T extends Number> T calc()', after: 'Number calc()', note: 'Bounded T → bound type' },
  { before: 'Box<String> box = new Box<>()', after: 'Box box = new Box()', note: 'Diamond erased too' },
  { before: 'String s = box.get()', after: 'String s = (String)box.get()', note: 'Compiler inserts cast' },
];

const interviewQuestions = [
  {
    q: 'What is type erasure in Java?',
    a: 'Type erasure means generic type information is removed at compile time. The JVM has no knowledge of generics — List<String> and List<Integer> are both just List at runtime. The compiler adds necessary casts and validates type safety, then erases all generic type parameters from bytecode.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is the difference between <? extends T> and <? super T>?',
    a: '<? extends T> is an upper-bounded wildcard — accepts T or any subtype. Use for reading (producer). <? super T> is a lower-bounded wildcard — accepts T or any supertype. Use for writing (consumer). Remember PECS: Producer Extends, Consumer Super.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Why can\'t you add elements to a List<? extends Number>?',
    a: 'Because the compiler doesn\'t know the exact type. List<? extends Number> could be List<Integer>, List<Double>, or List<Number>. If it\'s List<Integer>, adding a Double would be unsafe. So the compiler prevents all additions (except null) to maintain type safety.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Can you create an instance of a generic type (new T())?',
    a: 'No. Due to type erasure, T becomes Object at runtime, and the JVM doesn\'t know what constructor to call. Workaround: pass a Class<T> token or a Supplier<T>. Example: T instance = clazz.getDeclaredConstructor().newInstance(); or T instance = supplier.get();',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What are bridge methods?',
    a: 'Bridge methods are synthetic methods generated by the compiler to maintain polymorphism after type erasure. When a generic class is subclassed with a concrete type, the erased method signature differs from the override. The compiler creates a bridge method with the erased signature that delegates to the concrete method.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why can\'t you create a generic array (new T[])?',
    a: 'Java arrays are covariant and carry runtime type information (reified). Generics are invariant and erased at runtime. Creating new T[] would create Object[] at runtime, losing type safety. If assigned to a typed reference, it could lead to heap pollution. Use List<T> or Array.newInstance(Class<T>, size) instead.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Explain the difference between List<Object>, List<?>, and raw List.',
    a: 'List<Object>: can add any Object, type-safe (explicit choice). List<?>: unknown type, read-only (can only get as Object, cannot add). Raw List: no generics at all, bypasses all type checking, generates compiler warnings. List<?> is the safest when you don\'t know the type.',
    difficulty: 'Intermediate' as const,
  },
];

export default function GenericsPage() {
  const [activeConcept, setActiveConcept] = useState('basics');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — Type Safety"
        title="Generics &"
        titleHighlight="Type Erasure"
        description="Bounded types, wildcards, PECS rule, and type erasure at compile time — the mechanism that makes Java collections type-safe without runtime overhead."
        icon={Box}
        iconColor="#8B5CF6"
        gradient="from-purple-500 via-violet-500 to-blue-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Category Selector */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveConcept(cat.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activeConcept === cat.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <cat.icon className="w-5 h-5 mb-2" style={{ color: cat.color }} />
                <div className="text-sm font-medium text-white">{cat.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{cat.tagline}</div>
                {activeConcept === cat.id && (
                  <motion.div
                    layoutId="activeGeneric"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${cat.color}50` }}
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
                title={`generics-${activeConcept}.java`}
                showLineNumbers
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* PECS Rule */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">PECS — Producer Extends, Consumer Super</h3>
            <p className="text-sm text-slate-400 mb-6">Joshua Bloch&apos;s golden rule for wildcard usage (Effective Java)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pecsRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${rule.color}25`, backgroundColor: `${rule.color}08` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: rule.color, backgroundColor: `${rule.color}15` }}>
                      {rule.rule}
                    </span>
                    <Badge variant={rule.action === 'READ' ? 'green' : rule.action === 'WRITE' ? 'orange' : rule.action === 'READ+WRITE' ? 'blue' : 'purple'} size="sm">
                      {rule.action}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">{rule.scenario}</p>
                  <code className="text-xs text-slate-500 font-mono">{rule.example}</code>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Type Erasure Visualization */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Type Erasure — Before &amp; After Compilation</h3>
            <p className="text-sm text-slate-400 mb-6">What your code looks like after the compiler erases generics</p>
            <div className="space-y-2">
              {erasureComparison.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-center p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <code className="text-xs font-mono text-purple-400">{item.before}</code>
                  <span className="text-slate-600 text-xs hidden md:block">→</span>
                  <code className="text-xs font-mono text-orange-400">{item.after}</code>
                  <span className="text-xs text-slate-500">{item.note}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="purple">Generics</Badge>
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
