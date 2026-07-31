'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shapes, ChevronDown, ChevronUp, Lock, Factory, Hammer, Radio, Shuffle } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const patterns = [
  {
    id: 'singleton',
    title: 'Singleton',
    icon: Lock,
    color: '#3B82F6',
    category: 'Creational',
    tagline: 'Exactly one instance',
  },
  {
    id: 'factory',
    title: 'Factory',
    icon: Factory,
    color: '#10B981',
    category: 'Creational',
    tagline: 'Defer instantiation',
  },
  {
    id: 'builder',
    title: 'Builder',
    icon: Hammer,
    color: '#F59E0B',
    category: 'Creational',
    tagline: 'Step-by-step construction',
  },
  {
    id: 'observer',
    title: 'Observer',
    icon: Radio,
    color: '#8B5CF6',
    category: 'Behavioural',
    tagline: 'Publish / subscribe',
  },
  {
    id: 'strategy',
    title: 'Strategy',
    icon: Shuffle,
    color: '#EC4899',
    category: 'Behavioural',
    tagline: 'Swappable algorithms',
  },
];

const concepts = [
  {
    id: 'singleton',
    title: 'Singleton',
    color: '#3B82F6',
    intent: 'Guarantee a class has exactly one instance and give the whole application a single access point to it.',
    problem: 'Shared resources — a connection pool, a config registry, a cache — must not be duplicated. Multiple instances would mean divergent state or exhausted resources.',
    jdkUsage: ['Runtime.getRuntime()', 'Desktop.getDesktop()', 'Logger per name in java.util.logging'],
    keyPoints: [
      'Enum singleton is the safest form — the JVM guarantees one instance',
      'Enum is immune to reflection and gives serialization safety for free',
      'Double-checked locking REQUIRES volatile, or a thread can see a half-built object',
      'Holder idiom exploits lazy class initialisation — no locks after the first access',
      'Eager static final is fine when construction is cheap and always needed',
      'Widely considered an anti-pattern: hidden global state, hard to test, hard to mock',
      'In practice prefer dependency injection with a container-managed singleton scope',
    ],
    code: `// 1. ENUM — Joshua Bloch's recommendation (Effective Java, Item 3)
public enum ConfigRegistry {
    INSTANCE;

    private final Map<String, String> settings = new ConcurrentHashMap<>();

    public String get(String key) { return settings.get(key); }
    public void set(String key, String value) { settings.put(key, value); }
}
ConfigRegistry.INSTANCE.set("env", "prod");
// Reflection-proof: Constructor.newInstance() on an enum throws
// IllegalArgumentException. Serialization-safe with no readResolve() needed.

// 2. INITIALIZATION-ON-DEMAND HOLDER — lazy, thread-safe, lock-free
public class ConnectionPool {
    private ConnectionPool() {
        if (Holder.INSTANCE != null) {          // reflection guard
            throw new IllegalStateException("Already instantiated");
        }
    }

    private static class Holder {
        static final ConnectionPool INSTANCE = new ConnectionPool();
    }

    public static ConnectionPool getInstance() {
        return Holder.INSTANCE;
    }
}
// Holder loads only on the first getInstance() call. The JVM's class
// initialisation lock makes it thread-safe with zero synchronization
// on subsequent calls.

// 3. DOUBLE-CHECKED LOCKING — volatile is NOT optional
public class Cache {
    private static volatile Cache instance;    // remove volatile and this breaks

    public static Cache getInstance() {
        if (instance == null) {                // 1st check, no lock
            synchronized (Cache.class) {
                if (instance == null) {        // 2nd check, holding the lock
                    instance = new Cache();
                }
            }
        }
        return instance;
    }
}
// Without volatile: "instance = new Cache()" is allocate, construct, assign.
// The JIT may reorder assign before construct, so another thread passes the
// first null check and returns a reference to a partially initialised object.

// 4. EAGER — simplest when the object is always needed
public class Metrics {
    private static final Metrics INSTANCE = new Metrics();
    private Metrics() {}
    public static Metrics getInstance() { return INSTANCE; }
}

// WHY THIS IS OFTEN AN ANTI-PATTERN
class OrderService {
    void place(Order o) {
        Cache.getInstance().put(o.getId(), o);   // hidden dependency
    }
}
// Nothing in the signature reveals the Cache dependency, tests cannot
// substitute a fake, and state leaks between test cases.

// Prefer explicit injection — the container manages the single instance
class OrderService {
    private final Cache cache;
    OrderService(Cache cache) { this.cache = cache; }   // visible and mockable
}`,
  },
  {
    id: 'factory',
    title: 'Factory Method',
    color: '#10B981',
    intent: 'Define an interface for creating an object, but let subclasses or a dedicated method decide which concrete class to instantiate.',
    problem: 'Calling new Concrete() couples the caller to a specific implementation. Adding a new type then means editing every call site.',
    jdkUsage: ['Calendar.getInstance()', 'NumberFormat.getInstance()', 'List.of() / Set.of()', 'Executors.newFixedThreadPool()'],
    keyPoints: [
      'Simple Factory is a static method switching on a type — not a GoF pattern, but common',
      'Factory Method proper puts the creation hook in a subclass override',
      'Abstract Factory produces families of related objects that must match',
      'Callers depend on the interface, so new implementations need no call-site edits',
      'Static factory methods can return cached instances — new always allocates',
      'They also carry intent in the name: Optional.of vs Optional.ofNullable',
      'A registry Map<String, Supplier<T>> is often cleaner than a growing switch',
    ],
    code: `// THE PROBLEM — every caller knows every concrete type
Notifier n;
if (channel.equals("email")) n = new EmailNotifier(smtpHost);
else if (channel.equals("sms")) n = new SmsNotifier(gatewayKey);
// Adding "push" means finding and editing every one of these blocks.

// SIMPLE FACTORY — centralise the decision
public class NotifierFactory {
    public static Notifier create(Channel channel) {
        return switch (channel) {
            case EMAIL -> new EmailNotifier(Config.smtpHost());
            case SMS   -> new SmsNotifier(Config.gatewayKey());
            case PUSH  -> new PushNotifier(Config.fcmToken());
        };
    }
}
Notifier notifier = NotifierFactory.create(Channel.EMAIL);
// Callers now depend only on the Notifier interface.

// REGISTRY VARIANT — extensible without touching the factory
public class NotifierRegistry {
    private static final Map<Channel, Supplier<Notifier>> REGISTRY =
        new EnumMap<>(Channel.class);

    public static void register(Channel c, Supplier<Notifier> supplier) {
        REGISTRY.put(c, supplier);
    }

    public static Notifier create(Channel c) {
        Supplier<Notifier> s = REGISTRY.get(c);
        if (s == null) throw new IllegalArgumentException("Unknown: " + c);
        return s.get();
    }
}
NotifierRegistry.register(Channel.SLACK, () -> new SlackNotifier(webhook));
// New types plug in from outside — the factory itself never changes.

// FACTORY METHOD (true GoF) — subclass decides the concrete product
public abstract class Dialog {
    protected abstract Button createButton();      // the factory method

    public void render() {
        Button b = createButton();                 // template code, unchanged
        b.onClick(this::close);
        b.draw();
    }
}

public class WebDialog extends Dialog {
    @Override protected Button createButton() { return new HtmlButton(); }
}
public class DesktopDialog extends Dialog {
    @Override protected Button createButton() { return new SwingButton(); }
}
// render() is written once; each subclass supplies its own widget.

// ABSTRACT FACTORY — families that must stay consistent
public interface UiFactory {
    Button createButton();
    Checkbox createCheckbox();
    TextField createTextField();
}

public class DarkThemeFactory implements UiFactory {
    public Button createButton()       { return new DarkButton(); }
    public Checkbox createCheckbox()   { return new DarkCheckbox(); }
    public TextField createTextField() { return new DarkTextField(); }
}
// Guarantees you never mix a DarkButton with a LightCheckbox.

// WHY STATIC FACTORIES BEAT CONSTRUCTORS
Boolean.valueOf(true);       // returns a cached instance, no allocation
Integer.valueOf(100);        // cached in -128..127
List.of("a", "b");           // returns an immutable, size-optimised impl
Optional.of(x);              // throws on null
Optional.ofNullable(x);      // tolerates null — the NAME states the contract
// A constructor cannot be named, cannot return a subtype, and cannot cache.`,
  },
  {
    id: 'builder',
    title: 'Builder',
    color: '#F59E0B',
    intent: 'Separate the construction of a complex object from its representation, so the same process can build different results step by step.',
    problem: 'A class with many optional fields forces either a telescoping set of constructors or a mutable setter-based object that can exist in an invalid state.',
    jdkUsage: ['StringBuilder', 'Stream.builder()', 'HttpClient.newBuilder()', 'Calendar.Builder', 'Locale.Builder'],
    keyPoints: [
      'Solves the telescoping-constructor problem: 4 optional fields means 16 overloads',
      'Each setter returns this, so calls chain fluently and read like prose',
      'The product\'s fields stay final — immutable once build() returns',
      'build() is the single place to validate cross-field invariants',
      'Named methods make call sites self-documenting versus positional arguments',
      'Lombok @Builder generates the whole thing from an annotation',
      'Overkill for 2-3 required parameters — a plain constructor is clearer',
    ],
    code: `// THE PROBLEM — telescoping constructors
public Pizza(Size size) { ... }
public Pizza(Size size, boolean cheese) { ... }
public Pizza(Size size, boolean cheese, boolean pepperoni) { ... }
public Pizza(Size size, boolean cheese, boolean pepperoni, boolean mushroom) { ... }

new Pizza(Size.LARGE, true, false, true, false, true);
// Which boolean is which? Swap two by accident and it still compiles.

// THE OTHER BAD OPTION — JavaBeans setters
Pizza p = new Pizza();
p.setSize(Size.LARGE);
p.setCheese(true);
// The object is mutable forever, and between new and the last setter
// it sits in a half-configured, invalid state.

// BUILDER — immutable product, readable call site
public final class Pizza {
    private final Size size;                 // required
    private final boolean cheese;            // optional
    private final boolean pepperoni;
    private final List<String> extras;

    private Pizza(Builder b) {               // private — only the Builder calls it
        this.size      = b.size;
        this.cheese    = b.cheese;
        this.pepperoni = b.pepperoni;
        this.extras    = List.copyOf(b.extras);   // defensive copy
    }

    public static Builder builder(Size size) {
        return new Builder(size);
    }

    public static class Builder {
        private final Size size;                       // required → constructor
        private boolean cheese = false;                // optional → defaults
        private boolean pepperoni = false;
        private List<String> extras = new ArrayList<>();

        public Builder(Size size) {
            this.size = Objects.requireNonNull(size, "size is required");
        }

        public Builder cheese(boolean v)    { this.cheese = v; return this; }
        public Builder pepperoni(boolean v) { this.pepperoni = v; return this; }
        public Builder extra(String e)      { this.extras.add(e); return this; }

        public Pizza build() {
            // ONE place for cross-field validation
            if (size == Size.SMALL && extras.size() > 3) {
                throw new IllegalStateException("Small pizza allows max 3 extras");
            }
            return new Pizza(this);
        }
    }
}

// Reads like a sentence, and every argument is labelled
Pizza p = Pizza.builder(Size.LARGE)
    .cheese(true)
    .pepperoni(true)
    .extra("olives")
    .extra("basil")
    .build();

// JDK EXAMPLE
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Accept", "application/json")
    .timeout(Duration.ofSeconds(10))
    .GET()
    .build();

// GENERIC BUILDER for an inheritance hierarchy (recursive self-type)
public abstract class Vehicle {
    private final int wheels;

    protected Vehicle(Builder<?> b) { this.wheels = b.wheels; }

    public abstract static class Builder<T extends Builder<T>> {
        private int wheels;

        public T wheels(int w) {
            this.wheels = w;
            return self();
        }
        protected abstract T self();          // subclass returns its own type
        public abstract Vehicle build();
    }
}
// Lets a subclass builder chain parent methods and still return its own type.

// WITH LOMBOK — same result, no boilerplate
@Builder
@Value                      // makes all fields private final, adds getters
public class Order {
    String id;
    @Builder.Default BigDecimal total = BigDecimal.ZERO;
    @Singular List<Item> items;      // generates item() and items()
}`,
  },
  {
    id: 'observer',
    title: 'Observer',
    color: '#8B5CF6',
    intent: 'Define a one-to-many dependency so that when one object changes state, all its dependents are notified automatically.',
    problem: 'The subject should not know the concrete types of everything that reacts to it. Hard-coding listeners makes the subject depend on every consumer.',
    jdkUsage: ['ActionListener / all Swing events', 'PropertyChangeListener', 'Flow.Subscriber (reactive streams)', 'java.util.Observer — deprecated in Java 9'],
    keyPoints: [
      'Subject keeps a list of observers and broadcasts on change',
      'Subject depends only on the Observer interface, never on concrete listeners',
      'java.util.Observable was deprecated in Java 9 — it was a class, not an interface',
      'Use CopyOnWriteArrayList so a listener can unsubscribe during notification',
      'A synchronous listener that throws or blocks will stall every later listener',
      'Watch for lapsed-listener leaks — forgetting to unregister pins objects in memory',
      'Notification order is not guaranteed and should never be relied upon',
    ],
    code: `// OBSERVER interface — a functional interface, so lambdas work
@FunctionalInterface
public interface OrderListener {
    void onOrderPlaced(Order order);
}

// SUBJECT
public class OrderService {
    // CopyOnWriteArrayList: iteration is snapshot-based, so a listener
    // may unsubscribe mid-notification without ConcurrentModificationException
    private final List<OrderListener> listeners = new CopyOnWriteArrayList<>();

    public void addListener(OrderListener l)    { listeners.add(l); }
    public void removeListener(OrderListener l) { listeners.remove(l); }

    public void placeOrder(Order order) {
        repository.save(order);          // the state change

        for (OrderListener l : listeners) {
            try {
                l.onOrderPlaced(order);
            } catch (RuntimeException e) {
                // Isolate failures — one bad listener must not block the rest
                log.error("listener {} failed", l.getClass(), e);
            }
        }
    }
}

// OBSERVERS — each independent, added without touching OrderService
service.addListener(order -> emailService.sendConfirmation(order));
service.addListener(order -> inventory.reserve(order.getItems()));
service.addListener(order -> analytics.track("order_placed", order.getId()));
service.addListener(auditLogger::record);

// Adding a sixth reaction requires zero changes to OrderService.

// TYPED EVENTS scale better than one method per event
public interface EventListener<E> {
    void handle(E event);
}

public class EventBus {
    private final Map<Class<?>, List<EventListener<?>>> listeners =
        new ConcurrentHashMap<>();

    public <E> void subscribe(Class<E> type, EventListener<E> l) {
        listeners.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>()).add(l);
    }

    @SuppressWarnings("unchecked")
    public <E> void publish(E event) {
        listeners.getOrDefault(event.getClass(), List.of())
                 .forEach(l -> ((EventListener<E>) l).handle(event));
    }
}
bus.subscribe(OrderPlaced.class, e -> log.info("order {}", e.orderId()));
bus.publish(new OrderPlaced("ORD-1"));

// THE LAPSED LISTENER LEAK
class Screen {
    Screen(OrderService s) {
        s.addListener(this::refresh);    // strong reference held by the service
    }
    // No removeListener on teardown → this Screen is never garbage collected,
    // along with everything it references.
}
// Fix: unregister explicitly in a close/dispose method, or hold WeakReferences.

// ASYNCHRONOUS notification — keep a slow listener off the caller's thread
public void placeOrder(Order order) {
    repository.save(order);
    listeners.forEach(l -> CompletableFuture.runAsync(() -> l.onOrderPlaced(order), pool));
}
// Trade-off: the caller no longer knows whether listeners succeeded.`,
  },
  {
    id: 'strategy',
    title: 'Strategy',
    color: '#EC4899',
    intent: 'Define a family of interchangeable algorithms, encapsulate each one, and let the client pick which to use at runtime.',
    problem: 'A growing if/else or switch over behaviour types means every new variant edits existing, already-tested code — an Open/Closed violation.',
    jdkUsage: ['Comparator passed to Collections.sort', 'ThreadPoolExecutor rejection policies', 'RoundingMode in BigDecimal', 'Collectors in Stream.collect'],
    keyPoints: [
      'Replaces conditional branching with polymorphism',
      'Since Java 8 a single-method strategy is just a lambda — no class needed',
      'Adding a variant means adding a class, not editing existing code',
      'Each strategy is independently unit-testable in isolation',
      'Strategy chooses HOW; State machines choose WHAT COMES NEXT',
      'Compare with Template Method: strategy composes, template inherits',
      'An EnumMap<Type, Strategy> is a tidy way to hold the lookup table',
    ],
    code: `// THE PROBLEM — the switch grows forever
public BigDecimal calculateFee(Payment p) {
    switch (p.getMethod()) {
        case CREDIT_CARD: return p.getAmount().multiply(new BigDecimal("0.029"));
        case UPI:         return BigDecimal.ZERO;
        case NET_BANKING: return new BigDecimal("5.00");
        // Every new method edits this method and risks the existing cases
    }
}

// STRATEGY — one interface, many implementations
public interface FeeStrategy {
    BigDecimal calculate(BigDecimal amount);
}

public class CreditCardFee implements FeeStrategy {
    private static final BigDecimal RATE = new BigDecimal("0.029");
    @Override public BigDecimal calculate(BigDecimal amount) {
        return amount.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
    }
}

public class UpiFee implements FeeStrategy {
    @Override public BigDecimal calculate(BigDecimal amount) {
        return BigDecimal.ZERO;
    }
}

public class TieredFee implements FeeStrategy {
    @Override public BigDecimal calculate(BigDecimal amount) {
        return amount.compareTo(new BigDecimal("1000")) > 0
            ? new BigDecimal("10.00")
            : new BigDecimal("25.00");
    }
}

// CONTEXT — holds a strategy, knows nothing about which one
public class PaymentProcessor {
    private final FeeStrategy feeStrategy;

    public PaymentProcessor(FeeStrategy feeStrategy) {
        this.feeStrategy = feeStrategy;         // injected
    }

    public Receipt process(BigDecimal amount) {
        BigDecimal fee = feeStrategy.calculate(amount);
        return new Receipt(amount, fee, amount.add(fee));
    }
}

new PaymentProcessor(new CreditCardFee()).process(new BigDecimal("500"));
new PaymentProcessor(new UpiFee()).process(new BigDecimal("500"));

// LOOKUP TABLE — replaces the switch, open for extension
private static final Map<Method, FeeStrategy> STRATEGIES = new EnumMap<>(Map.of(
    Method.CREDIT_CARD, new CreditCardFee(),
    Method.UPI,         new UpiFee(),
    Method.NET_BANKING, new TieredFee()
));

FeeStrategy s = STRATEGIES.getOrDefault(method, amount -> BigDecimal.ZERO);

// JAVA 8+ — a single-method strategy IS a lambda
FeeStrategy flat    = amount -> new BigDecimal("5.00");
FeeStrategy percent = amount -> amount.multiply(new BigDecimal("0.02"));
FeeStrategy free    = amount -> BigDecimal.ZERO;

// You have been using Strategy all along
List<Employee> staff = new ArrayList<>(employees);
staff.sort(Comparator.comparing(Employee::getName));      // strategy #1
staff.sort(Comparator.comparingDouble(Employee::getSalary).reversed()); // #2
// Collections.sort does not know how to compare — you inject that decision.

// The JDK's rejection policies are Strategy too
new ThreadPoolExecutor(..., new ThreadPoolExecutor.CallerRunsPolicy());
new ThreadPoolExecutor(..., new ThreadPoolExecutor.AbortPolicy());

// STRATEGY vs STATE — often confused
// Strategy: the client picks the algorithm; strategies are unaware of each other.
// State:    the object picks its own next state; states know their transitions.
//
// Strategy: "compress this with ZIP instead of RAR"
// State:    "an order moves PLACED → PAID → SHIPPED"`,
  },
];

const singletonApproaches = [
  {
    name: 'Enum',
    lazy: 'No',
    threadSafe: 'Yes',
    reflectionSafe: 'Yes',
    serializationSafe: 'Yes',
    verdict: 'Best default',
    verdictColor: '#10B981',
  },
  {
    name: 'Holder idiom',
    lazy: 'Yes',
    threadSafe: 'Yes',
    reflectionSafe: 'No',
    serializationSafe: 'Needs readResolve',
    verdict: 'Best when lazy',
    verdictColor: '#10B981',
  },
  {
    name: 'Double-checked + volatile',
    lazy: 'Yes',
    threadSafe: 'Yes',
    reflectionSafe: 'No',
    serializationSafe: 'Needs readResolve',
    verdict: 'Works, easy to get wrong',
    verdictColor: '#F59E0B',
  },
  {
    name: 'Eager static final',
    lazy: 'No',
    threadSafe: 'Yes',
    reflectionSafe: 'No',
    serializationSafe: 'Needs readResolve',
    verdict: 'Fine if always needed',
    verdictColor: '#3B82F6',
  },
  {
    name: 'synchronized getInstance()',
    lazy: 'Yes',
    threadSafe: 'Yes',
    reflectionSafe: 'No',
    serializationSafe: 'Needs readResolve',
    verdict: 'Locks on every call',
    verdictColor: '#F59E0B',
  },
  {
    name: 'Naive lazy (no sync)',
    lazy: 'Yes',
    threadSafe: 'NO',
    reflectionSafe: 'No',
    serializationSafe: 'No',
    verdict: 'Broken — do not use',
    verdictColor: '#EF4444',
  },
];

const gofCategories = [
  {
    category: 'Creational',
    color: '#3B82F6',
    concern: 'How objects get created',
    members: 'Singleton · Factory Method · Abstract Factory · Builder · Prototype',
    covered: 'Singleton, Factory, Builder',
  },
  {
    category: 'Structural',
    color: '#F59E0B',
    concern: 'How objects compose into larger structures',
    members: 'Adapter · Decorator · Facade · Proxy · Composite · Bridge · Flyweight',
    covered: '—',
  },
  {
    category: 'Behavioural',
    color: '#8B5CF6',
    concern: 'How objects communicate and distribute responsibility',
    members: 'Observer · Strategy · Command · Template Method · Iterator · State · Chain of Responsibility',
    covered: 'Observer, Strategy',
  },
];

const oftenConfused = [
  {
    a: 'Factory Method',
    b: 'Abstract Factory',
    diff: 'Factory Method creates ONE product via a subclass override. Abstract Factory creates a FAMILY of related products through one interface, guaranteeing they match.',
  },
  {
    a: 'Builder',
    b: 'Factory',
    diff: 'A factory decides WHICH class to instantiate and returns it in one call. A builder assembles ONE known class across several calls, which suits many optional parameters.',
  },
  {
    a: 'Strategy',
    b: 'State',
    diff: 'Structurally near-identical. Strategy: the client picks the algorithm and strategies never reference each other. State: the object drives its own transitions and states know what comes next.',
  },
  {
    a: 'Strategy',
    b: 'Template Method',
    diff: 'Both vary part of an algorithm. Strategy composes — swap the object at runtime. Template Method inherits — subclasses override hook methods, fixed at compile time.',
  },
  {
    a: 'Observer',
    b: 'Publish-Subscribe',
    diff: 'Observer has the subject notifying its own listeners directly. Pub/Sub inserts a broker between them, so publishers and subscribers never hold a reference to each other.',
  },
  {
    a: 'Decorator',
    b: 'Proxy',
    diff: 'Both wrap an object with the same interface. A decorator ADDS behaviour and you stack several. A proxy CONTROLS access — lazy loading, caching, permissions — usually one layer.',
  },
];

const interviewQuestions = [
  {
    q: 'What is the best way to implement a Singleton in Java?',
    a: 'An enum with a single INSTANCE constant. The JVM guarantees exactly one instance, and it is the only approach that is inherently safe against both reflection and serialization attacks — Constructor.newInstance() on an enum throws, and deserialization returns the existing constant without any readResolve(). If you need lazy initialisation, use the holder idiom: a private static nested class holding the instance, which the JVM initialises on first access under its own class-init lock, so there is no synchronization cost on later calls.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why does double-checked locking require volatile?',
    a: 'Because "instance = new Cache()" is not one operation — it allocates memory, runs the constructor, then assigns the reference. The JIT is permitted to reorder the assignment before construction finishes. Without volatile, a second thread can see a non-null instance on its unsynchronized first check and return a partially constructed object. Declaring the field volatile inserts the memory barrier that forbids that reordering and guarantees the other thread sees a fully built object.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Why is Singleton often called an anti-pattern?',
    a: 'It introduces global mutable state through a hidden dependency. A class calling Cache.getInstance() gives no hint in its signature that it depends on Cache, so the coupling is invisible. Tests cannot substitute a fake, and because the instance outlives individual tests, state leaks between them and creates order-dependent failures. The usual remedy is not to abandon single-instance semantics but to make it explicit: inject the dependency and let a DI container guarantee there is one instance.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'When would you choose Builder over a constructor?',
    a: 'When a class has several optional parameters. With four optional booleans you would otherwise need many overloads, and positional call sites like new Pizza(size, true, false, true) are unreadable and easy to transpose. Builder gives each argument a name, keeps the product immutable with final fields, and provides a single place in build() to validate cross-field invariants. For two or three required parameters a plain constructor is clearer — Builder is not free.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is the difference between Strategy and State?',
    a: 'The class diagrams are nearly identical — both delegate to an interface with interchangeable implementations. The difference is who decides and whether the implementations know about each other. In Strategy the client selects the algorithm and the strategies are mutually unaware: "sort with this Comparator". In State the object transitions itself and each state knows its valid successors: an order moving PLACED → PAID → SHIPPED. Strategy varies how something is done; State varies what is allowed next.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'How does Java 8 change the way you write these patterns?',
    a: 'Any single-method strategy collapses into a lambda, so Strategy frequently needs no classes at all — a FeeStrategy becomes amount -> amount.multiply(RATE). Observer listeners become lambdas or method references. Factories become Supplier<T> entries in a registry map, which removes the switch entirely. The patterns still exist conceptually, but much of the class scaffolding the GoF book required was working around the absence of first-class functions.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Give real examples of these patterns in the JDK.',
    a: 'Singleton: Runtime.getRuntime(). Factory: Calendar.getInstance(), List.of(), Executors.newFixedThreadPool(). Builder: StringBuilder, HttpClient.newBuilder(), Stream.builder(). Observer: every Swing ActionListener, and Flow.Subscriber for reactive streams. Strategy: any Comparator handed to Collections.sort, plus ThreadPoolExecutor rejection policies. Also worth knowing: Decorator is the whole java.io stream-wrapping design, and Iterator is the Iterable contract behind the for-each loop.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'How do you break a Singleton, and how do you defend it?',
    a: 'Three attacks. Reflection: setAccessible(true) on the private constructor and call newInstance — defend by throwing from the constructor if the instance already exists. Serialization: deserializing produces a second object — defend with a readResolve() returning the existing instance. Cloning: defend by overriding clone() to throw CloneNotSupportedException. An enum singleton is immune to all three by construction, which is precisely why it is the recommended form.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'What is the lapsed listener problem in Observer?',
    a: 'A memory leak. The subject holds strong references to its observers, so an observer that is never unregistered cannot be garbage collected — and it keeps alive everything it references, such as an entire UI screen or request context. Over time this grows unbounded. Fixes: always unregister in a matching teardown or close method, have the subject hold WeakReferences, or use a framework whose lifecycle handles deregistration for you.',
    difficulty: 'Advanced' as const,
  },
];

export default function DesignPatternsPage() {
  const [activePattern, setActivePattern] = useState('singleton');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const current = concepts.find((c) => c.id === activePattern)!;
  const meta = patterns.find((p) => p.id === activePattern)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — Design"
        title="Design"
        titleHighlight="Patterns"
        description="Singleton, Factory, Builder, Observer and Strategy — with the intent behind each, where the JDK already uses them, and how Java 8 lambdas changed the way they are written."
        icon={Shapes}
        iconColor="#8B5CF6"
        gradient="from-purple-500 via-pink-500 to-rose-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* GoF Categories */}
        <AnimatedSection delay={0.1} className="mb-12">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">The Three GoF Categories</h3>
            <p className="text-sm text-slate-400 mb-6">
              23 patterns split by what they vary. This page covers the five asked about most often.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gofCategories.map((cat) => (
                <div
                  key={cat.category}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${cat.color}25`, backgroundColor: `${cat.color}08` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold" style={{ color: cat.color }}>
                      {cat.category}
                    </h4>
                    {cat.covered !== '—' && (
                      <Badge variant="green" size="sm">
                        on this page
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2.5">{cat.concern}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{cat.members}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Pattern Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePattern(p.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activePattern === p.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p.icon className="w-5 h-5" style={{ color: p.color }} />
                  <span className="text-[9px] uppercase tracking-wider text-slate-600">{p.category}</span>
                </div>
                <div className="text-sm font-medium text-white">{p.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.tagline}</div>
                {activePattern === p.id && (
                  <motion.div
                    layoutId="activePattern"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${p.color}50` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Active Pattern */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePattern}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-14"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                  >
                    <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{current.title}</h2>
                    <p className="text-xs text-slate-500">{meta.category} pattern</p>
                  </div>
                </div>

                {/* Intent */}
                <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Intent</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{current.intent}</p>
                </div>

                {/* Problem */}
                <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Problem it solves
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed">{current.problem}</p>
                </div>

                {/* JDK usage */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Where the JDK uses it
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.jdkUsage.map((u, i) => (
                      <code
                        key={i}
                        className="text-[11px] font-mono px-2 py-1 rounded border"
                        style={{
                          borderColor: `${meta.color}25`,
                          backgroundColor: `${meta.color}0d`,
                          color: meta.color,
                        }}
                      >
                        {u}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Key points */}
                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {current.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ background: current.color }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              <CodeBlock code={current.code} title={`${activePattern}-pattern.java`} showLineNumbers />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Singleton approaches */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Six Ways to Write a Singleton</h3>
            <p className="text-sm text-slate-400 mb-6">
              Only the enum form is safe on every axis without extra work
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Approach</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Lazy</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Thread-safe</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Reflection-safe</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Serialization</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {singletonApproaches.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3">
                        <code className="text-xs font-mono text-slate-200">{row.name}</code>
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs text-slate-400">{row.lazy}</td>
                      <td
                        className={`py-2.5 px-3 text-center text-xs ${
                          row.threadSafe === 'NO' ? 'text-red-400 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {row.threadSafe}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center text-xs ${
                          row.reflectionSafe === 'Yes' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {row.reflectionSafe}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center text-xs ${
                          row.serializationSafe === 'Yes' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {row.serializationSafe}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-medium" style={{ color: row.verdictColor }}>
                        {row.verdict}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Often confused pairs */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Pairs That Get Confused</h3>
            <p className="text-sm text-slate-400 mb-6">
              These distinctions are a favourite follow-up question once you name a pattern
            </p>
            <div className="space-y-3">
              {oftenConfused.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {item.a}
                    </code>
                    <span className="text-slate-600 text-xs">vs</span>
                    <code className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {item.b}
                    </code>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.diff}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="purple">Design Patterns</Badge>
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
