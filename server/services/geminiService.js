const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate personalized learning path based on assessment results
 */
const generateLearningPath = async (assessmentResults, subjects) => {
  try {
    // Format assessment results for Gemini
    const resultsSummary = Object.entries(assessmentResults).map(([subject, data]) => {
      return `${subject}: Score ${data.score}% (${data.level} level)`;
    }).join('\n');

    const prompt = `You are an expert educational advisor. Based on the following skill assessment results, generate a personalized learning path.

Assessment Results:
${resultsSummary}

Subjects Assessed: ${subjects.join(', ')}

Please generate a comprehensive, structured learning path with the following requirements:

1. Create 8-12 topics that build upon each other logically
2. Each topic should have:
   - A clear, descriptive title
   - A brief description (1-2 sentences)
   - Difficulty level (Beginner, Intermediate, or Advanced)
   - Estimated hours to complete
   - 2-3 learning resources (Articles, Videos, Courses, Documentation, or Practice exercises)
   - Prerequisites (which topics must be completed first)
   - A logical order number

3. Topics should address knowledge gaps identified in the assessments
4. Start with foundational concepts and progress to advanced topics
5. Include practical, hands-on learning opportunities

Return the response as a JSON array of topics with this exact structure:
[
  {
    "id": "topic-1",
    "title": "Topic Title",
    "description": "Brief description",
    "difficulty": "Beginner|Intermediate|Advanced",
    "estimatedHours": 5,
    "resources": [
      {
        "type": "Article|Video|Course|Documentation|Practice",
        "title": "Resource Title",
        "url": "https://example.com",
        "description": "Resource description"
      }
    ],
    "prerequisites": ["topic-id-if-any"],
    "order": 1
  }
]

IMPORTANT: Only return the JSON array, no additional text, no markdown formatting, no code blocks. Just the raw JSON array.`;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();

    // Clean up the response - remove markdown code blocks if present
    content = content.trim();
    
    // Remove markdown code blocks
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any leading/trailing text before/after JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Parse JSON
    const topics = JSON.parse(content);
    
    return topics;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback to default learning path if Gemini API fails
    return generateFallbackLearningPath(assessmentResults, subjects);
  }
};

/**
 * Fallback learning path generator if Gemini API fails
 */
const generateFallbackLearningPath = (assessmentResults, subjects) => {
  const topics = [];
  let order = 1;

  // Generate topics based on subjects
  subjects.forEach((subject, index) => {
    const result = assessmentResults[subject];
    const level = result?.level || 'Beginner';
    
    if (subject === 'JavaScript') {
      topics.push(
        {
          id: `js-${order}`,
          title: 'JavaScript Fundamentals',
          description: 'Master the core concepts of JavaScript including variables, data types, and functions.',
          difficulty: 'Beginner',
          estimatedHours: 8,
          resources: [
            { type: 'Documentation', title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', description: 'Comprehensive JavaScript documentation' },
            { type: 'Video', title: 'JavaScript Basics', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', description: 'Introduction to JavaScript' },
          ],
          prerequisites: [],
          order: order++,
        },
        {
          id: `js-${order}`,
          title: 'Advanced JavaScript Concepts',
          description: 'Learn closures, promises, async/await, and modern ES6+ features.',
          difficulty: 'Intermediate',
          estimatedHours: 12,
          resources: [
            { type: 'Article', title: 'Understanding Closures', url: 'https://javascript.info/closure', description: 'Deep dive into closures' },
            { type: 'Course', title: 'Modern JavaScript', url: 'https://www.udemy.com/course/modern-javascript', description: 'Complete modern JS course' },
          ],
          prerequisites: [`js-${order - 1}`],
          order: order++,
        }
      );
    } else if (subject === 'Databases') {
      topics.push(
        {
          id: `db-${order}`,
          title: 'Database Fundamentals',
          description: 'Understand database concepts, SQL basics, and data modeling.',
          difficulty: 'Beginner',
          estimatedHours: 10,
          resources: [
            { type: 'Course', title: 'SQL for Beginners', url: 'https://www.codecademy.com/learn/learn-sql', description: 'Interactive SQL course' },
            { type: 'Documentation', title: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', description: 'Official PostgreSQL guide' },
          ],
          prerequisites: [],
          order: order++,
        }
      );
    } else if (subject === 'React') {
      topics.push(
        {
          id: `react-${order}`,
          title: 'React Basics',
          description: 'Learn React components, JSX, props, and state management.',
          difficulty: 'Beginner',
          estimatedHours: 15,
          resources: [
            { type: 'Documentation', title: 'React Official Docs', url: 'https://react.dev', description: 'Official React documentation' },
            { type: 'Video', title: 'React Tutorial', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', description: 'Complete React course' },
          ],
          prerequisites: [],
          order: order++,
        }
      );
    }
  });

  return topics;
};

module.exports = {
  generateLearningPath,
};

