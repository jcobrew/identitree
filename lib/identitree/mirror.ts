import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getIdentitreeEnv } from "@/lib/identitree/env";
import {
  ACTION_LIBRARY,
  IDENTITY_LIBRARY,
  ONBOARDING_COPY,
  QUEST_LIBRARY,
  SKILL_LIBRARY,
  emptyMirrorResponse,
  normalizeLabel,
  toList,
  trimSentence,
} from "@/lib/identitree/seed";
import {
  type MirrorResponse,
  type NodeType,
  type OnboardingField,
  type StarterNodeTemplate,
  type Thread,
  type UserProfile,
  type WorkspaceState,
  ONBOARDING_FIELDS,
  mirrorResponseSchema,
} from "@/lib/identitree/types";

const anthropicJsonSchema = z.object({
  response: mirrorResponseSchema,
});

const INTEREST_LIBRARY: StarterNodeTemplate[] = [
  {
    label: "playful making",
    keywords: ["make", "build", "prototype", "design", "craft", "product"],
    insight: "this leaf carries the energy to turn thought into form.",
  },
  {
    label: "human connection",
    keywords: ["people", "friend", "community", "conversation", "feedback", "listen"],
    insight: "this leaf keeps the work in contact with other humans.",
  },
  {
    label: "rituals",
    keywords: ["routine", "ritual", "habit", "weekly", "consistency", "rhythm"],
    insight: "this leaf wants repetition gentle enough to keep returning.",
  },
  {
    label: "writing",
    keywords: ["write", "essay", "note", "thread", "language", "journal"],
    insight: "this leaf wants your experience to become language.",
  },
  {
    label: "learning",
    keywords: ["learn", "study", "research", "curious", "read", "explore"],
    insight: "this leaf holds the curiosity that keeps the tree alive.",
  },
];

const STOPWORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "from",
  "this",
  "have",
  "about",
  "into",
  "your",
  "just",
  "really",
  "more",
  "want",
  "feel",
  "like",
  "been",
  "still",
  "only",
  "when",
  "they",
  "them",
  "what",
  "because",
]);

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));

const unique = <T,>(items: T[]) => items.filter((item, index) => items.indexOf(item) === index);

const scoreTemplate = (text: string, template: StarterNodeTemplate) => {
  const normalized = text.toLowerCase();
  return template.keywords.reduce((score, keyword) => {
    return normalized.includes(keyword) ? score + 1 : score;
  }, 0);
};

const pickTemplates = (text: string, templates: StarterNodeTemplate[], count: number) => {
  const ranked = templates
    .map((template) => ({ template, score: scoreTemplate(text, template) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.template);

  if (ranked.length > 0) return ranked;
  return templates.slice(0, count);
};

const shortLabelFromSentence = (value: string, fallback: string) => {
  const cleaned = value
    .replace(/^(i am|i'm|im|becoming|someone who|a person who)\s+/i, "")
    .replace(/[.?!].*$/, "")
    .trim();

  if (!cleaned) return fallback;
  const words = cleaned.split(/\s+/).slice(0, 4);
  return trimSentence(words.join(" "), 34);
};

const parseName = (value: string) => {
  const match = value.match(/(?:my name is|i am|i'm|im)\s+([a-z][a-z\s'-]{1,30})/i);
  if (match?.[1]) {
    return trimSentence(match[1].trim().replace(/\s+/g, " "), 28);
  }
  return trimSentence(value.split(/[,.!?\n]/)[0] ?? value, 28);
};

const nextOnboardingField = (profile: UserProfile): OnboardingField | null => {
  for (const field of ONBOARDING_FIELDS) {
    if (!profile[field].trim()) return field;
  }
  return null;
};

const applyOnboardingField = (profile: UserProfile, field: OnboardingField, message: string): UserProfile => {
  if (field === "name") {
    return { ...profile, name: parseName(message) };
  }

  return { ...profile, [field]: trimSentence(message, 220) };
};

const extractInterestNodes = (text: string) => {
  const picks = pickTemplates(text, INTEREST_LIBRARY, 2);
  return picks.map((template) => ({
    type: "interest" as const,
    label: template.label,
    insight: template.insight,
  }));
};

const buildSeedNodesFromProfile = (profile: UserProfile) => {
  const identityText = `${profile.becoming} ${profile.doing}`;
  const questText = `${profile.doing} ${profile.currentLandscape}`;
  const skillText = `${profile.doing} ${profile.currentLandscape}`;
  const actionText = profile.doing;

  const identityNodes = pickTemplates(identityText, IDENTITY_LIBRARY, 2).map((template) => ({
    type: "identity" as const,
    label: template.label === "builder" && !identityText.toLowerCase().includes("builder")
      ? shortLabelFromSentence(profile.becoming, template.label)
      : template.label,
    insight: template.insight,
  }));

  const questNodes = pickTemplates(questText, QUEST_LIBRARY, 2).map((template) => ({
    type: "quest" as const,
    label: template.label,
    insight: template.insight,
  }));

  const skillNodes = pickTemplates(skillText, SKILL_LIBRARY, 2).map((template) => ({
    type: "skill" as const,
    label: template.label,
    insight: template.insight,
  }));

  const actionNodes = pickTemplates(actionText, ACTION_LIBRARY, 2).map((template) => ({
    type: "action" as const,
    label: template.label,
    insight: template.insight,
  }));

  const interestNodes = extractInterestNodes(`${profile.currentLandscape} ${profile.doing}`);

  return [...interestNodes, ...identityNodes, ...questNodes, ...skillNodes, ...actionNodes];
};

const buildEdgesFromNodeLabels = (nodes: Array<{ type: NodeType; label: string }>) => {
  const interests = nodes.filter((node) => node.type === "interest");
  const identities = nodes.filter((node) => node.type === "identity");
  const quests = nodes.filter((node) => node.type === "quest");
  const skills = nodes.filter((node) => node.type === "skill");
  const actions = nodes.filter((node) => node.type === "action");

  const edges: MirrorResponse["edges"] = [];

  interests.forEach((interest, index) => {
    const identity = identities[index % Math.max(identities.length, 1)];
    if (identity) {
      edges.push({ fromLabel: interest.label, toLabel: identity.label, reason: `${interest.label} is feeding ${identity.label}` });
    }
  });

  identities.forEach((identity) => {
    edges.push({ fromLabel: identity.label, toLabel: "self", reason: `${identity.label} belongs to the same self` });
  });

  quests.forEach((quest) => {
    edges.push({ fromLabel: "self", toLabel: quest.label, reason: `${quest.label} is where this identity gets tested` });
  });

  quests.forEach((quest, index) => {
    const skill = skills[index % Math.max(skills.length, 1)];
    if (skill) {
      edges.push({ fromLabel: quest.label, toLabel: skill.label, reason: `${quest.label} depends on ${skill.label}` });
    }
  });

  skills.forEach((skill, index) => {
    const action = actions[index % Math.max(actions.length, 1)];
    if (action) {
      edges.push({ fromLabel: skill.label, toLabel: action.label, reason: `${skill.label} gets trained through ${action.label}` });
    }
  });

  return edges;
};

const buildOnboardingCompletion = (profile: UserProfile): MirrorResponse => {
  const nodes = buildSeedNodesFromProfile(profile);
  const edges = buildEdgesFromNodeLabels(nodes);
  const identityLabels = nodes.filter((node) => node.type === "identity").map((node) => node.label);
  const questLabels = nodes.filter((node) => node.type === "quest").map((node) => node.label);

  return {
    message:
      `i can see a first shape now. this already reads like ${toList(identityLabels)} more than a random pile of effort. ` +
      `the first branches look like ${toList(questLabels)}. where do you want to stay first?`,
    nodes,
    edges,
  };
};

const buildDriftQuestion = (thread: Thread, message: string) => {
  const topicTokens = new Set(tokenize(`${thread.title} ${thread.topic}`));
  const messageTokens = tokenize(message);
  if (messageTokens.length === 0 || topicTokens.size === 0) return false;
  const overlap = messageTokens.filter((token) => topicTokens.has(token)).length;
  return overlap === 0;
};

const buildLocalMirrorResponse = ({
  workspace,
  thread,
  userMessage,
}: {
  workspace: WorkspaceState;
  thread: Thread;
  userMessage: string;
}): { mirror: MirrorResponse; profile: UserProfile; completedOnboarding: boolean } => {
  const currentField = nextOnboardingField(workspace.profile);

  if (currentField) {
    const nextProfile = applyOnboardingField(workspace.profile, currentField, userMessage);
    const nextField = nextOnboardingField(nextProfile);

    if (nextField) {
      return {
        mirror: {
          message:
            `that helps. i'm hearing ${trimSentence(userMessage, 72)} as part of the landscape. ` +
            `that already changes the shape of the tree a little. ${ONBOARDING_COPY[nextField].question}`,
          nodes: [],
          edges: [],
        },
        profile: nextProfile,
        completedOnboarding: false,
      };
    }

    return {
      mirror: buildOnboardingCompletion(nextProfile),
      profile: nextProfile,
      completedOnboarding: true,
    };
  }

  const identityNodes = pickTemplates(`${workspace.profile.becoming} ${userMessage}`, IDENTITY_LIBRARY, 1).map((template) => ({
    type: "identity" as const,
    label: template.label,
    insight: template.insight,
  }));
  const questNodes = pickTemplates(`${thread.topic} ${userMessage}`, QUEST_LIBRARY, 1).map((template) => ({
    type: "quest" as const,
    label: template.label,
    insight: template.insight,
  }));
  const skillNodes = pickTemplates(userMessage, SKILL_LIBRARY, 1).map((template) => ({
    type: "skill" as const,
    label: template.label,
    insight: template.insight,
  }));
  const actionNodes = pickTemplates(userMessage, ACTION_LIBRARY, 1).map((template) => ({
    type: "action" as const,
    label: template.label,
    insight: template.insight,
  }));
  const interestNodes = extractInterestNodes(userMessage).slice(0, 1);

  const nodes = unique([...interestNodes, ...identityNodes, ...questNodes, ...skillNodes, ...actionNodes]);
  const edges = buildEdgesFromNodeLabels(nodes);
  const drift = buildDriftQuestion(thread, userMessage);
  const identityLabel = identityNodes[0]?.label ?? "this identity";
  const questLabel = questNodes[0]?.label ?? "one branch";
  const actionLabel = actionNodes[0]?.label ?? "one grounded action";

  return {
    mirror: {
      message:
        `i'm hearing that this thread is really about ${trimSentence(thread.topic, 60)}. ` +
        `in the tree, that leans toward ${identityLabel} through ${questLabel}, and the leverage is ${actionLabel}. ` +
        (drift
          ? "this might want its own thread instead of stretching this one. do you want to keep it here or split it out?"
          : "what feels most true to stay with next?"),
      nodes,
      edges,
    },
    profile: workspace.profile,
    completedOnboarding: workspace.hasCompletedOnboarding,
  };
};

const buildAnthropicPrompt = ({
  workspace,
  thread,
  userMessage,
}: {
  workspace: WorkspaceState;
  thread: Thread;
  userMessage: string;
}) => {
  const threadContext = thread.messages.slice(-6).map((message) => `${message.role}: ${message.text}`).join("\n");

  return [
    "You are The Mirror for Identitree.",
    "Respond in 2-4 sentences max.",
    "Ask exactly one question.",
    "Stay scoped to the active thread unless you gently suggest making a new thread.",
    "Return JSON only with the shape { response: { message, nodes, edges } }.",
    "Node types must be one of identity, interest, quest, self, skill, action.",
    "Edges should use labels, not ids.",
    `Profile name: ${workspace.profile.name || "unknown"}`,
    `Profile landscape: ${workspace.profile.currentLandscape || "unknown"}`,
    `Profile doing: ${workspace.profile.doing || "unknown"}`,
    `Profile becoming: ${workspace.profile.becoming || "unknown"}`,
    `Thread title: ${thread.title}`,
    `Thread topic: ${thread.topic}`,
    `Recent thread context:\n${threadContext || "none"}`,
    `User message: ${userMessage}`,
  ].join("\n\n");
};

const runAnthropicMirror = async ({
  workspace,
  thread,
  userMessage,
}: {
  workspace: WorkspaceState;
  thread: Thread;
  userMessage: string;
}) => {
  const env = getIdentitreeEnv();
  if (!env.hasAnthropic || !env.anthropicApiKey) {
    return null;
  }

  const client = new Anthropic({ apiKey: env.anthropicApiKey });
  const result = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 900,
    temperature: 0.4,
    system: buildAnthropicPrompt({ workspace, thread, userMessage }),
    messages: [{ role: "user", content: [{ type: "text", text: userMessage }] }],
  });

  const text = result.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) return null;

  try {
    const parsed = anthropicJsonSchema.parse(JSON.parse(text));
    return parsed.response;
  } catch {
    return null;
  }
};

export const getOnboardingSuggestions = (profile: UserProfile) => {
  const field = nextOnboardingField(profile);
  return field ? ONBOARDING_COPY[field].suggestions : ["name the strongest thread", "tell the truth about the friction", "ask the tree what it sees"];
};

export const runMirrorTurn = async ({
  workspace,
  thread,
  userMessage,
}: {
  workspace: WorkspaceState;
  thread: Thread;
  userMessage: string;
}) => {
  const localTurn = buildLocalMirrorResponse({ workspace, thread, userMessage });

  if (workspace.hasCompletedOnboarding) {
    const remote = await runAnthropicMirror({ workspace, thread, userMessage });
    if (remote) {
      return {
        mirror: remote,
        profile: workspace.profile,
        completedOnboarding: workspace.hasCompletedOnboarding,
      };
    }
  }

  return localTurn;
};

export const safeParseMirrorResponse = (value: string): MirrorResponse | null => {
  try {
    return mirrorResponseSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
};

export const getNextOnboardingField = nextOnboardingField;
export const normalizeNodeLabel = normalizeLabel;
export const fallbackMirrorResponse = emptyMirrorResponse;
