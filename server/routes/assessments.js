const express = require('express');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Seed assessments with sample data (idempotent - safe to run multiple times)
const seedAssessments = async () => {
  const assessments = [
    {
      title: 'JavaScript Fundamentals Assessment',
      subject: 'JavaScript',
      description:
        'Test your knowledge of JavaScript basics including variables, functions, and control structures.',
      difficulty: 'Beginner',
      duration: 30,
      passingScore: 60,
      questions: [
        {
          question: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
          correctAnswer: 'var x = 5;',
          explanation: 'The var keyword is used to declare variables in JavaScript.',
          points: 1,
        },
        {
          question: 'Which method is used to add an element to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: 'push()',
          explanation: 'The push() method adds one or more elements to the end of an array.',
          points: 1,
        },
        {
          question: 'What does === mean in JavaScript?',
          options: ['Assignment', 'Loose equality', 'Strict equality', 'Not equal'],
          correctAnswer: 'Strict equality',
          explanation: '=== is the strict equality operator that checks both value and type.',
          points: 1,
        },
        {
          question: 'Which keyword is used to declare a constant in JavaScript?',
          options: ['const', 'let', 'var', 'constant'],
          correctAnswer: 'const',
          explanation: 'The const keyword is used to declare constants that cannot be reassigned.',
          points: 1,
        },
        {
          question: 'What is a closure in JavaScript?',
          options: [
            'A function that has access to variables in its outer scope',
            'A way to close a browser tab',
            'A method to clear memory',
            'A type of loop',
          ],
          correctAnswer: 'A function that has access to variables in its outer scope',
          explanation:
            'A closure is a function that has access to variables in its outer (enclosing) lexical scope.',
          points: 2,
        },
        {
          question: 'Which of the following is NOT a JavaScript data type?',
          options: ['Number', 'Boolean', 'Character', 'Object'],
          correctAnswer: 'Character',
          explanation: 'JavaScript does not have a dedicated Character type; strings are used instead.',
          points: 1,
        },
        {
          question: 'What is the output of `typeof null` in JavaScript?',
          options: ['null', 'undefined', 'object', 'number'],
          correctAnswer: 'object',
          explanation: '`typeof null` returns \"object\" due to a long-standing quirk in JavaScript.',
          points: 2,
        },
      ],
    },
    {
      title: 'Database Concepts Assessment',
      subject: 'Databases',
      description: 'Assess your understanding of database fundamentals, SQL, and data modeling.',
      difficulty: 'Beginner',
      duration: 30,
      passingScore: 60,
      questions: [
        {
          question: 'What does SQL stand for?',
          options: [
            'Structured Query Language',
            'Simple Query Language',
            'Standard Query Language',
            'Sequential Query Language',
          ],
          correctAnswer: 'Structured Query Language',
          explanation: 'SQL stands for Structured Query Language.',
          points: 1,
        },
        {
          question: 'Which SQL command is used to retrieve data from a database?',
          options: ['GET', 'SELECT', 'RETRIEVE', 'FETCH'],
          correctAnswer: 'SELECT',
          explanation: 'The SELECT statement is used to query data from a database.',
          points: 1,
        },
        {
          question: 'What is a primary key?',
          options: [
            'A key that opens the database',
            'A unique identifier for each row in a table',
            'The first column in a table',
            'A foreign key reference',
          ],
          correctAnswer: 'A unique identifier for each row in a table',
          explanation: 'A primary key uniquely identifies each record in a database table.',
          points: 1,
        },
        {
          question: 'What is normalization in databases?',
          options: [
            'The process of organizing data to reduce redundancy',
            'Making all data uppercase',
            'Converting data to numbers',
            'Deleting old data',
          ],
          correctAnswer: 'The process of organizing data to reduce redundancy',
          explanation:
            'Normalization is the process of organizing data in a database to eliminate redundancy.',
          points: 2,
        },
        {
          question: 'Which join returns all records from both tables?',
          options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
          correctAnswer: 'FULL OUTER JOIN',
          explanation:
            'FULL OUTER JOIN returns all records when there is a match in either left or right table.',
          points: 2,
        },
        {
          question: 'What is a foreign key?',
          options: [
            'A key that opens a different database',
            'A field that uniquely identifies each record',
            'A field in one table that refers to the primary key in another table',
            'A key used for encryption',
          ],
          correctAnswer: 'A field in one table that refers to the primary key in another table',
          explanation:
            'A foreign key is a column or group of columns in a table that links to the primary key in another table.',
          points: 1,
        },
      ],
    },
    {
      title: 'React Basics Assessment',
      subject: 'React',
      description: 'Test your React knowledge including components, hooks, and state management.',
      difficulty: 'Beginner',
      duration: 30,
      passingScore: 60,
      questions: [
        {
          question: 'What is React?',
          options: [
            'A database',
            'A JavaScript library for building user interfaces',
            'A programming language',
            'A server framework',
          ],
          correctAnswer: 'A JavaScript library for building user interfaces',
          explanation: 'React is a JavaScript library for building user interfaces.',
          points: 1,
        },
        {
          question: 'What is JSX?',
          options: [
            'A JavaScript extension',
            'JavaScript XML - syntax extension for JavaScript',
            'A database query language',
            'A CSS framework',
          ],
          correctAnswer: 'JavaScript XML - syntax extension for JavaScript',
          explanation: 'JSX is a syntax extension for JavaScript that looks similar to HTML.',
          points: 1,
        },
        {
          question: 'Which hook is used to manage state in functional components?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correctAnswer: 'useState',
          explanation: 'useState is the hook used to add state to functional components.',
          points: 1,
        },
        {
          question: 'What is the purpose of useEffect hook?',
          options: [
            'To manage state',
            'To perform side effects in functional components',
            'To create components',
            'To handle events',
          ],
          correctAnswer: 'To perform side effects in functional components',
          explanation: 'useEffect lets you perform side effects in function components.',
          points: 1,
        },
        {
          question: 'What are props in React?',
          options: ['Properties passed to components', 'State variables', 'Functions', 'CSS classes'],
          correctAnswer: 'Properties passed to components',
          explanation: 'Props are arguments passed into React components.',
          points: 1,
        },
        {
          question: 'Which hook would you use to perform logic only once when a component mounts?',
          options: ['useState', 'useMemo', 'useEffect with empty dependency array', 'useRef'],
          correctAnswer: 'useEffect with empty dependency array',
          explanation:
            'Passing an empty dependency array to useEffect makes it run only once after initial render.',
          points: 2,
        },
      ],
    },
    {
      title: 'Node.js Backend Basics',
      subject: 'Node.js',
      description:
        'Evaluate your understanding of Node.js, Express, and building backend APIs in JavaScript.',
      difficulty: 'Intermediate',
      duration: 35,
      passingScore: 65,
      questions: [
        {
          question: 'What is Node.js built on?',
          options: [
            'Chrome V8 JavaScript engine',
            'Firefox SpiderMonkey engine',
            'Java Virtual Machine',
            'Python interpreter',
          ],
          correctAnswer: 'Chrome V8 JavaScript engine',
          explanation: 'Node.js is built on Chrome’s V8 JavaScript engine.',
          points: 1,
        },
        {
          question: 'Which module is commonly used to create a web server in Node.js?',
          options: ['fs', 'http', 'url', 'path'],
          correctAnswer: 'http',
          explanation: 'The built-in http module can be used to create web servers in Node.js.',
          points: 1,
        },
        {
          question: 'What is middleware in Express?',
          options: [
            'A function that has access to the request and response objects',
            'A database connector',
            'A templating engine',
            'A CLI tool',
          ],
          correctAnswer: 'A function that has access to the request and response objects',
          explanation:
            'Middleware functions in Express can modify the request/response objects or end the request-response cycle.',
          points: 2,
        },
        {
          question: 'Which method is used to define a GET route in Express?',
          options: ['app.fetch()', 'app.route()', 'app.get()', 'app.use()'],
          correctAnswer: 'app.get()',
          explanation: 'app.get() defines a route handler for GET requests.',
          points: 1,
        },
        {
          question: 'What is the purpose of package.json in a Node.js project?',
          options: [
            'To store environment variables',
            'To list project metadata and dependencies',
            'To store compiled code',
            'To define database schemas',
          ],
          correctAnswer: 'To list project metadata and dependencies',
          explanation:
            'package.json contains information about the project and lists its dependencies and scripts.',
          points: 1,
        },
      ],
    },
    {
      title: 'Python Fundamentals Assessment',
      subject: 'Python',
      description:
        'Test your understanding of Python syntax, data structures, and core programming concepts.',
      difficulty: 'Beginner',
      duration: 30,
      passingScore: 60,
      questions: [
        {
          question: 'Which of the following is the correct way to define a function in Python?',
          options: ['function myFunc():', 'def myFunc():', 'fn myFunc():', 'func myFunc():'],
          correctAnswer: 'def myFunc():',
          explanation: 'Python functions are defined using the def keyword.',
          points: 1,
        },
        {
          question: 'Which data type is immutable in Python?',
          options: ['List', 'Dictionary', 'Set', 'Tuple'],
          correctAnswer: 'Tuple',
          explanation: 'Tuples are immutable sequences in Python.',
          points: 1,
        },
        {
          question: 'What is the output of len([1, 2, 3, 4])?',
          options: ['3', '4', '5', 'Error'],
          correctAnswer: '4',
          explanation: 'The list contains four elements, so len() returns 4.',
          points: 1,
        },
        {
          question: 'Which keyword is used to handle exceptions in Python?',
          options: ['catch', 'handle', 'except', 'error'],
          correctAnswer: 'except',
          explanation:
            'Python uses try/except blocks to handle exceptions, with except specifying the handler.',
          points: 1,
        },
        {
          question: 'What is a list comprehension?',
          options: [
            'A compact way to create lists using an expression and a for clause',
            'A tool for compressing lists',
            'A debugging feature',
            'A type of Python loop',
          ],
          correctAnswer: 'A compact way to create lists using an expression and a for clause',
          explanation:
            'List comprehensions provide a concise way to create lists from iterables in a single line.',
          points: 2,
        },
      ],
    },
  ];

  for (const data of assessments) {
    await Assessment.findOneAndUpdate({ title: data.title }, data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log(' Assessments seeded/updated');
};

// Seed on startup
seedAssessments().catch((err) => {
  console.error(' Error seeding assessments:', err);
});

// @route   GET /api/assessments
// @desc    Get all assessments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find().select('-questions.correctAnswer');
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get specific assessment (without correct answers)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Remove correct answers before sending
    const assessmentWithoutAnswers = {
      ...assessment.toObject(),
      questions: assessment.questions.map(q => ({
        ...q.toObject(),
        correctAnswer: undefined,
      })),
    };

    res.json(assessmentWithoutAnswers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assessments/submit
// @desc    Submit assessment results
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const detailedAnswers = answers.map((answer) => {
      const question = assessment.questions.id(answer.questionId);
      if (!question) return null;

      totalPoints += question.points;
      const isCorrect = question.correctAnswer === answer.answer;
      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
      };
    }).filter(Boolean);

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const level = score >= 80 ? 'Advanced' : score >= 60 ? 'Intermediate' : 'Beginner';

    // Save assessment result to user
    const user = await User.findById(req.user._id);
    user.assessments.push({
      assessmentId,
      score,
      answers: detailedAnswers,
    });
    await user.save();

    res.json({
      score,
      level,
      correctCount,
      totalQuestions: assessment.questions.length,
      message: 'Assessment submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

