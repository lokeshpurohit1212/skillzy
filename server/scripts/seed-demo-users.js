/**
 * Skillzy Demo Seeder - 20 Realistic Indian Profiles
 * 
 * Safely and idempotently populates the Skillzy platform with 20 diverse, realistic
 * Indian profiles with reciprocal skills, exchange activity, chats, reviews, and community threads.
 * 
 * Run with: npm run seed
 * Or: node scripts/seed-demo-users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Swap = require('../models/Swap');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Session = require('../models/Session');
const Community = require('../models/Community');

const DEMO_PASSWORD = 'SkillzyDemo@2026';

// 20 Detailed Indian Profiles Specification
const DEMO_USERS_DATA = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    location: 'Delhi, India',
    bio: "Full-Stack Developer | Building products with React and Node.js. I'm a full-stack developer who enjoys turning ideas into practical web applications. I can help beginners understand JavaScript, React, REST APIs, and backend fundamentals. I'm currently improving my UI/UX skills and learning to design more accessible products.",
    avatarBg: '5D3C64',
    skillsOffered: [
      { name: 'JavaScript', description: 'Modern ES6+, async/await, closures, and DOM manipulation patterns.', proficiency: 'Advanced' },
      { name: 'React.js', description: 'Component lifecycle, hooks, state management, and reusable UI components.', proficiency: 'Intermediate' },
      { name: 'Node.js', description: 'Express.js servers, middleware, authentication, and REST routing.', proficiency: 'Intermediate' },
      { name: 'REST APIs', description: 'Designing clean RESTful endpoints, status codes, and JSON contracts.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'UI/UX Design', description: 'User-centered design, wireframing, and creating clean accessible interfaces.', priority: 'High' },
      { name: 'Figma', description: 'Auto-layout, design tokens, reusable components, and interactive prototypes.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 7:00 PM - 10:00 PM IST' },
    languages: ['English', 'Hindi', 'Punjabi'],
    interests: ['Open source', 'Startups', 'Cricket', 'Tech communities'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'DevMatch — Developer Collaboration Hub', description: 'Full-stack MERN platform connecting developers for hackathons.', projectUrl: 'https://github.com/example/devmatch', skillsUsed: ['React', 'Node.js', 'MongoDB'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 220,
    level: 3,
    streak: { count: 4, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'community_helper', name: 'Community Helper', icon: 'heart', description: 'Received 5-star review from a learning partner' }
    ],
    membership: 'premium'
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    location: 'Kochi, Kerala',
    bio: "UI/UX Designer | Making digital products easier to use. I'm a UI/UX designer passionate about clean interfaces and user-centered design. I enjoy teaching Figma, wireframing, design systems, and usability basics. I want to improve my frontend development skills so I can collaborate more effectively with developers.",
    avatarBg: '7B466A',
    skillsOffered: [
      { name: 'UI/UX Design', description: 'Heuristic evaluation, information architecture, and clean user experience.', proficiency: 'Advanced' },
      { name: 'Figma', description: 'Component variants, auto-layout 5.0, variables, and responsive design systems.', proficiency: 'Advanced' },
      { name: 'Wireframing', description: 'Low to high-fidelity wireframes, user journeys, and task flows.', proficiency: 'Intermediate' },
      { name: 'Prototyping', description: 'Interactive clickable prototypes and micro-interaction design.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'React', description: 'Frontend component structure, props, and connecting UI with state.', priority: 'High' },
      { name: 'HTML', description: 'Semantic HTML5 structure and web accessibility standards (WCAG).', priority: 'Medium' },
      { name: 'CSS', description: 'Tailwind CSS, Flexbox, CSS Grid, and responsive layout styling.', priority: 'High' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: true, customSchedule: 'Sat-Sun 10:00 AM - 6:00 PM IST' },
    languages: ['English', 'Malayalam', 'Hindi'],
    interests: ['Illustration', 'Reading', 'Accessibility', 'Design challenges'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'visual' },
    portfolio: [
      { title: 'FinFlow — Personal Finance App UI', description: 'Complete Figma design system and 40+ mobile screens for expense tracking.', projectUrl: 'https://figma.com/@example/finflow', skillsUsed: ['Figma', 'UI/UX Design', 'Prototyping'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 2,
    xp: 210,
    level: 3,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'design_champion', name: 'Design Champion', icon: 'award', description: 'Shared top-rated design knowledge' }
    ],
    membership: 'free'
  },
  {
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    location: 'Lucknow, Uttar Pradesh',
    bio: "Python Developer | Exploring data science. I enjoy solving problems with Python and automating repetitive tasks. I can teach Python fundamentals, scripting, and basic data analysis. I'm currently exploring machine learning and want to become more confident in building and evaluating ML models.",
    avatarBg: '3B82F6',
    skillsOffered: [
      { name: 'Python', description: 'Core Python, OOP, list comprehensions, decorators, and virtual envs.', proficiency: 'Advanced' },
      { name: 'Programming Fundamentals', description: 'Algorithm thinking, clean code structure, and debugging patterns.', proficiency: 'Intermediate' },
      { name: 'Automation', description: 'Web scraping with BeautifulSoup, file batching, and automated reports.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Machine Learning', description: 'Scikit-learn pipelines, model evaluation metrics, and regression/classification.', priority: 'High' },
      { name: 'SQL', description: 'Relational database queries, joins, grouping, and subqueries.', priority: 'Medium' },
      { name: 'Statistics', description: 'Descriptive stats, probability distributions, and hypothesis tests.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Thu 6:30 PM - 9:30 PM IST' },
    languages: ['English', 'Hindi', 'Urdu'],
    interests: ['Chess', 'Technology', 'Puzzles'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'AutoReporter CLI', description: 'Python utility script that parses CSVs and generates automated PDF summary reports.', projectUrl: 'https://github.com/example/autoreporter', skillsUsed: ['Python', 'Automation'], verified: true }
    ],
    timeCredits: 6,
    swapsCompleted: 1,
    xp: 140,
    level: 2,
    streak: { count: 2, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    location: 'Chennai, Tamil Nadu',
    bio: "Data Analyst | Turning data into useful insights. I'm interested in finding patterns in data and communicating results clearly. I can help with SQL queries, spreadsheets, Python data analysis, and basic dashboards. I'm learning backend development and would love to understand how production applications manage data.",
    avatarBg: '9F6496',
    skillsOffered: [
      { name: 'SQL', description: 'Complex joins, window functions, CTEs, indexing, and performance queries.', proficiency: 'Advanced' },
      { name: 'Data Visualization', description: 'Creating actionable business dashboards with Tableau and PowerBI concepts.', proficiency: 'Intermediate' },
      { name: 'Pandas', description: 'Dataframe manipulation, data cleaning, aggregation, and time series handling.', proficiency: 'Advanced' },
      { name: 'Excel', description: 'Advanced lookups, pivot tables, nested formulas, and data modeling.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Java', description: 'Core Java syntax, OOP inheritance, collections, and multi-threading.', priority: 'High' },
      { name: 'Spring Boot', description: 'Building microservices, Spring Data JPA, and REST controllers.', priority: 'High' },
      { name: 'Backend Development', description: 'API architecture, middleware, caching, and server deployment.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: false, customSchedule: 'Sat-Sun 8:00 AM - 1:00 PM IST' },
    languages: ['English', 'Tamil', 'Hindi'],
    interests: ['Carnatic music', 'Books', 'Analytics'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'reading' },
    portfolio: [
      { title: 'SaaS Churn Analysis Dashboard', description: 'Exploratory data analysis uncovering key drivers of customer churn using SQL & Pandas.', projectUrl: 'https://github.com/example/churn-analysis', skillsUsed: ['SQL', 'Pandas', 'Data Visualization'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 230,
    level: 3,
    streak: { count: 5, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'data_wizard', name: 'Data Wizard', icon: 'database', description: 'Shared advanced data analysis expertise' }
    ],
    membership: 'premium'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    location: 'Jaipur, Rajasthan',
    bio: "Java Developer | Backend engineering enthusiast. I enjoy writing structured, maintainable Java code and understanding how backend systems work. I can help learners with core Java, object-oriented programming, collections, and debugging. I'm currently learning modern frontend development.",
    avatarBg: 'D97706',
    skillsOffered: [
      { name: 'Java', description: 'Core Java, OOP principles, inheritance, polymorphism, and memory management.', proficiency: 'Advanced' },
      { name: 'OOP', description: 'SOLID design principles, design patterns, encapsulation, and clean structure.', proficiency: 'Advanced' },
      { name: 'Collections Framework', description: 'ArrayList, HashMap, LinkedList, TreeSet internals, and custom comparators.', proficiency: 'Intermediate' },
      { name: 'Data Structures & Algorithms', description: 'Arrays, stacks, queues, binary search trees, and algorithm complexity.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'React', description: 'Building single-page web applications with React components and state.', priority: 'High' },
      { name: 'CSS', description: 'Responsive layouts, modern CSS Grid, Flexbox, and Tailwind styling.', priority: 'Medium' },
      { name: 'Frontend Architecture', description: 'Client routing, state management, and modern bundlers.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 7:00 PM - 10:00 PM IST' },
    languages: ['English', 'Hindi', 'Marwari'],
    interests: ['Badminton', 'Coding contests', 'Travel'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'interactive' },
    portfolio: [
      { title: 'Hospital Management Core Service', description: 'Spring Boot REST service managing patient appointments and doctor scheduling.', projectUrl: 'https://github.com/example/hospital-core', skillsUsed: ['Java', 'OOP', 'SQL'], verified: true }
    ],
    timeCredits: 6,
    swapsCompleted: 1,
    xp: 150,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Meera Krishnan',
    email: 'meera.krishnan@example.com',
    location: 'Bengaluru, Karnataka',
    bio: "Digital Illustrator | Creative visual storyteller. I'm a digital illustrator who loves turning rough ideas into expressive visuals. I can teach beginner-friendly illustration, color theory, composition, and visual storytelling. I'm interested in learning digital marketing to understand how creators reach the right audience.",
    avatarBg: 'EC4899',
    skillsOffered: [
      { name: 'Digital Illustration', description: 'Character design, line art, digital inking, and graphic tablet workflows.', proficiency: 'Advanced' },
      { name: 'Color Theory', description: 'Color harmony, lighting schemes, contrast, and atmospheric palettes.', proficiency: 'Intermediate' },
      { name: 'Composition', description: 'Focal points, rule of thirds, framing, and visual storytelling pacing.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Digital Marketing', description: 'Creator audience growth, content funnel design, and online reach.', priority: 'High' },
      { name: 'Social Media Strategy', description: 'Instagram, LinkedIn, content calendars, and community engagement.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: true, customSchedule: 'Sat-Sun 11:00 AM - 7:00 PM IST' },
    languages: ['English', 'Kannada', 'Tamil', 'Hindi'],
    interests: ['Art', 'Animation', 'Stationery', 'Photography'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'visual' },
    portfolio: [
      { title: 'Mythos of India Illustration Series', description: 'Set of 12 vector art pieces reinterpreting folklore with modern color palettes.', projectUrl: 'https://behance.net/example/mythos', skillsUsed: ['Digital Illustration', 'Color Theory'], verified: true }
    ],
    timeCredits: 6,
    swapsCompleted: 1,
    xp: 130,
    level: 2,
    streak: { count: 2, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Aditya Patel',
    email: 'aditya.patel@example.com',
    location: 'Ahmedabad, Gujarat',
    bio: "Android Developer | Learning by building apps. I build small mobile applications and enjoy helping beginners understand app development. I can teach Android fundamentals, Kotlin basics, and mobile UI concepts. I'm working toward becoming a stronger backend developer and learning how APIs and databases fit into mobile systems.",
    avatarBg: '10B981',
    skillsOffered: [
      { name: 'Android Development', description: 'Android Studio, Activity lifecycle, Fragments, Intent routing, and ViewBinding.', proficiency: 'Intermediate' },
      { name: 'Kotlin', description: 'Kotlin syntax, null safety, data classes, Coroutines, and extension functions.', proficiency: 'Intermediate' },
      { name: 'Mobile UI', description: 'ConstraintLayout, Material 3 design guidelines, and Jetpack Compose basics.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Node.js', description: 'Creating backend server routes, handling JWT auth, and async programming.', priority: 'High' },
      { name: 'MongoDB', description: 'Document schemas, Mongoose models, and aggregating collections.', priority: 'High' },
      { name: 'REST APIs', description: 'Building and consuming robust HTTP APIs from mobile clients.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 8:00 PM - 10:30 PM IST' },
    languages: ['English', 'Gujarati', 'Hindi'],
    interests: ['Gadgets', 'Cycling', 'Hackathons'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'HabitZen — Daily Habit Tracker', description: 'Native Android application built in Kotlin with local Room database and dark mode.', projectUrl: 'https://github.com/example/habitzen', skillsUsed: ['Android Development', 'Kotlin'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 60,
    level: 1,
    streak: { count: 1, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    location: 'Hyderabad, Telangana',
    bio: "Machine Learning Learner | Python and data enthusiast. I'm exploring machine learning through small practical projects. I can help beginners with Python, data cleaning, visualization, and basic statistics. I want to improve my communication and public speaking skills so I can explain technical ideas clearly.",
    avatarBg: '8B5CF6',
    skillsOffered: [
      { name: 'Python Basics', description: 'Python fundamentals, data structures, loops, functions, and standard packages.', proficiency: 'Intermediate' },
      { name: 'Data Cleaning', description: 'Handling nulls, duplicate values, outlier inspection, and feature formatting.', proficiency: 'Intermediate' },
      { name: 'Matplotlib', description: 'Line plots, bar charts, histograms, custom styles, and Seaborn visual plots.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Public Speaking', description: 'Overcoming stage anxiety, structured rhetoric, and vocal delivery.', priority: 'High' },
      { name: 'Presentation Skills', description: 'Creating engaging slides and explaining technical architectures clearly.', priority: 'High' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, evenings: true, customSchedule: 'Sat-Sun 2:00 PM - 7:00 PM IST' },
    languages: ['English', 'Telugu', 'Hindi'],
    interests: ['Podcasts', 'Science', 'Volunteering'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'interactive' },
    portfolio: [
      { title: 'Air Quality Index Predictor', description: 'Jupyter notebook analyzing Hyderabad sensor data with exploratory visual graphs.', projectUrl: 'https://github.com/example/aqi-hyderabad', skillsUsed: ['Python Basics', 'Data Cleaning', 'Matplotlib'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 2,
    xp: 200,
    level: 3,
    streak: { count: 4, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'consistent_mentor', name: 'Consistent Mentor', icon: 'star', description: 'Completed multiple reciprocal swaps' }
    ],
    membership: 'premium'
  },
  {
    name: 'Arjun Das',
    email: 'arjun.das@example.com',
    location: 'Kolkata, West Bengal',
    bio: "Content Writer | Making complex ideas understandable. I enjoy writing clear, engaging content for blogs and educational projects. I can help with article structure, editing, storytelling, and writing fundamentals. I'm learning web development because I want to publish and manage my own digital projects.",
    avatarBg: '6366F1',
    skillsOffered: [
      { name: 'Content Writing', description: 'SEO copywriting, educational articles, headline hooks, and clarity.', proficiency: 'Advanced' },
      { name: 'Editing', description: 'Proofreading, structural editing, conciseness, and tone calibration.', proficiency: 'Advanced' },
      { name: 'Storytelling', description: 'Narrative arcs, audience retention, metaphors, and non-fiction structures.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'HTML', description: 'Semantic HTML markup, semantic tags, and forms.', priority: 'Medium' },
      { name: 'CSS', description: 'CSS selectors, layout models, typography styling, and media queries.', priority: 'High' },
      { name: 'WordPress', description: 'Managing custom CMS templates, plugins, and self-hosted blogs.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, mornings: false, evenings: true, customSchedule: 'Flexible evenings 6:00 PM - 9:00 PM IST' },
    languages: ['English', 'Bengali', 'Hindi'],
    interests: ['Literature', 'Cinema', 'Football'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'TechExplained Publication', description: 'Curated Medium blog with 25+ accessible articles demystifying cloud computing.', projectUrl: 'https://medium.com/@example/techexplained', skillsUsed: ['Content Writing', 'Editing'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 80,
    level: 1,
    streak: { count: 2, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Kavya Menon',
    email: 'kavya.menon@example.com',
    location: 'Thiruvananthapuram, Kerala',
    bio: "English Communication Mentor | Speak with confidence. I enjoy helping people communicate more clearly and confidently. I can support conversational English, vocabulary building, interview practice, and presentation preparation. I'm learning graphic design to create better educational content.",
    avatarBg: '4A2F4F',
    skillsOffered: [
      { name: 'Conversational English', description: 'Fluency, natural phrasing, active listening, and accent neutrality.', proficiency: 'Advanced' },
      { name: 'Vocabulary Building', description: 'Contextual words, idioms, professional communication, and nuance.', proficiency: 'Advanced' },
      { name: 'Interview Preparation', description: 'STAR response format, behavioral interviews, and confident articulation.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Graphic Design', description: 'Visual hierarchy, typography combinations, and digital layout balance.', priority: 'High' },
      { name: 'Canva', description: 'Creating professional educational carousels, worksheets, and slide decks.', priority: 'Medium' },
      { name: 'Visual Communication', description: 'Infographics, diagrammatic explanations, and visual metaphors.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: false, customSchedule: 'Sat-Sun 8:30 AM - 12:30 PM IST' },
    languages: ['English', 'Malayalam', 'Hindi'],
    interests: ['Reading', 'Debates', 'Music'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'visual' },
    portfolio: [
      { title: 'The Confident Speaker Guide', description: 'Interactive workbook used by 100+ college students for campus placements.', projectUrl: 'https://notion.so/example/speakerguide', skillsUsed: ['Conversational English', 'Interview Preparation'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 2,
    xp: 190,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'community_helper', name: 'Community Helper', icon: 'heart', description: 'Helped peers speak with confidence' }
    ],
    membership: 'free'
  },
  {
    name: 'Rahul Choudhary',
    email: 'rahul.choudhary@example.com',
    location: 'Pune, Maharashtra',
    bio: "Cybersecurity Enthusiast | Learning ethical security. I'm interested in web security, secure coding, and understanding common vulnerabilities in controlled learning environments. I can teach basic networking, Linux commands, and security fundamentals. I'm improving my Python skills to automate safe security checks.",
    avatarBg: '0D9488',
    skillsOffered: [
      { name: 'Linux Basics', description: 'Terminal navigation, bash commands, file permissions, and process tracking.', proficiency: 'Intermediate' },
      { name: 'Networking Fundamentals', description: 'TCP/IP, subnetting, DNS resolution, HTTP headers, and ports.', proficiency: 'Intermediate' },
      { name: 'Cybersecurity Awareness', description: 'OWASP Top 10 vulnerabilities, credential hygiene, and secure dev habits.', proficiency: 'Beginner' }
    ],
    skillsWanted: [
      { name: 'Python Automation', description: 'Writing security scripts, socket connections, and automated log parsers.', priority: 'High' },
      { name: 'Scripting', description: 'Bash and Python scripting for system monitoring and automated audits.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, evenings: true, customSchedule: 'Sat-Sun 6:00 PM - 10:00 PM IST' },
    languages: ['English', 'Hindi', 'Marathi'],
    interests: ['Linux', 'CTF challenges', 'Open source'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'CTF Writeups & Security Cheatsheet', description: 'Curated repository of beginner CTF challenges and safe Linux hardening tips.', projectUrl: 'https://github.com/example/linux-sec-notes', skillsUsed: ['Linux Basics', 'Networking Fundamentals'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 75,
    level: 1,
    streak: { count: 1, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Ishita Banerjee',
    email: 'ishita.banerjee@example.com',
    location: 'Mumbai, Maharashtra',
    bio: "Video Editor | Creating engaging visual stories. I enjoy editing videos and shaping raw footage into engaging stories. I can help beginners with editing workflows, transitions, pacing, and basic color correction. I'm interested in photography and want to improve my understanding of lighting and composition.",
    avatarBg: 'F43F5E',
    skillsOffered: [
      { name: 'Video Editing', description: 'Non-linear timeline editing, cutting on action, pacing, and audio mixing.', proficiency: 'Advanced' },
      { name: 'Storytelling', description: 'Narrative structure, b-roll placement, hook pacing, and visual rhythm.', proficiency: 'Intermediate' },
      { name: 'Color Correction', description: 'Balancing exposure, color wheels, applying LUTs, and matching clips.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Photography', description: 'Manual camera controls, shutter speed, aperture, ISO, and focal lengths.', priority: 'High' },
      { name: 'Lighting', description: 'Three-point lighting, natural light modification, and studio softboxes.', priority: 'Medium' },
      { name: 'Composition', description: 'Framing, leading lines, negative space, and architectural balance.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: true, customSchedule: 'Weekends 10:00 AM - 6:00 PM IST' },
    languages: ['English', 'Bengali', 'Hindi'],
    interests: ['Film', 'Travel', 'Music'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'visual' },
    portfolio: [
      { title: 'Mumbai Monsoon Documentary Short', description: 'A 5-minute visual film edited with synchronized ambient soundscape.', projectUrl: 'https://youtube.com/@example/monsoon-film', skillsUsed: ['Video Editing', 'Storytelling', 'Color Correction'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 2,
    xp: 225,
    level: 3,
    streak: { count: 4, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' },
      { id: 'creative_spark', name: 'Creative Spark', icon: 'camera', description: 'Mastered visual creative arts' }
    ],
    membership: 'premium'
  },
  {
    name: 'Karthik Subramanian',
    email: 'karthik.subramanian@example.com',
    location: 'Coimbatore, Tamil Nadu',
    bio: "Mathematics Mentor | Making difficult concepts simpler. I like breaking complicated mathematical ideas into simple, understandable steps. I can help with algebra, calculus fundamentals, logical reasoning, and quantitative aptitude. I'm learning data science and want to apply mathematical concepts to real datasets.",
    avatarBg: '1E40AF',
    skillsOffered: [
      { name: 'Mathematics', description: 'Linear algebra, matrix operations, multivariable calculus, and proofs.', proficiency: 'Expert' },
      { name: 'Algebra', description: 'Polynomials, quadratic equations, systems of equations, and inequalities.', proficiency: 'Expert' },
      { name: 'Quantitative Aptitude', description: 'Permutations, combinations, probability, ratios, and logical puzzles.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Data Science', description: 'Applying mathematical concepts to real datasets and model evaluation.', priority: 'High' },
      { name: 'Pandas', description: 'Dataframe manipulation, data wrangling, and statistical grouping.', priority: 'Medium' },
      { name: 'Data Visualization', description: 'Plotting statistical functions and regression distributions.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 7:00 PM - 9:30 PM IST' },
    languages: ['English', 'Tamil'],
    interests: ['Sudoku', 'Chess', 'Teaching'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Calculus Made Intuitive Video Notes', description: 'Visual mathematical proofs explaining derivatives through physical analogies.', projectUrl: 'https://github.com/example/math-intuitive', skillsUsed: ['Mathematics', 'Algebra'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 1,
    xp: 160,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    location: 'Bhopal, Madhya Pradesh',
    bio: "Graphic Designer | Visual identities and creative layouts. I'm a graphic designer who enjoys creating posters, social media graphics, and visual identities. I can teach design fundamentals, typography, color combinations, and Canva workflows. I'm curious about frontend development and want to bring my designs to life on the web.",
    avatarBg: 'D391B0',
    skillsOffered: [
      { name: 'Graphic Design', description: 'Visual hierarchy, grid systems, balance, branding identity, and layouts.', proficiency: 'Advanced' },
      { name: 'Canva', description: 'Advanced Canva brand kits, custom templates, vector elements, and slide decks.', proficiency: 'Advanced' },
      { name: 'Typography', description: 'Font pairing, kerning, leading, hierarchy, and mood-driven type systems.', proficiency: 'Intermediate' },
      { name: 'Branding Basics', description: 'Logo concepting, color guidelines, tone documentation, and brand kits.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'HTML', description: 'Semantic tags, forms, and webpage document tree structure.', priority: 'Medium' },
      { name: 'CSS', description: 'CSS Grid, Flexbox, media queries, and responsive styling.', priority: 'High' },
      { name: 'Responsive Design', description: 'Mobile-first layout development and flexible UI breakpoints.', priority: 'High' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, evenings: true, customSchedule: 'Sat-Sun 1:00 PM - 6:00 PM IST' },
    languages: ['English', 'Hindi'],
    interests: ['Art', 'Branding', 'Photography'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'visual' },
    portfolio: [
      { title: 'CraftArtisan Brand Identity Kit', description: 'Complete brand guide, logos, and stationery for an eco-friendly Indian handicraft brand.', projectUrl: 'https://behance.net/example/craftartisan', skillsUsed: ['Graphic Design', 'Branding Basics', 'Typography'], verified: true }
    ],
    timeCredits: 6,
    swapsCompleted: 1,
    xp: 170,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Sandeep Kumar',
    email: 'sandeep.kumar@example.com',
    location: 'Patna, Bihar',
    bio: "DSA Learner | Practicing problem-solving in C++. I'm focused on improving my programming fundamentals and problem-solving approach. I can help beginners with C programming, C++ basics, loops, arrays, and simple algorithms. I'm currently learning web development so I can build complete projects rather than isolated programs.",
    avatarBg: 'F59E0B',
    skillsOffered: [
      { name: 'C', description: 'Pointers, manual memory allocation, structs, arrays, and standard I/O.', proficiency: 'Intermediate' },
      { name: 'C++', description: 'OOP classes, Standard Template Library (vectors, sets, maps), and syntax.', proficiency: 'Intermediate' },
      { name: 'Programming Fundamentals', description: 'Control flow, recursion, sorting, time complexity, and clean code.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'JavaScript', description: 'ES6+ syntax, functions, events, and DOM manipulation.', priority: 'High' },
      { name: 'React', description: 'Reusable components, useState/useEffect hooks, and modern frontend apps.', priority: 'High' },
      { name: 'Web Development', description: 'Client-server model, HTTP communication, and full-stack structure.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 7:30 PM - 10:30 PM IST' },
    languages: ['English', 'Hindi', 'Bhojpuri'],
    interests: ['Coding practice', 'Cricket', 'Technology'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'C++ Data Structures Library', description: 'Custom implementations of dynamic arrays, linked lists, and binary search trees.', projectUrl: 'https://github.com/example/cpp-data-structures', skillsUsed: ['C++', 'Programming Fundamentals'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 50,
    level: 1,
    streak: { count: 1, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Divya Joshi',
    email: 'divya.joshi@example.com',
    location: 'Dehradun, Uttarakhand',
    bio: "Digital Marketer | Helping ideas find their audience. I'm learning and practicing digital marketing through content planning, SEO fundamentals, and social media campaigns. I can help beginners understand content calendars and basic analytics. I want to improve my video editing and visual storytelling skills.",
    avatarBg: '059669',
    skillsOffered: [
      { name: 'SEO Basics', description: 'Keyword research, on-page SEO, meta tags, search intent, and Google Search Console.', proficiency: 'Intermediate' },
      { name: 'Social Media Marketing', description: 'Audience targeting, campaign scheduling, organic growth, and community management.', proficiency: 'Intermediate' },
      { name: 'Content Planning', description: 'Content calendars, pillar strategies, copy briefs, and cross-platform distribution.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Video Editing', description: 'Editing short-form video reels, pacing, audio sound design, and text callouts.', priority: 'High' },
      { name: 'Motion Graphics', description: 'Lower thirds, title cards, and animated logo reveals.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: true, customSchedule: 'Sat-Sun 10:00 AM - 5:00 PM IST' },
    languages: ['English', 'Hindi', 'Garhwali'],
    interests: ['Travel', 'Content creation', 'Books'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'visual' },
    portfolio: [
      { title: 'EcoTravel Uttarakhand Organic Growth Campaign', description: 'Grew tourism blog traffic by 240% over 6 months using local SEO keywords.', projectUrl: 'https://example.com/ecotravel-case-study', skillsUsed: ['SEO Basics', 'Social Media Marketing'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 90,
    level: 1,
    streak: { count: 2, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Nikhil Rao',
    email: 'nikhil.rao@example.com',
    location: 'Visakhapatnam, Andhra Pradesh',
    bio: "Cloud and DevOps Learner | Automating deployments. I'm exploring Linux, Git, containers, and the fundamentals of deploying applications. I can help with Git workflows, Linux commands, and basic command-line usage. I'm learning backend development to better understand the applications I'm deploying.",
    avatarBg: '0284C7',
    skillsOffered: [
      { name: 'Git', description: 'Branching, merging, rebasing, pull requests, resolving merge conflicts, and commit hygiene.', proficiency: 'Intermediate' },
      { name: 'GitHub', description: 'GitHub Actions CI/CD workflows, pull request reviews, and issue templates.', proficiency: 'Intermediate' },
      { name: 'Linux Basics', description: 'File systems, systemd services, SSH keys, cron jobs, and terminal navigation.', proficiency: 'Intermediate' },
      { name: 'Command Line', description: 'Bash commands, grep, curl, sed, pipe filters, and shell productivity.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Node.js', description: 'Building REST API backend services and handling async events.', priority: 'High' },
      { name: 'Express.js', description: 'Express middleware, routing, and controller architectures.', priority: 'High' },
      { name: 'Backend APIs', description: 'HTTP request handling, authentication, and database connections.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, mornings: false, evenings: true, customSchedule: 'Mon-Fri 7:00 PM - 10:00 PM IST' },
    languages: ['English', 'Telugu', 'Hindi'],
    interests: ['Homelabs', 'Open source', 'Gadgets'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Automated CI/CD Pipeline Template', description: 'Reusable GitHub Actions workflow for testing and deploying containerized Node applications.', projectUrl: 'https://github.com/example/ci-cd-template', skillsUsed: ['Git', 'GitHub', 'Linux Basics'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 85,
    level: 1,
    streak: { count: 2, lastActive: new Date() },
    badges: [],
    membership: 'free'
  },
  {
    name: 'Pooja Shah',
    email: 'pooja.shah@example.com',
    location: 'Surat, Gujarat',
    bio: "Photography Enthusiast | Capturing everyday stories. I'm passionate about photography and enjoy helping beginners understand framing, lighting, and composition. I'm interested in learning UI/UX design because I want to create better visual experiences and eventually work on creative digital products.",
    avatarBg: 'A855F7',
    skillsOffered: [
      { name: 'Photography Basics', description: 'The exposure triangle (aperture, shutter speed, ISO), focus points, and lens choices.', proficiency: 'Advanced' },
      { name: 'Composition', description: 'Leading lines, symmetry, golden spiral, negative space, and candid street framing.', proficiency: 'Advanced' },
      { name: 'Lighting', description: 'Natural ambient lighting, golden hour diffusion, and reflectors.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'UI/UX Design', description: 'User interface design principles, user journeys, and digital typography.', priority: 'High' },
      { name: 'Figma', description: 'Layout grids, components, auto-layout, and designing mobile app mockups.', priority: 'High' },
      { name: 'Prototyping', description: 'Creating interactive clickable wireframes and user flow screens.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: false, customSchedule: 'Sat-Sun 7:30 AM - 12:30 PM IST' },
    languages: ['English', 'Gujarati', 'Hindi'],
    interests: ['Travel', 'Art', 'Architecture'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'visual' },
    portfolio: [
      { title: 'Faces of Gujarat Photo Series', description: 'Documentary photography project featured in an online cultural showcase.', projectUrl: 'https://instagram.com/example_photography', skillsUsed: ['Photography Basics', 'Composition', 'Lighting'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 1,
    xp: 155,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Farhan Ahmed',
    email: 'farhan.ahmed@example.com',
    location: 'Srinagar, Jammu and Kashmir',
    bio: "Public Speaking Learner | Building communication confidence. I enjoy discussions, structured presentations, and learning how to communicate ideas confidently. I can help beginners practice presentations, speech structure, and storytelling. I'm working on my technical skills and want to learn Python for automation and data-related projects.",
    avatarBg: '4338CA',
    skillsOffered: [
      { name: 'Public Speaking', description: 'Stage presence, vocal projection, combating anxiety, and persuasive delivery.', proficiency: 'Advanced' },
      { name: 'Presentation Skills', description: 'Slide deck narrative flow, engaging intros, and handling audience Q&A.', proficiency: 'Advanced' },
      { name: 'Storytelling', description: 'Crafting compelling personal narratives, metaphors, and memorable takeaways.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Python', description: 'Python syntax, data types, functions, and standard libraries.', priority: 'High' },
      { name: 'Programming Fundamentals', description: 'Loops, conditionals, logic building, and problem-solving.', priority: 'High' }
    ],
    availability: { weekdays: false, weekends: true, mornings: false, evenings: true, customSchedule: 'Sat-Sun 5:00 PM - 9:00 PM IST' },
    languages: ['English', 'Kashmiri', 'Urdu', 'Hindi'],
    interests: ['Reading', 'Debates', 'Technology'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'interactive' },
    portfolio: [
      { title: 'Youth Debating Workshop Series', description: 'Conducted 6 workshops on structured parliamentary debating and persuasive rhetoric.', projectUrl: 'https://example.com/debating-club', skillsUsed: ['Public Speaking', 'Presentation Skills'], verified: true }
    ],
    timeCredits: 6,
    swapsCompleted: 1,
    xp: 165,
    level: 2,
    streak: { count: 3, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange', icon: 'zap', description: 'Completed first skill swap successfully' }
    ],
    membership: 'free'
  },
  {
    name: 'Lakshmi Prasad',
    email: 'lakshmi.prasad@example.com',
    location: 'Bhubaneswar, Odisha',
    bio: "Database and Backend Learner | Interested in reliable systems. I'm interested in database design, SQL, and building reliable applications. I can help beginners with relational database concepts, SQL queries, and normalization. I'm learning cloud fundamentals and deployment so I can understand how applications run beyond a local machine.",
    avatarBg: '047857',
    skillsOffered: [
      { name: 'SQL', description: 'DDL, DML, advanced joins, indexing, query optimization, and transactions.', proficiency: 'Advanced' },
      { name: 'DBMS Fundamentals', description: 'ACID properties, entity-relationship diagrams, foreign keys, and concurrency.', proficiency: 'Advanced' },
      { name: 'Database Normalization', description: '1NF, 2NF, 3NF, BCNF, removing redundancy, and ensuring integrity.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Cloud Fundamentals', description: 'Cloud concepts, compute instances, object storage, and basic IAM.', priority: 'High' },
      { name: 'Docker', description: 'Containerization, writing Dockerfiles, and multi-container environments.', priority: 'High' },
      { name: 'Deployment', description: 'Deploying backend services, managing port bindings, and env configs.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, mornings: true, evenings: true, customSchedule: 'Weekends 10:00 AM - 6:00 PM IST' },
    languages: ['English', 'Odia', 'Hindi'],
    interests: ['Technology', 'Quizzes', 'Reading'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'University Course Management Schema', description: 'Normalized relational schema with 18 tables, triggers, and optimized indexes.', projectUrl: 'https://github.com/example/course-dbms', skillsUsed: ['SQL', 'DBMS Fundamentals', 'Database Normalization'], verified: true }
    ],
    timeCredits: 5,
    swapsCompleted: 0,
    xp: 95,
    level: 1,
    streak: { count: 2, lastActive: new Date() },
    badges: [],
    membership: 'free'
  }
];

async function seedDatabase() {
  console.log('======================================================');
  console.log('🌱 STARTING SKILLZY DEMO INDIAN PROFILES SEEDER');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('Connected to active MongoDB database safely.');

    // 1. Check existing accounts
    const existingEmails = DEMO_USERS_DATA.map(u => u.email);
    const existingCount = await User.countDocuments({ email: { $in: existingEmails } });
    console.log(`Found ${existingCount} demo accounts already present.`);

    const userMap = new Map(); // email -> user document

    // 2. Insert or update the 20 profiles idempotently
    console.log('\n--- 1. Creating / Updating 20 Indian Demo Profiles ---');
    for (const userData of DEMO_USERS_DATA) {
      let user = await User.findOne({ email: userData.email });
      
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=${userData.avatarBg}&color=ffffff&size=256&bold=true`;

      if (!user) {
        user = new User({
          name: userData.name,
          email: userData.email,
          password: DEMO_PASSWORD, // Pre-save hook hashes with bcrypt automatically
          location: userData.location,
          profilePhoto: avatarUrl,
          bio: userData.bio,
          skillsOffered: userData.skillsOffered,
          skillsWanted: userData.skillsWanted,
          availability: userData.availability,
          isPublic: true,
          timeCredits: userData.timeCredits,
          swapsCompleted: userData.swapsCompleted,
          xp: userData.xp,
          level: userData.level,
          streak: userData.streak,
          badges: userData.badges,
          languages: userData.languages,
          learningPreferences: userData.learningPreferences,
          portfolio: userData.portfolio,
          membership: userData.membership,
          timezone: 'Asia/Kolkata',
          ratings: []
        });
        await user.save();
        console.log(`  ✓ Created user: ${user.name} (${user.email}) - [${user.location}]`);
      } else {
        // Update profile fields without changing password
        user.name = userData.name;
        user.location = userData.location;
        user.profilePhoto = avatarUrl;
        user.bio = userData.bio;
        user.skillsOffered = userData.skillsOffered;
        user.skillsWanted = userData.skillsWanted;
        user.availability = userData.availability;
        user.languages = userData.languages;
        user.learningPreferences = userData.learningPreferences;
        user.portfolio = userData.portfolio;
        user.membership = userData.membership;
        await user.save();
        console.log(`  ↻ Updated profile: ${user.name} (${user.email})`);
      }

      userMap.set(userData.email, user);
    }

    // 3. Populate Swaps, Reviews, Messages, and Transactions
    console.log('\n--- 2. Creating Realistic Exchange Swaps & Platform Activity ---');

    // Helper references
    const aarav = userMap.get('aarav.sharma@example.com');
    const priya = userMap.get('priya.nair@example.com');
    const rohan = userMap.get('rohan.verma@example.com');
    const ananya = userMap.get('ananya.iyer@example.com');
    const vikram = userMap.get('vikram.singh@example.com');
    const meera = userMap.get('meera.krishnan@example.com');
    const aditya = userMap.get('aditya.patel@example.com');
    const sneha = userMap.get('sneha.reddy@example.com');
    const arjun = userMap.get('arjun.das@example.com');
    const kavya = userMap.get('kavya.menon@example.com');
    const rahul = userMap.get('rahul.choudhary@example.com');
    const ishita = userMap.get('ishita.banerjee@example.com');
    const karthik = userMap.get('karthik.subramanian@example.com');
    const neha = userMap.get('neha.gupta@example.com');
    const sandeep = userMap.get('sandeep.kumar@example.com');
    const divya = userMap.get('divya.joshi@example.com');
    const nikhil = userMap.get('nikhil.rao@example.com');
    const pooja = userMap.get('pooja.shah@example.com');
    const farhan = userMap.get('farhan.ahmed@example.com');
    const lakshmi = userMap.get('lakshmi.prasad@example.com');

    const swapsToCreate = [
      // 1. COMPLETED: Aarav & Priya (React <-> UI/UX Design)
      {
        idKey: 'swap_aarav_priya',
        requester: aarav,
        recipient: priya,
        requestedSkill: { name: 'UI/UX Design', description: 'Design systems and wireframing in Figma' },
        offeredSkill: { name: 'React.js', description: 'React component lifecycle and hooks' },
        status: 'completed',
        duration: 2,
        message: "Hi Priya! I'd love to learn clean design system principles in Figma. In return, I can teach you React fundamentals!",
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Priya is an incredible mentor! She walked me through Figma auto-layout and design tokens so clearly. My web apps look 10x better now.",
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Aarav made React feel so approachable! The hands-on project approach helped me understand state and props immediately. Highly recommend exchanging with him!",
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: aarav, text: "Hey Priya, really excited for our exchange session this weekend!" },
          { sender: priya, text: "Hi Aarav! Looking forward to it. I have prepared a practical Figma project file for us to work on." },
          { sender: aarav, text: "Awesome! I will have a starter React project ready with components we can build together." },
          { sender: priya, text: "That was such a productive session! Thank you so much for breaking down React hooks." }
        ]
      },
      // 2. COMPLETED: Farhan & Sneha (Public Speaking <-> Python Basics)
      {
        idKey: 'swap_farhan_sneha',
        requester: farhan,
        recipient: sneha,
        requestedSkill: { name: 'Python Basics', description: 'Python data cleaning and syntax fundamentals' },
        offeredSkill: { name: 'Public Speaking', description: 'Overcoming stage anxiety and structuring speeches' },
        status: 'completed',
        duration: 1,
        message: "Hi Sneha! I'd love to learn Python basics for data automation. I can help you practice presentations and speech delivery in return!",
        scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Sneha is patient and very thorough with Python fundamentals. She gave great practical coding exercises.",
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Farhan gave me great actionable tips on vocal projection and slide deck transitions. My conference talk went great!",
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: farhan, text: "Hello Sneha, should we do a 1-hour session on Sunday afternoon?" },
          { sender: sneha, text: "Yes, Sunday 3 PM works perfectly for me. Let's cover Python loops and data cleaning first." },
          { sender: farhan, text: "Sounds great. After that, we'll do 30 minutes of speech rehearsal." }
        ]
      },
      // 3. COMPLETED: Ishita & Pooja (Video Editing <-> Photography Basics)
      {
        idKey: 'swap_ishita_pooja',
        requester: ishita,
        recipient: pooja,
        requestedSkill: { name: 'Photography Basics', description: 'Lighting techniques and exposure triangle' },
        offeredSkill: { name: 'Video Editing', description: 'Color correction and video pacing' },
        status: 'completed',
        duration: 2,
        message: "Hi Pooja! I want to improve my camera lighting and manual settings for filming. I can teach you video timeline editing in return!",
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Pooja explained natural lighting and manual ISO/aperture settings brilliantly. A fantastic creative exchange!",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Ishita showed me how to color grade and cut video on beat. Her workflow tips saved me hours of editing time.",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: ishita, text: "Hi Pooja, loved your Gujarat photo series! Excited to learn about your camera setup." },
          { sender: pooja, text: "Thank you Ishita! I have so much raw footage I've wanted to edit. Let's do this!" }
        ]
      },
      // 4. COMPLETED: Kavya & Neha (English Communication <-> Graphic Design)
      {
        idKey: 'swap_kavya_neha',
        requester: kavya,
        recipient: neha,
        requestedSkill: { name: 'Graphic Design', description: 'Poster design and visual hierarchy principles' },
        offeredSkill: { name: 'Conversational English', description: 'Professional communication and interview practice' },
        status: 'completed',
        duration: 1,
        message: "Hi Neha, I would love to learn layout design to create better educational posters. I can help with conversational fluency in return!",
        scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Neha is a wonderful designer and mentor. She gave me specific font pairing tips that immediately leveled up my worksheets.",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Kavya is very encouraging and helped me structure behavioral interview answers. Super valuable exchange!",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: kavya, text: "Hi Neha! Can't wait for our session on design hierarchy." },
          { sender: neha, text: "Hello Kavya! I'll share my screen and we can redesign a sample poster together." }
        ]
      },
      // 5. COMPLETED: Karthik & Ananya (Mathematics <-> Pandas)
      {
        idKey: 'swap_karthik_ananya',
        requester: karthik,
        recipient: ananya,
        requestedSkill: { name: 'Pandas', description: 'Dataframe manipulation and data wrangling' },
        offeredSkill: { name: 'Mathematics', description: 'Linear algebra and probability for data science' },
        status: 'completed',
        duration: 2,
        message: "Hi Ananya! I want to apply my linear algebra knowledge to real datasets using Pandas. I can help you with mathematics and matrix operations in return!",
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Ananya is an absolute pro at Pandas and data analysis. She showed me how to index and aggregate large datasets efficiently.",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Karthik made linear algebra matrices and eigenvectors so intuitive! It clarified so many ML concepts for me.",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: karthik, text: "Hello Ananya, thank you for accepting the exchange request." },
          { sender: ananya, text: "Hi Karthik! Looking forward to reviewing linear algebra fundamentals with you." }
        ]
      },
      // 6. ACCEPTED: Vikram & Aarav (Java <-> React)
      {
        idKey: 'swap_vikram_aarav',
        requester: vikram,
        recipient: aarav,
        requestedSkill: { name: 'React.js', description: 'React stateful architecture and component design' },
        offeredSkill: { name: 'Java', description: 'Core Java OOP and concurrent backend systems' },
        status: 'accepted',
        duration: 2,
        message: "Hi Aarav, I want to learn React single-page frontend development. In return, I can mentor you in Java OOP and backend architecture!",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        messages: [
          { sender: vikram, text: "Hi Aarav, glad we connected! When would you like to schedule our first session?" },
          { sender: aarav, text: "Hey Vikram! How about Thursday evening at 8 PM IST? We can start with React basics." },
          { sender: vikram, text: "Thursday 8 PM sounds great! See you in the virtual classroom." }
        ]
      },
      // 7. ACCEPTED: Divya & Ishita (Video Editing <-> Social Media Marketing)
      {
        idKey: 'swap_divya_ishita',
        requester: divya,
        recipient: ishita,
        requestedSkill: { name: 'Video Editing', description: 'Editing short-form video reels and pacing' },
        offeredSkill: { name: 'Social Media Marketing', description: 'Content planning and organic audience growth' },
        status: 'accepted',
        duration: 1,
        message: "Hi Ishita, I'd love to learn how you edit reels with such engaging rhythm. I can help you with social media marketing and SEO in exchange!",
        scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        messages: [
          { sender: divya, text: "Hi Ishita, really excited to learn video cutting techniques from you!" },
          { sender: ishita, text: "Hello Divya! I have a set of short clips we can practice with on Saturday." }
        ]
      },
      // 8. PENDING: Sandeep -> Aarav (JavaScript <-> C++)
      {
        idKey: 'swap_sandeep_aarav',
        requester: sandeep,
        recipient: aarav,
        requestedSkill: { name: 'JavaScript', description: 'Modern JavaScript and DOM manipulation' },
        offeredSkill: { name: 'C++', description: 'Problem-solving, pointers, and STL algorithms' },
        status: 'pending',
        duration: 2,
        message: "Hi Aarav, I saw your full-stack profile. I'm learning web development and would love to get your guidance on JavaScript. In return, I can help you with C++ algorithms and problem-solving!",
        messages: []
      },
      // 9. PENDING: Rohan -> Sneha (Data Cleaning <-> Python)
      {
        idKey: 'swap_rohan_sneha',
        requester: rohan,
        recipient: sneha,
        requestedSkill: { name: 'Data Cleaning', description: 'Practical data cleaning and outlier handling' },
        offeredSkill: { name: 'Python', description: 'Advanced Python scripting and automation' },
        status: 'pending',
        duration: 1,
        message: "Hi Sneha, I'm working on a machine learning project and need guidance on real-world data cleaning. I can share advanced Python automation tips in return!",
        messages: []
      },
      // 10. PENDING: Aditya -> Nikhil (Linux Basics <-> Android Development)
      {
        idKey: 'swap_aditya_nikhil',
        requester: aditya,
        recipient: nikhil,
        requestedSkill: { name: 'Linux Basics', description: 'Command-line tools, SSH, and server configuration' },
        offeredSkill: { name: 'Android Development', description: 'Android mobile app architecture in Kotlin' },
        status: 'pending',
        duration: 1,
        message: "Hey Nikhil! I'm learning how mobile APIs are deployed on Linux servers. I can help you build Android apps in exchange for Linux/Git guidance!",
        messages: []
      },
      // 11. REJECTED: Rahul -> Sandeep
      {
        idKey: 'swap_rahul_sandeep',
        requester: rahul,
        recipient: sandeep,
        requestedSkill: { name: 'C++', description: 'Competitive programming algorithms' },
        offeredSkill: { name: 'Linux Basics', description: 'Linux terminal and network basics' },
        status: 'rejected',
        duration: 1,
        message: "Hi Sandeep, wondering if you are free for a C++ exchange this month?",
        messages: []
      },
      // 12. CANCELLED: Lakshmi -> Meera
      {
        idKey: 'swap_lakshmi_meera',
        requester: lakshmi,
        recipient: meera,
        requestedSkill: { name: 'Digital Illustration', description: 'Digital drawing fundamentals' },
        offeredSkill: { name: 'SQL', description: 'Relational database design and queries' },
        status: 'cancelled',
        duration: 1,
        message: "Hi Meera, I was hoping to learn digital art, but my schedule changed so I will request again next month!",
        messages: []
      }
    ];

    let swapsCreatedCount = 0;
    let reviewsCreatedCount = 0;
    let messagesCreatedCount = 0;
    let notificationsCreatedCount = 0;

    for (const item of swapsToCreate) {
      if (!item.requester || !item.recipient) continue;

      // Check if swap already exists between these users for the same skill
      let swap = await Swap.findOne({
        requester: item.requester._id,
        recipient: item.recipient._id,
        'requestedSkill.name': item.requestedSkill.name
      });

      if (!swap) {
        swap = new Swap({
          requester: item.requester._id,
          recipient: item.recipient._id,
          requestedSkill: item.requestedSkill,
          offeredSkill: item.offeredSkill,
          status: item.status,
          duration: item.duration,
          message: item.message,
          scheduledDate: item.scheduledDate,
          completedDate: item.completedDate,
          requesterRating: item.requesterRating,
          recipientRating: item.recipientRating
        });
        await swap.save();
        swapsCreatedCount++;
        console.log(`  ✓ Swap created: [${item.status.toUpperCase()}] ${item.requester.name} ⇄ ${item.recipient.name} (${item.requestedSkill.name})`);
      }

      // If completed with reviews, ensure ratings are properly attached to user profiles
      if (item.status === 'completed') {
        // 1. Recipient receives review from requester
        if (item.requesterRating) {
          const alreadyReviewed = item.recipient.ratings.some(
            r => r.swap && r.swap.toString() === swap._id.toString() && r.reviewer.toString() === item.requester._id.toString()
          );
          if (!alreadyReviewed) {
            item.recipient.ratings.push({
              reviewer: item.requester._id,
              swap: swap._id,
              rating: item.requesterRating.rating,
              comment: item.requesterRating.comment,
              date: item.requesterRating.date,
              helpfulCount: 2,
              verified: true
            });
            await item.recipient.save();
            reviewsCreatedCount++;
          }
        }

        // 2. Requester receives review from recipient
        if (item.recipientRating) {
          const alreadyReviewed = item.requester.ratings.some(
            r => r.swap && r.swap.toString() === swap._id.toString() && r.reviewer.toString() === item.recipient._id.toString()
          );
          if (!alreadyReviewed) {
            item.requester.ratings.push({
              reviewer: item.recipient._id,
              swap: swap._id,
              rating: item.recipientRating.rating,
              comment: item.recipientRating.comment,
              date: item.recipientRating.date,
              helpfulCount: 1,
              verified: true
            });
            await item.requester.save();
            reviewsCreatedCount++;
          }
        }

        // 3. Transactions for completed swaps
        const existingTx = await Transaction.findOne({ swap: swap._id });
        if (!existingTx) {
          await Transaction.create([
            {
              user: item.requester._id,
              type: 'spent',
              credits: item.duration,
              reason: `Learned ${item.requestedSkill.name} from ${item.recipient.name}`,
              swap: swap._id,
              balanceAfter: item.requester.timeCredits
            },
            {
              user: item.recipient._id,
              type: 'earned',
              credits: item.duration,
              reason: `Taught ${item.requestedSkill.name} to ${item.requester.name}`,
              swap: swap._id,
              balanceAfter: item.recipient.timeCredits
            }
          ]);
        }
      }

      // Create conversation messages for eligible swaps (accepted & completed)
      if (item.messages && item.messages.length > 0) {
        const existingMsgCount = await Message.countDocuments({ swap: swap._id });
        if (existingMsgCount === 0) {
          for (const msg of item.messages) {
            const recipientId = msg.sender._id.toString() === item.requester._id.toString() 
              ? item.recipient._id 
              : item.requester._id;

            await Message.create({
              swap: swap._id,
              sender: msg.sender._id,
              recipient: recipientId,
              text: msg.text,
              read: true
            });
            messagesCreatedCount++;
          }
        }
      }

      // Generate realistic notifications for participants
      const existingNotifs = await Notification.countDocuments({ swap: swap._id });
      if (existingNotifs === 0) {
        if (item.status === 'pending') {
          await Notification.create({
            user: item.recipient._id,
            sender: item.requester._id,
            type: 'swap_request',
            title: 'New Skill Swap Request',
            message: `${item.requester.name} requested to learn "${item.requestedSkill.name}" and teach "${item.offeredSkill.name}".`,
            link: `/swaps/${swap._id}`,
            swap: swap._id,
            read: false
          });
          notificationsCreatedCount++;
        } else if (item.status === 'accepted') {
          await Notification.create({
            user: item.requester._id,
            sender: item.recipient._id,
            type: 'swap_accepted',
            title: 'Swap Request Accepted! 🎉',
            message: `${item.recipient.name} accepted your exchange for "${item.requestedSkill.name}".`,
            link: `/swaps/${swap._id}`,
            swap: swap._id,
            read: true
          });
          notificationsCreatedCount++;
        } else if (item.status === 'completed') {
          await Notification.create({
            user: item.recipient._id,
            sender: item.requester._id,
            type: 'swap_completed',
            title: 'Exchange Completed & Credits Earned',
            message: `Your exchange with ${item.requester.name} is complete. ${item.duration} time credit(s) transferred!`,
            link: `/swaps/${swap._id}`,
            swap: swap._id,
            read: true
          });
          notificationsCreatedCount++;
        }
      }

      // If accepted, also create an active classroom Session record
      if (item.status === 'accepted') {
        const existingSession = await Session.findOne({ swapId: swap._id });
        if (!existingSession) {
          await Session.create({
            swapId: swap._id,
            organizer: item.recipient._id,
            participant: item.requester._id,
            skillTopic: item.requestedSkill.name,
            scheduledAt: item.scheduledDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            durationMinutes: item.duration * 60,
            status: 'scheduled',
            roomId: `skillzy-room-${swap._id.toString().slice(-8)}`,
            attendance: { organizerJoined: false, participantJoined: false }
          });
          console.log(`  ✓ Classroom session scheduled: ${item.requestedSkill.name} [Room: skillzy-room-${swap._id.toString().slice(-8)}]`);
        }
      }
    }

    // 4. Communities and Collaborative Discussions
    console.log('\n--- 3. Creating Active Skill Communities & Discussion Threads ---');
    const demoCommunities = [
      {
        name: 'Full-Stack Developers India',
        slug: 'fullstack-developers-india',
        description: 'A collaborative circle for React, Node.js, Python, and cloud developers exchanging architectural patterns and debugging tips.',
        category: 'Technology',
        founder: aarav,
        members: [aarav, vikram, aditya, nikhil, sandeep],
        discussions: [
          {
            author: aarav,
            title: 'Best practices for managing async API state in React 18',
            content: 'When coordinating multiple async REST calls in React, what patterns do you find cleanest? Let us share tips on custom hooks and optimistic UI updates.',
            tags: ['React', 'JavaScript', 'Frontend']
          },
          {
            author: vikram,
            title: 'Transitioning from monolithic Java OOP to microservices',
            content: 'Discussing database-per-service principles and clean domain boundary isolation.',
            tags: ['Java', 'Architecture', 'Backend']
          }
        ]
      },
      {
        name: 'Designers & Visual Creators Hub',
        slug: 'designers-visual-creators-hub',
        description: 'For UI/UX designers, illustrators, video editors, and brand artists sharing design systems and creative workflows.',
        category: 'Design & Creative',
        founder: priya,
        members: [priya, meera, neha, ishita, pooja],
        discussions: [
          {
            author: priya,
            title: 'How do you structure design tokens in Figma for developer handoff?',
            content: 'Sharing our standard naming conventions for color variables, spacing scales, and typography styles to keep React components consistent.',
            tags: ['Figma', 'UI/UX', 'Design Systems']
          },
          {
            author: neha,
            title: 'Expressive Typography in Poster Design',
            content: 'Tips on font pairings and kerning adjustments for digital social media banners.',
            tags: ['Typography', 'Branding', 'Graphic Design']
          }
        ]
      },
      {
        name: 'Data Science & Machine Learning Circle',
        slug: 'data-science-ai-circle',
        description: 'Exploratory data analysis, SQL query optimization, statistical models, and Python machine learning discussions.',
        category: 'Data & AI',
        founder: ananya,
        members: [ananya, rohan, sneha, karthik, lakshmi],
        discussions: [
          {
            author: ananya,
            title: 'Window functions vs self-joins in SQL analytics queries',
            content: 'A breakdown of performance differences when computing running totals and percentile rankings on large datasets.',
            tags: ['SQL', 'Data Analytics', 'Optimization']
          },
          {
            author: karthik,
            title: 'Linear Algebra intuition for Machine Learning weights',
            content: 'Visualizing dot products and hyperplane projections in high-dimensional feature spaces.',
            tags: ['Mathematics', 'Machine Learning', 'Linear Algebra']
          }
        ]
      }
    ];

    let communitiesCount = 0;
    for (const commData of demoCommunities) {
      let comm = await Community.findOne({ slug: commData.slug });
      if (!comm) {
        comm = new Community({
          name: commData.name,
          slug: commData.slug,
          description: commData.description,
          category: commData.category,
          founder: commData.founder._id,
          members: commData.members.map((m, idx) => ({
            user: m._id,
            role: idx === 0 ? 'admin' : 'member',
            joinedAt: new Date(Date.now() - (idx + 1) * 24 * 60 * 60 * 1000)
          })),
          discussions: commData.discussions.map(d => ({
            author: d.author._id,
            title: d.title,
            content: d.content,
            tags: d.tags,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            comments: []
          }))
        });
        await comm.save();
        communitiesCount++;
        console.log(`  ✓ Created Community: "${comm.name}" with ${comm.discussions.length} discussion threads`);
      }
    }

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(`• Profiles Created/Verified: 20 Indian Users`);
    console.log(`• Total Unique Skills Populated: ~60+ across Technology, Design, Data, Creative, and Communication`);
    console.log(`• Swaps Created: ${swapsCreatedCount} (Pending, Accepted, Completed, Rejected, Cancelled)`);
    console.log(`• Verified Reviews Attached: ${reviewsCreatedCount}`);
    console.log(`• Direct Conversation Messages: ${messagesCreatedCount}`);
    console.log(`• Activity Notifications: ${notificationsCreatedCount}`);
    console.log(`• Communities Active: ${communitiesCount}`);
    console.log(`\n🔑 DEMO LOGIN CREDENTIALS:`);
    console.log(`• Standard Demo Password: ${DEMO_PASSWORD}`);
    console.log(`• Example 1 (Full-Stack Dev): aarav.sharma@example.com`);
    console.log(`• Example 2 (UI/UX Designer): priya.nair@example.com`);
    console.log(`• Example 3 (Data Analyst):   ananya.iyer@example.com`);
    console.log(`• Example 4 (ML Learner):     sneha.reddy@example.com`);
    console.log(`• Example 5 (Video Editor):   ishita.banerjee@example.com`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
