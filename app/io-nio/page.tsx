'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileInput, ChevronDown, ChevronUp, FileText, Workflow, HardDrive, FolderTree } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';
import StatBar from '@/components/ui/StatBar';

const topics = [
  {
    id: 'io-streams',
    title: 'I/O Streams',
    icon: FileText,
    color: '#3B82F6',
    tagline: 'Byte & character streams since JDK 1.0',
  },
  {
    id: 'readers-writers',
    title: 'Readers & Writers',
    icon: FileText,
    color: '#10B981',
    tagline: 'Character encoding aware',
  },
  {
    id: 'nio',
    title: 'NIO Channels & Buffers',
    icon: Workflow,
    color: '#F59E0B',
    tagline: 'Non-blocking I/O since JDK 1.4',
  },
  {
    id: 'path-files',
    title: 'Path & Files API',
    icon: FolderTree,
    color: '#8B5CF6',
    tagline: 'Modern file ops since Java 7',
  },
];

const concepts = [
  {
    id: 'io-streams',
    title: 'Java I/O Streams (java.io)',
    color: '#3B82F6',
    history: 'Part of Java since day one — James Gosling designed the original java.io in Oak (1991-95). The Decorator pattern wrapping was revolutionary for 1995 but later criticized for its verbosity.',
    keyPoints: [
      'Two hierarchies: InputStream/OutputStream (bytes) and Reader/Writer (chars)',
      'The Decorator pattern in action: wrap a base stream with buffering, filtering, counting, etc.',
      'InputStream.read() blocks until data arrives, EOF, or IOException — there is no timeout',
      'flush() pushes buffered data to the OS; close() flushes then releases the file descriptor',
      'Byte streams are for binary (images, serialized objects); char streams handle encoding',
      'AutoCloseable since Java 7 — always use try-with-resources for I/O',
      'System.in/out/err are the three JVM-wide streams, set once at startup by the JVM',
    ],
    code: `// THE DECORATOR PATTERN — the design principle behind java.io
// Base:    FileInputStream      (reads raw bytes from a file)
// Wrapped: BufferedInputStream  (adds an internal 8KB buffer)
// Wrapped: DataInputStream      (adds readInt(), readDouble(), etc.)
InputStream raw      = new FileInputStream("data.bin");
InputStream buffered = new BufferedInputStream(raw, 8192);
DataInputStream data = new DataInputStream(buffered);
int magic = data.readInt();     // reads 4 bytes from the buffer at once

// WHY buffering matters (kernel-to-user context switch is expensive)
// Without buffer: 1 million read() calls → 1 million syscalls
// With buffer:    1 million read() calls → ~125 syscalls (8KB pages)

// BYTE STREAMS — binary I/O (images, serialized objects, raw protocols)
try (FileOutputStream fos = new FileOutputStream("output.bin")) {
    fos.write(0xCA);
    fos.write(0xFE);
    fos.write(new byte[]{0x42, 0x41, 0x42, 0x45});
    fos.flush();   // force OS write, even if not closed yet
}

// COPYING a file — the classic pre-NIO pattern
try (InputStream in  = new BufferedInputStream(new FileInputStream(src));
     OutputStream out = new BufferedOutputStream(new FileOutputStream(dst))) {
    byte[] buf = new byte[8192];
    int len;
    while ((len = in.read(buf)) != -1) {   // -1 signals EOF
        out.write(buf, 0, len);
    }
}
// Modern alternative (Java 9+): in.transferTo(out);

// WHY close() matters
// Every open file = one file descriptor. OS has a limit (ulimit -n on Linux).
// Leaking streams → "Too many open files" crash under load.
// try-with-resources guarantees close in REVERSE declaration order.

// SYSTEM STREAMS — set by the JVM at boot
System.out.println("stdout");   // PrintStream, auto-flushing on newline
System.err.println("stderr");   // unbuffered for error immediacy
int b = System.in.read();       // blocks, waits for keyboard/pipe input

// Redirect programmatically (useful for testing)
System.setOut(new PrintStream(new FileOutputStream("log.txt")));`,
  },
  {
    id: 'readers-writers',
    title: 'Readers & Writers (Character Streams)',
    color: '#10B981',
    history: 'Added in JDK 1.1 (1997) because the original byte streams had no concept of character encoding. Before Reader, reading Japanese text on an English OS corrupted data silently.',
    keyPoints: [
      'Reader/Writer handle char[], not byte[] — they convert bytes ↔ chars using a Charset',
      'InputStreamReader is the bridge: takes an InputStream + Charset, produces chars',
      'Default charset was platform-dependent until Java 18 — now defaults to UTF-8',
      'BufferedReader adds readLine() and the 8192-char internal buffer',
      'PrintWriter adds printf/println with optional auto-flush on newline',
      'Files.newBufferedReader() is the modern factory — combines Path + Charset + BufferedReader',
      'Never use FileReader without specifying a charset — it used the platform default silently',
    ],
    code: `// THE BRIDGE — InputStreamReader converts bytes → chars with a known encoding
try (Reader reader = new InputStreamReader(
        new FileInputStream("data.csv"), StandardCharsets.UTF_8)) {
    int ch;
    while ((ch = reader.read()) != -1) {    // returns a Unicode code point
        System.out.print((char) ch);
    }
}

// BUFFERED — the practical way to read text files
try (BufferedReader br = new BufferedReader(
        new InputStreamReader(
            new FileInputStream("notes.txt"), StandardCharsets.UTF_8))) {
    String line;
    while ((line = br.readLine()) != null) {   // null = EOF
        process(line);
    }
}

// MODERN (Java 8+ with Streams)
try (Stream<String> lines = Files.lines(Path.of("notes.txt"), StandardCharsets.UTF_8)) {
    lines.filter(l -> !l.isBlank())
         .map(String::trim)
         .forEach(System.out::println);
}
// Lazy — reads one line at a time, does not load entire file into memory

// WRITING text
try (BufferedWriter bw = Files.newBufferedWriter(
        Path.of("output.txt"), StandardCharsets.UTF_8,
        StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
    bw.write("Line 1");
    bw.newLine();       // platform-independent newline
    bw.write("Line 2");
}

// PrintWriter — convenient but hides IOExceptions (returns checkError())
try (PrintWriter pw = new PrintWriter(
        Files.newBufferedWriter(Path.of("log.txt"), StandardCharsets.UTF_8))) {
    pw.println("Timestamp: " + Instant.now());
    pw.printf("User: %s, Score: %d%n", name, score);
}

// WHY CHARSET MATTERS
byte[] bytes = {(byte)0xC3, (byte)0xA9};  // UTF-8 for 'é'
new String(bytes, StandardCharsets.UTF_8);    // "é" — correct
new String(bytes, StandardCharsets.ISO_8859_1); // "Ã©" — mojibake!

// Java 18+ changed the default charset from platform-specific to UTF-8
// Before: Windows → Windows-1252, Linux → UTF-8, Mac → UTF-8
// After:  UTF-8 everywhere — predictable, portable

// READ ENTIRE SMALL FILE at once (convenience — use for < ~10MB)
String content = Files.readString(Path.of("config.json"));    // Java 11+
List<String> allLines = Files.readAllLines(Path.of("data.csv")); // Java 7+`,
  },
  {
    id: 'nio',
    title: 'NIO — Channels & Buffers (java.nio)',
    color: '#F59E0B',
    history: 'JSR 51 (JDK 1.4, 2002) introduced New I/O to solve two problems old I/O could not: non-blocking/multiplexed network I/O and memory-mapped files. Later NIO.2 (Java 7, JSR 203) added the Path/Files API for filesystem operations.',
    keyPoints: [
      'Channel is the NIO equivalent of a Stream — but bidirectional and can be non-blocking',
      'Buffer is a fixed-size block of memory: position, limit, capacity — flip() switches read/write',
      'FileChannel supports memory-mapped files, file locks, and zero-copy transfers',
      'Selector multiplexes many channels on one thread — the foundation of Netty/Mina',
      'Direct ByteBuffer lives off-heap, avoids one copy on I/O, but allocation is expensive',
      'MappedByteBuffer maps a file region into virtual memory — the OS manages paging',
      'transferTo/transferFrom can move data inside the kernel without touching user space',
    ],
    code: `// BUFFER MECHANICS — the core concept of NIO
//   0 <= position <= limit <= capacity
ByteBuffer buf = ByteBuffer.allocate(1024);   // heap buffer
// After allocate: position=0, limit=1024, capacity=1024

buf.put((byte) 72);   // 'H'
buf.put((byte) 105);  // 'i'
// Now: position=2, limit=1024

buf.flip();            // SWITCH from writing to reading
// Now: position=0, limit=2  ← "there are 2 bytes to read"

while (buf.hasRemaining()) {
    System.out.print((char) buf.get());   // prints "Hi"
}

buf.clear();           // reset for next write cycle (position=0, limit=capacity)
// compact() keeps unread data and shifts it to the start — for partial reads

// CHANNEL + BUFFER — reading a file
try (FileChannel ch = FileChannel.open(Path.of("data.bin"), StandardOpenOption.READ)) {
    ByteBuffer buffer = ByteBuffer.allocate(8192);
    while (ch.read(buffer) != -1) {     // fills buffer from channel
        buffer.flip();                   // switch to read mode
        processBytes(buffer);            // consume
        buffer.compact();                // shift leftover, prepare for next read
    }
}

// DIRECT BUFFER — off-heap, avoids one JVM→kernel copy
ByteBuffer direct = ByteBuffer.allocateDirect(64 * 1024);
// Advantages: faster I/O, not moved by GC (stable address for native calls)
// Disadvantages: allocation is ~10x slower, no array() access, GC cleanup is delayed
// Rule: allocate once, reuse many times. Do NOT create direct buffers per-request.

// ZERO-COPY FILE TRANSFER — data never enters user space
try (FileChannel src = FileChannel.open(Path.of("big.mp4"), StandardOpenOption.READ);
     FileChannel dst = FileChannel.open(Path.of("copy.mp4"),
         StandardOpenOption.WRITE, StandardOpenOption.CREATE)) {
    src.transferTo(0, src.size(), dst);
    // Under the hood: sendfile() on Linux — the kernel copies directly in page cache
}

// MEMORY-MAPPED FILE — treat a file as a byte array backed by the page cache
try (FileChannel ch = FileChannel.open(Path.of("huge.dat"), StandardOpenOption.READ)) {
    MappedByteBuffer mmap = ch.map(FileChannel.MapMode.READ_ONLY, 0, ch.size());
    // No explicit read — the OS loads pages on demand via page faults
    int first = mmap.getInt(0);           // random access, no seek
    int last  = mmap.getInt((int) ch.size() - 4);
}
// Ideal for: large files, random access patterns, shared memory between processes

// SELECTOR — multiplexing (the Reactor pattern)
Selector selector = Selector.open();
ServerSocketChannel server = ServerSocketChannel.open();
server.bind(new InetSocketAddress(8080));
server.configureBlocking(false);
server.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select();                    // blocks until at least one channel is ready
    for (SelectionKey key : selector.selectedKeys()) {
        if (key.isAcceptable()) handleAccept(key);
        if (key.isReadable())   handleRead(key);
    }
    selector.selectedKeys().clear();
}
// One thread handles thousands of connections — the basis of Netty, Node.js, nginx`,
  },
  {
    id: 'path-files',
    title: 'Path & Files API (NIO.2)',
    color: '#8B5CF6',
    history: 'JSR 203 (Java 7, 2011) — a complete replacement for java.io.File, which had numerous design flaws: no exceptions on failure (just returned false), no support for symlinks, no filesystem abstraction, platform-inconsistent behavior.',
    keyPoints: [
      'Path replaces File — immutable, null-safe, supports resolve/relativize/normalize',
      'Files is the utility class — 60+ static methods for every common file operation',
      'FileSystem abstraction allows zip files, in-memory FS, and remote FS implementations',
      'WatchService monitors directories for changes — replaces polling or OS-specific hacks',
      'Files.walk() and Files.find() return lazy Streams, must be closed (use try-with-resources)',
      'File attributes via Files.readAttributes() — creation time, permissions, owner',
      'Atomic moves (ATOMIC_MOVE) for safe file replacements in concurrent environments',
    ],
    code: `// PATH — immutable, composable, platform-aware
Path home   = Path.of(System.getProperty("user.home"));
Path config = home.resolve(".config").resolve("app.yml");   // /home/user/.config/app.yml
Path relative = home.relativize(config);                    // .config/app.yml
Path normalized = Path.of("/a/b/../c").normalize();         // /a/c
config.getFileName();    // app.yml
config.getParent();      // /home/user/.config
config.toAbsolutePath(); // resolves against CWD

// WHY Path replaced File
File f = new File("/missing/file.txt");
f.delete();     // returns false — WHY? Permission? Missing? Who knows!

Files.delete(Path.of("/missing/file.txt"));
// Throws NoSuchFileException with a message — actionable

// COMMON OPERATIONS — all in the Files utility
Files.exists(path);
Files.isRegularFile(path);
Files.size(path);
Files.createDirectories(path);            // mkdir -p, no error if exists
Files.copy(src, dst, StandardCopyOption.REPLACE_EXISTING);
Files.move(src, dst, StandardCopyOption.ATOMIC_MOVE);      // rename atomically
Files.delete(path);                       // throws if missing
Files.deleteIfExists(path);               // silent if missing

// READ/WRITE shortcuts
String json = Files.readString(Path.of("config.json"));            // Java 11+
byte[] bytes = Files.readAllBytes(Path.of("image.png"));
Files.writeString(Path.of("out.txt"), content, StandardCharsets.UTF_8);
Files.write(Path.of("data.bin"), byteArray);

// WALKING a directory tree — lazy Stream (close it!)
try (Stream<Path> tree = Files.walk(Path.of("src"), Integer.MAX_VALUE)) {
    List<Path> javaFiles = tree
        .filter(p -> p.toString().endsWith(".java"))
        .toList();
}

// FIND with a BiPredicate
try (Stream<Path> found = Files.find(Path.of("."), 10,
        (path, attrs) -> attrs.isRegularFile() && path.toString().endsWith(".log"))) {
    found.forEach(System.out::println);
}

// WATCH SERVICE — filesystem notifications
try (WatchService watcher = FileSystems.getDefault().newWatchService()) {
    Path dir = Path.of("./uploads");
    dir.register(watcher, StandardWatchEventKinds.ENTRY_CREATE);
    while (true) {
        WatchKey key = watcher.take();            // blocks until event
        for (WatchEvent<?> event : key.pollEvents()) {
            Path created = dir.resolve((Path) event.context());
            System.out.println("New file: " + created);
        }
        key.reset();
    }
}

// TEMP FILES — secure, unique, auto-cleaned
Path tmp = Files.createTempFile("upload-", ".dat");
// Creates in OS temp dir with restricted permissions
// Delete manually or register a shutdown hook

// FILE ATTRIBUTES
BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
attrs.creationTime();
attrs.lastModifiedTime();
attrs.size();
attrs.isSymbolicLink();`,
  },
];

const evolution = [
  { version: 'JDK 1.0 (1996)', feature: 'java.io — InputStream, OutputStream, File', impact: 'Blocking byte streams, the Decorator architecture' },
  { version: 'JDK 1.1 (1997)', feature: 'Reader/Writer, InputStreamReader', impact: 'Character encoding support, bridge classes' },
  { version: 'JDK 1.4 (2002)', feature: 'java.nio — Channels, Buffers, Selector', impact: 'Non-blocking I/O, memory-mapped files, scalable servers' },
  { version: 'Java 7 (2011)', feature: 'NIO.2 — Path, Files, WatchService, try-with-resources', impact: 'Replaced File, added filesystem abstraction, safer resource mgmt' },
  { version: 'Java 8 (2014)', feature: 'Files.lines(), Files.list(), Files.walk() return Stream', impact: 'Lazy file processing integrated with Stream API' },
  { version: 'Java 9 (2017)', feature: 'InputStream.transferTo(OutputStream)', impact: 'One-liner copying without manual buffer loops' },
  { version: 'Java 11 (2018)', feature: 'Files.readString(), Files.writeString()', impact: 'Read/write whole text files in one call' },
  { version: 'Java 18 (2022)', feature: 'Default charset changed to UTF-8 (JEP 400)', impact: 'Consistent behaviour across all platforms' },
];

const ioVsNio = [
  { aspect: 'Unit of work', io: 'Stream (byte by byte or buffered)', nio: 'Buffer (block of data)' },
  { aspect: 'Direction', io: 'Unidirectional (in OR out)', nio: 'Bidirectional Channel' },
  { aspect: 'Blocking', io: 'Always blocks', nio: 'Can be non-blocking' },
  { aspect: 'Multiplexing', io: 'One thread per stream', nio: 'Selector: one thread, many channels' },
  { aspect: 'Memory-mapped files', io: 'Not supported', nio: 'MappedByteBuffer' },
  { aspect: 'Zero-copy', io: 'Not available', nio: 'transferTo/transferFrom' },
  { aspect: 'File metadata', io: 'File (limited, no exceptions)', nio: 'Path + Files (rich, throws)' },
  { aspect: 'Best for', io: 'Simple file reads, line-by-line text', nio: 'High-perf servers, large files, async' },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is the difference between InputStream and Reader?',
    a: 'InputStream reads raw bytes (0-255); Reader reads characters (Unicode code points). Reader uses a Charset to decode bytes into chars. Use InputStream for binary data (images, serialized objects) and Reader for text. InputStreamReader is the bridge that wraps an InputStream with a Charset and produces chars.',
    difficulty: 'Beginner',
  },
  {
    q: 'Why should you always use try-with-resources for I/O?',
    a: 'Every open stream holds an OS file descriptor. If close() is never called — because an exception was thrown, or the developer forgot — the descriptor leaks. The OS has a per-process limit (typically 1024 on Linux); exhaust it and the JVM cannot open files, sockets, or even log errors. try-with-resources guarantees close() in reverse order regardless of exceptions, and handles suppressed exceptions correctly.',
    difficulty: 'Beginner',
  },
  {
    q: 'What is a ByteBuffer flip() and when do you call it?',
    a: 'flip() sets limit = position, then position = 0. You call it when you switch from writing into the buffer to reading from it. After a channel.read(buf) fills the buffer, flip() makes the written range available for consumption. Without flip(), a subsequent get() would read from the current (end) position and see nothing. After reading, call clear() or compact() to prepare for the next write cycle.',
    difficulty: 'Intermediate',
  },
  {
    q: 'What is the advantage of a direct ByteBuffer over a heap ByteBuffer?',
    a: 'A direct buffer lives outside the Java heap in native memory, so the OS can read/write it directly without copying to a JVM-managed array first. This eliminates one memory copy on every I/O operation. However, allocation is 10-100x slower and it is not GC-friendly — allocation and deallocation happen via Unsafe or Cleaner, not standard GC. Use direct buffers for long-lived, frequently-reused I/O buffers (e.g., network channel reads), not for short-lived per-request work.',
    difficulty: 'Advanced',
  },
  {
    q: 'How does a Selector enable one thread to handle thousands of connections?',
    a: 'A Selector wraps the OS-level poll/epoll/kqueue. You register non-blocking channels with interest in OP_ACCEPT, OP_READ, or OP_WRITE. select() blocks until at least one channel is ready. The thread then iterates only the ready channels and processes their events. This is the Reactor pattern — one thread drives I/O for thousands of idle connections, because idle sockets cost almost nothing when multiplexed. Netty, Tomcat NIO, and Node.js all use this model.',
    difficulty: 'Advanced',
  },
  {
    q: 'Why did Java 7 replace java.io.File with Path and Files?',
    a: 'File had serious design flaws: delete/rename returned boolean with no indication of WHY failure occurred. It had no support for symbolic links. Behavior differed across platforms. It offered no filesystem abstraction (could not work with zip files or in-memory FS). Path is immutable and rich (resolve, relativize, normalize). Files provides 60+ methods that throw meaningful exceptions, support atomic operations, and integrate with the Stream API for lazy directory walking.',
    difficulty: 'Intermediate',
  },
  {
    q: 'What is memory-mapped I/O and when is it beneficial?',
    a: 'MappedByteBuffer maps a file region directly into the process virtual address space. Reads become memory accesses — the OS loads pages on demand via page faults and caches them in the page cache. No explicit read syscalls are needed. It is beneficial for: large files with random access patterns (databases, indexes), shared memory between processes, and read-heavy workloads where the OS page cache is warm. It is not helpful for sequential small-file reads where BufferedInputStream is simpler and equally fast.',
    difficulty: 'Advanced',
  },
  {
    q: 'What changed with JEP 400 (Java 18) regarding charsets?',
    a: 'Before Java 18, the default charset was platform-dependent: UTF-8 on Linux/Mac, Windows-1252 on Windows. Code that relied on the default without specifying a charset would produce different results across platforms — text written on Windows and read on Linux could be corrupted. JEP 400 made UTF-8 the universal default. This finally made Java I/O behaviour consistent and portable without requiring StandardCharsets.UTF_8 everywhere, though specifying it explicitly remains best practice for clarity.',
    difficulty: 'Intermediate',
  },
];

export default function IoNioPage() {
  const [activeConcept, setActiveConcept] = useState('io-streams');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Intermediate — I/O Mastery"
        title="Java I/O"
        titleHighlight="& NIO"
        description="From James Gosling's original java.io decorator streams (1996) through NIO channels and buffers (2002) to the modern Path/Files API — the complete evolution of how Java reads and writes data."
        icon={FileInput}
        iconColor="#F59E0B"
        gradient="from-amber-500 via-orange-500 to-red-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Evolution Timeline */}
        <AnimatedSection delay={0.1} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">The Evolution of Java I/O</h3>
            <p className="text-sm text-slate-400 mb-6">
              From Oak&apos;s byte streams (1995) to UTF-8-by-default (2022) — each release addressed a real pain point
            </p>
            <div className="space-y-2">
              {evolution.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <code className="text-[11px] font-mono text-amber-400 font-medium">{item.version}</code>
                  <span className="text-xs text-slate-300">{item.feature}</span>
                  <span className="text-xs text-slate-500">{item.impact}</span>
                </motion.div>
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
                    layoutId="activeIO"
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

                {/* Historical context */}
                <div className="mb-5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Historical Context</p>
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

        {/* I/O vs NIO Comparison */}
        <AnimatedSection delay={0.2} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              <code className="font-mono text-blue-400">java.io</code> vs{' '}
              <code className="font-mono text-amber-400">java.nio</code>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Aspect</th>
                    <th className="text-left py-3 px-3 text-blue-400 font-medium">java.io (Streams)</th>
                    <th className="text-left py-3 px-3 text-amber-400 font-medium">java.nio (Channels)</th>
                  </tr>
                </thead>
                <tbody>
                  {ioVsNio.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/[0.04]">
                      <td className="py-2.5 px-3 text-slate-300 text-xs">{row.aspect}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.io}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{row.nio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </AnimatedSection>

        {/* Performance context */}
        <AnimatedSection delay={0.25} className="mb-14">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">When Each Approach Wins</h3>
            <p className="text-sm text-slate-400 mb-6">Relative throughput for common scenarios</p>
            <div className="space-y-4">
              <StatBar label="Small text file, line-by-line (BufferedReader)" value={90} color="#3B82F6" showValue={false} />
              <StatBar label="Large binary copy (FileChannel.transferTo)" value={98} color="#F59E0B" showValue={false} />
              <StatBar label="Random access in large file (MappedByteBuffer)" value={95} color="#8B5CF6" showValue={false} />
              <StatBar label="10k concurrent connections (Selector)" value={92} color="#10B981" showValue={false} />
              <StatBar label="10k connections (thread-per-connection old I/O)" value={15} color="#EF4444" showValue={false} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * For small sequential reads, BufferedReader and BufferedInputStream are perfectly adequate — NIO adds complexity for no gain. NIO shines for large files, concurrent connections, and zero-copy scenarios.
            </p>
          </GlassCard>
        </AnimatedSection>

        {/* Interview Questions */}
        <AnimatedSection delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Interview Questions</h2>
            <Badge variant="orange">I/O & NIO</Badge>
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
