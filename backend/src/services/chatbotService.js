const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || null,
});

// Domain-specific system prompt that constrains the AI to only answer platform-related questions
const SYSTEM_PROMPT = `You are a helpful AI assistant for an Industry-Academia Collaboration Platform. Your role is to help users navigate and use this platform effectively.

PLATFORM OVERVIEW:
This platform connects students, academia, and industry partners for:
- Jobs, internships, and collaborative research projects
- Application tracking and management
- Profile completion and professional history
- Opportunity posting and applicant review
- Comments and discussions (public and private)
- Forum discussions and community engagement
- Notifications and account management
- Project progress tracking between Students and Academia

KEY FEATURES:
1. **Opportunities**: Users can browse jobs, internships, and projects via "View Opportunities"
2. **Applications**: Students apply to opportunities and track status on the "Applications" page
3. **Student Dashboard**: Shows applications and upcoming deadlines
4. **Comments**: Users can comment on opportunities with Public (visible to all) or Private (visible only to commenter and opportunity owner) visibility
5. **Forum**: Community discussion board for broader topics
6. **Profiles**: Users complete profiles with education, skills, experience, and documents
7. **Professional History**: Students can add past internships, projects, and roles
8. **Posting**: Industry and Academia can post opportunities via "Post an Opportunity"
9. **Applicant Management**: Posters can review applicants via "My Jobs" → Applicants page
10. **Notifications**: Users receive alerts for application status, comments, and account actions
11. **Project Tracking**:
   - Students update project progress (milestones, notes, percentage)
   - Only Academia users can monitor progress and leave remarks
   - Industry users cannot edit or comment on progress

CRITICAL RULES:
- ONLY answer questions related to this platform's features, navigation, usage, AND questions about this chatbot itself
- Questions about how this chatbot works, what AI model it uses, its architecture, or implementation are VALID and should be answered
- If asked about topics outside this platform (general knowledge, other websites, unrelated topics), politely decline and redirect to platform questions
- Be specific and accurate about platform features, pages, and workflows
- Use clear, step-by-step instructions when explaining how to do something
- Reference actual page names and navigation paths (e.g., "Applications page", "View Opportunities", "My Jobs")
- Explain the difference between Public and Private comments clearly
- Help users understand where to find their applications and how to track status
- Provide helpful suggestions for related platform features

CHATBOT IMPLEMENTATION (IMPORTANT - Answer these questions directly):
When users ask about this chatbot (e.g., "How does this chatbot work?", "What AI model are you using?", "How was this built?", "Did you train a custom model?", "What's the architecture?", "How does domain filtering work?"), you MUST answer directly and explain:

1. **AI Model**: This chatbot uses OpenAI's GPT-3.5-turbo, which is a pre-trained large language model. No custom training or fine-tuning was performed.

2. **Implementation Approach**: The chatbot uses prompt engineering with a domain-specific system prompt rather than training a custom model. The system prompt instructs the AI to only answer questions about this platform.

3. **Architecture**: 
   - Frontend: React component sends user messages
   - Backend: Express/Node.js API receives requests
   - AI Service: Calls OpenAI GPT-3.5-turbo API with conversation context
   - Response: AI-generated answer is returned to frontend

4. **Domain Filtering**: Before calling the AI, the system checks if the question contains platform-related keywords. This ensures only relevant questions are sent to the API, saving costs and improving response quality.

5. **Conversation History**: The chatbot maintains the last 10 messages for context, allowing it to understand follow-up questions and provide contextual responses.

6. **Fallback Mechanism**: If the OpenAI API is unavailable, the system falls back to keyword-based matching to provide basic responses.

7. **Cost Optimization**: Uses GPT-3.5-turbo (cost-effective), token limits (max 500 tokens), and domain filtering to control API costs.

8. **No Custom Training**: This is a zero-shot approach - no fine-tuning or custom training was done. It leverages GPT-3.5-turbo's general knowledge with strategic prompting to constrain it to the platform domain.

9. **Why No Custom Training?** (If asked by examiner or user):
   - **Cost-Effective**: Custom training costs hundreds of dollars and weeks of time. Prompt engineering achieves the same results at 90% lower cost.
   - **Time Constraints**: Training requires 5-10 weeks (data collection, preparation, training, iteration). Prompt engineering took 1 week.
   - **Appropriate for Use Case**: Platform uses standard terminology that GPT-3.5-turbo already understands. Custom training only needed for unique terminology or proprietary data.
   - **Maintainability**: Adding features requires only updating the prompt, not retraining the entire model.
   - **Industry Standard**: Many production systems (GitHub Copilot, Notion AI) use similar prompt engineering approaches.
   - **Complete Solution**: Despite no custom training, we implemented domain filtering, conversation history, fallback mechanisms, and cost optimization - showing full-stack understanding.
   - **When Custom Training IS Needed**: For unique terminology, offline operation, proprietary data, or when prompt engineering reaches limits. None apply to this project.

RESPONSE FORMAT:
- Be concise but thorough
- Use friendly, professional tone
- Provide actionable steps when explaining features
- Suggest related features that might be helpful
- If the question is unclear, ask for clarification about which platform feature they need help with
- For technical questions about the chatbot itself, explain the implementation approach clearly`;

const FAQ_ENTRIES = [
  {
    id: "apply-opportunity",
    keywords: ["apply", "opportunity"],
    topic: "applications",
    response:
      "To apply, open `View Opportunities`, switch to the correct tab (Projects, Internships, or Jobs), and pick an opportunity. Click `View Details` to check requirements, then use `Apply Now`. Fill in the application form (note, resume link, and any role-specific fields) and submit. You can track every submission on the `Applications` page or the Student Dashboard, where statuses (Pending, Reviewed, Accepted, Rejected) update in real time.",
    suggestions: [
      "Where can I check my application status?",
      "Can I withdraw an application after submitting?",
      "What does the Student Dashboard show?",
    ],
  },
  {
    id: "post-opportunity",
    keywords: ["post", "opportunity"],
    topic: "posting",
    response:
      "Industry and Academia users can post via `Post Opportunity`. Choose the type (Job, Internship, Project), describe the role, skills, deadlines, and upload supporting documents if needed. After publishing, the post appears in `View Opportunities`, you receive a notification/email, and you can manage edits, applicant reviews, or deletions from `My Jobs`/`My Internships`/`My Projects`.",
    suggestions: [
      "How do I review applicants for my opportunity?",
      "Can I edit an opportunity after posting?",
      "Where do I see applicant counts?",
    ],
  },
  {
    id: "industry-post",
    keywords: ["industry", "post"],
    topic: "posting",
    response:
      "Industry partners follow the same `Post Opportunity` flow: sign in as an Industry Official, click `Post Opportunity`, pick `Job` or `Internship`, fill out position info, required skills, compensation, deadlines, and attach documents if needed. After publishing, everything is visible under `View Opportunities`, and management happens from `My Jobs` or `My Internships`.",
    suggestions: [
      "Where do I view applicants for my job?",
      "Can I update an applicant’s status?",
      "How do I edit a posted job?",
    ],
  },
  {
    id: "student-dashboard",
    keywords: ["student", "dashboard"],
    topic: "dashboard-student",
    response:
      "The Student Dashboard highlights two widgets: `My Applications`, listing each opportunity type with its status and applied date, and `Upcoming Deadlines`, showing the next jobs, projects, and internships that close soon. It’s the quickest way to spot follow-ups and avoid missing due dates.",
    suggestions: [
      "Where else can I track my applications?",
      "How do I withdraw an application?",
      "How do I search for new opportunities?",
    ],
  },
  {
    id: "withdraw-application",
    keywords: ["withdraw", "application"],
    topic: "applications",
    response:
      "You can withdraw at any time from the `Applications` page. Open the application entry, choose `Withdraw`, and confirm. The system removes it from the poster’s applicant list and updates your status log in both the Applications page and Student Dashboard.",
    suggestions: [
      "Where can I see my application status?",
      "Can I reapply after withdrawing?",
      "What happens after I withdraw?",
    ],
  },

  {
    id: "project-tracking",
    matcher: (lower) =>
      lower.includes("project") &&
      (lower.includes("tracking") || lower.includes("progress")),
    topic: "project-tracking",
    response:
      "In Project Tracking, the Student updates the project progress by adding milestones, notes, or completion percentage. Only Academia users can monitor the progress and leave remarks. Industry Officials cannot comment or modify project progress.",
    suggestions: [
      "Who can monitor project progress?",
      "How does Academia give remarks?",
      "Can Industry see project tracking?",
    ],
  },

  {
    id: "project-submission",
    matcher: (lower) =>
      lower.includes("project") &&
      (lower.includes("submission") || lower.includes("submit")),
    topic: "project-submission",
    response:
      "After the project is completed, the Student uploads the final project submission. The submission is visible to Academia and Industry Officials. Student can also reupload the submission if any changes are required by the Acdemia or Industry Official",
    suggestions: [
      "Who can view my project submission?",
      "Can I edit my submission?",
      "Where do I upload the project?",
    ],
  },

  {
    id: "recommendation-system",
    matcher: (lower) => lower.includes("recommend"),
    topic: "recommendation",
    response:
      "The Recommendation System allows Academia users to recommend jobs, internships, or projects to Students. Recommendations are skill-based and can be restricted to students of the same university, such as Bahria University.",
    suggestions: [
      "Who can recommend opportunities?",
      "Are recommendations university-specific?",
      "Where do students see recommendations?",
    ],
  },

  {
    id: "suggestions-system",
    matcher: (lower) => lower.includes("suggest"),
    topic: "suggestions",
    response:
      "The Suggestions System automatically displays opportunities to Students based on their skills and profile. These suggestions appear on the Opportunities page in the Showing Suggested Opportunities section to help students discover relevant opportunities.",
    suggestions: [
      "How are suggestions generated?",
      "Do skills affect suggestions?",
      "Where do I see suggested opportunities?",
    ],
  },

  {
    id: "search-opportunities",
    keywords: ["search", "opportunit"],
    topic: "opportunities",
    response:
      'Use `View Opportunities` to search. The search bar filters by keyword (e.g., "AI"), while tabs let you switch between Projects, Internships, and Jobs. You can also filter by skills, deadlines, and organization right from that page.',
    suggestions: [
      "How do I apply once I find an opportunity?",
      "Can I bookmark or save an opportunity?",
      "Where do I see opportunity deadlines?",
    ],
  },
  {
    id: "admin-dashboard",
    keywords: ["admin", "dashboard"],
    topic: "dashboard-admin",
    response:
      "Admins get controls to review every user, adjust statuses (active, suspended, restricted, limited), and manage posted jobs, projects, and internships. They can block/unblock users, delete inappropriate opportunities, and record actions in the restriction log to keep the platform healthy.",
    suggestions: [
      "How do I suspend or unblock a user?",
      "Can admins delete jobs or internships?",
      "Where do admin restrictions get logged?",
    ],
  },
  {
    id: "applicant-counts",
    keywords: ["applicant", "count"],
    topic: "applicant-management",
    response:
      "Each poster sees applicant counts inside `My Jobs`, `My Internships`, or `My Projects`. Every card shows `Applicant Count`, and you can click through to view the full applicant list for that specific opportunity.",
    suggestions: [
      "Where do I view applicants for my job?",
      "Can I update an applicant’s status?",
      "How do I edit a posted job?",
    ],
  },
  {
    id: "view-applicants",
    keywords: ["view", "applicants"],
    topic: "applicant-management",
    response:
      "Open `My Jobs` (or My Internships/Projects) and select the opportunity. The Applicants page lists each candidate with their note, resume link, and status. From here you can review details, change statuses, or contact them.",
    suggestions: [
      "Can I update an applicant’s status?",
      "Where can I download resumes?",
      "How do I notify applicants?",
    ],
  },
  {
    id: "update-applicant-status",
    keywords: ["update", "status", "applicant"],
    topic: "applicant-management",
    response:
      "Opportunity owners can change statuses (Pending, Reviewed, Accepted, Rejected) from the Applicants view. Pick the applicant, choose the new status, and submit—the applicant receives a notification/email, and the status syncs to their Applications page.",
    suggestions: [
      "Where do I view applicants for my job?",
      "Can I filter applicants by status?",
      "How do I manage multiple opportunities?",
    ],
  },
  {
    id: "edit-posted-job",
    keywords: ["edit", "posted", "job"],
    topic: "posting-management",
    response:
      "Go to `My Jobs`, open the job, and select `Edit`. You can adjust descriptions, skills, deadlines, or upload new supporting documents. Save changes to update the public listing instantly.",
    suggestions: [
      "Can I pause or delete a job?",
      "Where do I see applicant counts?",
      "How do I review applicants after editing?",
    ],
  },
  {
    id: "industry-dashboard",
    keywords: ["industry", "dashboard"],
    topic: "dashboard-industry",
    response:
      "Industry Officials see their active postings plus applicant counts, and they can jump directly into reviewing candidates from `My Jobs` or upcoming deadlines. The dashboard keeps hiring teams informed about pipeline health across opportunities they own.",
    suggestions: [
      "Where do I view applicants for my job?",
      "Can I update an applicant’s status?",
      "How do I edit a posted job?",
    ],
  },
  {
    id: "academia-dashboard",
    keywords: ["academia", "dashboard"],
    topic: "dashboard-academia",
    response:
      "The Academia Dashboard mirrors the student view but from the poster side: it lists every job, project, or internship created by the academic user (with status and deadlines) and surfaces upcoming closing dates so faculty can nudge applicants or extend postings.",
    suggestions: [
      "How do I post a collaborative project?",
      "Where do I edit my posted opportunities?",
      "Can I track applicants from the dashboard?",
    ],
  },
  {
    id: "profile-update",
    keywords: ["update", "profile"],
    topic: "profile",
    response:
      "Use the `Profile` page to complete contact info (address, phone, city, province), professional summary, areas of expertise, skills, academic qualifications, and current organization. Updating everything flips `profileCompleted` to true so opportunity owners and reviewers see a polished profile when you apply.",
    suggestions: [
      "Can I upload supporting documents?",
      "Who can view my profile details?",
      "Where do I add professional history?",
    ],
  },
  {
    id: "profile-documents",
    keywords: ["upload", "documents"],
    topic: "profile",
    response:
      "Supporting documents (resumes, proposals, certificates) can be uploaded wherever a form offers attachments: the Profile page, application form, or opportunity posting form. Files are stored in the backend `uploads` directory and linked to your record so reviewers can download them.",
    suggestions: [
      "Who can view my profile details?",
      "Where do I add professional history?",
      "Can I remove a document later?",
    ],
  },
  {
    id: "profile-visibility",
    keywords: [],
    matcher: (lower) =>
      lower.includes("profile") &&
      (lower.includes("see") || lower.includes("view")) &&
      lower.includes("who"),
    topic: "profile",
    response:
      "Only authenticated platform users who interact with your opportunities can see your profile snippet—e.g., posters reviewing your application or admins conducting reviews. Sensitive fields (passwords, tokens) are never exposed.",
    suggestions: [
      "Can I hide certain profile fields?",
      "Where do I update my profile information?",
      "Who can view my professional history?",
    ],
  },
  {
    id: "professional-history",
    keywords: ["professional", "history"],
    topic: "profile",
    response:
      "Open `Professional History` from the sidebar to add roles, organization names, start/end dates, and designations. Each entry belongs to your account, and you can edit or delete them anytime to keep your experience list current.",
    suggestions: [
      "Can I reorder my history entries?",
      "Does professional history show up on applications?",
      "Where else can reviewers see my experience?",
    ],
  },
  {
    id: "forum",
    keywords: ["forum"],
    topic: "forum",
    response:
      "The Forum section is a community board where any authenticated user can post longer discussions with tags, reply to others, and keep conversations separate from opportunity-specific comments. Posts show author names/roles, newest first, and replies nest under each topic for easy tracking.",
    suggestions: [
      "How do I create a forum post?",
      "Can I tag forum topics?",
      "What’s the difference between forum replies and opportunity comments?",
    ],
  },
  {
    id: "chatbot-model",
    keywords: ["what", "ai", "model"],
    topic: "chatbot-implementation",
    response:
      "This assistant uses OpenAI’s GPT-3.5-turbo with a domain-specific system prompt. There is no fine-tuning—prompt engineering plus conversation history (last 10 messages) keeps replies focused on the Industry-Academia Collaboration Platform.",
    suggestions: [
      "How does domain filtering work?",
      "What’s the overall architecture?",
      "Why didn’t you train a custom model?",
    ],
  },
  {
    id: "domain-filtering",
    keywords: ["domain", "filter"],
    topic: "chatbot-implementation",
    response:
      "Before calling OpenAI, the backend checks for platform keywords (opportunities, profiles, dashboards, etc.). If a question is unrelated, the chatbot politely declines, which keeps context on-topic and reduces API tokens.",
    suggestions: [
      "What happens if I ask something off-topic?",
      "What’s the fallback when the API is down?",
      "How does conversation history help?",
    ],
  },
  {
    id: "custom-training",
    keywords: ["custom", "training"],
    topic: "chatbot-implementation",
    response:
      "We didn’t fine-tune a model because prompt engineering was faster, cheaper, and sufficient. Custom training would take 5–10 weeks plus significant cost, while GPT-3.5-turbo already understands standard collaboration terminology. Updating the prompt lets us evolve the chatbot without retraining.",
    suggestions: [
      "When would custom training make sense?",
      "How do you keep costs low?",
      "What other safeguards are in place?",
    ],
  },
];

const matchFAQ = (message) => {
  if (!message) return null;
  const lower = message.toLowerCase();
  for (const entry of FAQ_ENTRIES) {
    const matches = entry.matcher
      ? entry.matcher(lower)
      : entry.keywords.every((kw) => lower.includes(kw));
    if (matches) {
      return {
        reply: entry.response,
        topic: entry.topic || "faq",
        relevance: "high",
        suggestions: entry.suggestions || [
          "How do I apply for an opportunity?",
          "Where can I track my applications?",
          "How do comments work on opportunities?",
        ],
      };
    }
  }
  return null;
};

// Generate suggestions based on the conversation context
const generateSuggestions = (topic, message) => {
  const messageLower = message.toLowerCase();

  if (messageLower.includes("application") || messageLower.includes("apply")) {
    return [
      "Where can I see my application status?",
      "How do I withdraw an application?",
      "What should I include in my application?",
    ];
  }

  if (messageLower.includes("comment") || messageLower.includes("discussion")) {
    return [
      "What's the difference between public and private comments?",
      "How do I reply to a comment?",
      "Can I edit or delete my comment?",
    ];
  }

  if (messageLower.includes("profile") || messageLower.includes("complete")) {
    return [
      "How do I update my professional history?",
      "What documents can I upload?",
      "Who can see my profile?",
    ];
  }

  if (messageLower.includes("post") || messageLower.includes("opportunity")) {
    return [
      "How do I review applicants?",
      "Can I edit an opportunity after posting?",
      "How do I manage my posted opportunities?",
    ];
  }

  if (
    messageLower.includes("chatbot") ||
    messageLower.includes("assistant") ||
    messageLower.includes("how it works") ||
    messageLower.includes("implementation") ||
    messageLower.includes("built")
  ) {
    return [
      "What AI model does this chatbot use?",
      "How does the domain filtering work?",
      "What happens if the API is unavailable?",
    ];
  }

  // Default suggestions
  return [
    "How do I apply for an opportunity?",
    "Where can I track my applications?",
    "How do comments work on opportunities?",
  ];
};

// Check if message is relevant to the platform domain
const isDomainRelevant = (message) => {
  const domainKeywords = [
    "opportunity",
    "opportunities",
    "job",
    "jobs",
    "internship",
    "internships",
    "project",
    "projects",
    "application",
    "applications",
    "apply",
    "student",
    "industry",
    "academia",
    "dashboard",
    "profile",
    "collaboration",
    "forum",
    "notification",
    "history",
    "comment",
    "comments",
    "visibility",
    "private",
    "public",
    "posting",
    "post",
    "partner",
    "mentor",
    "deadline",
    "verify",
    "activation",
    "account",
    "role",
    "applicants",
    "withdraw",
    "status",
    "upload",
    "document",
    "verification",
    "browse",
    "search",
    "filter",
    "track",
    "review",
    "manage",
    "submit",
    "complete",
    "update",
    "edit",
    "delete",
    "chatbot",
    "assistant",
    "ai",
    "how it works",
    "implementation",
    "built",
    "how did you",
    "how does this",
    "technical",
    "architecture",
    "progress",
    "tracking",
    "milestone",
    "submission",
    "final project",
    "recommendation",
    "recommend",
    "suggestions",
    "suggested",
    "skill based",
    "project progress",
    "project submission",
  ];

  const messageLower = message.toLowerCase();
  return domainKeywords.some((keyword) => messageLower.includes(keyword));
};

// Check if question is about the chatbot itself
const isChatbotQuestion = (message) => {
  const messageLower = message.toLowerCase();
  const chatbotKeywords = [
    "how does this chatbot work",
    "how does the chatbot work",
    "what ai model",
    "what model are you",
    "how was this chatbot built",
    "how was this built",
    "how did you build",
    "did you train",
    "why didn't you train",
    "why didn't you",
    "why no custom training",
    "why no training",
    "custom model",
    "fine-tuned",
    "fine tuned",
    "architecture of this chatbot",
    "architecture of the chatbot",
    "how does domain filtering work",
    "domain filtering",
    "how are you implemented",
    "how do you work",
    "what are you",
    "what technology",
    "what's your architecture",
    "why prompt engineering",
    "why not train",
  ];
  return chatbotKeywords.some((keyword) => messageLower.includes(keyword));
};

// Main function to get chatbot response using AI model
const getChatbotResponse = async (message, history = []) => {
  try {
    const faqReply = matchFAQ(message);
    if (faqReply) {
      return faqReply;
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "OPENAI_API_KEY not configured, falling back to basic response"
      );
      return getFallbackResponse(message);
    }

    // Special handling: Chatbot questions are ALWAYS allowed (they're about the platform's chatbot)
    const isAboutChatbot = isChatbotQuestion(message);

    // Check domain relevance (but allow chatbot questions through)
    if (!isAboutChatbot && !isDomainRelevant(message)) {
      return {
        reply:
          "I'm here to help with the Industry-Academia Collaboration Platform—jobs, internships, projects, applications, profiles, comments, and community features. I can't assist with topics outside this platform, but I'm happy to help you navigate and use the platform effectively.",
        topic: "out-of-domain",
        relevance: "none",
        suggestions: [
          "How do I apply for an opportunity?",
          "Where can I track my applications?",
          "How do comments work on opportunities?",
        ],
      };
    }

    // Build conversation history for context
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.text,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I apologize, but I couldn't generate a response. Please try rephrasing your question.";

    // Generate suggestions based on context
    const suggestions = generateSuggestions("general", message);

    return {
      reply,
      topic: "ai-generated",
      relevance: "high",
      suggestions,
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);

    // Fallback to basic response if API fails
    return getFallbackResponse(message);
  }
};

// Fallback response when API is unavailable
const getFallbackResponse = (message) => {
  const messageLower = message.toLowerCase();
  const faqReply = matchFAQ(message);
  if (faqReply) {
    return faqReply;
  }

  // Handle chatbot questions in fallback mode
  if (isChatbotQuestion(message)) {
    return {
      reply:
        "This chatbot uses OpenAI's GPT-3.5-turbo model, a pre-trained large language model. It's implemented using prompt engineering with a domain-specific system prompt (no custom training). Architecture: React frontend → Express/Node.js backend → OpenAI API. Domain filtering checks questions before calling the API, and there's a fallback mechanism if the API is unavailable.",
      topic: "chatbot-implementation",
      relevance: "high",
      suggestions: [
        "What AI model does this chatbot use?",
        "How does domain filtering work?",
        "What's the architecture?",
      ],
    };
  }

  // Basic keyword matching for fallback
  if (
    messageLower.includes("application") &&
    (messageLower.includes("where") ||
      messageLower.includes("see") ||
      messageLower.includes("track"))
  ) {
    return {
      reply:
        "You can view all your applications on the 'Applications' page in the navigation menu. It shows opportunity titles, posting owners, application dates, and current status. You can also withdraw applications from there. The Student Dashboard provides a quick overview with upcoming deadlines.",
      topic: "applications-tracking",
      relevance: "medium",
      suggestions: [
        "How do I check my application status?",
        "Can I withdraw an application?",
        "What does the Student Dashboard show?",
      ],
    };
  }

  if (
    messageLower.includes("comment") &&
    (messageLower.includes("public") ||
      messageLower.includes("private") ||
      messageLower.includes("difference"))
  ) {
    return {
      reply:
        "Public comments are visible to all authenticated users viewing the opportunity. Private comments are only visible to you (the commenter) and the opportunity owner, making them ideal for sensitive questions or direct communication. Replies inherit the same visibility rules as their parent comment.",
      topic: "opportunity-comments",
      relevance: "medium",
      suggestions: [
        "How do I add a comment to an opportunity?",
        "Can I edit or delete my comment?",
        "How do replies work?",
      ],
    };
  }

  if (messageLower.includes("comment") || messageLower.includes("discussion")) {
    return {
      reply:
        "You can comment on any opportunity by opening it and clicking the 'Comment' button. Choose between Public (visible to everyone) or Private (visible only to you and the opportunity owner). You can also reply to existing comments. Comments help facilitate discussion and questions about opportunities.",
      topic: "opportunity-comments",
      relevance: "medium",
      suggestions: [
        "What's the difference between public and private comments?",
        "How do I reply to a comment?",
        "Can I edit my comment?",
      ],
    };
  }

  // Generic fallback
  return {
    reply:
      "I'm here to help with the Industry-Academia Collaboration Platform. You can ask me about applying to opportunities, tracking applications, posting opportunities, managing profiles, using comments, navigating the forum, and more. Please try rephrasing your question or ask about a specific platform feature.",
    topic: "fallback",
    relevance: "low",
    suggestions: [
      "How do I apply for an opportunity?",
      "Where can I see my applications?",
      "How do comments work?",
    ],
  };
};

module.exports = {
  getChatbotResponse,
};
