/**
 * Skillzy 2.0 - Realistic Indian Skill-Sharing Community Seeder
 * 
 * Safely and idempotently populates Skillzy with:
 * - 25 new realistic Indian demo users (bringing total demo community to 45)
 * - Authentic profile photos for all 45 demo users (/images/demo-users/)
 * - 15 realistic topic-based Clubs & Communities with active discussions and events
 * - Consistent XP, levels, learning streaks, and badges
 * - Reciprocal skill swaps with authentic review and rating records
 * - Direct messaging exchanges, notifications, and classroom sessions
 * 
 * SAFEGUARDS:
 * - Never drops collections
 * - Never deletes or alters real user accounts (only @example.com demo users)
 * - Completely idempotent and safe to re-run
 * 
 * Run with: node scripts/seed-indian-community.js
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
const Event = require('../models/Event');

const DEMO_PASSWORD = 'SkillzyDemo@2026';

// 25 NEW FICTIONAL INDIAN USERS SPECIFICATION
const NEW_25_DEMO_USERS = [
  {
    slug: 'dev-malhotra',
    name: 'Dev Malhotra',
    email: 'dev.malhotra@example.com',
    location: 'New Delhi, Delhi',
    photo: '/images/demo-users/dev-malhotra.jpg', // AI Photo
    bio: "Full-Stack Engineer & Open Source Contributor | Delhi Technological University alum. I love building high-performance web applications with React, Next.js, and Node.js. Always eager to help beginners with JavaScript architecture, asynchronous patterns, and Git workflows. Looking to dive deep into Rust and systems programming.",
    skillsOffered: [
      { name: 'Web Development', description: 'Modern full-stack web development with React, Node.js, and TypeScript.', proficiency: 'Expert' },
      { name: 'Open Source', description: 'Git collaborative workflows, PR reviews, documentation, and OSS maintenance.', proficiency: 'Advanced' },
      { name: 'React.js', description: 'Custom hooks, state machines, context patterns, and performance tuning.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Rust', description: 'Systems programming, ownership model, memory safety, and Cargo tooling.', priority: 'High' },
      { name: 'UI/UX Design', description: 'Modern design tokens, typography, and accessibility best practices.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: false, customSchedule: 'Mon-Fri 7:30 PM - 10:30 PM IST' },
    languages: ['English', 'Hindi', 'Punjabi'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'OpenHub CLI', description: 'Command-line tool for managing OSS contribution tasks and issues.', projectUrl: 'https://github.com/example/openhub-cli', skillsUsed: ['Node.js', 'Open Source', 'CLI'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 3,
    xp: 450,
    level: 3,
    streak: { count: 8, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'consistent_mentor', name: 'Consistent Mentor', icon: 'shield', description: 'Completed 3 exchanges as the teaching mentor.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'aditi-kulkarni',
    name: 'Aditi Kulkarni',
    email: 'aditi.kulkarni@example.com',
    location: 'Pune, Maharashtra',
    photo: '/images/demo-users/aditi-kulkarni.jpg', // AI Photo
    bio: "UI/UX Product Designer & Design Club Lead | Crafting clean, intuitive, accessible digital experiences. Passionate about design systems, micro-interactions, and Figma component architecture. I enjoy mentoring engineers in visual hierarchy and user research.",
    skillsOffered: [
      { name: 'UI/UX Design', description: 'End-to-end product design, wireframing, high-fidelity prototypes, and user flows.', proficiency: 'Expert' },
      { name: 'Figma', description: 'Design tokens, auto-layout 5.0, responsive components, and design system governance.', proficiency: 'Expert' },
      { name: 'User Research', description: 'User interviews, usability testing, heuristic evaluation, and persona mapping.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'React Basics', description: 'Understanding component hierarchy and connecting design systems to JSX props.', priority: 'High' },
      { name: 'Web Development', description: 'HTML semantic structure and Tailwind CSS styling.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Sat-Sun 10:00 AM - 6:00 PM IST' },
    languages: ['English', 'Marathi', 'Hindi'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'visual' },
    portfolio: [
      { title: 'Aura UI Kit', description: 'Open-source Figma design system containing 200+ accessible components.', projectUrl: 'https://figma.com/@example/auraui', skillsUsed: ['UI/UX Design', 'Figma'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 3,
    xp: 410,
    level: 3,
    streak: { count: 12, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'free'
  },
  {
    slug: 'kabir-khan',
    name: 'Kabir Khan',
    email: 'kabir.khan@example.com',
    location: 'Hyderabad, Telangana',
    photo: '/images/demo-users/kabir-khan.jpg', // AI Photo
    bio: "AI & Robotics Engineer | Exploring autonomous systems, ROS 2, computer vision, and deep learning. I build robotics navigation pipelines and enjoy breaking down complex mathematical algorithms into practical Python code.",
    skillsOffered: [
      { name: 'Artificial Intelligence', description: 'Neural networks, PyTorch, computer vision, and convolutional architectures.', proficiency: 'Advanced' },
      { name: 'Robotics', description: 'ROS 2 nodes, robot kinematic models, sensor fusion, and Gazebo simulation.', proficiency: 'Advanced' },
      { name: 'Python', description: 'NumPy, OpenCV, scientific computing, and algorithm optimization.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Embedded Systems', description: 'Microcontroller programming, I2C/SPI protocols, and real-time C++.', priority: 'High' },
      { name: 'Cloud Computing', description: 'AWS infrastructure for distributed ML model training.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Tue-Fri 8:00 PM - 10:30 PM IST' },
    languages: ['English', 'Hindi', 'Telugu', 'Urdu'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'RoverVision SLAM', description: 'ROS 2 visual SLAM package for indoor mobile robot navigation using stereo cameras.', projectUrl: 'https://github.com/example/rover-vision', skillsUsed: ['Robotics', 'Python', 'Artificial Intelligence'], verified: true }
    ],
    timeCredits: 10,
    swapsCompleted: 2,
    xp: 320,
    level: 2,
    streak: { count: 6, lastActive: new Date() },
    badges: [
      { id: 'knowledge_explorer', name: 'Knowledge Explorer', icon: 'compass', description: 'Expanded catalogue with 3+ skills.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'riya-chatterjee',
    name: 'Riya Chatterjee',
    email: 'riya.chatterjee@example.com',
    location: 'Kolkata, West Bengal',
    photo: '/images/demo-users/riya-chatterjee.jpg', // AI Photo
    bio: "Applied Psychology Graduate & Communication Mentor | Helping students and professionals develop active listening, emotional intelligence, and confident interpersonal speaking. Passionate about cognitive health and productive collaboration.",
    skillsOffered: [
      { name: 'Psychology', description: 'Cognitive behavioral basics, mental wellness habits, and stress management techniques.', proficiency: 'Advanced' },
      { name: 'Communication', description: 'Active listening, non-violent communication, empathy workshops, and conflict resolution.', proficiency: 'Expert' },
      { name: 'Public Speaking', description: 'Vocal modulation, overcoming stage anxiety, and speech delivery structuring.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Data Science', description: 'Statistical analysis and data visualization with Python/R for behavioral studies.', priority: 'High' },
      { name: 'Content Writing', description: 'Writing engaging research essays and digital publications.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: true, customSchedule: 'Flexible schedule with 24h notice' },
    languages: ['English', 'Bengali', 'Hindi'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'interactive' },
    portfolio: [
      { title: 'MindfulDialogue Workshop', description: 'Facilitated communication circles for 100+ university students.', projectUrl: 'https://example.com/mindful-dialogue', skillsUsed: ['Psychology', 'Communication'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 2,
    xp: 290,
    level: 2,
    streak: { count: 5, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'manav-joshi',
    name: 'Manav Joshi',
    email: 'manav.joshi@example.com',
    location: 'Ahmedabad, Gujarat',
    photo: '/images/demo-users/manav-joshi.jpg', // AI Photo
    bio: "Game Developer & Unity Enthusiast | Creating indie games with engaging physics and intuitive mechanics. I teach C# game programming, Unity 2D/3D development, and level design. Currently learning 3D asset modeling in Blender.",
    skillsOffered: [
      { name: 'Game Development', description: 'Game loops, physics systems, player controllers, and gameplay mechanics.', proficiency: 'Advanced' },
      { name: 'Unity', description: 'Unity 3D engine, C# scripting, Animator state machines, and particle systems.', proficiency: 'Advanced' },
      { name: 'C#', description: 'Object-oriented programming, design patterns, and event-driven architecture.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: '3D Modeling', description: 'Blender 3D low-poly asset creation, UV unwrapping, and rigging.', priority: 'High' },
      { name: 'Sound Design', description: 'Creating interactive game audio and Foley sound effects.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Sat-Sun 11:00 AM - 7:00 PM IST' },
    languages: ['English', 'Gujarati', 'Hindi'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'ChronoQuest 2D', description: 'Time-manipulation puzzle platformer game made in Unity and published on itch.io.', projectUrl: 'https://itch.io/example/chronoquest', skillsUsed: ['Unity', 'Game Development', 'C#'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 1,
    xp: 190,
    level: 2,
    streak: { count: 4, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'free'
  },
  {
    slug: 'zara-sheikh',
    name: 'Zara Sheikh',
    email: 'zara.sheikh@example.com',
    location: 'Lucknow, Uttar Pradesh',
    photo: '/images/demo-users/zara-sheikh.jpg', // AI Photo
    bio: "Content Strategist, Essayist & Creative Writer | Turning complex ideas into compelling stories. I help creators, founders, and students master storytelling, newsletter growth, article editing, and prose rhythm.",
    skillsOffered: [
      { name: 'Content Writing', description: 'Long-form editorial essays, storytelling frameworks, tone-of-voice, and copy editing.', proficiency: 'Expert' },
      { name: 'Literature', description: 'Literary criticism, narrative structure, creative prose, and character development.', proficiency: 'Advanced' },
      { name: 'Creative Writing', description: 'Poetry, flash fiction, narrative hooks, and publication submissions.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Video Editing', description: 'Basic video cutting and captioning for short-form video essays.', priority: 'High' },
      { name: 'SEO Content', description: 'Keyword research and organic search optimization strategies.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: true, customSchedule: 'Mon-Thu 10:00 AM - 1:00 PM IST' },
    languages: ['English', 'Hindi', 'Urdu'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'reading' },
    portfolio: [
      { title: 'The Lucknow Gazette Substack', description: 'Weekly literary and cultural publication with over 3,000 active subscribers.', projectUrl: 'https://substack.com/@example/lucknowgazette', skillsUsed: ['Content Writing', 'Creative Writing'], verified: true }
    ],
    timeCredits: 11,
    swapsCompleted: 4,
    xp: 620,
    level: 3,
    streak: { count: 18, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'yash-thakur',
    name: 'Yash Thakur',
    email: 'yash.thakur@example.com',
    location: 'Chandigarh, Punjab',
    photo: '/images/demo-users/yash-thakur.jpg', // AI Photo
    bio: "Athlete, Strength & Conditioning Coach & Student Leader | Passionate about fitness science, habit building, team leadership, and sports psychology. Helping individuals build sustainable training routines and lead collaborative groups effectively.",
    skillsOffered: [
      { name: 'Sports & Fitness', description: 'Strength training biomechanics, calisthenics, functional mobility, and workout planning.', proficiency: 'Expert' },
      { name: 'Leadership', description: 'Team captaincy, conflict de-escalation, motivational speaking, and organizing sports tournaments.', proficiency: 'Advanced' },
      { name: 'Basketball', description: 'Court vision, shooting mechanics, defensive footwork, and scrimmage tactics.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Nutrition', description: 'Sports macronutrient planning and clean recovery meal prep.', priority: 'High' },
      { name: 'Public Speaking', description: 'Polishing keynotes for youth sports leadership summits.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: true, customSchedule: 'Mon-Sat 6:00 AM - 8:30 AM & 7:00 PM - 9:00 PM IST' },
    languages: ['English', 'Hindi', 'Punjabi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'University 10k Run Program', description: 'Trained a cohort of 45 first-time runners to complete their first 10K race.', projectUrl: 'https://example.com/10k-program', skillsUsed: ['Sports & Fitness', 'Leadership'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 340,
    level: 2,
    streak: { count: 15, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'simran-kaur',
    name: 'Simran Kaur',
    email: 'simran.kaur@example.com',
    location: 'Amritsar, Punjab',
    photo: '/images/demo-users/simran-kaur.jpg', // AI Photo
    bio: "Law Student, Parliamentary Debater & Public Speaking Coach | National moot court finalist. I specialize in critical argumentation, legal research methods, structured rebuttal, and persuasive communication.",
    skillsOffered: [
      { name: 'Law & Debate', description: 'Parliamentary debate rules, formal argumentation, logic fallacies, and case framing.', proficiency: 'Expert' },
      { name: 'Public Speaking', description: 'Stage presence, audience persuasion, storytelling hooks, and voice projection.', proficiency: 'Expert' },
      { name: 'Legal Research', description: 'Statutory interpretation, case law citations, and moot court memorial drafting.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Cyber Law', description: 'Data privacy regulations (DPDP Act, GDPR) and technology compliance.', priority: 'High' },
      { name: 'Negotiation', description: 'Principled dispute negotiation and mediation frameworks.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Wed-Fri 6:00 PM - 9:00 PM IST' },
    languages: ['English', 'Punjabi', 'Hindi'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'interactive' },
    portfolio: [
      { title: 'National Moot Court Winner Memorial', description: 'Lead researcher and oralist for championship winning constitutional law memorial.', projectUrl: 'https://example.com/moot-memorial', skillsUsed: ['Law & Debate', 'Public Speaking'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 3,
    xp: 490,
    level: 3,
    streak: { count: 9, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'siddharth-jain',
    name: 'Siddharth Jain',
    email: 'siddharth.jain@example.com',
    location: 'Bengaluru, Karnataka',
    photo: '/images/demo-users/siddharth-jain.jpg', // AI Photo
    bio: "Product Manager & Startup Builder | Scaling B2B and consumer products in Bengaluru. I teach user interview techniques, PRD drafting, roadmap prioritization frameworks (RICE), and agile sprint rituals.",
    skillsOffered: [
      { name: 'Product Management', description: 'Product roadmapping, PRD writing, metric tracking (AARRR), and feature prioritization.', proficiency: 'Expert' },
      { name: 'Startups', description: 'Pitch decks, business model canvases, user validation tests, and MVP launches.', proficiency: 'Advanced' },
      { name: 'Agile & Scrum', description: 'Sprint planning, backlog grooming, retrospective facilitation, and Jira workflows.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'SQL Analytics', description: 'Complex SQL queries, cohort retention analysis, and funnels.', priority: 'High' },
      { name: 'Web Development', description: 'Understanding modern frontend tech stacks to improve dev handoff.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Sat-Sun 10:00 AM - 4:00 PM IST' },
    languages: ['English', 'Hindi', 'Kannada'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Launchpad PRD Framework', description: 'Comprehensive product requirement template used by 50+ early-stage founder teams.', projectUrl: 'https://notion.so/example/launchpad-prd', skillsUsed: ['Product Management', 'Startups'], verified: true }
    ],
    timeCredits: 10,
    swapsCompleted: 2,
    xp: 380,
    level: 2,
    streak: { count: 7, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'diya-kapoor',
    name: 'Diya Kapoor',
    email: 'diya.kapoor@example.com',
    location: 'New Delhi, Delhi',
    photo: '/images/demo-users/diya-kapoor.jpg', // AI Photo
    bio: "Data Scientist & Academic Researcher | Passionate about statistical modeling, exploratory data analysis, and predictive machine learning. I love showing learners how to clean messiest real-world datasets using Pandas and visualize insights clearly.",
    skillsOffered: [
      { name: 'Data Science', description: 'Exploratory data analysis, statistical tests, feature engineering, and Pandas wrangling.', proficiency: 'Expert' },
      { name: 'Research', description: 'Literature reviews, empirical hypothesis testing, and academic paper drafting.', proficiency: 'Advanced' },
      { name: 'Python', description: 'Data science stack: Pandas, NumPy, Matplotlib, Seaborn, and Scikit-Learn.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Deep Learning', description: 'PyTorch neural networks and computer vision model fine-tuning.', priority: 'High' },
      { name: 'Cloud Computing', description: 'Deploying machine learning endpoints on AWS or GCP.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Mon, Wed, Fri 7:00 PM - 9:30 PM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Urban Air Quality Predictor', description: 'Time-series forecasting model predicting AQI in Delhi-NCR with 88% accuracy.', projectUrl: 'https://github.com/example/delhi-aqi-forecast', skillsUsed: ['Data Science', 'Python', 'Research'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 3,
    xp: 430,
    level: 3,
    streak: { count: 11, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'free'
  },
  {
    slug: 'rudra-pratap-singh',
    name: 'Rudra Pratap Singh',
    email: 'rudra.pratap@example.com',
    location: 'Jaipur, Rajasthan',
    photo: '/images/demo-users/rudra-pratap-singh.jpg', // AI Photo
    bio: "Travel Photographer, Storyteller & Heritage Documenter | Capturing colors, architecture, and untold stories across India. I teach manual camera exposure, natural lighting, composition rules, and Adobe Lightroom color grading.",
    skillsOffered: [
      { name: 'Photography', description: 'Manual camera settings, exposure triangle, portraiture lighting, and framing rules.', proficiency: 'Expert' },
      { name: 'Travel', description: 'Itinerary planning, solo travel safety, budget backpacking, and cultural exploration.', proficiency: 'Advanced' },
      { name: 'Photo Editing', description: 'Adobe Lightroom RAW processing, split toning, and custom preset creation.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Video Editing', description: 'Color grading video footage in DaVinci Resolve.', priority: 'High' },
      { name: 'Content Writing', description: 'Writing travel guides and narrative photo essays.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: true, customSchedule: 'Varies with travel; message to schedule' },
    languages: ['English', 'Hindi', 'Rajasthani'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'visual' },
    portfolio: [
      { title: 'Colors of Marwar Photo Series', description: 'Documentary visual exhibition featured in national heritage travel publications.', projectUrl: 'https://behance.net/example/colors-of-marwar', skillsUsed: ['Photography', 'Photo Editing', 'Travel'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 2,
    xp: 310,
    level: 2,
    streak: { count: 14, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'pragya-tiwari',
    name: 'Pragya Tiwari',
    email: 'pragya.tiwari@example.com',
    location: 'Rishikesh, Uttarakhand',
    photo: '/images/demo-users/pragya-tiwari.svg',
    bio: "Certified Yoga Practitioner & Holistic Wellness Coach | Practicing and teaching traditional Hatha yoga, breathwork (Pranayama), mindful meditation, and ergonomics for students and remote engineers.",
    skillsOffered: [
      { name: 'Health & Wellness', description: 'Daily wellness habits, sleep hygiene, stress reduction, and posture correction.', proficiency: 'Expert' },
      { name: 'Yoga', description: 'Hatha yoga asanas, Pranayama breath control, and guided mindfulness meditation.', proficiency: 'Expert' },
      { name: 'Mindfulness', description: 'Body scan meditation, mental focus exercises, and mindful workspace setups.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Digital Marketing', description: 'Building an online community and newsletter for yoga wellness.', priority: 'High' },
      { name: 'Web Development', description: 'Basic website setup to publish wellness guides and workshop schedules.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, mornings: true, evenings: false, customSchedule: 'Mon-Sun 6:00 AM - 10:00 AM IST' },
    languages: ['English', 'Hindi', 'Sanskrit'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Yoga for Desk Workers Guide', description: 'Illustrated 15-minute desk stretch and mobility routine downloaded by 5,000+ people.', projectUrl: 'https://example.com/desk-yoga-guide', skillsUsed: ['Yoga', 'Health & Wellness'], verified: true }
    ],
    timeCredits: 10,
    swapsCompleted: 3,
    xp: 440,
    level: 3,
    streak: { count: 21, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'free'
  },
  {
    slug: 'harsh-vardhan',
    name: 'Harsh Vardhan',
    email: 'harsh.vardhan@example.com',
    location: 'Mumbai, Maharashtra',
    photo: '/images/demo-users/harsh-vardhan.svg',
    bio: "Investment Analyst & Finance Mentor | CFA Level II candidate. I love helping founders and students understand financial statements, DCF valuations, unit economics, and personal investment fundamentals.",
    skillsOffered: [
      { name: 'Finance', description: 'Financial statement analysis (P&L, Balance Sheet, Cash Flow), DCF, and ratio analysis.', proficiency: 'Expert' },
      { name: 'Entrepreneurship', description: 'Unit economics, startup fundraising basics, term sheets, and investor decks.', proficiency: 'Advanced' },
      { name: 'Financial Modeling', description: 'Building 3-statement financial models and scenario analysis in Microsoft Excel.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Python', description: 'Automating financial data extraction and algorithmic portfolio rebalancing.', priority: 'High' },
      { name: 'SQL', description: 'Querying relational databases for market datasets.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Weekends 10:00 AM - 5:00 PM IST' },
    languages: ['English', 'Hindi', 'Gujarati'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'SaaS Financial Model Template', description: 'Standard financial forecasting workbook adopted by early-stage incubator cohorts.', projectUrl: 'https://example.com/saas-finmodel', skillsUsed: ['Finance', 'Financial Modeling'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 330,
    level: 2,
    streak: { count: 6, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'tanya-bose',
    name: 'Tanya Bose',
    email: 'tanya.bose@example.com',
    location: 'Kolkata, West Bengal',
    photo: '/images/demo-users/tanya-bose.jpg', // AI Photo
    bio: "Embedded Systems & IoT Hardware Engineer | Jadavpur University graduate. I design IoT smart connected devices using ESP32, Arduino, and MQTT. Happy to guide learners in sensor interfacing, hardware breadboarding, and firmware.",
    skillsOffered: [
      { name: 'IoT', description: 'ESP32, ESP8266, MQTT protocol, HTTP client, and cloud IoT dashboard integration.', proficiency: 'Expert' },
      { name: 'Embedded Systems', description: 'Microcontroller architecture, GPIO, I2C, SPI, timers, and embedded C/C++.', proficiency: 'Advanced' },
      { name: 'Circuit Design', description: 'Schematic capture, breadboard prototyping, sensor power management, and soldering.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Cloud Computing', description: 'AWS IoT Core and serverless event-driven architecture.', priority: 'High' },
      { name: 'Mobile App Development', description: 'Building Flutter mobile companion apps to control IoT devices over BLE.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Mon-Thu 7:00 PM - 9:30 PM IST' },
    languages: ['English', 'Bengali', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'SmartGreen Greenhouse Node', description: 'Low-power solar ESP32 environmental monitor transmitting soil and humidity telemetry.', projectUrl: 'https://github.com/example/smartgreen-iot', skillsUsed: ['IoT', 'Embedded Systems'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 2,
    xp: 360,
    level: 2,
    streak: { count: 7, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'reyansh-mittal',
    name: 'Reyansh Mittal',
    email: 'reyansh.mittal@example.com',
    location: 'Noida, Uttar Pradesh',
    photo: '/images/demo-users/reyansh-mittal.jpg', // AI Photo
    bio: "DevOps & Cloud Infrastructure Architect | Building automated CI/CD pipelines, Docker containerized microservices, and reliable cloud deployments. Mentoring developers on cloud security, Linux sysadmin, and GitHub Actions.",
    skillsOffered: [
      { name: 'Cloud Computing', description: 'AWS core services (EC2, S3, RDS, Lambda, VPC, IAM), architecture, and pricing.', proficiency: 'Expert' },
      { name: 'DevOps', description: 'Docker containerization, CI/CD with GitHub Actions, Linux administration, and Nginx.', proficiency: 'Expert' },
      { name: 'Linux', description: 'Bash scripting, process monitoring, permissions, SSH hardening, and systemd services.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Kubernetes', description: 'Cluster setup, Helm charts, ingress controllers, and auto-scaling pods.', priority: 'High' },
      { name: 'Cybersecurity', description: 'Penetration testing and cloud infrastructure security auditing.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: false, customSchedule: 'Weekdays 8:00 PM - 10:00 PM IST, Sat 2:00 PM - 6:00 PM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'ZeroDowntime Deploy Pipeline', description: 'Production-ready reusable GitHub Actions workflow for zero-downtime containerized apps.', projectUrl: 'https://github.com/example/zerodowntime-ci', skillsUsed: ['Cloud Computing', 'DevOps', 'Linux'], verified: true }
    ],
    timeCredits: 11,
    swapsCompleted: 4,
    xp: 680,
    level: 3,
    streak: { count: 24, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'five_swaps', name: 'Five Star Swapper', icon: 'award', description: 'Completed 5 verified skill exchanges on Skillzy.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'meera-deshpande',
    name: 'Meera Deshpande',
    email: 'meera.deshpande@example.com',
    location: 'Pune, Maharashtra',
    photo: '/images/demo-users/meera-deshpande.svg',
    bio: "Hindustani Classical Vocalist & Performing Arts Mentor | Disciple of Gwalior Gharana. Teaching classical voice culture, raga structures, swara pitch accuracy, and Indian musical aesthetics to learners of all levels.",
    skillsOffered: [
      { name: 'Music', description: 'Hindustani classical vocal, raga development (Yaman, Bhairav, Kafi), and riyaaz techniques.', proficiency: 'Expert' },
      { name: 'Performing Arts', description: 'Stage presence, acoustic mic technique, concert performance pacing, and riyaaz routines.', proficiency: 'Advanced' },
      { name: 'Harmonium', description: 'Basic chord accompaniment, swara accompaniment, and playing vocal scales.', proficiency: 'Intermediate' }
    ],
    skillsWanted: [
      { name: 'Audio Production', description: 'Recording vocals and mixing in Ableton Live or Logic Pro.', priority: 'High' },
      { name: 'Video Editing', description: 'Editing multi-track acoustic music cover videos for YouTube.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Weekends 9:00 AM - 1:00 PM IST' },
    languages: ['English', 'Marathi', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'interactive' },
    portfolio: [
      { title: 'Raga Heritage Project', description: 'Recorded and documented traditional bandishes of seasonal Indian morning ragas.', projectUrl: 'https://youtube.com/@example/raga-heritage', skillsUsed: ['Music', 'Performing Arts'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 310,
    level: 2,
    streak: { count: 10, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'nikhil-yadav',
    name: 'Nikhil Yadav',
    email: 'nikhil.yadav@example.com',
    location: 'Gurugram, Haryana',
    photo: '/images/demo-users/nikhil-yadav.svg',
    bio: "Varsity Basketball Player & Athletic Conditioning Trainer | Passionate about jumping mechanics, agility footwork, functional bodyweight calisthenics, and building athletic resilience.",
    skillsOffered: [
      { name: 'Fitness', description: 'High-intensity interval training, functional calisthenics, core stability, and cardio endurance.', proficiency: 'Expert' },
      { name: 'Basketball', description: 'Ball handling drills, defensive positioning, triple threat stance, and game IQ.', proficiency: 'Expert' },
      { name: 'Habit Coaching', description: 'Building unbreakable workout habits, morning routines, and self-discipline.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Sports Nutrition', description: 'Calculated macros for athletic performance and recovery.', priority: 'High' },
      { name: 'Video Editing', description: 'Editing dynamic basketball mixtape clips for Instagram Reels.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, mornings: true, evenings: false, customSchedule: 'Daily 6:30 AM - 9:30 AM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: '6-Week Vertical Jump Conditioning', description: 'Guided 30 university athletes through plyometric drills, increasing average vertical by 3 inches.', projectUrl: 'https://example.com/vertical-program', skillsUsed: ['Fitness', 'Basketball'], verified: true }
    ],
    timeCredits: 7,
    swapsCompleted: 1,
    xp: 210,
    level: 2,
    streak: { count: 13, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'free'
  },
  {
    slug: 'pooja-agarwal',
    name: 'Pooja Agarwal',
    email: 'pooja.agarwal@example.com',
    location: 'Bengaluru, Karnataka',
    photo: '/images/demo-users/pooja-agarwal.svg',
    bio: "Machine Learning Researcher & NLP Enthusiast | IISc research fellow. Specializing in natural language processing, transformer architectures (BERT, LLMs), and empirical research methodologies.",
    skillsOffered: [
      { name: 'Machine Learning', description: 'Supervised/unsupervised learning algorithms, cross-validation, loss functions, and scikit-learn.', proficiency: 'Expert' },
      { name: 'Research', description: 'Reading scientific papers, reproducibility studies, writing LaTeX papers, and benchmarking.', proficiency: 'Expert' },
      { name: 'Python', description: 'PyTorch tensor manipulation, custom training loops, and Hugging Face Transformers.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'Cloud Computing', description: 'Managing GPU clusters on AWS EC2 and Kubernetes for distributed model training.', priority: 'High' },
      { name: 'UI/UX Design', description: 'Designing interactive web demos with Streamlit or Gradio.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Mon-Thu 8:00 PM - 10:00 PM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'theoretical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Indic-BERT Sentiment Benchmark', description: 'Open-source benchmark evaluating multilingual transformer models on Indian regional languages.', projectUrl: 'https://github.com/example/indic-sentiment', skillsUsed: ['Machine Learning', 'Research', 'Python'], verified: true }
    ],
    timeCredits: 10,
    swapsCompleted: 3,
    xp: 520,
    level: 3,
    streak: { count: 16, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'arjun-reddy',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@example.com',
    location: 'Hyderabad, Telangana',
    photo: '/images/demo-users/arjun-reddy.svg',
    bio: "Cybersecurity Analyst & Linux Security Specialist | OSCP certified. Passionate about ethical hacking, defensive server hardening, network traffic packet analysis, and OWASP Top 10 vulnerabilities.",
    skillsOffered: [
      { name: 'Cybersecurity', description: 'Vulnerability assessment, ethical hacking concepts, OWASP Top 10, and security audits.', proficiency: 'Expert' },
      { name: 'Linux', description: 'Hardening Ubuntu/Debian, SSH key management, iptables firewalls, and auditd logging.', proficiency: 'Expert' },
      { name: 'Networking', description: 'TCP/IP protocol suite, Wireshark packet dissection, DNS, and proxy configurations.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Cloud Computing', description: 'Cloud security architecture and AWS IAM least-privilege configurations.', priority: 'High' },
      { name: 'Python', description: 'Building automated penetration testing scripts with Scapy and Requests.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Weekends 11:00 AM - 6:00 PM IST' },
    languages: ['English', 'Telugu', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'SecHardener Script', description: 'Automated bash hardening script for production Linux VPS servers.', projectUrl: 'https://github.com/example/sechardener', skillsUsed: ['Cybersecurity', 'Linux'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 2,
    xp: 390,
    level: 2,
    streak: { count: 8, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'sanika-deshmukh',
    name: 'Sanika Deshmukh',
    email: 'sanika.deshmukh@example.com',
    location: 'Mumbai, Maharashtra',
    photo: '/images/demo-users/sanika-deshmukh.svg',
    bio: "Fashion Designer & Creative Visual Artist | NIFT Mumbai graduate. Passionate about sustainable textile crafts, apparel illustration, moodboarding, color harmony, and creative direction.",
    skillsOffered: [
      { name: 'Fashion & Creative Arts', description: 'Apparel sketching, fabric draping, textile identification, and sustainable styling.', proficiency: 'Expert' },
      { name: 'Illustration', description: 'Digital fashion illustration, moodboard curation, and concept rendering.', proficiency: 'Advanced' },
      { name: 'Color Theory', description: 'Harmonic color palettes, psychological color impact, and seasonal trend forecasting.', proficiency: 'Expert' }
    ],
    skillsWanted: [
      { name: 'UI/UX Design', description: 'Digital product design tools (Figma) to build an online sustainable clothing showroom.', priority: 'High' },
      { name: 'Photography', description: 'Studio portrait lighting for editorial fashion lookbooks.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: true, customSchedule: 'Mon-Wed 11:00 AM - 3:00 PM IST' },
    languages: ['English', 'Marathi', 'Hindi'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'visual' },
    portfolio: [
      { title: 'Upcycled Maratha Khadi Collection', description: 'Sustainable clothing line featured in Mumbai eco-fashion showcase.', projectUrl: 'https://behance.net/example/khadi-collection', skillsUsed: ['Fashion & Creative Arts', 'Illustration'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 300,
    level: 2,
    streak: { count: 5, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'free'
  },
  {
    slug: 'karan-malhotra',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@example.com',
    location: 'Mumbai, Maharashtra',
    photo: '/images/demo-users/karan-malhotra.svg',
    bio: "Video Editor & Digital Media Producer | Creating commercial videos, documentaries, and YouTube edits. I teach editing pacing, Premiere Pro timelines, DaVinci Resolve color grading, and dynamic audio design.",
    skillsOffered: [
      { name: 'Video Editing', description: 'Premiere Pro editing, video pacing, dynamic cuts, multi-cam sync, and timeline organization.', proficiency: 'Expert' },
      { name: 'Digital Media', description: 'YouTube channel optimization, thumbnail design principles, and digital content distribution.', proficiency: 'Advanced' },
      { name: 'Color Grading', description: 'DaVinci Resolve node workflow, color correction, LUTs, and skin tone balance.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: '3D Animation', description: 'Blender 3D camera animations and motion graphics for video intros.', priority: 'High' },
      { name: 'Sound Design', description: 'Synthesizing original SFX and mastering audio tracks.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: false, customSchedule: 'Daily 7:00 PM - 11:00 PM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Mumbai By Night Short Doc', description: 'Cinematic mini-documentary with 250k+ views on YouTube.', projectUrl: 'https://youtube.com/watch?v=example', skillsUsed: ['Video Editing', 'Color Grading'], verified: true }
    ],
    timeCredits: 10,
    swapsCompleted: 3,
    xp: 470,
    level: 3,
    streak: { count: 14, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'premium'
  },
  {
    slug: 'neha-saxena',
    name: 'Neha Saxena',
    email: 'neha.saxena@example.com',
    location: 'Indore, Madhya Pradesh',
    photo: '/images/demo-users/neha-saxena.svg',
    bio: "E-Cell President & Youth Entrepreneurship Mentor | Leading campus incubation programs. I coach early founders on customer discovery, business model canvases, pitch deck narrative, and early sales outreach.",
    skillsOffered: [
      { name: 'Entrepreneurship', description: 'Validating startup concepts, customer discovery interviews, and zero-capital MVP launches.', proficiency: 'Expert' },
      { name: 'E-Cell Leadership', description: 'Organizing campus hackathons, managing incubator cohorts, and corporate sponsor outreach.', proficiency: 'Expert' },
      { name: 'Pitching & Pitch Decks', description: 'Structuring 10-slide investor decks, storytelling, and stage Q&A preparation.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Web Development', description: 'Building landing pages with Webflow or React to test market demand.', priority: 'High' },
      { name: 'Finance', description: 'Understanding financial unit economics and cap tables.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: true, customSchedule: 'Mon, Wed, Sat 4:00 PM - 7:00 PM IST' },
    languages: ['English', 'Hindi'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Indore Student Startup Conclave', description: 'Organized flagship startup summit hosting 400+ founders and 15 venture funds.', projectUrl: 'https://example.com/indore-conclave', skillsUsed: ['Entrepreneurship', 'E-Cell Leadership'], verified: true }
    ],
    timeCredits: 9,
    swapsCompleted: 2,
    xp: 380,
    level: 2,
    streak: { count: 8, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'vishal-sinha',
    name: 'Vishal Sinha',
    email: 'vishal.sinha@example.com',
    location: 'Patna, Bihar',
    photo: '/images/demo-users/vishal-sinha.svg',
    bio: "Cross-Platform Mobile App Developer | Building fluid mobile experiences using Flutter and Dart. I can mentor you in state management (Bloc/Provider), responsive UI for Android & iOS, and Firebase integrations.",
    skillsOffered: [
      { name: 'Mobile App Development', description: 'Cross-platform app development with Flutter & Dart for iOS and Android.', proficiency: 'Expert' },
      { name: 'Flutter', description: 'Custom widgets, Bloc state architecture, animations, and clean code patterns.', proficiency: 'Expert' },
      { name: 'Firebase', description: 'Cloud Firestore, Firebase Authentication, Cloud Functions, and push notifications.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'UI/UX Design', description: 'Mobile interface micro-interactions and Figma design handoff.', priority: 'High' },
      { name: 'Backend Development', description: 'Writing Node.js Express APIs to replace Firebase dependencies.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: false, evenings: true, mornings: false, customSchedule: 'Mon-Fri 8:00 PM - 10:30 PM IST' },
    languages: ['English', 'Hindi', 'Bhojpuri'],
    learningPreferences: { teachingStyle: 'project-based', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'HabitTracker Flutter App', description: 'Minimalist habit tracking mobile app with 15k+ Play Store downloads.', projectUrl: 'https://play.google.com/store/apps/details?id=example.habittracker', skillsUsed: ['Mobile App Development', 'Flutter'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 350,
    level: 2,
    streak: { count: 7, lastActive: new Date() },
    badges: [
      { id: 'first_skill', name: 'First Skill Shared', icon: 'sparkles', description: 'Added first teaching skill to profile.' }
    ],
    membership: 'free'
  },
  {
    slug: 'ishita-mukherjee',
    name: 'Ishita Mukherjee',
    email: 'ishita.mukherjee@example.com',
    location: 'Kolkata, West Bengal',
    photo: '/images/demo-users/ishita-mukherjee.svg',
    bio: "Classical Music Practitioner & Cultural Club Convener | Trained in Rabindra Sangeet and Indian semi-classical music. Teaching vocal resonance, pronunciation, and traditional rhythmic cycles (Taals).",
    skillsOffered: [
      { name: 'Classical Music', description: 'Rabindra Sangeet vocal expressions, breath phrasing, and semi-classical melodies.', proficiency: 'Expert' },
      { name: 'Cultural Club', description: 'Organizing university cultural fests, dramatic readings, and performing arts soirees.', proficiency: 'Advanced' },
      { name: 'Vocal Training', description: 'Vocal warmups, range expansion, and pitch stabilization exercises.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Graphic Design', description: 'Designing event promotional posters and social media banners for cultural fests.', priority: 'High' },
      { name: 'Audio Production', description: 'Basic sound mixing and clean acoustic vocal mastering.', priority: 'Medium' }
    ],
    availability: { weekdays: false, weekends: true, evenings: true, mornings: true, customSchedule: 'Weekends 10:00 AM - 4:00 PM IST' },
    languages: ['English', 'Bengali', 'Hindi'],
    learningPreferences: { teachingStyle: 'practical', learningStyle: 'interactive' },
    portfolio: [
      { title: 'Rabindra Sandhya Gala', description: 'Directed a musical ensemble celebrating Tagore compositions at Rabindra Sadan.', projectUrl: 'https://example.com/rabindra-sandhya', skillsUsed: ['Classical Music', 'Cultural Club'], verified: true }
    ],
    timeCredits: 8,
    swapsCompleted: 2,
    xp: 320,
    level: 2,
    streak: { count: 9, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' }
    ],
    membership: 'free'
  },
  {
    slug: 'farhan-qureshi',
    name: 'Farhan Qureshi',
    email: 'farhan.qureshi@example.com',
    location: 'Bhopal, Madhya Pradesh',
    photo: '/images/demo-users/farhan-qureshi.svg',
    bio: "Social Impact Organizer & Community Volunteer Lead | Mobilizing student volunteers for grassroots education, digital literacy, and environmental cleanups across Madhya Pradesh. Guiding leaders on volunteer retention and non-profit projects.",
    skillsOffered: [
      { name: 'Social Impact', description: 'Community needs assessment, organizing volunteer drives, and social project execution.', proficiency: 'Expert' },
      { name: 'Community Volunteering', description: 'Volunteer recruitment, onboarding, engagement rituals, and impact metrics.', proficiency: 'Expert' },
      { name: 'Mentorship', description: 'Guiding underprivileged high-school students on digital skills and career pathways.', proficiency: 'Advanced' }
    ],
    skillsWanted: [
      { name: 'Web Development', description: 'Setting up a community website to accept volunteer registrations.', priority: 'High' },
      { name: 'Data Science', description: 'Visualizing survey metrics and educational impact data.', priority: 'Medium' }
    ],
    availability: { weekdays: true, weekends: true, evenings: true, mornings: true, customSchedule: 'Tue, Thu, Sat 3:00 PM - 7:00 PM IST' },
    languages: ['English', 'Hindi', 'Urdu'],
    learningPreferences: { teachingStyle: 'conversational', learningStyle: 'hands-on' },
    portfolio: [
      { title: 'Shiksha Setu Digital Drive', description: 'Equipped 12 rural government schools with digital literacy learning corners.', projectUrl: 'https://example.com/shiksha-setu', skillsUsed: ['Social Impact', 'Community Volunteering'], verified: true }
    ],
    timeCredits: 11,
    swapsCompleted: 3,
    xp: 490,
    level: 3,
    streak: { count: 17, lastActive: new Date() },
    badges: [
      { id: 'first_swap', name: 'First Exchange Completed', icon: 'repeat', description: 'Completed first verified peer skill swap.' },
      { id: 'community_helper', name: 'Community Champion', icon: 'star', description: 'Received a 5-star review from a learning partner.' }
    ],
    membership: 'premium'
  }
];

// 15 TOPIC-BASED CLUBS SPECIFICATION
const COMMUNITIES_SPEC = [
  {
    name: 'Web Developers Club',
    slug: 'web-developers-club',
    category: 'Engineering & Tech',
    description: 'A vibrant community of frontend, backend, and full-stack developers exchanging architectural patterns, debugging tricks, modern React patterns, and web standards.',
    founderSlug: 'dev-malhotra',
    memberSlugs: ['dev-malhotra', 'aarav-sharma', 'aditi-kulkarni', 'vikram-singh', 'reyansh-mittal', 'vishal-sinha', 'sandeep-kumar'],
    rules: [
      'Share clean code snippets with context and explanations.',
      'Be encouraging and constructive when providing PR and architecture feedback.',
      'No unsolicited promotional spam or low-effort links.'
    ],
    discussions: [
      {
        authorSlug: 'dev-malhotra',
        title: 'Modern React 18 & Next.js Server Components: Best Practices',
        content: 'When architecting larger full-stack apps, how do you balance Server Components with interactive Client Components? Let us share real-world examples and state management patterns.',
        replies: [
          { authorSlug: 'aarav-sharma', content: 'We keep leaf nodes interactive with "use client" and push data fetching up to server components. It slashed our initial bundle size by 35%!' },
          { authorSlug: 'aditi-kulkarni', content: 'From a design perspective, skeleton loaders during server component streaming give users a much smoother perception of performance.' }
        ]
      },
      {
        authorSlug: 'reyansh-mittal',
        title: 'Deploying Node.js Express APIs with Zero-Downtime Docker containers',
        content: 'Here is a simple blueprint for using Docker Compose with Nginx reverse proxy healthchecks to achieve zero-downtime rolling updates.',
        replies: [
          { authorSlug: 'dev-malhotra', content: 'Great breakdown Reyansh! Adding graceful SIGTERM shutdowns in Express handles ongoing in-flight requests perfectly.' }
        ]
      }
    ],
    event: {
      title: 'Hands-on Workshop: Building Scalable REST & GraphQL APIs in Node.js',
      description: 'Interactive session covering API security, request validation, middleware composition, and database connection pooling.',
      skillTopic: 'Web Development',
      durationMinutes: 90,
      maxAttendees: 60,
      daysFromNow: 3,
      hostSlug: 'dev-malhotra'
    }
  },
  {
    name: 'AI and Machine Learning Club',
    slug: 'ai-and-machine-learning-club',
    category: 'Data & AI',
    description: 'Exploring machine learning theory, PyTorch pipelines, LLM fine-tuning, computer vision, and autonomous robotics algorithms.',
    founderSlug: 'kabir-khan',
    memberSlugs: ['kabir-khan', 'pooja-agarwal', 'diya-kapoor', 'rohan-verma', 'ananya-iyer', 'sneha-reddy'],
    rules: [
      'Cite research papers and open-source models accurately.',
      'Provide dataset context when discussing model performance metrics.'
    ],
    discussions: [
      {
        authorSlug: 'pooja-agarwal',
        title: 'Evaluating Transformer Attention Heads: Tips and Visualizations',
        content: 'Visualizing attention weights in multi-head transformers can reveal syntactic and semantic alignments. What visualization tools do you use for debugging PyTorch models?',
        replies: [
          { authorSlug: 'kabir-khan', content: 'BertViz and Weights & Biases work great for this! You can inspect individual layer activations interactively.' }
        ]
      }
    ],
    event: {
      title: 'Computer Vision with OpenCV & PyTorch: Object Detection Masterclass',
      description: 'Step-by-step walkthrough of building a real-time object detection and tracking pipeline from scratch.',
      skillTopic: 'Artificial Intelligence',
      durationMinutes: 75,
      maxAttendees: 50,
      daysFromNow: 5,
      hostSlug: 'kabir-khan'
    }
  },
  {
    name: 'UI/UX and Creative Design Club',
    slug: 'ui-ux-and-creative-design-club',
    category: 'Design & Creative',
    description: 'Designers, product artists, and visual creators collaborating on design systems, Figma tokens, accessibility (WCAG), and responsive UX.',
    founderSlug: 'aditi-kulkarni',
    memberSlugs: ['aditi-kulkarni', 'priya-nair', 'sanika-deshmukh', 'siddharth-jain', 'neha-gupta', 'pooja-shah'],
    rules: [
      'Constructive critique only. Celebrate creative iteration.',
      'Ensure designs shared consider accessibility and readability.'
    ],
    discussions: [
      {
        authorSlug: 'aditi-kulkarni',
        title: 'Design System Tokens: Naming Conventions that Developers Love',
        content: 'How do you structure semantic color tokens so developers can directly map them to Tailwind CSS variables? Here is the structure we use in our design team.',
        replies: [
          { authorSlug: 'priya-nair', content: 'Semantic naming (e.g., bg-brand-primary, text-brand-subtle) completely removes guesswork and sync bugs during handoff.' }
        ]
      }
    ],
    event: {
      title: 'Figma Auto-Layout 5.0 & Interactive Prototyping Workshop',
      description: 'Hands-on session building responsive cards, mobile menus, and interactive micro-animations in Figma.',
      skillTopic: 'UI/UX Design',
      durationMinutes: 60,
      maxAttendees: 45,
      daysFromNow: 4,
      hostSlug: 'aditi-kulkarni'
    }
  },
  {
    name: 'Competitive Programming Club',
    slug: 'competitive-programming-club',
    category: 'Engineering & Tech',
    description: 'Problem solving, dynamic programming, graph algorithms, and data structure speedruns for coding contests and technical interviews.',
    founderSlug: 'sandeep-kumar',
    memberSlugs: ['sandeep-kumar', 'dev-malhotra', 'karthik-subramanian', 'vikram-singh', 'manav-joshi'],
    rules: ['Explain time and space complexity with your solutions.'],
    discussions: [
      {
        authorSlug: 'sandeep-kumar',
        title: 'Mastering Disjoint Set Union (DSU) and Kruskal Algorithm',
        content: 'DSU with path compression and rank optimization runs in near O(1) time. Here is an intuitive walkthrough of connected component problems.',
        replies: [
          { authorSlug: 'karthik-subramanian', content: 'DSU is also super handy for detecting cycles in undirected graphs. Clean explanation Sandeep!' }
        ]
      }
    ],
    event: {
      title: 'Dynamic Programming Patterns: From Recursion to Memoization',
      description: 'Breakdown of standard DP patterns: 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication.',
      skillTopic: 'Data Structures',
      durationMinutes: 90,
      maxAttendees: 50,
      daysFromNow: 6,
      hostSlug: 'sandeep-kumar'
    }
  },
  {
    name: 'Open Source Community',
    slug: 'open-source-community',
    category: 'Engineering & Tech',
    description: 'Guiding developers to make meaningful open source contributions, maintain repositories, write helpful documentation, and collaborate on GitHub.',
    founderSlug: 'dev-malhotra',
    memberSlugs: ['dev-malhotra', 'aarav-sharma', 'reyansh-mittal', 'kabir-khan', 'aditi-kulkarni'],
    rules: ['Respect open source maintainers time and guidelines.'],
    discussions: [
      {
        authorSlug: 'dev-malhotra',
        title: 'How to write a pull request that maintainers want to merge immediately',
        content: 'Small scoped PRs, thorough issue links, automated test coverage, and a before/after screenshot make a maintainers job ten times easier.',
        replies: [
          { authorSlug: 'aarav-sharma', content: 'Also running linters locally before pushing avoids noisy commit histories!' }
        ]
      }
    ],
    event: {
      title: 'First Pull Request Workshop: Contributing to Open Source',
      description: 'Live interactive session where participants fork, clone, fix an issue, and submit their first verified open source PR.',
      skillTopic: 'Open Source',
      durationMinutes: 60,
      maxAttendees: 70,
      daysFromNow: 2,
      hostSlug: 'dev-malhotra'
    }
  },
  {
    name: 'Photography and Travel Club',
    slug: 'photography-and-travel-club',
    category: 'Arts & Media',
    description: 'Street photographers, documentary visual artists, and travel enthusiasts sharing framing rules, camera settings, lighting, and hidden Indian destinations.',
    founderSlug: 'rudra-pratap-singh',
    memberSlugs: ['rudra-pratap-singh', 'pooja-shah', 'karan-malhotra', 'ishita-banerjee', 'sanika-deshmukh'],
    rules: ['Share camera EXIF details (aperture, ISO, shutter speed) when seeking feedback on photos.'],
    discussions: [
      {
        authorSlug: 'rudra-pratap-singh',
        title: 'Mastering the Golden Hour: Natural Lighting in Rajasthan Architecture',
        content: 'When shooting sandstone and heritage monuments in Jaipur and Udaipur, the 45 minutes before sunset yield breathtaking warm tones. Here is my lens recommendation.',
        replies: [
          { authorSlug: 'pooja-shah', content: 'The dynamic range during golden hour is magical. Do you shoot with a circular polarizer to cut glare?' }
        ]
      }
    ],
    event: {
      title: 'Manual Photography & Lightroom Masterclass',
      description: 'Understanding manual shutter/aperture relationships and applying color grading curves in Adobe Lightroom.',
      skillTopic: 'Photography',
      durationMinutes: 60,
      maxAttendees: 40,
      daysFromNow: 7,
      hostSlug: 'rudra-pratap-singh'
    }
  },
  {
    name: 'Music and Performing Arts Club',
    slug: 'music-and-performing-arts-club',
    category: 'Arts & Media',
    description: 'Vocalists, instrumentalists, and performing artists sharing acoustic techniques, classical ragas, stage confidence, and music production.',
    founderSlug: 'meera-deshpande',
    memberSlugs: ['meera-deshpande', 'ishita-mukherjee', 'kavya-menon', 'karan-malhotra'],
    rules: ['Celebrate diverse musical traditions, folk arts, and classical forms.'],
    discussions: [
      {
        authorSlug: 'meera-deshpande',
        title: 'Riyaaz Routines: Building Vocal Breath Control and Swara Stability',
        content: 'A 20-minute daily Kharaj riyaaz in lower octave notes builds rock-solid pitch stability for classical and contemporary vocalists alike.',
        replies: [
          { authorSlug: 'ishita-mukherjee', content: 'Practicing with a steady tanpura drone also sharpens microtonal ear accuracy. Wonderful advice Meera!' }
        ]
      }
    ],
    event: {
      title: 'Indian Classical Vocal & Voice Culture Workshop',
      description: 'Interactive session exploring voice resonance, breath support, and beginner-friendly raga exploration.',
      skillTopic: 'Music',
      durationMinutes: 60,
      maxAttendees: 35,
      daysFromNow: 5,
      hostSlug: 'meera-deshpande'
    }
  },
  {
    name: 'Debate and Public Speaking Club',
    slug: 'debate-and-public-speaking-club',
    category: 'Humanities & Communication',
    description: 'Parliamentary debaters, moot court champions, and aspiring orators practicing speech persuasion, logical argumentation, and stage charisma.',
    founderSlug: 'simran-kaur',
    memberSlugs: ['simran-kaur', 'riya-chatterjee', 'farhan-ahmed', 'kavya-menon', 'yash-thakur'],
    rules: ['Critique the argument, not the person. Maintain respectful civil discourse.'],
    discussions: [
      {
        authorSlug: 'simran-kaur',
        title: 'Structuring 7-Minute Parliamentary Speeches: The PEEL Framework',
        content: 'Point, Explanation, Example, Link. Keeping your argumentation structured prevents rambling and makes your case memorable to adjudicators.',
        replies: [
          { authorSlug: 'riya-chatterjee', content: 'From a cognitive perspective, pausing for two seconds before delivering your key impact gives listeners time to absorb it.' }
        ]
      }
    ],
    event: {
      title: 'Overcoming Stage Anxiety: The Art of Persuasive Speaking',
      description: 'Practical drills for speech pacing, eye contact, body language, and impromptu speaking (extempore).',
      skillTopic: 'Public Speaking',
      durationMinutes: 75,
      maxAttendees: 50,
      daysFromNow: 4,
      hostSlug: 'simran-kaur'
    }
  },
  {
    name: 'Fitness and Wellness Club',
    slug: 'fitness-and-wellness-club',
    category: 'Health & Lifestyle',
    description: 'Empowering students and desk professionals with sustainable workouts, yoga, mobility drills, mindful nutrition, and healthy habit routines.',
    founderSlug: 'pragya-tiwari',
    memberSlugs: ['pragya-tiwari', 'yash-thakur', 'nikhil-yadav', 'divya-joshi', 'rahul-choudhary'],
    rules: ['Encourage mindful progress over extreme or dangerous fitness trends.'],
    discussions: [
      {
        authorSlug: 'pragya-tiwari',
        title: 'Preventing Desk Slump: 5 Spinal Mobility Stretches for Coders',
        content: 'Sitting in front of a laptop all day tightens hip flexors and rounds shoulders. Here are 5 daily stretches you can do right from your chair.',
        replies: [
          { authorSlug: 'yash-thakur', content: 'Doorway chest openers and seated thoracic twists make an immediate difference in posture and back relief!' }
        ]
      }
    ],
    event: {
      title: 'Mindful Morning Yoga & Breathwork for Mental Clarity',
      description: 'Gentle morning Hatha sequence and Pranayama breathwork to boost focus and reduce daily screen fatigue.',
      skillTopic: 'Health & Wellness',
      durationMinutes: 45,
      maxAttendees: 60,
      daysFromNow: 1,
      hostSlug: 'pragya-tiwari'
    }
  },
  {
    name: 'Entrepreneurship and Startup Cell',
    slug: 'entrepreneurship-and-startup-cell',
    category: 'Business & Startups',
    description: 'Founders, product builders, and startup enthusiasts sharing MVP strategies, customer interview learnings, pitch decks, and bootstrapping tactics.',
    founderSlug: 'siddharth-jain',
    memberSlugs: ['siddharth-jain', 'neha-saxena', 'harsh-vardhan', 'dev-malhotra', 'aditi-kulkarni'],
    rules: ['Share honest lessons from failures as well as successes.'],
    discussions: [
      {
        authorSlug: 'neha-saxena',
        title: 'Talking to Humans: The Mom Test for Early Customer Interviews',
        content: 'Never ask people if they would buy your idea. Ask them about the last time they faced the problem, how much they spent to fix it, and what they hated about current solutions.',
        replies: [
          { authorSlug: 'siddharth-jain', content: 'Crucial advice! Past behavior is 10x more predictive of product success than polite hypothetical promises.' }
        ]
      }
    ],
    event: {
      title: 'From Idea to First 100 Users: Lean Startup Playbook',
      description: 'Practical frameworks for validating problem-solution fit, designing no-code landing pages, and acquiring early adopters.',
      skillTopic: 'Entrepreneurship',
      durationMinutes: 60,
      maxAttendees: 80,
      daysFromNow: 6,
      hostSlug: 'siddharth-jain'
    }
  },
  {
    name: 'Cybersecurity Club',
    slug: 'cybersecurity-club',
    category: 'Engineering & Tech',
    description: 'Ethical hackers, security researchers, and systems enthusiasts discussing vulnerability research, CTF challenges, Linux hardening, and web app defense.',
    founderSlug: 'arjun-reddy',
    memberSlugs: ['arjun-reddy', 'nikhil-rao', 'reyansh-mittal', 'dev-malhotra'],
    rules: ['All discussions must adhere to legal, authorized, and ethical security standards.'],
    discussions: [
      {
        authorSlug: 'arjun-reddy',
        title: 'Preventing Broken Object Level Authorization (BOLA / IDOR) in REST APIs',
        content: 'BOLA remains the #1 API security vulnerability. Always verify that the authenticated user actually owns the record ID being updated or viewed.',
        replies: [
          { authorSlug: 'reyansh-mittal', content: 'Database query scoping (e.g. User.findOne({ _id: req.params.id, owner: req.user._id })) is the safest defense.' }
        ]
      }
    ],
    event: {
      title: 'Web Application Penetration Testing: OWASP Top 10 Breakdown',
      description: 'Demonstration of identifying and remediating SQL injection, XSS, and authorization bypass vulnerabilities in web apps.',
      skillTopic: 'Cybersecurity',
      durationMinutes: 75,
      maxAttendees: 50,
      daysFromNow: 4,
      hostSlug: 'arjun-reddy'
    }
  },
  {
    name: 'Research and Innovation Club',
    slug: 'research-and-innovation-club',
    category: 'Academia & Research',
    description: 'Connecting student researchers, data analysts, and scholars across disciplines to share literature review techniques, LaTeX, and academic methodologies.',
    founderSlug: 'diya-kapoor',
    memberSlugs: ['diya-kapoor', 'pooja-agarwal', 'riya-chatterjee', 'karthik-subramanian', 'divya-joshi'],
    rules: ['Encourage interdisciplinary collaboration and methodological rigor.'],
    discussions: [
      {
        authorSlug: 'diya-kapoor',
        title: 'Reproducible Science: Managing Research Code and Datasets on GitHub and Zenodo',
        content: 'Making research code reproducible with virtual environments and DOI-minted data repositories dramatically increases paper impact and citation rates.',
        replies: [
          { authorSlug: 'pooja-agarwal', content: 'Fixing random seeds and exporting exact requirements.txt or Docker images is essential for ML reproducibility.' }
        ]
      }
    ],
    event: {
      title: 'Writing and Publishing Your First Academic Research Paper',
      description: 'Guidance on structuring introduction, methodology, results, and navigating peer review in international journals.',
      skillTopic: 'Research',
      durationMinutes: 60,
      maxAttendees: 40,
      daysFromNow: 5,
      hostSlug: 'diya-kapoor'
    }
  },
  {
    name: 'Robotics and IoT Club',
    slug: 'robotics-and-iot-club',
    category: 'Hardware & Robotics',
    description: 'Hands-on makers, hardware hackers, and robotics engineers tinkering with microcontrollers, sensor arrays, autonomous rovers, and IoT telemetry.',
    founderSlug: 'tanya-bose',
    memberSlugs: ['tanya-bose', 'kabir-khan', 'reyansh-mittal', 'dev-malhotra'],
    rules: ['Share schematics and circuit diagrams when troubleshooting hardware issues.'],
    discussions: [
      {
        authorSlug: 'tanya-bose',
        title: 'Low-Power ESP32 Deep Sleep: Running Environmental Sensors for Months on Battery',
        content: 'By utilizing ESP32 deep-sleep modes and waking via ULP timer every 15 minutes, a standard 18650 Li-ion battery can power a weather node for over 9 months.',
        replies: [
          { authorSlug: 'kabir-khan', content: 'Turning off the WiFi and Bluetooth radio before sleep is the critical trick to cut quiescent current down to microamps!' }
        ]
      }
    ],
    event: {
      title: 'Hands-on IoT: Interfacing Sensors with ESP32 & Cloud Dashboards',
      description: 'Building an active IoT temperature and humidity monitor transmitting live telemetry over MQTT.',
      skillTopic: 'IoT',
      durationMinutes: 75,
      maxAttendees: 45,
      daysFromNow: 3,
      hostSlug: 'tanya-bose'
    }
  },
  {
    name: 'Literature and Content Creators Club',
    slug: 'literature-and-content-creators-club',
    category: 'Humanities & Communication',
    description: 'Writers, bloggers, essayists, and digital storytellers sharing prose refinement, newsletter strategies, editing habits, and book recommendations.',
    founderSlug: 'zara-sheikh',
    memberSlugs: ['zara-sheikh', 'kavya-menon', 'riya-chatterjee', 'simran-kaur'],
    rules: ['Constructive, thoughtful feedback on shared writing excerpts.'],
    discussions: [
      {
        authorSlug: 'zara-sheikh',
        title: 'The First 50 Words: Crafting Irresistible Narrative Openers',
        content: 'Readers decide whether to continue reading in the first few sentences. Plunging straight into action or a surprising contrast holds attention best.',
        replies: [
          { authorSlug: 'kavya-menon', content: 'Cutting preamble and throat-clearing sentences is the single fastest way to tighten an essay draft.' }
        ]
      }
    ],
    event: {
      title: 'Digital Storytelling & Essay Writing Masterclass',
      description: 'Interactive writing session analyzing narrative hooks, pacing, sentence variety, and publishing on digital platforms.',
      skillTopic: 'Content Writing',
      durationMinutes: 60,
      maxAttendees: 50,
      daysFromNow: 4,
      hostSlug: 'zara-sheikh'
    }
  },
  {
    name: 'Social Impact and Volunteering Club',
    slug: 'social-impact-and-volunteering-club',
    category: 'Social Impact',
    description: 'Student leaders and community organizers driving grassroots initiatives, youth education, digital literacy, and environmental sustainability campaigns.',
    founderSlug: 'farhan-qureshi',
    memberSlugs: ['farhan-qureshi', 'farhan-ahmed', 'divya-joshi', 'riya-chatterjee', 'pragya-tiwari'],
    rules: ['Keep all initiatives inclusive, transparent, and focused on genuine community service.'],
    discussions: [
      {
        authorSlug: 'farhan-qureshi',
        title: 'Organizing Effective Digital Literacy Camps in Rural Schools',
        content: 'Teaching interactive coding games with Scratch on low-cost tablets sparks incredible curiosity in students. Here is our weekend curriculum.',
        replies: [
          { authorSlug: 'divya-joshi', content: 'Interactive visual games make language barriers disappear. Inspiring work Farhan!' }
        ]
      }
    ],
    event: {
      title: 'Volunteer Leadership: Organizing Community Action Drives',
      description: 'Practical playbook for mobilizing volunteer teams, measuring social impact, and executing successful community campaigns.',
      skillTopic: 'Social Impact',
      durationMinutes: 60,
      maxAttendees: 60,
      daysFromNow: 5,
      hostSlug: 'farhan-qureshi'
    }
  }
];

// 20 EXISTING USERS PHOTO UPDATES
const EXISTING_20_SLUGS = [
  'aarav-sharma', 'priya-nair', 'rohan-verma', 'ananya-iyer', 'vikram-singh',
  'meera-krishnan', 'aditya-patel', 'sneha-reddy', 'arjun-das', 'kavya-menon',
  'rahul-choudhary', 'ishita-banerjee', 'karthik-subramanian', 'neha-gupta', 'sandeep-kumar',
  'divya-joshi', 'nikhil-rao', 'pooja-shah', 'farhan-ahmed', 'lakshmi-prasad'
];

async function seedIndianCommunity() {
  console.log('================================================================');
  console.log('🌟 SKILLZY - ENHANCING REALISTIC INDIAN SKILL COMMUNITY (45 USERS)');
  console.log('================================================================\n');

  try {
    await connectDB();
    console.log('✓ Connected to MongoDB Atlas safely.');

    const userMap = new Map(); // slug/email -> User document

    // Load existing users into memory
    const existingUsers = await User.find({});
    existingUsers.forEach(u => {
      userMap.set(u.email, u);
      const slug = u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      userMap.set(slug, u);
    });

    console.log(`\n--- 1. Updating 20 Existing Demo Profiles with Tailored Avatar Assets ---`);
    let existingUpdatedCount = 0;
    for (const slug of EXISTING_20_SLUGS) {
      const email = `${slug.replace('-', '.')}@example.com`;
      const user = userMap.get(email);
      if (user) {
        user.profilePhoto = `/images/demo-users/${slug}.svg`;
        await user.save();
        existingUpdatedCount++;
        console.log(`  ✓ Updated photo for existing demo user: ${user.name} -> /images/demo-users/${slug}.svg`);
      }
    }
    console.log(`Updated ${existingUpdatedCount} existing demo profiles with dedicated avatar assets.`);

    console.log(`\n--- 2. Seeding 25 New Realistic Indian Demo Users ---`);
    let newUsersCreated = 0;
    let newUsersUpdated = 0;

    for (const data of NEW_25_DEMO_USERS) {
      let user = userMap.get(data.email);

      if (!user) {
        user = new User({
          name: data.name,
          email: data.email,
          password: DEMO_PASSWORD, // Pre-save hook hashes with bcrypt automatically
          location: data.location,
          profilePhoto: data.photo,
          bio: data.bio,
          skillsOffered: data.skillsOffered,
          skillsWanted: data.skillsWanted,
          availability: data.availability,
          isPublic: true,
          timeCredits: data.timeCredits,
          swapsCompleted: data.swapsCompleted,
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          badges: data.badges,
          languages: data.languages,
          learningPreferences: data.learningPreferences,
          portfolio: data.portfolio,
          membership: data.membership,
          timezone: 'Asia/Kolkata',
          ratings: []
        });
        await user.save();
        newUsersCreated++;
        console.log(`  ✓ Created new demo user: ${user.name} (${user.email}) - [${user.location}]`);
      } else {
        user.name = data.name;
        user.location = data.location;
        user.profilePhoto = data.photo;
        user.bio = data.bio;
        user.skillsOffered = data.skillsOffered;
        user.skillsWanted = data.skillsWanted;
        user.availability = data.availability;
        user.languages = data.languages;
        user.learningPreferences = data.learningPreferences;
        user.portfolio = data.portfolio;
        user.membership = data.membership;
        user.xp = data.xp;
        user.level = data.level;
        user.streak = data.streak;
        user.badges = data.badges;
        await user.save();
        newUsersUpdated++;
        console.log(`  ↻ Updated demo user: ${user.name} (${user.email})`);
      }

      userMap.set(data.email, user);
      userMap.set(data.slug, user);
    }

    console.log(`Created: ${newUsersCreated}, Updated: ${newUsersUpdated} (Total: ${newUsersCreated + newUsersUpdated} of 25 new users processed)`);

    // Verify total demo users count
    const totalDemoCount = await User.countDocuments({ email: { $regex: /@example\.com$/i } });
    console.log(`\n🎉 Total Active Demo Users in Skillzy Community: ${totalDemoCount}`);

    console.log(`\n--- 3. Creating & Populating 15 Topic-Based Clubs & Communities ---`);
    let clubsCreated = 0;
    let clubsUpdated = 0;
    let eventsCreated = 0;

    for (const commSpec of COMMUNITIES_SPEC) {
      let community = await Community.findOne({ slug: commSpec.slug });
      const founder = userMap.get(commSpec.founderSlug);

      if (!founder) {
        console.warn(`  ⚠️ Founder ${commSpec.founderSlug} not found for club ${commSpec.name}`);
        continue;
      }

      // Build member array with valid user ObjectIds
      const members = [];
      const addedIds = new Set();
      
      // Founder is admin
      members.push({ user: founder._id, role: 'admin', joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
      addedIds.add(founder._id.toString());

      commSpec.memberSlugs.forEach((mSlug, idx) => {
        const u = userMap.get(mSlug);
        if (u && !addedIds.has(u._id.toString())) {
          members.push({
            user: u._id,
            role: idx === 1 ? 'moderator' : 'member',
            joinedAt: new Date(Date.now() - (20 - idx * 2) * 24 * 60 * 60 * 1000)
          });
          addedIds.add(u._id.toString());
        }
      });

      // Build discussions
      const discussions = (commSpec.discussions || []).map((d, dIdx) => {
        const author = userMap.get(d.authorSlug) || founder;
        const replies = (d.replies || []).map((r, rIdx) => {
          const rAuthor = userMap.get(r.authorSlug) || founder;
          return {
            author: rAuthor._id,
            content: r.content,
            createdAt: new Date(Date.now() - (5 - dIdx - rIdx) * 24 * 60 * 60 * 1000)
          };
        });

        return {
          author: author._id,
          title: d.title,
          content: d.content,
          createdAt: new Date(Date.now() - (7 - dIdx) * 24 * 60 * 60 * 1000),
          replies
        };
      });

      if (!community) {
        community = new Community({
          name: commSpec.name,
          slug: commSpec.slug,
          description: commSpec.description,
          category: commSpec.category,
          rules: commSpec.rules || [],
          founder: founder._id,
          members,
          discussions,
          isPrivate: false
        });
        await community.save();
        clubsCreated++;
        console.log(`  ✓ Created Club: ${community.name} [${community.category}] - ${members.length} members`);
      } else {
        community.description = commSpec.description;
        community.category = commSpec.category;
        community.rules = commSpec.rules || [];
        community.members = members;
        community.discussions = discussions;
        await community.save();
        clubsUpdated++;
        console.log(`  ↻ Updated Club: ${community.name} - ${members.length} members`);
      }

      // Schedule Event / Workshop if specified
      if (commSpec.event) {
        const existingEvent = await Event.findOne({ community: community._id, title: commSpec.event.title });
        const host = userMap.get(commSpec.event.hostSlug) || founder;

        const attendees = members.slice(0, 4).map(m => ({
          user: m.user,
          registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          attended: false
        }));

        if (!existingEvent) {
          await Event.create({
            community: community._id,
            host: host._id,
            title: commSpec.event.title,
            description: commSpec.event.description,
            skillTopic: commSpec.event.skillTopic,
            scheduledAt: new Date(Date.now() + commSpec.event.daysFromNow * 24 * 60 * 60 * 1000),
            durationMinutes: commSpec.event.durationMinutes,
            maxAttendees: commSpec.event.maxAttendees,
            attendees,
            roomId: `skillzy-workshop-${community.slug.slice(0, 12)}`,
            status: 'scheduled'
          });
          eventsCreated++;
          console.log(`    📅 Scheduled Workshop: "${commSpec.event.title}" [Room: skillzy-workshop-${community.slug.slice(0, 12)}]`);
        }
      }
    }

    console.log(`\n--- 4. Creating Reciprocal Exchanges, Authentic Reviews & Community Activity ---`);

    const dev = userMap.get('dev-malhotra');
    const aditi = userMap.get('aditi-kulkarni');
    const kabir = userMap.get('kabir-khan');
    const riya = userMap.get('riya-chatterjee');
    const tanya = userMap.get('tanya-bose');
    const reyansh = userMap.get('reyansh-mittal');
    const simran = userMap.get('simran-kaur');
    const siddharth = userMap.get('siddharth-jain');
    const diya = userMap.get('diya-kapoor');
    const rudra = userMap.get('rudra-pratap-singh');

    const newSwaps = [
      // 1. COMPLETED: Dev Malhotra <-> Aditi Kulkarni (React Web Dev <-> UI/UX Figma Design Tokens)
      {
        idKey: 'swap_dev_aditi',
        requester: dev,
        recipient: aditi,
        requestedSkill: { name: 'UI/UX Design', description: 'Design tokens and Figma auto-layout for component libraries' },
        offeredSkill: { name: 'Web Development', description: 'React component props architecture and state machines' },
        status: 'completed',
        duration: 2,
        message: "Hi Aditi! I'd love to learn how to structure Figma tokens cleanly for handoff. In return, I can help you connect your components to React props!",
        scheduledDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Aditi is a brilliant design mentor! Her walkthrough of design tokens and auto-layout completely revolutionized how I structure React component styles.",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Dev made React feel so intuitive! We paired live on building a component library directly from Figma designs. Best exchange I have had on Skillzy!",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: dev, text: "Hey Aditi! Super excited for our UI/UX and React exchange." },
          { sender: aditi, text: "Hi Dev! I have the design system file ready with auto-layout variables. See you at 7 PM IST!" },
          { sender: dev, text: "That session was incredible. The components look crisp and responsive." },
          { sender: aditi, text: "Thank you Dev! The React hooks breakdown made everything click." }
        ]
      },
      // 2. COMPLETED: Kabir Khan <-> Tanya Bose (AI Computer Vision <-> ESP32 Embedded Systems)
      {
        idKey: 'swap_kabir_tanya',
        requester: kabir,
        recipient: tanya,
        requestedSkill: { name: 'Embedded Systems', description: 'ESP32 serial telemetry and real-time microcontroller timers' },
        offeredSkill: { name: 'Artificial Intelligence', description: 'OpenCV edge detection and lightweight object tracking' },
        status: 'completed',
        duration: 2,
        message: "Hi Tanya, I want to deploy my vision model on an embedded device. Can you help me interface ESP32 hardware? I can teach you OpenCV in return!",
        scheduledDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Tanya is a hardware genius! She diagnosed my ESP32 power regulation issues immediately and walked me through clean embedded C code.",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Kabir is fantastic at explaining computer vision pipelines without confusing jargon. My camera sensor setup is working like a charm now!",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: kabir, text: "Hello Tanya! Excited to integrate our camera module with the ESP32." },
          { sender: tanya, text: "Hi Kabir! I have the pinout diagram and breadboard ready." }
        ]
      },
      // 3. COMPLETED: Simran Kaur <-> Riya Chatterjee (Debate & Public Speaking <-> Cognitive Psychology)
      {
        idKey: 'swap_simran_riya',
        requester: simran,
        recipient: riya,
        requestedSkill: { name: 'Psychology', description: 'Cognitive empathy and managing performance pressure under debate conditions' },
        offeredSkill: { name: 'Public Speaking', description: 'Vocal projection, cadence, and persuasive argumentation frameworks' },
        status: 'completed',
        duration: 1,
        message: "Hi Riya! I'd love to learn psychological grounding techniques for high-stakes moot courts. I can coach you on vocal projection and stage rhetoric in exchange!",
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        requesterRating: {
          rating: 5,
          comment: "Riya provided grounding and breath-regulation techniques that helped me immensely during my national debate finals. Highly recommended!",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        recipientRating: {
          rating: 5,
          comment: "Simran is a phenomenal speaker and coach! She completely transformed how I structure speech openers and project confidence.",
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        messages: [
          { sender: simran, text: "Hi Riya, so glad to connect on Skillzy!" },
          { sender: riya, text: "Hello Simran! Looking forward to sharing cognitive breathing exercises with you." }
        ]
      },
      // 4. ACCEPTED: Diya Kapoor <-> Reyansh Mittal (Data Science <-> Cloud Computing AWS)
      {
        idKey: 'swap_diya_reyansh',
        requester: diya,
        recipient: reyansh,
        requestedSkill: { name: 'Cloud Computing', description: 'Deploying serverless ML inference on AWS Lambda & S3' },
        offeredSkill: { name: 'Data Science', description: 'Exploratory data analysis and Scikit-Learn pipelines' },
        status: 'accepted',
        duration: 2,
        message: "Hi Reyansh! I want to host my air-quality prediction model on AWS. In exchange, I can teach you data wrangling and statistical tests in Python!",
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        messages: [
          { sender: diya, text: "Hi Reyansh! When is a good time for our AWS Lambda session?" },
          { sender: reyansh, text: "Hey Diya! Thursday 8 PM works great for me. Let us get your Python model containerized first." }
        ]
      },
      // 5. PENDING: Siddharth Jain -> Rudra Pratap Singh (Product Management <-> Travel Photography)
      {
        idKey: 'swap_siddharth_rudra',
        requester: siddharth,
        recipient: rudra,
        requestedSkill: { name: 'Photography', description: 'Composition and portrait framing for startup founder profiles' },
        offeredSkill: { name: 'Product Management', description: 'User persona research and MVP scoping for creative platforms' },
        status: 'pending',
        duration: 1,
        message: "Hi Rudra! Loved your Jaipur documentary series. I'd love to learn portrait framing rules. Happy to share startup product roadmapping frameworks in return!"
      }
    ];

    let swapsSeeded = 0;
    for (const item of newSwaps) {
      if (!item.requester || !item.recipient) continue;

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
        swapsSeeded++;
        console.log(`  ✓ Created Swap: ${item.requester.name} ⮂ ${item.recipient.name} [${item.status.toUpperCase()}]`);

        // If completed, add genuine ratings into both users' ratings arrays
        if (item.status === 'completed') {
          // Requester rates Recipient
          await User.findByIdAndUpdate(item.recipient._id, {
            $push: {
              ratings: {
                reviewer: item.requester._id,
                swap: swap._id,
                rating: item.requesterRating.rating,
                comment: item.requesterRating.comment,
                date: item.requesterRating.date,
                verified: true,
                verifiedSwapId: swap._id
              }
            }
          });

          // Recipient rates Requester
          await User.findByIdAndUpdate(item.requester._id, {
            $push: {
              ratings: {
                reviewer: item.recipient._id,
                swap: swap._id,
                rating: item.recipientRating.rating,
                comment: item.recipientRating.comment,
                date: item.recipientRating.date,
                verified: true,
                verifiedSwapId: swap._id
              }
            }
          });
        }

        // Create messages
        if (item.messages) {
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
          }
        }

        // Create Notifications
        if (item.status === 'completed') {
          await Notification.create({
            user: item.recipient._id,
            sender: item.requester._id,
            type: 'swap_completed',
            title: 'Exchange Completed & Credits Earned ⭐',
            message: `Your exchange with ${item.requester.name} for "${item.requestedSkill.name}" is complete!`,
            link: `/swaps/${swap._id}`,
            swap: swap._id,
            read: true
          });
        } else if (item.status === 'accepted') {
          await Notification.create({
            user: item.requester._id,
            sender: item.recipient._id,
            type: 'swap_accepted',
            title: 'Exchange Accepted! 🚀',
            message: `${item.recipient.name} accepted your exchange for "${item.requestedSkill.name}".`,
            link: `/swaps/${swap._id}`,
            swap: swap._id,
            read: false
          });

          // Schedule Classroom Session
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
        }
      }
    }

    console.log(`\n================================================================`);
    console.log('✅ SKILLZY INDIAN COMMUNITY SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`- New Demo Users Processed: 25`);
    console.log(`- Total Active Demo Users: ${totalDemoCount}`);
    console.log(`- Existing Demo Profiles Updated: ${existingUpdatedCount}`);
    console.log(`- Active Clubs/Communities: ${COMMUNITIES_SPEC.length}`);
    console.log(`- New Exchanges & Authentic Review Records Created: ${swapsSeeded}`);
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedIndianCommunity();
