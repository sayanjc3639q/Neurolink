import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'neurolink-demo.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'neurolink-demo',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'neurolink-demo.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 10 real study notes demonstrating interlinking, backlinks, code, lists, and quotes
const sampleTopics = [
  {
    slug: 'binary-search',
    title: 'Binary Search',
    summary: 'A search algorithm that finds the position of a target value within a sorted array in logarithmic time.',
    tags: ['algorithms', 'searching', 'arrays'],
    outgoingLinks: ['arrays', 'big-o-notation', 'divide-and-conquer', 'recursion'],
    headings: [
      { id: 'core-concept', level: 2, text: 'Core Concept' },
      { id: 'algorithmic-steps', level: 2, text: 'Algorithmic Steps' },
      { id: 'complexity', level: 2, text: 'Complexity' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Core Concept' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Binary search is an efficient search algorithm designed exclusively for sorted ' },
            { type: 'wikiLink', attrs: { slug: 'arrays', label: 'Arrays' } },
            { type: 'text', text: '. Instead of scanning sequentially, it operates via the ' },
            { type: 'wikiLink', attrs: { slug: 'divide-and-conquer', label: 'Divide and conquer' } },
            { type: 'text', text: ' paradigm to halve the remaining search interval in each step.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Algorithmic Steps' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Compare the target value to the middle element of the array.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'If target equals middle, return the index.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'If target is smaller, repeat search on left sub-array; else repeat on right sub-array.' }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Complexity' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Under ' },
            { type: 'wikiLink', attrs: { slug: 'big-o-notation', label: 'Big-O notation' } },
            { type: 'text', text: ', the time complexity is ' },
            { type: 'text', text: 'O(log n)', marks: [{ type: 'highlight' }] },
            { type: 'text', text: ' and auxiliary space complexity is O(1) for iterative implementations, or O(log n) when using ' },
            { type: 'wikiLink', attrs: { slug: 'recursion', label: 'Recursion' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Core Concept Binary search is an efficient search algorithm designed exclusively for sorted Arrays. Divide and conquer paradigm. Algorithmic Steps Compare target to middle. Complexity Big-O notation O(log n) time complexity Recursion.',
  },
  {
    slug: 'big-o-notation',
    title: 'Big-O Notation',
    summary: 'Mathematical notation used to describe the limiting behavior and asymptotic growth rate of algorithms.',
    tags: ['computer-science', 'complexity', 'mathematics'],
    outgoingLinks: ['binary-search', 'hash-tables', 'arrays'],
    headings: [
      { id: 'definition', level: 2, text: 'Definition' },
      { id: 'common-orders', level: 2, text: 'Common Orders of Growth' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Definition' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Big-O notation characterizes functions according to their growth rates: different functions with the same growth rate may be represented using the same O notation.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Common Orders of Growth' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'O(1): Constant time, e.g. average lookup in ' }, { type: 'wikiLink', attrs: { slug: 'hash-tables', label: 'Hash Tables' } }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'O(log n): Logarithmic time, e.g. ' }, { type: 'wikiLink', attrs: { slug: 'binary-search', label: 'Binary Search' } }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'O(n): Linear time, e.g. linear scan across unsorted ' }, { type: 'wikiLink', attrs: { slug: 'arrays', label: 'Arrays' } }],
                },
              ],
            },
          ],
        },
      ],
    }),
    contentText: 'Definition Big-O notation characterizes functions. Common Orders of Growth O(1) Hash Tables O(log n) Binary Search O(n) Arrays.',
  },
  {
    slug: 'arrays',
    title: 'Arrays',
    summary: 'Contiguous memory collection of items accessed via mathematical indexing offsets.',
    tags: ['data-structures', 'memory'],
    outgoingLinks: ['binary-search', 'big-o-notation'],
    headings: [
      { id: 'memory-layout', level: 2, text: 'Memory Layout' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Memory Layout' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Because an array is allocated as a single continuous block of memory, calculating element addresses is O(1) using pointer arithmetic. Arrays serve as the baseline structure for ' },
            { type: 'wikiLink', attrs: { slug: 'binary-search', label: 'Binary Search' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Memory Layout Continuous block of memory pointer arithmetic O(1) Binary Search.',
  },
  {
    slug: 'recursion',
    title: 'Recursion',
    summary: 'Method of solving problems where a function calls itself directly or indirectly to solve smaller instances.',
    tags: ['programming', 'algorithms'],
    outgoingLinks: ['call-stack', 'binary-search', 'divide-and-conquer'],
    headings: [
      { id: 'base-case-and-inductive-step', level: 2, text: 'Base Case and Inductive Step' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Base Case and Inductive Step' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Every recursive procedure requires a base case to terminate execution before exhausting the ' },
            { type: 'wikiLink', attrs: { slug: 'call-stack', label: 'Call Stack' } },
            { type: 'text', text: '. It is fundamental to ' },
            { type: 'wikiLink', attrs: { slug: 'divide-and-conquer', label: 'Divide and conquer' } },
            { type: 'text', text: ' implementations of ' },
            { type: 'wikiLink', attrs: { slug: 'binary-search', label: 'Binary Search' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Base Case and Inductive Step Recursive procedure base case Call Stack Divide and conquer Binary Search.',
  },
  {
    slug: 'hash-tables',
    title: 'Hash Tables',
    summary: 'Associative data structure mapping keys to values via hashing functions.',
    tags: ['data-structures', 'searching'],
    outgoingLinks: ['arrays', 'big-o-notation'],
    headings: [
      { id: 'collision-resolution', level: 2, text: 'Collision Resolution' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Collision Resolution' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hash tables internally leverage ' },
            { type: 'wikiLink', attrs: { slug: 'arrays', label: 'Arrays' } },
            { type: 'text', text: ' as buckets. Collisions are commonly resolved using separate chaining or open addressing, delivering expected ' },
            { type: 'wikiLink', attrs: { slug: 'big-o-notation', label: 'Big-O notation' } },
            { type: 'text', text: ' O(1) performance.' },
          ],
        },
      ],
    }),
    contentText: 'Collision Resolution Hash tables Arrays separate chaining open addressing Big-O notation O(1).',
  },
  {
    slug: 'divide-and-conquer',
    title: 'Divide and Conquer',
    summary: 'Algorithmic design paradigm breaking a problem down into sub-problems until simple enough to solve directly.',
    tags: ['algorithms', 'patterns'],
    outgoingLinks: ['recursion', 'binary-search'],
    headings: [
      { id: 'three-steps', level: 2, text: 'Three Steps' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Three Steps' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '1. Divide into subproblems. 2. Conquer via ' },
            { type: 'wikiLink', attrs: { slug: 'recursion', label: 'Recursion' } },
            { type: 'text', text: '. 3. Combine results. Exhibited in ' },
            { type: 'wikiLink', attrs: { slug: 'binary-search', label: 'Binary Search' } },
            { type: 'text', text: ' and merge sort.' },
          ],
        },
      ],
    }),
    contentText: 'Three Steps Divide Conquer Recursion Combine Binary Search merge sort.',
  },
  {
    slug: 'call-stack',
    title: 'Call Stack',
    summary: 'Stack data structure that stores information about active execution frames of a computer program.',
    tags: ['memory', 'computer-science'],
    outgoingLinks: ['recursion'],
    headings: [
      { id: 'stack-overflow', level: 2, text: 'Stack Overflow' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Stack Overflow' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'When ' },
            { type: 'wikiLink', attrs: { slug: 'recursion', label: 'Recursion' } },
            { type: 'text', text: ' lacks an appropriate base condition or exceeds maximum depth, a stack overflow error occurs.' },
          ],
        },
      ],
    }),
    contentText: 'Stack Overflow Recursion stack overflow call stack frame.',
  },
  {
    slug: 'dynamic-programming',
    title: 'Dynamic Programming',
    summary: 'Optimization technique solving complex problems by breaking them into overlapping subproblems with memoization.',
    tags: ['algorithms', 'optimization'],
    outgoingLinks: ['recursion', 'big-o-notation'],
    headings: [
      { id: 'memoization-vs-tabulation', level: 2, text: 'Memoization vs Tabulation' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Memoization vs Tabulation' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Unlike standard ' },
            { type: 'wikiLink', attrs: { slug: 'recursion', label: 'Recursion' } },
            { type: 'text', text: ' which recalculates subproblems, dynamic programming stores intermediate outputs to reduce time complexity measured in ' },
            { type: 'wikiLink', attrs: { slug: 'big-o-notation', label: 'Big-O notation' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Memoization vs Tabulation Dynamic programming recursion memoization Big-O notation.',
  },
  {
    slug: 'binary-tree',
    title: 'Binary Tree',
    summary: 'Hierarchical node structure where each node has at most two children.',
    tags: ['data-structures', 'trees'],
    outgoingLinks: ['binary-search', 'recursion'],
    headings: [
      { id: 'traversals', level: 2, text: 'Traversals' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Traversals' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'In-order traversal yields ordered elements in a search tree variant related to ' },
            { type: 'wikiLink', attrs: { slug: 'binary-search', label: 'Binary Search' } },
            { type: 'text', text: ' and implemented naturally via ' },
            { type: 'wikiLink', attrs: { slug: 'recursion', label: 'Recursion' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Traversals In-order traversal Binary Search recursion binary tree.',
  },
  {
    slug: 'asymptotic-analysis',
    title: 'Asymptotic Analysis',
    summary: 'Evaluating the performance of an algorithm as the input size tends towards infinity.',
    tags: ['mathematics', 'complexity'],
    outgoingLinks: ['big-o-notation'],
    headings: [
      { id: 'worst-vs-average-case', level: 2, text: 'Worst vs Average Case' },
    ],
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Worst vs Average Case' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Provides upper bounds on growth rates formalized through ' },
            { type: 'wikiLink', attrs: { slug: 'big-o-notation', label: 'Big-O notation' } },
            { type: 'text', text: '.' },
          ],
        },
      ],
    }),
    contentText: 'Worst vs Average Case Asymptotic Analysis Big-O notation performance infinity.',
  },
];

async function seed() {
  console.log('Seeding sample study notes into Firestore...');
  const batch = writeBatch(db);

  for (const topic of sampleTopics) {
    const ref = doc(db, 'topics', topic.slug);
    batch.set(ref, {
      ...topic,
      titleLower: topic.title.toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const metaRef = doc(db, 'meta', 'searchIndexVersion');
  batch.set(metaRef, {
    version: 1,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  console.log(`Successfully seeded ${sampleTopics.length} interconnected topics!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
