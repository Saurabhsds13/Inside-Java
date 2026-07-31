'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ChevronDown, ChevronUp, List, Grid3X3, GitBranch, Layers } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const collectionTypes = [
  {
    id: 'list',
    title: 'List',
    icon: List,
    color: '#3B82F6',
    tagline: 'Ordered, allows duplicates',
  },
  {
    id: 'set',
    title: 'Set',
    icon: Grid3X3,
    color: '#10B981',
    tagline: 'No duplicates',
  },
  {
    id: 'map',
    title: 'Map',
    icon: GitBranch,
    color: '#F59E0B',
    tagline: 'Key-Value pairs',
  },
  {
    id: 'queue',
    title: 'Queue',
    icon: Layers,
    color: '#8B5CF6',
    tagline: 'FIFO processing',
  },
];

const concepts = [
  {
    id: 'list',
    title: 'List Interface',
    color: '#3B82F6',
    implementations: [
      { name: 'ArrayList', internal: 'Dynamic array (Object[])', bestFor: 'Random access, iteration', weakness: 'Slow insert/delete in middle' },
      { name: 'LinkedList', internal: 'Doubly linked list', bestFor: 'Frequent insert/delete', weakness: 'Slow random access (O(n))' },
      { name: 'Vector', internal: 'Synchronized dynamic array', bestFor: 'Thread-safe legacy code', weakness: 'Slow (synchronized), prefer CopyOnWriteArrayList' },
      { name: 'Stack', internal: 'Extends Vector', bestFor: 'LIFO operations', weakness: 'Legacy — use Deque instead' },
    ],
    keyPoints: [
      'Maintains insertion order',
      'Allows duplicate elements and null values',
      'Index-based access (get(i), set(i, elem))',
      'ArrayList default capacity: 10, grows by 50% (newCap = oldCap + oldCap >> 1)',
      'LinkedList implements both List and Deque interfaces',
      'Use ArrayList in 95% of cases — CPU cache friendly',
    ],
    code: `// ArrayList — most commonly used
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Alice"); // duplicates allowed
names.get(0);       // O(1) random access
names.remove(1);    // O(n) — shifts elements

// LinkedList — better for frequent insertions
List<Integer> linked = new LinkedList<>();
linked.add(0, 100);   // O(1) at head/tail
linked.addFirst(50);  // Deque method
linked.addLast(200);  // Deque method

// Key difference: iteration
// ArrayList:  sequential memory → cache-friendly → fast
// LinkedList: scattered nodes → cache misses → slower

// Conversion
List<String> immutable = List.of("A", "B", "C"); // Java 9+
List<String> mutable = new ArrayList<>(immutable);

// Sorting
Collections.sort(names);           // natural order
names.sort(Comparator.reverseOrder()); // custom order

// ArrayList internal resizing:
// Default capacity = 10
// When full: newCapacity = oldCapacity + (oldCapacity >> 1)
// i.e., grows by 50%: 10 → 15 → 22 → 33 → ...`,
  },
  {
    id: 'set',
    title: 'Set Interface',
    color: '#10B981',
    implementations: [
      { name: 'HashSet', internal: 'HashMap (keys only)', bestFor: 'Fast lookup, no order needed', weakness: 'No ordering guarantee' },
      { name: 'LinkedHashSet', internal: 'HashMap + doubly linked list', bestFor: 'Insertion order + uniqueness', weakness: 'Slightly more memory' },
      { name: 'TreeSet', internal: 'Red-Black tree (TreeMap)', bestFor: 'Sorted order, range queries', weakness: 'O(log n) operations' },
      { name: 'EnumSet', internal: 'Bit vector', bestFor: 'Set of enum constants', weakness: 'Only works with enums' },
    ],
    keyPoints: [
      'No duplicate elements (uses equals() + hashCode())',
      'HashSet: O(1) add/remove/contains — backed by HashMap',
      'LinkedHashSet: maintains insertion order',
      'TreeSet: sorted order (natural or Comparator) — O(log n)',
      'null allowed in HashSet (one null), NOT in TreeSet',
      'Set.of() creates immutable set (Java 9+)',
    ],
    code: `// HashSet — fastest, no order guarantee
Set<String> hashSet = new HashSet<>();
hashSet.add("Banana");
hashSet.add("Apple");
hashSet.add("Banana"); // ignored — duplicate
// Iteration order: unpredictable

// LinkedHashSet — maintains insertion order
Set<String> linkedSet = new LinkedHashSet<>();
linkedSet.add("Banana");
linkedSet.add("Apple");
linkedSet.add("Cherry");
// Iteration: Banana → Apple → Cherry (insertion order)

// TreeSet — sorted order
Set<Integer> treeSet = new TreeSet<>();
treeSet.add(30);
treeSet.add(10);
treeSet.add(20);
// Iteration: 10 → 20 → 30 (natural order)

// TreeSet range operations
TreeSet<Integer> scores = new TreeSet<>(List.of(45, 78, 92, 33, 67));
scores.headSet(70);    // [33, 45, 67] — less than 70
scores.tailSet(50);    // [67, 78, 92] — >= 50
scores.subSet(40, 80); // [45, 67, 78] — >= 40, < 80

// How HashSet detects duplicates:
// 1. Compute hashCode() → find bucket
// 2. If bucket empty → add
// 3. If bucket has elements → check equals()
// 4. If equals() returns true → reject (duplicate)

// Custom objects in HashSet — MUST override equals() + hashCode()
class Student {
    String id;
    @Override
    public int hashCode() { return id.hashCode(); }
    @Override
    public boolean equals(Object o) {
        return o instanceof Student s && id.equals(s.id);
    }
}`,
  },
  {
    id: 'map',
    title: 'Map Interface',
    color: '#F59E0B',
    implementations: [
      { name: 'HashMap', internal: 'Array + LinkedList/Tree (bucket)', bestFor: 'Fast key-value lookup', weakness: 'No ordering, not thread-safe' },
      { name: 'LinkedHashMap', internal: 'HashMap + doubly linked list', bestFor: 'Insertion/access order', weakness: 'Slightly more memory' },
      { name: 'TreeMap', internal: 'Red-Black tree', bestFor: 'Sorted keys, range queries', weakness: 'O(log n) operations' },
      { name: 'ConcurrentHashMap', internal: 'Segmented buckets + CAS', bestFor: 'Thread-safe, high concurrency', weakness: 'No null keys/values' },
    ],
    keyPoints: [
      'Stores key-value pairs — keys must be unique',
      'HashMap: O(1) get/put — allows one null key, multiple null values',
      'HashMap default: capacity=16, loadFactor=0.75, threshold=12',
      'When bucket has 8+ entries AND table size >= 64 → bucket becomes tree',
      'TreeMap: keys sorted naturally or by Comparator',
      'ConcurrentHashMap: thread-safe without locking entire map',
    ],
    code: `// HashMap — most used Map implementation
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.put("Alice", 98); // overwrites! Keys are unique
scores.get("Alice");      // 98
scores.getOrDefault("Eve", 0); // 0 (not found)

// Java 8+ convenient methods
scores.putIfAbsent("Charlie", 72);
scores.computeIfAbsent("Dave", k -> k.length() * 10);
scores.merge("Bob", 5, Integer::sum); // Bob = 87 + 5 = 92

// Iteration patterns
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}
scores.forEach((name, score) -> System.out.println(name + ": " + score));

// LinkedHashMap — preserves insertion order
Map<String, String> config = new LinkedHashMap<>();

// LinkedHashMap as LRU Cache (access-order mode)
Map<String, String> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
        return size() > 100; // max 100 entries
    }
};

// TreeMap — sorted by keys
TreeMap<String, Integer> sorted = new TreeMap<>(scores);
sorted.firstKey();           // smallest key
sorted.lastKey();            // largest key
sorted.headMap("C");         // keys < "C"
sorted.subMap("A", "D");    // keys >= "A" and < "D"`,
  },
  {
    id: 'queue',
    title: 'Queue & Deque Interface',
    color: '#8B5CF6',
    implementations: [
      { name: 'LinkedList', internal: 'Doubly linked list', bestFor: 'General queue/deque', weakness: 'Memory overhead per node' },
      { name: 'ArrayDeque', internal: 'Resizable circular array', bestFor: 'Stack or Queue (fastest)', weakness: 'No null elements' },
      { name: 'PriorityQueue', internal: 'Binary heap (array)', bestFor: 'Priority-based processing', weakness: 'Not thread-safe' },
      { name: 'ArrayBlockingQueue', internal: 'Fixed-size circular array', bestFor: 'Bounded producer-consumer', weakness: 'Fixed capacity' },
    ],
    keyPoints: [
      'Queue: FIFO (First-In-First-Out) — add at tail, remove from head',
      'Deque: Double-ended queue — add/remove from both ends',
      'PriorityQueue: elements ordered by natural order or Comparator (min-heap)',
      'ArrayDeque is faster than LinkedList for both Stack and Queue use',
      'offer/poll/peek return null on failure; add/remove/element throw exceptions',
      'BlockingQueue: thread-safe with blocking put()/take() methods',
    ],
    code: `// Queue (FIFO) — use ArrayDeque (not LinkedList)
Queue<String> queue = new ArrayDeque<>();
queue.offer("First");   // add to tail
queue.offer("Second");
queue.offer("Third");
queue.poll();           // "First" — remove from head
queue.peek();           // "Second" — view head without removing

// Deque as Stack (LIFO) — replacement for Stack class
Deque<String> stack = new ArrayDeque<>();
stack.push("Bottom");   // add to head
stack.push("Middle");
stack.push("Top");
stack.pop();            // "Top" — remove from head
stack.peek();           // "Middle"

// PriorityQueue — min-heap by default
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(30);
minHeap.offer(10);
minHeap.offer(20);
minHeap.poll(); // 10 (smallest first)
minHeap.poll(); // 20

// Max-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
maxHeap.offer(30);
maxHeap.offer(10);
maxHeap.poll(); // 30 (largest first)

// PriorityQueue with custom objects
PriorityQueue<Task> taskQueue = new PriorityQueue<>(
    Comparator.comparingInt(Task::getPriority)
);

// Methods comparison:
// offer() → false on failure  |  add()     → exception on failure
// poll()  → null if empty     |  remove()  → exception if empty
// peek()  → null if empty     |  element() → exception if empty`,
  },
];

const complexityData = [
  { name: 'ArrayList', get: 'O(1)', add: 'O(1)*', remove: 'O(n)', search: 'O(n)', color: '#3B82F6' },
  { name: 'LinkedList', get: 'O(n)', add: 'O(1)', remove: 'O(1)', search: 'O(n)', color: '#3B82F6' },
  { name: 'HashSet', get: '—', add: 'O(1)', remove: 'O(1)', search: 'O(1)', color: '#10B981' },
  { name: 'TreeSet', get: '—', add: 'O(log n)', remove: 'O(log n)', search: 'O(log n)', color: '#10B981' },
  { name: 'HashMap', get: 'O(1)', add: 'O(1)', remove: 'O(1)', search: 'O(1)', color: '#F59E0B' },
  { name: 'TreeMap', get: 'O(log n)', add: 'O(log n)', remove: 'O(log n)', search: 'O(log n)', color: '#F59E0B' },
  { name: 'ArrayDeque', get: 'O(1)', add: 'O(1)', remove: 'O(1)', search: 'O(n)', color: '#8B5CF6' },
  { name: 'PriorityQueue', get: 'O(1)', add: 'O(log n)', remove: 'O(log n)', search: 'O(n)', color: '#8B5CF6' },
];

const whenToUse = [
  { scenario: 'Need fast random access by index', answer: 'ArrayList', color: '#3B82F6' },
  { scenario: 'Frequent insertion/deletion at both ends', answer: 'ArrayDeque', color: '#8B5CF6' },
  { scenario: 'No duplicates, fast contains() check', answer: 'HashSet', color: '#10B981' },
  { scenario: 'Sorted unique elements', answer: 'TreeSet', color: '#10B981' },
  { scenario: 'Key-value lookup (most common)', answer: 'HashMap', color: '#F59E0B' },
  { scenario: 'Maintain insertion order of keys', answer: 'LinkedHashMap', color: '#F59E0B' },
  { scenario: 'Process elements by priority', answer: 'PriorityQueue', color: '#8B5CF6' },
  { scenario: 'Thread-safe map, high read concurrency', answer: 'ConcurrentHashMap', color: '#F59E0B' },
  { scenario: 'LIFO stack behavior', answer: 'ArrayDeque (push/pop)', color: '#8B5CF6' },
  { scenario: 'Unique elements in insertion order', answer: 'LinkedHashSet', color: '#10B981' },
];

const interviewQuestions = [
  {
    q: 'What is the difference between ArrayList and LinkedList?',
    a: 'ArrayList uses a dynamic array — O(1) random access but O(n) insert/delete in middle (shifts elements). LinkedList uses doubly linked nodes — O(1) insert/delete at known positions but O(n) random access. ArrayList is preferred in most cases due to CPU cache locality.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'How does HashSet ensure uniqueness?',
    a: 'HashSet is backed by HashMap (elements are keys, value is a dummy constant). When adding: 1) Compute hashCode() to find bucket, 2) If bucket empty → add. 3) If bucket has entries → check equals() against each. 4) If equals() is true → reject (duplicate). Both hashCode() and equals() must be correctly overridden.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'HashMap vs Hashtable vs ConcurrentHashMap?',
    a: 'HashMap: not thread-safe, allows null key/values, fast. Hashtable: legacy, fully synchronized (locks entire table), slow. ConcurrentHashMap: thread-safe, uses segment/bucket-level locking, high concurrency, no null keys/values. Always prefer ConcurrentHashMap over Hashtable.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'When would you use TreeMap over HashMap?',
    a: 'Use TreeMap when you need: 1) Keys in sorted order, 2) Range queries (subMap, headMap, tailMap), 3) Navigation (firstKey, floorKey, ceilingKey). TreeMap uses Red-Black tree (O(log n) operations). HashMap is faster (O(1)) when ordering is not needed.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why is ArrayDeque preferred over Stack and LinkedList?',
    a: 'Stack extends Vector (synchronized, slow). LinkedList has node allocation overhead and poor cache locality. ArrayDeque uses a resizable circular array — no synchronization overhead, cache-friendly, O(1) amortized for push/pop/offer/poll from both ends. Official Java docs recommend ArrayDeque over Stack.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What happens when HashMap capacity exceeds load factor threshold?',
    a: 'When size > capacity × loadFactor (default: 16 × 0.75 = 12), HashMap resizes: doubles capacity (16→32), rehashes all entries into new buckets. This is O(n) and creates a new array. Since Java 8, when a bucket has 8+ entries and table size ≥ 64, the linked list in that bucket converts to a Red-Black tree (O(log n) lookup instead of O(n)).',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Explain fail-fast vs fail-safe iterators.',
    a: 'Fail-fast: throws ConcurrentModificationException if collection is modified during iteration (ArrayList, HashMap). Uses an internal modCount. Fail-safe: works on a clone/snapshot, never throws CME (ConcurrentHashMap, CopyOnWriteArrayList). Trade-off: fail-safe may not reflect latest changes.',
    difficulty: 'Advanced' as const,
  },
];

export default function CollectionsPage() {
  const [activeConcept, setActiveConcept] = useState('list');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — Data Structures"
        title="Collections"
        titleHighlight="Framework"
        description="List, Set, Map, Queue — the backbone of Java applications. Know when to use which, their internal implementations, and time complexities."
        icon={Database}
        iconColor="#F59E0B"
        gradient="from-yellow-500 via-orange-500 to-red-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Collection Type Selector */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {collectionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveConcept(type.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activeConcept === type.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <type.icon className="w-5 h-5 mb-2" style={{ color: type.color }} />
                <div className="text-sm font-medium text-white">{type.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{type.tagline}</div>
                {activeConcept === type.id && (
                  <motion.div
                    layoutId="activeCollection"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${type.color}50` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Active Concept Content */}
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
              {/* Left — Key Points + Implementations */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">{currentConcept.title}</h2>

                {/* Implementation comparison cards */}
                <div className="space-y-2 mb-5">
                  {currentConcept.implementations.map((impl, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{impl.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-500 font-mono">
                          {impl.internal}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        <span className="text-green-400">✓</span> {impl.bestFor}
                        {' · '}
                        <span className="text-red-400">✗</span> {impl.weakness}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Key Points */}
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

              {/* Right — Code */}
              <CodeBlock
                code={currentConcept.code}
                title={`${currentConcept.title.replace(' ', '')}.java`}
                showLineNumbers
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Time Complexity Table */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Time Complexity Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Collection</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Get</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Add</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Remove</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Search</th>
                  </tr>
                </thead>
                <tbody>
                  {complexityData.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-xs" style={{ color: row.color }}>
                          {row.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-300 font-mono">{row.get}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-300 font-mono">{row.add}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-300 font-mono">{row.remove}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-300 font-mono">{row.search}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * ArrayList add is O(1) amortized, O(n) worst case during resize. HashMap operations assume good hash distribution.
            </p>
          </GlassCard>
        </AnimatedSection>

        {/* When to Use Which */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">When to Use Which?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {whenToUse.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <span className="text-sm text-slate-300">{item.scenario}</span>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded border"
                    style={{
                      color: item.color,
                      borderColor: `${item.color}30`,
                      backgroundColor: `${item.color}10`,
                    }}
                  >
                    {item.answer}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="orange">Collections</Badge>
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
