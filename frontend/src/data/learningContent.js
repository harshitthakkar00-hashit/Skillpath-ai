export const SUBJECTS = [
  {
    id: 'python',
    name: 'Python Programming',
    description: 'Master Python from basics to advanced OOP and file handling.',
    icon: '🐍',
    color: '#3b82f6',
    topics: ['Python Basics', 'Loops', 'Functions', 'OOP', 'File Handling']
  },
  {
    id: 'web',
    name: 'Web Development',
    description: 'Coming soon — HTML, CSS, JavaScript, and React.',
    icon: '🌐',
    color: '#8b5cf6',
    topics: [],
    comingSoon: true
  },
  {
    id: 'data',
    name: 'Data Science',
    description: 'Coming soon — NumPy, Pandas, and ML basics.',
    icon: '📊',
    color: '#10b981',
    topics: [],
    comingSoon: true
  }
]

export const LEARNING_CONTENT = {
  'Python Basics': {
    id: 'python-basics',
    title: 'Python Basics',
    icon: '🐍',
    duration: '20 min',
    difficulty: 'Beginner',
    summary: 'Variables, data types, and core syntax.',
    explanation: `Python is a high-level, interpreted programming language known for its clean syntax and readability.

**Variables** store data values. Unlike other languages, Python uses dynamic typing — you don't declare the type explicitly.

\`\`\`python
name = "Alice"       # string
age = 25             # integer
score = 98.5         # float
is_active = True     # boolean
\`\`\`

**Data Types:**
- \`str\` — text: \`"hello"\`
- \`int\` — whole numbers: \`42\`
- \`float\` — decimals: \`3.14\`
- \`bool\` — True/False
- \`list\` — ordered collection: \`[1, 2, 3]\`
- \`dict\` — key-value pairs: \`{"name": "Alice"}\`

**Print output:**
\`\`\`python
print("Hello, World!")
print(f"My name is {name} and I am {age} years old.")
\`\`\``,
    keyPoints: [
      'Python uses indentation (not braces) to define code blocks',
      'Variables are dynamically typed — no need to declare types',
      'Use f-strings for clean string formatting: f"Hello {name}"',
      'Python is case-sensitive: "Name" and "name" are different variables',
    ],
    example: `# Complete example
student = {
    "name": "Alice",
    "age": 20,
    "grade": 'A'
}

# Access values
print(f"Student: {student['name']}")
print(f"Grade: {student['grade']}")

# Check type
print(type(student['age']))  # <class 'int'>`,
    practicePrompt: 'Create a dictionary for yourself with name, age, and favorite subject. Print each value using f-strings.'
  },

  'Loops': {
    id: 'loops',
    title: 'Loops',
    icon: '🔄',
    duration: '25 min',
    difficulty: 'Beginner',
    summary: 'for loops, while loops, break, continue, and range.',
    explanation: `Loops allow you to execute a block of code repeatedly.

**For Loop** — iterates over a sequence:
\`\`\`python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Using range
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 10, 2):  # 1, 3, 5, 7, 9
    print(i)
\`\`\`

**While Loop** — runs while condition is True:
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

**Control Statements:**
- \`break\` — exit the loop immediately
- \`continue\` — skip to next iteration
- \`else\` — runs when loop finishes normally

\`\`\`python
for num in range(10):
    if num == 5:
        break      # stop at 5
    if num % 2 == 0:
        continue   # skip even numbers
    print(num)     # prints 1, 3
\`\`\``,
    keyPoints: [
      'for loops work best when you know the number of iterations',
      'while loops work best when the stopping condition is dynamic',
      'break exits the loop; continue skips the current iteration',
      'range(start, stop, step) gives fine control over numeric loops',
      'Always ensure while loops have a condition that eventually becomes False',
    ],
    example: `# Find first even number > 10
numbers = [3, 7, 11, 14, 18, 22]
for num in numbers:
    if num > 10 and num % 2 == 0:
        print(f"Found: {num}")  # 14
        break`,
    practicePrompt: 'Write a loop that prints all multiples of 3 between 1 and 30, then stops early if the multiple exceeds 20.'
  },

  'Functions': {
    id: 'functions',
    title: 'Functions',
    icon: '⚡',
    duration: '30 min',
    difficulty: 'Intermediate',
    summary: 'Defining functions, parameters, return values, and scope.',
    explanation: `Functions are reusable blocks of code that perform a specific task.

**Defining and Calling:**
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

message = greet("Alice")
print(message)  # Hello, Alice!
\`\`\`

**Default Parameters:**
\`\`\`python
def power(base, exponent=2):
    return base ** exponent

print(power(3))     # 9 (uses default exponent=2)
print(power(2, 10)) # 1024
\`\`\`

**Multiple Return Values:**
\`\`\`python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 9, 2, 7])
print(low, high)  # 1 9
\`\`\`

**Lambda Functions** — short anonymous functions:
\`\`\`python
square = lambda x: x ** 2
print(square(5))  # 25

# Used with map/filter
evens = list(filter(lambda x: x % 2 == 0, range(10)))
\`\`\``,
    keyPoints: [
      'Functions should do one thing well (Single Responsibility)',
      'Use descriptive names: calculate_area() not ca()',
      'Parameters let you pass data IN; return sends data OUT',
      'Variables inside functions are local — they don\'t affect outside code',
      'Default parameters make functions flexible and easier to call',
    ],
    example: `def calculate_grade(score):
    """Returns letter grade based on score."""
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    else:
        return 'F'

# Test it
scores = [95, 83, 72, 55]
for s in scores:
    print(f"{s} → {calculate_grade(s)}")`,
    practicePrompt: 'Write a function "bmi_calculator" that takes weight (kg) and height (m) and returns the BMI value and category (Underweight/Normal/Overweight).'
  },

  'OOP': {
    id: 'oop',
    title: 'Object-Oriented Programming',
    icon: '🏗️',
    duration: '45 min',
    difficulty: 'Intermediate',
    summary: 'Classes, objects, inheritance, encapsulation, and polymorphism.',
    explanation: `OOP organizes code into objects that combine data and behavior.

**Classes and Objects:**
\`\`\`python
class Student:
    def __init__(self, name, age):
        self.name = name   # instance attribute
        self.age = age

    def introduce(self):
        return f"I am {self.name}, age {self.age}"

# Create objects (instances)
s1 = Student("Alice", 20)
s2 = Student("Bob", 22)

print(s1.introduce())  # I am Alice, age 20
\`\`\`

**Inheritance:**
\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):           # override parent method
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

pets = [Dog("Rex"), Cat("Whiskers")]
for pet in pets:
    print(pet.speak())  # polymorphism!
\`\`\`

**Encapsulation** — hiding internal details:
\`\`\`python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # private

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def get_balance(self):
        return self.__balance
\`\`\``,
    keyPoints: [
      '__init__ is the constructor — called when you create an object',
      'self refers to the current instance of the class',
      'Inheritance: child class inherits all parent class methods',
      'Polymorphism: same method name, different behavior in subclasses',
      'Encapsulation: use __ prefix to make attributes private',
    ],
    example: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def __str__(self):
        return f"Rectangle({self.width}x{self.height})"

r = Rectangle(5, 3)
print(r)             # Rectangle(5x3)
print(r.area())      # 15
print(r.perimeter()) # 16`,
    practicePrompt: 'Create a "BankAccount" class with deposit, withdraw, and get_balance methods. Ensure balance cannot go negative on withdrawal.'
  },

  'File Handling': {
    id: 'file-handling',
    title: 'File Handling',
    icon: '📁',
    duration: '30 min',
    difficulty: 'Intermediate',
    summary: 'Reading, writing, and managing files safely in Python.',
    explanation: `Python makes it easy to read and write files.

**Opening Files — always use "with":**
\`\`\`python
# Read entire file
with open("data.txt", "r") as f:
    content = f.read()

# Read line by line (memory efficient)
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())

# Write to file
with open("output.txt", "w") as f:
    f.write("Hello, File!")

# Append to file
with open("log.txt", "a") as f:
    f.write("New log entry\\n")
\`\`\`

**File Modes:**
| Mode | Meaning |
|------|---------|
| r    | Read (default) |
| w    | Write (overwrite) |
| a    | Append |
| x    | Create new (fails if exists) |
| r+   | Read and write |

**Working with JSON:**
\`\`\`python
import json

# Write JSON
data = {"name": "Alice", "scores": [90, 85, 92]}
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON
with open("data.json", "r") as f:
    loaded = json.load(f)
print(loaded["name"])  # Alice
\`\`\``,
    keyPoints: [
      'Always use "with open(...) as f:" — it closes the file automatically',
      '"r" for reading, "w" for writing (clears file), "a" for appending',
      'Read line by line for large files — avoids memory overload',
      'json module makes it easy to store structured data',
      'Handle FileNotFoundError with try/except for robust code',
    ],
    example: `import json

def save_scores(filename, scores):
    with open(filename, "w") as f:
        json.dump(scores, f, indent=2)

def load_scores(filename):
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

scores = {"Alice": 95, "Bob": 87}
save_scores("scores.json", scores)

loaded = load_scores("scores.json")
print(loaded)  # {'Alice': 95, 'Bob': 87}`,
    practicePrompt: 'Write a program that reads a text file, counts the frequency of each word, and saves the results as a JSON file.'
  }
}

export const LEARNING_PATH_TEMPLATES = {
  'OOP': [
    { id: 'oop-1', title: 'OOP Basics & Concepts', topic: 'OOP', type: 'theory', duration: '10 min' },
    { id: 'oop-2', title: 'Classes & Objects', topic: 'OOP', type: 'theory', duration: '15 min' },
    { id: 'oop-3', title: 'Inheritance in Depth', topic: 'OOP', type: 'theory', duration: '15 min' },
    { id: 'oop-4', title: 'Polymorphism', topic: 'OOP', type: 'theory', duration: '10 min' },
    { id: 'oop-5', title: 'Practice Challenge', topic: 'OOP', type: 'practice', duration: '20 min' },
    { id: 'oop-6', title: 'Re-assessment', topic: 'OOP', type: 'reassessment', duration: '10 min' },
  ],
  'File Handling': [
    { id: 'fh-1', title: 'File Modes & Basics', topic: 'File Handling', type: 'theory', duration: '10 min' },
    { id: 'fh-2', title: 'Reading Files Efficiently', topic: 'File Handling', type: 'theory', duration: '15 min' },
    { id: 'fh-3', title: 'Writing & Appending', topic: 'File Handling', type: 'theory', duration: '10 min' },
    { id: 'fh-4', title: 'JSON & Structured Data', topic: 'File Handling', type: 'theory', duration: '15 min' },
    { id: 'fh-5', title: 'Practice Challenge', topic: 'File Handling', type: 'practice', duration: '20 min' },
    { id: 'fh-6', title: 'Re-assessment', topic: 'File Handling', type: 'reassessment', duration: '10 min' },
  ],
  'Functions': [
    { id: 'fn-1', title: 'Function Basics', topic: 'Functions', type: 'theory', duration: '10 min' },
    { id: 'fn-2', title: 'Parameters & Return Values', topic: 'Functions', type: 'theory', duration: '15 min' },
    { id: 'fn-3', title: 'Lambda & Higher-Order Functions', topic: 'Functions', type: 'theory', duration: '15 min' },
    { id: 'fn-4', title: 'Practice Challenge', topic: 'Functions', type: 'practice', duration: '20 min' },
    { id: 'fn-5', title: 'Re-assessment', topic: 'Functions', type: 'reassessment', duration: '10 min' },
  ],
  'Loops': [
    { id: 'lp-1', title: 'For & While Loops', topic: 'Loops', type: 'theory', duration: '15 min' },
    { id: 'lp-2', title: 'Break, Continue & Nested Loops', topic: 'Loops', type: 'theory', duration: '15 min' },
    { id: 'lp-3', title: 'Practice Challenge', topic: 'Loops', type: 'practice', duration: '15 min' },
  ],
  'Python Basics': [
    { id: 'pb-1', title: 'Variables & Data Types', topic: 'Python Basics', type: 'theory', duration: '15 min' },
    { id: 'pb-2', title: 'Conditions & Operators', topic: 'Python Basics', type: 'theory', duration: '15 min' },
    { id: 'pb-3', title: 'Practice Challenge', topic: 'Python Basics', type: 'practice', duration: '15 min' },
  ]
}

export const PRACTICE_QUESTIONS = {
  'OOP': [
    {
      id: 'p1',
      type: 'mcq',
      question: 'Which method is automatically called when a Python object is created?',
      options: ['__create__', '__init__', '__new__', '__start__'],
      correct: 1,
      explanation: '__init__ is the constructor method, automatically called on object creation.',
      hint: 'Think about initialization — what happens when you first create something?'
    },
    {
      id: 'p2',
      type: 'scenario',
      question: 'You have a Vehicle class with speed and fuel attributes. You need to create Car and Motorcycle classes with shared behavior but different specific features. How would you structure this using OOP?',
      keywords: ['inherit', 'Vehicle', 'Car', 'Motorcycle', 'super', 'override', 'extend'],
      hint: 'Think about what is COMMON vs what is DIFFERENT between vehicles.',
      explanation: 'Use inheritance: Car and Motorcycle both inherit from Vehicle, getting speed and fuel. Each can override specific methods or add unique attributes (e.g., doors for Car, sidecar for Motorcycle).'
    },
    {
      id: 'p3',
      type: 'practical',
      question: 'Create a class "Circle" with a radius attribute. Add methods area() and circumference(). Use 3.14159 for pi.',
      keywords: ['class Circle', 'def __init__', 'self.radius', 'def area', 'def circumference', '3.14'],
      hint: 'Area = π × r², Circumference = 2 × π × r',
      explanation: 'class Circle:\\n  def __init__(self, radius):\\n    self.radius = radius\\n  def area(self):\\n    return 3.14159 * self.radius ** 2\\n  def circumference(self):\\n    return 2 * 3.14159 * self.radius'
    }
  ],
  'File Handling': [
    {
      id: 'p4',
      type: 'mcq',
      question: 'What happens when you open a file with mode "w" that already exists?',
      options: [
        'It raises an error',
        'It appends to the file',
        'It overwrites (clears) the existing content',
        'It creates a backup first'
      ],
      correct: 2,
      explanation: '"w" mode truncates (clears) the existing file before writing. Use "a" to append.',
      hint: '"w" stands for write — and it starts fresh.'
    },
    {
      id: 'p5',
      type: 'practical',
      question: 'Write a Python function that reads a file and returns a list of lines that contain a specific word (case-insensitive).',
      keywords: ['def', 'open', 'for line', 'lower', 'in line', 'return', 'append'],
      hint: 'Use with open, loop through lines, and use .lower() for case-insensitive matching.',
      explanation: 'def search_lines(filename, word):\\n    matches = []\\n    with open(filename) as f:\\n        for line in f:\\n            if word.lower() in line.lower():\\n                matches.append(line.strip())\\n    return matches'
    }
  ],
  'Functions': [
    {
      id: 'p6',
      type: 'mcq',
      question: 'What will this code output? result = (lambda x, y: x + y)(3, 4)',
      options: ['Error', '7', 'lambda', '34'],
      correct: 1,
      explanation: 'The lambda function adds x and y. Called immediately with 3 and 4, it returns 7.',
      hint: 'Lambda functions can be defined and called in one expression.'
    },
    {
      id: 'p7',
      type: 'practical',
      question: 'Write a recursive function "factorial" that calculates n! (factorial of n).',
      keywords: ['def factorial', 'if n', 'return 1', 'return n', 'factorial(n-1)', 'recursive'],
      hint: 'Base case: factorial(0) = 1. Recursive case: n * factorial(n-1)',
      explanation: 'def factorial(n):\\n    if n <= 1:\\n        return 1\\n    return n * factorial(n - 1)'
    }
  ]
}
