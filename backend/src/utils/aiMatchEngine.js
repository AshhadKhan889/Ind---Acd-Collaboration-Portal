module.exports = function matchStudentToOpportunity(studentSkills, opportunityKeywords) {
  if (!studentSkills || !opportunityKeywords) return 0;

  let matches = opportunityKeywords.filter(keyword =>
    studentSkills.includes(keyword.toLowerCase())
  );

  const score = matches.length / opportunityKeywords.length; // 0 → 1

  return score;
};
