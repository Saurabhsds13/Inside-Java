'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog, ChevronDown, ChevronUp, Boxes, Network, TreePine, Layers3 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const topics = [
  {
    id: 'hashmap',
    title: 'HashMap',
    icon: Boxes,
    color: '#3B82F6',
    tagline: 'Buckets, hashing, treeification',
  },
  {
    id: 'resize',
    title: 'Resize & Collisions',
    icon: Layers3,
    color: '#F59E0B',
    tagline: 'Load factor, rehashing',
  },
  {
    id: 'concurrenthashmap',
    title: 'ConcurrentHashMap',
    icon: Network,
    color: '#10B981',
    tagline: 'CAS + per-bin locking',
  },
  {
    id: 'treemap',
    title: 'TreeMap',
    icon: TreePine,
    color: '#8B5CF6',
    tagline: 'Red-Black tree',
  },
];

const concepts = [
  {
    id: 'hashmap',
    title: 'HashMap Internal Structure',
    color: '#3B82F6',
    keyPoints: [
      'Backed by Node<K,V>[] table — an array of buckets, each a linked list or tree',
      'Default capacity 16, load factor 0.75 → resize threshold 12',
      'Capacity is ALWAYS a power of two, so index = hash & (n - 1) replaces a modulo',
      'hash() spreads high bits down: h ^ (h >>> 16) — cheap defence against weak hashCodes',
      'Java 8+: a bucket with 8+ nodes converts to a red-black tree when table length ≥ 64',
      'Tree reverts to a list when the bin shrinks to 6 nodes (UNTREEIFY_THRESHOLD)',
      'Allows one null key (stored in bucket 0) and any number of null values',
      'Not thread-safe — concurrent put during resize can corrupt the table',
    ],
    code: `// The actual field layout (simplified from the JDK source)
public class HashMap<K,V> {
    transient Node<K,V>[] table;   // the bucket array
    transient int size;            // number of key-value mappings
    int threshold;                 // capacity * loadFactor → resize trigger
    final float loadFactor;        // 0.75 by default

    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;   // 16
    static final float DEFAULT_LOAD_FACTOR = 0.75f;
    static final int TREEIFY_THRESHOLD = 8;
    static final int UNTREEIFY_THRESHOLD = 6;
    static final int MIN_TREEIFY_CAPACITY = 64;

    static class Node<K,V> {
        final int hash;
        final K key;
        V value;
        Node<K,V> next;    // the collision chain
    }
}

// HASH SPREADING — why not just use key.hashCode()?
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
// Index uses only the LOW bits: hash & (n-1). With n=16 only 4 bits matter.
// XOR-ing the top 16 bits down lets high-bit differences affect the bucket.

// INDEX CALCULATION — bitmask instead of modulo
// Because capacity is a power of two:
//   hash % 16   ==   hash & 15
// A single AND instruction versus an integer division.

int index = (n - 1) & hash;

// PUT — the real decision tree
// 1. table null?                    → initialise (lazy, on first put)
// 2. bucket empty?                  → place a new Node, done
// 3. first node's hash AND key match? → overwrite the value
// 4. bucket is a TreeNode?          → red-black tree insert, O(log n)
// 5. otherwise walk the list:
//      - matching key found         → overwrite
//      - reached the end            → append; if chain length ≥ 8 → treeify
// 6. ++size > threshold?            → resize()

// GET — mirrors put
// 1. compute hash, find the bucket
// 2. check the first node (the common case — one comparison and done)
// 3. tree bin  → O(log n) search
// 4. list bin  → walk with (hash == h && (k == key || key.equals(k)))
//    hash is compared FIRST because int comparison is far cheaper than equals()

// WHY hashCode AND equals must agree
class BadKey {
    private final String id;
    @Override public boolean equals(Object o) {
        return o instanceof BadKey b && id.equals(b.id);
    }
    // No hashCode() override → inherits Object identity hash
    // Two equal BadKeys land in DIFFERENT buckets → map.get() returns null
}`,
  },
  {
    id: 'resize',
    title: 'Resizing & Collision Handling',
    color: '#F59E0B',
    keyPoints: [
      'Resize doubles capacity and rebuilds the table — an O(n) operation',
      'Triggered when size exceeds threshold (capacity × loadFactor)',
      'Java 8 split trick: a node either stays at index i or moves to i + oldCapacity',
      'That works because doubling adds exactly one significant bit to the mask',
      'Java 8 preserves relative order within a bin (lo/hi lists) — Java 7 reversed it',
      'Java 7 could form an infinite loop on concurrent resize; Java 8 cannot, but still corrupts',
      'Sizing tip: new HashMap<>(expected / 0.75 + 1) avoids repeated rehashing',
      'Load factor 0.75 balances space against collision probability — rarely worth changing',
    ],
    code: `// GROWTH SEQUENCE with the default load factor
// capacity 16  → resize at 12 entries
// capacity 32  → resize at 24
// capacity 64  → resize at 48
// capacity 128 → resize at 96 ...

// THE JAVA 8 SPLIT TRICK
// oldCap = 16 → mask 0b01111
// newCap = 32 → mask 0b11111        (one extra bit examined)
//
// The new index depends only on that one newly significant bit:
//   (hash & oldCap) == 0  → node stays at index i
//   (hash & oldCap) != 0  → node moves to index i + oldCap
//
// So each bin splits cleanly into two, with NO rehashing of keys.

// Example: hash = 0b10101 (21), oldCap = 16
// old index = 21 & 15 = 0b0101 = 5
// 21 & 16   = 0b10000 → non-zero
// new index = 5 + 16  = 21

// Simplified from HashMap.resize()
Node<K,V> loHead = null, loTail = null;   // stays at i
Node<K,V> hiHead = null, hiTail = null;   // moves to i + oldCap

for (Node<K,V> e = oldTab[i]; e != null; e = next) {
    next = e.next;
    if ((e.hash & oldCap) == 0) {
        if (loTail == null) loHead = e; else loTail.next = e;
        loTail = e;
    } else {
        if (hiTail == null) hiHead = e; else hiTail.next = e;
        hiTail = e;
    }
}
newTab[i]          = loHead;
newTab[i + oldCap] = hiHead;
// Appending to a tail keeps the original relative order.
// Java 7 prepended to a head, which reversed each chain — the root cause
// of the classic concurrent-resize infinite loop.

// COLLISION ESCALATION
// 1 node        → direct hit, O(1)
// 2-7 nodes     → linked list walk, O(k)
// 8+ nodes AND table length ≥ 64 → red-black tree, O(log k)
// If the table is smaller than 64, HashMap RESIZES instead of treeifying —
// a small table with long chains usually just needs more buckets.

// WORST CASE and why treeification exists
class Attack {
    @Override public int hashCode() { return 1; }   // every key collides
}
// Pre-Java 8: all n entries in one chain → O(n) lookup → hash-collision DoS
// Java 8+: that bin becomes a tree → O(log n)

// PRE-SIZING — skip the rehash churn entirely
Map<String, User> m = new HashMap<>(1000);   // NOT room for 1000!
// threshold = 1024 * 0.75 = 768 → still resizes at 768 entries
Map<String, User> better = new HashMap<>((int) (1000 / 0.75f) + 1);  // 1334 → capacity 2048`,
  },
  {
    id: 'concurrenthashmap',
    title: 'ConcurrentHashMap Internals',
    color: '#10B981',
    keyPoints: [
      'Java 7 used 16 Segments, each a small ReentrantLock-guarded table',
      'Java 8 dropped segments entirely — locks a single bin, not a partition',
      'Empty bin insert uses a CAS with no lock at all',
      'Non-empty bin insert synchronizes on the first node — lock granularity is one bucket',
      'Reads are completely lock-free: Node.val and Node.next are volatile',
      'Rejects null keys and null values — get() returning null is then unambiguous',
      'size() returns an estimate via a striped counter (baseCount + CounterCell[])',
      'Resizing is cooperative — multiple threads transfer bins concurrently',
    ],
    code: `// JAVA 7 — segment locking
// ConcurrentHashMap
//   └─ Segment[16]              each extends ReentrantLock
//        └─ HashEntry[] table
// Concurrency ceiling = number of segments (default 16), fixed at construction.

// JAVA 8 — one shared table, per-bin locking
public class ConcurrentHashMap<K,V> {
    transient volatile Node<K,V>[] table;
    private transient volatile Node<K,V>[] nextTable;  // used during resize
    private transient volatile long baseCount;
    private transient volatile int sizeCtl;            // control flags + threshold

    static class Node<K,V> {
        final int hash;
        final K key;
        volatile V val;           // volatile → lock-free visibility for readers
        volatile Node<K,V> next;
    }
}

// PUT — the fast path takes no lock
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());

    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;

        if (tab == null || (n = tab.length) == 0) {
            tab = initTable();                       // CAS-guarded lazy init
        }
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            // EMPTY BIN — plain CAS, zero locking
            if (casTabAt(tab, i, null, new Node<>(hash, key, value, null)))
                break;                               // success
            // CAS failed → another thread won the race → retry the loop
        }
        else if ((fh = f.hash) == MOVED) {
            tab = helpTransfer(tab, f);              // pitch in on the resize
        }
        else {
            // OCCUPIED BIN — lock just this bucket's first node
            synchronized (f) {
                // walk the chain or the tree and insert/replace
            }
        }
    }
    addCount(1L, binCount);                          // striped counter
    return null;
}

// GET — no locks, no CAS, just volatile reads
public V get(Object key) {
    // Node.val and Node.next are volatile, so a reader always sees
    // a consistent, fully-published node. Readers never block writers
    // and writers never block readers.
}

// WHY NULLS ARE BANNED
// HashMap:            map.get(k) == null is ambiguous — absent, or mapped to null?
//                     You disambiguate with containsKey(k).
// ConcurrentHashMap:  another thread could insert between get() and containsKey(),
//                     so that two-step check is not reliable. Banning null values
//                     makes null mean "absent", full stop.

// ATOMIC COMPOUND OPERATIONS — use these, not get-then-put
map.putIfAbsent(key, value);
map.computeIfAbsent(key, k -> expensiveLoad(k));     // loader runs once per key
map.compute(key, (k, v) -> v == null ? 1 : v + 1);   // atomic counter
map.merge(key, 1, Integer::sum);                     // idiomatic frequency count

// BROKEN — two atomic calls do not compose into one atomic operation
Integer v = map.get(k);
map.put(k, v == null ? 1 : v + 1);                   // lost updates under contention

// SIZE is an estimate by design
map.size();          // int, may be stale the moment it returns
map.mappingCount();  // long, preferred — size() overflows past Integer.MAX_VALUE`,
  },
  {
    id: 'treemap',
    title: 'TreeMap & Red-Black Trees',
    color: '#8B5CF6',
    keyPoints: [
      'A red-black tree — a self-balancing BST guaranteeing O(log n) worst case',
      'Ordering comes from Comparable keys or an explicit Comparator, never from hashCode',
      'Five invariants keep height at most 2·log₂(n+1), so the tree cannot degenerate',
      'Rebalancing uses recolouring plus at most 2 rotations per insert',
      'Rejects null keys — compareTo would throw NullPointerException',
      'TreeMap uses compareTo/compare for equality, ignoring equals() entirely',
      'Gives you NavigableMap: floorKey, ceilingKey, headMap, tailMap, subMap, descendingMap',
      'TreeSet is a TreeMap where every value is a shared PRESENT sentinel',
    ],
    code: `// RED-BLACK INVARIANTS
// 1. Every node is red or black.
// 2. The root is black.
// 3. All leaves (nil) are black.
// 4. A red node's children are both black — no two reds in a row.
// 5. Every path from a node to its descendant leaves contains the
//    same number of black nodes (equal "black height").
//
// Together these bound the height at 2·log2(n+1) → guaranteed O(log n).

static final class Entry<K,V> {
    K key;
    V value;
    Entry<K,V> left, right, parent;
    boolean color = BLACK;
}

// ORDERING comes from comparison, NOT hashing
TreeMap<String, Integer> natural = new TreeMap<>();               // Comparable
TreeMap<String, Integer> custom  = new TreeMap<>(Comparator.reverseOrder());
TreeMap<Employee, String> byName  =
    new TreeMap<>(Comparator.comparing(Employee::getName));

// EQUALITY IS DEFINED BY THE COMPARATOR — a real trap
TreeMap<String, Integer> ci = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
ci.put("hello", 1);
ci.put("HELLO", 2);
ci.size();          // 1 — the comparator calls them equal
ci.get("Hello");    // 2 — the second put overwrote the first
// A HashMap would hold both, because it uses equals() and hashCode().

// Consequence: a Comparator inconsistent with equals() makes TreeMap
// violate the Map contract. Keep them aligned.

// NAVIGATION — the reason to choose TreeMap over HashMap
TreeMap<Integer, String> scores = new TreeMap<>();
scores.put(10, "low"); scores.put(50, "mid"); scores.put(90, "high");

scores.firstKey();        // 10
scores.lastKey();         // 90
scores.floorKey(60);      // 50  — greatest key <= 60
scores.ceilingKey(60);    // 90  — smallest key >= 60
scores.lowerKey(50);      // 10  — strictly less than
scores.higherKey(50);     // 90  — strictly greater than

scores.headMap(50);            // {10=low}            keys < 50
scores.headMap(50, true);      // {10=low, 50=mid}    keys <= 50
scores.tailMap(50);            // {50=mid, 90=high}   keys >= 50
scores.subMap(10, true, 50, true);  // inclusive on both ends

scores.descendingMap();        // reversed view
scores.pollFirstEntry();       // remove and return the smallest

// Views are BACKED by the map — mutations write through
SortedMap<Integer, String> view = scores.headMap(50);
view.put(20, "added");         // also inserts into scores
// view.put(70, "x");          // IllegalArgumentException — outside the range

// INSERTION rebalance sketch
// 1. Standard BST insert, colour the new node RED.
// 2. If the parent is BLACK, done — no invariant broken.
// 3. If the parent is RED, invariant 4 is violated. Then:
//      uncle RED   → recolour parent/uncle black, grandparent red, recurse up
//      uncle BLACK → rotate (LL, LR, RL, RR) and recolour
// At most 2 rotations, O(log n) recolouring steps.`,
  },
];

const putSteps = [
  {
    label: 'map.put("Alice", 95)',
    hash: 'hashCode() = 63357246 → spread → 63358 & 15 = 14',
    bucket: 14,
    state: [{ idx: 14, nodes: ['Alice=95'] }],
    note: 'Bucket 14 is empty, so the node is placed directly. Best case — O(1), one array write.',
    color: '#10B981',
  },
  {
    label: 'map.put("Bob", 87)',
    hash: 'spread(hashCode) & 15 = 3',
    bucket: 3,
    state: [{ idx: 3, nodes: ['Bob=87'] }, { idx: 14, nodes: ['Alice=95'] }],
    note: 'A different bucket. No interaction with the existing entry at all.',
    color: '#10B981',
  },
  {
    label: 'map.put("Cara", 80)  ← collides',
    hash: 'spread(hashCode) & 15 = 3',
    bucket: 3,
    state: [{ idx: 3, nodes: ['Bob=87', 'Cara=80'] }, { idx: 14, nodes: ['Alice=95'] }],
    note: 'Same bucket as Bob — a collision. Keys differ, so Cara is appended to the chain. Lookup here now costs two comparisons.',
    color: '#F59E0B',
  },
  {
    label: 'map.put("Bob", 91)  ← same key',
    hash: 'spread(hashCode) & 15 = 3',
    bucket: 3,
    state: [{ idx: 3, nodes: ['Bob=91', 'Cara=80'] }, { idx: 14, nodes: ['Alice=95'] }],
    note: 'hash matches AND equals() returns true, so this is a replacement, not an insert. size stays at 3.',
    color: '#3B82F6',
  },
  {
    label: '8th node lands in bucket 3',
    hash: 'chain length reaches TREEIFY_THRESHOLD',
    bucket: 3,
    state: [{ idx: 3, nodes: ['red-black tree'] }, { idx: 14, nodes: ['Alice=95'] }],
    note: 'With table length ≥ 64, the chain converts to a red-black tree: O(k) degrades to O(log k). Below 64, HashMap resizes instead.',
    color: '#8B5CF6',
  },
  {
    label: '13th entry overall',
    hash: 'size 13 > threshold 12',
    bucket: -1,
    state: [],
    note: 'resize() doubles capacity 16 → 32 and redistributes every bin. Each node either stays at i or moves to i + 16 — no key is rehashed.',
    color: '#EF4444',
  },
];

const mapComparison = [
  { aspect: 'Backing structure', hash: 'Node[] + list/tree', concurrent: 'Node[] + list/tree', tree: 'Red-black tree' },
  { aspect: 'get / put', hash: 'O(1) average', concurrent: 'O(1) average', tree: 'O(log n) guaranteed' },
  { aspect: 'Worst case get', hash: 'O(log n) treeified', concurrent: 'O(log n) treeified', tree: 'O(log n)' },
  { aspect: 'Ordering', hash: 'None', concurrent: 'None', tree: 'Sorted by key' },
  { aspect: 'Thread-safe', hash: 'No', concurrent: 'Yes', tree: 'No' },
  { aspect: 'null key', hash: 'One allowed', concurrent: 'Rejected', tree: 'Rejected' },
  { aspect: 'null values', hash: 'Allowed', concurrent: 'Rejected', tree: 'Allowed' },
  { aspect: 'Equality via', hash: 'equals + hashCode', concurrent: 'equals + hashCode', tree: 'compareTo / Comparator' },
  { aspect: 'Iterator', hash: 'Fail-fast', concurrent: 'Weakly consistent', tree: 'Fail-fast' },
];

const constants = [
  { name: 'DEFAULT_INITIAL_CAPACITY', value: '16', why: 'Power of two so index = hash & (n-1)' },
  { name: 'DEFAULT_LOAD_FACTOR', value: '0.75', why: 'Space/collision sweet spot — resize at 3/4 full' },
  { name: 'TREEIFY_THRESHOLD', value: '8', why: 'Chain length at which a bin becomes a tree' },
  { name: 'UNTREEIFY_THRESHOLD', value: '6', why: 'Shrink back to a list — gap of 2 prevents thrashing' },
  { name: 'MIN_TREEIFY_CAPACITY', value: '64', why: 'Below this, resize rather than treeify' },
  { name: 'MAXIMUM_CAPACITY', value: '1 << 30', why: 'Largest power of two that fits a positive int' },
];

const interviewQuestions = [
  {
    q: 'How does HashMap work internally?',
    a: 'It keeps a Node[] array of buckets. On put, the key\'s hashCode is spread with h ^ (h >>> 16) and the bucket index is computed as hash & (capacity - 1). If the bucket is empty the node goes straight in. If not, it walks the chain comparing hash first then equals — a match replaces the value, otherwise the node is appended. When a chain reaches 8 nodes and the table is at least 64 long, that bin becomes a red-black tree. When size exceeds capacity × 0.75, the table doubles and every bin is redistributed.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why is HashMap capacity always a power of two?',
    a: 'So the modulo can be replaced by a bitmask: for a power-of-two n, hash % n is identical to hash & (n - 1), which is one AND instruction instead of an integer division. It also makes resizing cheap — doubling adds exactly one significant bit to the mask, so each node either stays at index i or moves to i + oldCapacity, and no key needs rehashing. If you pass a non-power-of-two initial capacity, HashMap rounds it up to the next power of two.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What changed in HashMap between Java 7 and Java 8?',
    a: 'Java 8 added treeification: a bucket with 8+ nodes converts to a red-black tree once the table is 64+ long, turning worst-case lookup from O(n) into O(log n) and closing a hash-collision DoS vector. Resizing also changed — Java 8 splits each bin into a lo/hi list preserving relative order, while Java 7 prepended nodes and reversed each chain. That reversal was what allowed two threads resizing concurrently to build a circular list and spin forever in get().',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why does ConcurrentHashMap forbid null keys and values?',
    a: 'In a HashMap, get() returning null is ambiguous — the key may be absent or mapped to null — and you resolve it with containsKey(). In a concurrent map that two-step check is unreliable, because another thread can insert or remove between the two calls. Banning null values makes null mean exactly one thing: absent. It also lets internal CAS logic treat null as "empty slot" without ambiguity.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'How did ConcurrentHashMap locking change in Java 8?',
    a: 'Java 7 partitioned the map into 16 Segments, each a ReentrantLock-guarded sub-table, so the concurrency ceiling was fixed at construction. Java 8 removed segments and locks a single bin instead. Inserting into an empty bin is a plain CAS with no lock; inserting into an occupied bin synchronizes on that bin\'s first node. Reads take no lock at all because Node.val and Node.next are volatile. The result is far finer granularity and concurrency that scales with table size rather than a fixed segment count.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why is ConcurrentHashMap.size() only an estimate?',
    a: 'Maintaining one exact counter would serialize every write on a single hot field. Instead it uses striped counting — a baseCount plus a CounterCell[] that threads CAS into independently — and size() sums them. Because writes can land while the sum is in progress, the total is a snapshot that may already be stale on return. Prefer mappingCount(), which returns a long and does not overflow past Integer.MAX_VALUE.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'How does TreeMap guarantee O(log n)?',
    a: 'It is a red-black tree, a self-balancing BST with five invariants — notably that a red node cannot have a red child, and that every root-to-leaf path holds the same number of black nodes. Those constraints bound the height at 2·log₂(n+1), so the tree can never degenerate into a linked list the way a plain BST can with sorted input. Inserts and deletes restore the invariants with recolouring plus at most a couple of rotations, all O(log n).',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'What happens if a TreeMap Comparator is inconsistent with equals()?',
    a: 'TreeMap decides equality purely by comparison — two keys are the same entry when compare returns 0, regardless of what equals() says. So a TreeMap built with String.CASE_INSENSITIVE_ORDER treats "hello" and "HELLO" as one key, while a HashMap holds both. That is legal but it breaks the Map interface contract, which is defined in terms of equals(). Anything relying on that contract can behave surprisingly, so keep the comparator consistent with equals unless the divergence is deliberate.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'What breaks if you mutate a key after inserting it into a HashMap?',
    a: 'The entry becomes unreachable. The bucket index was computed from the old hashCode, so after mutation the map looks in a different bucket and finds nothing — get returns null and remove fails, yet the entry still occupies space and still appears during iteration. This is exactly why immutable types like String and Integer make ideal keys. If a mutable key is unavoidable, exclude the mutable fields from hashCode and equals.',
    difficulty: 'Intermediate' as const,
  },
];

export default function CollectionsInternalsPage() {
  const [activeConcept, setActiveConcept] = useState('hashmap');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [putStep, setPutStep] = useState(0);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;
  const step = putSteps[putStep];

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — Under the Hood"
        title="Collections"
        titleHighlight="Internals"
        description="How HashMap actually stores entries, why capacity is a power of two, how ConcurrentHashMap achieves lock-free reads, and how TreeMap stays balanced. The questions that separate users of the API from people who understand it."
        icon={Cog}
        iconColor="#3B82F6"
        gradient="from-blue-500 via-indigo-500 to-purple-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* HashMap put() Walkthrough */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">HashMap put() Walkthrough</h3>
            <p className="text-sm text-slate-400 mb-6">
              Step through six puts on a 16-bucket table to see collisions, replacement, treeification and resize
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Steps */}
              <div className="space-y-2">
                {putSteps.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPutStep(idx)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      putStep === idx ? 'bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                    style={putStep === idx ? { borderColor: `${s.color}50` } : undefined}
                  >
                    <code className="text-xs font-mono text-slate-300">{s.label}</code>
                    {putStep === idx && (
                      <p className="text-[11px] font-mono mt-1.5" style={{ color: s.color }}>
                        {s.hash}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* Bucket table */}
              <div className="lg:sticky lg:top-24 h-fit">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={putStep}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 rounded-lg border border-white/[0.08] bg-black/20 mb-3">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Node&lt;K,V&gt;[] table — capacity 16
                      </p>
                      <div className="grid grid-cols-8 gap-1.5">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const bin = step.state.find((b) => b.idx === i);
                          const isTarget = step.bucket === i;
                          return (
                            <div
                              key={i}
                              className="aspect-square rounded flex items-center justify-center text-[10px] font-mono border transition-all"
                              style={{
                                borderColor: isTarget ? `${step.color}70` : 'rgba(255,255,255,0.06)',
                                backgroundColor: bin
                                  ? `${step.color}20`
                                  : isTarget
                                  ? `${step.color}10`
                                  : 'rgba(255,255,255,0.02)',
                                color: bin ? step.color : '#475569',
                              }}
                            >
                              {bin ? bin.nodes.length : i}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bucket contents */}
                    {step.state.length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {step.state.map((bin) => (
                          <div
                            key={bin.idx}
                            className="flex items-center gap-2 p-2 rounded border border-white/[0.06] bg-white/[0.02]"
                          >
                            <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                              [{bin.idx}]
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {bin.nodes.map((n, ni) => (
                                <span key={ni} className="flex items-center gap-1.5">
                                  {ni > 0 && <span className="text-slate-600 text-[10px]">→</span>}
                                  <code
                                    className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: `${step.color}15`, color: step.color }}
                                  >
                                    {n}
                                  </code>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className="p-3 rounded-lg border"
                      style={{ borderColor: `${step.color}25`, backgroundColor: `${step.color}08` }}
                    >
                      <p className="text-sm text-slate-300 leading-relaxed">{step.note}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
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
                    layoutId="activeInternal"
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

              <CodeBlock code={currentConcept.code} title={`${activeConcept}-internals.java`} showLineNumbers />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* HashMap Constants */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">The Constants That Govern HashMap</h3>
            <p className="text-sm text-slate-400 mb-6">
              Straight from the JDK source — knowing these numbers and the reasoning behind them is what interviewers probe for
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {constants.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1.5">
                    <code className="text-[11px] font-mono text-blue-400">{c.name}</code>
                    <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">
                      {c.value}
                    </code>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.why}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Three-way comparison */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              <code className="font-mono text-blue-400">HashMap</code> vs{' '}
              <code className="font-mono text-emerald-400">ConcurrentHashMap</code> vs{' '}
              <code className="font-mono text-purple-400">TreeMap</code>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Aspect</th>
                    <th className="text-left py-3 px-3 text-blue-400 font-medium font-mono">HashMap</th>
                    <th className="text-left py-3 px-3 text-emerald-400 font-medium font-mono">ConcurrentHashMap</th>
                    <th className="text-left py-3 px-3 text-purple-400 font-medium font-mono">TreeMap</th>
                  </tr>
                </thead>
                <tbody>
                  {mapComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.aspect}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.hash}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.concurrent}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.tree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Lookup cost by bin state */}
        <AnimatedSection delay={0.28} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Lookup Cost as a Bin Degrades</h3>
            <p className="text-sm text-slate-400 mb-6">
              Relative efficiency of a single get() depending on what the target bucket holds
            </p>
            <div className="space-y-4">
              <StatBar label="Empty or single node — direct hit, O(1)" value={100} color="#10B981" showValue={false} />
              <StatBar label="Short chain, 2-4 nodes — O(k) walk" value={72} color="#3B82F6" showValue={false} />
              <StatBar label="Long chain, 5-7 nodes — O(k) walk" value={48} color="#F59E0B" showValue={false} />
              <StatBar label="Treeified bin, 8+ nodes — O(log k)" value={62} color="#8B5CF6" showValue={false} />
              <StatBar label="Pre-Java 8 pathological chain — O(n)" value={12} color="#EF4444" showValue={false} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * Treeification is deliberately slower than a short chain — a tree node carries more overhead. It exists to
              cap the worst case, not to speed up the common one, which is why the threshold is 8 rather than 2.
            </p>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="blue">Internals</Badge>
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
