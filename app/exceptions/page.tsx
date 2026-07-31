'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Zap, Bug, FileWarning } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const exceptionCategories = [
  {
    id: 'hierarchy',
    title: 'Exception Hierarchy',
    description: 'Understanding the Throwable family tree — the foundation of Java error handling.',
    color: '#3B82F6',
    icon: FileWarning,
  },
  {
    id: 'checked-unchecked',
    title: 'Checked vs Unchecked',
    description: 'Compile-time vs runtime exceptions — when to use which.',
    color: '#10B981',
    icon: Shield,
  },
  {
    id: 'try-with-resources',
    title: 'Try-with-Resources',
    description: 'Automatic resource management introduced in Java 7.',
    color: '#F59E0B',
    icon: Zap,
  },
  {
    id: 'custom-exceptions',
    title: 'Custom Exceptions',
    description: 'Creating meaningful exception types for your application.',
    color: '#8B5CF6',
    icon: Bug,
  },
];

const concepts = [
  {
    id: 'hierarchy',
    title: 'Exception Hierarchy',
    color: '#3B82F6',
    keyPoints: [
      'Throwable is the root — parent of Exception and Error',
      'Error: serious JVM issues (OutOfMemoryError, StackOverflowError) — don\'t catch these',
      'Exception: recoverable problems your code should handle',
      'RuntimeException: unchecked exceptions (NullPointerException, ArrayIndexOutOfBoundsException)',
      'All other Exceptions are checked — compiler forces you to handle them',
      'Errors and RuntimeExceptions are unchecked (not enforced at compile time)',
    ],
    code: `// The Exception Hierarchy
//
//              Throwable
//              /       \\
//         Error        Exception
//         /               /        \\
// OutOfMemoryError  IOException   RuntimeException
// StackOverflowError  SQLException   /        \\
// VirtualMachineError  ClassNotFound  NullPointer  ArrayIndexOOB
//                                    IllegalArgument  ClassCastException

// Example: Catching different levels
try {
    riskyOperation();
} catch (FileNotFoundException e) {
    // Most specific first
    System.out.println("File not found: " + e.getMessage());
} catch (IOException e) {
    // Parent catches remaining IO issues
    System.out.println("IO error: " + e.getMessage());
} catch (Exception e) {
    // Catch-all (not recommended in production)
    System.out.println("Unexpected: " + e.getMessage());
}
// Never catch Error or Throwable unless you really know why`,
  },
  {
    id: 'checked-unchecked',
    title: 'Checked vs Unchecked Exceptions',
    color: '#10B981',
    keyPoints: [
      'Checked: compiler forces handling (try-catch or throws declaration)',
      'Unchecked: RuntimeException subclasses — no compiler enforcement',
      'Checked = expected failures (file not found, network down, DB error)',
      'Unchecked = programming bugs (null access, bad index, bad cast)',
      'Use checked when the caller can reasonably recover',
      'Use unchecked for programming errors that should be fixed, not caught',
    ],
    code: `// CHECKED — Compiler forces you to handle
public void readFile(String path) throws IOException {
    // Must declare "throws" or use try-catch
    BufferedReader reader = new BufferedReader(new FileReader(path));
    String line = reader.readLine();
    reader.close();
}

// Calling code MUST handle it:
try {
    readFile("data.txt");
} catch (IOException e) {
    e.printStackTrace(); // or recover gracefully
}

// UNCHECKED — No compiler enforcement
public int divide(int a, int b) {
    // ArithmeticException is unchecked
    return a / b; // throws if b == 0, but no compiler warning
}

// Common Checked Exceptions:
// IOException, SQLException, ClassNotFoundException,
// InterruptedException, FileNotFoundException

// Common Unchecked Exceptions:
// NullPointerException, ArrayIndexOutOfBoundsException,
// IllegalArgumentException, ClassCastException,
// NumberFormatException, UnsupportedOperationException`,
  },
  {
    id: 'try-with-resources',
    title: 'Try-with-Resources (Java 7+)',
    color: '#F59E0B',
    keyPoints: [
      'Automatically closes resources implementing AutoCloseable',
      'No need for explicit finally block to close resources',
      'Resources closed in reverse order of declaration',
      'Suppressed exceptions preserved (getSuppressed())',
      'Java 9+: can use effectively-final variables in try()',
      'Replaces messy try-finally-close patterns completely',
    ],
    code: `// OLD WAY (pre-Java 7) — verbose and error-prone
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("data.txt"));
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) {
        try {
            reader.close(); // What if THIS throws?
        } catch (IOException e) {
            // Exception lost — original exception masked!
        }
    }
}

// NEW WAY (Java 7+) — clean and safe
try (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}
// reader.close() called automatically, even if exception occurs!

// Multiple resources — closed in REVERSE order
try (
    Connection conn = DriverManager.getConnection(url);
    PreparedStatement ps = conn.prepareStatement(sql);
    ResultSet rs = ps.executeQuery()
) {
    while (rs.next()) {
        System.out.println(rs.getString(1));
    }
} // rs closed first, then ps, then conn

// Java 9+ enhancement — effectively final variable
BufferedReader reader = new BufferedReader(new FileReader("data.txt"));
try (reader) { // No need to redeclare!
    System.out.println(reader.readLine());
}`,
  },
  {
    id: 'custom-exceptions',
    title: 'Custom Exceptions',
    color: '#8B5CF6',
    keyPoints: [
      'Extend Exception for checked, RuntimeException for unchecked',
      'Provide meaningful error messages and context',
      'Include error codes for programmatic handling',
      'Chain exceptions using initCause() or constructor param',
      'Override getMessage() for user-friendly messages',
      'Keep exception classes simple — data holders, not logic containers',
    ],
    code: `// Custom CHECKED exception
public class InsufficientFundsException extends Exception {
    private final double balance;
    private final double amount;

    public InsufficientFundsException(double balance, double amount) {
        super(String.format(
            "Cannot withdraw %.2f. Current balance: %.2f",
            amount, balance
        ));
        this.balance = balance;
        this.amount = amount;
    }

    public double getDeficit() {
        return amount - balance;
    }
}

// Custom UNCHECKED exception with error code
public class ApiException extends RuntimeException {
    private final int errorCode;
    private final String errorId;

    public ApiException(int errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errorId = UUID.randomUUID().toString();
    }

    public ApiException(int errorCode, String message, Throwable cause) {
        super(message, cause); // Exception chaining
        this.errorCode = errorCode;
        this.errorId = UUID.randomUUID().toString();
    }

    public int getErrorCode() { return errorCode; }
    public String getErrorId() { return errorId; }
}

// Usage
public void withdraw(double amount) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException(balance, amount);
    }
    balance -= amount;
}`,
  },
];

const hierarchyTree = [
  { name: 'Throwable', level: 0, type: 'root' as const, color: '#EF4444' },
  { name: 'Error', level: 1, type: 'error' as const, color: '#EF4444' },
  { name: 'OutOfMemoryError', level: 2, type: 'error' as const, color: '#EF4444' },
  { name: 'StackOverflowError', level: 2, type: 'error' as const, color: '#EF4444' },
  { name: 'VirtualMachineError', level: 2, type: 'error' as const, color: '#EF4444' },
  { name: 'Exception', level: 1, type: 'checked' as const, color: '#3B82F6' },
  { name: 'IOException', level: 2, type: 'checked' as const, color: '#3B82F6' },
  { name: 'SQLException', level: 2, type: 'checked' as const, color: '#3B82F6' },
  { name: 'ClassNotFoundException', level: 2, type: 'checked' as const, color: '#3B82F6' },
  { name: 'RuntimeException', level: 2, type: 'unchecked' as const, color: '#10B981' },
  { name: 'NullPointerException', level: 3, type: 'unchecked' as const, color: '#10B981' },
  { name: 'ArrayIndexOutOfBoundsException', level: 3, type: 'unchecked' as const, color: '#10B981' },
  { name: 'IllegalArgumentException', level: 3, type: 'unchecked' as const, color: '#10B981' },
  { name: 'ClassCastException', level: 3, type: 'unchecked' as const, color: '#10B981' },
];

const bestPractices = [
  { label: 'Catch specific exceptions, not generic Exception', good: true },
  { label: 'Never swallow exceptions (empty catch block)', good: false },
  { label: 'Use try-with-resources for AutoCloseable resources', good: true },
  { label: 'Throw early, catch late', good: true },
  { label: 'Catching Throwable or Error in application code', good: false },
  { label: 'Log exception with full stack trace', good: true },
  { label: 'Using exceptions for flow control', good: false },
  { label: 'Include context in exception messages', good: true },
  { label: 'Declaring throws Exception (too generic)', good: false },
  { label: 'Chain exceptions to preserve root cause', good: true },
];

const interviewQuestions = [
  {
    q: 'What is the difference between checked and unchecked exceptions?',
    a: 'Checked exceptions are enforced at compile time (must be caught or declared with throws). They extend Exception directly. Unchecked exceptions extend RuntimeException and are not enforced by the compiler. Use checked for recoverable conditions, unchecked for programming errors.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'Can we have try without catch?',
    a: 'Yes. You can have try-finally (without catch) or try-with-resources (without catch or finally). The try block needs at least one catch OR a finally block, or it must be a try-with-resources statement.',
    difficulty: 'Beginner' as const,
  },
  {
    q: 'What happens if both try and finally blocks throw exceptions?',
    a: 'The exception from the finally block is thrown, and the original exception from the try block is lost (suppressed). In try-with-resources, the original exception is preserved and the close() exception becomes a suppressed exception (accessible via getSuppressed()).',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'What is exception chaining and why is it important?',
    a: 'Exception chaining wraps the original exception as the cause of a new exception using initCause() or the constructor. It preserves the root cause while providing context at each layer. Without chaining, you lose the original stack trace, making debugging extremely difficult.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Can we override a method and change its exception signature?',
    a: 'An overriding method can throw fewer or narrower (subclass) checked exceptions than the parent, but NEVER more or broader checked exceptions. It can throw any unchecked exception regardless of the parent signature. This is because callers rely on the parent type\'s contract.',
    difficulty: 'Advanced' as const,
  },
  {
    q: 'Explain try-with-resources and suppressed exceptions.',
    a: 'Try-with-resources automatically closes AutoCloseable resources when the try block exits. If both the try block and close() throw exceptions, the try block exception is the primary one, and the close() exception is "suppressed" — accessible via Throwable.getSuppressed(). This solves the pre-Java 7 problem of losing the original exception.',
    difficulty: 'Intermediate' as const,
  },
  {
    q: 'Why should you not catch Throwable or Error?',
    a: 'Errors represent serious JVM problems (OutOfMemoryError, StackOverflowError) that the application usually cannot recover from. Catching them may leave the JVM in an inconsistent state. Let them propagate to terminate the program cleanly. Only catch Error in very specific cases like application servers that need graceful shutdown.',
    difficulty: 'Advanced' as const,
  },
];

export default function ExceptionsPage() {
  const [activeConcept, setActiveConcept] = useState('hierarchy');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [highlightType, setHighlightType] = useState<string | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Beginner — Error Handling"
        title="Exception"
        titleHighlight="Handling"
        description="Exception hierarchy, checked vs unchecked, try-with-resources, and custom exceptions — handling errors gracefully is what separates junior from senior developers."
        icon={AlertTriangle}
        iconColor="#EF4444"
        gradient="from-red-500 via-orange-500 to-yellow-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Exception Hierarchy Visualization */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Exception Hierarchy Tree</h3>
                <p className="text-sm text-slate-400 mt-1">Click a type to highlight its family</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHighlightType(highlightType === 'error' ? null : 'error')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all ${
                    highlightType === 'error'
                      ? 'border-red-500/40 bg-red-500/15 text-red-400'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Error
                </button>
                <button
                  onClick={() => setHighlightType(highlightType === 'checked' ? null : 'checked')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all ${
                    highlightType === 'checked'
                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Checked
                </button>
                <button
                  onClick={() => setHighlightType(highlightType === 'unchecked' ? null : 'unchecked')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all ${
                    highlightType === 'unchecked'
                      ? 'border-green-500/40 bg-green-500/15 text-green-400'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Unchecked
                </button>
              </div>
            </div>

            {/* Tree visualization */}
            <div className="space-y-1.5">
              {hierarchyTree.map((node, idx) => {
                const isHighlighted = !highlightType || node.type === highlightType || node.type === 'root';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isHighlighted ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="flex items-center"
                    style={{ paddingLeft: `${node.level * 2}rem` }}
                  >
                    {node.level > 0 && (
                      <span className="text-slate-600 mr-2 font-mono text-xs">
                        {node.level === 1 ? '├── ' : '│   ├── '}
                      </span>
                    )}
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-mono border transition-all"
                      style={{
                        borderColor: `${node.color}30`,
                        backgroundColor: `${node.color}10`,
                        color: node.color,
                      }}
                    >
                      {node.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Concept Selector */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {exceptionCategories.map((cat) => (
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
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</div>
                {activeConcept === cat.id && (
                  <motion.div
                    layoutId="activeException"
                    className="absolute inset-0 rounded-xl border-2"
                    style={{ borderColor: `${cat.color}50` }}
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
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-2">{currentConcept.title}</h2>
                <h3 className="text-sm font-medium text-white mb-3 mt-5">Key Points</h3>
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

        {/* Best Practices */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Best Practices — Do&apos;s and Don&apos;ts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bestPractices.map((practice, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    practice.good
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <span className={`text-lg ${practice.good ? 'text-green-400' : 'text-red-400'}`}>
                    {practice.good ? '✓' : '✗'}
                  </span>
                  <span className="text-sm text-slate-300">{practice.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Exception Handling Flow */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Exception Handling Flow</h3>
            <div className="space-y-4">
              <StatBar label="try block executes code" value={100} color="#3B82F6" showValue={false} />
              <StatBar label="Exception thrown? → JVM searches catch blocks top-down" value={85} color="#F59E0B" showValue={false} />
              <StatBar label="Matching catch found → execute catch block" value={70} color="#10B981" showValue={false} />
              <StatBar label="No match → propagate to caller (up the call stack)" value={55} color="#EF4444" showValue={false} />
              <StatBar label="finally block ALWAYS executes (except System.exit())" value={100} color="#8B5CF6" showValue={false} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * The finally block executes regardless of whether an exception was thrown or caught. The only exception is System.exit() or JVM crash.
            </p>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="red">Exceptions</Badge>
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
