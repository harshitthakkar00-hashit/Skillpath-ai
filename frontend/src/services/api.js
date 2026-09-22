/**
 * API service — all backend calls for SkillPath AI.
 * BASE_URL = '/api' → proxied by Vite to http://localhost:8000
 * All functions return null on error; callers handle null gracefully.
 */

const BASE_URL = '/api'

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function fetchJSON(path, options = {}) {
  try {
    const res = await fetch(BASE_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return null
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  return fetchJSON('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export async function apiSubmitAssessment(answers, subject) {
  return fetchJSON('/assessment/submit', {
    method: 'POST',
    body: JSON.stringify({ answers, subject }),
  })
}

export async function apiAnalyzeSkills(topicScores) {
  return fetchJSON('/assessment/analyze', {
    method: 'POST',
    body: JSON.stringify({ topic_scores: topicScores }),
  })
}

// ─── AI Chat (main endpoint) ──────────────────────────────────────────────────

/**
 * Send a message to the AI tutor.
 * @param {string} message          - The student's message
 * @param {object} context          - { mode, language, level, competency, topic, subject, scores }
 * @param {string|null} sessionId   - Conversation session ID (null = create new)
 * @param {Array}  history          - Recent message history [{ role, content }]
 */
export async function apiAIChat(message, context = {}, sessionId = null, history = []) {
  return fetchJSON('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      context,
      session_id: sessionId,
      history,
    }),
  })
}

// ─── Session Management ───────────────────────────────────────────────────────

export async function apiGetSessions() {
  return fetchJSON('/ai/sessions')
}

export async function apiFetchSessionById(sessionId) {
  return fetchJSON(`/ai/sessions/${sessionId}`)
}

export async function apiCreateSession(title, mode = 'tutor', language = 'Python', level = 'Intermediate') {
  return fetchJSON('/ai/sessions', {
    method: 'POST',
    body: JSON.stringify({ title, mode, language, level }),
  })
}

export async function apiDeleteSession(sessionId) {
  return fetchJSON(`/ai/sessions/${sessionId}`, { method: 'DELETE' })
}

export async function apiRenameSession(sessionId, title) {
  return fetchJSON(`/ai/sessions/${sessionId}/rename`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export async function apiClearSession(sessionId) {
  return fetchJSON(`/ai/sessions/${sessionId}/clear`, { method: 'POST' })
}

export async function apiSearchSessions(query) {
  return fetchJSON(`/ai/sessions/search/${encodeURIComponent(query)}`)
}

// ─── File / Image Upload ──────────────────────────────────────────────────────

/**
 * Upload a file and ask a question about it.
 * @param {File}   file        - The file to analyze
 * @param {string} question    - What to ask about the file
 * @param {string} sessionId   - Optional session to add result to
 */
export async function apiUploadFile(file, question = '', sessionId = '') {
  const formData = new FormData()
  formData.append('file', file)
  if (question) formData.append('question', question)
  if (sessionId) formData.append('session_id', sessionId)
  try {
    const res = await fetch(BASE_URL + '/ai/analyze-file', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return null
  }
}

// ─── Suggested Prompts ────────────────────────────────────────────────────────

export async function apiGetSuggestedPrompts() {
  return fetchJSON('/ai/suggested-prompts')
}

// ─── Materials ────────────────────────────────────────────────────────────────

export async function apiUploadMaterial(file) {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch(BASE_URL + '/materials/upload', {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    return null
  }
}

// ─── Fallback AI (client-side, used when backend is unreachable) ──────────────

export function getFallbackAIResponse(message, context) {
  const msg = message.toLowerCase()
  const topic = context?.topic || context?.language || 'Programming'
  const level = context?.competency || context?.level || 'Intermediate'

  const responses = {
    inheritance: `📘 **Inheritance** lets a child class acquire properties and methods from a parent class.\n\nExample:\n\`\`\`python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} makes a sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} says Woof!"\n\ndog = Dog("Rex")\nprint(dog.speak())  # Rex says Woof!\n\`\`\`\n\n💡 **Practice:** Create a \`Vehicle\` class and a \`Car\` subclass.`,
    polymorphism: `📘 **Polymorphism** means "many forms" — the same method name behaves differently based on the object.\n\n\`\`\`python\nclass Shape:\n    def area(self): return 0\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14 * self.r ** 2\n\nclass Rectangle(Shape):\n    def __init__(self, w, h): self.w, self.h = w, h\n    def area(self): return self.w * self.h\n\nshapes = [Circle(5), Rectangle(4, 6)]\nfor s in shapes:\n    print(s.area())  # Calls different area() each time\n\`\`\``,
    recursion: `📘 **Recursion** is when a function calls itself to solve a smaller version of the problem.\n\n\`\`\`python\ndef factorial(n):\n    if n <= 1:       # Base case\n        return 1\n    return n * factorial(n - 1)  # Recursive case\n\nprint(factorial(5))  # 5×4×3×2×1 = 120\n\`\`\`\n\n⚠️ Always have a base case or you'll get infinite recursion!`,
    'binary search': `📘 **Binary Search** finds a target in a sorted array in O(log n) time.\n\n\`\`\`python\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1\n\nnums = [2, 5, 8, 12, 16, 23]\nprint(binary_search(nums, 12))  # 3\n\`\`\``,
    sql: `📘 **SQL Basics**\n\n\`\`\`sql\n-- Create table\nCREATE TABLE students (\n    id    INT PRIMARY KEY AUTO_INCREMENT,\n    name  VARCHAR(100) NOT NULL,\n    grade DECIMAL(5,2)\n);\n\n-- Insert\nINSERT INTO students (name, grade) VALUES ('Alice', 95.5);\n\n-- Select\nSELECT name, grade FROM students WHERE grade >= 90 ORDER BY grade DESC;\n\n-- Update\nUPDATE students SET grade = 98 WHERE name = 'Alice';\n\n-- Delete\nDELETE FROM students WHERE grade < 50;\n\`\`\``,
  }

  for (const [key, resp] of Object.entries(responses)) {
    if (msg.includes(key)) return resp
  }

  if (msg.includes('error') || msg.includes('bug') || msg.includes('fix')) {
    return `🐛 **Debugging Help**\n\nTo help you fix this, please share:\n1. The **error message** (copy the full text)\n2. Your **code** (relevant section)\n3. What you **expected** vs what **happened**\n\nCommon issues in ${topic}:\n- Uninitialized variables / null references\n- Off-by-one errors in loops\n- Type mismatches\n- Missing imports`
  }

  if (msg.includes('roadmap') || msg.includes('how to learn') || msg.includes('where to start')) {
    return `🗺️ **${topic} Learning Roadmap**\n\n1. **Basics** → Syntax, data types, variables\n2. **Control Flow** → Conditions, loops, functions  \n3. **Data Structures** → Arrays, lists, maps\n4. **OOP** → Classes, inheritance, polymorphism\n5. **Advanced** → Design patterns, frameworks\n6. **Projects** → Build 2-3 real projects\n\nStart with official documentation and practice daily!`
  }

  return `💬 **${topic}** — ${level} Level\n\nI'm here to help! I can:\n- 📘 **Explain** any CS concept\n- 🐛 **Debug** your code\n- 💻 **Generate** code examples\n- 🗺️ **Create** learning roadmaps\n- 🎯 **Give** practice questions\n\nWhat would you like help with?`
}
