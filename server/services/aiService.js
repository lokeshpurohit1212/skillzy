/**
 * Skillzy 2.0 AI Learning Copilot Service
 * Multi-provider abstraction (Google Gemini, OpenAI) with a rich Deterministic Fallback Engine.
 */

const crypto = require('crypto');

/**
 * Deterministic roadmap knowledge templates for reliable offline/fallback generation
 */
const SKILL_DOMAINS = {
  programming: ['python', 'javascript', 'react', 'node', 'java', 'c++', 'go', 'rust', 'typescript', 'web development'],
  design: ['ui/ux', 'figma', 'graphic design', 'photoshop', 'illustrator', '3d modeling', 'blender'],
  data: ['data science', 'machine learning', 'sql', 'python for data', 'excel', 'data analysis', 'power bi'],
  music: ['guitar', 'piano', 'singing', 'music production', 'drums', 'violin', 'ukulele'],
  language: ['spanish', 'french', 'german', 'japanese', 'mandarin', 'english', 'hindi']
};

function detectDomain(skillName) {
  const lower = skillName.toLowerCase();
  for (const [domain, keywords] of Object.entries(SKILL_DOMAINS)) {
    if (keywords.some(k => lower.includes(k))) return domain;
  }
  return 'general';
}

/**
 * Deterministic roadmap generator for offline/free-tier reliability
 */
function generateDeterministicRoadmap(params) {
  const {
    skillName,
    currentProficiency = 'Beginner',
    targetProficiency = 'Advanced',
    weeklyCommitmentHours = 5,
    targetDate = null
  } = params;

  const domain = detectDomain(skillName);

  const milestonesTemplates = {
    programming: [
      {
        title: `Core Foundations & Syntax of ${skillName}`,
        description: `Master fundamental syntax, control flow, functions, and key conceptual paradigms in ${skillName}.`,
        weeklyGoal: `Complete basic interactive scripts and solve 10 foundational algorithmic exercises.`,
        practiceExercises: [
          `Build a command-line utility applying core variables and functions`,
          `Implement modular data processing routines with error handling`,
          `Write unit tests verifying edge cases in core functions`
        ],
        suggestedSessionTopics: [
          `Architecture breakdown & execution model of ${skillName}`,
          `Idiomatic coding standards, debugging techniques, and best practices`,
          `Live code review of initial exercise repository`
        ],
        revisionActivities: [`Flashcards on core keywords and standard library functions`, `Refactor code for readability`]
      },
      {
        title: `Intermediate Data Structures & Real-World Patterns`,
        description: `Explore data modeling, asynchronous flows, standard libraries, and modular design.`,
        weeklyGoal: `Architect a structured mini-application adhering to clean architecture principles.`,
        practiceExercises: [
          `Integrate an external API with asynchronous requests and state management`,
          `Build a persistent data storage layer with validation`,
          `Implement robust logging and exception handling`
        ],
        suggestedSessionTopics: [
          `Concurrency and memory management deep-dive`,
          `Clean code patterns and dependency separation`,
          `Collaborative pair-programming on mini-app API integrations`
        ],
        revisionActivities: [`Trace error stack traces and explain root cause fix`, `Benchmarking alternative algorithmic approaches`]
      },
      {
        title: `Production Architecture, Testing & Portfolio Delivery in ${skillName}`,
        description: `Scale up to advanced tooling, automated test suites, deployment workflows, and performance optimization.`,
        weeklyGoal: `Complete and publish an end-to-end portfolio project with automated CI/CD and full documentation.`,
        practiceExercises: [
          `Write integration and end-to-end tests covering all critical paths`,
          `Optimize bundle/binary size and runtime throughput`,
          `Deploy live demonstration with continuous deployment pipeline`
        ],
        suggestedSessionTopics: [
          `System architecture review with mentor`,
          `Mock technical interview discussing design decisions`,
          `Live showcase and performance profiling`
        ],
        revisionActivities: [`Read official style guide and lint entire codebase`, `Produce architecture diagram for portfolio`]
      }
    ],
    design: [
      {
        title: `Design Fundamentals, Wireframing & Design Systems`,
        description: `Learn typography, color theory, visual hierarchy, layout grids, and component design systems.`,
        weeklyGoal: `Construct a low-fidelity wireframe prototype for an end-to-end user workflow.`,
        practiceExercises: [`Design 5 distinct UI landing page hero layouts`, `Create a cohesive design system component kit`],
        suggestedSessionTopics: [`Visual design heuristics and accessible contrast ratios`, `Component states and auto-layout mechanics`],
        revisionActivities: [`Critique top 3 industry products against Nielsen Norman heuristics`]
      },
      {
        title: `High-Fidelity Interactive Prototyping & Micro-Interactions`,
        description: `Master variables, responsive constraints, transitions, and component micro-animations.`,
        weeklyGoal: `Build a clickable, high-fidelity interactive prototype with realistic micro-animations.`,
        practiceExercises: [`Prototype a multi-step user onboarding flow`, `Build interactive variants with animated micro-feedback`],
        suggestedSessionTopics: [`Design handoff strategies for engineers`, `Usability test facilitation techniques`],
        revisionActivities: [`Conduct user test with peer and record actionable friction points`]
      },
      {
        title: `Comprehensive Case Study & Portfolio Asset Delivery`,
        description: `Synthesize research, problem framing, iterative explorations, and final verified artifacts into a case study.`,
        weeklyGoal: `Publish a polished design case study with interactive prototype walkthrough.`,
        practiceExercises: [`Write a 5-section design case study with quantified outcomes`, `Prepare presentation slide deck`],
        suggestedSessionTopics: [`Portfolio presentation and design defense critique`, `Career positioning in the design marketplace`],
        revisionActivities: [`Peer review session with mentor simulating hiring review`]
      }
    ],
    general: [
      {
        title: `Foundations, Vocabulary & Core Principles of ${skillName}`,
        description: `Establish structured conceptual understanding and baseline habits for ${skillName}.`,
        weeklyGoal: `Master core terminology, tools, and preliminary exercise drills.`,
        practiceExercises: [`Daily 30-minute structured deliberate practice sessions`, `Document 5 foundational discoveries in a journal`],
        suggestedSessionTopics: [`Goal alignment and methodology validation with mentor`, `Baseline assessment and personalized calibration`],
        revisionActivities: [`Summarize foundational takeaways in one page`]
      },
      {
        title: `Applied Technique & Contextual Problem Solving`,
        description: `Transition from isolated theory to complex real-world situational challenges.`,
        weeklyGoal: `Execute a multi-stage project demonstrating practical mastery.`,
        practiceExercises: [`Solve 3 complex scenarios without external guidance`, `Teach back a core concept to a peer`],
        suggestedSessionTopics: [`Live technique diagnosis with mentor`, `Troubleshooting persistent roadblocks`],
        revisionActivities: [`Self-recorded practice session with retrospective analysis`]
      },
      {
        title: `Mastery, Creative Synthesis & Portfolio Showcase`,
        description: `Achieve high confidence, fluid execution, and presentable tangible evidence.`,
        weeklyGoal: `Produce a final verified demonstration piece for portfolio presentation.`,
        practiceExercises: [`Create capstone project incorporating all learned techniques`, `Peer critique and refinement`],
        suggestedSessionTopics: [`Final mentor review and verification sign-off`, `Roadmap for lifelong self-directed expansion`],
        revisionActivities: [`Reflection on learning velocity and next horizon goals`]
      }
    ]
  };

  const templates = milestonesTemplates[domain] || milestonesTemplates.general;

  const milestones = templates.map((tmpl, index) => ({
    id: `m-${index + 1}-${crypto.randomBytes(4).toString('hex')}`,
    title: tmpl.title,
    description: tmpl.description,
    weeklyGoal: tmpl.weeklyGoal,
    completed: false,
    practiceExercises: tmpl.practiceExercises,
    suggestedSessionTopics: tmpl.suggestedSessionTopics,
    revisionActivities: tmpl.revisionActivities,
    order: index + 1
  }));

  return {
    skillName,
    currentProficiency,
    targetProficiency,
    weeklyCommitmentHours,
    targetCompletionDate: targetDate ? new Date(targetDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    milestones,
    generatedBy: 'deterministic_engine'
  };
}

/**
 * Generate session preparation agenda, discussion questions, and practice tasks
 */
async function generateSessionPreparation(params) {
  const { skillTopic, durationMinutes = 60, learnerLevel = 'Beginner', learningGoal = '' } = params;

  // Check for external AI keys
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert tutor on Skillzy. Generate a structured JSON session prep agenda for a ${durationMinutes}-minute skill exchange session on "${skillTopic}". Learner level: ${learnerLevel}. Goal: "${learningGoal}". Return ONLY raw JSON with keys: agenda (array of {topic, duration, description}), exercises (array of strings), discussionQuestions (array of strings), learningObjectives (array of strings). Do not wrap in markdown quotes.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return { ...parsed, generatedBy: 'ai_gemini' };
        }
      }
    } catch (err) {
      console.warn('Gemini session prep fallback triggered:', err.message);
    }
  }

  // Deterministic high-quality fallback agenda
  const halfDuration = Math.round(durationMinutes * 0.4);
  const introDuration = Math.round(durationMinutes * 0.15);
  const practiceDuration = Math.round(durationMinutes * 0.35);
  const wrapupDuration = durationMinutes - halfDuration - introDuration - practiceDuration;

  return {
    agenda: [
      {
        topic: 'Session Alignment & Diagnostic Check',
        duration: `${introDuration} mins`,
        description: `Review learner goals, clarify current challenges, and set measurable session target.`
      },
      {
        topic: `Core Demonstration: ${skillTopic}`,
        duration: `${halfDuration} mins`,
        description: `Interactive mentor walkthrough showing step-by-step best practices and real-world execution.`
      },
      {
        topic: 'Hands-on Pair Practice',
        duration: `${practiceDuration} mins`,
        description: `Learner shares screen and drives execution while mentor provides real-time coaching.`
      },
      {
        topic: 'Q&A, Review & Take-Home Practice Challenge',
        duration: `${wrapupDuration} mins`,
        description: `Summarize key insights, clarify doubts, and agree on practice tasks before the next session.`
      }
    ],
    exercises: [
      `Complete a guided hands-on exercise applying the primary technique explored today`,
      `Document 3 key takeaways and one question for the next exchange session`
    ],
    discussionQuestions: [
      `What has been the most difficult obstacle in learning ${skillTopic} so far?`,
      `How does this skill connect with your broader personal or career ambitions?`,
      `What pace and feedback style works best for you?`
    ],
    learningObjectives: [
      `Understand and explain the core mechanics of ${skillTopic}`,
      `Independently execute basic workflows without relying on external step-by-step guides`,
      `Identify common anti-patterns and learn how to debug them`
    ],
    generatedBy: 'deterministic_engine'
  };
}

/**
 * Generate full learning roadmap with AI provider or deterministic engine
 */
async function generateRoadmap(params) {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a 3-milestone learning roadmap for learning "${params.skillName}" from ${params.currentProficiency || 'Beginner'} to ${params.targetProficiency || 'Advanced'}. Return ONLY valid JSON format with keys: skillName, currentProficiency, targetProficiency, milestones (array of {title, description, weeklyGoal, practiceExercises, suggestedSessionTopics, revisionActivities}). No markdown markdown backticks.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          parsed.milestones = (parsed.milestones || []).map((m, i) => ({
            ...m,
            id: `m-${i + 1}-${crypto.randomBytes(4).toString('hex')}`,
            completed: false,
            order: i + 1
          }));
          return {
            ...parsed,
            weeklyCommitmentHours: params.weeklyCommitmentHours || 5,
            targetCompletionDate: params.targetDate ? new Date(params.targetDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            generatedBy: 'ai_gemini'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini roadmap generation fallback triggered:', err.message);
    }
  }

  // Use reliable deterministic engine
  return generateDeterministicRoadmap(params);
}

module.exports = {
  generateRoadmap,
  generateSessionPreparation
};
