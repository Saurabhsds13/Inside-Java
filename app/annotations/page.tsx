'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronDown, ChevronUp, AtSign, Scan, Wrench, Puzzle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  {
    id: 'built-in',
    title: 'Built-in Annotations',
    icon: AtSign,
    color: '#3B82F6',
    tagline: '@Override, @Deprecated, @SuppressWarnings',
  },
  {
    id: 'custom',
    title: 'Custom Annotations',
    icon: Wrench,
    color: '#10B981',
    tagline: 'Define your own metadata',
  },
  {
    id: 'reflection',
    title: 'Reflection API',
    icon: Scan,
    color: '#F59E0B',
    tagline: 'Inspect & invoke at runtime',
  },
  {
    id: 'frameworks',
    title: 'Framework Magic',
    icon: Puzzle,
    color: '#8B5CF6',
    tagline: 'How Spring/JPA use them',
  },
];

const concepts = [
  {
    id: 'built-in',
    title: 'Built-in Annotations',
    color: '#3B82F6',
    history: 'Annotations arrived in Java 5 (2004, JSR 175) — before that, metadata lived in Javadoc comments (@deprecated) or external XML (EJB deployment descriptors). The Tiger release replaced all of that with compile-time-checkable metadata embedded directly in the source.',
    keyPoints: [
      '@Override — compiler error if the method does not actually override a parent method',
      '@Deprecated — marks an API obsolete; since Java 9, has forRemoval and since fields',
      '@SuppressWarnings("unchecked") — silences specific compiler warnings',
      '@FunctionalInterface — compile error if the interface has more than one abstract method',
      '@SafeVarargs — suppresses heap pollution warnings on varargs generic methods (final/private/static only)',
      '@Native — hints that the field may be referenced from native code',
      'Meta-annotations: @Retention, @Target, @Documented, @Inherited, @Repeatable',
    ],
    code: `// @Override — the most important safety net in daily Java
public class Dog extends Animal {
    @Override
    public void eat() { ... }              // compile error if typo: "eaat()"

    // Without @Override, a typo creates a NEW method silently — the bug hides
    // until runtime when polymorphism does not dispatch as expected.
}

// @Deprecated — signal to consumers
@Deprecated(since = "17", forRemoval = true)
public class SecurityManager {
    // JDK has deprecated this since Java 17, slated for removal
}

// Compiler warning: "SecurityManager is marked for removal"
new SecurityManager();

// @SuppressWarnings — silence known-safe unchecked casts
@SuppressWarnings("unchecked")
public <T> List<T> castList(List<?> raw) {
    return (List<T>) raw;                  // safe if caller guarantees T
}

// @FunctionalInterface — SAM enforcement
@FunctionalInterface
public interface Transformer<T, R> {
    R transform(T input);

    // Adding a second abstract method → immediate compile error
    // void anotherMethod();  // ERROR
}

// META-ANNOTATIONS — annotations ON annotations
@Retention(RetentionPolicy.RUNTIME)   // available via reflection
@Target(ElementType.METHOD)           // can only be placed on methods
@Documented                           // included in Javadoc
@Inherited                            // subclasses inherit this annotation
public @interface Cacheable { ... }

// RETENTION POLICIES — when the annotation exists
// SOURCE  → discarded by compiler (e.g., @SuppressWarnings, Lombok)
// CLASS   → in .class file but NOT loaded by JVM (default)
// RUNTIME → available via reflection (e.g., Spring, JPA annotations)

// TARGET options: TYPE, METHOD, FIELD, PARAMETER, CONSTRUCTOR,
//   LOCAL_VARIABLE, ANNOTATION_TYPE, PACKAGE, TYPE_PARAMETER, TYPE_USE

// @Repeatable (Java 8+) — same annotation multiple times
@Repeatable(Schedules.class)
@interface Schedule { String cron(); }

@interface Schedules { Schedule[] value(); }

@Schedule(cron = "0 0 * * *")
@Schedule(cron = "0 12 * * *")
public void backup() { ... }`,
  },
  {
    id: 'custom',
    title: 'Creating Custom Annotations',
    color: '#10B981',
    history: 'Custom annotations let library authors define domain-specific metadata. Spring\'s @Transactional, JUnit\'s @Test, Jackson\'s @JsonProperty — all custom annotations that their respective processors interpret at compile time or runtime.',
    keyPoints: [
      'Defined with @interface — looks like an interface but the compiler treats it as metadata',
      'Elements look like methods but are really named key-value pairs with optional defaults',
      'Allowed element types: primitives, String, Class, enums, annotations, and arrays of those',
      'No inheritance — annotations cannot extend other annotations',
      'value() is special: if it is the only element, the name can be omitted at the use site',
      'Annotation processors (javax.annotation.processing) run at COMPILE time — generate code',
      'Runtime processors use reflection (getAnnotation) — this is how Spring/JPA work',
    ],
    code: `// BASIC CUSTOM ANNOTATION
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RateLimit {
    int maxRequests() default 100;          // element with a default
    int windowSeconds() default 60;
    String key() default "";                // empty = derive from method name
}

// Usage
@RateLimit(maxRequests = 10, windowSeconds = 30)
public Response searchUsers(String query) { ... }

// MARKER ANNOTATION — no elements, presence IS the signal
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Singleton { }

@Singleton
public class AppConfig { ... }

// ANNOTATION WITH value() — shorthand syntax
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface JsonAlias {
    String[] value();              // because it's named "value", usage is cleaner
}

@JsonAlias({"user_name", "userName"})     // no "value =" needed
private String username;

// COMPOSED ANNOTATIONS — Spring-style meta-annotations
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Service                                   // existing Spring annotation
@Transactional(readOnly = true)
public @interface ReadOnlyService { }      // one annotation = two behaviours

@ReadOnlyService
public class ReportService { ... }

// COMPILE-TIME PROCESSING (generates code, no runtime cost)
@SupportedAnnotationTypes("com.example.Builder")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class BuilderProcessor extends AbstractProcessor {
    @Override
    public boolean process(Set<? extends TypeElement> annotations,
                           RoundEnvironment roundEnv) {
        for (Element e : roundEnv.getElementsAnnotatedWith(Builder.class)) {
            generateBuilderClass(e);      // writes a .java file
        }
        return true;
    }
}
// Examples: Lombok, MapStruct, Dagger — all work this way.
// Zero reflection, zero runtime overhead.

// VALIDATION ANNOTATION (Bean Validation / Jakarta)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Constraint(validatedBy = PhoneValidator.class)
public @interface ValidPhone {
    String message() default "Invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value != null && value.matches("\\\\+?\\\\d{10,15}");
    }
}`,
  },
  {
    id: 'reflection',
    title: 'Reflection API (java.lang.reflect)',
    color: '#F59E0B',
    history: 'Reflection has existed since JDK 1.1 (1997) — originally for JavaBeans inspection and IDE tooling. It became the backbone of every major framework: Hibernate (field mapping), Spring (DI and AOP), JUnit (test discovery), Jackson (serialization). Java 9\'s module system (JPMS) restricted deep reflection with --add-opens, and Java 16 made setAccessible on JDK internals throw by default.',
    keyPoints: [
      'Class<?> is the entry point: obtained via .class literal, getClass(), or Class.forName()',
      'Inspect: getDeclaredFields(), getDeclaredMethods(), getConstructors(), getAnnotations()',
      'getXxx() returns only public members; getDeclaredXxx() returns all (including private)',
      'setAccessible(true) bypasses access checks — the "god mode" of Java (restricted since Java 16)',
      'Method.invoke(obj, args) calls any method dynamically — used by Spring AOP proxies',
      'Constructor.newInstance() creates objects without knowing the class at compile time',
      'Performance: reflection is 5-50x slower than direct calls due to lack of JIT inlining',
      'Security: Java 9+ module system restricts cross-module reflection without --add-opens',
    ],
    code: `// OBTAINING A CLASS OBJECT
Class<?> c1 = String.class;                    // compile-time known
Class<?> c2 = "hello".getClass();              // from an instance
Class<?> c3 = Class.forName("java.util.HashMap"); // from a string (throws if missing)

// INSPECTING FIELDS
Class<?> clazz = User.class;
Field[] allFields = clazz.getDeclaredFields();    // including private
for (Field f : allFields) {
    System.out.printf("%s %s %s%n",
        Modifier.toString(f.getModifiers()),       // "private final"
        f.getType().getSimpleName(),               // "String"
        f.getName());                              // "email"
}

// READING/WRITING PRIVATE FIELDS
Field emailField = User.class.getDeclaredField("email");
emailField.setAccessible(true);                   // bypass "private"
String email = (String) emailField.get(userInstance);
emailField.set(userInstance, "new@email.com");

// INVOKING METHODS
Method m = String.class.getMethod("toUpperCase");
String result = (String) m.invoke("hello");       // "HELLO"

// With parameters
Method sub = String.class.getMethod("substring", int.class, int.class);
String r = (String) sub.invoke("Hello World", 0, 5);  // "Hello"

// CREATING INSTANCES
Constructor<User> ctor = User.class.getDeclaredConstructor(String.class, int.class);
ctor.setAccessible(true);
User u = ctor.newInstance("Alice", 30);

// READING ANNOTATIONS AT RUNTIME
Method handler = Controller.class.getMethod("getUser", String.class);
if (handler.isAnnotationPresent(RateLimit.class)) {
    RateLimit rl = handler.getAnnotation(RateLimit.class);
    int max = rl.maxRequests();
    int window = rl.windowSeconds();
    // enforce the rate limit before calling the handler
}

// GENERIC TYPE INSPECTION (type erasure workaround)
Field listField = Repo.class.getDeclaredField("users");
ParameterizedType pt = (ParameterizedType) listField.getGenericType();
Type elementType = pt.getActualTypeArguments()[0];  // User.class
// This is how Jackson/Gson figure out List<User> at runtime

// PERFORMANCE — reflection is slow
// Direct call:     ~2 ns
// Reflection:      ~100 ns (50x slower, no JIT inlining)
// For hot paths, cache Method/Field objects or use MethodHandle (Java 7+)

MethodHandle mh = MethodHandles.lookup()
    .findVirtual(String.class, "length", MethodType.methodType(int.class));
int len = (int) mh.invokeExact("hello");   // ~5 ns — JIT can inline this

// JAVA 9+ MODULE RESTRICTIONS
// module java.base does NOT export sun.misc to your code.
// Field f = Unsafe.class.getDeclaredField("theUnsafe");
// f.setAccessible(true);  // InaccessibleObjectException since Java 16
// Fix: --add-opens java.base/sun.misc=ALL-UNNAMED (JVM flag)`,
  },
  {
    id: 'frameworks',
    title: 'How Frameworks Use Annotations + Reflection',
    color: '#8B5CF6',
    history: 'Before annotations (pre-Java 5), Spring used XML, EJB used deployment descriptors, and Hibernate used .hbm.xml mapping files. Annotations eliminated hundreds of lines of XML per project and made configuration "live" next to the code it affects — a principle called Convention over Configuration.',
    keyPoints: [
      'Spring DI: scans for @Component/@Service at startup, reads constructors, injects dependencies',
      'Spring AOP: creates proxies (JDK dynamic proxy or CGLIB) that intercept @Transactional calls',
      'JPA/Hibernate: reads @Entity, @Column, @OneToMany to build SQL and map ResultSets to objects',
      'JUnit 5: finds all @Test methods via reflection, creates instances, invokes with lifecycle hooks',
      'Jackson: reads @JsonProperty/@JsonIgnore to decide serialization; falls back to getter/setter names',
      'Lombok: operates at compile time via annotation processors — zero reflection at runtime',
      'The cost: runtime scanning at startup adds ~1-3 seconds in large Spring Boot apps',
    ],
    code: `// HOW SPRING COMPONENT SCAN WORKS (simplified)
public class Scanner {
    public List<Class<?>> scan(String basePackage) {
        // 1. Convert package to filesystem path
        // 2. Find all .class files
        // 3. Load each with Class.forName()
        // 4. Check for @Component, @Service, @Repository, @Controller
        List<Class<?>> beans = new ArrayList<>();
        for (Class<?> c : findClasses(basePackage)) {
            if (c.isAnnotationPresent(Component.class) ||
                c.isAnnotationPresent(Service.class)) {
                beans.add(c);
            }
        }
        return beans;
    }
}

// HOW SPRING INJECTS DEPENDENCIES
public Object createBean(Class<?> clazz) {
    Constructor<?> ctor = findInjectableConstructor(clazz);
    // Resolve each parameter type from the container
    Object[] args = Arrays.stream(ctor.getParameterTypes())
        .map(type -> container.getBean(type))
        .toArray();
    return ctor.newInstance(args);
}

// HOW @Transactional WORKS (proxy interception)
// Spring creates a PROXY around your service:
// Client → Proxy → begin TX → YourService.method() → commit TX
// The proxy intercepts the call, checks for @Transactional,
// opens a connection, begins, calls the real method, commits/rollbacks.

// HOW JPA MAPS ANNOTATIONS TO SQL
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String name;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;
}
// Hibernate reads these at startup:
// 1. @Entity → register as a managed type
// 2. @Table → map to "users" table
// 3. @Column → build INSERT/UPDATE SQL with column names
// 4. @OneToMany → generate JOIN queries, create lazy proxy for orders

// HOW JUNIT 5 DISCOVERS AND RUNS TESTS
// 1. Scan classpath for classes with @Test methods
// 2. For each test class:
//      a. Call constructor (or @BeforeAll if static)
//      b. For each @Test method:
//           - Create fresh instance (isolation)
//           - Run @BeforeEach
//           - Invoke the test method via reflection
//           - Catch AssertionError → mark as failure
//           - Run @AfterEach
// 3. @ExtendWith hooks into lifecycle for mocking, DB rollback, etc.

// HOW JACKSON SERIALIZES
// 1. Get Class<?> of the object
// 2. Find all getters (or @JsonProperty fields)
// 3. For each field: invoke getter via reflection (or field access)
// 4. Write field name + value to JSON output
// 5. @JsonIgnore → skip, @JsonProperty("name") → use that key
ObjectMapper mapper = new ObjectMapper();
String json = mapper.writeValueAsString(user);
// All powered by reflection + annotation reading at the core`,
  },
];

const retentionPolicies = [
  {
    policy: 'SOURCE',
    availableAt: 'Source code only',
    erasedAt: 'Compilation',
    examples: '@Override, @SuppressWarnings, Lombok annotations',
    useCase: 'Compile-time checks, code generation',
    color: '#3B82F6',
  },
  {
    policy: 'CLASS',
    availableAt: '.class file (bytecode)',
    erasedAt: 'Class loading',
    examples: 'Default if unspecified, some bytecode tools',
    useCase: 'Bytecode analysis (rarely needed by applications)',
    color: '#F59E0B',
  },
  {
    policy: 'RUNTIME',
    availableAt: 'JVM at runtime (via reflection)',
    erasedAt: 'Never',
    examples: '@Entity, @Autowired, @Test, @JsonProperty',
    useCase: 'Framework processing — DI, ORM, serialization, test discovery',
    color: '#10B981',
  },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is the difference between @Retention SOURCE, CLASS, and RUNTIME?',
    a: 'SOURCE: discarded by the compiler — exists only in .java source (e.g., @Override, Lombok). CLASS: stored in the .class file but NOT loaded by the JVM at runtime — useful for bytecode tools. RUNTIME: loaded and accessible via reflection — this is what Spring, JPA, JUnit, and Jackson use. If you need to read an annotation with getAnnotation(), it MUST be RUNTIME.',
    difficulty: 'Beginner',
  },
  {
    q: 'Can you access private fields/methods via reflection?',
    a: 'Yes, by calling setAccessible(true) on the Field or Method object. This bypasses Java access control. However, since Java 9 (JPMS), accessing members of a module that has not opened its package to your module throws InaccessibleObjectException unless --add-opens is specified. Since Java 16, strong encapsulation is the default for JDK internals (no access to sun.misc.Unsafe without a flag).',
    difficulty: 'Intermediate',
  },
  {
    q: 'Why is reflection considered slow?',
    a: 'Reflection bypasses compile-time type information, so the JIT cannot inline or optimize the calls. Each Method.invoke() involves: access check, boxing/unboxing of arguments, dynamic dispatch through the Method object, and no possibility of constant folding. This costs ~50-100ns per call vs ~2ns for a direct call. For hot paths, cache the Method/Field objects and prefer MethodHandle (Java 7+) which the JIT CAN inline after warmup.',
    difficulty: 'Intermediate',
  },
  {
    q: 'How does Spring create beans using reflection?',
    a: 'At startup, Spring scans the classpath for @Component-annotated classes. For each, it finds the constructor (preferring @Autowired or the single constructor), resolves parameter types against the container, calls Constructor.newInstance(args) to create the bean, then injects @Autowired fields/setters via Field.set() or Method.invoke(). For @Transactional and AOP, it wraps the bean in a JDK Proxy or CGLIB subclass that intercepts method calls.',
    difficulty: 'Advanced',
  },
  {
    q: 'What is the difference between getDeclaredMethods() and getMethods()?',
    a: 'getMethods() returns all PUBLIC methods: those declared in the class AND those inherited from superclasses and interfaces. getDeclaredMethods() returns ALL methods (public, private, protected, package-private) declared IN THIS CLASS ONLY — not inherited ones. Use getDeclaredMethods if you need private methods; use getMethods if you want the full public API including parents.',
    difficulty: 'Beginner',
  },
  {
    q: 'How do annotation processors differ from runtime reflection?',
    a: 'Annotation processors run at COMPILE TIME as part of javac. They can generate new source files but cannot modify existing ones. They have zero runtime cost because their annotations can be @Retention(SOURCE). Examples: Lombok, MapStruct, Dagger. Runtime reflection reads @Retention(RUNTIME) annotations while the app is running — it is more flexible (can inspect third-party code) but adds startup time and invocation cost.',
    difficulty: 'Advanced',
  },
  {
    q: 'What problems did Java 9 modules cause for reflection?',
    a: 'Before modules, any code could reflect on any class. Java 9 introduced strong encapsulation: a module must explicitly "opens" a package for other modules to reflect on its types. Spring and Hibernate, which deeply reflect on user classes, required opens directives or --add-opens JVM flags. This is why Spring Boot 3+ requires Java 17+ and uses compile-time ahead-of-time (AOT) processing as an alternative to runtime reflection.',
    difficulty: 'Advanced',
  },
  {
    q: 'How does JUnit 5 discover and run test methods?',
    a: 'The JUnit Platform scans the classpath for classes. For each class, it uses getDeclaredMethods() to find methods annotated with @Test. It creates a fresh instance per test method (isolation). Before each test, it runs @BeforeEach methods. It then invokes the @Test method via Method.invoke(). If it throws AssertionError → failure. If it throws any other exception → error. Extensions (@ExtendWith) hook into this lifecycle via callbacks.',
    difficulty: 'Intermediate',
  },
];

export default function AnnotationsPage() {
  const [activeConcept, setActiveConcept] = useState('built-in');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — Metaprogramming"
        title="Annotations &"
        titleHighlight="Reflection"
        description="The metadata system that powers every modern Java framework — from @Override's compile-time safety (Java 5) to Spring's runtime component scanning. Understand the magic behind the magic."
        icon={Tag}
        iconColor="#10B981"
        gradient="from-emerald-500 via-green-500 to-teal-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Retention Policies Visual */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Retention Policies — When Does the Annotation Exist?</h3>
            <p className="text-sm text-slate-400 mb-6">
              The single most important decision when creating an annotation — determines WHO can read it
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {retentionPolicies.map((rp) => (
                <div
                  key={rp.policy}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${rp.color}25`, backgroundColor: `${rp.color}08` }}
                >
                  <code className="text-sm font-mono font-semibold" style={{ color: rp.color }}>
                    {rp.policy}
                  </code>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Available at</p>
                      <p className="text-xs text-slate-300">{rp.availableAt}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Erased at</p>
                      <p className="text-xs text-slate-300">{rp.erasedAt}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Examples</p>
                      <p className="text-xs text-slate-400">{rp.examples}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Use case</p>
                      <p className="text-xs text-slate-400">{rp.useCase}</p>
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
                    layoutId="activeAnnotation"
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

                <div className="mb-5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Historical Context</p>
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
            <Badge variant="green">Annotations & Reflection</Badge>
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
