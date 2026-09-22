// Diagnostic assessment questions — mix of MCQ, scenario, short answer, practical

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    type: 'mcq',
    topic: 'Python Basics',
    question: 'Which keyword is used to define a function in Python?',
    options: ['function', 'def', 'define', 'fun'],
    correct: 1,
    points: 10,
    explanation: 'In Python, the "def" keyword is used to define a function.'
  },
  {
    id: 2,
    type: 'mcq',
    topic: 'Python Basics',
    question: 'What is the correct way to create a variable in Python?',
    options: ['var x = 5', 'int x = 5', 'x = 5', 'let x = 5'],
    correct: 2,
    points: 10,
    explanation: 'Python uses dynamic typing; variables are created by simple assignment: x = 5.'
  },
  {
    id: 3,
    type: 'mcq',
    topic: 'Loops',
    question: 'What does the "break" statement do inside a loop?',
    options: [
      'Skips the current iteration',
      'Exits the loop immediately',
      'Restarts the loop',
      'Pauses the loop'
    ],
    correct: 1,
    points: 10,
    explanation: '"break" immediately terminates the loop and moves execution to the next statement after the loop.'
  },
  {
    id: 4,
    type: 'short_answer',
    topic: 'Functions',
    question: 'Explain what a return statement does in a Python function. Why is it useful?',
    keywords: ['returns', 'value', 'output', 'result', 'sends back', 'caller'],
    points: 10,
    explanation: 'The return statement ends the function execution and sends a value back to the caller. It allows functions to produce output that can be stored or used further.'
  },
  {
    id: 5,
    type: 'scenario',
    topic: 'Loops',
    question: 'A Python program is processing a list of 10,000 user records. The program needs to find the first record matching a specific email address and stop searching. Which loop construct and control statement would you use, and why?',
    keywords: ['for', 'while', 'break', 'stop', 'early exit', 'efficient', 'iteration'],
    points: 10,
    explanation: 'A for loop with a break statement is ideal. Once the target email is found, break exits the loop immediately, avoiding unnecessary iteration through remaining records — making it more efficient.'
  },
  {
    id: 6,
    type: 'mcq',
    topic: 'OOP',
    question: 'Which concept in OOP allows a class to inherit properties and methods from another class?',
    options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
    correct: 2,
    points: 10,
    explanation: 'Inheritance allows a child class to acquire the attributes and methods of a parent class, promoting code reuse.'
  },
  {
    id: 7,
    type: 'short_answer',
    topic: 'OOP',
    question: 'Explain inheritance in Python in your own words. Give a real-world example.',
    keywords: ['parent', 'child', 'base', 'derived', 'extends', 'inherit', 'reuse', 'class'],
    points: 10,
    explanation: 'Inheritance lets a new class (child) reuse code from an existing class (parent). Example: a Car class can inherit from a Vehicle class, getting its speed and fuel attributes automatically.'
  },
  {
    id: 8,
    type: 'practical',
    topic: 'Functions',
    question: 'Write a Python function called "find_max" that accepts a list of numbers and returns the largest number without using the built-in max() function.',
    keywords: ['def', 'find_max', 'for', 'if', 'return', 'largest', 'greater', 'loop'],
    sampleAnswer: 'def find_max(numbers):\n    largest = numbers[0]\n    for num in numbers:\n        if num > largest:\n            largest = num\n    return largest',
    points: 10,
    explanation: 'The function initializes with the first element, then loops to compare each element, updating the largest when a bigger value is found.'
  },
  {
    id: 9,
    type: 'mcq',
    topic: 'File Handling',
    question: 'Which mode opens a file for writing and creates it if it does not exist?',
    options: ['r', 'x', 'w', 'a'],
    correct: 2,
    points: 10,
    explanation: '"w" mode opens for writing and creates the file if it doesn\'t exist. It overwrites existing content. "a" appends without overwriting.'
  },
  {
    id: 10,
    type: 'scenario',
    topic: 'File Handling',
    question: 'Your Python program reads a large log file line by line to find error entries. The file is 500MB. What file reading approach would you use to avoid memory issues, and what Python construct would help?',
    keywords: ['with open', 'readline', 'iterator', 'line by line', 'memory', 'generator', 'context manager', 'lazy'],
    points: 10,
    explanation: 'Use "with open(filename) as f:" and iterate line by line (for line in f:). This reads one line at a time using a generator, keeping memory usage minimal regardless of file size.'
  }
]

export const REASSESSMENT_QUESTIONS = {
  OOP: [
    {
      id: 'r1',
      type: 'mcq',
      topic: 'OOP',
      question: 'What does "__init__" method do in a Python class?',
      options: [
        'Deletes the object',
        'Initializes object attributes when an instance is created',
        'Inherits from a parent class',
        'Defines a class method'
      ],
      correct: 1,
      points: 20,
      explanation: '__init__ is the constructor method, automatically called when a new object is created, used to set initial attributes.'
    },
    {
      id: 'r2',
      type: 'short_answer',
      topic: 'OOP',
      question: 'What is polymorphism in OOP? Give a Python example.',
      keywords: ['same method', 'different', 'override', 'behavior', 'subclass', 'duck typing'],
      points: 20,
      explanation: 'Polymorphism means the same method name behaves differently in different classes. Example: both Dog and Cat classes can have a speak() method that returns different sounds.'
    },
    {
      id: 'r3',
      type: 'practical',
      topic: 'OOP',
      question: 'Write a Python class "Animal" with a "speak" method. Then create a subclass "Dog" that overrides "speak" to return "Woof!".',
      keywords: ['class', 'Animal', 'Dog', 'def speak', 'return', 'super', 'Woof'],
      sampleAnswer: 'class Animal:\n    def speak(self):\n        return "..."\\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"',
      points: 20,
      explanation: 'The Dog class inherits from Animal and overrides the speak() method with its own implementation.'
    }
  ],
  'File Handling': [
    {
      id: 'r4',
      type: 'mcq',
      topic: 'File Handling',
      question: 'What is the safest way to open a file in Python to ensure it is automatically closed?',
      options: [
        'f = open("file.txt")',
        'with open("file.txt") as f:',
        'file.open("file.txt")',
        'open and close manually'
      ],
      correct: 1,
      points: 20,
      explanation: 'The "with" statement (context manager) automatically closes the file when the block exits, even if an exception occurs.'
    },
    {
      id: 'r5',
      type: 'practical',
      topic: 'File Handling',
      question: 'Write a Python function that reads a text file and returns the number of lines containing the word "error" (case-insensitive).',
      keywords: ['open', 'for line', 'lower', 'error', 'count', 'return', 'with'],
      sampleAnswer: 'def count_errors(filename):\n    count = 0\n    with open(filename) as f:\n        for line in f:\n            if "error" in line.lower():\n                count += 1\n    return count',
      points: 20,
      explanation: 'We read line by line for memory efficiency, use .lower() for case-insensitive matching, and count matching lines.'
    }
  ],
  Functions: [
    {
      id: 'r6',
      type: 'mcq',
      topic: 'Functions',
      question: 'What is a lambda function in Python?',
      options: [
        'A function defined with class',
        'A small anonymous function defined with lambda keyword',
        'A function that runs in background',
        'A recursive function'
      ],
      correct: 1,
      points: 20,
      explanation: 'Lambda creates small, anonymous functions inline. Example: square = lambda x: x**2'
    },
    {
      id: 'r7',
      type: 'practical',
      topic: 'Functions',
      question: 'Write a Python function "is_palindrome" that checks if a string reads the same forwards and backwards.',
      keywords: ['def', 'is_palindrome', 'return', 'reverse', '[::-1]', 'lower', '=='],
      sampleAnswer: 'def is_palindrome(s):\n    s = s.lower().replace(" ", "")\n    return s == s[::-1]',
      points: 20,
      explanation: 'Clean the string, then compare it to its reverse using Python slice notation.'
    }
  ]
}
