'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Binary, ChevronDown, ChevronUp, FileOutput, Braces, Shield, Zap } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

const topics = [
  {
    id: 'java-serial',
    title: 'Java Serialization',
    icon: FileOutput,
    color: '#3B82F6',
    tagline: 'ObjectOutputStream since JDK 1.1',
  },
  {
    id: 'json',
    title: 'JSON (Jackson/Gson)',
    icon: Braces,
    color: '#10B981',
    tagline: 'Text-based, language-neutral',
  },
  {
    id: 'security',
    title: 'Security & Pitfalls',
    icon: Shield,
    color: '#EF4444',
    tagline: 'Deserialization attacks',
  },
  {
    id: 'alternatives',
    title: 'Protobuf & Alternatives',
    icon: Zap,
    color: '#8B5CF6',
    tagline: 'Binary, schema-driven, fast',
  },
];

const concepts = [
  {
    id: 'java-serial',
    title: 'Java Serialization (java.io.Serializable)',
    color: '#3B82F6',
    history: 'Added in JDK 1.1 (1997) to enable RMI (Remote Method Invocation) — objects could be sent across the network as byte streams. Joshua Bloch later called it "the biggest mistake in Java" due to its security surface and maintenance burden. JEP 290 (Java 9) added deserialization filters; Java 14\'s JEP 305 introduced Records as a safer serialization alternative.',
    keyPoints: [
      'Implement Serializable (marker interface, no methods) to make a class serializable',
      'serialVersionUID: if not declared, JVM computes one — any class change breaks deserialization',
      'transient fields are SKIPPED — not written to the byte stream (passwords, caches, loggers)',
      'ObjectOutputStream.writeObject() writes the entire object graph recursively',
      'Externalizable gives full control: you implement writeExternal/readExternal manually',
      'readObject()/writeObject() private methods customize default serialization (e.g., encrypt a field)',
      'readResolve() returns a replacement object after deserialization — used by Singleton',
      'Java serialization is Java-only, slow, bloated, and a massive security liability — avoid in new code',
    ],
    code: `// BASIC SERIALIZATION
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;   // explicit UID — stable across changes

    private String name;
    private int age;
    private transient String password;    // NOT serialized — sensitive data
    private transient Logger log;         // NOT serialized — non-serializable field

    // Custom hooks — encrypt before writing, decrypt after reading
    @Serial
    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();                      // write non-transient fields
        out.writeObject(encrypt(password));            // manually handle transient
    }

    @Serial
    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        this.password = decrypt((String) in.readObject());
        this.log = Logger.getLogger(getClass().getName());  // reinitialize transient
    }
}

// WRITE (serialize)
try (ObjectOutputStream oos = new ObjectOutputStream(
        new FileOutputStream("user.ser"))) {
    oos.writeObject(new User("Alice", 30, "secret123"));
}

// READ (deserialize)
try (ObjectInputStream ois = new ObjectInputStream(
        new FileInputStream("user.ser"))) {
    User user = (User) ois.readObject();
}

// serialVersionUID — WHY IT MATTERS
// If you don't declare it, the JVM computes one from class structure.
// Add a field? Computed UID changes → InvalidClassException on deserialization.
// With explicit UID: you control compatibility. Adding a field is safe (defaults to 0/null).

// SINGLETON PROTECTION — readResolve()
public class AppConfig implements Serializable {
    private static final AppConfig INSTANCE = new AppConfig();

    @Serial
    private Object readResolve() {
        return INSTANCE;    // discard the deserialized object, return the singleton
    }
}

// EXTERNALIZABLE — full manual control (faster, smaller, but more work)
public class Compact implements Externalizable {
    private int id;
    private String data;

    public Compact() {}   // required no-arg constructor

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeInt(id);
        out.writeUTF(data);    // write only what you need, in the format you choose
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException {
        id = in.readInt();
        data = in.readUTF();
    }
}

// THE BYTE FORMAT (simplified)
// Header: AC ED 00 05 (magic + version)
// Class descriptor: name, serialVersionUID, fields
// Field data: values in declaration order
// Object references: backreference handles for sharing`,
  },
  {
    id: 'json',
    title: 'JSON Serialization (Jackson & Gson)',
    color: '#10B981',
    history: 'Jackson (2007, Tatu Saloranta) became the de facto JSON library for Java enterprise. Gson (2008, Google) offered simplicity. Both use reflection + annotations to map objects ↔ JSON. Jackson adds streaming (low-level), tree model (JsonNode), and data-binding (POJO ↔ JSON) — and supports YAML, XML, CBOR, Protobuf via modules.',
    keyPoints: [
      'Jackson ObjectMapper: thread-safe, reusable — create ONCE, share across the app',
      'Data binding: readValue(json, Type.class) and writeValueAsString(obj)',
      '@JsonProperty renames fields; @JsonIgnore excludes them; @JsonCreator for immutable objects',
      'Jackson handles Records natively since 2.12 — no annotations needed for simple cases',
      'TypeReference<List<User>>() solves the generic erasure problem for collections',
      'Streaming API (JsonParser/JsonGenerator) for huge files — constant memory, no full tree',
      'Gson is simpler but slower and less actively maintained — Jackson is the industry standard',
      'Always configure: FAIL_ON_UNKNOWN_PROPERTIES = false for forward compatibility',
    ],
    code: `// JACKSON — the industry standard
ObjectMapper mapper = new ObjectMapper();
mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
mapper.registerModule(new JavaTimeModule());  // support for Instant, LocalDate, etc.

// SERIALIZE (object → JSON string)
User user = new User("Alice", 30, "alice@dev.com");
String json = mapper.writeValueAsString(user);
// {"name":"Alice","age":30,"email":"alice@dev.com"}

// Formatted output
String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(user);

// DESERIALIZE (JSON string → object)
User restored = mapper.readValue(json, User.class);

// COLLECTIONS — TypeReference solves erasure
String listJson = "[{\\"name\\":\\"Alice\\"},{\\"name\\":\\"Bob\\"}]";
List<User> users = mapper.readValue(listJson, new TypeReference<List<User>>() {});

// ANNOTATIONS
public class Order {
    @JsonProperty("order_id")           // JSON key name
    private String id;

    @JsonIgnore                          // excluded from JSON
    private String internalNote;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate created;

    @JsonInclude(JsonInclude.Include.NON_NULL)  // skip null fields
    private String coupon;
}

// IMMUTABLE OBJECTS — @JsonCreator + @JsonProperty
public class Event {
    private final String type;
    private final Instant timestamp;

    @JsonCreator
    public Event(@JsonProperty("type") String type,
                 @JsonProperty("timestamp") Instant timestamp) {
        this.type = type;
        this.timestamp = timestamp;
    }
}

// RECORDS — Jackson 2.12+ handles them out of the box
public record Point(int x, int y) {}
mapper.readValue("{\\"x\\":1,\\"y\\":2}", Point.class);  // just works

// STREAMING — for multi-GB files (constant memory)
try (JsonParser parser = mapper.getFactory().createParser(hugeFile)) {
    while (parser.nextToken() != null) {
        if (parser.currentToken() == JsonToken.START_OBJECT) {
            User u = mapper.readValue(parser, User.class);
            process(u);   // one object at a time
        }
    }
}

// TREE MODEL — when structure is unknown
JsonNode root = mapper.readTree(json);
String name = root.get("name").asText();
int age = root.path("age").asInt(0);    // path() returns MissingNode, not null

// GSON comparison
Gson gson = new GsonBuilder().setPrettyPrinting().create();
String json = gson.toJson(user);
User u = gson.fromJson(json, User.class);
// Simpler API, but less features, slower, and less maintained than Jackson.`,
  },
  {
    id: 'security',
    title: 'Serialization Security',
    color: '#EF4444',
    history: 'Java deserialization vulnerabilities have caused some of the worst exploits in enterprise history: Apache Commons Collections gadget chains (2015), Spring RCE, WebLogic RCE. The root cause: deserializing untrusted data constructs arbitrary objects and calls their readObject() — which can chain into remote code execution. This led to JEP 290 (Java 9) serialization filters and the broader industry move away from Java serialization.',
    keyPoints: [
      'Deserialization executes code: readObject(), readResolve(), finalize() — all attacker-controlled',
      'Gadget chains: attacker crafts a byte stream that instantiates dangerous classes (Runtime.exec)',
      'NEVER deserialize untrusted data with ObjectInputStream without a filter',
      'JEP 290 (Java 9): ObjectInputFilter allows/denies classes during deserialization',
      'JEP 415 (Java 17): context-specific deserialization filters for the entire JVM',
      'The fix: do not use Java serialization for external communication — use JSON, Protobuf, or Avro',
      'If you must: allowlist specific classes, limit depth/array size, reject java.lang.reflect.*',
      'Records are inherently safer: canonical constructor is the only way to create them (no readObject hook)',
    ],
    code: `// THE ATTACK — how deserialization becomes RCE
// 1. Attacker crafts a byte stream containing a "gadget chain"
// 2. Chain: InvokerTransformer → ChainedTransformer → Runtime.getRuntime().exec("rm -rf /")
// 3. When ObjectInputStream.readObject() processes the stream,
//    it reconstructs the objects and their readObject() methods execute the chain.
// 4. Result: arbitrary code execution on the server.

// THE CLASSIC GADGET (Apache Commons Collections — pre-2015 fix)
// Transformer[] transformers = new Transformer[] {
//     new ConstantTransformer(Runtime.class),
//     new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class},
//         new Object[]{"getRuntime", null}),
//     new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class},
//         new Object[]{null, null}),
//     new InvokerTransformer("exec", new Class[]{String.class},
//         new Object[]{"calc.exe"})
// };
// This is why "never deserialize untrusted data" is absolute.

// DEFENSE 1: JEP 290 — ObjectInputFilter (Java 9+)
ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(
    "com.myapp.**;" +          // allow my classes
    "java.lang.*;" +           // allow basic types
    "!*"                       // reject everything else
);

try (ObjectInputStream ois = new ObjectInputStream(input)) {
    ois.setObjectInputFilter(filter);
    Object obj = ois.readObject();     // rejects disallowed classes
}

// DEFENSE 2: JVM-wide filter (Java 17+, JEP 415)
// Set in jdk.serialFilter system property at startup:
// -Djdk.serialFilter="maxdepth=5;maxrefs=100;maxbytes=500000;!org.apache.commons.**"

// DEFENSE 3: don't use Java serialization at all
// Instead: JSON (Jackson), Protobuf, Avro, or custom binary formats.
// These do NOT execute arbitrary constructors during parsing.

// SAFE SERIALIZATION WITH RECORDS (Java 16+)
// Records have NO readObject()/readResolve() — the only way to create
// a record is through its canonical constructor, which you control.
public record Transfer(String from, String to, BigDecimal amount) {}
// Even if deserialized, it goes through the constructor → you validate.

// SERIALIZATION PROXY PATTERN (Effective Java, Item 90)
// The safest approach when Java serialization is unavoidable
public class Period implements Serializable {
    private final Date start, end;

    // Replace THIS object with a simple proxy in the stream
    @Serial
    private Object writeReplace() {
        return new SerializationProxy(this);
    }

    // Reject direct deserialization attempts
    @Serial
    private void readObject(ObjectInputStream stream) throws InvalidObjectException {
        throw new InvalidObjectException("Use proxy");
    }

    private static class SerializationProxy implements Serializable {
        private final long startMillis, endMillis;

        SerializationProxy(Period p) {
            startMillis = p.start.getTime();
            endMillis = p.end.getTime();
        }

        @Serial
        private Object readResolve() {
            return new Period(new Date(startMillis), new Date(endMillis));
            // Goes through the public constructor → all invariants checked
        }
    }
}`,
  },
  {
    id: 'alternatives',
    title: 'Protobuf, Avro & Modern Alternatives',
    color: '#8B5CF6',
    history: 'Protocol Buffers (Google, 2008) introduced schema-first binary serialization: define a .proto file, generate code, get fast compact encoding with full backward/forward compatibility. Apache Avro (Hadoop ecosystem, 2009) embedded the schema in the data for dynamic typing. MessagePack, FlatBuffers, and Cap\'n Proto followed. All exist because Java serialization was too slow, too large, and too dangerous for distributed systems.',
    keyPoints: [
      'Protobuf: schema (.proto) → generated code. ~3-10x smaller than JSON, ~20-100x faster to parse',
      'Field numbers enable backward/forward compatibility — add fields without breaking old readers',
      'Avro: schema travels WITH the data (or in a registry). Popular in Kafka/Spark/Hadoop',
      'MessagePack: binary JSON — same model as JSON but ~50% smaller, no schema needed',
      'FlatBuffers: zero-copy deserialization — read directly from the buffer without parsing',
      'Choice depends on: schema evolution needs, human readability, performance requirements, ecosystem',
      'JSON remains king for REST APIs (human readable, universal tooling). Protobuf/Avro for internal RPC.',
      'gRPC = Protobuf + HTTP/2 — the modern alternative to REST for service-to-service communication',
    ],
    code: `// PROTOBUF — define the schema
// user.proto
// syntax = "proto3";
// message User {
//   string name = 1;        // field number, NOT a default value
//   int32 age = 2;
//   string email = 3;
//   repeated string roles = 4;  // list
// }
// Adding field 5 later is safe — old readers simply ignore it.
// Removing field 2? Mark it "reserved" to prevent reuse.

// Generated Java code (protoc compiler)
User user = User.newBuilder()
    .setName("Alice")
    .setAge(30)
    .setEmail("alice@dev.com")
    .addRoles("admin")
    .addRoles("user")
    .build();                          // immutable once built

// Serialize to bytes (compact binary format)
byte[] bytes = user.toByteArray();     // ~30 bytes vs ~100+ for JSON

// Deserialize
User restored = User.parseFrom(bytes);

// BACKWARD COMPATIBILITY RULES
// 1. Never change a field number
// 2. New fields get new numbers — old readers skip them
// 3. Removed fields: reserve the number to prevent accidental reuse
// 4. Changing a field type: only compatible changes (int32 ↔ int64)

// AVRO — schema embedded or in a registry (Kafka ecosystem)
// Schema is JSON:
// {"type":"record","name":"User","fields":[
//   {"name":"name","type":"string"},
//   {"name":"age","type":"int"},
//   {"name":"email","type":["null","string"],"default":null}
// ]}

// MESSAGEPACK — binary JSON, no schema
// Java library: org.msgpack
MessagePack msgpack = new MessagePack();
byte[] packed = msgpack.write(user);   // ~50% smaller than JSON equivalent
User u = msgpack.read(packed, User.class);

// COMPARISON (approximate, 1000-field object)
// Format       | Size   | Serialize | Deserialize | Schema | Human-readable
// JSON         | 100%   | 1x        | 1x          | No     | Yes
// Protobuf     | 30%    | 5-10x     | 5-20x       | Yes    | No
// Avro         | 35%    | 3-8x      | 3-10x       | Yes    | No
// MessagePack  | 50%    | 2-4x      | 2-4x        | No     | No
// Java Serial  | 150%   | 0.5x      | 0.3x        | No     | No (worst!)

// gRPC = Protobuf + HTTP/2 (service-to-service RPC)
// Define service in .proto:
// service UserService {
//   rpc GetUser (GetUserRequest) returns (User);
//   rpc ListUsers (ListUsersRequest) returns (stream User);  // server streaming
// }
// protoc generates the client stub and server interface.
// Bidirectional streaming, flow control, deadlines built in.

// WHEN TO USE WHAT
// REST API to browsers/third parties → JSON (Jackson)
// Microservice-to-microservice RPC → gRPC/Protobuf
// Kafka/streaming data pipeline → Avro (with Schema Registry)
// Game networking / embedded → FlatBuffers / Cap'n Proto (zero-copy)
// Never for external communication → Java Serialization`,
  },
];

const interviewQuestions: { q: string; a: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }[] = [
  {
    q: 'What is serialVersionUID and what happens if you don\'t declare it?',
    a: 'serialVersionUID is a version number for the serialized form. If you don\'t declare it, the JVM computes one from the class structure (fields, methods, interfaces). Any change to the class — even adding a private method — changes the computed UID, causing InvalidClassException on deserialization. Declaring it explicitly gives you control: you decide when serialized forms are incompatible. Adding a field with an explicit UID is safe — the new field defaults to 0/null on old data.',
    difficulty: 'Beginner',
  },
  {
    q: 'What does the transient keyword do?',
    a: 'transient marks a field to be EXCLUDED from serialization. The field\'s value is not written to the byte stream. On deserialization, it initializes to the type\'s default (0, null, false). Use it for: sensitive data (passwords), non-serializable fields (Loggers, DB connections), derived/cached values that can be recomputed, and large fields that should not travel across the network.',
    difficulty: 'Beginner',
  },
  {
    q: 'Why is Java serialization considered a security risk?',
    a: 'Because deserialization executes code. When ObjectInputStream.readObject() reconstructs objects, it calls readObject(), readResolve(), finalize(), and constructor logic — all determined by the byte stream, which an attacker controls. By crafting a stream with "gadget chain" classes (already on the classpath, like Apache Commons), an attacker triggers Remote Code Execution without injecting any new code. The fundamental flaw is that the format is opaque and the reconstruction is Turing-complete.',
    difficulty: 'Advanced',
  },
  {
    q: 'Jackson ObjectMapper — should you create one per request?',
    a: 'No. ObjectMapper is thread-safe and expensive to create (reflection, module registration, cache warmup). Create ONE instance at startup and reuse it across all threads. The caches it builds (class introspection, serializer/deserializer) are what make Jackson fast — creating a new mapper per request discards those caches and adds ~10ms of overhead. Configure it once (disable FAIL_ON_UNKNOWN_PROPERTIES, register JavaTimeModule) and make it final.',
    difficulty: 'Intermediate',
  },
  {
    q: 'How does Protobuf achieve backward/forward compatibility?',
    a: 'Through field numbers. Each field has a unique number that identifies it in the binary format. Old code ignores unknown field numbers (forward compatibility). New code uses default values for missing numbers (backward compatibility). Rules: never reuse or change a field number, mark removed fields as reserved, and only make type changes within compatible families (int32/int64). This is vastly more robust than Java serialization\'s all-or-nothing serialVersionUID.',
    difficulty: 'Intermediate',
  },
  {
    q: 'What is the serialization proxy pattern?',
    a: 'A defensive pattern from Effective Java (Item 90). Instead of serializing the object directly, writeReplace() substitutes a simple proxy (a static inner class with just the essential data). On deserialization, the proxy\'s readResolve() calls the real class\'s public constructor — so all invariant checks run. Direct deserialization of the outer class is blocked by throwing in readObject(). This eliminates the "extralinguistic" construction path that attackers exploit.',
    difficulty: 'Advanced',
  },
  {
    q: 'When would you choose Avro over Protobuf?',
    a: 'Avro embeds or registers the writer\'s schema alongside the data, so the reader can resolve differences dynamically without code generation. This suits data lakes and streaming pipelines (Kafka + Schema Registry) where producers evolve independently and consumers handle schema evolution at read time. Protobuf requires generated code and assumes both sides have the .proto file. Choose Protobuf for typed RPC between controlled services; choose Avro for loosely-coupled data flow where schemas change frequently.',
    difficulty: 'Advanced',
  },
  {
    q: 'How do Records improve serialization safety?',
    a: 'Records have no readObject()/writeObject()/readResolve() hooks — the ONLY way to instantiate a record is through its canonical constructor, even during deserialization. This means invariant validation in the constructor always runs, and there is no "extralinguistic" way for an attacker to bypass it. Combined with the fact that record components are final, records are inherently safer for serialization than traditional Serializable classes.',
    difficulty: 'Intermediate',
  },
];

export default function SerializationPage() {
  const [activeConcept, setActiveConcept] = useState('java-serial');
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const currentConcept = concepts.find((c) => c.id === activeConcept)!;

  return (
    <div className="min-h-screen">
      <PageHeader
        badge="Advanced — Data Exchange"
        title="Serialization &"
        titleHighlight="Deserialization"
        description="Java serialization (and why Joshua Bloch called it his biggest mistake), Jackson/Gson JSON binding, Protobuf schema-driven formats, and the deserialization attacks that broke the enterprise world."
        icon={Binary}
        iconColor="#EF4444"
        gradient="from-red-500 via-rose-500 to-pink-500"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Topic Selector */}
        <AnimatedSection delay={0.1}>
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
                    layoutId="activeSerial"
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

                <div className="mb-5 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Historical Context</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{currentConcept.history}</p>
                </div>

                <h3 className="text-sm font-medium text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {currentConcept.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: currentConcept.color }} />
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
            <Badge variant="red">Serialization</Badge>
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
                      variant={item.difficulty === 'Beginner' ? 'green' : item.difficulty === 'Intermediate' ? 'blue' : 'purple'}
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
