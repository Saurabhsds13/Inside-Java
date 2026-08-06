'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ChevronDown, ChevronUp, FileBox, ShieldCheck, Scan, ToggleRight, Braces } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  {
    id: 'records',
    title: 'Records',
    icon: FileBox,
    color: '#3B82F6',
    tagline: 'Immutable data carriers (Java 16)',
  },
  {
    id: 'sealed',
    title: 'Sealed Classes',
    icon: ShieldCheck,
    color: '#10B981',
    tagline: 'Controlled hierarchies (Java 17)',
  },
  {
    id: 'pattern-matching',
    title: 'Pattern Matching',
    icon: Scan,
    color: '#F59E0B',
    tagline: 'instanceof + switch (Java 16-21)',
  },
  {
    id: 'switch-expressions',
    title: 'Switch Expressions',
    icon: ToggleRight,
    color: '#8B5CF6',
    tagline: 'Arrow syntax + yield (Java 14)',
  },
  {
    id: 'other',
    title: 'Text Blocks & More',
    icon: Braces,
    color: '#EC4899',
    tagline: 'Strings, var, helpful NPEs',
  },
];

const concepts = [
  {
    id: 'records',
    title: 'Records (Java 14 preview → Java 16 final)',
    color: '#3B82F6',
    history: 'JEP 395. Java was mocked for decades for verbose "data classes" — 50 lines of getters, equals, hashCode, toString for a 3-field DTO. Kotlin data classes and Lombok @Value showed it could be one line. Records make immutable data carriers a first-class language feature.',
    keyPoints: [
      'A record auto-generates: private final fields, canonical constructor, getters (name(), not getName()), equals, hashCode, toString',
      'Records are implicitly final — cannot be extended (but can implement interfaces)',
      'Components are final — no setters, records are shallow-immutable by design',
      'Compact canonical constructor validates without repeating assignments',
      'Can have additional constructors, static methods, and instance methods',
      'Perfect for DTOs, value objects, multi-return, and immutable events',
      'Not a replacement for entities — JPA needs mutable fields and a no-arg constructor',
      'Record components participate in deconstruction patterns (Java 21)',
    ],
    code: `// BEFORE records — 60 lines for a simple value class
public final class Point {
    private final int x;
    private final int y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int x() { return x; }
    public int y() { return y; }
    @Override public boolean equals(Object o) { /* ... 10 lines ... */ }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "Point[x=%d, y=%d]".formatted(x, y); }
}

// AFTER — one line, same semantics
public record Point(int x, int y) { }

// COMPACT CANONICAL CONSTRUCTOR — validates without explicit assignment
public record Range(int lo, int hi) {
    public Range {                         // no parameter list = compact form
        if (lo > hi) throw new IllegalArgumentException("lo > hi");
        // assignments happen automatically AFTER this block
    }
}

// ADDITIONAL METHODS — records are not just data
public record Email(String value) {
    public Email {
        if (!value.contains("@")) throw new IllegalArgumentException("Invalid email");
    }

    public String domain() {               // derived, not stored
        return value.substring(value.indexOf('@') + 1);
    }

    public static Email of(String value) { // factory
        return new Email(value.toLowerCase().trim());
    }
}

// IMPLEMENTS interfaces — records can conform to contracts
public sealed interface Shape permits Circle, Rectangle {}
public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}
public record Rectangle(double width, double height) implements Shape {
    public double area() { return width * height; }
}

// LOCAL RECORDS (Java 16) — ephemeral multi-return
public List<String> topScorers(List<Student> students) {
    record Scored(Student student, double score) {}   // local, block-scoped

    return students.stream()
        .map(s -> new Scored(s, calculateScore(s)))
        .sorted(Comparator.comparingDouble(Scored::score).reversed())
        .limit(10)
        .map(sc -> sc.student().name())
        .toList();
}

// DECONSTRUCTION PATTERNS (Java 21) — access components without getters
Object obj = new Point(3, 4);
if (obj instanceof Point(int x, int y)) {
    System.out.println("Distance: " + Math.sqrt(x*x + y*y));
}

// Records as Map keys — equals/hashCode is automatic and correct
Map<Point, String> labels = Map.of(new Point(0, 0), "origin");
labels.get(new Point(0, 0));   // "origin" — works because equals is structural`,
  },
  {
    id: 'sealed',
    title: 'Sealed Classes & Interfaces (Java 15 preview → Java 17 final)',
    color: '#10B981',
    history: 'JEP 409. Before sealed, you could either leave a class open to all (public abstract) or close it entirely (final). There was no middle ground. Sealed types let you define an EXACT set of permitted subtypes — enabling the compiler to do exhaustiveness checks in switch, which is the foundation of algebraic data types in Java.',
    keyPoints: [
      'sealed + permits lists the EXACT subtypes — no one else can extend/implement',
      'Subtypes MUST be final, sealed, or non-sealed (explicitly open)',
      'Enables exhaustive pattern matching in switch — compiler guarantees you covered all cases',
      'Combined with records: sealed interface + record subtypes = algebraic data types (ADTs)',
      'No default branch needed in switch when all permitted types are handled',
      'Sealed types and their permitted subtypes must be in the same package (or module)',
      'The JVM encodes permits in bytecode — enforced even without the compiler',
    ],
    code: `// SEALED HIERARCHY — the compiler knows ALL subtypes
public sealed interface Result<T>
    permits Success, Failure, Pending {
}

public record Success<T>(T value) implements Result<T> { }
public record Failure<T>(Exception error) implements Result<T> { }
public record Pending<T>(String taskId) implements Result<T> { }

// EXHAUSTIVE SWITCH — no default needed, compiler checks completeness
public <T> String describe(Result<T> result) {
    return switch (result) {
        case Success<T> s  -> "Got: " + s.value();
        case Failure<T> f  -> "Error: " + f.error().getMessage();
        case Pending<T> p  -> "Waiting: " + p.taskId();
        // No default! Compiler knows these three are the ONLY possibilities.
        // Adding a 4th permitted type forces updating every switch. Compile error.
    };
}

// SEALED + RECORDS = ALGEBRAIC DATA TYPES (the Java equivalent of Rust enums)
public sealed interface Expr permits Num, Add, Mul, Neg {
}
public record Num(double value) implements Expr { }
public record Add(Expr left, Expr right) implements Expr { }
public record Mul(Expr left, Expr right) implements Expr { }
public record Neg(Expr operand) implements Expr { }

// Recursive pattern-matched evaluation
public double eval(Expr expr) {
    return switch (expr) {
        case Num(var v)         -> v;
        case Add(var l, var r)  -> eval(l) + eval(r);
        case Mul(var l, var r)  -> eval(l) * eval(r);
        case Neg(var e)         -> -eval(e);
    };
}
// This is ML-style pattern matching, in Java. Exhaustive and type-safe.

// NON-SEALED — opt out for one branch
public sealed interface Animal permits Dog, Cat, WildAnimal { }
public final class Dog implements Animal { }
public final class Cat implements Animal { }
public non-sealed class WildAnimal implements Animal { }
// Anyone can extend WildAnimal — the "escape hatch"

// SEALED ABSTRACT CLASS — not just interfaces
public sealed abstract class Transport permits Car, Train, Bicycle {
    abstract int speed();
}
public final class Car extends Transport { int speed() { return 120; } }
public final class Train extends Transport { int speed() { return 300; } }
public final class Bicycle extends Transport { int speed() { return 25; } }

// WHY THIS MATTERS — the pre-sealed problem
// Before: adding a new Shape subclass → existing switches silently miss it → bugs at runtime
// After:  adding a new permits entry → compiler errors in EVERY switch → bugs caught at compile time
// This is "make illegal states unrepresentable" applied to Java.`,
  },
  {
    id: 'pattern-matching',
    title: 'Pattern Matching (Java 16-21, evolving)',
    color: '#F59E0B',
    history: 'Project Amber has been delivering pattern matching incrementally: instanceof patterns (Java 16, JEP 394), guarded patterns (Java 21), record patterns / deconstruction (Java 21, JEP 440), and switch pattern matching (Java 21, JEP 441). The vision is ML-level expressiveness without sacrificing Java\'s type safety.',
    keyPoints: [
      'instanceof pattern: test + cast + bind in one expression — eliminates the double cast',
      'Record deconstruction patterns: if (obj instanceof Point(int x, int y)) — accesses components directly',
      'Patterns work in switch (Java 21) — combine type tests, deconstruction, and guards',
      'Guards with "when" keyword: case String s when s.length() > 5 -> ...',
      'Nested patterns: case Pair(Point(var x1, _), Point(var x2, _)) — deep destructuring',
      'null can be a case label: case null -> handle; — no more NPE before the switch',
      'Dominance ordering: more specific patterns must come before general ones (compiler enforces)',
    ],
    code: `// BEFORE pattern matching — the repetitive instanceof + cast
if (obj instanceof String) {
    String s = (String) obj;          // cast repeats the type
    System.out.println(s.length());
}

// JAVA 16+ — pattern variable, one expression
if (obj instanceof String s) {
    System.out.println(s.length());   // s already cast and scoped
}

// Flow scoping — s is in scope where the compiler can prove the match succeeded
if (obj instanceof String s && s.length() > 5) {
    process(s);                        // safe: instanceof passed AND length checked
}
// s is NOT in scope here — the compiler knows it might not be a String

// NEGATION pattern
if (!(obj instanceof String s)) {
    return;                            // early exit
}
// s IS in scope here — because we passed the instanceof check by NOT returning
process(s);

// SWITCH PATTERN MATCHING (Java 21) — the big one
public String format(Object obj) {
    return switch (obj) {
        case null           -> "null";
        case Integer i      -> "int: " + i;
        case Long l         -> "long: " + l;
        case String s       -> "string(%d): %s".formatted(s.length(), s);
        case int[] arr      -> "array of " + arr.length;
        case Point(int x, int y) -> "(%d,%d)".formatted(x, y);
        default             -> obj.toString();
    };
}

// GUARDED PATTERNS — "when" clause adds a boolean condition
public String classifyAge(Object obj) {
    return switch (obj) {
        case Integer i when i < 0   -> "invalid";
        case Integer i when i < 18  -> "minor";
        case Integer i when i < 65  -> "adult";
        case Integer i              -> "senior";
        default                     -> "not a number";
    };
}

// RECORD DECONSTRUCTION PATTERNS (Java 21)
sealed interface Shape permits Circle, Rectangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double w, double h) implements Shape {}

public double area(Shape shape) {
    return switch (shape) {
        case Circle(var r)     -> Math.PI * r * r;
        case Rectangle(var w, var h) -> w * h;
    };
}

// NESTED DECONSTRUCTION — deep pattern matching
record Pair<A, B>(A first, B second) {}

Object obj = new Pair<>(new Point(1, 2), new Point(3, 4));
if (obj instanceof Pair(Point(var x1, var y1), Point(var x2, var y2))) {
    double dist = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

// DOMINANCE — compiler enforces ordering
// case CharSequence cs -> ...  MUST come AFTER case String s -> ...
// because String is more specific. Reversed order = compile error.`,
  },
  {
    id: 'switch-expressions',
    title: 'Switch Expressions (Java 12 preview → Java 14 final)',
    color: '#8B5CF6',
    history: 'JEP 361. The old switch statement was a notorious source of bugs: fall-through was the default, break was forgotten constantly, and it could not be used as an expression. The new switch uses arrow syntax (no fall-through), can return a value, and works with patterns and sealed types.',
    keyPoints: [
      'Arrow form (->): no fall-through, no break needed — each arm is self-contained',
      'Switch as an expression: assigns the result to a variable or returns it directly',
      'yield keyword for multi-statement arrow blocks (replaces return inside switch)',
      'Exhaustiveness required when used as expression — must cover all cases or have default',
      'Combined with sealed types: no default needed when all permits are handled',
      'null case (Java 21): case null -> ... — no more NullPointerException before the switch body',
      'Multiple labels: case "a", "b", "c" -> ... — cleaner than fall-through',
    ],
    code: `// OLD SWITCH — fall-through is the default, break is forgotten easily
int day = 3;
String name;
switch (day) {
    case 1: name = "Monday"; break;
    case 2: name = "Tuesday"; break;
    case 3: name = "Wednesday"; break;  // forget break → silent bug
    // ...
    default: name = "Unknown";
}

// NEW SWITCH EXPRESSION — arrow syntax, returns a value
String name = switch (day) {
    case 1  -> "Monday";
    case 2  -> "Tuesday";
    case 3  -> "Wednesday";
    case 4  -> "Thursday";
    case 5  -> "Friday";
    case 6, 7 -> "Weekend";             // multiple labels, one arm
    default -> throw new IllegalArgumentException("Invalid day: " + day);
};

// YIELD — for multi-statement blocks
int numLetters = switch (name) {
    case "Monday", "Friday", "Sunday" -> 6;
    case "Tuesday" -> 7;
    case "Saturday" -> 8;
    default -> {
        int len = name.length();
        System.out.println("Computed: " + len);
        yield len;                       // yield returns the value from the block
    }
};

// EXHAUSTIVENESS with enums — no default needed
enum Season { SPRING, SUMMER, AUTUMN, WINTER }

String clothing = switch (season) {
    case SPRING -> "light jacket";
    case SUMMER -> "t-shirt";
    case AUTUMN -> "sweater";
    case WINTER -> "heavy coat";
};
// Adding a 5th season to the enum → compile error here. Cannot silently miss it.

// EXHAUSTIVENESS with sealed types (Java 21)
sealed interface PaymentResult permits Approved, Declined, Pending {}
record Approved(String txnId) implements PaymentResult {}
record Declined(String reason) implements PaymentResult {}
record Pending(Duration eta) implements PaymentResult {}

String message = switch (result) {
    case Approved a  -> "Success: " + a.txnId();
    case Declined d  -> "Denied: " + d.reason();
    case Pending p   -> "Retry in " + p.eta().toMinutes() + "m";
};
// No default! Compiler guarantees all cases covered.

// NULL handling (Java 21) — before, null threw NPE before entering the switch
String label = switch (input) {
    case null          -> "nothing";
    case "admin"       -> "administrator";
    case String s when s.startsWith("user_") -> "user: " + s.substring(5);
    case String s      -> "other: " + s;
};

// PATTERN + EXPRESSION combined — the full power
record Response(int status, String body) {}

String summary = switch (response) {
    case Response(var s, var b) when s >= 200 && s < 300 -> "OK: " + b;
    case Response(var s, _) when s == 404 -> "Not Found";
    case Response(var s, var b) when s >= 500 -> "Server Error: " + b;
    case Response r -> "Status " + r.status();
};`,
  },
  {
    id: 'other',
    title: 'Text Blocks, var, and Quality-of-Life Features',
    color: '#EC4899',
    history: 'These features span Java 10-21 and represent the "make Java less painful" era under Brian Goetz\'s stewardship. var (Java 10), text blocks (Java 15), helpful NullPointerExceptions (Java 14), and compact number formatting reflect a Java that listens to developer ergonomics without sacrificing type safety.',
    keyPoints: [
      'var (Java 10): local variable type inference — compiler infers the type from the RHS',
      'Text blocks (Java 15): multi-line string literals with """, auto-manage indentation',
      'Helpful NPEs (Java 14): message says EXACTLY which reference was null in a chain',
      'String methods: isBlank(), strip(), indent(), repeat(), formatted() — Java 11-15',
      'Stream.toList() (Java 16): unmodifiable List directly — replaces Collectors.toList()',
      'SequencedCollection (Java 21): addFirst/addLast/reversed for ordered collections',
      'Virtual Threads (Java 21): lightweight threads for blocking I/O at massive scale',
    ],
    code: `// VAR (Java 10) — local type inference
var names = new ArrayList<String>();           // inferred: ArrayList<String>
var map = Map.of("key", 123);                  // inferred: Map<String, Integer>
var stream = names.stream().filter(n -> !n.isBlank()); // inferred: Stream<String>

// WHERE var shines — long generic types
var entries = new HashMap<String, List<Map<String, Object>>>();
// Without var: HashMap<String, List<Map<String, Object>>> entries = new ...

// WHERE var hurts readability
var result = service.process(data);            // what type is result? unclear
// Rule: use var when the type is obvious from the RHS, not when it hides important info

// var CANNOT be used for: fields, method params, return types, null init, lambdas

// TEXT BLOCKS (Java 15) — multi-line strings
String json = """
        {
            "name": "Alice",
            "age": 30,
            "roles": ["admin", "user"]
        }
        """;
// Indentation is relative to the closing """ — the compiler strips common prefix

String sql = """
        SELECT u.name, u.email
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.total > 100
        ORDER BY u.name
        """;
// No more \\n concatenation or messy + chains

// Escape sequences in text blocks
String html = """
        <div class="card">
            <p>Price: \\s%s</p>
        </div>
        """.formatted(price);
// \\s = a significant trailing space (not stripped), %s = String.format

// HELPFUL NPEs (Java 14, JEP 358)
// Before: "NullPointerException" — which reference? Nobody knows.
// After:  "Cannot invoke String.length() because the return value of
//          User.getAddress().getCity() is null"
// Enabled by default since Java 14 — no flag needed

user.getAddress().getCity().toUpperCase();
// If getAddress() returns null, the message says EXACTLY that

// NEW STRING METHODS (Java 11-15)
"  hello  ".strip();          // "hello"    (Unicode-aware, unlike trim())
"  hello  ".stripLeading();   // "hello  "
"".isBlank();                 // true       ("" and whitespace-only)
"ha".repeat(3);               // "hahaha"
"hello".indent(4);            // "    hello\\n"
"Hi %s".formatted("Java");   // "Hi Java"  (instance method, not static)

// Stream.toList() (Java 16) — unmodifiable List, shorter
List<String> names = stream.toList();           // immutable
// Before: stream.collect(Collectors.toList())  // mutable

// SEQUENCED COLLECTIONS (Java 21) — finally, ordered access on all collections
SequencedCollection<String> seq = new LinkedHashSet<>(List.of("A", "B", "C"));
seq.getFirst();            // "A"
seq.getLast();             // "C"
seq.addFirst("Z");         // Z, A, B, C
seq.reversed();            // reversed view

// VIRTUAL THREADS (Java 21, JEP 444) — the biggest change since lambdas
// One virtual thread per blocking task — 10 million threads become feasible
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> {
            var response = httpClient.send(request, BodyHandlers.ofString());
            process(response);
        });
    }
}
// Each virtual thread: ~1KB stack (vs ~1MB for platform threads)
// Mounted on carrier (platform) threads; unmounts on blocking I/O
// No code changes needed — same Thread API, just created differently`,
  },
];

const timeline = [
  { version: 'Java 10 (2018)', jep: 'JEP 286', feature: 'var — local variable type inference', category: 'Language' },
  { version: 'Java 11 (2018)', jep: 'JEP 321+', feature: 'HTTP Client, String methods, var in lambdas', category: 'Library' },
  { version: 'Java 12 (2019)', jep: 'JEP 325', feature: 'Switch expressions (preview)', category: 'Language' },
  { version: 'Java 14 (2020)', jep: 'JEP 361+394+358', feature: 'Switch expressions, instanceof patterns (preview), helpful NPEs', category: 'Language' },
  { version: 'Java 15 (2020)', jep: 'JEP 378+360', feature: 'Text blocks, sealed classes (preview)', category: 'Language' },
  { version: 'Java 16 (2021)', jep: 'JEP 395+394', feature: 'Records (final), instanceof patterns (final), Stream.toList()', category: 'Language' },
  { version: 'Java 17 LTS (2021)', jep: 'JEP 409', feature: 'Sealed classes (final), strong encapsulation of JDK internals', category: 'Language' },
  { version: 'Java 19 (2022)', jep: 'JEP 425', feature: 'Virtual threads (preview), structured concurrency (incubator)', category: 'Platform' },
  { version: 'Java 21 LTS (2023)', jep: 'JEP 440+441+444+431', feature: 'Record patterns, switch patterns (final), virtual threads (final), sequenced collections', category: 'Language + Platform' },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is a record in Java and why was it introduced?',
    a: 'A record is a special class that is a transparent, immutable data carrier. It auto-generates private final fields, a canonical constructor, component accessors (name(), not getName()), equals/hashCode based on all fields, and toString. It was introduced (JEP 395, Java 16) to eliminate the 50+ lines of boilerplate needed for simple value objects — the ceremony that made Java notorious compared to Kotlin\'s data class or Python\'s namedtuple.',
    difficulty: 'Beginner',
  },
  {
    q: 'What are sealed classes and what problem do they solve?',
    a: 'Sealed classes restrict which types can extend/implement them via a "permits" clause. They solve the "open hierarchy" problem: before sealed, you could not express "these are the ONLY subtypes." This matters because it enables exhaustive switch expressions — the compiler can verify you handled every case, and adding a new subtype immediately breaks every incomplete switch. Combined with records, they give Java algebraic data types.',
    difficulty: 'Intermediate',
  },
  {
    q: 'How does pattern matching in switch (Java 21) differ from a chain of instanceof checks?',
    a: 'A switch with patterns is exhaustive (compiler-enforced), concise (no repeated casts), and null-safe (case null is a valid label). It also supports guarded patterns with "when" clauses, deconstruction patterns (case Point(var x, var y)), and dominance ordering enforcement. An if-else instanceof chain has none of these: no exhaustiveness check, requires manual casts, null handling is separate, and reordering is silent.',
    difficulty: 'Intermediate',
  },
  {
    q: 'What is a compact canonical constructor in a record?',
    a: 'A constructor written without a parameter list — "public Range { ... }" instead of "public Range(int lo, int hi) { ... }". Inside it, you validate or normalize the parameters. The compiler inserts the actual field assignments AFTER your validation code. This avoids repeating "this.lo = lo; this.hi = hi;" — you only write the logic that differs from the default.',
    difficulty: 'Intermediate',
  },
  {
    q: 'Explain virtual threads and when you would use them.',
    a: 'Virtual threads (JEP 444, Java 21) are lightweight threads managed by the JVM, not the OS. They have ~1KB stack (vs ~1MB for platform threads) and are cheap enough to create one per task — even millions. They unmount from their carrier thread during blocking I/O, freeing it for other virtual threads. Use them for I/O-bound workloads (HTTP calls, DB queries) where you previously needed reactive or async programming to avoid exhausting the thread pool. Do NOT use them for CPU-bound work — they share the same ForkJoinPool carriers.',
    difficulty: 'Advanced',
  },
  {
    q: 'Can a record implement an interface? Can it extend a class?',
    a: 'A record can implement any number of interfaces — including sealed interfaces, which is how you get algebraic data types. A record CANNOT extend a class because it implicitly extends java.lang.Record (and Java has single inheritance). Records are also implicitly final, so they cannot be subclassed themselves.',
    difficulty: 'Beginner',
  },
  {
    q: 'What is the difference between the arrow switch and the colon switch?',
    a: 'Colon-form (case X:) has fall-through as default — missing break silently runs the next case. Arrow-form (case X ->) has no fall-through — each arm is isolated. Arrow-form can be an expression (assigned to a variable). Colon-form remains a statement. Both can coexist in a codebase but NOT in the same switch. The arrow form is strongly preferred for new code as it eliminates an entire class of bugs.',
    difficulty: 'Beginner',
  },
  {
    q: 'What are guarded patterns and how do they work?',
    a: 'A guarded pattern adds a boolean condition after the type test using the "when" keyword: case Integer i when i > 0 -> "positive". The guard refines the match — the arm only executes if BOTH the type matches AND the condition is true. Dominance rules apply: a guarded pattern is more specific than the same pattern without a guard, so it must come first. Guards replace the need for nested if-else inside case blocks.',
    difficulty: 'Advanced',
  },
  {
    q: 'How do SequencedCollections (Java 21) improve the collections API?',
    a: 'Before Java 21, getting the first/last element or iterating in reverse was inconsistent: LinkedHashSet had no getFirst(), Deque had peekFirst(), SortedSet had first(). SequencedCollection unifies this with getFirst(), getLast(), addFirst(), addLast(), removeFirst(), removeLast(), and reversed() across all ordered collections (List, Deque, SortedSet, LinkedHashSet). It fills a 25-year gap in the collections framework design.',
    difficulty: 'Intermediate',
  },
];

export default function ModernJavaPage() {
  const [activeConcept, setActiveConcept] = useState('records');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;
  const currentTopic = topics.find((t) => t.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Advanced — Modern Language"
        title="Java 17-21"
        titleHighlight="Features"
        description="Records, Sealed Classes, Pattern Matching, Switch Expressions, Virtual Threads — the features that transformed Java from verbose enterprise language to concise, expressive, and still type-safe. The Brian Goetz era."
        icon={Rocket}
        iconColor="#8B5CF6"
        gradient="from-violet-500 via-purple-500 to-fuchsia-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Feature Timeline */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">The Modern Java Timeline</h3>
            <p className="text-sm text-slate-400 mb-6">
              Six-month cadence since Java 10. Features incubate as previews, graduate when stable.
            </p>
            <div className="space-y-2">
              {timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="grid grid-cols-1 md:grid-cols-[130px_100px_1fr_90px] gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] items-center"
                >
                  <code className="text-[11px] font-mono text-purple-400 font-medium">{item.version}</code>
                  <code className="text-[10px] font-mono text-slate-500">{item.jep}</code>
                  <span className="text-xs text-slate-300">{item.feature}</span>
                  <Badge variant={item.category === 'Language' ? 'blue' : item.category === 'Library' ? 'green' : item.category === 'Platform' ? 'orange' : 'purple'} size="sm">
                    {item.category}
                  </Badge>
                </motion.div>
              ))}
            </div>
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
                    layoutId="activeModern"
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

                <div className="mb-5 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">Historical Context</p>
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
            <Badge variant="purple">Modern Java</Badge>
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
