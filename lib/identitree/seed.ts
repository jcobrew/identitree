import type {
  CheckInCard,
  MirrorResponse,
  NodeType,
  OnboardingField,
  StarterNodeTemplate,
  Thread,
  ThreadKind,
  TreeEdge,
  TreeNode,
  TreeSnapshot,
  UserProfile,
  WorkspaceState,
} from "@/lib/identitree/types";

export const WORKSPACE_STORAGE_KEY = "identitree-v3-workspace";
export const MIN_TREE_ZOOM = 0.9;
export const MAX_TREE_ZOOM = 2.4;

export const THREAD_COLORS = ["#3658c5", "#91691a", "#0f766e", "#8f3d51", "#4b5563"];
export const THREAD_EMOJIS = ["seed", "spark", "path", "field", "trace"];

export const ONBOARDING_COPY: Record<OnboardingField, { question: string; suggestions: string[] }> = {
  name: {
    question: "what name should i use for you as we start?",
    suggestions: ["jacob", "jay", "use my first name"],
  },
  currentLandscape: {
    question: "what does your current landscape feel like right now?",
    suggestions: [
      "i have a lot of ideas and not enough structure",
      "i'm in motion, but it still feels scattered",
      "i can feel something taking shape but it is still fragile",
    ],
  },
  doing: {
    question: "what are you already doing, even imperfectly?",
    suggestions: [
      "i'm making small things and showing them early",
      "i'm talking to people and learning out loud",
      "i'm trying to build a rhythm i can actually keep",
    ],
  },
  becoming: {
    question: "who are you becoming through this?",
    suggestions: [
      "someone who ships with more honesty",
      "someone who can hold both craft and conversation",
      "someone with a calmer, stronger creative center",
    ],
  },
};

export const IDENTITY_LIBRARY: StarterNodeTemplate[] = [
  {
    label: "builder",
    keywords: ["build", "ship", "prototype", "make", "product", "design", "code"],
    insight: "this identity grows when your ideas become visible enough to be tested.",
  },
  {
    label: "connector",
    keywords: ["people", "conversation", "community", "feedback", "share", "listen"],
    insight: "this identity grows when trust and exchange become part of the work, not a side note.",
  },
  {
    label: "architect",
    keywords: ["system", "structure", "ritual", "routine", "organize", "journal", "review"],
    insight: "this identity grows when you design a container that can hold the work over time.",
  },
  {
    label: "writer",
    keywords: ["write", "essay", "thread", "story", "publish", "language"],
    insight: "this identity grows when your inner pattern becomes language someone else can enter.",
  },
  {
    label: "teacher",
    keywords: ["teach", "explain", "mentor", "guide", "help", "clarify"],
    insight: "this identity grows when your learning becomes useful to another person.",
  },
];

export const QUEST_LIBRARY: StarterNodeTemplate[] = [
  {
    label: "ship one small prototype",
    keywords: ["ship", "prototype", "make", "product", "launch", "test"],
    insight: "a branch like this turns vague momentum into something concrete enough to respond to.",
  },
  {
    label: "invite three honest conversations",
    keywords: ["conversation", "feedback", "people", "ask", "listen", "interview"],
    insight: "this branch keeps your reflection from becoming private mythology.",
  },
  {
    label: "turn the messy loop into a rhythm",
    keywords: ["system", "routine", "weekly", "habit", "organize", "structure"],
    insight: "this branch matters when repetition is more important than intensity.",
  },
  {
    label: "publish a visible note",
    keywords: ["write", "publish", "thread", "essay", "share", "story"],
    insight: "this branch makes growth legible and invites the right kind of pressure.",
  },
];

export const SKILL_LIBRARY: StarterNodeTemplate[] = [
  {
    label: "design taste",
    keywords: ["design", "taste", "visual", "clarity", "craft"],
    insight: "this root helps you notice what adds signal and what only adds noise.",
  },
  {
    label: "systems thinking",
    keywords: ["system", "loop", "process", "workflow", "architecture", "organize"],
    insight: "this root helps you think in loops and leverage instead of isolated tasks.",
  },
  {
    label: "communication",
    keywords: ["conversation", "speak", "feedback", "communicate", "explain"],
    insight: "this root helps the work stay in contact with reality and with people.",
  },
  {
    label: "storytelling",
    keywords: ["story", "write", "thread", "share", "publish"],
    insight: "this root turns experience into a shape another person can follow.",
  },
  {
    label: "consistency",
    keywords: ["rhythm", "routine", "repeat", "habit", "consistency"],
    insight: "this root matters when identity depends on returning, not on one dramatic day.",
  },
];

export const ACTION_LIBRARY: StarterNodeTemplate[] = [
  {
    label: "45 minute build sprint",
    keywords: ["build", "prototype", "make", "focus", "draft"],
    insight: "this soil action keeps the work small enough to actually happen.",
  },
  {
    label: "send one honest message",
    keywords: ["message", "reach out", "feedback", "ask", "conversation"],
    insight: "this soil action moves connection from intention into contact.",
  },
  {
    label: "write a one-page reflection",
    keywords: ["journal", "reflect", "write", "note", "review"],
    insight: "this soil action clears the fog so the next move can be chosen on purpose.",
  },
  {
    label: "publish one progress note",
    keywords: ["publish", "share", "post", "thread", "story"],
    insight: "this soil action turns a private shift into something witnessed.",
  },
];

export const SAMPLE_TREE_NODES: TreeNode[] = [
  {
    id: "node-self",
    type: "self",
    label: "self",
    insight: "the trunk holds the identities, branches, and roots in one living shape.",
    firstSourceThreadId: "thread-sample-core",
    sourceThreadIds: ["thread-sample-core"],
    archived: false,
    status: "active",
    aliases: ["self"],
  },
  {
    id: "node-interest-making",
    type: "interest",
    label: "playful making",
    insight: "this leaf carries the energy that keeps the builder path alive.",
    firstSourceThreadId: "thread-sample-maker",
    sourceThreadIds: ["thread-sample-maker"],
    archived: false,
    status: "active",
    aliases: ["playful making"],
  },
  {
    id: "node-interest-people",
    type: "interest",
    label: "human connection",
    insight: "this leaf keeps reflection in touch with other minds.",
    firstSourceThreadId: "thread-sample-connect",
    sourceThreadIds: ["thread-sample-connect"],
    archived: false,
    status: "active",
    aliases: ["human connection"],
  },
  {
    id: "node-interest-rhythm",
    type: "interest",
    label: "rituals",
    insight: "this leaf hints that structure is not the enemy of feeling here.",
    firstSourceThreadId: "thread-sample-rhythm",
    sourceThreadIds: ["thread-sample-rhythm"],
    archived: false,
    status: "active",
    aliases: ["rituals"],
  },
  {
    id: "node-identity-builder",
    type: "identity",
    label: "builder",
    insight: IDENTITY_LIBRARY[0].insight,
    firstSourceThreadId: "thread-sample-maker",
    sourceThreadIds: ["thread-sample-maker"],
    archived: false,
    status: "active",
    aliases: ["builder"],
  },
  {
    id: "node-identity-connector",
    type: "identity",
    label: "connector",
    insight: IDENTITY_LIBRARY[1].insight,
    firstSourceThreadId: "thread-sample-connect",
    sourceThreadIds: ["thread-sample-connect"],
    archived: false,
    status: "active",
    aliases: ["connector"],
  },
  {
    id: "node-identity-architect",
    type: "identity",
    label: "architect",
    insight: IDENTITY_LIBRARY[2].insight,
    firstSourceThreadId: "thread-sample-rhythm",
    sourceThreadIds: ["thread-sample-rhythm"],
    archived: false,
    status: "active",
    aliases: ["architect"],
  },
  {
    id: "node-quest-prototype",
    type: "quest",
    label: "ship one small prototype",
    insight: QUEST_LIBRARY[0].insight,
    firstSourceThreadId: "thread-sample-maker",
    sourceThreadIds: ["thread-sample-maker"],
    archived: false,
    status: "active",
    aliases: ["ship one small prototype"],
  },
  {
    id: "node-quest-conversation",
    type: "quest",
    label: "invite three honest conversations",
    insight: QUEST_LIBRARY[1].insight,
    firstSourceThreadId: "thread-sample-connect",
    sourceThreadIds: ["thread-sample-connect"],
    archived: false,
    status: "active",
    aliases: ["invite three honest conversations"],
  },
  {
    id: "node-quest-rhythm",
    type: "quest",
    label: "turn the messy loop into a rhythm",
    insight: QUEST_LIBRARY[2].insight,
    firstSourceThreadId: "thread-sample-rhythm",
    sourceThreadIds: ["thread-sample-rhythm"],
    archived: false,
    status: "active",
    aliases: ["turn the messy loop into a rhythm"],
  },
  {
    id: "node-skill-communication",
    type: "skill",
    label: "communication",
    insight: SKILL_LIBRARY[2].insight,
    firstSourceThreadId: "thread-sample-connect",
    sourceThreadIds: ["thread-sample-connect"],
    archived: false,
    status: "active",
    aliases: ["communication"],
  },
  {
    id: "node-skill-systems",
    type: "skill",
    label: "systems thinking",
    insight: SKILL_LIBRARY[1].insight,
    firstSourceThreadId: "thread-sample-rhythm",
    sourceThreadIds: ["thread-sample-rhythm"],
    archived: false,
    status: "active",
    aliases: ["systems thinking"],
  },
  {
    id: "node-skill-design",
    type: "skill",
    label: "design taste",
    insight: SKILL_LIBRARY[0].insight,
    firstSourceThreadId: "thread-sample-maker",
    sourceThreadIds: ["thread-sample-maker"],
    archived: false,
    status: "active",
    aliases: ["design taste"],
  },
  {
    id: "node-action-build",
    type: "action",
    label: "45 minute build sprint",
    insight: ACTION_LIBRARY[0].insight,
    firstSourceThreadId: "thread-sample-maker",
    sourceThreadIds: ["thread-sample-maker"],
    archived: false,
    status: "active",
    aliases: ["45 minute build sprint"],
  },
  {
    id: "node-action-message",
    type: "action",
    label: "send one honest message",
    insight: ACTION_LIBRARY[1].insight,
    firstSourceThreadId: "thread-sample-connect",
    sourceThreadIds: ["thread-sample-connect"],
    archived: false,
    status: "active",
    aliases: ["send one honest message"],
  },
  {
    id: "node-action-reflect",
    type: "action",
    label: "write a one-page reflection",
    insight: ACTION_LIBRARY[2].insight,
    firstSourceThreadId: "thread-sample-rhythm",
    sourceThreadIds: ["thread-sample-rhythm"],
    archived: false,
    status: "active",
    aliases: ["write a one-page reflection"],
  },
];

export const SAMPLE_TREE_EDGES: TreeEdge[] = [
  { id: "edge-sample-1", fromId: "node-interest-making", toId: "node-identity-builder", reason: "making feeds builder", crossThread: false, sourceThreadIds: ["thread-sample-maker"], status: "active" },
  { id: "edge-sample-2", fromId: "node-interest-people", toId: "node-identity-connector", reason: "people feed connector", crossThread: false, sourceThreadIds: ["thread-sample-connect"], status: "active" },
  { id: "edge-sample-3", fromId: "node-interest-rhythm", toId: "node-identity-architect", reason: "rituals feed architect", crossThread: false, sourceThreadIds: ["thread-sample-rhythm"], status: "active" },
  { id: "edge-sample-4", fromId: "node-identity-builder", toId: "node-self", reason: "builder belongs to the same self", crossThread: false, sourceThreadIds: ["thread-sample-maker"], status: "active" },
  { id: "edge-sample-5", fromId: "node-identity-connector", toId: "node-self", reason: "connector belongs to the same self", crossThread: false, sourceThreadIds: ["thread-sample-connect"], status: "active" },
  { id: "edge-sample-6", fromId: "node-identity-architect", toId: "node-self", reason: "architect belongs to the same self", crossThread: false, sourceThreadIds: ["thread-sample-rhythm"], status: "active" },
  { id: "edge-sample-7", fromId: "node-self", toId: "node-quest-prototype", reason: "the self is testing through small work", crossThread: false, sourceThreadIds: ["thread-sample-maker"], status: "active" },
  { id: "edge-sample-8", fromId: "node-self", toId: "node-quest-conversation", reason: "the self is learning in contact", crossThread: false, sourceThreadIds: ["thread-sample-connect"], status: "active" },
  { id: "edge-sample-9", fromId: "node-self", toId: "node-quest-rhythm", reason: "the self is looking for repeatability", crossThread: false, sourceThreadIds: ["thread-sample-rhythm"], status: "active" },
  { id: "edge-sample-10", fromId: "node-quest-prototype", toId: "node-skill-design", reason: "the quest depends on taste and craft", crossThread: false, sourceThreadIds: ["thread-sample-maker"], status: "active" },
  { id: "edge-sample-11", fromId: "node-quest-conversation", toId: "node-skill-communication", reason: "the quest depends on honest dialogue", crossThread: false, sourceThreadIds: ["thread-sample-connect"], status: "active" },
  { id: "edge-sample-12", fromId: "node-quest-rhythm", toId: "node-skill-systems", reason: "the quest depends on systems thinking", crossThread: false, sourceThreadIds: ["thread-sample-rhythm"], status: "active" },
  { id: "edge-sample-13", fromId: "node-skill-design", toId: "node-action-build", reason: "design gets trained in a build block", crossThread: false, sourceThreadIds: ["thread-sample-maker"], status: "active" },
  { id: "edge-sample-14", fromId: "node-skill-communication", toId: "node-action-message", reason: "communication gets trained in contact", crossThread: false, sourceThreadIds: ["thread-sample-connect"], status: "active" },
  { id: "edge-sample-15", fromId: "node-skill-systems", toId: "node-action-reflect", reason: "systems get stronger through review", crossThread: false, sourceThreadIds: ["thread-sample-rhythm"], status: "active" },
  { id: "edge-sample-16", fromId: "node-quest-prototype", toId: "node-quest-rhythm", reason: "shipping and rhythm strengthen each other", crossThread: true, sourceThreadIds: ["thread-sample-maker", "thread-sample-rhythm"], status: "active" },
];

export const SAMPLE_THREADS: Thread[] = [
  {
    id: "thread-sample-maker",
    kind: "quest",
    title: "making in public",
    topic: "turning ideas into small visible artifacts",
    emoji: "seed",
    color: THREAD_COLORS[0],
    archived: false,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-06T09:30:00.000Z",
    preview: "the builder branch gets stronger every time the work becomes touchable.",
    linkedNodeIds: ["node-interest-making", "node-identity-builder", "node-quest-prototype", "node-skill-design", "node-action-build"],
    messages: [],
  },
  {
    id: "thread-sample-connect",
    kind: "reflection",
    title: "listening in real time",
    topic: "letting other people reshape the path",
    emoji: "spark",
    color: THREAD_COLORS[1],
    archived: false,
    createdAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-05T15:00:00.000Z",
    preview: "the connector path starts moving whenever the work stays in dialogue.",
    linkedNodeIds: ["node-interest-people", "node-identity-connector", "node-quest-conversation", "node-skill-communication", "node-action-message"],
    messages: [],
  },
  {
    id: "thread-sample-rhythm",
    kind: "domain",
    title: "building the container",
    topic: "turning irregular effort into a rhythm that lasts",
    emoji: "path",
    color: THREAD_COLORS[2],
    archived: false,
    createdAt: "2026-03-03T11:00:00.000Z",
    updatedAt: "2026-03-07T08:00:00.000Z",
    preview: "the architect path appears when the loop stops depending on motivation alone.",
    linkedNodeIds: ["node-interest-rhythm", "node-identity-architect", "node-quest-rhythm", "node-skill-systems", "node-action-reflect"],
    messages: [],
  },
  {
    id: "thread-sample-core",
    kind: "exploration",
    title: "core reflection",
    topic: "the self these threads are all feeding",
    emoji: "field",
    color: THREAD_COLORS[3],
    archived: false,
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-07T08:00:00.000Z",
    preview: "the trunk is where the different identities stop competing and start belonging to one self.",
    linkedNodeIds: ["node-self"],
    messages: [],
  },
];

export const SAMPLE_TREE_SNAPSHOT: TreeSnapshot = {
  id: "snapshot-sample",
  createdAt: "2026-03-07T08:00:00.000Z",
  nodes: SAMPLE_TREE_NODES,
  edges: SAMPLE_TREE_EDGES,
  focusThreadId: null,
};

export const SAMPLE_INSIGHTS = [
  "what looks like scattered energy is already resolving into builder, connector, and architect paths.",
  "the strongest bridges are where one thread creates proof for another, not where everything stays in the same room.",
];

export const FIRST_TIME_CARDS: CheckInCard[] = [
  {
    id: "first-time-light",
    kind: "light",
    title: "start close to the ground",
    body: "we will begin with one quiet thread and let the tree form itself from there.",
    actionLabel: "start reflection",
  },
  {
    id: "first-time-open-tree",
    kind: "tree-prompted",
    title: "preview the tree logic",
    body: "interest leaves, identity fruit, branch quests, root skills, and soil actions all feed the same self.",
    actionLabel: "open tree",
  },
];

export const nowIso = () => new Date().toISOString();

export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

export const normalizeLabel = (value: string) => value.trim().toLowerCase();

export const trimSentence = (value: string, max = 180) => {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}...`;
};

export const toList = (items: string[]) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

export const defaultProfile = (): UserProfile => ({
  id: "guest-local",
  name: "",
  currentLandscape: "",
  doing: "",
  becoming: "",
});

export const buildThreadColor = (index: number) => THREAD_COLORS[index % THREAD_COLORS.length];
export const buildThreadEmoji = (index: number) => THREAD_EMOJIS[index % THREAD_EMOJIS.length];

export const createThread = ({
  title,
  topic,
  kind,
  index,
}: {
  title: string;
  topic: string;
  kind: ThreadKind;
  index: number;
}): Thread => ({
  id: createId("thread"),
  kind,
  title,
  topic,
  emoji: buildThreadEmoji(index),
  color: buildThreadColor(index),
  archived: false,
  createdAt: nowIso(),
  updatedAt: nowIso(),
  preview: "",
  linkedNodeIds: [],
  messages: [],
});

export const buildStarterThread = (index = 0): Thread => {
  const thread = createThread({
    title: "starting point",
    topic: "onboarding",
    kind: "reflection",
    index,
  });

  thread.messages = [
    {
      id: createId("msg"),
      role: "mirror",
      text: "let's start close to the ground. what name should i use for you as we begin?",
      createdAt: nowIso(),
      extraction: { message: "", nodes: [], edges: [] },
    },
  ];
  thread.preview = thread.messages[0].text;
  return thread;
};

export const createEmptyWorkspace = (): WorkspaceState => ({
  version: 3,
  view: "landing",
  activeThreadId: null,
  selectedNodeId: null,
  graphPreviewOpen: false,
  profile: defaultProfile(),
  hasCompletedOnboarding: false,
  accountMode: "local-preview",
  threads: [],
  tree: {
    id: "tree-local",
    nodes: [
      {
        id: "node-self",
        type: "self",
        label: "self",
        insight: "the trunk waits for the first threads to tell it what it is holding.",
        firstSourceThreadId: "thread-seed",
        sourceThreadIds: ["thread-seed"],
        archived: false,
        status: "active",
        aliases: ["self"],
      },
    ],
    edges: [],
    snapshots: [],
  },
  observations: [],
  checkInCards: FIRST_TIME_CARDS,
  treeCamera: { x: 0, y: 0, zoom: 1 },
  drafts: {},
  lastActiveAt: nowIso(),
});

export const createSeededWorkspace = (): WorkspaceState => {
  const workspace = createEmptyWorkspace();
  const starterThread = buildStarterThread(0);
  return {
    ...workspace,
    activeThreadId: starterThread.id,
    threads: [starterThread],
    drafts: { [starterThread.id]: "" },
  };
};

export const DEMO_WORKSPACE: WorkspaceState = {
  ...createEmptyWorkspace(),
  view: "landing",
  hasCompletedOnboarding: true,
  profile: {
    id: "demo-user",
    name: "you",
    currentLandscape: "the energy is real, but it still needs calmer rooms.",
    doing: "making small things, talking to people, and trying to turn it into a rhythm.",
    becoming: "a grounded builder who can also stay in conversation and structure.",
  },
  tree: {
    id: "tree-demo",
    nodes: SAMPLE_TREE_NODES,
    edges: SAMPLE_TREE_EDGES,
    snapshots: [SAMPLE_TREE_SNAPSHOT],
  },
  threads: SAMPLE_THREADS,
  activeThreadId: SAMPLE_THREADS[0].id,
};

export const emptyMirrorResponse = (): MirrorResponse => ({
  message: "",
  nodes: [],
  edges: [],
});

export const typeOrder: NodeType[] = ["interest", "identity", "self", "quest", "skill", "action"];
