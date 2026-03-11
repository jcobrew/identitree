import type {
  CheckInCard,
  DemoChapter,
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

export const THREAD_COLORS = ["#3658c5", "#91691a", "#0f766e", "#8f3d51", "#4b5563", "#1d4ed8", "#0f766e"];
export const THREAD_EMOJIS = ["seed", "spark", "path", "field", "trace", "loop", "arc"];

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

export const TRIBUTE_TREE_NODES: TreeNode[] = [
  {
    id: "node-tribute-self",
    type: "self",
    label: "self",
    insight: "the trunk holds the builder identity together while the quests, skills, and actions start proving it.",
    firstSourceThreadId: "thread-tribute-core",
    sourceThreadIds: [
      "thread-tribute-core",
      "thread-tribute-setup",
      "thread-tribute-start",
      "thread-tribute-one-liner",
      "thread-tribute-build",
      "thread-tribute-fix",
      "thread-tribute-ship",
    ],
    archived: false,
    status: "active",
    aliases: ["self"],
  },
  {
    id: "node-tribute-interest-making",
    type: "interest",
    label: "making things",
    insight: "this leaf is the urge to turn an idea into something touchable.",
    firstSourceThreadId: "thread-tribute-build",
    sourceThreadIds: ["thread-tribute-build"],
    archived: false,
    status: "active",
    aliases: ["making things"],
  },
  {
    id: "node-tribute-interest-learning",
    type: "interest",
    label: "learning by doing",
    insight: "this leaf is what keeps the person moving before they feel fully ready.",
    firstSourceThreadId: "thread-tribute-start",
    sourceThreadIds: ["thread-tribute-start", "thread-tribute-setup"],
    archived: false,
    status: "active",
    aliases: ["learning by doing"],
  },
  {
    id: "node-tribute-interest-sharing",
    type: "interest",
    label: "sharing work",
    insight: "this leaf keeps the build loop pointed toward real people instead of private perfection.",
    firstSourceThreadId: "thread-tribute-ship",
    sourceThreadIds: ["thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["sharing work"],
  },
  {
    id: "node-tribute-identity-builder",
    type: "identity",
    label: "builder",
    insight: "the builder identity forms through repeated proof, not through claiming the title in advance.",
    firstSourceThreadId: "thread-tribute-start",
    sourceThreadIds: [
      "thread-tribute-start",
      "thread-tribute-one-liner",
      "thread-tribute-build",
      "thread-tribute-fix",
      "thread-tribute-ship",
    ],
    archived: false,
    status: "active",
    aliases: ["builder"],
  },
  {
    id: "node-tribute-quest-setup",
    type: "quest",
    label: "install and set up",
    insight: "this branch is where the environment becomes ready enough for momentum to start.",
    firstSourceThreadId: "thread-tribute-setup",
    sourceThreadIds: ["thread-tribute-setup"],
    archived: false,
    status: "active",
    aliases: ["install and set up"],
  },
  {
    id: "node-tribute-quest-chat",
    type: "quest",
    label: "build through chat",
    insight: "this branch grows when honest words get translated into visible changes with codex.",
    firstSourceThreadId: "thread-tribute-start",
    sourceThreadIds: ["thread-tribute-start", "thread-tribute-one-liner", "thread-tribute-build"],
    archived: false,
    status: "active",
    aliases: ["build through chat"],
  },
  {
    id: "node-tribute-quest-fix",
    type: "quest",
    label: "fix what breaks",
    insight: "this branch matters because becoming a builder includes staying with friction instead of bouncing away from it.",
    firstSourceThreadId: "thread-tribute-fix",
    sourceThreadIds: ["thread-tribute-fix"],
    archived: false,
    status: "active",
    aliases: ["fix what breaks"],
  },
  {
    id: "node-tribute-quest-deploy",
    type: "quest",
    label: "ship and deploy",
    insight: "this branch closes the loop by putting the work on the internet where another person can actually see it.",
    firstSourceThreadId: "thread-tribute-ship",
    sourceThreadIds: ["thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["ship and deploy"],
  },
  {
    id: "node-tribute-quest-share",
    type: "quest",
    label: "share it with someone",
    insight: "this branch turns a private milestone into a witnessed one, which is part of what makes the identity feel real.",
    firstSourceThreadId: "thread-tribute-ship",
    sourceThreadIds: ["thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["share it with someone"],
  },
  {
    id: "node-tribute-skill-prompt",
    type: "skill",
    label: "prompt engineering",
    insight: "this root grows when the user learns how to describe what they want clearly enough for codex to act on it.",
    firstSourceThreadId: "thread-tribute-build",
    sourceThreadIds: ["thread-tribute-build"],
    archived: false,
    status: "active",
    aliases: ["prompt engineering"],
  },
  {
    id: "node-tribute-skill-scope",
    type: "skill",
    label: "scoping",
    insight: "this root grows when the vague dream gets cut down into one buildable next step.",
    firstSourceThreadId: "thread-tribute-one-liner",
    sourceThreadIds: ["thread-tribute-setup", "thread-tribute-one-liner"],
    archived: false,
    status: "active",
    aliases: ["scoping"],
  },
  {
    id: "node-tribute-skill-taste",
    type: "skill",
    label: "interface taste",
    insight: "this root grows when the person keeps shaping what feels clearer, calmer, and more intentional on screen.",
    firstSourceThreadId: "thread-tribute-fix",
    sourceThreadIds: ["thread-tribute-build", "thread-tribute-fix"],
    archived: false,
    status: "active",
    aliases: ["interface taste"],
  },
  {
    id: "node-tribute-skill-debugging",
    type: "skill",
    label: "debugging",
    insight: "this root grows when problems become something to trace and repair instead of a reason to stop.",
    firstSourceThreadId: "thread-tribute-fix",
    sourceThreadIds: ["thread-tribute-fix"],
    archived: false,
    status: "active",
    aliases: ["debugging"],
  },
  {
    id: "node-tribute-skill-communication",
    type: "skill",
    label: "communication",
    insight: "this root grows when the user tells the truth, asks for what they want, and puts the finished link in front of another person.",
    firstSourceThreadId: "thread-tribute-start",
    sourceThreadIds: ["thread-tribute-start", "thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["communication"],
  },
  {
    id: "node-tribute-skill-shipping",
    type: "skill",
    label: "shipping",
    insight: "this root grows when the loop ends with a real release instead of endless hidden edits.",
    firstSourceThreadId: "thread-tribute-ship",
    sourceThreadIds: ["thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["shipping"],
  },
  {
    id: "node-tribute-action-honest",
    type: "action",
    label: "answer honestly",
    insight: "this action opens the whole loop because codex can only help shape what is actually true.",
    firstSourceThreadId: "thread-tribute-start",
    sourceThreadIds: ["thread-tribute-start"],
    archived: false,
    status: "active",
    aliases: ["answer honestly"],
  },
  {
    id: "node-tribute-action-one-line",
    type: "action",
    label: "say the idea in one line",
    insight: "this action turns scattered excitement into something codex can help build right away.",
    firstSourceThreadId: "thread-tribute-one-liner",
    sourceThreadIds: ["thread-tribute-one-liner"],
    archived: false,
    status: "active",
    aliases: ["say the idea in one line"],
  },
  {
    id: "node-tribute-action-browser",
    type: "action",
    label: "react to what you see",
    insight: "this action keeps the build loop grounded in visible feedback instead of theory.",
    firstSourceThreadId: "thread-tribute-build",
    sourceThreadIds: ["thread-tribute-build"],
    archived: false,
    status: "active",
    aliases: ["react to what you see"],
  },
  {
    id: "node-tribute-action-help",
    type: "action",
    label: "ask for help",
    insight: "this action turns confusion into movement and makes the tool feel collaborative instead of opaque.",
    firstSourceThreadId: "thread-tribute-setup",
    sourceThreadIds: ["thread-tribute-setup", "thread-tribute-fix"],
    archived: false,
    status: "active",
    aliases: ["ask for help"],
  },
  {
    id: "node-tribute-action-check",
    type: "action",
    label: "run a check",
    insight: "this action makes the invisible health of the build legible enough to trust.",
    firstSourceThreadId: "thread-tribute-fix",
    sourceThreadIds: ["thread-tribute-fix"],
    archived: false,
    status: "active",
    aliases: ["run a check"],
  },
  {
    id: "node-tribute-action-link",
    type: "action",
    label: "send the link",
    insight: "this action is where the build stops being private and becomes something another person can witness.",
    firstSourceThreadId: "thread-tribute-ship",
    sourceThreadIds: ["thread-tribute-ship"],
    archived: false,
    status: "active",
    aliases: ["send the link"],
  },
];

export const TRIBUTE_TREE_EDGES: TreeEdge[] = [
  { id: "edge-tribute-1", fromId: "node-tribute-interest-making", toId: "node-tribute-identity-builder", reason: "making things feeds the builder identity", crossThread: false, sourceThreadIds: ["thread-tribute-build"], status: "active" },
  { id: "edge-tribute-2", fromId: "node-tribute-interest-learning", toId: "node-tribute-identity-builder", reason: "learning by doing keeps the builder path moving", crossThread: false, sourceThreadIds: ["thread-tribute-start"], status: "active" },
  { id: "edge-tribute-3", fromId: "node-tribute-interest-sharing", toId: "node-tribute-identity-builder", reason: "sharing work hardens the builder identity into something real", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-4", fromId: "node-tribute-identity-builder", toId: "node-tribute-self", reason: "builder belongs to the same self", crossThread: false, sourceThreadIds: ["thread-tribute-start"], status: "active" },
  { id: "edge-tribute-5", fromId: "node-tribute-self", toId: "node-tribute-quest-setup", reason: "the self starts by making the ground ready", crossThread: false, sourceThreadIds: ["thread-tribute-setup"], status: "active" },
  { id: "edge-tribute-6", fromId: "node-tribute-self", toId: "node-tribute-quest-chat", reason: "the self learns to build by staying in conversation with codex", crossThread: false, sourceThreadIds: ["thread-tribute-start", "thread-tribute-build"], status: "active" },
  { id: "edge-tribute-7", fromId: "node-tribute-self", toId: "node-tribute-quest-fix", reason: "the self becomes more real when it stays with the broken parts", crossThread: false, sourceThreadIds: ["thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-8", fromId: "node-tribute-self", toId: "node-tribute-quest-deploy", reason: "the self closes the loop by shipping the work", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-9", fromId: "node-tribute-self", toId: "node-tribute-quest-share", reason: "the self learns to let the work be seen", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-10", fromId: "node-tribute-quest-setup", toId: "node-tribute-skill-scope", reason: "setup teaches the value of a smaller, clearer starting surface", crossThread: false, sourceThreadIds: ["thread-tribute-setup"], status: "active" },
  { id: "edge-tribute-11", fromId: "node-tribute-quest-chat", toId: "node-tribute-skill-communication", reason: "building through chat depends on telling the truth well", crossThread: false, sourceThreadIds: ["thread-tribute-start"], status: "active" },
  { id: "edge-tribute-12", fromId: "node-tribute-quest-chat", toId: "node-tribute-skill-scope", reason: "the one-liner tightens the build into something codex can move on", crossThread: true, sourceThreadIds: ["thread-tribute-start", "thread-tribute-one-liner"], status: "active" },
  { id: "edge-tribute-13", fromId: "node-tribute-quest-chat", toId: "node-tribute-skill-prompt", reason: "clear requests turn conversation into working code", crossThread: false, sourceThreadIds: ["thread-tribute-build"], status: "active" },
  { id: "edge-tribute-14", fromId: "node-tribute-quest-chat", toId: "node-tribute-skill-taste", reason: "the first screen sharpens a sense for what feels clearer on screen", crossThread: true, sourceThreadIds: ["thread-tribute-build", "thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-15", fromId: "node-tribute-quest-fix", toId: "node-tribute-skill-debugging", reason: "fixing what breaks grows the debugging root directly", crossThread: false, sourceThreadIds: ["thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-16", fromId: "node-tribute-quest-fix", toId: "node-tribute-skill-taste", reason: "refinement sharpens interface taste, not only correctness", crossThread: false, sourceThreadIds: ["thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-17", fromId: "node-tribute-quest-deploy", toId: "node-tribute-skill-shipping", reason: "deployment trains the shipping muscle", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-18", fromId: "node-tribute-quest-share", toId: "node-tribute-skill-communication", reason: "sharing the link makes the communication root visible again", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-19", fromId: "node-tribute-skill-communication", toId: "node-tribute-action-honest", reason: "communication starts by answering honestly", crossThread: false, sourceThreadIds: ["thread-tribute-start"], status: "active" },
  { id: "edge-tribute-20", fromId: "node-tribute-skill-scope", toId: "node-tribute-action-one-line", reason: "scoping gets trained by saying the idea in one line", crossThread: false, sourceThreadIds: ["thread-tribute-one-liner"], status: "active" },
  { id: "edge-tribute-21", fromId: "node-tribute-skill-prompt", toId: "node-tribute-action-browser", reason: "prompt engineering improves when the person reacts to what appears in the browser", crossThread: false, sourceThreadIds: ["thread-tribute-build"], status: "active" },
  { id: "edge-tribute-22", fromId: "node-tribute-skill-taste", toId: "node-tribute-action-browser", reason: "interface taste grows through visible iteration", crossThread: true, sourceThreadIds: ["thread-tribute-build", "thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-23", fromId: "node-tribute-skill-debugging", toId: "node-tribute-action-check", reason: "debugging gets stronger when the person runs a real check", crossThread: false, sourceThreadIds: ["thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-24", fromId: "node-tribute-skill-debugging", toId: "node-tribute-action-help", reason: "asking for help is part of debugging, not a failure of it", crossThread: true, sourceThreadIds: ["thread-tribute-setup", "thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-25", fromId: "node-tribute-skill-shipping", toId: "node-tribute-action-link", reason: "shipping becomes real when the link actually gets sent", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
  { id: "edge-tribute-26", fromId: "node-tribute-quest-chat", toId: "node-tribute-quest-fix", reason: "building through chat and fixing what breaks strengthen each other", crossThread: true, sourceThreadIds: ["thread-tribute-build", "thread-tribute-fix"], status: "active" },
  { id: "edge-tribute-27", fromId: "node-tribute-quest-deploy", toId: "node-tribute-quest-share", reason: "shipping matters more once another person can open the link", crossThread: false, sourceThreadIds: ["thread-tribute-ship"], status: "active" },
];

export const TRIBUTE_THREADS: Thread[] = [
  {
    id: "thread-tribute-setup",
    kind: "quest",
    title: "setting the ground",
    topic: "installing codex and getting the tool loop ready",
    emoji: "seed",
    color: THREAD_COLORS[0],
    archived: false,
    createdAt: "2026-03-01T08:00:00.000Z",
    updatedAt: "2026-03-01T08:30:00.000Z",
    preview: "install and set up is the first quest because the builder path needs a working surface before it needs confidence.",
    linkedNodeIds: ["node-tribute-quest-setup", "node-tribute-skill-scope", "node-tribute-action-help"],
    messages: [],
  },
  {
    id: "thread-tribute-start",
    kind: "reflection",
    title: "telling codex what matters",
    topic: "meeting codex and answering honestly",
    emoji: "spark",
    color: THREAD_COLORS[1],
    archived: false,
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T09:45:00.000Z",
    preview: "the builder path starts when the person says what they actually want to make instead of waiting to feel ready.",
    linkedNodeIds: ["node-tribute-quest-chat", "node-tribute-skill-communication", "node-tribute-action-honest", "node-tribute-identity-builder"],
    messages: [],
  },
  {
    id: "thread-tribute-one-liner",
    kind: "exploration",
    title: "locking the one-liner",
    topic: "turning the idea into one clear sentence",
    emoji: "path",
    color: THREAD_COLORS[2],
    archived: false,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:20:00.000Z",
    preview: "the one-liner is where excitement becomes scope, and scope is what lets the first screen happen.",
    linkedNodeIds: ["node-tribute-quest-chat", "node-tribute-skill-scope", "node-tribute-action-one-line"],
    messages: [],
  },
  {
    id: "thread-tribute-build",
    kind: "quest",
    title: "building the first screen",
    topic: "watching codex turn words into a visible first version",
    emoji: "field",
    color: THREAD_COLORS[3],
    archived: false,
    createdAt: "2026-03-01T11:00:00.000Z",
    updatedAt: "2026-03-01T12:00:00.000Z",
    preview: "build through chat is where prompt engineering stops being abstract and starts producing visible proof.",
    linkedNodeIds: ["node-tribute-interest-making", "node-tribute-quest-chat", "node-tribute-skill-prompt", "node-tribute-action-browser"],
    messages: [],
  },
  {
    id: "thread-tribute-fix",
    kind: "quest",
    title: "tightening the loop",
    topic: "using $fixit, debugging, and refining the interface",
    emoji: "trace",
    color: THREAD_COLORS[4],
    archived: false,
    createdAt: "2026-03-01T13:00:00.000Z",
    updatedAt: "2026-03-01T14:10:00.000Z",
    preview: "the builder identity gets sturdier when the person learns to stay with broken parts and shape them into something clearer.",
    linkedNodeIds: ["node-tribute-quest-fix", "node-tribute-skill-debugging", "node-tribute-skill-taste", "node-tribute-action-check"],
    messages: [],
  },
  {
    id: "thread-tribute-ship",
    kind: "quest",
    title: "putting it on the internet",
    topic: "running $deploy and sharing the link with a real person",
    emoji: "loop",
    color: THREAD_COLORS[5],
    archived: false,
    createdAt: "2026-03-01T15:00:00.000Z",
    updatedAt: "2026-03-01T16:00:00.000Z",
    preview: "shipping is where the builder path stops being potential and becomes something witnessed.",
    linkedNodeIds: ["node-tribute-interest-sharing", "node-tribute-quest-deploy", "node-tribute-quest-share", "node-tribute-skill-shipping", "node-tribute-action-link"],
    messages: [],
  },
  {
    id: "thread-tribute-core",
    kind: "domain",
    title: "becoming a builder",
    topic: "how the quests, skills, and actions resolve into one living identity",
    emoji: "arc",
    color: THREAD_COLORS[6],
    archived: false,
    createdAt: "2026-03-01T07:30:00.000Z",
    updatedAt: "2026-03-01T16:00:00.000Z",
    preview: "the builder identity is what the whole make something loop is quietly training underneath the surface.",
    linkedNodeIds: ["node-tribute-self", "node-tribute-identity-builder"],
    messages: [],
  },
];

export const TRIBUTE_TREE_SNAPSHOT: TreeSnapshot = {
  id: "snapshot-tribute",
  createdAt: "2026-03-01T16:00:00.000Z",
  nodes: TRIBUTE_TREE_NODES,
  edges: TRIBUTE_TREE_EDGES,
  focusThreadId: null,
};

export const TRIBUTE_INSIGHTS = [
  "make something turns the vague wish to be a builder into a sequence of real quests, which is exactly why identitree can show it so clearly.",
  "the strongest movement in the tribute tree is the path from honest prompting to visible proof to shipping, because that is where the builder identity stops being hypothetical.",
];

export const TRIBUTE_DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: "setup",
    title: "install and set up",
    body: "the first move in make something is getting codex ready so the person can stop circling and begin. the quest looks small, but it creates the ground every later build step stands on.",
    treeNote: "the trunk sends its first energy into the install and set up branch, then down into the scoping root and the action of asking for help when the setup feels unclear.",
    skillLabel: "scoping",
    skillNote: "even setup trains scoping, because the framework starts with the smallest working loop instead of chasing a perfect grand plan.",
    questLabel: "install and set up",
    questNote: "this quest is complete when the toolchain is ready enough for a real first conversation with codex.",
    focusNodeIds: ["node-tribute-quest-setup", "node-tribute-skill-scope", "node-tribute-action-help"],
    focusEdgeIds: ["edge-tribute-5", "edge-tribute-10", "edge-tribute-24"],
    camera: { x: 36, y: -12, zoom: 1.02 },
  },
  {
    id: "meet-codex",
    title: "meet codex and say what you want to build",
    body: "make something does not start with technical performance. it starts with a human conversation, because the fastest path into building is telling the truth about what you want and where you are.",
    treeNote: "the build through chat branch lights up through the communication root. the action at the bottom is answer honestly, because that is what gives the tree real material to work with.",
    skillLabel: "communication",
    skillNote: "communication is being trained here because the user is learning to describe desire, confusion, and direction clearly enough for a collaborator to help.",
    questLabel: "build through chat",
    questNote: "the quest begins the moment the conversation stops being abstract and starts shaping an actual build path.",
    focusNodeIds: ["node-tribute-identity-builder", "node-tribute-quest-chat", "node-tribute-skill-communication", "node-tribute-action-honest"],
    focusEdgeIds: ["edge-tribute-4", "edge-tribute-6", "edge-tribute-11", "edge-tribute-19"],
    camera: { x: -26, y: 12, zoom: 1.08 },
  },
  {
    id: "one-liner",
    title: "lock the one-liner",
    body: "the one-liner matters in make something because clarity is what lets codex move fast. saying the build in one sentence turns scattered excitement into something the tree can route cleanly.",
    treeNote: "the same build through chat branch now feeds more deeply into scoping. the action say the idea in one line becomes the point where the branch stops wobbling.",
    skillLabel: "scoping",
    skillNote: "the root is growing because the user is learning how to cut an idea down to one buildable loop without losing the energy inside it.",
    questLabel: "build through chat",
    questNote: "this part of the quest is complete when the project is clear enough that codex can begin building a real first screen.",
    focusNodeIds: ["node-tribute-quest-chat", "node-tribute-skill-scope", "node-tribute-action-one-line"],
    focusEdgeIds: ["edge-tribute-12", "edge-tribute-20"],
    camera: { x: 0, y: 28, zoom: 1.14 },
  },
  {
    id: "first-screen",
    title: "build the first visible screen through chat",
    body: "now the builder path gets visible. the person describes what they want, codex makes the first pass, and the browser becomes part of the conversation.",
    treeNote: "making things feeds the builder fruit more brightly now. the build through chat branch pushes into prompt engineering and the action react to what you see.",
    skillLabel: "prompt engineering",
    skillNote: "this root grows because the user is learning that better prompts come from reacting to what the browser actually shows, not from trying to sound technical.",
    questLabel: "build through chat",
    questNote: "this quest gains proof when the first screen exists and can be looked at, judged, and improved in real time.",
    focusNodeIds: ["node-tribute-interest-making", "node-tribute-identity-builder", "node-tribute-quest-chat", "node-tribute-skill-prompt", "node-tribute-action-browser"],
    focusEdgeIds: ["edge-tribute-1", "edge-tribute-13", "edge-tribute-21"],
    camera: { x: -88, y: 2, zoom: 1.16 },
  },
  {
    id: "fix-loop",
    title: "fix what breaks and add a couple features",
    body: "make something keeps the loop honest by giving the user $fixit and by nudging visible iteration. broken pieces are not proof that they are not a builder; staying with them is part of what builds the identity.",
    treeNote: "the tree forks into the fix what breaks branch. debugging lights up hard, and interface taste joins it because refinement is also part of learning how to build.",
    skillLabel: "debugging",
    skillNote: "debugging grows here because the user learns to trace what is wrong, translate it into plain language, and keep moving instead of freezing.",
    questLabel: "fix what breaks",
    questNote: "the quest advances when the user can keep the loop going through friction and turn rough output into something cleaner and more trustworthy.",
    focusNodeIds: ["node-tribute-quest-fix", "node-tribute-skill-debugging", "node-tribute-skill-taste", "node-tribute-action-check", "node-tribute-action-help"],
    focusEdgeIds: ["edge-tribute-15", "edge-tribute-16", "edge-tribute-23", "edge-tribute-24", "edge-tribute-26"],
    camera: { x: 96, y: 8, zoom: 1.16 },
  },
  {
    id: "ship-share",
    title: "ship, deploy, and share",
    body: "the final make something move is not hidden polish. it is $deploy, a real link, and sending that link to another person. that is the moment the builder identity becomes witnessed instead of private.",
    treeNote: "the ship and deploy branch and the share it with someone branch glow together. the shipping and communication roots both feed the action send the link.",
    skillLabel: "shipping",
    skillNote: "shipping grows here because the user learns that done and shared beats perfect and hidden, especially at the beginning.",
    questLabel: "ship and deploy",
    questNote: "the quest resolves when the work is online and the link has somewhere real to go, which is why sharing becomes its own visible branch.",
    focusNodeIds: ["node-tribute-interest-sharing", "node-tribute-identity-builder", "node-tribute-quest-deploy", "node-tribute-quest-share", "node-tribute-skill-shipping", "node-tribute-skill-communication", "node-tribute-action-link"],
    focusEdgeIds: ["edge-tribute-3", "edge-tribute-17", "edge-tribute-18", "edge-tribute-25", "edge-tribute-27"],
    camera: { x: 8, y: -20, zoom: 1.08 },
  },
];

export const FIRST_TIME_CARDS: CheckInCard[] = [
  {
    id: "first-time-light",
    kind: "light",
    title: "start your own reflection",
    body: "begin with one honest thread and let your own tree form itself from there.",
    actionLabel: "start reflection",
  },
  {
    id: "first-time-builder-journey",
    kind: "tree-prompted",
    title: "see the builder journey",
    body: "walk through how make something turns setup, chat-building, fixing, and shipping into a builder identity.",
    actionLabel: "see builder journey",
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

const cloneNodes = (nodes: TreeNode[]) => nodes.map((node) => ({ ...node, sourceThreadIds: [...node.sourceThreadIds], aliases: [...node.aliases] }));
const cloneEdges = (edges: TreeEdge[]) => edges.map((edge) => ({ ...edge, sourceThreadIds: [...edge.sourceThreadIds] }));
const cloneThreads = (threads: Thread[]) =>
  threads.map((thread) => ({
    ...thread,
    linkedNodeIds: [...thread.linkedNodeIds],
    messages: thread.messages.map((message) => ({
      ...message,
      extraction: message.extraction
        ? {
            message: message.extraction.message,
            nodes: message.extraction.nodes.map((node) => ({ ...node })),
            edges: message.extraction.edges.map((edge) => ({ ...edge })),
          }
        : message.extraction ?? null,
    })),
  }));
const cloneSnapshot = (snapshot: TreeSnapshot): TreeSnapshot => ({
  ...snapshot,
  nodes: cloneNodes(snapshot.nodes),
  edges: cloneEdges(snapshot.edges),
});

export const createEmptyWorkspace = (): WorkspaceState => ({
  version: 3,
  view: "landing",
  hasSeenTributeDemo: false,
  activeThreadId: null,
  selectedNodeId: null,
  graphPreviewOpen: false,
  starterMode: null,
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
    view: "tribute",
    activeThreadId: starterThread.id,
    threads: [starterThread],
    drafts: { [starterThread.id]: "" },
  };
};

export const createFreshWorkspaceFromTribute = (): WorkspaceState => ({
  ...createSeededWorkspace(),
  view: "thread",
  hasSeenTributeDemo: true,
  starterMode: "fresh",
});

export const createBuilderStarterWorkspace = (): WorkspaceState => {
  const threadId = createId("thread");
  const starterThread: Thread = {
    id: threadId,
    kind: "quest",
    title: "builder starting point",
    topic: "using the make something builder path as a scaffold, not a cage",
    emoji: buildThreadEmoji(0),
    color: buildThreadColor(0),
    archived: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    preview: "we can use the builder journey as a starting shape. which part already feels true for you, and which part is still only a guess?",
    linkedNodeIds: [
      "node-builder-identity",
      "node-builder-quest-chat",
      "node-builder-quest-fix",
      "node-builder-quest-deploy",
      "node-builder-skill-prompt",
      "node-builder-skill-debugging",
      "node-builder-skill-shipping",
    ],
    messages: [
      {
        id: createId("msg"),
        role: "mirror",
        text: "we can use the make something builder path as a starting shape, not a fixed identity. which part already feels true for you, and which part is still only a guess?",
        createdAt: nowIso(),
        extraction: null,
      },
    ],
  };

  const nodes: TreeNode[] = [
    {
      id: "node-self",
      type: "self",
      label: "self",
      insight: "the trunk is ready to hold a personal builder path, but none of these branches are locked yet.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "active",
      aliases: ["self"],
    },
    {
      id: "node-builder-interest-making",
      type: "interest",
      label: "making things",
      insight: "this leaf is here because the user likely wants to learn by producing something visible.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["making things"],
    },
    {
      id: "node-builder-interest-learning",
      type: "interest",
      label: "learning by doing",
      insight: "this leaf is a starter guess that the user wants motion more than passive prep.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["learning by doing"],
    },
    {
      id: "node-builder-interest-sharing",
      type: "interest",
      label: "sharing work",
      insight: "this leaf stays suggested until the user decides whether being seen is part of their path yet.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["sharing work"],
    },
    {
      id: "node-builder-identity",
      type: "identity",
      label: "builder",
      insight: "this fruit is only a scaffold for now. the user gets to prove, rename, or discard it through real reflection.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["builder"],
    },
    {
      id: "node-builder-quest-chat",
      type: "quest",
      label: "build through chat",
      insight: "this branch is seeded because the tribute showed how conversation with codex can turn into a real first screen.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["build through chat"],
    },
    {
      id: "node-builder-quest-fix",
      type: "quest",
      label: "fix what breaks",
      insight: "this branch is seeded because debugging is part of becoming a builder, not a detour away from it.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["fix what breaks"],
    },
    {
      id: "node-builder-quest-deploy",
      type: "quest",
      label: "ship and deploy",
      insight: "this branch stays here as an invitation to end the loop with something shared, not hidden.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["ship and deploy"],
    },
    {
      id: "node-builder-skill-prompt",
      type: "skill",
      label: "prompt engineering",
      insight: "this root is suggested because clearer prompts are usually part of the builder path in identitree.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["prompt engineering"],
    },
    {
      id: "node-builder-skill-taste",
      type: "skill",
      label: "interface taste",
      insight: "this root is seeded so the user can decide whether visual clarity matters to the path they want to grow.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["interface taste"],
    },
    {
      id: "node-builder-skill-debugging",
      type: "skill",
      label: "debugging",
      insight: "this root stays visible so friction reads as part of the path, not as evidence against it.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["debugging"],
    },
    {
      id: "node-builder-skill-shipping",
      type: "skill",
      label: "shipping",
      insight: "this root is suggested because the tribute showed that the builder identity gets stronger when the loop closes publicly.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["shipping"],
    },
    {
      id: "node-builder-action-one-line",
      type: "action",
      label: "say the idea in one line",
      insight: "this action keeps the starter scaffold grounded in one real next move.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["say the idea in one line"],
    },
    {
      id: "node-builder-action-browser",
      type: "action",
      label: "react to what you see",
      insight: "this action keeps the path honest by moving from visible output instead of abstract speculation.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["react to what you see"],
    },
    {
      id: "node-builder-action-check",
      type: "action",
      label: "run a check",
      insight: "this action gives the user one grounded way to stay with friction when something breaks.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["run a check"],
    },
    {
      id: "node-builder-action-link",
      type: "action",
      label: "send the link",
      insight: "this action stays suggested until the user decides they are ready to let someone else witness the build.",
      firstSourceThreadId: starterThread.id,
      sourceThreadIds: [starterThread.id],
      archived: false,
      status: "suggested",
      aliases: ["send the link"],
    },
  ];

  const edges: TreeEdge[] = [
    { id: "edge-builder-1", fromId: "node-builder-interest-making", toId: "node-builder-identity", reason: "making things could be feeding the builder identity", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-2", fromId: "node-builder-interest-learning", toId: "node-builder-identity", reason: "learning by doing could be feeding the builder identity", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-3", fromId: "node-builder-interest-sharing", toId: "node-builder-identity", reason: "sharing work might become part of the builder identity later", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-4", fromId: "node-builder-identity", toId: "node-self", reason: "builder could be one fruit growing from this self", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-5", fromId: "node-self", toId: "node-builder-quest-chat", reason: "the self may want to learn by building through chat", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-6", fromId: "node-self", toId: "node-builder-quest-fix", reason: "the self may need to grow through fixing what breaks", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-7", fromId: "node-self", toId: "node-builder-quest-deploy", reason: "the self may want to complete the loop by shipping and deploying", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-8", fromId: "node-builder-quest-chat", toId: "node-builder-skill-prompt", reason: "build through chat could train prompt engineering", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-9", fromId: "node-builder-quest-chat", toId: "node-builder-skill-taste", reason: "build through chat could also sharpen interface taste", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-10", fromId: "node-builder-quest-fix", toId: "node-builder-skill-debugging", reason: "fix what breaks could train debugging", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-11", fromId: "node-builder-quest-deploy", toId: "node-builder-skill-shipping", reason: "ship and deploy could train shipping", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-12", fromId: "node-builder-skill-prompt", toId: "node-builder-action-one-line", reason: "prompt engineering starts with saying the idea in one line", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-13", fromId: "node-builder-skill-taste", toId: "node-builder-action-browser", reason: "interface taste gets clearer by reacting to what you see", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-14", fromId: "node-builder-skill-debugging", toId: "node-builder-action-check", reason: "debugging can start with one real check", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
    { id: "edge-builder-15", fromId: "node-builder-skill-shipping", toId: "node-builder-action-link", reason: "shipping becomes real when the link gets sent", crossThread: false, sourceThreadIds: [starterThread.id], status: "suggested" },
  ];

  const snapshot: TreeSnapshot = {
    id: createId("snapshot"),
    createdAt: nowIso(),
    nodes: cloneNodes(nodes),
    edges: cloneEdges(edges),
    focusThreadId: starterThread.id,
  };

  return {
    version: 3,
    view: "thread",
    hasSeenTributeDemo: true,
    activeThreadId: starterThread.id,
    selectedNodeId: "node-builder-identity",
    graphPreviewOpen: false,
    starterMode: "builder",
    profile: {
      id: "guest-local",
      name: "",
      currentLandscape: "starting from the builder path shown in the tribute",
      doing: "using the scaffold to figure out which parts already feel true",
      becoming: "a builder whose proof comes from real shipped loops",
    },
    hasCompletedOnboarding: true,
    accountMode: "local-preview",
    threads: [starterThread],
    tree: {
      id: "tree-builder-starter",
      nodes,
      edges,
      snapshots: [snapshot],
    },
    observations: [
      {
        id: createId("obs"),
        kind: "pattern",
        title: "builder scaffold is in place",
        body: "these starter branches came from the make something tribute. keep what fits, rename what doesn't, and let the proof change the shape.",
        threadIds: [starterThread.id],
        nodeIds: ["node-builder-identity", "node-builder-quest-chat", "node-builder-quest-deploy"],
        createdAt: nowIso(),
      },
    ],
    checkInCards: [],
    treeCamera: { x: 0, y: 0, zoom: 1 },
    drafts: { [starterThread.id]: "" },
    lastActiveAt: nowIso(),
  };
};

export const TRIBUTE_DEMO_WORKSPACE: WorkspaceState = {
  ...createEmptyWorkspace(),
  view: "tribute",
  hasSeenTributeDemo: false,
  hasCompletedOnboarding: true,
  profile: {
    id: "demo-user",
    name: "you",
    currentLandscape: "i'm excited, but i haven't built anything end to end on my own yet.",
    doing: "following the make something flow with codex, one visible step at a time.",
    becoming: "a builder whose confidence comes from small shipped loops.",
  },
  tree: {
    id: "tree-tribute",
    nodes: cloneNodes(TRIBUTE_TREE_NODES),
    edges: cloneEdges(TRIBUTE_TREE_EDGES),
    snapshots: [cloneSnapshot(TRIBUTE_TREE_SNAPSHOT)],
  },
  threads: cloneThreads(TRIBUTE_THREADS),
  activeThreadId: "thread-tribute-build",
  checkInCards: FIRST_TIME_CARDS,
};

export const emptyMirrorResponse = (): MirrorResponse => ({
  message: "",
  nodes: [],
  edges: [],
});

export const typeOrder: NodeType[] = ["interest", "identity", "self", "quest", "skill", "action"];

export const SAMPLE_TREE_NODES = TRIBUTE_TREE_NODES;
export const SAMPLE_TREE_EDGES = TRIBUTE_TREE_EDGES;
export const SAMPLE_THREADS = TRIBUTE_THREADS;
export const SAMPLE_TREE_SNAPSHOT = TRIBUTE_TREE_SNAPSHOT;
export const SAMPLE_INSIGHTS = TRIBUTE_INSIGHTS;
export const DEMO_WORKSPACE = TRIBUTE_DEMO_WORKSPACE;
