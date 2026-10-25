/**
 * Skillzy 2.0 AI Matchmaker Service
 * Transparent, multi-factor scoring algorithm for skill exchange compatibility.
 */

const User = require('../models/User');

const PROFICIENCY_RANKS = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

const PRIORITY_MULTIPLIERS = {
  'low': 1.0,
  'medium': 1.25,
  'high': 1.5
};

/**
 * Calculates a comprehensive compatibility score (0-100) between two users
 * with explainable reasoning breakdown.
 */
function calculateCompatibility(currentUser, candidateUser) {
  let score = 0;
  const reasons = [];
  const complementaryTrades = [];

  const myOffered = currentUser.skillsOffered || [];
  const myWanted = currentUser.skillsWanted || [];
  const theirOffered = candidateUser.skillsOffered || [];
  const theirWanted = candidateUser.skillsWanted || [];

  // 1. Direct Complementary Skill Match Analysis (Weight: 45 pts max)
  let directMutualMatch = false;

  // Skills candidate can teach me (what they offer vs what I want)
  const skillsTheyCanTeachMe = [];
  theirOffered.forEach(candidateSkill => {
    const matchedWanted = myWanted.find(w => 
      w.name.trim().toLowerCase() === candidateSkill.name.trim().toLowerCase() ||
      candidateSkill.name.trim().toLowerCase().includes(w.name.trim().toLowerCase()) ||
      w.name.trim().toLowerCase().includes(candidateSkill.name.trim().toLowerCase())
    );

    if (matchedWanted) {
      const priorityBonus = PRIORITY_MULTIPLIERS[matchedWanted.priority?.toLowerCase() || 'medium'];
      skillsTheyCanTeachMe.push({
        skill: candidateSkill.name,
        theirProficiency: candidateSkill.proficiency,
        myPriority: matchedWanted.priority
      });
      score += 15 * priorityBonus;
    }
  });

  // Skills I can teach candidate (what I offer vs what they want)
  const skillsICanTeachThem = [];
  myOffered.forEach(mySkill => {
    const matchedWanted = theirWanted.find(w =>
      w.name.trim().toLowerCase() === mySkill.name.trim().toLowerCase() ||
      mySkill.name.trim().toLowerCase().includes(w.name.trim().toLowerCase()) ||
      w.name.trim().toLowerCase().includes(mySkill.name.trim().toLowerCase())
    );

    if (matchedWanted) {
      skillsICanTeachThem.push({
        skill: mySkill.name,
        myProficiency: mySkill.proficiency,
        theirPriority: matchedWanted.priority
      });
      score += 15;
    }
  });

  if (skillsTheyCanTeachMe.length > 0 && skillsICanTeachThem.length > 0) {
    directMutualMatch = true;
    score += 15; // Mutual exchange bonus
    reasons.push(
      `Perfect complementary match: You can teach ${skillsICanTeachThem.map(s => s.skill).join(', ')} while they teach you ${skillsTheyCanTeachMe.map(s => s.skill).join(', ')}`
    );
    complementaryTrades.push({
      youTeach: skillsICanTeachThem.map(s => s.skill),
      youLearn: skillsTheyCanTeachMe.map(s => s.skill)
    });
  } else if (skillsTheyCanTeachMe.length > 0) {
    reasons.push(`They offer ${skillsTheyCanTeachMe.map(s => s.skill).join(', ')} which matches your wanted skills`);
  } else if (skillsICanTeachThem.length > 0) {
    reasons.push(`You can teach ${skillsICanTeachThem.map(s => s.skill).join(', ')} which they are looking to learn`);
  }

  // 2. Schedule Availability Overlap (Weight: 20 pts max)
  const myAvail = currentUser.availability || {};
  const theirAvail = candidateUser.availability || {};
  const overlappingSlots = [];

  ['weekdays', 'weekends', 'mornings', 'evenings'].forEach(slot => {
    if (myAvail[slot] && theirAvail[slot]) {
      overlappingSlots.push(slot);
      score += 5;
    }
  });

  if (overlappingSlots.length > 0) {
    reasons.push(`Shared availability during ${overlappingSlots.join(', ')}`);
  }

  // 3. Learning & Teaching Style Harmony (Weight: 10 pts max)
  const myPref = currentUser.learningPreferences || {};
  const theirPref = candidateUser.learningPreferences || {};
  
  if (myPref.teachingStyle && theirPref.learningStyle) {
    // If their learning style aligns with your teaching style
    score += 5;
    reasons.push(`Learning style alignment: ${theirPref.learningStyle || 'Hands-on'} matches your ${myPref.teachingStyle || 'Practical'} approach`);
  }

  // 4. Reputation & Completed Exchanges (Weight: 15 pts max)
  const candidateRating = candidateUser.ratingAverage || 0;
  const candidateSwaps = candidateUser.swapsCompleted || 0;
  
  if (candidateRating >= 4.5) {
    score += 8;
    reasons.push(`Top-rated community member (${candidateRating.toFixed(1)} / 5.0 stars)`);
  } else if (candidateRating >= 4.0) {
    score += 5;
  }

  if (candidateSwaps >= 5) {
    score += 7;
    reasons.push(`Experienced partner with ${candidateSwaps} completed exchanges`);
  } else if (candidateSwaps >= 1) {
    score += 3;
  }

  // 5. Language & Timezone Compatibility (Weight: 10 pts max)
  const myTimezone = currentUser.timezone || 'Asia/Kolkata';
  const theirTimezone = candidateUser.timezone || 'Asia/Kolkata';
  if (myTimezone === theirTimezone) {
    score += 5;
    reasons.push(`Same time zone (${myTimezone}) makes scheduling seamless`);
  }

  const myLanguages = (currentUser.languages || []).map(l => l.toLowerCase());
  const theirLanguages = (candidateUser.languages || []).map(l => l.toLowerCase());
  const commonLanguages = myLanguages.filter(l => theirLanguages.includes(l));
  if (commonLanguages.length > 0) {
    score += 5;
    reasons.push(`Shared spoken languages: ${commonLanguages.join(', ')}`);
  }

  // Normalize final score within 0 to 100
  const normalizedScore = Math.min(100, Math.round(score));

  return {
    matchScore: normalizedScore,
    isComplementary: directMutualMatch,
    reasons,
    complementaryTrades,
    skillsTheyCanTeachMe,
    skillsICanTeachThem
  };
}

/**
 * Finds and ranks candidates for the authenticated user
 */
async function getRankedRecommendations(userId, options = {}) {
  const {
    minScore = 15,
    skillFilter = null,
    limit = 20,
    sortBy = 'score' // 'score' | 'rating' | 'swaps'
  } = options;

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Exclude current user, blocked users, private profiles
  const blockedList = currentUser.blockedUsers || [];
  const query = {
    _id: { $ne: currentUser._id, $nin: blockedList },
    isPublic: true
  };

  const candidateUsers = await User.find(query)
    .select('-password -email')
    .populate('ratings.reviewer', 'name profilePhoto');

  const recommendations = [];

  for (const candidate of candidateUsers) {
    // Check if candidate blocked current user
    if ((candidate.blockedUsers || []).some(b => b.toString() === currentUser._id.toString())) {
      continue;
    }

    const {
      matchScore,
      isComplementary,
      reasons,
      complementaryTrades,
      skillsTheyCanTeachMe,
      skillsICanTeachThem
    } = calculateCompatibility(currentUser, candidate);

    // Apply skill filter if provided
    if (skillFilter) {
      const hasSkill = (candidate.skillsOffered || []).some(s => 
        s.name.toLowerCase().includes(skillFilter.toLowerCase())
      );
      if (!hasSkill) continue;
    }

    if (matchScore >= minScore) {
      const recentReviews = (candidate.ratings || [])
        .slice(-3)
        .reverse()
        .map(r => ({
          reviewer: r.reviewer ? { _id: r.reviewer._id, name: r.reviewer.name, profilePhoto: r.reviewer.profilePhoto } : null,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        }));

      recommendations.push({
        user: {
          _id: candidate._id,
          name: candidate.name,
          profilePhoto: candidate.profilePhoto,
          location: candidate.location,
          bio: candidate.bio,
          skillsOffered: candidate.skillsOffered,
          skillsWanted: candidate.skillsWanted,
          availability: candidate.availability,
          ratingAverage: candidate.ratingAverage,
          ratingCount: candidate.ratingCount,
          swapsCompleted: candidate.swapsCompleted,
          timeCredits: candidate.timeCredits,
          xp: candidate.xp || 0,
          level: candidate.level || 1,
          badges: candidate.badges || [],
          membership: candidate.membership || 'free',
          timezone: candidate.timezone || 'Asia/Kolkata',
          recentReviews
        },
        matchScore,
        score: matchScore,
        isComplementary,
        reasons,
        complementaryTrades,
        skillsTheyCanTeachMe,
        skillsICanTeachThem
      });
    }
  }

  // Sorting
  recommendations.sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.user.ratingAverage || 0) - (a.user.ratingAverage || 0);
    }
    if (sortBy === 'swaps') {
      return (b.user.swapsCompleted || 0) - (a.user.swapsCompleted || 0);
    }
    return b.matchScore - a.matchScore;
  });

  return recommendations.slice(0, limit);
}

module.exports = {
  calculateCompatibility,
  getRankedRecommendations
};
