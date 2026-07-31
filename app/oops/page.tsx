'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Lock, GitBranch, Layers, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const pillars = [
  {
    id: 'encapsulation',
    name: 'Encapsulation',
    icon: Lock,
    color: '#3B82F6',
    tagline: 'Data Hiding + Bundling',
    realWorld: 'A capsule medicine — different chemicals are enclosed inside a single capsule. You take the capsule (interface), not the raw chemicals (implementation).',
    keyPoints: [
      'Wrapping data (fields) and methods into a single unit (class)',
      'Access modifiers control visibility: private, protected, public, default',
      'Getters/Setters provide controlled access to private fields',
      'Protects internal state from unintended modification',
      'Enables data validation in setters',
    ],
    code: `public class BankAccount {
    private double balance;     // hidden from outside
    private String accountNo;

    public BankAccount(String accountNo, double initialBalance) {
        this.accountNo = accountNo;
        this.balance = initialBalance;
    }

    // Controlled access via getter
    public double getBalance() {
        return balance;
    }

    // Validation in setter
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        this.balance -= amount;
    }
}`,
  },
  {
    id: 'inheritance',
    name: 'Inheritance',
    icon: GitBranch,
    color: '#10B981',
    tagline: 'IS-A Relationship',
    realWorld: 'A child inherits traits from parents — eye color, height, etc. Similarly, a subclass inherits fields and methods from the parent class.',
    keyPoints: [
      'Child class (subclass) inherits from parent class (superclass)',
      'Java supports single inheritance only (one parent class)',
      'Multiple inheritance achieved via interfaces',
      'Use extends for classes, implements for interfaces',
      'super keyword to access parent class members',
      'Constructor chaining — parent constructor called first',
    ],
    code: `// Parent class
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }

    public void sleep() {
        System.out.println(name + " is sleeping");
    }
}

// Child class — inherits eat() and sleep()
public class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);  // calls parent constructor
        this.breed = breed;
    }

    // Dog-specific method
    public void bark() {
        System.out.println(name + " says: Woof!");
    }

    // Override parent method
    @Override
    public void eat() {
        System.out.println(name + " is eating dog food");
    }
}`,
  },
  {
    id: 'polymorphism',
    name: 'Polymorphism',
    icon: Layers,
    color: '#8B5CF6',
    tagline: 'Many Forms',
    realWorld: 'A person can be a student, an employee, and a parent — same person, different behaviors depending on context. Similarly, one method name can have multiple implementations.',
    keyPoints: [
      'Compile-time (Static) — Method Overloading: same name, different parameters',
      'Runtime (Dynamic) — Method Overriding: child provides its own implementation',
      'Enables writing flexible, extensible code',
      'Parent reference can hold child objects (upcasting)',
      'JVM decides which method to call at runtime (late binding)',
      'Operator overloading NOT supported in Java (except + for String)',
    ],
    code: `// Compile-time Polymorphism (Overloading)
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
}

// Runtime Polymorphism (Overriding)
public class Shape {
    public double area() { return 0; }
}

public class Circle extends Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }

    @Override
    public double area() { return Math.PI * radius * radius; }
}

public class Rectangle extends Shape {
    private double width, height;
    public Rectangle(double w, double h) { width = w; height = h; }

    @Override
    public double area() { return width * height; }
}

// Usage — parent reference, child object
Shape shape1 = new Circle(5);
Shape shape2 = new Rectangle(4, 6);

// JVM calls the correct area() at runtime
System.out.println(shape1.area()); // 78.54
System.out.println(shape2.area()); // 24.0`,
  },
  {
    id: 'abstraction',
    name: 'Abstraction',
    icon: Eye,
    color: '#F59E0B',
    tagline: 'Hiding Complexity',
    realWorld: 'When you drive a car, you use the steering wheel and pedals (interface) without knowing the engine internals (implementation). Abstraction hides the "how" and shows the "what".',
    keyPoints: [
      'Show only essential features, hide implementation details',
      'Achieved via abstract classes and interfaces',
      'Abstract class: can have both abstract and concrete methods',
      'Interface: 100% abstraction (pre-Java 8), now can have default/static methods',
      'Cannot instantiate abstract classes or interfaces directly',
      'Forces subclasses to provide implementations',
    ],
    code: `// Abstract class — partial abstraction
public abstract class Payment {
    protected double amount;

    public Payment(double amount) {
        this.amount = amount;
    }

    // Abstract method — subclass MUST implement
    public abstract boolean processPayment();

    // Concrete method — shared logic
    public void printReceipt() {
        System.out.println("Payment of ₹" + amount + " processed");
    }
}

// Interface — full abstraction
public interface Refundable {
    boolean initiateRefund(double amount);
    default String getRefundPolicy() {
        return "Refund within 7 days";
    }
}

// Concrete implementation
public class UPIPayment extends Payment implements Refundable {
    private String upiId;

    public UPIPayment(double amount, String upiId) {
        super(amount);
        this.upiId = upiId;
    }

    @Override
    public boolean processPayment() {
        System.out.println("Processing UPI payment to " + upiId);
        return true; // simulate success
    }

    @Override
    public boolean initiateRefund(double amount) {
        System.out.println("Refunding ₹" + amount + " to " + upiId);
        return true;
    }
}`,
  },
];

const interviewQuestions = [
  {
    q: 'What is the difference between Abstraction and Encapsulation?',
    a: 'Abstraction hides complexity (what an object does), while Encapsulation hides data (how it does it). Abstraction is achieved using abstract classes/interfaces; Encapsulation uses access modifiers.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Why does Java not support multiple inheritance with classes?',
    a: 'To avoid the Diamond Problem — if two parent classes have the same method, the compiler cannot decide which one to call. Java solves this with interfaces (which allow default method conflict resolution since Java 8).',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Can we override static methods in Java?',
    a: 'No. Static methods belong to the class, not the object. They are resolved at compile time (method hiding, not overriding). If a subclass defines the same static method, it hides the parent version.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What is covariant return type?',
    a: 'Since Java 5, an overriding method can return a subtype of the return type declared in the parent method. For example, if parent returns Object, child can return String.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Explain the difference between IS-A and HAS-A relationships.',
    a: 'IS-A = Inheritance (Dog IS-A Animal). HAS-A = Composition (Car HAS-A Engine). Favor composition over inheritance for flexible, loosely-coupled designs.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What is method dispatch in the context of polymorphism?',
    a: 'Method dispatch is the mechanism by which the JVM determines which method implementation to call. Static dispatch happens at compile time (overloading). Dynamic dispatch happens at runtime using the vtable (overriding).',
    difficulty: 'Advanced' as const,
  },
];

export default function OopsPage() {
  const [activePillar, setActivePillar] = useState('encapsulation');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentPillar = pillars.find((p) => p.id === activePillar)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — Core Foundation"
        title="OOPs"
        titleHighlight="Concepts"
        description="The four pillars of Object-Oriented Programming in Java — Encapsulation, Inheritance, Polymorphism, and Abstraction. The foundation of every Java interview."
        icon={Boxes}
        iconColor="#3B82F6"
        gradient="from-blue-500 via-cyan-500 to-green-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Pillar Selector */}
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {pillars.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setActivePillar(pillar.id)}
                className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${
                  activePillar === pillar.id
                    ? 'border-white/[0.15] bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                }`}
              >
                <pillar.icon
                  className="w-5 h-5 mb-2"
                  style={{ color: pillar.color }}
                />
                <div className="text-sm font-medium text-white">{pillar.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{pillar.tagline}</div>
                {activePillar === pillar.id && (
                  <motion.div
                    layoutId="activePillar"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${pillar.color}50` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Active Pillar Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Left — Explanation */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${currentPillar.color}15`, border: `1px solid ${currentPillar.color}30` }}
                  >
                    <currentPillar.icon className="w-5 h-5" style={{ color: currentPillar.color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{currentPillar.name}</h2>
                    <p className="text-xs text-slate-500">{currentPillar.tagline}</p>
                  </div>
                </div>

                {/* Real World Analogy */}
                <div className="mb-5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-xs font-medium text-slate-300 mb-1">🌍 Real-World Analogy</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{currentPillar.realWorld}</p>
                </div>

                {/* Key Points */}
                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {currentPillar.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: currentPillar.color }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Right — Code */}
              <div>
                <CodeBlock
                  code={currentPillar.code}
                  title={`${currentPillar.name}.java`}
                  showLineNumbers
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* OOP Relationships Visualization */}
        <AnimatedSection delay={0.2} className="mb-16">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">OOP Relationships at a Glance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="text-sm font-medium text-blue-400 mb-2">IS-A (Inheritance)</h4>
                <p className="text-xs text-slate-400">Dog <span className="text-blue-400">IS-A</span> Animal</p>
                <p className="text-xs text-slate-500 mt-1">extends / implements</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2">HAS-A (Composition)</h4>
                <p className="text-xs text-slate-400">Car <span className="text-green-400">HAS-A</span> Engine</p>
                <p className="text-xs text-slate-500 mt-1">Strong ownership — Engine dies with Car</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <h4 className="text-sm font-medium text-purple-400 mb-2">USES-A (Aggregation)</h4>
                <p className="text-xs text-slate-400">Department <span className="text-purple-400">USES</span> Employees</p>
                <p className="text-xs text-slate-500 mt-1">Weak ownership — Employees exist independently</p>
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="orange">OOP</Badge>
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
