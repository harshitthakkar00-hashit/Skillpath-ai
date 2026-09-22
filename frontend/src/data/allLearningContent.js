// Learning content for every language — explanation, key points, example, practice

export const CONTENT_BY_SUBJECT = {

  javascript: {
    'JS Basics': {
      title: 'JavaScript Basics', icon: '⚡', duration: '20 min', difficulty: 'Beginner',
      summary: 'Variables, data types, and core JS syntax.',
      explanation: `JavaScript is the language of the web — it runs in the browser and on servers (Node.js).

**Variables:**
\`\`\`javascript
let name = "Alice";        // block-scoped, reassignable
const age = 25;            // block-scoped, NOT reassignable
var old = "avoid this";    // function-scoped, hoisted
\`\`\`

**Data Types:**
\`\`\`javascript
let str = "hello";         // string
let num = 42;              // number
let bool = true;           // boolean
let arr = [1, 2, 3];       // array
let obj = { x: 1 };        // object
let nothing = null;        // null
let undef;                 // undefined
\`\`\`

**Template Literals:**
\`\`\`javascript
let greeting = \`Hello, \${name}! You are \${age} years old.\`;
\`\`\``,
      keyPoints: [
        'Always use const by default; use let only if you need to reassign',
        'Never use var in modern JavaScript',
        '=== checks both value AND type (always prefer over ==)',
        'JavaScript is dynamically typed — no need to declare types',
      ],
      example: `const user = { name: "Alice", age: 20, active: true };

// Destructuring
const { name, age } = user;

// Spread operator
const updated = { ...user, age: 21 };

console.log(\`\${name} is \${updated.age}\`); // Alice is 21`,
      practicePrompt: 'Create an object representing a product with name, price, and stock. Write a function that returns a discount price if stock > 100.'
    },
    'Async JS': {
      title: 'Async JavaScript', icon: '⏳', duration: '35 min', difficulty: 'Intermediate',
      summary: 'Promises, async/await, and fetching data.',
      explanation: `JavaScript is single-threaded but handles async operations via the event loop.

**Promises:**
\`\`\`javascript
fetch("https://api.example.com/users")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
\`\`\`

**async/await (cleaner):**
\`\`\`javascript
async function getUsers() {
  try {
    const res = await fetch("https://api.example.com/users");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed:", err);
  }
}
\`\`\`

**Run multiple in parallel:**
\`\`\`javascript
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json())
]);
\`\`\``,
      keyPoints: [
        'async functions always return a Promise',
        'await pauses execution inside an async function only',
        'Use Promise.all() to run multiple async operations in parallel',
        'Always use try/catch with async/await for error handling',
      ],
      example: `async function getUserById(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

// Usage
getUserById(1).then(user => console.log(user.name));`,
      practicePrompt: 'Write an async function that fetches posts from https://jsonplaceholder.typicode.com/posts, filters only posts with userId === 1, and returns their titles.'
    },
  },

  java: {
    'Java Basics': {
      title: 'Java Basics', icon: '☕', duration: '25 min', difficulty: 'Beginner',
      summary: 'Syntax, variables, data types, and methods.',
      explanation: `Java is a statically-typed, object-oriented language that runs on the JVM.

**Hello World:**
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

**Variables & Types:**
\`\`\`java
int age = 25;
double price = 99.99;
boolean active = true;
String name = "Alice";  // String is a class, not primitive
\`\`\`

**Methods:**
\`\`\`java
public static int add(int a, int b) {
    return a + b;
}
\`\`\``,
      keyPoints: [
        'Java is strongly typed — you must declare variable types',
        'Every Java program needs a class and a main() method',
        'String is an object in Java, not a primitive type',
        'Java uses semicolons and curly braces for blocks',
      ],
      example: `public class Calculator {
    public static double circle_area(double radius) {
        return Math.PI * radius * radius;
    }
    
    public static void main(String[] args) {
        double area = circle_area(5.0);
        System.out.printf("Area: %.2f%n", area);
    }
}`,
      practicePrompt: 'Write a Java method that checks if a number is prime. Test it for numbers 2–20.'
    },
  },

  cpp: {
    'C++ Basics': {
      title: 'C++ Basics', icon: '⚙️', duration: '25 min', difficulty: 'Beginner',
      summary: 'Syntax, variables, I/O, and functions.',
      explanation: `C++ is a powerful, high-performance language combining OOP with low-level control.

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    string name = "Alice";
    int age = 20;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
\`\`\`

**References:**
\`\`\`cpp
int x = 10;
int& ref = x;   // ref is an alias for x
ref = 20;       // x is now 20

void increment(int& val) {
    val++;       // modifies original
}
\`\`\``,
      keyPoints: [
        '#include <iostream> needed for cin/cout',
        'Use const& for function parameters to avoid copying large objects',
        'C++ has both references (&) and pointers (*)',
        'Always return 0 from main() to indicate success',
      ],
      example: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1, 9, 3};
    sort(nums.begin(), nums.end());
    for (int n : nums) {
        cout << n << " ";  // 1 2 3 5 8 9
    }
}`,
      practicePrompt: 'Write a C++ function that uses a vector to find the second largest element.'
    },
  },

  sql: {
    'SQL Basics': {
      title: 'SQL Basics', icon: '🗄️', duration: '20 min', difficulty: 'Beginner',
      summary: 'SELECT, WHERE, ORDER BY, and basic queries.',
      explanation: `SQL (Structured Query Language) is used to interact with relational databases.

**Basic SELECT:**
\`\`\`sql
SELECT * FROM users;
SELECT name, email FROM users WHERE active = true;
SELECT * FROM products ORDER BY price DESC LIMIT 10;
\`\`\`

**Filtering:**
\`\`\`sql
SELECT * FROM orders
WHERE amount > 100
  AND status = 'completed'
  AND created_at >= '2026-01-01';
\`\`\`

**INSERT / UPDATE / DELETE:**
\`\`\`sql
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
UPDATE users SET active = false WHERE id = 5;
DELETE FROM users WHERE last_login < '2025-01-01';
\`\`\``,
      keyPoints: [
        'SQL is case-insensitive for keywords but convention is UPPERCASE',
        'Always use WHERE in UPDATE/DELETE to avoid affecting all rows',
        'Use LIMIT to prevent fetching too many rows',
        'Single quotes for strings, not double quotes',
      ],
      example: `-- Find top 5 customers by total orders
SELECT 
    c.name,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 5;`,
      practicePrompt: 'Write a query to find all products where price > 50, stock < 10, and category = "Electronics". Order by price ascending.'
    },
  },

  dsa: {
    'Arrays & Strings': {
      title: 'Arrays & Strings', icon: '📊', duration: '30 min', difficulty: 'Intermediate',
      summary: 'Array operations, two pointers, and string techniques.',
      explanation: `Arrays store elements of the same type in contiguous memory.

**Key operations & complexities:**
- Access by index: O(1)
- Search (unsorted): O(n)
- Search (sorted, binary): O(log n)
- Insert at end: O(1) amortized
- Insert at position: O(n)

**Two Pointer Technique:**
\`\`\`python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target: return [left, right]
        elif s < target: left += 1
        else: right -= 1
    return []
\`\`\`

**Sliding Window:**
\`\`\`python
def max_sum_subarray(arr, k):
    window = sum(arr[:k])
    max_sum = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i-k]
        max_sum = max(max_sum, window)
    return max_sum
\`\`\``,
      keyPoints: [
        'Two pointers: useful for sorted arrays, palindromes, pair sum',
        'Sliding window: useful for subarray/substring problems',
        'Binary search: only works on sorted arrays, O(log n)',
        'Always think about edge cases: empty array, single element',
      ],
      example: `# Find if array has a pair summing to target
def has_pair(arr, target):
    seen = set()
    for num in arr:
        if target - num in seen:
            return True
        seen.add(num)
    return False

print(has_pair([1,4,7,2,9], 11))  # True (4+7)`,
      practicePrompt: 'Write a function to find the longest substring without repeating characters. (LeetCode #3 style)'
    },
  },

  git: {
    'Git Basics': {
      title: 'Git Basics', icon: '🔀', duration: '20 min', difficulty: 'Beginner',
      summary: 'init, add, commit, push, and the Git workflow.',
      explanation: `Git is a distributed version control system — tracks changes to your code over time.

**Core workflow:**
\`\`\`bash
git init                        # create new repo
git clone <url>                 # copy existing repo

git status                      # see what changed
git add filename                # stage a file
git add .                       # stage all changes
git commit -m "your message"    # save snapshot

git push origin main            # upload to remote
git pull origin main            # download from remote
\`\`\`

**Branches:**
\`\`\`bash
git branch                      # list branches
git checkout -b feature/login   # create + switch
git merge feature/login         # merge into current
git branch -d feature/login     # delete branch
\`\`\``,
      keyPoints: [
        'Commit early, commit often — small focused commits are better',
        'Write meaningful commit messages: "Add login validation" not "fix"',
        'Never commit secrets (.env files, passwords, API keys)',
        'Pull before you push to avoid merge conflicts',
      ],
      example: `# Full feature workflow
git checkout -b feature/user-auth
# ... make changes ...
git add src/auth.js
git commit -m "Add JWT authentication middleware"
git push origin feature/user-auth
# Now open a Pull Request on GitHub`,
      practicePrompt: 'Practice: Initialize a new repo, create a file, commit it, create a branch, make a change, and merge it back.'
    },
  },

  html_css: {
    'HTML Basics': {
      title: 'HTML Basics', icon: '🌐', duration: '20 min', difficulty: 'Beginner',
      summary: 'Structure, semantic tags, forms, and accessibility.',
      explanation: `HTML (HyperText Markup Language) structures web content.

**Basic structure:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav>...</nav>
  </header>
  <main>
    <article>...</article>
  </main>
  <footer>...</footer>
</body>
</html>
\`\`\`

**Forms:**
\`\`\`html
<form action="/submit" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Sign Up</button>
</form>
\`\`\``,
      keyPoints: [
        'Use semantic tags (header, main, article, nav) for accessibility',
        'Always include lang attribute on <html> tag',
        'Use labels with for="" matching input id="" for accessibility',
        'meta viewport is essential for responsive design',
      ],
      example: `<section class="card">
  <img src="product.jpg" alt="Blue sneakers">
  <h2>Nike Air Max</h2>
  <p>Premium running shoes for all terrain.</p>
  <span class="price">$129.99</span>
  <button type="button" aria-label="Add to cart">
    Add to Cart
  </button>
</section>`,
      practicePrompt: 'Build an HTML page for a personal portfolio with: header with your name, a skills section using a list, and a contact form.'
    },
  },

  react: {
    'React Basics': {
      title: 'React Basics', icon: '⚛️', duration: '25 min', difficulty: 'Intermediate',
      summary: 'Components, JSX, props, and rendering.',
      explanation: `React is a JavaScript library for building user interfaces using components.

**Functional Component:**
\`\`\`jsx
function Greeting({ name, age }) {
  return (
    <div className="card">
      <h2>Hello, {name}!</h2>
      <p>You are {age} years old.</p>
    </div>
  );
}

// Usage
<Greeting name="Alice" age={20} />
\`\`\`

**useState:**
\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  );
}
\`\`\``,
      keyPoints: [
        'Components are functions that return JSX',
        'Props are read-only — never mutate them directly',
        'State causes re-renders when updated via setter function',
        'Keys are required when rendering lists',
      ],
      example: `function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: input }]);
    setInput('');
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={add}>Add</button>
      <ul>
        {todos.map(t => <li key={t.id}>{t.text}</li>)}
      </ul>
    </div>
  );
}`,
      practicePrompt: 'Build a React component that shows a list of items. Each item has a delete button. When clicked, it removes that item from the list.'
    },
  },

  typescript: {
    'TS Basics': {
      title: 'TypeScript Basics', icon: '🔷', duration: '25 min', difficulty: 'Intermediate',
      summary: 'Types, interfaces, and the TS type system.',
      explanation: `TypeScript is JavaScript with types — catches bugs before runtime.

**Basic types:**
\`\`\`typescript
let name: string = "Alice";
let age: number = 25;
let active: boolean = true;
let scores: number[] = [90, 85, 92];
let tuple: [string, number] = ["Alice", 25];
\`\`\`

**Interface:**
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;        // optional
  readonly role: string;  // cannot change after creation
}
\`\`\`

**Functions with types:**
\`\`\`typescript
function greet(name: string, greeting: string = "Hello"): string {
  return \`\${greeting}, \${name}!\`;
}

const add = (a: number, b: number): number => a + b;
\`\`\``,
      keyPoints: [
        'TypeScript errors at compile time, not runtime',
        'Use interface for objects, type for unions/aliases',
        'Optional properties with ?, readonly with readonly keyword',
        'Avoid using any — use unknown for truly unknown types',
      ],
      example: `interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

function filterByCategory(
  products: Product[],
  category: string
): Product[] {
  return products.filter(p => p.category === category);
}

const electronics = filterByCategory(products, "Electronics");`,
      practicePrompt: 'Define a TypeScript interface for a BlogPost (title, content, author, publishedAt, tags). Write a function to filter posts by tag.'
    },
  },

  dart: {
    'Dart Basics': {
      title: 'Dart Basics', icon: '🎯', duration: '20 min', difficulty: 'Beginner',
      summary: 'Variables, functions, null safety, and collections.',
      explanation: `Dart is the language behind Flutter — clean, typed, and fast.

\`\`\`dart
void main() {
  String name = 'Alice';
  int age = 20;
  print('Hello, \$name! Age: \$age');
}
\`\`\`

**Null Safety:**
\`\`\`dart
String name = 'Alice';    // non-nullable
String? nickname;         // nullable (can be null)

// Null-aware operators
print(nickname ?? 'No nickname');  // fallback
print(nickname?.length);           // safe access
\`\`\`

**Functions:**
\`\`\`dart
int add(int a, int b) => a + b;

// Named parameters
void greet({required String name, int age = 0}) {
  print('Hi \$name, age \$age');
}
greet(name: 'Alice', age: 20);
\`\`\``,
      keyPoints: [
        'Dart has sound null safety — variables are non-null by default',
        'Use ? to declare nullable types: String? name',
        '?? is the null-coalescing operator (fallback value)',
        'Arrow functions => for single-expression functions',
      ],
      example: `// List operations in Dart
List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var evens = numbers.where((n) => n.isEven).toList();
var doubled = numbers.map((n) => n * 2).toList();
var sum = numbers.reduce((a, b) => a + b);

print(evens);   // [2, 4, 6, 8, 10]
print(sum);     // 55`,
      practicePrompt: 'Write a Dart program that takes a list of student scores and calculates: average, highest, lowest, and number of students who passed (score >= 60).'
    },
  },

  c: {
    'C Basics': {
      title: 'C Basics', icon: '🔧', duration: '25 min', difficulty: 'Beginner',
      summary: 'Syntax, variables, printf, scanf, and functions.',
      explanation: `C is a foundational language — fast, low-level, and widely used in systems programming.

\`\`\`c
#include <stdio.h>

int main() {
    char name[50];
    int age;
    
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Enter your age: ");
    scanf("%d", &age);
    
    printf("Hello, %s! You are %d years old.\\n", name, age);
    return 0;
}
\`\`\`

**Functions:**
\`\`\`c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
\`\`\``,
      keyPoints: [
        'C requires explicit memory management — no garbage collector',
        'Arrays decay to pointers when passed to functions',
        'Use & with scanf to pass variable address',
        'Always initialize variables — C does not zero them automatically',
      ],
      example: `#include <stdio.h>
#include <string.h>

void reverse_string(char str[]) {
    int n = strlen(str);
    for (int i = 0, j = n-1; i < j; i++, j--) {
        char temp = str[i];
        str[i] = str[j];
        str[j] = temp;
    }
}

int main() {
    char word[] = "Hello";
    reverse_string(word);
    printf("%s\\n", word);  // olleH
    return 0;
}`,
      practicePrompt: 'Write a C function to check if a number is a palindrome (reads same in both directions) using only arithmetic, no strings.'
    },
  },
}

// Get learning content for a topic within a subject
export function getContent(subjectId, topicName) {
  const subjectContent = CONTENT_BY_SUBJECT[subjectId]
  if (!subjectContent) return null
  return subjectContent[topicName] || null
}

// Get all topics for a subject that have content
export function getAvailableTopics(subjectId) {
  const subjectContent = CONTENT_BY_SUBJECT[subjectId]
  if (!subjectContent) return []
  return Object.keys(subjectContent)
}
