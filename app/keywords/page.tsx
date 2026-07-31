'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ChevronDown, ChevronUp, Lock, Anchor, ArrowUpRight, Compass } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const keywords = [
  {
    id: 'static',
    title: 'static',
    icon: Anchor,
    color: '#3B82F6',
    tagline: 'Belongs to class, not object',
  },
  {
    id: 'final',
    title: 'final',
    icon: Lock,
    color: '#EF4444',
    tagline: 'Cannot be changed/overridden',
  },
  {
    id: 'this',
    title: 'this',
    icon: Compass,
    color: '#10B981',
    tagline: 'Current object reference',
  },
  {
    id: 'super',
    title: 'super',
    icon: ArrowUpRight,
    color: '#F59E0B',
    tagline: 'Parent class reference',
  },
];

const concepts = [
  {
    id: 'static',
    title: 'static Keyword',
    color: '#3B82F6',
    keyPoints: [
      'static members belong to the CLASS, not individual objects',
      'Loaded into Method Area (Metaspace) when class is loaded',
      'Shared across ALL instances — one copy in memory',
      'Can access static members without creating an object',
      'static methods cannot access non-static (instance) members directly',
      'static blocks execute once when the class is first loaded',
      'static inner classes don\'t hold reference to outer class',
    ],
    memoryView: [
      { area: 'Method Area', contains: 'static variables, static methods, class metadata', color: '#3B82F6' },
      { area: 'Heap', contains: 'Instance variables (one per object)', color: '#10B981' },
      { area: 'Stack', contains: 'Local variables, method calls', color: '#F59E0B' },
    ],
    code: `// STATIC VARIABLE — shared across all instances
public class Counter {
    static int totalCount = 0;  // ONE copy for all objects
    int instanceCount = 0;       // one per object

    public Counter() {
        totalCount++;     // shared — increments for all
        instanceCount++;  // per-object — always 1
    }
}
Counter c1 = new Counter(); // totalCount=1, c1.instanceCount=1
Counter c2 = new Counter(); // totalCount=2, c2.instanceCount=1
Counter c3 = new Counter(); // totalCount=3, c3.instanceCount=1

// STATIC METHOD — belongs to class
public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
        // Cannot access instance variables here!
        // this.something → ERROR (no "this" in static context)
    }
}
MathUtils.add(5, 3); // call without object

// STATIC BLOCK — runs once when class loads
public class Config {
    static Map<String, String> settings;

    static {
        // Runs ONCE when JVM loads this class
        settings = new HashMap<>();
        settings.put("env", "production");
        settings.put("port", "8080");
        System.out.println("Config loaded!"); // prints once
    }
}

// STATIC IMPORT
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;
double result = sqrt(PI); // no Math. prefix needed`,
  },
  {
    id: 'final',
    title: 'final Keyword',
    color: '#EF4444',
    keyPoints: [
      'final variable: value cannot be reassigned after initialization',
      'final method: cannot be overridden by subclasses',
      'final class: cannot be extended (no subclasses) — e.g., String, Integer',
      'final + static = constant (convention: UPPER_SNAKE_CASE)',
      'final reference: reference is fixed, but object contents can change!',
      'Blank final: declared without value, must be assigned in constructor',
      'Compiler can inline final constants for performance',
    ],
    memoryView: [
      { area: 'Compile-time constant', contains: 'static final primitives/Strings → inlined by compiler', color: '#EF4444' },
      { area: 'Heap (immutable ref)', contains: 'final List<> → list ref fixed, but can add/remove elements', color: '#F59E0B' },
      { area: 'Stack', contains: 'final local variables → assigned once', color: '#8B5CF6' },
    ],
    code: `// FINAL VARIABLE — cannot reassign
final int MAX_SIZE = 100;
// MAX_SIZE = 200;  // COMPILE ERROR!

// FINAL REFERENCE — reference is fixed, object is NOT
final List<String> names = new ArrayList<>();
names.add("Alice");    // ✓ modifying the object is OK
names.add("Bob");      // ✓ still OK
// names = new ArrayList<>(); // ✗ CANNOT reassign reference!

// BLANK FINAL — assigned in constructor (once)
public class Employee {
    final String employeeId; // blank final

    public Employee(String id) {
        this.employeeId = id; // must assign here
    }
    // employeeId can never change after construction
}

// FINAL METHOD — cannot override
public class Parent {
    public final void criticalLogic() {
        // Subclasses CANNOT override this method
        System.out.println("This behavior is locked");
    }
}

// FINAL CLASS — cannot extend
public final class ImmutablePoint {
    private final int x, y;

    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }
    public int getX() { return x; }
    public int getY() { return y; }
}
// class Point3D extends ImmutablePoint {} // COMPILE ERROR!

// CONSTANT — static + final (convention: UPPER_CASE)
public static final double PI = 3.14159265358979;
public static final String APP_NAME = "InsideJava";`,
  },
  {
    id: 'this',
    title: 'this Keyword',
    color: '#10B981',
    keyPoints: [
      'this refers to the CURRENT object (the one calling the method)',
      'Used to distinguish instance variables from local/parameter names',
      'this() calls another constructor in the same class (constructor chaining)',
      'this() must be the FIRST statement in a constructor',
      'Cannot use this in static context (no object exists)',
      'Can pass this as argument to other methods',
      'Can return this for fluent/builder pattern (method chaining)',
    ],
    memoryView: [
      { area: 'Stack Frame', contains: 'this → reference to current object on heap', color: '#10B981' },
      { area: 'Heap', contains: 'The actual object that "this" points to', color: '#3B82F6' },
      { area: 'Implicit', contains: 'Every non-static method has hidden "this" parameter', color: '#8B5CF6' },
    ],
    code: `// DISAMBIGUATE — instance var vs parameter
public class Student {
    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name; // this.name = instance, name = param
        this.age = age;
    }
}

// CONSTRUCTOR CHAINING — this() calls another constructor
public class Rectangle {
    private int width, height;

    public Rectangle() {
        this(1, 1); // calls Rectangle(int, int)
    }

    public Rectangle(int side) {
        this(side, side); // calls Rectangle(int, int)
    }

    public Rectangle(int width, int height) {
        this.width = width;   // actual initialization
        this.height = height;
    }
}

// FLUENT PATTERN — return this for chaining
public class QueryBuilder {
    private String table;
    private String where;
    private int limit;

    public QueryBuilder from(String table) {
        this.table = table;
        return this; // enables chaining
    }
    public QueryBuilder where(String condition) {
        this.where = condition;
        return this;
    }
    public QueryBuilder limit(int n) {
        this.limit = n;
        return this;
    }
}
// Usage: builder.from("users").where("age > 18").limit(10);

// PASS this AS ARGUMENT
public class EventSource {
    public void register(Listener listener) {
        listener.onEvent(this); // pass current object
    }
}`,
  },
  {
    id: 'super',
    title: 'super Keyword',
    color: '#F59E0B',
    keyPoints: [
      'super refers to the PARENT class (immediate superclass)',
      'super.method() calls the parent version of an overridden method',
      'super() calls the parent constructor — must be FIRST statement',
      'If no explicit super(), compiler inserts super() (no-arg) automatically',
      'If parent has no no-arg constructor, child MUST call super(args) explicitly',
      'Cannot skip generations: super.super is NOT valid in Java',
      'super can access parent\'s protected/public members hidden by child',
    ],
    memoryView: [
      { area: 'Object in Heap', contains: 'Single object with both parent + child fields', color: '#F59E0B' },
      { area: 'Method call', contains: 'super.method() → invokes parent\'s version explicitly', color: '#3B82F6' },
      { area: 'Constructor chain', contains: 'Child → super() → Parent → super() → Object', color: '#10B981' },
    ],
    code: `// CONSTRUCTOR CHAINING — super() calls parent constructor
public class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
        System.out.println("Animal created: " + name);
    }
}

public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);  // MUST be first line! Calls Animal(name)
        this.breed = breed;
        System.out.println("Dog created: " + breed);
    }
}
new Dog("Rex", "Labrador");
// Output: Animal created: Rex
//         Dog created: Labrador

// CALL PARENT METHOD — super.method()
public class Shape {
    public void draw() {
        System.out.println("Drawing shape outline");
    }
}

public class Circle extends Shape {
    @Override
    public void draw() {
        super.draw(); // call parent's draw first
        System.out.println("Filling circle with color");
    }
}

// ACCESS HIDDEN FIELD
public class Parent {
    protected String type = "Parent";
}
public class Child extends Parent {
    protected String type = "Child"; // hides parent's type

    public void printTypes() {
        System.out.println(type);        // "Child"
        System.out.println(super.type);  // "Parent"
    }
}

// CONSTRUCTOR CHAIN ORDER:
// new Dog() → Dog() → super() → Animal() → super() → Object()
// Constructors execute top-down: Object → Animal → Dog`,
  },
];

const comparisonTable = [
  { feature: 'Refers to', thisVal: 'Current object', superVal: 'Parent class' },
  { feature: 'Constructor call', thisVal: 'this() — same class', superVal: 'super() — parent class' },
  { feature: 'Must be first line?', thisVal: 'Yes (in constructor)', superVal: 'Yes (in constructor)' },
  { feature: 'Static context?', thisVal: 'Cannot use', superVal: 'Cannot use' },
  { feature: 'Method call', thisVal: 'this.method() — current class', superVal: 'super.method() — parent class' },
  { feature: 'Can coexist?', thisVal: 'NO — either this() or super(), not both', superVal: 'NO — either this() or super(), not both' },
];

const staticVsInstance = [
  { feature: 'Belongs to', staticVal: 'Class', instanceVal: 'Object' },
  { feature: 'Memory', staticVal: 'Method Area (one copy)', instanceVal: 'Heap (per object)' },
  { feature: 'Access without object', staticVal: '✓ ClassName.method()', instanceVal: '✗ Needs object' },
  { feature: 'Can access instance members', staticVal: '✗ No (no "this")', instanceVal: '✓ Yes' },
  { feature: 'Can access static members', staticVal: '✓ Yes', instanceVal: '✓ Yes' },
  { feature: 'Overridable', staticVal: '✗ Hidden, not overridden', instanceVal: '✓ Polymorphism works' },
];

const interviewQuestions = [
  {
    q: 'Can a static method access instance variables?',
    a: 'No. Static methods belong to the class, not an object. There is no "this" reference in static context, so instance variables (which belong to a specific object) cannot be accessed directly. You\'d need to pass an object reference explicitly: static void print(MyObj obj) { obj.name; }',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is the difference between final, finally, and finalize?',
    a: 'final: keyword to make variables constant, methods non-overridable, classes non-extendable. finally: block in try-catch that always executes (cleanup). finalize(): deprecated Object method called by GC before collecting (unpredictable, do not use). Three completely different concepts sharing a word.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Can you use this() and super() in the same constructor?',
    a: 'No. Both must be the first statement in a constructor, so they cannot coexist. If you use this() to chain to another constructor in the same class, that other constructor will (directly or eventually) call super(). So the parent constructor always gets called through the chain.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why is the main method static?',
    a: 'Because the JVM needs to call main() without creating an object of the class. Static methods can be invoked directly using the class name. If main were non-static, the JVM would need to instantiate the class first — but which constructor? With what arguments? static eliminates this bootstrap problem.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is a static initialization block and when does it run?',
    a: 'A static block (static { ... }) runs once when the class is first loaded by the ClassLoader. It executes before any constructor or static method. Multiple static blocks run in order of appearance. Used for complex static field initialization (loading configs, registering drivers, etc.).',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Can a final reference variable point to a mutable object?',
    a: 'Yes! final means the reference cannot be reassigned, but the object it points to can still be modified. final List<String> list = new ArrayList<>() means list always points to the same ArrayList, but you can still add/remove elements. For true immutability, the object itself must be immutable (e.g., Collections.unmodifiableList()).',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Explain constructor chaining with this() and super().',
    a: 'Constructor chaining is calling one constructor from another. this() chains within the same class (overloaded constructors call each other). super() chains to the parent class. The chain always ends at Object(). Order: this() → eventually one constructor calls super() → parent constructors → Object(). Every object construction ultimately goes through Object\'s constructor.',
    difficulty: 'Advanced' as const,
  },
];

export default function KeywordsPage() {
  const [activeConcept, setActiveConcept] = useState('static');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — Language Fundamentals"
        title="Keywords"
        titleHighlight="Deep Dive"
        description="static, final, this, super — understanding these keywords from a memory perspective is what separates surface-level knowledge from true Java mastery."
        icon={Key}
        iconColor="#F59E0B"
        gradient="from-yellow-500 via-amber-500 to-orange-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Keyword Selector */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {keywords.map((kw) => (
              <button
                key={kw.id}
                onClick={() => setActiveConcept(kw.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activeConcept === kw.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <kw.icon className="w-5 h-5 mb-2" style={{ color: kw.color }} />
                <div className="text-sm font-medium text-white font-mono">{kw.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{kw.tagline}</div>
                {activeConcept === kw.id && (
                  <motion.div
                    layoutId="activeKeyword"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${kw.color}50` }}
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
              {/* Left — Key Points + Memory View */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  <code className="font-mono">{currentConcept.title}</code>
                </h2>

                {/* Memory Perspective */}
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Memory Perspective</h3>
                  <div className="space-y-2">
                    {currentConcept.memoryView.map((mv, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border"
                        style={{ borderColor: `${mv.color}25`, backgroundColor: `${mv.color}08` }}
                      >
                        <span className="text-xs font-medium" style={{ color: mv.color }}>{mv.area}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{mv.contains}</p>
                      </div>
                    ))}
                  </div>
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
                title={`${activeConcept}-keyword.java`}
                showLineNumbers
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* static vs Instance Comparison */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              <code className="font-mono text-blue-400">static</code> vs Instance Members
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Feature</th>
                    <th className="text-center py-3 px-3 text-blue-400 font-medium font-mono">static</th>
                    <th className="text-center py-3 px-3 text-green-400 font-medium">Instance</th>
                  </tr>
                </thead>
                <tbody>
                  {staticVsInstance.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.feature}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400">{row.staticVal}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400">{row.instanceVal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* this vs super Comparison */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              <code className="font-mono text-green-400">this</code> vs <code className="font-mono text-yellow-400">super</code>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Feature</th>
                    <th className="text-center py-3 px-3 text-green-400 font-medium font-mono">this</th>
                    <th className="text-center py-3 px-3 text-yellow-400 font-medium font-mono">super</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.feature}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400">{row.thisVal}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400">{row.superVal}</td>
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
            <Badge variant="orange">Keywords</Badge>
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
