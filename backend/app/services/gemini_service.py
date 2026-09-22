"""
Gemini AI Service — Comprehensive CS & Programming Tutor
Supports 50+ languages, all CS subjects, RAG-augmented responses,
student-level detection, intent classification, and structured educational output.
"""

import os
import re
import httpx
from typing import Optional, Dict, Any, List

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# ---------------------------------------------------------------------------
# MASTER SYSTEM PROMPT
# ---------------------------------------------------------------------------
TUTOR_SYSTEM_PROMPT = """You are an expert Computer Science & Programming Tutor AI integrated into SkillPath AI — an educational platform for students.

## YOUR IDENTITY
You are a senior software engineer and CS educator with deep expertise across ALL areas of computer science and programming. You adapt your teaching style to each student's level.

## SUPPORTED TECHNOLOGIES
You have expert knowledge in:

### Programming Languages
- General: C, C++, Java, Python, JavaScript, TypeScript, C#, PHP, Go, Rust, Ruby, Scala, Kotlin, Swift, Dart
- Web: HTML, CSS, JavaScript, TypeScript, React, Angular, Vue.js, Next.js, Node.js, Express.js, Svelte
- Mobile: Flutter, Dart, Kotlin, Java (Android), Swift, SwiftUI, React Native, Xamarin
- Backend: Spring Boot, Django, Flask, FastAPI, Laravel, ASP.NET, Ruby on Rails, NestJS
- Data/AI: Python, R, MATLAB, Julia, Jupyter
- Systems: C, C++, Rust, Assembly
- Scripting: Bash, PowerShell, Lua, Perl, Groovy
- Query: SQL, GraphQL, SPARQL

### Databases
MySQL, PostgreSQL, SQLite, MongoDB, Redis, Firebase, Cassandra, DynamoDB, Oracle, MSSQL, H2, Elasticsearch

### AI & Machine Learning
TensorFlow, PyTorch, Scikit-learn, Keras, OpenCV, Hugging Face, LangChain, FAISS, Pinecone, NLTK, SpaCy, XGBoost, Pandas, NumPy

### CS Subjects
Data Structures, Algorithms, Operating Systems, Computer Networks, DBMS, OOP, Software Engineering, System Design, Computer Architecture, Compiler Design, Cybersecurity, Cloud Computing (AWS/GCP/Azure), Distributed Systems, Web Technologies, Mobile Computing

### DevOps
Docker, Kubernetes, CI/CD, Git/GitHub, Linux, Nginx, Jenkins, GitHub Actions, Terraform

## RESPONSE RULES

### Format your responses:
1. Use proper Markdown formatting with headers (##, ###), bold (**text**), bullet points, numbered lists
2. Always wrap code in fenced code blocks with language tag: ```python, ```java, ```javascript etc.
3. For long code examples, always include comments explaining key sections
4. Use emojis sparingly for visual clarity (📘 for explanation, 💻 for code, ⚡ for tips, 🐛 for bugs, ✅ for solution)

### Teaching approach:
- ALWAYS detect the student's level from their message: Beginner / Intermediate / Advanced
- For BEGINNERS: Use simple language, real-world analogies, step-by-step explanations, avoid jargon
- For INTERMEDIATE: Use technical explanations, practical examples, discuss trade-offs
- For ADVANCED: Discuss architecture, performance, edge cases, design patterns, internals

### For concept explanations, provide:
1. Simple definition
2. Real-world analogy
3. Syntax / structure
4. Complete runnable code example
5. How it works (step by step)
6. Common mistakes to avoid
7. A practice question

### For debugging requests, provide:
1. **Problem**: What the error means
2. **Cause**: Why it happened
3. **Solution**: Exact fix
4. **Corrected Code**: Working code
5. **Prevention**: How to avoid in future

### For project requests:
1. Project overview & features
2. Architecture diagram (text-based)
3. File/folder structure
4. Step-by-step implementation
5. Key code for each layer
6. How to run

### For code conversion:
1. Converted code with comments
2. Key differences between languages
3. Idiomatic patterns in the target language

### For learning roadmaps:
Generate a visual step-by-step learning path from basics to advanced

## ACCURACY RULES
- NEVER invent APIs, functions, or libraries that don't exist
- NEVER pretend code was executed — only show expected output as comments
- If uncertain about a specific version, say so clearly
- For version-sensitive syntax, mention which version it applies to
- Prefer official documentation patterns

## STUDENT CONTEXT
The following context will be provided:
- student_level: Beginner / Intermediate / Advanced
- language: The programming language/topic in focus
- mode: tutor / debugger / project / converter / roadmap / practice / interview
- conversation_history: Previous messages for context continuity
- rag_context: Relevant knowledge base articles

Use the conversation history to remember what the student told you earlier (e.g., if they said they're learning Java, keep Java as default context).

Respond in a friendly, encouraging, and professional manner. Make learning enjoyable!"""


# ---------------------------------------------------------------------------
# INTENT DETECTION
# ---------------------------------------------------------------------------
def detect_intent(message: str) -> str:
    """Classify the student's intent from their message."""
    msg = message.lower()
    
    debug_keywords = ["error", "exception", "bug", "fix", "wrong", "not working", "crash", "traceback",
                      "stacktrace", "fails", "undefined", "null", "nan", "syntax error", "runtime error",
                      "why does", "what's wrong", "help me fix", "getting this error"]
    
    project_keywords = ["create a", "build a", "make a", "develop a", "project", "application",
                        "full stack", "fullstack", "system", "app using", "implement a", "design a"]
    
    convert_keywords = ["convert", "translate", "rewrite in", "same code in", "port to", "migrate to",
                        "equivalent in", "from python to", "from java to", "from js to"]
    
    roadmap_keywords = ["roadmap", "learning path", "how to learn", "where to start", "beginner guide",
                        "curriculum", "syllabus", "plan to learn", "start learning", "study plan"]
    
    practice_keywords = ["quiz", "mcq", "practice", "exercise", "test me", "give me questions",
                         "challenge", "assignments", "coding challenge", "viva", "interview questions",
                         "exam questions", "practice problems"]
    
    for kw in debug_keywords:
        if kw in msg:
            return "debugger"
    for kw in project_keywords:
        if kw in msg:
            return "project"
    for kw in convert_keywords:
        if kw in msg:
            return "converter"
    for kw in roadmap_keywords:
        if kw in msg:
            return "roadmap"
    for kw in practice_keywords:
        if kw in msg:
            return "practice"
    
    return "tutor"


# ---------------------------------------------------------------------------
# STUDENT LEVEL DETECTION
# ---------------------------------------------------------------------------
def detect_student_level(message: str, history: List[Dict] = None) -> str:
    """Detect student knowledge level from message content and history."""
    msg = message.lower()
    
    beginner_signals = ["what is", "explain", "i'm new", "beginner", "just started", "don't understand",
                        "simple explanation", "basics", "introduction", "define", "what does", "never used",
                        "first time", "confused", "can you help me understand"]
    
    advanced_signals = ["architecture", "performance", "optimization", "internals", "thread-safe",
                        "concurrency", "distributed", "microservices", "design pattern", "trade-off",
                        "benchmark", "profiling", "memory leak", "garbage collection", "jvm",
                        "compile time", "runtime", "bytecode", "kernel", "syscall", "cache", "complexity analysis"]
    
    intermediate_signals = ["how to", "example", "difference between", "when should i", "best practice",
                            "implement", "use case", "tutorial", "step by step"]
    
    beginner_score = sum(1 for kw in beginner_signals if kw in msg)
    advanced_score = sum(1 for kw in advanced_signals if kw in msg)
    
    # Check history for level indicators
    if history:
        history_text = " ".join([m.get("content", "") for m in history[-5:]]).lower()
        if any(kw in history_text for kw in ["i'm a beginner", "just started", "new to"]):
            beginner_score += 2
        if any(kw in history_text for kw in ["production", "senior", "architect", "years of experience"]):
            advanced_score += 2
    
    if advanced_score >= 2:
        return "Advanced"
    if beginner_score >= 1:
        return "Beginner"
    return "Intermediate"


# ---------------------------------------------------------------------------
# LANGUAGE DETECTION
# ---------------------------------------------------------------------------
def detect_language(message: str, context: Dict = None) -> str:
    """Detect the programming language mentioned in the message."""
    msg = message.lower()
    
    language_map = {
        "python": "Python", "java ": "Java", "javascript": "JavaScript", "typescript": "TypeScript",
        "c++": "C++", "c#": "C#", "kotlin": "Kotlin", "swift": "Swift", "go ": "Go",
        "rust": "Rust", "ruby": "Ruby", "php": "PHP", "dart": "Dart", "flutter": "Flutter",
        "react": "React", "angular": "Angular", "vue": "Vue.js", "next.js": "Next.js",
        "node": "Node.js", "express": "Express.js", "django": "Django", "flask": "Flask",
        "fastapi": "FastAPI", "spring": "Spring Boot", "laravel": "Laravel", ".net": ".NET",
        "sql": "SQL", "mysql": "MySQL", "postgresql": "PostgreSQL", "mongodb": "MongoDB",
        "redis": "Redis", "docker": "Docker", "kubernetes": "Kubernetes",
        "tensorflow": "TensorFlow", "pytorch": "PyTorch", "sklearn": "Scikit-learn",
        "html": "HTML/CSS", "css": "HTML/CSS", "bash": "Bash", "shell": "Bash",
        "powershell": "PowerShell", "r ": "R", "scala": "Scala",
    }
    
    for keyword, lang in language_map.items():
        if keyword in msg:
            return lang
    
    # Fallback to context
    if context:
        ctx_lang = context.get("language") or context.get("subject") or context.get("topic")
        if ctx_lang:
            return str(ctx_lang)
    
    return "General"


# ---------------------------------------------------------------------------
# MAIN AI RESPONSE GENERATOR
# ---------------------------------------------------------------------------
async def generate_ai_response(
    message: str,
    context: Optional[Dict] = None,
    conversation_history: Optional[List[Dict]] = None,
    rag_docs: Optional[List[Dict]] = None
) -> str:
    """
    Main AI response generator.
    Builds rich prompt with context, RAG docs, conversation history, and mode.
    Falls back to local response if Gemini is unavailable.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return get_fallback_response(message, context, rag_docs)

    ctx = context or {}
    history = conversation_history or []
    docs = rag_docs or []

    # Auto-detect intent and level if not provided
    intent = ctx.get("mode") or detect_intent(message)
    level = ctx.get("competency") or ctx.get("level") or detect_student_level(message, history)
    language = ctx.get("language") or ctx.get("topic") or detect_language(message, ctx)

    # Build RAG context block
    rag_block = ""
    if docs:
        rag_block = "\n\n## 📚 Relevant Knowledge Base Articles:\n"
        for doc in docs[:3]:
            rag_block += f"\n### {doc.get('title', 'Reference')}\n"
            rag_block += f"{doc.get('content', '')[:600]}\n"
            if doc.get("code_example"):
                rag_block += f"\n```\n{doc.get('code_example', '')[:400]}\n```\n"

    # Build conversation history block (last 6 messages)
    history_block = ""
    if history:
        history_block = "\n\n## 🗂️ Conversation History (last turns):\n"
        for msg in history[-6:]:
            role = "Student" if msg.get("role") == "user" else "Tutor"
            content = msg.get("content", "")[:300]
            history_block += f"\n**{role}**: {content}\n"

    # Build mode-specific instructions
    mode_instructions = {
        "debugger": "\n\n## CURRENT MODE: DEBUGGER\nAnalyze the error/bug. Structure your response as: Problem → Cause → Solution → Corrected Code → Prevention.",
        "project": "\n\n## CURRENT MODE: PROJECT ARCHITECT\nHelp build a complete project. Provide: Overview → Architecture → Folder Structure → Step-by-step code for each layer.",
        "converter": "\n\n## CURRENT MODE: CODE CONVERTER\nConvert the code preserving functionality. Explain key differences and use idiomatic patterns in the target language.",
        "roadmap": "\n\n## CURRENT MODE: ROADMAP BUILDER\nCreate a comprehensive visual learning roadmap with steps from beginner to advanced. Use arrows and phases.",
        "practice": "\n\n## CURRENT MODE: PRACTICE MODE\nGenerate appropriate practice questions (MCQ, coding, debug). After the student answers, evaluate and explain.",
        "interview": "\n\n## CURRENT MODE: INTERVIEW PREP\nAsk technical interview questions appropriate to the level. Give constructive feedback on answers.",
        "tutor": "\n\n## CURRENT MODE: TUTOR\nTeach the concept with explanation, analogy, code example, and practice question.",
    }

    mode_block = mode_instructions.get(intent, mode_instructions["tutor"])

    # Assemble full prompt
    full_prompt = f"""{TUTOR_SYSTEM_PROMPT}

## CURRENT SESSION CONTEXT:
- Student Level: {level}
- Language/Topic Focus: {language}
- Mode: {intent}
- Topic: {ctx.get('topic', language)}
{mode_block}
{rag_block}
{history_block}

## STUDENT'S MESSAGE:
{message}

Respond as the CS Tutor AI. Use the student's level ({level}) to calibrate your explanation depth.
If code is provided, analyze it carefully before responding."""

    payload = {
        "contents": [
            {"role": "user", "parts": [{"text": full_prompt}]}
        ],
        "generationConfig": {
            "maxOutputTokens": 2048,
            "temperature": 0.7,
            "topP": 0.9
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            elif resp.status_code == 429:
                return "⚠️ The AI service is currently rate-limited. Please wait a moment and try again."
            else:
                return get_fallback_response(message, context, rag_docs)
    except httpx.TimeoutException:
        return "⚠️ The AI service timed out. Please try again in a moment."
    except Exception:
        return get_fallback_response(message, context, rag_docs)


# ---------------------------------------------------------------------------
# RICH FALLBACK RESPONSE ENGINE
# ---------------------------------------------------------------------------
def get_fallback_response(
    message: str,
    context: Optional[Dict] = None,
    rag_docs: Optional[List[Dict]] = None
) -> str:
    """
    Rich local fallback — uses RAG docs when available, otherwise uses
    a keyword-matched response bank covering major CS topics.
    """
    msg = message.lower()
    ctx = context or {}
    language = ctx.get("language") or ctx.get("topic") or detect_language(message, ctx) or "Programming"
    level = ctx.get("competency") or ctx.get("level") or "Intermediate"

    # If we have RAG docs, use them to build a response
    if rag_docs:
        best_doc = rag_docs[0]
        response = f"## 📘 {best_doc.get('title', 'Reference')}\n\n"
        response += f"{best_doc.get('summary', '')}\n\n"
        content = best_doc.get('content', '')
        if content:
            response += f"{content[:800]}\n\n"
        if best_doc.get('code_example'):
            lang_tag = best_doc.get('language', '').lower().split('/')[0].split(' ')[0] or 'python'
            response += f"### 💻 Example:\n```{lang_tag}\n{best_doc['code_example'][:600]}\n```\n\n"
        if best_doc.get('practice_question'):
            response += f"### 🎯 Practice:\n{best_doc['practice_question']}\n"
        return response

    # Keyword-matched fallback bank
    fallbacks = {
        # Error patterns
        "nullpointerexception": _null_pointer_response(),
        "segmentation fault": _segfault_response(),
        "indexerror": _index_error_response(),
        "typeerror": _type_error_response(),
        "cors": _cors_response(),
        "indentationerror": _indentation_error_response(),

        # OOP concepts
        "inheritance": _inheritance_response(language),
        "polymorphism": _polymorphism_response(language),
        "encapsulation": _encapsulation_response(language),
        "abstraction": _abstraction_response(language),
        "constructor": _constructor_response(language),
        "interface": _interface_response(language),

        # Data Structures
        "linked list": _linked_list_response(),
        "binary tree": _binary_tree_response(),
        "stack": _stack_response(language),
        "queue": _queue_response(language),
        "hash": _hashmap_response(language),
        "graph": _graph_response(),

        # Algorithms
        "binary search": _binary_search_response(),
        "bubble sort": _bubble_sort_response(),
        "recursion": _recursion_response(language),
        "dynamic programming": _dp_response(),
        "big o": _big_o_response(),

        # Web
        "react": _react_response(),
        "useeffect": _useeffect_response(),
        "async": _async_response(language),
        "promise": _promise_response(),
        "rest api": _rest_api_response(),

        # DB
        "sql": _sql_response(),
        "join": _sql_joins_response(),
        "normalization": _normalization_response(),
        "index": _db_index_response(),

        # AI/ML
        "neural network": _neural_network_response(),
        "machine learning": _ml_intro_response(),
        "transformer": _transformer_response(),

        # General programming
        "function": _function_response(language),
        "loop": _loop_response(language),
        "array": _array_response(language),
        "class": _class_response(language),
        "variable": _variable_response(language),
        "pointer": _pointer_response(),
        "git": _git_response(),
        "docker": _docker_response(),
        "api": _api_response(),
    }

    for keyword, response in fallbacks.items():
        if keyword in msg:
            return response

    # Generic intelligent fallback
    intent = detect_intent(message)
    if intent == "debugger":
        return f"""## 🐛 Debugging Help

I'd be happy to help debug your issue! To give you the most accurate fix, could you share:

1. **The error message** (copy the full error text)
2. **Your code** (the relevant section)
3. **What you expected** to happen
4. **What actually happened**

### Common causes in {language}:
- Uninitialized variables / null references
- Off-by-one errors in loops or array access
- Type mismatches (e.g., string vs integer)
- Missing imports or wrong package names
- Scope issues (variable not accessible)

Paste your code and error, and I'll diagnose it step by step! 🔍"""

    if intent == "project":
        return f"""## 🏗️ Project Planning

Great! Let's build this project step by step.

### What I'll need from you:
1. **Project type** — Web app? CLI tool? API? Mobile app?
2. **Main features** — What should it do?
3. **Tech stack** — Are you using {language}? Any specific framework?
4. **Your level** — This helps me decide how much to explain

### Example Project Structure ({language}):
```
project/
├── src/
│   ├── models/        # Data structures
│   ├── services/      # Business logic
│   ├── controllers/   # API/request handlers
│   └── utils/         # Helper functions
├── tests/             # Test files
├── config/            # Configuration
└── README.md
```

Tell me what you want to build and I'll walk you through it! 🚀"""

    if intent == "roadmap":
        return _generic_roadmap_response(language)

    return f"""## 💬 {language} — Learning Assistant

I'm here to help you with **{language}** at **{level}** level!

Here's what I can do for you:

| Mode | Example |
|------|---------|
| 📘 **Explain** | "What is recursion in {language}?" |
| 🐛 **Debug** | "Why am I getting IndexError?" |
| 💻 **Code** | "Show me an example of OOP in {language}" |
| 🏗️ **Project** | "Build a TODO app in {language}" |
| 🗺️ **Roadmap** | "How do I learn {language}?" |
| 🎯 **Practice** | "Give me {language} MCQ questions" |
| 💼 **Interview** | "Ask me interview questions on {language}" |

What would you like to learn? I'm ready to help! 🎓"""


# ---------------------------------------------------------------------------
# TOPIC-SPECIFIC RESPONSE FUNCTIONS
# ---------------------------------------------------------------------------
def _inheritance_response(lang: str) -> str:
    code = {
        "Java": '```java\n// Parent class\nclass Animal {\n    protected String name;\n    \n    public Animal(String name) {\n        this.name = name;\n    }\n    \n    public void speak() {\n        System.out.println(name + " makes a sound");\n    }\n}\n\n// Child class inherits Animal\nclass Dog extends Animal {\n    public Dog(String name) {\n        super(name); // Call parent constructor\n    }\n    \n    @Override\n    public void speak() {\n        System.out.println(name + " says: Woof!");\n    }\n}\n\n// Usage\nDog dog = new Dog("Rex");\ndog.speak(); // Rex says: Woof!\n```',
        "Python": '```python\n# Parent class\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        return f"{self.name} makes a sound"\n\n# Child class inherits Animal\nclass Dog(Animal):\n    def speak(self):  # Override parent method\n        return f"{self.name} says: Woof!"\n\n# Usage\ndog = Dog("Rex")\nprint(dog.speak())  # Rex says: Woof!\n```',
    }.get(lang, '```python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} makes a sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} says Woof!"\n\ndog = Dog("Rex")\nprint(dog.speak())\n```')

    return f"""## 📘 Inheritance in {lang}

### Definition
Inheritance allows a **child class** to acquire properties and methods from a **parent class**, promoting code reuse.

### Real-World Analogy
A **Dog** IS-A **Animal**. It inherits traits (name, age) and behaviors (breathe, eat) from Animal, but adds its own (bark, fetch).

### Syntax
{code}

### How It Works
1. Child class uses `extends` (Java) / `(ParentClass)` (Python) to inherit
2. Child gets all non-private members of parent
3. `super()` calls the parent constructor or method
4. `@Override` / redefining the method replaces parent behavior (Polymorphism)

### Types of Inheritance
- **Single**: One parent, one child ✅
- **Multilevel**: A → B → C ✅
- **Hierarchical**: One parent, many children ✅
- **Multiple**: Multiple parents — use interfaces/mixins

### ⚠️ Common Mistakes
- Forgetting to call `super()` in child constructor
- Confusing IS-A (inheritance) with HAS-A (composition)
- Overriding without `@Override` annotation (Java)

### 🎯 Practice
Create a `Vehicle` base class and `Car`, `ElectricCar` subclasses. Add a `fuelType()` method that each subclass overrides."""


def _polymorphism_response(lang: str) -> str:
    return f"""## 📘 Polymorphism in {lang}

### Definition
**Polymorphism** = "many forms". The same method name behaves differently based on the object calling it.

### Two Types

**1. Compile-time (Method Overloading)** — same name, different parameters
```{'java' if lang == 'Java' else 'python'}
{'// Java: Method Overloading\nclass Calculator {\n    int add(int a, int b) { return a + b; }\n    double add(double a, double b) { return a + b; }\n    int add(int a, int b, int c) { return a + b + c; }\n}' if lang == 'Java' else '# Python: Achieved via default arguments\ndef add(a, b, c=0):\n    return a + b + c\n\nprint(add(2, 3))     # 5\nprint(add(2, 3, 4))  # 9'}
```

**2. Runtime (Method Overriding)** — child overrides parent method
```{'java' if lang == 'Java' else 'python'}
{'class Shape {\n    void draw() { System.out.println("Drawing a shape"); }\n}\nclass Circle extends Shape {\n    @Override\n    void draw() { System.out.println("Drawing a circle ⭕"); }\n}\nclass Square extends Shape {\n    @Override\n    void draw() { System.out.println("Drawing a square 🟥"); }\n}\n\n// Runtime polymorphism\nShape[] shapes = {new Circle(), new Square()};\nfor (Shape s : shapes) s.draw(); // Different output each time' if lang == 'Java' else 'class Shape:\n    def draw(self): return "Drawing a shape"\n\nclass Circle(Shape):\n    def draw(self): return "Drawing a circle ⭕"\n\nclass Square(Shape):\n    def draw(self): return "Drawing a square 🟥"\n\nshapes = [Circle(), Square()]\nfor s in shapes:\n    print(s.draw())  # Polymorphic calls'}
```

### Benefits
- Write flexible, extensible code
- Add new classes without changing existing code (Open/Closed Principle)
- Simplify complex if-else chains

### 🎯 Practice
Create a `Payment` base class and `CreditCard`, `PayPal`, `Crypto` subclasses. Each should override a `process()` method."""


def _encapsulation_response(lang: str) -> str:
    return f"""## 📘 Encapsulation in {lang}

### Definition
Wrapping data (attributes) and methods that operate on it into a single unit (class), and **hiding internal details** from outside.

### Why It Matters
- Protects data from unintended modification
- Controls access via getters/setters
- Makes code easier to maintain

### Example
```{'java' if lang == 'Java' else 'python'}
{'public class BankAccount {\n    private double balance;  // Private — hidden!\n    private String owner;\n\n    public BankAccount(String owner, double initialBalance) {\n        this.owner = owner;\n        this.balance = initialBalance;\n    }\n\n    // Controlled access via getter\n    public double getBalance() { return balance; }\n\n    // Validated setter\n    public void deposit(double amount) {\n        if (amount > 0) balance += amount;\n        else throw new IllegalArgumentException("Amount must be positive");\n    }\n\n    public void withdraw(double amount) {\n        if (amount > balance) throw new IllegalStateException("Insufficient funds");\n        balance -= amount;\n    }\n}' if lang == 'Java' else 'class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.__balance = balance  # __ makes it private\n\n    @property\n    def balance(self):\n        return self.__balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount\n        else:\n            raise ValueError("Amount must be positive")\n\n    def withdraw(self, amount):\n        if amount > self.__balance:\n            raise ValueError("Insufficient funds")\n        self.__balance -= amount\n\nacc = BankAccount("Alice", 1000)\nacc.deposit(500)\nprint(acc.balance)  # 1500\n# acc.__balance = -9999  # This won\'t work!'}
```

### 🎯 Practice
Design an `Employee` class with private `salary`. Add methods `give_raise(percent)` and `get_salary()` with proper validation."""


def _abstraction_response(lang: str) -> str:
    return f"""## 📘 Abstraction in {lang}

**Abstraction** = hiding complex implementation details and showing only the essential features.

Think of a **TV remote**: You press buttons (interface) without knowing the internal circuitry.

```{'java' if lang == 'Java' else 'python'}
{'// Abstract class defines the contract\nabstract class DatabaseConnection {\n    // Abstract — subclass MUST implement\n    abstract void connect(String url);\n    abstract void query(String sql);\n    abstract void disconnect();\n\n    // Concrete method — shared logic\n    public void executeQuery(String url, String sql) {\n        connect(url);\n        query(sql);\n        disconnect();\n    }\n}\n\nclass MySQLConnection extends DatabaseConnection {\n    @Override\n    void connect(String url) { System.out.println("Connecting to MySQL: " + url); }\n    @Override\n    void query(String sql) { System.out.println("Executing: " + sql); }\n    @Override\n    void disconnect() { System.out.println("MySQL connection closed"); }\n}' if lang == 'Java' else 'from abc import ABC, abstractmethod\n\nclass DatabaseConnection(ABC):\n    @abstractmethod\n    def connect(self, url): pass\n\n    @abstractmethod\n    def query(self, sql): pass\n\n    def execute(self, url, sql):\n        self.connect(url)\n        self.query(sql)\n\nclass PostgreSQLConnection(DatabaseConnection):\n    def connect(self, url):\n        print(f"Connecting to PostgreSQL: {url}")\n\n    def query(self, sql):\n        print(f"Executing: {sql}")'}
```

### 🎯 Practice
Create an abstract `Shape` class with `area()` and `perimeter()` methods. Implement `Circle` and `Rectangle`."""


def _constructor_response(lang: str) -> str:
    return f"""## 📘 Constructor in {lang}

A **constructor** is a special method that runs automatically when an object is created. Used to initialize object state.

```{'java' if lang == 'Java' else 'python'}
{'public class Car {\n    private String brand;\n    private int year;\n    private double price;\n\n    // Default constructor\n    public Car() {\n        this.brand = "Unknown";\n        this.year = 2024;\n        this.price = 0.0;\n    }\n\n    // Parameterized constructor\n    public Car(String brand, int year, double price) {\n        this.brand = brand;\n        this.year = year;\n        this.price = price;\n    }\n\n    // Copy constructor\n    public Car(Car other) {\n        this.brand = other.brand;\n        this.year = other.year;\n        this.price = other.price;\n    }\n}\n\nCar c1 = new Car("Toyota", 2023, 25000.0);\nCar c2 = new Car(c1); // Copy' if lang == 'Java' else 'class Car:\n    def __init__(self, brand="Unknown", year=2024, price=0.0):\n        self.brand = brand\n        self.year = year\n        self.price = price\n\n    def __repr__(self):\n        return f"Car({self.brand}, {self.year})"\n\n# Usage\nc1 = Car("Toyota", 2023, 25000.0)\nc2 = Car()  # Uses defaults\nprint(c1)   # Car(Toyota, 2023)'}
```

### ⚠️ Common Mistakes
- Forgetting `self` (Python) or using wrong parameter names
- Not calling `super().__init__()` in child classes
- Constructor doing too much (keep it simple — just initialize)

### 🎯 Practice
Create a `Student` class with `name`, `id`, and `grades[]` in the constructor. Add `average_grade()` method."""


def _interface_response(lang: str) -> str:
    return f"""## 📘 Interface / Protocol in {lang}

An **interface** defines a contract — a set of methods a class MUST implement — without providing any implementation.

```{'java' if lang == 'Java' else 'python'}
{'// Interface defines contract\ninterface Drawable {\n    void draw();           // must implement\n    default void resize(int factor) {  // optional default method\n        System.out.println("Resizing by " + factor);\n    }\n}\n\ninterface Colorable {\n    void setColor(String color);\n}\n\n// Class implements multiple interfaces\nclass Circle implements Drawable, Colorable {\n    private String color = "red";\n\n    @Override\n    public void draw() {\n        System.out.println("Drawing " + color + " circle");\n    }\n\n    @Override\n    public void setColor(String color) {\n        this.color = color;\n    }\n}' if lang == 'Java' else 'from abc import ABC, abstractmethod\nfrom typing import Protocol\n\n# Python Protocol (structural subtyping)\nclass Drawable(Protocol):\n    def draw(self) -> None: ...\n\n# Or Abstract Base Class approach\nclass Drawable(ABC):\n    @abstractmethod\n    def draw(self) -> None: pass\n\n    def resize(self, factor: int) -> None:\n        print(f"Resizing by {factor}")\n\nclass Circle(Drawable):\n    def draw(self) -> None:\n        print("Drawing a circle ⭕")'}
```

### Interface vs Abstract Class
| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| Implementation | No (only contracts) | Can have some |
| Multiple inheritance | ✅ Yes | ❌ No (single) |
| Fields | Constants only | Any fields |
| Use when | Defining capabilities | Sharing base code |

### 🎯 Practice
Create `Flyable` and `Swimmable` interfaces. Implement a `Duck` class that implements both."""


def _linked_list_response() -> str:
    return """## 📘 Linked List

A **Linked List** is a linear data structure where elements (nodes) are linked using pointers.

```
[Head] → [10|→] → [20|→] → [30|→] → [None]
```

Each node contains:
- **Data**: The value stored
- **Next**: Pointer to the next node

### Implementation in Python
```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        return " → ".join(elements)

    def delete(self, data):
        if not self.head:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next

# Usage
ll = LinkedList()
ll.append(10)
ll.append(20)
ll.append(30)
print(ll.display())   # 10 → 20 → 30
ll.delete(20)
print(ll.display())   # 10 → 30
```

### Types
- **Singly Linked**: One direction only
- **Doubly Linked**: Forward AND backward pointers
- **Circular**: Tail points back to head

### Time Complexity
| Operation | Linked List | Array |
|-----------|------------|-------|
| Access | O(n) | O(1) |
| Insert at head | O(1) | O(n) |
| Insert at tail | O(n) | O(1) amortized |
| Delete | O(n) | O(n) |

### 🎯 Practice
Implement `reverse()` method to reverse a linked list in-place. Expected: `10 → 20 → 30` becomes `30 → 20 → 10`."""


def _binary_tree_response() -> str:
    return """## 📘 Binary Tree

A **Binary Tree** is a tree where each node has at most 2 children (left and right).

```
         [10]
        /    \\
      [5]    [15]
     /   \\     \\
   [3]   [7]   [20]
```

### Implementation in Python
```python
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:  # Binary Search Tree
    def __init__(self):
        self.root = None

    def insert(self, val):
        self.root = self._insert(self.root, val)

    def _insert(self, node, val):
        if not node:
            return TreeNode(val)
        if val < node.val:
            node.left = self._insert(node.left, val)
        elif val > node.val:
            node.right = self._insert(node.right, val)
        return node

    def inorder(self, node=None, first_call=True):
        if first_call:
            node = self.root
        if not node:
            return []
        return (self.inorder(node.left, False) +
                [node.val] +
                self.inorder(node.right, False))

bst = BST()
for val in [10, 5, 15, 3, 7, 20]:
    bst.insert(val)

print(bst.inorder())  # [3, 5, 7, 10, 15, 20] — sorted!
```

### Traversal Types
- **Inorder** (Left → Root → Right): Gives sorted output in BST
- **Preorder** (Root → Left → Right): Good for copying tree
- **Postorder** (Left → Right → Root): Good for deletion
- **Level-order (BFS)**: Level by level using a queue

### 🎯 Practice
Implement `find_height(node)` that returns the height of a binary tree."""


def _stack_response(lang: str) -> str:
    return f"""## 📘 Stack in {lang}

A **Stack** follows **LIFO** — Last In, First Out. Think of a pile of plates.

```
Push 3 → [1][2][3] ← Top
Pop   → [1][2]     ← Returns 3
```

```python
# Python — using list as stack
class Stack:
    def __init__(self):
        self._data = []

    def push(self, item):
        self._data.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._data.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self._data[-1]

    def is_empty(self):
        return len(self._data) == 0

    def __len__(self):
        return len(self._data)

# Usage
s = Stack()
s.push(1); s.push(2); s.push(3)
print(s.peek())  # 3
print(s.pop())   # 3
print(len(s))    # 2
```

### Real Applications
- **Browser back/forward** navigation
- **Undo/Redo** in text editors
- **Function call stack** (recursion)
- **Balanced parentheses** checking
- **Postfix expression** evaluation

### 🎯 Practice
Use a stack to check if a string has balanced brackets: `({{[]}})` is valid, `({{[}})` is not."""


def _queue_response(lang: str) -> str:
    return f"""## 📘 Queue in {lang}

A **Queue** follows **FIFO** — First In, First Out. Like a line at a store.

```python
from collections import deque

class Queue:
    def __init__(self):
        self._data = deque()

    def enqueue(self, item):
        self._data.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self._data.popleft()

    def peek(self):
        return self._data[0]

    def is_empty(self):
        return len(self._data) == 0

# Usage
q = Queue()
q.enqueue("Alice")
q.enqueue("Bob")
q.enqueue("Charlie")
print(q.dequeue())  # Alice (first in, first out)
print(q.peek())     # Bob
```

### Types
- **Simple Queue**: Basic FIFO
- **Circular Queue**: Reuses space
- **Priority Queue**: Higher priority dequeues first
- **Deque**: Insert/remove from both ends

### 🎯 Practice
Implement a queue using two stacks."""


def _hashmap_response(lang: str) -> str:
    return f"""## 📘 Hash Map / Dictionary in {lang}

A **Hash Map** stores key-value pairs with O(1) average-case lookup.

```python
# Python dict is a Hash Map
student_grades = {{}}

# Insert
student_grades["Alice"] = 95
student_grades["Bob"] = 87
student_grades["Charlie"] = 92

# Access — O(1)
print(student_grades["Alice"])  # 95

# Safe access
grade = student_grades.get("Dave", 0)  # Returns 0 if not found

# Iteration
for name, grade in student_grades.items():
    print(f"{{name}}: {{grade}}")

# Common use case: frequency counter
text = "hello world"
freq = {{}}
for char in text:
    freq[char] = freq.get(char, 0) + 1
# freq = {{'h':1, 'e':1, 'l':3, 'o':2, ' ':1, 'w':1, 'r':1, 'd':1}}
```

### Time Complexity
| Operation | Average | Worst |
|-----------|---------|-------|
| Insert | O(1) | O(n) |
| Search | O(1) | O(n) |
| Delete | O(1) | O(n) |

### 🎯 Practice
Given a list of numbers, find two numbers that add up to a target using a hash map for O(n) solution."""


def _graph_response() -> str:
    return """## 📘 Graph Data Structure

A **Graph** consists of **vertices (nodes)** and **edges (connections)**.

```
    1 --- 2
    |   / |
    |  /  |
    3 --- 4
```

### Representation Methods

**1. Adjacency List (most common)**
```python
# Graph as adjacency list
graph = {
    1: [2, 3],
    2: [1, 3, 4],
    3: [1, 2, 4],
    4: [2, 3]
}

# BFS (Breadth-First Search)
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result

# DFS (Depth-First Search)
def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    result = [start]
    for neighbor in graph[start]:
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    return result

print(bfs(graph, 1))  # [1, 2, 3, 4]
print(dfs(graph, 1))  # [1, 2, 3, 4]
```

### Applications
- **BFS**: Shortest path, social networks, web crawling
- **DFS**: Maze solving, topological sort, cycle detection

### 🎯 Practice
Find the shortest path between node 1 and node 4 in the example graph above."""


def _binary_search_response() -> str:
    return """## 📘 Binary Search

**Binary Search** finds a target in a **sorted array** by repeatedly halving the search space — O(log n).

### How It Works
```
Array: [2, 5, 8, 12, 16, 23, 38, 56]
Target: 23

Step 1: low=0, high=7, mid=3, arr[3]=12 < 23 → search right
Step 2: low=4, high=7, mid=5, arr[5]=23 == 23 → FOUND at index 5!
```

### Implementation
```python
def binary_search(arr: list, target: int) -> int:
    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1  # Not found

# Example
nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(binary_search(nums, 23))   # 5
print(binary_search(nums, 100))  # -1
```

### Complexity
- **Time**: O(log n) — halves search space each step
- **Space**: O(1) iterative, O(log n) recursive

### Variants
- Find first/last occurrence in duplicate array
- Search in rotated sorted array
- Binary search on answer (for optimization problems)

### 🎯 Practice
Modify binary search to find the FIRST occurrence of a duplicate target."""


def _bubble_sort_response() -> str:
    return """## 📘 Bubble Sort

**Bubble Sort** repeatedly compares adjacent elements and swaps them if in wrong order.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        # Optimization: track if any swap happened
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:  # Already sorted
            break
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(arr))  # [11, 12, 22, 25, 34, 64, 90]
```

### Complexity
| Case | Time | Space |
|------|------|-------|
| Best | O(n) | O(1) |
| Average | O(n²) | O(1) |
| Worst | O(n²) | O(1) |

### When NOT to use
Bubble sort is mainly for teaching. For real projects, use:
- `sorted()` or `.sort()` in Python — TimSort O(n log n)
- `Arrays.sort()` in Java — Dual-pivot Quicksort

### 🎯 Practice
Implement Selection Sort and compare it to Bubble Sort."""


def _recursion_response(lang: str) -> str:
    return f"""## 📘 Recursion in {lang}

**Recursion** is when a function calls itself to solve a smaller version of the same problem.

### Three Rules of Recursion
1. **Base case** — stops the recursion
2. **Recursive case** — calls itself with a smaller problem
3. **Progress** — must move toward the base case

### Classic Examples
```python
# Factorial: n! = n × (n-1)!
def factorial(n):
    if n <= 1:          # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

print(factorial(5))  # 5 × 4 × 3 × 2 × 1 = 120

# Fibonacci sequence
def fibonacci(n):
    if n <= 1:          # Base cases: fib(0)=0, fib(1)=1
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(8)])  # [0, 1, 1, 2, 3, 5, 8, 13]

# Power function
def power(base, exp):
    if exp == 0:        # Base case: anything^0 = 1
        return 1
    return base * power(base, exp - 1)

print(power(2, 10))  # 1024
```

### Visualizing the Call Stack
```
factorial(3)
  └── factorial(2)
        └── factorial(1)
              └── returns 1
        └── returns 2 × 1 = 2
  └── returns 3 × 2 = 6
```

### ⚠️ Watch Out For
- **Stack overflow**: Too many recursive calls (no base case or wrong logic)
- **Exponential calls**: `fibonacci(n)` without memoization is O(2^n)
- **Use memoization/DP** to optimize repeated recursive calls

### 🎯 Practice
Write a recursive function to calculate the sum of all numbers in a nested list like `[1, [2, [3, 4]], 5]`."""


def _dp_response() -> str:
    return """## 📘 Dynamic Programming (DP)

**DP** solves problems by breaking them into overlapping subproblems, storing results to avoid recomputation.

### Two Approaches

**1. Top-Down (Memoization)** — recursive + cache
```python
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

print(fib_memo(50))  # Fast! ✅
```

**2. Bottom-Up (Tabulation)** — iterative, fill table
```python
def fib_dp(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]

# Classic: 0/1 Knapsack
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][capacity]
```

### When to use DP
✅ **Optimal substructure** — optimal solution contains optimal sub-solutions
✅ **Overlapping subproblems** — same subproblem solved multiple times

### Classic DP Problems
- Fibonacci, Factorial
- Longest Common Subsequence (LCS)
- Longest Increasing Subsequence (LIS)
- 0/1 Knapsack
- Coin Change
- Edit Distance

### 🎯 Practice
Solve the "Coin Change" problem: Given coins `[1, 3, 4]` and amount `6`, find minimum coins needed."""


def _big_o_response() -> str:
    return """## 📘 Big O Notation & Time Complexity

**Big O** describes how an algorithm's runtime grows relative to input size n.

### Common Complexities (Best → Worst)
| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access, hash lookup |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search, single loop |
| O(n log n) | Linearithmic | Merge sort, heap sort |
| O(n²) | Quadratic | Bubble sort, nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci |
| O(n!) | Factorial | Permutations |

### Visual Growth
```
n=100:  O(1)=1, O(log n)=7, O(n)=100, O(n²)=10,000, O(2ⁿ)=HUGE
```

### Code Examples
```python
# O(1) — constant
def get_first(arr): return arr[0]

# O(n) — linear
def find_max(arr):
    max_val = arr[0]
    for x in arr:        # One loop
        if x > max_val:
            max_val = x
    return max_val

# O(n²) — quadratic
def has_duplicates(arr):
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):  # Nested loop
            if arr[i] == arr[j]:
                return True
    return False

# O(log n) — logarithmic
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
```

### Space Complexity
Also O notation, but for **memory** usage:
- In-place sorting: O(1) space
- Recursive algorithms: O(depth) stack space

### 🎯 Practice
What is the time complexity of: Two nested loops + one binary search on n elements?"""


def _react_response() -> str:
    return """## 📘 React — Getting Started

**React** is a JavaScript library for building interactive user interfaces using **components**.

### Core Concepts

**1. Component** — reusable UI piece
```jsx
// Functional component (modern React)
function Greeting({ name, age }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}! 👋</h1>
      <p>Age: {age}</p>
    </div>
  );
}

// Usage
<Greeting name="Alice" age={25} />
```

**2. useState — local state**
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**3. useEffect — side effects**
```jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // Empty array = run once on mount

  if (loading) return <div>Loading...</div>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### React Folder Structure
```
src/
├── components/    # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom hooks
├── context/       # Global state
├── services/      # API calls
└── App.jsx        # Root component
```

### 🎯 Practice
Build a simple TODO app with add/delete functionality using useState."""


def _useeffect_response() -> str:
    return """## 📘 React useEffect Hook

`useEffect` runs **side effects** after rendering — data fetching, subscriptions, DOM manipulation.

### Dependency Array Rules
```jsx
useEffect(() => { /* runs on EVERY render */ });
useEffect(() => { /* runs ONCE on mount */ }, []);
useEffect(() => { /* runs when dep changes */ }, [dep]);
useEffect(() => {
  return () => { /* CLEANUP on unmount */ };
}, []);
```

### Complete Example
```jsx
import { useState, useEffect } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    let cancelled = false;  // Prevent race conditions
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;  // Cleanup if query changes before fetch completes
    };
  }, [query]); // Re-run when query changes

  if (loading) return <p>Searching...</p>;
  return <ul>{results.map(r => <li key={r.id}>{r.title}</li>)}</ul>;
}
```

### ⚠️ Common Mistakes
- **Infinite loop**: Updating state inside effect without proper dependencies
- **Missing cleanup**: Not cancelling async operations on unmount
- **Stale closure**: Using outdated values from outer scope

### 🎯 Practice
Create a component that shows the window size and updates when the window is resized using useEffect."""


def _async_response(lang: str) -> str:
    return f"""## 📘 Async Programming in {lang}

Async programming lets your code handle slow operations (API calls, file I/O) without blocking.

### JavaScript — async/await
```javascript
// The modern way to handle async operations
async function fetchUser(id) {{
  try {{
    const response = await fetch(`/api/users/${{id}}`);
    
    if (!response.ok) {{
      throw new Error(`HTTP error! status: ${{response.status}}`);
    }}
    
    const user = await response.json();
    return user;
  }} catch (error) {{
    console.error('Failed to fetch user:', error);
    throw error;
  }}
}}

// Multiple concurrent requests
async function fetchUserAndPosts(userId) {{
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetch(`/api/posts?userId=${{userId}}`).then(r => r.json())
  ]);
  return {{ user, posts }};
}}
```

### Python — async/await (asyncio)
```python
import asyncio
import httpx

async def fetch_user(client, user_id: int):
    response = await client.get(f"https://api.example.com/users/{{user_id}}")
    return response.json()

async def fetch_multiple_users(user_ids: list):
    async with httpx.AsyncClient() as client:
        tasks = [fetch_user(client, uid) for uid in user_ids]
        users = await asyncio.gather(*tasks)  # Run concurrently
    return users

# Run
users = asyncio.run(fetch_multiple_users([1, 2, 3, 4, 5]))
```

### 🎯 Practice
Write an async function that fetches data from 5 URLs concurrently and returns all results."""


def _promise_response() -> str:
    return """## 📘 JavaScript Promises

A **Promise** represents an eventual result of an async operation.

### States
```
Pending → Fulfilled (resolved)
       → Rejected
```

### Creating & Using Promises
```javascript
// Creating a Promise
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Promise chain
fetch('/api/user/1')
  .then(response => response.json())
  .then(user => {
    console.log(user.name);
    return fetch(`/api/posts?userId=${user.id}`);
  })
  .then(response => response.json())
  .then(posts => console.log(posts))
  .catch(error => console.error('Error:', error))
  .finally(() => console.log('Done'));

// Modern: async/await (cleaner)
async function getUserPosts(userId) {
  const userResp = await fetch(`/api/user/${userId}`);
  const user = await userResp.json();
  
  const postsResp = await fetch(`/api/posts?userId=${user.id}`);
  return postsResp.json();
}

// Promise.all — run in parallel
const [users, products] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/products').then(r => r.json())
]);
```

### 🎯 Practice
Implement a `retry(fn, maxAttempts, delay)` function that retries a Promise-returning function on failure."""


def _rest_api_response() -> str:
    return """## 📘 REST API Design

**REST** (Representational State Transfer) is the standard for web APIs.

### HTTP Methods
| Method | Use | Example |
|--------|-----|---------|
| GET | Read | `GET /api/users` — list all users |
| POST | Create | `POST /api/users` — create new user |
| PUT | Replace | `PUT /api/users/1` — replace user 1 |
| PATCH | Update | `PATCH /api/users/1` — partial update |
| DELETE | Delete | `DELETE /api/users/1` — delete user 1 |

### Example: FastAPI REST API
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    age: int

users_db = []

@app.get("/api/users", response_model=List[User])
async def get_users():
    return users_db

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/users", response_model=User, status_code=201)
async def create_user(user: User):
    user.id = len(users_db) + 1
    users_db.append(user)
    return user

@app.delete("/api/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    global users_db
    users_db = [u for u in users_db if u.id != user_id]
```

### HTTP Status Codes
- **200**: OK, **201**: Created, **204**: No Content
- **400**: Bad Request, **401**: Unauthorized, **403**: Forbidden, **404**: Not Found
- **500**: Internal Server Error, **503**: Service Unavailable

### 🎯 Practice
Design REST API endpoints for a Blog app with Posts and Comments."""


def _sql_response() -> str:
    return """## 📘 SQL — Structured Query Language

**SQL** is the language for interacting with relational databases.

### Core Operations (CRUD)
```sql
-- CREATE TABLE
CREATE TABLE students (
    id       INT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) UNIQUE NOT NULL,
    grade    DECIMAL(5,2),
    enrolled DATE DEFAULT CURRENT_DATE
);

-- INSERT (Create)
INSERT INTO students (name, email, grade)
VALUES ('Alice Smith', 'alice@example.com', 92.5);

-- SELECT (Read)
SELECT name, email, grade
FROM students
WHERE grade >= 90
ORDER BY grade DESC
LIMIT 10;

-- UPDATE
UPDATE students
SET grade = grade + 2
WHERE name = 'Alice Smith';

-- DELETE
DELETE FROM students
WHERE grade < 50;

-- Aggregate functions
SELECT 
    AVG(grade) AS avg_grade,
    MAX(grade) AS top_grade,
    MIN(grade) AS low_grade,
    COUNT(*) AS total_students
FROM students;

-- GROUP BY
SELECT grade >= 90 AS passing, COUNT(*) as count
FROM students
GROUP BY (grade >= 90)
HAVING COUNT(*) > 1;
```

### 🎯 Practice
Write a query to find all students whose grade is above the class average."""


def _sql_joins_response() -> str:
    return """## 📘 SQL JOINs

JOINs combine rows from multiple tables based on a related column.

```sql
-- Tables setup
-- students: id, name, class_id
-- classes:  id, class_name, teacher

-- INNER JOIN — only matching rows
SELECT s.name, c.class_name, c.teacher
FROM students s
INNER JOIN classes c ON s.class_id = c.id;

-- LEFT JOIN — all students, even without a class
SELECT s.name, COALESCE(c.class_name, 'Not enrolled') AS class
FROM students s
LEFT JOIN classes c ON s.class_id = c.id;

-- RIGHT JOIN — all classes, even empty ones
SELECT s.name, c.class_name
FROM students s
RIGHT JOIN classes c ON s.class_id = c.id;

-- FULL OUTER JOIN — all rows from both tables
SELECT s.name, c.class_name
FROM students s
FULL OUTER JOIN classes c ON s.class_id = c.id;

-- Self JOIN — compare rows in same table
SELECT a.name AS student, b.name AS buddy
FROM students a
JOIN students b ON a.class_id = b.class_id
WHERE a.id != b.id;
```

### Visual Guide
```
INNER: (A ∩ B)     LEFT: (A + A∩B)
RIGHT: (B + A∩B)   FULL: (A ∪ B)
```

### 🎯 Practice
Write a query to find all students who have NOT submitted any assignment using LEFT JOIN."""


def _normalization_response() -> str:
    return """## 📘 Database Normalization

Normalization eliminates redundancy and ensures data integrity.

### Normal Forms

**1NF (First Normal Form)**
- Atomic values (no lists/arrays in cells)
- Each column has a single data type
- Unique rows (primary key)

**2NF (Second Normal Form)**
- Must be in 1NF
- No partial dependencies (non-key columns depend on ALL of the primary key)

**3NF (Third Normal Form)**
- Must be in 2NF
- No transitive dependencies (non-key column depends on another non-key column)

### Example
```
BEFORE (bad — redundant):
OrderID | CustomerName | CustomerEmail | ProductName | Price
1       | Alice        | alice@x.com   | Laptop      | 999
2       | Alice        | alice@x.com   | Mouse       | 29

AFTER 3NF (clean):
Customers: id, name, email
Products:  id, name, price
Orders:    id, customer_id (FK), product_id (FK), qty, date
```

### When to Denormalize
For **read-heavy systems** (analytics, reporting), controlled denormalization can improve query performance at the cost of some redundancy.

### 🎯 Practice
Normalize this table into 3NF:
`StudentCourse(student_id, student_name, course_id, course_name, instructor_id, instructor_name, grade)`"""


def _db_index_response() -> str:
    return """## 📘 Database Indexes

An **index** speeds up queries by creating a sorted data structure (B-Tree or Hash) for fast lookup — like a book's index.

```sql
-- Create index on frequently queried column
CREATE INDEX idx_student_name ON students(name);

-- Composite index (for queries filtering by both columns)
CREATE INDEX idx_name_grade ON students(name, grade);

-- Unique index (also enforces uniqueness)
CREATE UNIQUE INDEX idx_email ON students(email);

-- Drop index
DROP INDEX idx_student_name ON students;

-- Check query performance (MySQL)
EXPLAIN SELECT * FROM students WHERE name = 'Alice';
-- Shows: type=ref (index used ✅) vs type=ALL (full table scan ❌)
```

### When to Add an Index
✅ Columns in WHERE clauses
✅ Foreign key columns (JOINs)
✅ ORDER BY / GROUP BY columns
✅ Frequently searched columns

### When NOT to Index
❌ Small tables (full scan is fine)
❌ Columns rarely used in queries
❌ Tables with heavy INSERT/UPDATE (indexes slow writes)

### 🎯 Practice
You have a `orders` table with 10M rows. Query: `SELECT * FROM orders WHERE customer_id = 5 AND status = 'pending'`. Which index would help most?"""


def _neural_network_response() -> str:
    return """## 📘 Neural Networks

A **Neural Network** is a computational model inspired by the brain, made of layers of connected neurons.

### Architecture
```
Input Layer    Hidden Layers    Output Layer
  [x1]  ────→  [h1][h2]  ────→    [y1]
  [x2]  ────→  [h3][h4]  ────→    [y2]
  [x3]  ────→  [h5][h6]  ────→
```

### Simple Neural Network with PyTorch
```python
import torch
import torch.nn as nn
import torch.optim as optim

# Define the network
class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)
        )
    
    def forward(self, x):
        return self.network(x)

# Create model
model = SimpleNN(input_size=784, hidden_size=256, output_size=10)

# Training setup
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Training step
def train_step(X_batch, y_batch):
    optimizer.zero_grad()
    predictions = model(X_batch)
    loss = criterion(predictions, y_batch)
    loss.backward()
    optimizer.step()
    return loss.item()
```

### Key Concepts
- **Activation Functions**: ReLU, Sigmoid, Tanh, Softmax
- **Backpropagation**: How the network learns (chain rule of derivatives)
- **Loss Function**: Measures error (MSE, Cross-entropy)
- **Optimizer**: Updates weights (SGD, Adam, RMSprop)
- **Epoch**: One full pass through training data

### 🎯 Practice
Build a neural network to classify handwritten digits (MNIST) using PyTorch or TensorFlow."""


def _ml_intro_response() -> str:
    return """## 📘 Machine Learning Introduction

**Machine Learning** is a subset of AI where systems learn patterns from data without explicit programming.

### Types of ML
```
Machine Learning
├── Supervised Learning (labeled data)
│   ├── Classification (predict category)
│   └── Regression (predict value)
├── Unsupervised Learning (no labels)
│   ├── Clustering (group similar data)
│   └── Dimensionality Reduction (PCA, t-SNE)
└── Reinforcement Learning (reward-based)
```

### Simple Example with Scikit-learn
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 1. Load data
iris = load_iris()
X, y = iris.data, iris.target

# 2. Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Preprocess
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# 4. Train
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(classification_report(y_test, y_pred, target_names=iris.target_names))
```

### ML Workflow
1. **Data Collection** → 2. **Preprocessing** → 3. **Feature Engineering** → 4. **Model Selection** → 5. **Training** → 6. **Evaluation** → 7. **Deployment**

### 🎯 Practice
Train a model to predict house prices using the Boston Housing dataset."""


def _transformer_response() -> str:
    return """## 📘 Transformers & Self-Attention

**Transformers** power modern LLMs (GPT, BERT, LLaMA). The key innovation is **Self-Attention**.

### Self-Attention Formula
```
Attention(Q, K, V) = softmax(QKᵀ / √d_k) × V

Q = Query (what am I looking for?)
K = Key   (what do I contain?)
V = Value (what information do I provide?)
```

### PyTorch Implementation
```python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    
    # Compute attention scores
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))
    
    # Softmax to get attention weights
    weights = F.softmax(scores, dim=-1)
    
    # Weighted sum of values
    return torch.matmul(weights, V), weights

# Multi-Head Attention
class MultiHeadAttention(torch.nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_k = d_model // num_heads
        self.num_heads = num_heads
        self.W_q = torch.nn.Linear(d_model, d_model)
        self.W_k = torch.nn.Linear(d_model, d_model)
        self.W_v = torch.nn.Linear(d_model, d_model)
        self.W_o = torch.nn.Linear(d_model, d_model)

    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        # Split into multiple heads
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        x, _ = scaled_dot_product_attention(Q, K, V, mask)
        x = x.transpose(1, 2).contiguous().view(batch_size, -1, self.num_heads * self.d_k)
        return self.W_o(x)
```

### Why Transformers Won
- **Parallelizable**: Unlike RNNs, processes all tokens simultaneously
- **Long-range dependencies**: Attention can link any two tokens directly
- **Scalable**: Performance improves with more parameters and data

### 🎯 Practice
Explain the difference between encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) transformer architectures."""


def _function_response(lang: str) -> str:
    return f"""## 📘 Functions in {lang}

A **function** is a named, reusable block of code that performs a specific task.

```python
# Basic function
def greet(name: str) -> str:
    \"\"\"Returns a greeting message.\"\"\"
    return f"Hello, {{name}}!"

# Default parameters
def power(base: float, exponent: int = 2) -> float:
    return base ** exponent

# *args and **kwargs — flexible arguments
def calculate(*numbers, operation="sum"):
    if operation == "sum":
        return sum(numbers)
    elif operation == "product":
        result = 1
        for n in numbers: result *= n
        return result

# Lambda (anonymous function)
square = lambda x: x ** 2
print(square(5))  # 25

# Higher-order functions
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
squares = list(map(lambda x: x**2, numbers))
```

### Best Practices
- Functions should do **one thing** (Single Responsibility)
- Keep functions **short** (< 20 lines ideally)
- Use **descriptive names**: `calculate_total_price()` not `calc()`
- Always add **docstrings** for complex functions
- Return meaningful values or use None explicitly

### 🎯 Practice
Write a function `is_palindrome(s)` that checks if a string reads the same forwards and backwards (ignore case and spaces)."""


def _loop_response(lang: str) -> str:
    return f"""## 📘 Loops in {lang}

Loops repeat a block of code multiple times.

### Types of Loops
```python
# FOR loop — iterate over a sequence
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Range-based loop
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 10, 2): # 1, 3, 5, 7, 9 (start, stop, step)
    print(i)

# WHILE loop — run while condition is True
count = 0
while count < 5:
    print(f"Count: {{count}}")
    count += 1

# Loop control
for i in range(10):
    if i == 3:
        continue    # Skip this iteration
    if i == 7:
        break       # Exit loop entirely
    print(i)       # Prints 0,1,2,4,5,6

# else clause (runs if loop didn't break)
for i in range(5):
    print(i)
else:
    print("Loop completed normally!")

# Enumerate — get index AND value
for index, value in enumerate(fruits):
    print(f"{{index}}: {{value}}")

# zip — iterate over multiple lists
names = ["Alice", "Bob", "Charlie"]
scores = [95, 87, 92]
for name, score in zip(names, scores):
    print(f"{{name}}: {{score}}")
```

### ⚠️ Common Mistakes
- Off-by-one errors: `range(n)` is 0 to n-1
- Modifying a list while iterating (use copy)
- Infinite loop: forgetting to update loop condition

### 🎯 Practice
Write a loop to find all prime numbers up to 100 (Sieve of Eratosthenes)."""


def _array_response(lang: str) -> str:
    return f"""## 📘 Arrays / Lists in {lang}

An **array** stores multiple values of the same type in contiguous memory.

```python
# Python List (dynamic array — can hold mixed types)
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, [1, 2]]

# Common operations — all O(1) unless noted
numbers.append(6)       # Add to end — O(1)
numbers.insert(0, 0)    # Insert at index — O(n)
numbers.remove(3)       # Remove first occurrence — O(n)
popped = numbers.pop()  # Remove from end — O(1)
popped = numbers.pop(0) # Remove from start — O(n)

# Slicing
first_three = numbers[:3]   # [0, 1, 2]
last_two = numbers[-2:]     # last 2 elements
reversed_list = numbers[::-1]  # Reverse
every_other = numbers[::2]     # Every 2nd element

# Useful methods
numbers.sort()               # In-place sort
sorted_copy = sorted(numbers)  # New sorted list
numbers.reverse()
length = len(numbers)
max_val = max(numbers)
min_val = min(numbers)
total = sum(numbers)

# List comprehension
squares = [x**2 for x in range(1, 11)]
evens = [x for x in range(20) if x % 2 == 0]
```

### Time Complexity
| Operation | Time |
|-----------|------|
| Access arr[i] | O(1) |
| Append | O(1) amortized |
| Insert at index | O(n) |
| Search (unsorted) | O(n) |
| Search (sorted) | O(log n) |

### 🎯 Practice
Given `[1, 2, 3, 4, 5, 6]`, rotate the array right by k positions in-place."""


def _class_response(lang: str) -> str:
    return f"""## 📘 Classes & Objects in {lang}

A **class** is a blueprint for creating objects. An **object** is an instance of a class.

```python
class Student:
    # Class attribute (shared by all instances)
    school_name = "SkillPath Academy"
    student_count = 0

    def __init__(self, name: str, age: int, grade: float):
        # Instance attributes (unique to each object)
        self.name = name
        self.age = age
        self.grade = grade
        self.courses = []
        Student.student_count += 1

    def enroll(self, course: str) -> None:
        \"\"\"Enroll in a course.\"\"\"
        self.courses.append(course)
        print(f"{{self.name}} enrolled in {{course}}")

    def get_status(self) -> str:
        \"\"\"Return pass/fail status.\"\"\"
        return "Pass" if self.grade >= 50 else "Fail"

    @classmethod
    def get_total_students(cls) -> int:
        \"\"\"Class method — accesses class state.\"\"\"
        return cls.student_count

    @staticmethod
    def is_valid_grade(grade: float) -> bool:
        \"\"\"Static method — no instance or class needed.\"\"\"
        return 0 <= grade <= 100

    def __repr__(self) -> str:
        return f"Student({{self.name}}, age={{self.age}}, grade={{self.grade}})"

# Usage
s1 = Student("Alice", 20, 92.5)
s2 = Student("Bob", 22, 45.0)
s1.enroll("Python")
print(s1)                          # Student(Alice, age=20, grade=92.5)
print(s1.get_status())             # Pass
print(Student.get_total_students()) # 2
print(Student.is_valid_grade(105)) # False
```

### Dunder Methods (Magic Methods)
`__init__`, `__repr__`, `__str__`, `__len__`, `__eq__`, `__lt__`, `__add__`, `__iter__`

### 🎯 Practice
Create a `BankAccount` class with `deposit()`, `withdraw()` (with balance check), and `__repr__()` methods."""


def _variable_response(lang: str) -> str:
    return f"""## 📘 Variables & Data Types in {lang}

A **variable** is a named container for storing data.

```python
# Python — dynamic typing (no need to declare type)
name = "Alice"           # str
age = 25                 # int
height = 5.7             # float
is_student = True        # bool
grades = [90, 85, 92]    # list
info = {{"city": "NY"}}   # dict
nothing = None           # NoneType

# Type checking
print(type(name))        # <class 'str'>
print(isinstance(age, int))  # True

# Type conversion
num_str = str(42)         # "42"
float_num = float("3.14") # 3.14
int_num = int(3.9)        # 3 (truncates, doesn't round)

# Multiple assignment
x = y = z = 0
a, b, c = 1, 2, 3
first, *rest = [1, 2, 3, 4, 5]  # first=1, rest=[2,3,4,5]

# Constants (convention: ALL_CAPS)
MAX_SIZE = 100
PI = 3.14159
```

### Scope
```python
global_var = "I'm global"

def my_func():
    local_var = "I'm local"     # Only inside function
    global global_var           # Access outer scope
    global_var = "Modified"

my_func()
print(global_var)  # Modified
# print(local_var) → NameError!
```

### 🎯 Practice
What is the output of: `a, b = 1, 2; a, b = b, a; print(a, b)`?"""


def _pointer_response() -> str:
    return """## 📘 Pointers in C/C++

A **pointer** stores the memory address of another variable.

```c
#include <stdio.h>

int main() {
    int num = 42;
    int *ptr = &num;  // ptr stores address of num

    printf("Value: %d\\n", num);      // 42
    printf("Address: %p\\n", &num);   // e.g., 0x7ffd5fb3e8bc
    printf("Via pointer: %d\\n", *ptr); // 42 (dereference)

    *ptr = 100;  // Modify value through pointer
    printf("After: %d\\n", num);  // 100

    // Pointer arithmetic
    int arr[] = {10, 20, 30, 40, 50};
    int *p = arr;  // Points to first element

    for (int i = 0; i < 5; i++) {
        printf("%d ", *(p + i));  // 10 20 30 40 50
    }

    // Dynamic memory
    int *dynamic = (int*)malloc(5 * sizeof(int));
    if (dynamic == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }
    free(dynamic);  // ALWAYS free dynamic memory!

    return 0;
}
```

### Common Pointer Mistakes
1. **Null pointer dereference**: Dereferencing a NULL pointer → Segfault
2. **Memory leak**: Allocating with malloc but never calling free
3. **Dangling pointer**: Using pointer after free
4. **Buffer overflow**: Writing past array bounds

### Modern C++ Alternative: Smart Pointers
```cpp
#include <memory>

auto ptr = std::make_unique<int>(42);    // Auto-freed
auto sptr = std::make_shared<int>(42);   // Reference counted
// No need to call delete!
```

### 🎯 Practice
Write a C function `swap(int *a, int *b)` that swaps two integers using pointers."""


def _git_response() -> str:
    return """## 📘 Git — Version Control

**Git** tracks changes to your code and enables collaboration.

### Essential Commands
```bash
# Setup
git init                    # Initialize new repo
git clone <url>             # Clone existing repo

# Daily workflow
git status                  # See what changed
git add filename.py         # Stage specific file
git add .                   # Stage all changes
git commit -m "feat: add login page"  # Save snapshot

# Branching
git branch feature/login    # Create branch
git checkout feature/login  # Switch to branch
git checkout -b feature/login  # Create AND switch
git merge feature/login     # Merge into current branch
git branch -d feature/login # Delete branch

# Remote
git remote add origin <url>     # Link to GitHub
git push origin main             # Upload changes
git pull origin main             # Download changes
git fetch --all                  # Download without merging

# History
git log --oneline               # See commit history
git diff                        # See uncommitted changes
git diff HEAD~1                 # Compare to last commit

# Undo
git restore filename.py         # Discard changes
git reset HEAD~1 --soft         # Undo last commit (keep changes)
git reset HEAD~1 --hard         # ⚠️ Undo last commit AND changes
git revert <commit-hash>        # Safe undo (creates new commit)

# Stash
git stash                      # Temporarily save changes
git stash pop                  # Restore saved changes
```

### Git Workflow (Feature Branch)
```
main ──────────────────────────────→
       ↘ feature/login ──────────↗
         commit → commit → PR → merge
```

### Commit Message Convention
```
feat: add user authentication
fix: resolve login redirect bug
docs: update README
style: format code with prettier
test: add unit tests for auth service
```

### 🎯 Practice
Simulate a merge conflict: create two branches, modify the same line, then merge and resolve the conflict."""


def _docker_response() -> str:
    return """## 📘 Docker — Containerization

**Docker** packages apps + dependencies into portable **containers** that run anywhere.

### Key Concepts
```
Dockerfile → Image → Container
(recipe)     (snapshot) (running app)
```

### Basic Dockerfile
```dockerfile
# Python Flask app example
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Essential Commands
```bash
# Build image
docker build -t my-app:1.0 .

# Run container
docker run -p 8000:8000 my-app:1.0

# Run in background
docker run -d -p 8000:8000 --name my-container my-app:1.0

# View running containers
docker ps

# Stop container
docker stop my-container

# View logs
docker logs my-container

# Execute command inside container
docker exec -it my-container bash
```

### Docker Compose (multi-container)
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db/mydb
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 🎯 Practice
Create a Dockerfile for a Node.js Express app and run it with docker-compose alongside a MongoDB container."""


def _api_response() -> str:
    return """## 📘 APIs — Application Programming Interfaces

An **API** is a contract that lets different software communicate with each other.

### Types of APIs
- **REST API**: HTTP-based, uses JSON, most common
- **GraphQL**: Query exactly what you need
- **WebSocket**: Real-time bidirectional communication
- **gRPC**: High-performance, binary protocol

### Consuming a REST API (JavaScript)
```javascript
// Modern fetch with error handling
async function getWeather(city) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      city: data.name,
      temp: Math.round(data.main.temp - 273.15), // Kelvin to Celsius
      description: data.weather[0].description
    };
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

const weather = await getWeather('London');
console.log(`${weather.city}: ${weather.temp}°C, ${weather.description}`);
```

### Consuming a REST API (Python)
```python
import httpx
import os

async def get_github_user(username: str):
    headers = {"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/users/{username}",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
```

### 🎯 Practice
Call the free JSONPlaceholder API (`https://jsonplaceholder.typicode.com/posts`) and display the first 5 post titles."""


def _generic_roadmap_response(lang: str) -> str:
    roadmaps = {
        "Python": """## 🗺️ Python Learning Roadmap

### Phase 1 — Fundamentals (2-3 weeks)
```
Python Syntax → Variables & Data Types → Operators
      ↓
Conditions (if/elif/else) → Loops (for/while) → Functions
      ↓
Data Structures: Lists → Tuples → Dicts → Sets
      ↓
String Manipulation → File I/O → Exception Handling
```

### Phase 2 — Intermediate (3-4 weeks)
```
OOP: Classes → Inheritance → Polymorphism → Decorators
      ↓
Modules & Packages → pip → Virtual Environments
      ↓
Comprehensions → Generators → Iterators → Lambda
      ↓
Standard Library: os, sys, json, datetime, pathlib
```

### Phase 3 — Advanced (4-6 weeks)
```
Concurrency: Threading → Multiprocessing → asyncio
      ↓
Testing: unittest → pytest → TDD
      ↓
Choose Path:
├── Web Dev: Django / FastAPI / Flask
├── Data Science: NumPy → Pandas → Matplotlib → Scikit-learn
├── AI/ML: TensorFlow / PyTorch
└── Automation: Selenium / BeautifulSoup / Scrapy
```

### Phase 4 — Projects
- CLI Task Manager
- Web Scraper
- REST API with FastAPI
- Data Analysis project
- ML classification model

### Resources
- Official docs: docs.python.org
- Practice: LeetCode, HackerRank
- Projects: Real Python, Python.org""",

        "JavaScript": """## 🗺️ JavaScript Learning Roadmap

### Phase 1 — Fundamentals (2-3 weeks)
```
Variables (var/let/const) → Data Types → Operators
      ↓
Control Flow → Functions → Scope & Closures
      ↓
Arrays & Objects → Array methods (map/filter/reduce)
      ↓
DOM Manipulation → Events → Browser APIs
```

### Phase 2 — Modern JS (2-3 weeks)
```
ES6+: Arrow functions → Destructuring → Spread/Rest
      ↓
Promises → async/await → Fetch API
      ↓
Modules (import/export) → Classes → Iterators
      ↓
Error Handling → Debugging → Chrome DevTools
```

### Phase 3 — Frameworks (6-8 weeks)
```
Choose:
├── React (most popular)
│   └── JSX → Hooks → Context → React Router → Next.js
├── Vue.js (beginner friendly)
└── Angular (enterprise)
      ↓
State Management: Redux / Zustand / Pinia
      ↓
Testing: Jest → React Testing Library
```

### Phase 4 — Backend (optional)
```
Node.js → Express.js / Fastify → REST API
      ↓
Databases: MongoDB / PostgreSQL with ORM
      ↓
Auth: JWT → OAuth → Sessions
```""",
    }

    if lang in roadmaps:
        return roadmaps[lang]

    return f"""## 🗺️ {lang} Learning Roadmap

### Phase 1 — Fundamentals (2-3 weeks)
```
Syntax & Setup → Variables & Data Types → Operators
      ↓
Control Flow (conditions, loops) → Functions
      ↓
Data Structures → Error Handling → File I/O
```

### Phase 2 — Core Concepts (3-4 weeks)
```
OOP / Functional Patterns → Modules & Packages
      ↓
Standard Library → Common Third-Party Libraries
      ↓
Testing → Debugging → Code Quality Tools
```

### Phase 3 — Specialized Track (4-6 weeks)
```
Choose based on goal:
├── Web Development
├── Data Science / AI
├── Mobile Development
├── System Programming
└── DevOps / Automation
```

### Phase 4 — Build Projects
1. Simple CLI application
2. Small web service or API
3. Full project in your chosen track

### Practice Resources
- Official documentation
- LeetCode / HackerRank for algorithms
- GitHub for open source contributions"""


# ---------------------------------------------------------------------------
# REMAINING SERVICE FUNCTIONS
# ---------------------------------------------------------------------------
async def analyze_skill_gaps(topic_scores: Dict[str, float]) -> Dict[str, Any]:
    """AI-powered skill gap analysis with fallback."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return _fallback_gap_analysis(topic_scores)

    gaps = [t for t, s in topic_scores.items() if s < 40]
    needs_practice = [t for t, s in topic_scores.items() if 40 <= s < 70]

    prompt = f"""Analyze these programming competency scores and provide learning recommendations:
{topic_scores}

Gaps (below 40%): {gaps}
Needs practice (40-69%): {needs_practice}

Return a JSON-style analysis with: priority topics to study, estimated improvement time, key concepts to focus on. Keep it brief and actionable."""

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json={"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
            )
            if resp.status_code == 200:
                data = resp.json()
                analysis_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"ai_analysis": analysis_text, "gaps": gaps, "needs_practice": needs_practice}
    except Exception:
        pass

    return _fallback_gap_analysis(topic_scores)


def _fallback_gap_analysis(topic_scores: Dict[str, float]) -> Dict[str, Any]:
    gaps = [t for t, s in topic_scores.items() if s < 40]
    needs_practice = [t for t, s in topic_scores.items() if 40 <= s < 70]
    strong = [t for t, s in topic_scores.items() if s >= 70]

    recommendations = []
    for topic in gaps:
        recommendations.append({
            "topic": topic, "priority": "high",
            "message": f"Focus intensively on {topic} — current score below 40%.",
            "estimated_time": "2-3 hours"
        })
    for topic in needs_practice:
        recommendations.append({
            "topic": topic, "priority": "medium",
            "message": f"Practice more {topic} exercises to reach Advanced level.",
            "estimated_time": "1-2 hours"
        })

    return {
        "gaps": gaps, "needs_practice": needs_practice, "strong": strong,
        "recommendations": recommendations,
        "ai_analysis": "Analysis generated using local scoring engine."
    }


async def generate_questions(topic: str, difficulty: str = "intermediate", count: int = 3) -> list:
    """Generate practice questions for a topic."""
    fallback_bank = {
        "OOP": [
            {"type": "mcq", "question": "What does __init__ do?", "options": ["Deletes object", "Initializes attributes", "Inherits class", "None"], "correct": 1},
            {"type": "short_answer", "question": "Explain polymorphism with an example."},
            {"type": "practical", "question": "Create a class 'Circle' with area() and circumference() methods."}
        ],
        "File Handling": [
            {"type": "mcq", "question": "Which mode overwrites an existing file?", "options": ["r", "a", "w", "x"], "correct": 2},
            {"type": "practical", "question": "Write a function to count lines containing 'error' in a file."},
        ],
        "Functions": [
            {"type": "mcq", "question": "What does lambda create?", "options": ["A class", "Anonymous function", "A module", "A loop"], "correct": 1},
            {"type": "practical", "question": "Write a recursive factorial function."},
        ]
    }
    return fallback_bank.get(topic, [
        {"type": "mcq", "question": f"Which concept is central to {topic}?", "options": ["A", "B", "C", "D"], "correct": 0},
        {"type": "short_answer", "question": f"Explain the main idea of {topic} in your own words."}
    ])
