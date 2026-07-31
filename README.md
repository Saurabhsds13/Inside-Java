# ☕ InsideJava

The most interactive Core Java learning platform on the web. Master every concept from absolute beginner (TCS/Infosys level) to advanced (MAANG/Oracle level) with live visualizations, real code examples, and interview-focused content.

**Live Demo:** [https://saurabhsds13.github.io/Inside-Java](https://saurabhsds13.github.io/Inside-Java)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-purple?logo=framer)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Dark Glassmorphic UI** — modern design with blur effects, gradient accents, and smooth animations
- **Interactive Visualizations** — not just text; animated diagrams, step-through walkthroughs, and memory models
- **Syntax-Highlighted Code** — Java code blocks with copy button and line numbers
- **Interview Questions** — every page ends with curated questions from Beginner to Advanced
- **Responsive Design** — works on mobile, tablet, and desktop
- **Static Export** — deployed to GitHub Pages, no server needed

---

## 📚 Topics Covered

### Beginner (Fresher Level)
| # | Topic | Status |
|---|-------|--------|
| 1 | OOPs Concepts | ✅ |
| 2 | String Handling | ✅ |
| 3 | Exception Handling | ✅ |
| 4 | Collections Framework | ✅ |
| 5 | Generics & Type Erasure | ✅ |
| 6 | static, final, this, super | ✅ |

### Intermediate (Product Company Level)
| # | Topic | Status |
|---|-------|--------|
| 7 | Java 8 Features | 🔜 |
| 8 | Multithreading | 🔜 |
| 9 | Collections Internals | 🔜 |
| 10 | Design Patterns | 🔜 |
| 11 | Java I/O & NIO | 🔜 |
| 12 | Annotations & Reflection | 🔜 |

### Advanced (MAANG Level)
| # | Topic | Status |
|---|-------|--------|
| 13 | Java 17-21 Features | 🔜 |
| 14 | Concurrency Deep Dive | 🔜 |
| 15 | Serialization | 🔜 |
| 16 | Memory Management | 🔜 |
| 17 | Java Security | 🔜 |
| 18 | Testing & Best Practices | 🔜 |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Static Export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + custom glassmorphic design system
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** GitHub Pages via GitHub Actions

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Saurabhsds13/Inside-Java.git
cd Inside-Java

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Inside-Java/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page (roadmap)
│   ├── oops/              # OOPs Concepts
│   ├── strings/           # String Handling
│   ├── exceptions/        # Exception Handling
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Navigation, Footer, PageHeader
│   └── ui/                # GlassCard, CodeBlock, Badge, etc.
├── data/                  # Navigation and content data
├── lib/                   # Utilities (cn, helpers)
├── types/                 # TypeScript interfaces
└── .github/workflows/     # GitHub Actions deploy
```

---

## 🎨 Design System

The project uses a custom dark glassmorphic design system:

- **GlassCard** — frosted glass containers with subtle borders
- **CodeBlock** — syntax-highlighted Java code with copy support
- **AnimatedSection** — scroll-triggered fade/slide animations
- **PageHeader** — consistent page headers with gradient accents
- **Badge** — colored labels for difficulty levels and categories
- **StatBar** — animated progress bars for comparisons

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add a topic page or improve existing content:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-topic`)
3. Follow the existing page patterns (see `app/oops/page.tsx` as reference)
4. Commit your changes (`git commit -m 'Add: new topic page'`)
5. Push and open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Saurabh Sonawane**

- GitHub: [@Saurabhsds13](https://github.com/Saurabhsds13)

---

Built with ☕ and Next.js
