'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronDown, ChevronUp, Layers, KeyRound, Lock, FileKey } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  { id: 'classloader', title: 'ClassLoader Security', icon: Layers, color: '#3B82F6', tagline: 'Loading, linking, isolation' },
  { id: 'security-manager', title: 'Security Manager (Legacy)', icon: ShieldAlert, color: '#EF4444', tagline: 'Deprecated in Java 17' },
  { id: 'crypto', title: 'Cryptography APIs', icon: KeyRound, color: '#10B981', tagline: 'JCA, hashing, encryption' },
  { id: 'secure-coding', title: 'Secure Coding', icon: FileKey, color: '#F59E0B', tagline: 'Input validation, secrets' },
];

const concepts = [
  {
    id: 'classloader',
    title: 'ClassLoader & Class Loading Security',
    color: '#3B82F6',
    history: 'The ClassLoader hierarchy was Java\'s original sandboxing mechanism (1996). Applets from the internet loaded through a restricted ClassLoader that could not access local files. The parent-delegation model ensures JDK classes cannot be spoofed — if you create your own java.lang.String, the bootstrap loader already loaded the real one, so yours is never used. Java 9 modules (JPMS) replaced much of what ClassLoaders used to enforce.',
    keyPoints: [
      'Three built-in loaders: Bootstrap (JDK core) → Platform (extensions) → Application (classpath)',
      'Parent delegation: a loader asks its parent first — prevents user code from replacing JDK classes',
      'Each ClassLoader defines a namespace — same class name loaded by two loaders = two distinct types',
      'Enables hot-reload (app servers): unload old ClassLoader, load a fresh one for the new WAR',
      'Class.forName() uses the caller\'s ClassLoader; Thread.getContextClassLoader() for SPI/framework use',
      'Java 9 modules add "exports" and "opens" — finer-grained access control than ClassLoaders alone',
      'ClassLoader leaks (one reference pins all classes) are the #1 cause of Metaspace OOM in app servers',
      'Custom ClassLoaders enable: encryption of bytecode, dynamic class generation, plugin architectures',
    ],
    code: `// THE PARENT DELEGATION MODEL
// 1. AppClassLoader receives loadClass("com.myapp.Service")
// 2. Delegates UP to PlatformClassLoader → delegates UP to BootstrapClassLoader
// 3. Bootstrap: "I don't have it" → Platform: "I don't have it"
// 4. AppClassLoader: searches the classpath → finds Service.class → loads it
//
// If you create your own java.lang.String:
// 1. AppClassLoader delegates UP → Bootstrap already has java.lang.String
// 2. Bootstrap returns the REAL String → your fake is never loaded
// This is why you CANNOT replace JDK classes — the delegation model prevents it.

// LOADING A CLASS PROGRAMMATICALLY
Class<?> c = Class.forName("com.myapp.Plugin");       // uses caller's ClassLoader
Object instance = c.getDeclaredConstructor().newInstance();

// CONTEXT CLASS LOADER — for framework/SPI code
ClassLoader cl = Thread.currentThread().getContextClassLoader();
Class<?> spi = cl.loadClass("com.vendor.Implementation");
// The context CL lets framework code (loaded by parent) find app code (loaded by child)

// CUSTOM CLASSLOADER — plugin isolation
public class PluginClassLoader extends ClassLoader {
    private final Path pluginDir;

    public PluginClassLoader(Path dir, ClassLoader parent) {
        super(parent);
        this.pluginDir = dir;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        Path classFile = pluginDir.resolve(name.replace('.', '/') + ".class");
        if (Files.exists(classFile)) {
            byte[] bytes = Files.readAllBytes(classFile);
            return defineClass(name, bytes, 0, bytes.length);
        }
        throw new ClassNotFoundException(name);
    }
}

// HOT RELOAD in app servers:
// 1. Old WAR's ClassLoader is dereferenced
// 2. GC collects the ClassLoader → all its classes unloaded from Metaspace
// 3. New ClassLoader created for the new WAR
// If ANYTHING holds a reference to an old class → ClassLoader leak → Metaspace OOM

// JAVA 9 MODULES — the modern access control
// module-info.java
module com.myapp {
    requires java.sql;              // depends on java.sql module
    exports com.myapp.api;          // other modules can use these packages
    opens com.myapp.model to com.fasterxml.jackson.databind;  // reflection access
}
// Without "opens": Jackson cannot reflectively access your model classes
// Without "exports": other modules cannot import your packages at compile time

// SEALED MODULES — JDK internals locked down since Java 16
// sun.misc.Unsafe, sun.reflect.* → not accessible without --add-opens
// This is why old libraries break on Java 17+ unless updated`,
  },
  {
    id: 'security-manager',
    title: 'Security Manager (Deprecated)',
    color: '#EF4444',
    history: 'The Security Manager was designed for applets (1996): sandboxed code running in a browser needed restrictions on file access, network, and reflection. It was deprecated in Java 17 (JEP 411) because: 1) applets are dead, 2) it was never used correctly by server apps, 3) its performance cost was non-trivial, 4) the module system provides better encapsulation. It will be removed in a future release.',
    keyPoints: [
      'SecurityManager.checkPermission() was called before dangerous operations (file, net, exec)',
      'Configured via .policy files granting Permission objects to CodeSource locations',
      'Deprecated since Java 17 (JEP 411) — throws UnsupportedOperationException if enabled in Java 24+',
      'Never widely adopted for server-side: too complex to configure, too easy to get wrong',
      'Modern replacement: container isolation (Docker), OS-level sandboxing (seccomp, AppArmor)',
      'For code-level access control: Java modules (exports/opens) replace what SecurityManager did',
      'Libraries that called System.getSecurityManager() now need to handle its absence',
    ],
    code: `// HOW IT WORKED (pre-deprecation)
// SecurityManager checked every dangerous operation:
// - File read/write → FilePermission
// - Network connect  → SocketPermission
// - System.exit()    → RuntimePermission("exitVM")
// - Reflection       → ReflectPermission("suppressAccessChecks")

// Policy file (java.policy)
// grant codeBase "file:/path/to/trusted.jar" {
//     permission java.io.FilePermission "/data/-", "read,write";
//     permission java.net.SocketPermission "api.example.com:443", "connect";
// };

// Code was protected like this (JDK internal):
public void connect(InetAddress addr, int port) {
    SecurityManager sm = System.getSecurityManager();
    if (sm != null) {
        sm.checkConnect(addr.getHostAddress(), port);  // throws SecurityException
    }
    // proceed with connection
}

// WHY IT FAILED
// 1. Granularity was too fine — hundreds of permission types, easy to misconfigure
// 2. Performance: every file/net/reflect op called checkPermission()
// 3. "Ambient authority" model: all code on the classpath has the same privileges
//    unless you carefully separate code sources — nobody did
// 4. Applets died with Flash in ~2015; server apps never adopted it
// 5. Third-party libraries had no clue how to set up policies

// MODERN ALTERNATIVES FOR ISOLATION
// 1. Containers (Docker): restrict filesystem, network, capabilities at OS level
// 2. Java Modules: "exports" controls compile-time access; "opens" controls reflection
// 3. OS sandboxing: Linux seccomp-bpf, AppArmor, SELinux
// 4. Process isolation: untrusted code in a separate JVM process with limited privileges

// JAVA 17+ BEHAVIOR
System.setSecurityManager(new SecurityManager());
// Java 17: prints a warning at startup
// Java 18+: throws UnsupportedOperationException
// Future: removed entirely

// If your library called System.getSecurityManager():
SecurityManager sm = System.getSecurityManager();
if (sm != null) {           // always null on Java 18+
    sm.checkRead(path);     // dead code path
}
// Migration: just remove these checks — they do nothing on modern Java`,
  },
  {
    id: 'crypto',
    title: 'Java Cryptography (JCA/JCE)',
    color: '#10B981',
    history: 'The Java Cryptography Architecture (JCA) shipped with JDK 1.1. The extension (JCE) was separate due to US export regulations on strong crypto — limited to 128-bit keys until 2000. Since JDK 9, unlimited-strength crypto is the default. The provider-based architecture lets you swap implementations (BouncyCastle, AWS CloudHSM) without changing application code.',
    keyPoints: [
      'Provider architecture: algorithms requested by name, implementation resolved at runtime',
      'MessageDigest: one-way hashes (SHA-256, SHA-512). Never use MD5/SHA-1 for security.',
      'Cipher: symmetric (AES-GCM) and asymmetric (RSA) encryption/decryption',
      'KeyPairGenerator + KeyFactory: RSA/EC key generation and reconstruction',
      'Signature: digital signatures for integrity + authentication (SHA256withRSA, Ed25519)',
      'SecureRandom: cryptographically strong PRNG — always use this for tokens/keys, never Math.random()',
      'KeyStore: protected storage for private keys and certificates (PKCS12 format since Java 9)',
      'Always use AES-GCM (authenticated encryption) — not AES-ECB or AES-CBC without HMAC',
    ],
    code: `// HASHING — MessageDigest (one-way, irreversible)
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest("password123".getBytes(StandardCharsets.UTF_8));
String hex = HexFormat.of().formatHex(hash);
// Use for: checksums, integrity verification, password storage (with salt + iterations)

// PASSWORD HASHING — NEVER plain SHA-256. Use PBKDF2 or bcrypt.
SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
PBEKeySpec spec = new PBEKeySpec(
    password.toCharArray(),
    salt,                    // random 16+ bytes per user
    310_000,                 // iterations (OWASP 2023 recommendation)
    256                      // key length in bits
);
byte[] hashed = skf.generateSecret(spec).getEncoded();
// Store: salt + iterations + hash. Verify: re-derive and compare.

// SYMMETRIC ENCRYPTION — AES-256-GCM (authenticated encryption)
KeyGenerator keyGen = KeyGenerator.getInstance("AES");
keyGen.init(256);
SecretKey key = keyGen.generateKey();

// Encrypt
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
byte[] iv = new byte[12];                              // 96-bit IV for GCM
SecureRandom.getInstanceStrong().nextBytes(iv);
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] ciphertext = cipher.doFinal(plaintext);
// Store: iv + ciphertext (GCM tag is appended automatically)

// Decrypt
cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
byte[] decrypted = cipher.doFinal(ciphertext);
// GCM verifies integrity — tampered data throws AEADBadTagException

// ASYMMETRIC — RSA key pair
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair kp = kpg.generateKeyPair();
PublicKey pub = kp.getPublic();
PrivateKey priv = kp.getPrivate();

// Sign with private key
Signature sig = Signature.getInstance("SHA256withRSA");
sig.initSign(priv);
sig.update(data);
byte[] signature = sig.sign();

// Verify with public key
sig.initVerify(pub);
sig.update(data);
boolean valid = sig.verify(signature);

// SECURE RANDOM — for tokens, nonces, salts
SecureRandom sr = SecureRandom.getInstanceStrong();
byte[] token = new byte[32];
sr.nextBytes(token);    // 256 bits of cryptographic randomness
// NEVER use Math.random() or new Random() for security-sensitive values

// KEYSTORE — protected key storage
KeyStore ks = KeyStore.getInstance("PKCS12");
ks.load(new FileInputStream("keystore.p12"), storePassword);
PrivateKey pk = (PrivateKey) ks.getKey("mykey", keyPassword);
Certificate cert = ks.getCertificate("mykey");

// COMMON MISTAKES
// 1. AES/ECB/PKCS5Padding → ECB mode leaks patterns. ALWAYS use GCM or CBC+HMAC.
// 2. Hardcoded keys in source → use env vars, Vault, or KMS
// 3. Reusing IV/nonce with same key → catastrophic in GCM (reveals plaintext)
// 4. Math.random() for tokens → predictable. Use SecureRandom.
// 5. MD5 or SHA-1 for anything security-related → broken, use SHA-256+`,
  },
  {
    id: 'secure-coding',
    title: 'Secure Coding Practices',
    color: '#F59E0B',
    history: 'The OWASP Top 10, CERT Java Secure Coding Standard, and Oracle\'s Secure Coding Guidelines for Java form the foundation of Java security practices. Many Java-specific vulnerabilities stem from: deserialization (covered in Topic 15), SQL injection via string concatenation, path traversal via user-controlled filenames, and information leakage via exception messages.',
    keyPoints: [
      'Input validation: never trust user input. Validate, sanitize, or reject at the boundary.',
      'SQL injection: always use PreparedStatement (parameterized queries), never concatenate',
      'Path traversal: normalize paths and verify they stay within the expected directory',
      'Secrets management: never hardcode passwords/keys. Use env vars, Vault, or cloud KMS.',
      'Least privilege: request only the permissions you need, validate authorization at every layer',
      'Exception handling: log full stack traces internally, return generic errors to clients',
      'Immutability: return defensive copies of mutable internal state (dates, arrays, collections)',
      'Dependency security: keep libraries updated (Snyk, Dependabot), pin versions exactly',
    ],
    code: `// SQL INJECTION — the #1 web vulnerability
// BAD — string concatenation, trivially exploitable
String query = "SELECT * FROM users WHERE name = '" + userInput + "'";
// Input: ' OR '1'='1' --  → dumps entire table

// GOOD — parameterized query (PreparedStatement)
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM users WHERE name = ? AND status = ?");
ps.setString(1, userInput);    // safely escaped by the driver
ps.setString(2, "active");
ResultSet rs = ps.executeQuery();

// PATH TRAVERSAL — user controls a filename
// BAD
Path file = Path.of("/uploads/" + userFilename);
// Input: ../../etc/passwd → reads system files!

// GOOD — normalize and verify containment
Path base = Path.of("/uploads").toAbsolutePath().normalize();
Path requested = base.resolve(userFilename).normalize();
if (!requested.startsWith(base)) {
    throw new SecurityException("Path traversal attempt: " + userFilename);
}

// INPUT VALIDATION — reject bad data at the boundary
public record CreateUser(String email, String name, int age) {
    public CreateUser {
        if (email == null || !email.matches("^[\\\\w.+-]+@[\\\\w-]+\\\\.[a-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email");
        }
        if (name == null || name.length() > 100 || name.isBlank()) {
            throw new IllegalArgumentException("Invalid name");
        }
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Invalid age");
        }
    }
}

// SECRETS — never in source code
// BAD
private static final String DB_PASSWORD = "s3cr3t";  // in Git forever

// GOOD
String dbPassword = System.getenv("DB_PASSWORD");     // injected at runtime
// Or: AWS Secrets Manager, HashiCorp Vault, Spring Cloud Config encrypted

// DEFENSIVE COPIES — protect internal mutable state
public class Period {
    private final Date start;
    private final Date end;

    public Period(Date start, Date end) {
        this.start = new Date(start.getTime());   // copy on input
        this.end = new Date(end.getTime());
        if (this.start.after(this.end)) throw new IllegalArgumentException();
    }

    public Date getStart() {
        return new Date(start.getTime());         // copy on output
    }
}
// Without copies: caller could modify the Date after passing it in.

// EXCEPTION INFORMATION LEAKAGE
// BAD — reveals internals to the attacker
catch (SQLException e) {
    return Response.status(500).entity(e.getMessage()).build();
    // Leaks table names, column info, database version
}

// GOOD — log internally, return generic error
catch (SQLException e) {
    log.error("DB error for user={}", userId, e);   // full stack trace in logs
    return Response.status(500).entity("Internal error").build();
}

// TIMING-SAFE COMPARISON — prevent timing attacks on secrets
// BAD: "token".equals(userToken) → short-circuits on first mismatch (leaks length info)
// GOOD:
MessageDigest.isEqual(expected.getBytes(), actual.getBytes());
// Compares all bytes regardless of where they differ → constant time`,
  },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  { q: 'What is the parent-delegation model in ClassLoading?', a: 'When a ClassLoader receives a request to load a class, it first delegates to its parent. The parent delegates to its parent, up to the Bootstrap loader. Only if no ancestor can find the class does the original loader attempt to load it itself. This prevents user code from replacing JDK classes — because the Bootstrap loader always loads java.lang.String first, a user-created class with the same name is never used.', difficulty: 'Intermediate' },
  { q: 'Why was the Security Manager deprecated?', a: 'JEP 411 (Java 17) deprecated it because: 1) its original purpose (applet sandboxing) is obsolete, 2) almost no server application used it correctly, 3) it imposed a runtime performance cost on every file/network/reflect operation, 4) it was notoriously complex to configure correctly, 5) modern alternatives (containers, OS sandboxing, Java modules) provide better isolation with less overhead. It will be removed in a future release.', difficulty: 'Intermediate' },
  { q: 'What is the difference between AES-ECB and AES-GCM?', a: 'ECB encrypts each block independently — identical plaintext blocks produce identical ciphertext blocks, leaking patterns (the famous "ECB penguin" image). GCM (Galois/Counter Mode) is an authenticated encryption mode: it uses a counter for each block (no pattern leakage), and appends an authentication tag that detects any tampering. Always use GCM (or CCM) for symmetric encryption. ECB should never be used for anything beyond a single block.', difficulty: 'Advanced' },
  { q: 'How does PreparedStatement prevent SQL injection?', a: 'PreparedStatement separates the SQL structure from the data. The query template (with ? placeholders) is sent to the database and compiled FIRST. Then the parameter values are sent separately and treated as DATA, never as SQL syntax. Even if the input contains \' OR 1=1 --, the database sees it as a literal string value, not as SQL code. The driver handles escaping/quoting per the database\'s rules, which is more robust than any manual sanitization.', difficulty: 'Beginner' },
  { q: 'Why should you never use Math.random() for security?', a: 'Math.random() uses java.util.Random, which is a linear congruential generator with a 48-bit seed. Given a few outputs, an attacker can reverse-engineer the seed and predict all future values — meaning they can predict your tokens, session IDs, or OTP codes. SecureRandom uses OS entropy sources (/dev/urandom on Linux) and cryptographic algorithms, making prediction computationally infeasible.', difficulty: 'Intermediate' },
  { q: 'What is a ClassLoader leak and how does it happen?', a: 'In an app server, each deployed WAR gets its own ClassLoader. When the WAR is undeployed, the ClassLoader should be garbage collected, releasing all its classes from Metaspace. But if ANY object holds a strong reference to any class from that ClassLoader (e.g., a thread-local, a static cache, a registered JDBC driver), the ClassLoader cannot be collected — and ALL classes it loaded stay in Metaspace. Redeploy 5 times and you get OutOfMemoryError: Metaspace.', difficulty: 'Advanced' },
  { q: 'What is authenticated encryption and why does it matter?', a: 'Authenticated encryption (AE) provides both confidentiality and integrity in one operation. AES-GCM produces ciphertext plus an authentication tag. On decryption, if even one bit of ciphertext or associated data was tampered with, decryption fails with AEADBadTagException rather than silently returning corrupted plaintext. Without AE, an attacker can flip ciphertext bits and the receiver decrypts garbage without knowing it was modified (bit-flipping attacks on CBC without HMAC).', difficulty: 'Advanced' },
  { q: 'How do Java 9 modules improve security over the classpath?', a: 'The classpath is flat — every class can access every other public class, and reflection can access everything via setAccessible(true). Modules introduce: 1) explicit dependencies (requires) — code cannot use undeclared modules, 2) encapsulation (exports) — only listed packages are accessible, even public classes in unexported packages are hidden, 3) reflection control (opens) — deep reflection requires explicit permission. This prevents unauthorized access to internals without the blunt instrument of a SecurityManager.', difficulty: 'Advanced' },
];

export default function SecurityPage() {
  const [activeConcept, setActiveConcept] = useState('classloader');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Advanced — Security"
        title="Java"
        titleHighlight="Security"
        description="ClassLoader isolation, the rise and fall of SecurityManager, JCA cryptography APIs, and secure coding practices — from parent delegation (1996) to module-based encapsulation (Java 9+)."
        icon={ShieldAlert}
        iconColor="#EF4444"
        gradient="from-red-500 via-orange-500 to-amber-500"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatedSection delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {topics.map((topic) => (
              <button key={topic.id} onClick={() => setActiveConcept(topic.id)} className={`relative p-4 rounded-xl border transition-all duration-300 text-left ${activeConcept === topic.id ? 'border-white/[0.15] bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'}`}>
                <topic.icon className="w-5 h-5 mb-2" style={{ color: topic.color }} />
                <div className="text-sm font-medium text-white">{topic.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{topic.tagline}</div>
                {activeConcept === topic.id && (<motion.div layoutId="activeSecurity" className="absolute inset-0 rounded-xl border-2" style={{ borderColor: `${topic.color}50` }} transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />)}
              </button>
            ))}
          </div>
        </AnimatedSection>
        <AnimatePresence mode="wait">
          <motion.div key={activeConcept} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-2">{currentConcept.title}</h2>
                <div className="mb-5 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Historical Context</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentConcept.history}</p>
                </div>
                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {currentConcept.keyPoints.map((point, i) => (<li key={i} className="flex items-start gap-2 text-sm text-slate-400"><span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: currentConcept.color }} />{point}</li>))}
                </ul>
              </GlassCard>
              <CodeBlock code={currentConcept.code} title={`${activeConcept}.java`} showLineNumbers />
            </div>
          </motion.div>
        </AnimatePresence>
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="red">Security</Badge>
          </div>
          <div className="space-y-3">
            {interviewQuestions.map((item, idx) => (
              <GlassCard key={idx} className="overflow-hidden" hover onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.difficulty === 'Beginner' ? 'green' : item.difficulty === 'Intermediate' ? 'blue' : 'purple'} size="sm">{item.difficulty}</Badge>
                    <span className="text-sm text-slate-200">{item.q}</span>
                  </div>
                  {expandedQ === idx ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </div>
                <AnimatePresence>
                  {expandedQ === idx && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><div className="px-4 pb-4 text-sm text-slate-400 border-t border-white/[0.06] pt-3">{item.a}</div></motion.div>)}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
