const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate personalized learning path based on assessment results
 */
const generateLearningPath = async (assessmentResults, subjects, completedCourses = []) => {
  try {
    // Format assessment results for Gemini
    const resultsSummary = Object.entries(assessmentResults).map(([subject, data]) => {
      return `${subject}: Score ${data.score}% (${data.level} level)`;
    }).join('\n');

    const completedSummary = (completedCourses && completedCourses.length > 0)
      ? completedCourses.map(c => `- ${c}`).join('\n')
      : 'None';

    const prompt = `You are an expert educational advisor. Based on the following skill assessment results and any previously completed courses or assessments, generate a personalized learning path.

Assessment Results:
${resultsSummary}

Subjects Assessed: ${subjects.join(', ')}

Previously Completed Courses / Assessments (if any):
${completedSummary}

Weighting and generation instructions (follow exactly):

1) Compute a knowledge gap for each subject as (100 - score). Prioritize subjects by descending knowledge gap (largest deficit first) so topics primarily address the weakest areas.

2) Allocate most topics (approximately 60%) to close the highest-priority knowledge gaps, allocate ~30% to reinforce intermediate areas, and reserve ~10% for advanced/enrichment topics that build on areas where the user scored strongly (score >= 85).

3) If the completedCourses list contains entries, do NOT repeat the same course resources; instead recommend advanced or adjacent topics that build on those completed items.

4) If multiple assessments exist for the same subject, treat the most recent score as the authoritative indicator of current ability.

5) Provide 8-12 topics that build logically. For each topic, ensure it addresses one or more of the assessment-identified gaps and list the specific subject(s) or assessment(s) it targets in the description.

6) Keep output strictly as a JSON array of topics with the exact schema below (no extra text, no markdown, no code blocks). The original schema must be followed so it can be parsed programmatically.

Return the response as a JSON array of topics with this exact structure:
[
  {
    "id": "topic-1",
    "title": "Topic Title",
    "description": "Brief description (include which assessment(s)/subject(s) this topic addresses)",
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

