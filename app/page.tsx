"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Progress,
  Textarea,
} from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

type NodeType = "self" | "identity" | "quest" | "activity" | "skill";

type Point = {
  x: number;
  y: number;
};

type IdentityFruit = {
  id: string;
  short: string;
  name: string;
  fruit: string;
  x: number;
  y: number;
  summary: string;
  questIds: string[];
  tone: string;
  traceColor: string;
};

type QuestNode = {
  id: string;
  short: string;
  name: string;
  x: number;
  y: number;
  xp: number;
  summary: string;
  activityIds: string[];
  identityIds: string[];
};

type ActivityNode = {
  id: string;
  short: string;
  name: string;
  x: number;
  y: number;
  summary: string;
  skillIds: string[];
};

type SkillNode = {
  id: string;
  short: string;
  name: string;
  x: number;
  y: number;
  summary: string;
};

type TreeState = {
  completedQuests: string[];
  practicedActivities: string[];
  trainedSkills: string[];
};

type IdentityTrace = {
  identityId: string;
  color: string;
  questIds: Set<string>;
  activityIds: Set<string>;
  skillIds: Set<string>;
};

type PathLink = {
  key: string;
  d: string;
};

type IdentitySelfLink = PathLink & {
  identityId: string;
};

type SelfQuestLink = PathLink & {
  questId: string;
};

type QuestActivityLink = PathLink & {
  questId: string;
  activityId: string;
};

type ActivitySkillLink = PathLink & {
  activityId: string;
  skillId: string;
};

type MeshLayer = "quest" | "activity" | "skill";

type MeshLink = PathLink & {
  layer: MeshLayer;
  fromId: string;
  toId: string;
};

type InkStroke = {
  d: string;
  w: number;
  o: number;
};

type IntakePrompt = {
  id: string;
  label: string;
  question: string;
  placeholder: string;
};

type IntakeMessage = {
  role: "guide" | "you";
  text: string;
};

type IntakeRecommendations = {
  identityIds: string[];
  questIds: string[];
  activityIds: string[];
  skillIds: string[];
  reflection: string;
  nextAction: string;
};

type IntakeState = {
  currentStep: number;
  answers: Record<string, string>;
  messages: IntakeMessage[];
  completed: boolean;
  recommendations: IntakeRecommendations | null;
};

const SVG_W = 1408;
const SVG_H = 768;
const GROUND_Y = 528;
const NODE_R = 17;
const MIN_ZOOM = 0.94;
const MAX_ZOOM = 2.8;
const HANDWRITING_FONT_STACK =
  "'Bradley Hand', 'Segoe Print', 'Chalkboard SE', 'Noteworthy', 'Lucida Handwriting', cursive";
const INK_CARD_CLASS =
  "border-2 border-zinc-800/70 bg-[linear-gradient(180deg,#f9f1df_0%,#efe4cd_100%)] shadow-[0_18px_42px_rgba(28,20,14,0.32),inset_0_0_0_1px_rgba(255,255,255,0.4)]";
const INK_SECTION_CLASS =
  "rounded-xl border border-zinc-700/55 bg-[repeating-linear-gradient(0deg,rgba(90,64,42,0.05)_0px,rgba(90,64,42,0.05)_1px,transparent_1px,transparent_16px),linear-gradient(180deg,#f8efdc_0%,#f1e6d1_100%)]";

const STORAGE_KEY = "identitree-progress-v3";
const INTAKE_STORAGE_KEY = "identitree-intake-v1";
const LEGACY_STORAGE_KEYS = [
  "identitree-progress-v2",
  "identitree-progress-v1",
  "identity-tree-progress-v2",
  "identity-tree-progress-v1",
];
const REFERENCE_IMAGE_PATH = "/identitree-reference.png";

const intakePrompts: IntakePrompt[] = [
  {
    id: "moment",
    label: "moment",
    question: "when did you feel most like your future self recently?",
    placeholder: "write the moment in one or two sentences...",
  },
  {
    id: "evidence",
    label: "evidence",
    question: "what actions made that moment real?",
    placeholder: "what did you actually do?",
  },
  {
    id: "friction",
    label: "friction",
    question: "what pattern keeps interrupting your momentum?",
    placeholder: "name the blocker honestly...",
  },
  {
    id: "identity",
    label: "focus identity",
    question: "which identity do you want to grow next: builder, connector, or architect?",
    placeholder: "builder / connector / architect (or describe in your own words)",
  },
  {
    id: "commitment",
    label: "48h promise",
    question: "what is one small promise you can keep in the next 48 hours?",
    placeholder: "i will...",
  },
];

const identityKeywords: Record<string, string[]> = {
  builder: ["build", "prototype", "ship", "make", "code", "create", "design"],
  connector: ["talk", "feedback", "people", "community", "share", "conversation", "interview"],
  architect: ["system", "process", "routine", "workflow", "structure", "reflect", "organize"],
};

const questKeywords: Record<string, string[]> = {
  quest_ship: ["ship", "prototype", "build", "launch", "make"],
  quest_feedback: ["feedback", "interview", "talk", "conversation", "listen"],
  quest_system: ["system", "routine", "process", "repeat", "organize"],
  quest_share: ["share", "publish", "post", "write", "log"],
};

const selfNode = {
  id: "self",
  short: "ME",
  name: "self",
  summary: "the center of gravity where every identity path converges.",
  x: 706,
  y: 240,
};

const identities: IdentityFruit[] = [
  {
    id: "builder",
    short: "I1",
    name: "builder",
    fruit: "🍎",
    x: 542,
    y: 201,
    summary: "you turn ideas into outcomes people can use now.",
    questIds: ["quest_ship", "quest_feedback"],
    tone: "bg-rose-100 text-rose-800",
    traceColor: "#b91c1c",
  },
  {
    id: "connector",
    short: "I2",
    name: "connector",
    fruit: "🫒",
    x: 759,
    y: 130,
    summary: "you create momentum through conversations and shared context.",
    questIds: ["quest_feedback", "quest_share"],
    tone: "bg-amber-100 text-amber-800",
    traceColor: "#b45309",
  },
  {
    id: "architect",
    short: "I3",
    name: "architect",
    fruit: "🍐",
    x: 876,
    y: 202,
    summary: "you shape durable systems that keep compounding.",
    questIds: ["quest_system", "quest_share"],
    tone: "bg-emerald-100 text-emerald-800",
    traceColor: "#047857",
  },
];

const quests: QuestNode[] = [
  {
    id: "quest_ship",
    short: "Q1",
    name: "ship a tiny prototype in 48h",
    x: 430,
    y: 592,
    xp: 30,
    summary: "ship a tight prototype quickly and capture what breaks.",
    activityIds: ["activity_build", "activity_reflect"],
    identityIds: ["builder"],
  },
  {
    id: "quest_feedback",
    short: "Q2",
    name: "run 3 real feedback convos",
    x: 577,
    y: 592,
    xp: 35,
    summary: "collect live feedback and adapt the path in public.",
    activityIds: ["activity_talk", "activity_share"],
    identityIds: ["builder", "connector"],
  },
  {
    id: "quest_system",
    short: "Q3",
    name: "turn one loop into a repeatable system",
    x: 706,
    y: 592,
    xp: 40,
    summary: "replace one repeated cycle with a reusable process.",
    activityIds: ["activity_reflect", "activity_build"],
    identityIds: ["architect"],
  },
  {
    id: "quest_share",
    short: "Q4",
    name: "publish your 7-day growth thread",
    x: 855,
    y: 580,
    xp: 25,
    summary: "publish growth logs so momentum stays visible.",
    activityIds: ["activity_share", "activity_talk"],
    identityIds: ["connector", "architect"],
  },
];

const activities: ActivityNode[] = [
  {
    id: "activity_build",
    short: "A1",
    name: "build sprint",
    x: 433,
    y: 647,
    summary: "focused build block with no context switching.",
    skillIds: ["skill_design", "skill_systems"],
  },
  {
    id: "activity_talk",
    short: "A2",
    name: "user convo",
    x: 526,
    y: 670,
    summary: "direct conversation to surface friction and intent.",
    skillIds: ["skill_communication", "skill_story"],
  },
  {
    id: "activity_reflect",
    short: "A3",
    name: "weekly reflection",
    x: 929,
    y: 636,
    summary: "review outcomes, prune noise, and plan the next branch.",
    skillIds: ["skill_consistency", "skill_systems"],
  },
  {
    id: "activity_share",
    short: "A4",
    name: "public share",
    x: 1021,
    y: 620,
    summary: "share progress where people can react and respond.",
    skillIds: ["skill_story", "skill_design"],
  },
];

const skills: SkillNode[] = [
  {
    id: "skill_design",
    short: "S1",
    name: "design taste",
    x: 350,
    y: 676,
    summary: "spot what adds clarity and what adds noise.",
  },
  {
    id: "skill_systems",
    short: "S2",
    name: "systems thinking",
    x: 481,
    y: 618,
    summary: "see loops and leverage points, not isolated tasks.",
  },
  {
    id: "skill_communication",
    short: "S3",
    name: "communication",
    x: 706,
    y: 706,
    summary: "make intent legible so others can move with you.",
  },
  {
    id: "skill_story",
    short: "S4",
    name: "storytelling",
    x: 885,
    y: 671,
    summary: "connect facts into meaning people remember.",
  },
  {
    id: "skill_consistency",
    short: "S5",
    name: "consistency",
    x: 1037,
    y: 676,
    summary: "show up repeatedly so identity change sticks.",
  },
];

const questById = Object.fromEntries(
  quests.map((quest) => [quest.id, quest] as const),
) as Record<string, QuestNode>;

const activityById = Object.fromEntries(
  activities.map((activity) => [activity.id, activity] as const),
) as Record<string, ActivityNode>;

const skillById = Object.fromEntries(
  skills.map((skill) => [skill.id, skill] as const),
) as Record<string, SkillNode>;

const identityById = Object.fromEntries(
  identities.map((identity) => [identity.id, identity] as const),
) as Record<string, IdentityFruit>;

const isValidQuestId = (id: string) => Boolean(questById[id]);
const isValidActivityId = (id: string) => Boolean(activityById[id]);
const isValidSkillId = (id: string) => Boolean(skillById[id]);

const withAlpha = (hexColor: string, alphaHex: string) => `${hexColor}${alphaHex}`;
const toPoint = (x: number, y: number): Point => ({ x, y });

const createEmptyTreeState = (): TreeState => ({
  completedQuests: [],
  practicedActivities: [],
  trainedSkills: [],
});

const uniqueValidIds = (
  ids: string[] | undefined,
  isValid: (id: string) => boolean,
) => {
  if (!ids) return [];
  return ids.filter((id, index, list) => isValid(id) && list.indexOf(id) === index);
};

const toNaturalList = (items: string[]) => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const ratioToPct = (part: number, total: number) => {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
};

const normalizeText = (value: string) => value.toLowerCase().trim();

const scoreByKeywords = (text: string, keywords: string[]) => {
  const normalized = normalizeText(text);
  if (!normalized) return 0;
  return keywords.reduce((score, keyword) => {
    return normalized.includes(keyword) ? score + 1 : score;
  }, 0);
};

const createInitialIntakeState = (): IntakeState => ({
  currentStep: 0,
  answers: {},
  messages: [
    {
      role: "guide",
      text:
        "let's do a quick reflective check-in. " +
        "answer naturally and i'll map it into your tree. " +
        intakePrompts[0].question,
    },
  ],
  completed: false,
  recommendations: null,
});

const buildIntakeRecommendations = (answers: Record<string, string>): IntakeRecommendations => {
  const combinedText = Object.values(answers).join(" ");
  const explicitIdentity = normalizeText(answers.identity ?? "");

  const identityScores = identities.map((identity) => {
    const keywordScore = scoreByKeywords(combinedText, identityKeywords[identity.id] ?? []);
    const explicitScore = explicitIdentity.includes(identity.name) ? 3 : 0;
    return {
      id: identity.id,
      score: keywordScore + explicitScore,
    };
  });

  const identityIds = identityScores
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((entry) => entry.id);

  const fallbackIdentity = identities[0]?.id ? [identities[0].id] : [];
  const resolvedIdentityIds = identityIds.length ? identityIds : fallbackIdentity;

  const questScoreMap = quests.reduce<Record<string, number>>((acc, quest) => {
    const keywordScore = scoreByKeywords(combinedText, questKeywords[quest.id] ?? []);
    const identityBonus = quest.identityIds.some((id) => resolvedIdentityIds.includes(id)) ? 2 : 0;
    acc[quest.id] = keywordScore + identityBonus;
    return acc;
  }, {});

  const scoredQuestIds = Object.entries(questScoreMap)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([questId]) => questId);

  const defaultQuestIds = resolvedIdentityIds
    .flatMap((identityId) => identityById[identityId]?.questIds ?? [])
    .slice(0, 2);

  const questIds = uniqueValidIds(
    scoredQuestIds.length ? scoredQuestIds : defaultQuestIds,
    isValidQuestId,
  );

  const activityIds = uniqueValidIds(
    questIds.flatMap((questId) => questById[questId]?.activityIds ?? []),
    isValidActivityId,
  );
  const skillIds = uniqueValidIds(
    activityIds.flatMap((activityId) => activityById[activityId]?.skillIds ?? []),
    isValidSkillId,
  );

  const identityNames = resolvedIdentityIds
    .map((identityId) => identityById[identityId]?.name)
    .filter((name): name is string => Boolean(name));
  const questNames = questIds
    .map((questId) => questById[questId]?.name)
    .filter((name): name is string => Boolean(name));

  const reflection =
    "from your notes, this run is about " +
    `${toNaturalList(identityNames) || "a grounded identity shift"}. ` +
    "you create evidence through " +
    `${toNaturalList(questNames) || "small consistent quests"}.`;

  return {
    identityIds: resolvedIdentityIds,
    questIds,
    activityIds,
    skillIds,
    reflection,
    nextAction:
      answers.commitment?.trim() ||
      "complete one small quest step and write one sentence about what changed.",
  };
};

const getUnlockedActivitySet = (completedQuests: string[]) => {
  return new Set(completedQuests.flatMap((id) => questById[id]?.activityIds ?? []));
};

const getUnlockedSkillSet = (practicedActivities: string[]) => {
  return new Set(
    practicedActivities.flatMap((id) => activityById[id]?.skillIds ?? []),
  );
};

const curvedPath = (from: Point, to: Point, bendBias = 0) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(12, Math.hypot(dx, dy));
  const sway = Math.min(110, distance * 0.18) * (bendBias === 0 ? (dx >= 0 ? 1 : -1) : bendBias);

  const c1x = from.x + dx * 0.25 + sway;
  const c1y = from.y + dy * 0.24 - Math.abs(sway) * 0.33;
  const c2x = from.x + dx * 0.75 - sway * 0.74;
  const c2y = from.y + dy * 0.86 + Math.abs(sway) * 0.2;

  return `M ${from.x} ${from.y} C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(
    2,
  )} ${c2y.toFixed(2)}, ${to.x} ${to.y}`;
};

const identityToSelfLinks: IdentitySelfLink[] = identities.map((identity) => {
  const bend = identity.x < selfNode.x ? -0.52 : 0.52;
  return {
    key: `${identity.id}-to-self`,
    identityId: identity.id,
    d: curvedPath(
      toPoint(identity.x, identity.y + 15),
      toPoint(selfNode.x, selfNode.y - 18),
      bend,
    ),
  };
});

const selfToQuestPathByQuestId: Record<string, string> = {
  quest_ship:
    `M ${selfNode.x} ${selfNode.y + 14} ` +
    `C ${selfNode.x - 4} 336, ${selfNode.x - 12} 434, ${selfNode.x - 16} 520 ` +
    `C ${selfNode.x - 30} 554, 564 572, 430 592`,
  quest_feedback:
    `M ${selfNode.x} ${selfNode.y + 14} ` +
    `C ${selfNode.x - 3} 336, ${selfNode.x - 8} 434, ${selfNode.x - 10} 520 ` +
    `C ${selfNode.x - 20} 552, 630 570, 577 592`,
  quest_system:
    `M ${selfNode.x} ${selfNode.y + 14} ` +
    `C ${selfNode.x} 336, ${selfNode.x} 434, ${selfNode.x} 592`,
  quest_share:
    `M ${selfNode.x} ${selfNode.y + 14} ` +
    `C ${selfNode.x + 3} 336, ${selfNode.x + 8} 434, ${selfNode.x + 10} 518 ` +
    `C ${selfNode.x + 20} 548, 790 562, 855 580`,
};

const selfToQuestLinks: SelfQuestLink[] = quests.map((quest) => {
  return {
    key: `self-to-${quest.id}`,
    questId: quest.id,
    d:
      selfToQuestPathByQuestId[quest.id] ??
      curvedPath(toPoint(selfNode.x, selfNode.y + 14), toPoint(quest.x, quest.y - 18), 0.2),
  };
});

const questToActivityLinks: QuestActivityLink[] = quests.flatMap((quest) =>
  quest.activityIds.map((activityId) => {
    const activity = activityById[activityId];
    const bend = activity.x < quest.x ? -0.18 : 0.18;
    return {
      key: `${quest.id}-to-${activity.id}`,
      questId: quest.id,
      activityId: activity.id,
      d: curvedPath(toPoint(quest.x, quest.y + 16), toPoint(activity.x, activity.y - 16), bend),
    };
  }),
);

const activityToSkillLinks: ActivitySkillLink[] = activities.flatMap((activity) =>
  activity.skillIds.map((skillId) => {
    const skill = skillById[skillId];
    const bend = skill.x < activity.x ? -0.15 : 0.15;
    return {
      key: `${activity.id}-to-${skill.id}`,
      activityId: activity.id,
      skillId: skill.id,
      d: curvedPath(toPoint(activity.x, activity.y + 15), toPoint(skill.x, skill.y - 15), bend),
    };
  }),
);

const makeMeshLink = (
  layer: MeshLayer,
  fromId: string,
  toId: string,
  from: Point,
  to: Point,
): MeshLink => {
  const bend = from.x <= to.x ? 0.14 : -0.14;
  return {
    key: `${layer}-${fromId}-${toId}`,
    layer,
    fromId,
    toId,
    d: curvedPath(from, to, bend),
  };
};

const meshLinks: MeshLink[] = [
  makeMeshLink(
    "quest",
    "quest_ship",
    "quest_feedback",
    toPoint(questById.quest_ship.x, questById.quest_ship.y + 4),
    toPoint(questById.quest_feedback.x, questById.quest_feedback.y + 4),
  ),
  makeMeshLink(
    "quest",
    "quest_feedback",
    "quest_system",
    toPoint(questById.quest_feedback.x, questById.quest_feedback.y + 3),
    toPoint(questById.quest_system.x, questById.quest_system.y + 3),
  ),
  makeMeshLink(
    "quest",
    "quest_system",
    "quest_share",
    toPoint(questById.quest_system.x, questById.quest_system.y + 4),
    toPoint(questById.quest_share.x, questById.quest_share.y + 4),
  ),
  makeMeshLink(
    "activity",
    "activity_build",
    "activity_talk",
    toPoint(activityById.activity_build.x, activityById.activity_build.y + 3),
    toPoint(activityById.activity_talk.x, activityById.activity_talk.y + 3),
  ),
  makeMeshLink(
    "activity",
    "activity_talk",
    "activity_reflect",
    toPoint(activityById.activity_talk.x, activityById.activity_talk.y + 3),
    toPoint(activityById.activity_reflect.x, activityById.activity_reflect.y + 3),
  ),
  makeMeshLink(
    "activity",
    "activity_reflect",
    "activity_share",
    toPoint(activityById.activity_reflect.x, activityById.activity_reflect.y + 3),
    toPoint(activityById.activity_share.x, activityById.activity_share.y + 3),
  ),
  makeMeshLink(
    "skill",
    "skill_design",
    "skill_systems",
    toPoint(skillById.skill_design.x, skillById.skill_design.y + 2),
    toPoint(skillById.skill_systems.x, skillById.skill_systems.y + 2),
  ),
  makeMeshLink(
    "skill",
    "skill_systems",
    "skill_communication",
    toPoint(skillById.skill_systems.x, skillById.skill_systems.y + 2),
    toPoint(skillById.skill_communication.x, skillById.skill_communication.y + 2),
  ),
  makeMeshLink(
    "skill",
    "skill_communication",
    "skill_story",
    toPoint(skillById.skill_communication.x, skillById.skill_communication.y + 2),
    toPoint(skillById.skill_story.x, skillById.skill_story.y + 2),
  ),
  makeMeshLink(
    "skill",
    "skill_story",
    "skill_consistency",
    toPoint(skillById.skill_story.x, skillById.skill_story.y + 2),
    toPoint(skillById.skill_consistency.x, skillById.skill_consistency.y + 2),
  ),
];

const canopyInkPaths: InkStroke[] = [
  { d: "M 210 290 C 270 140, 430 90, 590 110 C 706 55, 822 55, 938 110 C 1098 90, 1258 140, 1198 290", w: 2.4, o: 0.56 },
  { d: "M 236 330 C 360 258, 478 255, 586 295 C 704 255, 830 255, 1172 332", w: 2, o: 0.46 },
  { d: "M 270 375 C 392 334, 500 332, 586 358 C 702 332, 818 334, 1138 375", w: 1.8, o: 0.42 },
  { d: "M 706 108 C 706 166, 705 205, 706 255", w: 3.8, o: 0.72 },
  { d: "M 560 135 C 608 187, 644 220, 675 257", w: 2.2, o: 0.58 },
  { d: "M 852 135 C 804 187, 768 220, 737 257", w: 2.2, o: 0.58 },
  { d: "M 456 188 C 540 218, 600 236, 674 262", w: 1.6, o: 0.44 },
  { d: "M 956 188 C 872 218, 812 236, 738 262", w: 1.6, o: 0.44 },
];

const trunkInkPaths: InkStroke[] = [
  { d: "M 670 250 C 650 336, 648 410, 660 500 C 666 545, 675 575, 686 610", w: 8.2, o: 0.56 },
  { d: "M 742 250 C 762 336, 764 410, 752 500 C 746 545, 737 575, 726 610", w: 8.2, o: 0.56 },
  { d: "M 706 250 C 706 336, 706 410, 706 500 C 706 545, 706 575, 706 610", w: 4.4, o: 0.4 },
  { d: "M 660 392 C 572 446, 508 480, 442 530", w: 3.1, o: 0.42 },
  { d: "M 752 392 C 840 446, 904 480, 970 530", w: 3.1, o: 0.42 },
];

const rootInkPaths: InkStroke[] = [
  { d: "M 706 612 C 654 635, 594 665, 506 726", w: 4, o: 0.58 },
  { d: "M 706 612 C 626 648, 548 688, 418 748", w: 3.6, o: 0.52 },
  { d: "M 706 612 C 758 635, 818 665, 906 726", w: 4, o: 0.58 },
  { d: "M 706 612 C 786 648, 864 688, 994 748", w: 3.6, o: 0.52 },
  { d: "M 592 666 C 642 677, 770 677, 820 666", w: 1.9, o: 0.35 },
  { d: "M 498 726 C 582 738, 640 738, 706 734", w: 1.5, o: 0.32 },
  { d: "M 706 734 C 772 738, 830 738, 914 726", w: 1.5, o: 0.32 },
];

const soilHatchPaths = [
  "M 80 565 C 180 574, 258 574, 356 565",
  "M 396 565 C 496 574, 574 574, 672 565",
  "M 712 565 C 812 574, 890 574, 988 565",
  "M 1028 565 C 1128 574, 1206 574, 1304 565",
  "M 94 622 C 194 631, 272 631, 370 622",
  "M 410 622 C 510 631, 588 631, 686 622",
  "M 726 622 C 826 631, 904 631, 1002 622",
  "M 1042 622 C 1142 631, 1220 631, 1318 622",
  "M 110 679 C 210 688, 288 688, 386 679",
  "M 426 679 C 526 688, 604 688, 702 679",
  "M 742 679 C 842 688, 920 688, 1018 679",
  "M 1058 679 C 1158 688, 1236 688, 1334 679",
];

const allNodePoints = [
  ...identities.map((identity) => ({ x: identity.x, y: identity.y })),
  { x: selfNode.x, y: selfNode.y },
  ...quests.map((quest) => ({ x: quest.x, y: quest.y })),
  ...activities.map((activity) => ({ x: activity.x, y: activity.y })),
  ...skills.map((skill) => ({ x: skill.x, y: skill.y })),
];

const readStoredIntakeState = (): IntakeState => {
  if (typeof window === "undefined") return createInitialIntakeState();

  const raw = window.localStorage.getItem(INTAKE_STORAGE_KEY);
  if (!raw) return createInitialIntakeState();

  try {
    const parsed = JSON.parse(raw) as IntakeState;
    if (!Array.isArray(parsed.messages) || typeof parsed.currentStep !== "number") {
      return createInitialIntakeState();
    }
    return {
      currentStep: parsed.currentStep,
      answers: parsed.answers ?? {},
      messages: parsed.messages,
      completed: Boolean(parsed.completed),
      recommendations: parsed.recommendations ?? null,
    };
  } catch {
    return createInitialIntakeState();
  }
};

const readStoredTreeState = (): TreeState => {
  if (typeof window === "undefined") return createEmptyTreeState();

  const currentRaw = window.localStorage.getItem(STORAGE_KEY);
  if (currentRaw) {
    try {
      const parsed = JSON.parse(currentRaw) as TreeState;
      return {
        completedQuests: uniqueValidIds(parsed.completedQuests, isValidQuestId),
        practicedActivities: uniqueValidIds(parsed.practicedActivities, isValidActivityId),
        trainedSkills: uniqueValidIds(parsed.trainedSkills, isValidSkillId),
      };
    } catch {
      return createEmptyTreeState();
    }
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyRaw = window.localStorage.getItem(legacyKey);
    if (!legacyRaw) continue;

    try {
      const parsed = JSON.parse(legacyRaw) as {
        completedQuests?: string[];
        practicedActivities?: string[];
        practicedActions?: string[];
        trainedSkills?: string[];
      };

      return {
        completedQuests: uniqueValidIds(parsed.completedQuests, isValidQuestId),
        practicedActivities: uniqueValidIds(
          parsed.practicedActivities ?? parsed.practicedActions,
          isValidActivityId,
        ),
        trainedSkills: uniqueValidIds(parsed.trainedSkills, isValidSkillId),
      };
    } catch {
      continue;
    }
  }

  return createEmptyTreeState();
};

function TracePath({
  d,
  color,
  width,
}: {
  d: string;
  color: string;
  width: number;
}) {
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke={withAlpha(color, "55")}
        strokeWidth={width + 1.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 30"
        animate={{
          strokeDashoffset: [0, -220],
          opacity: [0.45, 1, 0.45],
        }}
        transition={{
          duration: 4.2,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </>
  );
}

function SvgNode({
  x,
  y,
  label,
  title,
  fill,
  stroke,
  selected,
  onClick,
  textColor,
}: {
  x: number;
  y: number;
  label: string;
  title: string;
  fill: string;
  stroke: string;
  selected: boolean;
  onClick: () => void;
  textColor: string;
}) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor: "pointer" }}
      onClick={onClick}
      data-node="true"
      role="button"
      aria-label={title}
    >
      <circle r={NODE_R} fill={fill} stroke={stroke} strokeWidth={1.8} />
      {selected && <circle r={NODE_R + 4} fill="none" stroke={stroke} strokeWidth={2.2} />}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="10"
        letterSpacing="0.1em"
        fontWeight={700}
        fill={textColor}
      >
        {label}
      </text>
      <title>{title}</title>
    </g>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<{ type: NodeType; id: string }>({
    type: "self",
    id: selfNode.id,
  });
  const [treeState, setTreeState] = useState<TreeState>(() => readStoredTreeState());
  const [hasReferenceImage, setHasReferenceImage] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [intakeInput, setIntakeInput] = useState("");
  const [intakeState, setIntakeState] = useState<IntakeState>(() => readStoredIntakeState());
  const [zoom, setZoom] = useState(1);
  const [viewCenter, setViewCenter] = useState<Point>({
    x: SVG_W / 2,
    y: SVG_H / 2,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    centerX: number;
    centerY: number;
  } | null>(null);

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
  };

  const clampZoom = (value: number) => clamp(value, MIN_ZOOM, MAX_ZOOM);

  const clampViewCenter = (center: Point, atZoom: number): Point => {
    const viewWidth = SVG_W / atZoom;
    const viewHeight = SVG_H / atZoom;
    return {
      x: clamp(center.x, viewWidth / 2, SVG_W - viewWidth / 2),
      y: clamp(center.y, viewHeight / 2, SVG_H - viewHeight / 2),
    };
  };

  const resetView = () => {
    setZoom(1);
    setViewCenter({ x: SVG_W / 2, y: SVG_H / 2 });
  };

  const selectNode = (type: NodeType, id: string) => {
    setSelected({ type, id });
    setInspectorOpen(true);
  };

  const { completedQuests, practicedActivities, trainedSkills } = treeState;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(treeState));
  }, [treeState]);

  useEffect(() => {
    window.localStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(intakeState));
  }, [intakeState]);

  useEffect(() => {
    let alive = true;
    const img = new window.Image();

    img.onload = () => {
      if (alive) setHasReferenceImage(true);
    };

    img.onerror = () => {
      if (alive) setHasReferenceImage(false);
    };

    img.src = `${REFERENCE_IMAGE_PATH}?v=1`;

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") setIsSpacePressed(true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const viewWidth = SVG_W / zoom;
  const viewHeight = SVG_H / zoom;
  const clampedCenter = clampViewCenter(viewCenter, zoom);
  const viewMinX = clampedCenter.x - viewWidth / 2;
  const viewMinY = clampedCenter.y - viewHeight / 2;
  const activeViewBox = `${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`;

  const handleCanvasWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const pointerX = (event.clientX - rect.left) / rect.width;
    const pointerY = (event.clientY - rect.top) / rect.height;

    setZoom((currentZoom) => {
      const nextZoom = clampZoom(currentZoom + (event.deltaY < 0 ? 0.12 : -0.12));
      if (nextZoom === currentZoom) return currentZoom;

      setViewCenter((currentCenter) => {
        const currentClamped = clampViewCenter(currentCenter, currentZoom);
        const currentWidth = SVG_W / currentZoom;
        const currentHeight = SVG_H / currentZoom;
        const worldX = currentClamped.x - currentWidth / 2 + pointerX * currentWidth;
        const worldY = currentClamped.y - currentHeight / 2 + pointerY * currentHeight;

        const nextWidth = SVG_W / nextZoom;
        const nextHeight = SVG_H / nextZoom;
        const nextCenter = {
          x: worldX + (0.5 - pointerX) * nextWidth,
          y: worldY + (0.5 - pointerY) * nextHeight,
        };

        return clampViewCenter(nextCenter, nextZoom);
      });

      return nextZoom;
    });
  };

  const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 && event.button !== 1) return;
    const target = event.target as Element;
    const clickedNode = Boolean(target.closest("[data-node='true']"));
    if (clickedNode && !isSpacePressed && event.button !== 1) return;

    panStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      centerX: clampedCenter.x,
      centerY: clampedCenter.y,
    };
    setIsDragging(true);
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!panStartRef.current) return;

    const svgRect = event.currentTarget.getBoundingClientRect();
    if (!svgRect.width || !svgRect.height) return;

    const dx = event.clientX - panStartRef.current.clientX;
    const dy = event.clientY - panStartRef.current.clientY;
    const unitsPerPxX = viewWidth / svgRect.width;
    const unitsPerPxY = viewHeight / svgRect.height;

    const nextCenter = {
      x: panStartRef.current.centerX - dx * unitsPerPxX,
      y: panStartRef.current.centerY - dy * unitsPerPxY,
    };

    setViewCenter(clampViewCenter(nextCenter, zoom));
  };

  const handleCanvasPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    panStartRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const completedQuestSet = useMemo(() => new Set(completedQuests), [completedQuests]);
  const practicedActivitySet = useMemo(
    () => new Set(practicedActivities),
    [practicedActivities],
  );
  const trainedSkillSet = useMemo(() => new Set(trainedSkills), [trainedSkills]);

  const unlockedActivitySet = useMemo(
    () => getUnlockedActivitySet(completedQuests),
    [completedQuests],
  );
  const unlockedSkillSet = useMemo(
    () => getUnlockedSkillSet(practicedActivities),
    [practicedActivities],
  );

  const identityProgress = useMemo(() => {
    return identities.map((identity) => {
      const xp = identity.questIds.reduce((sum, questId) => {
        if (!completedQuestSet.has(questId)) return sum;
        return sum + (questById[questId]?.xp ?? 0);
      }, 0);

      const maxXp = identity.questIds.reduce((sum, questId) => {
        return sum + (questById[questId]?.xp ?? 0);
      }, 0);

      const pct = maxXp === 0 ? 0 : Math.round((xp / maxXp) * 100);

      return {
        ...identity,
        xp,
        maxXp,
        pct,
      };
    });
  }, [completedQuestSet]);

  const selectedIdentity = selected.type === "identity" ? identityById[selected.id] : null;
  const selectedQuest = selected.type === "quest" ? questById[selected.id] : null;
  const selectedActivity =
    selected.type === "activity" ? activityById[selected.id] : null;
  const selectedSkill = selected.type === "skill" ? skillById[selected.id] : null;

  const activeIdentityTrace: IdentityTrace | null = useMemo(() => {
    if (selected.type !== "identity") return null;
    const identity = identityById[selected.id];
    if (!identity) return null;

    const questIds = new Set(identity.questIds);
    const activityIds = new Set(
      identity.questIds.flatMap((questId) => questById[questId]?.activityIds ?? []),
    );
    const skillIds = new Set(
      [...activityIds].flatMap((activityId) => activityById[activityId]?.skillIds ?? []),
    );

    return {
      identityId: identity.id,
      color: identity.traceColor,
      questIds,
      activityIds,
      skillIds,
    };
  }, [selected]);

  const traceColor = activeIdentityTrace?.color ?? "#334155";
  const totalXp = identityProgress.reduce((sum, identity) => sum + identity.xp, 0);
  const selectedIdentityInsights = useMemo(() => {
    if (!selectedIdentity) return null;

    const questList = selectedIdentity.questIds
      .map((questId) => questById[questId])
      .filter((quest): quest is QuestNode => Boolean(quest));

    const activityIds = uniqueValidIds(
      questList.flatMap((quest) => quest.activityIds),
      isValidActivityId,
    );
    const activityList = activityIds
      .map((activityId) => activityById[activityId])
      .filter((activity): activity is ActivityNode => Boolean(activity));

    const skillIds = uniqueValidIds(
      activityList.flatMap((activity) => activity.skillIds),
      isValidSkillId,
    );
    const skillList = skillIds
      .map((skillId) => skillById[skillId])
      .filter((skill): skill is SkillNode => Boolean(skill));

    const doneQuests = questList.filter((quest) => completedQuestSet.has(quest.id));
    const practicedActivities = activityList.filter((activity) =>
      practicedActivitySet.has(activity.id),
    );
    const reinforcedSkills = skillList.filter((skill) => trainedSkillSet.has(skill.id));
    const progress = identityProgress.find((identity) => identity.id === selectedIdentity.id);
    const nextQuest = questList.find((quest) => !completedQuestSet.has(quest.id)) ?? null;

    const momentumLine =
      (progress?.pct ?? 0) >= 70
        ? `this identity is already becoming visible in your behavior. keep repeating the same roots so it becomes default.`
        : (progress?.pct ?? 0) >= 35
          ? `you are mid-transition here: momentum exists, but consistency is what turns this into identity.`
          : `this identity is still mostly intention. completing one quest in this branch will quickly make it feel real.`;

    const meaningLines = questList.map((quest) => {
      const activitiesForQuest = quest.activityIds
        .map((activityId) => activityById[activityId])
        .filter((activity): activity is ActivityNode => Boolean(activity));
      const activityNames = activitiesForQuest.map((activity) => activity.name);
      const skillNames = uniqueValidIds(
        activitiesForQuest.flatMap((activity) => activity.skillIds),
        isValidSkillId,
      ).map((skillId) => skillById[skillId]?.name ?? skillId);

      return {
        quest,
        activityNames,
        skillNames,
      };
    });

    return {
      questList,
      activityList,
      skillList,
      doneQuests,
      practicedActivities,
      reinforcedSkills,
      progress,
      nextQuest,
      momentumLine,
      meaningLines,
    };
  }, [
    selectedIdentity,
    completedQuestSet,
    practicedActivitySet,
    trainedSkillSet,
    identityProgress,
  ]);

  const selectedQuestInsights = useMemo(() => {
    if (!selectedQuest) return null;

    const identityList = selectedQuest.identityIds
      .map((identityId) => identityById[identityId])
      .filter((identity): identity is IdentityFruit => Boolean(identity));

    const activityList = selectedQuest.activityIds
      .map((activityId) => activityById[activityId])
      .filter((activity): activity is ActivityNode => Boolean(activity));

    const skillList = uniqueValidIds(
      activityList.flatMap((activity) => activity.skillIds),
      isValidSkillId,
    )
      .map((skillId) => skillById[skillId])
      .filter((skill): skill is SkillNode => Boolean(skill));

    const practicedActivityCount = activityList.filter((activity) =>
      practicedActivitySet.has(activity.id),
    ).length;
    const reinforcedSkillCount = skillList.filter((skill) =>
      trainedSkillSet.has(skill.id),
    ).length;

    const meaningLine = identityList.length
      ? `this quest strengthens ${toNaturalList(
          identityList.map((identity) => identity.name),
        )} by forcing evidence: ${toNaturalList(activityList.map((activity) => activity.name))}.`
      : "this quest adds evidence to your identity graph through repeated action loops.";

    return {
      identityList,
      activityList,
      skillList,
      practicedActivityCount,
      reinforcedSkillCount,
      meaningLine,
    };
  }, [selectedQuest, practicedActivitySet, trainedSkillSet]);

  const selectedActivityInsights = useMemo(() => {
    if (!selectedActivity) return null;

    const unlockQuests = quests.filter((quest) => quest.activityIds.includes(selectedActivity.id));
    const identityList = uniqueValidIds(
      unlockQuests.flatMap((quest) => quest.identityIds),
      (identityId) => Boolean(identityById[identityId]),
    )
      .map((identityId) => identityById[identityId])
      .filter((identity): identity is IdentityFruit => Boolean(identity));

    const skillList = selectedActivity.skillIds
      .map((skillId) => skillById[skillId])
      .filter((skill): skill is SkillNode => Boolean(skill));

    const doneUnlockQuests = unlockQuests.filter((quest) => completedQuestSet.has(quest.id));
    const reinforcedSkillCount = skillList.filter((skill) =>
      trainedSkillSet.has(skill.id),
    ).length;

    const meaningLine = identityList.length
      ? `this activity is where identity becomes habit. each rep builds ${toNaturalList(
          identityList.map((identity) => identity.name),
        )} through ${toNaturalList(skillList.map((skill) => skill.name))}.`
      : `this activity compounds into ${toNaturalList(
          skillList.map((skill) => skill.name),
        )}, which then flows upward into identity-level confidence.`;

    return {
      unlockQuests,
      doneUnlockQuests,
      identityList,
      skillList,
      reinforcedSkillCount,
      meaningLine,
    };
  }, [selectedActivity, completedQuestSet, trainedSkillSet]);

  const selectedSkillInsights = useMemo(() => {
    if (!selectedSkill) return null;

    const activityList = activities.filter((activity) => activity.skillIds.includes(selectedSkill.id));
    const activityIdSet = new Set(activityList.map((activity) => activity.id));
    const questList = quests.filter((quest) =>
      quest.activityIds.some((activityId) => activityIdSet.has(activityId)),
    );
    const identityList = uniqueValidIds(
      questList.flatMap((quest) => quest.identityIds),
      (identityId) => Boolean(identityById[identityId]),
    )
      .map((identityId) => identityById[identityId])
      .filter((identity): identity is IdentityFruit => Boolean(identity));

    const practicedActivityCount = activityList.filter((activity) =>
      practicedActivitySet.has(activity.id),
    ).length;
    const completedQuestCount = questList.filter((quest) =>
      completedQuestSet.has(quest.id),
    ).length;

    const meaningLine =
      identityList.length > 0
        ? `this skill compounds across ${activityList.length} activities and ${
            questList.length
          } quests, so reinforcing it raises ${toNaturalList(
            identityList.map((identity) => identity.name),
          )} at the same time.`
        : `this skill is a root amplifier: it multiplies the quality of every connected activity.`;

    return {
      activityList,
      questList,
      identityList,
      practicedActivityCount,
      completedQuestCount,
      meaningLine,
    };
  }, [selectedSkill, practicedActivitySet, completedQuestSet]);

  const selfInsights = useMemo(() => {
    const sortedProgress = [...identityProgress].sort((a, b) => b.pct - a.pct);
    const strongestIdentity = sortedProgress[0] ?? null;
    const growthEdgeIdentity = sortedProgress.at(-1) ?? null;
    const nextQuest = quests.find((quest) => !completedQuestSet.has(quest.id)) ?? null;

    const questPct = ratioToPct(completedQuests.length, quests.length);
    const activityPct = ratioToPct(practicedActivities.length, activities.length);
    const skillPct = ratioToPct(trainedSkills.length, skills.length);

    const reflectionLine =
      questPct >= 70 && skillPct >= 55
        ? "your roots are coherent now: actions and skills are lining up with identity claims."
        : questPct >= 35
          ? "you are in the identity-building zone. repetition is now more important than novelty."
          : "you are still planting roots. finishing one quest chain end-to-end will unlock visible momentum.";

    return {
      strongestIdentity,
      growthEdgeIdentity,
      nextQuest,
      questPct,
      activityPct,
      skillPct,
      reflectionLine,
    };
  }, [identityProgress, completedQuestSet, completedQuests.length, practicedActivities.length, trainedSkills.length]);

  const isMeshTraced = (link: MeshLink) => {
    if (!activeIdentityTrace) return false;
    if (link.layer === "quest") {
      return (
        activeIdentityTrace.questIds.has(link.fromId) &&
        activeIdentityTrace.questIds.has(link.toId)
      );
    }
    if (link.layer === "activity") {
      return (
        activeIdentityTrace.activityIds.has(link.fromId) &&
        activeIdentityTrace.activityIds.has(link.toId)
      );
    }
    return (
      activeIdentityTrace.skillIds.has(link.fromId) &&
      activeIdentityTrace.skillIds.has(link.toId)
    );
  };

  const currentIntakePrompt = intakePrompts[intakeState.currentStep] ?? null;

  const restartIntake = () => {
    setIntakeInput("");
    setIntakeState(createInitialIntakeState());
  };

  const submitIntakeAnswer = () => {
    const answer = intakeInput.trim();
    if (!answer || intakeState.completed) return;

    setIntakeState((current) => {
      if (current.completed) return current;
      const prompt = intakePrompts[current.currentStep];
      if (!prompt) return current;

      const nextAnswers = { ...current.answers, [prompt.id]: answer };
      const nextMessages: IntakeMessage[] = [...current.messages, { role: "you", text: answer }];
      const nextStep = current.currentStep + 1;

      if (nextStep >= intakePrompts.length) {
        const recommendations = buildIntakeRecommendations(nextAnswers);
        nextMessages.push({
          role: "guide",
          text:
            `${recommendations.reflection} ` +
            `for the next 48h, keep this promise: "${recommendations.nextAction}"`,
        });
        return {
          currentStep: nextStep,
          answers: nextAnswers,
          messages: nextMessages,
          completed: true,
          recommendations,
        };
      }

      nextMessages.push({
        role: "guide",
        text: intakePrompts[nextStep].question,
      });

      return {
        currentStep: nextStep,
        answers: nextAnswers,
        messages: nextMessages,
        completed: false,
        recommendations: null,
      };
    });

    setIntakeInput("");
  };

  const applyIntakeFocus = () => {
    const recommendations = intakeState.recommendations;
    if (!recommendations) return;

    if (recommendations.identityIds[0]) {
      setSelected({ type: "identity", id: recommendations.identityIds[0] });
    } else if (recommendations.questIds[0]) {
      setSelected({ type: "quest", id: recommendations.questIds[0] });
    } else if (recommendations.activityIds[0]) {
      setSelected({ type: "activity", id: recommendations.activityIds[0] });
    } else if (recommendations.skillIds[0]) {
      setSelected({ type: "skill", id: recommendations.skillIds[0] });
    }

    setInspectorOpen(true);
    setIntakeOpen(false);
  };

  const toggleQuest = (questId: string) => {
    setTreeState((current) => {
      const nextQuests = current.completedQuests.includes(questId)
        ? current.completedQuests.filter((id) => id !== questId)
        : [...current.completedQuests, questId];

      const unlockedActivities = getUnlockedActivitySet(nextQuests);
      const nextActivities = current.practicedActivities.filter((id) =>
        unlockedActivities.has(id),
      );
      const unlockedSkills = getUnlockedSkillSet(nextActivities);
      const nextSkills = current.trainedSkills.filter((id) => unlockedSkills.has(id));

      return {
        completedQuests: nextQuests,
        practicedActivities: nextActivities,
        trainedSkills: nextSkills,
      };
    });
  };

  const toggleActivity = (activityId: string) => {
    setTreeState((current) => {
      const unlockedActivities = getUnlockedActivitySet(current.completedQuests);
      if (!unlockedActivities.has(activityId)) return current;

      const nextActivities = current.practicedActivities.includes(activityId)
        ? current.practicedActivities.filter((id) => id !== activityId)
        : [...current.practicedActivities, activityId];

      const unlockedSkills = getUnlockedSkillSet(nextActivities);
      const nextSkills = current.trainedSkills.filter((id) => unlockedSkills.has(id));

      return {
        ...current,
        practicedActivities: nextActivities,
        trainedSkills: nextSkills,
      };
    });
  };

  const toggleSkill = (skillId: string) => {
    setTreeState((current) => {
      const unlockedSkills = getUnlockedSkillSet(current.practicedActivities);
      if (!unlockedSkills.has(skillId)) return current;

      const nextSkills = current.trainedSkills.includes(skillId)
        ? current.trainedSkills.filter((id) => id !== skillId)
        : [...current.trainedSkills, skillId];

      return {
        ...current,
        trainedSkills: nextSkills,
      };
    });
  };

  const resetTree = () => {
    setSelected({ type: "self", id: selfNode.id });
    setInspectorOpen(false);
    setTreeState(createEmptyTreeState());
    resetView();
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_50%_14%,rgba(102,74,49,0.25),transparent_38%),linear-gradient(180deg,#2f2219_0%,#1f1610_48%,#110c08_100%)]"
      style={{ fontFamily: HANDWRITING_FONT_STACK }}
    >
      <Navbar
        classNames={{
          wrapper: "max-w-7xl",
          base: "bg-[#21170f]/86 backdrop-blur border-b border-zinc-700/50",
        }}
      >
        <NavbarBrand>
          <p className="text-lg tracking-[0.08em] text-zinc-100">identitree</p>
          <Badge color="warning" variant="flat" className="ml-3 border border-zinc-500/40">
            qb
          </Badge>
        </NavbarBrand>
        <NavbarContent justify="end">
          <Button
            variant={instructionsOpen ? "solid" : "flat"}
            size="sm"
            className="border border-zinc-600/50 bg-[#2a1e15]/80 text-zinc-100"
            onPress={() => {
              setInstructionsOpen((current) => !current);
              setIntakeOpen(false);
            }}
          >
            instructions
          </Button>
          <Button
            variant={intakeOpen ? "solid" : "flat"}
            size="sm"
            className="border border-zinc-600/50 bg-[#2a1e15]/80 text-zinc-100"
            onPress={() => {
              setIntakeOpen((current) => !current);
              setInstructionsOpen(false);
            }}
          >
            input
          </Button>
          <Button
            variant={inspectorOpen ? "solid" : "flat"}
            size="sm"
            className="border border-zinc-600/50 bg-[#2a1e15]/80 text-zinc-100"
            onPress={() => setInspectorOpen((current) => !current)}
          >
            journal
          </Button>
          <Button
            variant="flat"
            size="sm"
            className="border border-zinc-600/50 bg-[#2a1e15]/80 text-zinc-100"
            onPress={resetTree}
          >
            reset run
          </Button>
        </NavbarContent>
      </Navbar>

      <main className="relative h-[calc(100vh-65px)] w-full">
        <div className="absolute inset-0 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative h-full w-full overflow-hidden rounded-[28px] border-[10px] border-[#1d140d] bg-[linear-gradient(180deg,#20160f_0%,#19110c_100%)] shadow-[0_34px_70px_rgba(0,0,0,0.5),inset_0_0_0_2px_rgba(255,245,225,0.14)]"
          >
            <svg
              viewBox={activeViewBox}
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full touch-none"
              aria-hidden="true"
              onWheel={handleCanvasWheel}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              style={{ cursor: isDragging ? "grabbing" : "grab", fontFamily: HANDWRITING_FONT_STACK }}
            >
                  <defs>
                    <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d5c9b5" />
                      <stop offset="100%" stopColor="#c2af94" />
                    </linearGradient>
                    <filter id="ink-jitter" x="-20%" y="-20%" width="140%" height="140%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.62"
                        numOctaves="1"
                        seed="6"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="0.45"
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                  </defs>

                  {hasReferenceImage ? (
                    <>
                      <image
                        href={REFERENCE_IMAGE_PATH}
                        x={0}
                        y={0}
                        width={SVG_W}
                        height={SVG_H}
                        preserveAspectRatio="xMidYMid slice"
                        opacity="0.9"
                      />
                      <rect
                        x={0}
                        y={0}
                        width={SVG_W}
                        height={SVG_H}
                        fill="#f8f3e8"
                        opacity="0.18"
                      />
                    </>
                  ) : (
                    <>
                      <rect
                        x={0}
                        y={GROUND_Y}
                        width={SVG_W}
                        height={SVG_H - GROUND_Y}
                        fill="url(#soilGradient)"
                        opacity="0.58"
                      />

                      {soilHatchPaths.map((d) => (
                        <path
                          key={d}
                          d={d}
                          fill="none"
                          stroke="#6b543c"
                          strokeWidth="2"
                          opacity="0.2"
                          strokeLinecap="round"
                        />
                      ))}

                      <path
                        d={`M 0 ${GROUND_Y} C 220 ${GROUND_Y - 8}, 462 ${GROUND_Y + 5}, 706 ${GROUND_Y} C 946 ${GROUND_Y - 6}, 1190 ${GROUND_Y + 4}, ${SVG_W} ${GROUND_Y - 2}`}
                        fill="none"
                        stroke="#3d2b1c"
                        strokeWidth="8"
                        opacity="0.8"
                      />

                      <g filter="url(#ink-jitter)">
                        {canopyInkPaths.map((stroke) => (
                          <path
                            key={stroke.d}
                            d={stroke.d}
                            fill="none"
                            stroke="#4a3425"
                            strokeWidth={stroke.w}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={stroke.o}
                          />
                        ))}
                        {trunkInkPaths.map((stroke) => (
                          <path
                            key={stroke.d}
                            d={stroke.d}
                            fill="none"
                            stroke="#4a3425"
                            strokeWidth={stroke.w}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={stroke.o}
                          />
                        ))}
                        {rootInkPaths.map((stroke) => (
                          <path
                            key={stroke.d}
                            d={stroke.d}
                            fill="none"
                            stroke="#4a3425"
                            strokeWidth={stroke.w}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={stroke.o}
                          />
                        ))}
                      </g>
                    </>
                  )}

                  {allNodePoints.map((point, index) => (
                    <circle
                      key={`anchor-${point.x}-${point.y}-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={NODE_R + 1}
                      fill="#f6efe0"
                      stroke="#2f2f2f"
                      strokeWidth="1.6"
                      opacity="0.82"
                    />
                  ))}

                  <g className="mix-blend-multiply">
                    {identityToSelfLinks.map((link) => {
                      const traced = Boolean(
                        activeIdentityTrace && activeIdentityTrace.identityId === link.identityId,
                      );
                      return (
                        <path
                          key={link.key}
                          d={link.d}
                          fill="none"
                          stroke={traced ? traceColor : "#665343"}
                          strokeWidth={traced ? 3 : 1.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={traced ? 0.98 : 0.42}
                        />
                      );
                    })}

                    {selfToQuestLinks.map((link) => {
                      const traced = Boolean(
                        activeIdentityTrace && activeIdentityTrace.questIds.has(link.questId),
                      );
                      return (
                        <path
                          key={link.key}
                          d={link.d}
                          fill="none"
                          stroke={
                            traced
                              ? traceColor
                              : completedQuestSet.has(link.questId)
                                ? "#6c4e33"
                                : "#7b6855"
                          }
                          strokeWidth={traced ? 2.8 : completedQuestSet.has(link.questId) ? 1.9 : 1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={traced ? 0.98 : completedQuestSet.has(link.questId) ? 0.84 : 0.36}
                        />
                      );
                    })}

                    {questToActivityLinks.map((link) => {
                      const traced = Boolean(
                        activeIdentityTrace &&
                          activeIdentityTrace.questIds.has(link.questId) &&
                          activeIdentityTrace.activityIds.has(link.activityId),
                      );
                      return (
                        <path
                          key={link.key}
                          d={link.d}
                          fill="none"
                          stroke={
                            traced
                              ? traceColor
                              : completedQuestSet.has(link.questId)
                                ? "#75553a"
                                : "#8b7864"
                          }
                          strokeWidth={traced ? 2.4 : completedQuestSet.has(link.questId) ? 1.5 : 0.9}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={traced ? 0.96 : completedQuestSet.has(link.questId) ? 0.78 : 0.34}
                        />
                      );
                    })}

                    {activityToSkillLinks.map((link) => {
                      const traced = Boolean(
                        activeIdentityTrace &&
                          activeIdentityTrace.activityIds.has(link.activityId) &&
                          activeIdentityTrace.skillIds.has(link.skillId),
                      );
                      return (
                        <path
                          key={link.key}
                          d={link.d}
                          fill="none"
                          stroke={
                            traced
                              ? traceColor
                              : practicedActivitySet.has(link.activityId)
                                ? "#5e6a5c"
                                : "#9b9085"
                          }
                          strokeWidth={traced ? 2.2 : practicedActivitySet.has(link.activityId) ? 1.4 : 0.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={traced ? 0.94 : practicedActivitySet.has(link.activityId) ? 0.74 : 0.32}
                        />
                      );
                    })}

                    {meshLinks.map((link) => {
                      const traced = isMeshTraced(link);
                      return (
                        <path
                          key={link.key}
                          d={link.d}
                          fill="none"
                          stroke={traced ? traceColor : "#8f816f"}
                          strokeWidth={traced ? 1.8 : 0.75}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={traced ? 0.82 : 0.24}
                        />
                      );
                    })}
                  </g>

                  {activeIdentityTrace && (
                    <g>
                      {identityToSelfLinks
                        .filter((link) => link.identityId === activeIdentityTrace.identityId)
                        .map((link) => (
                          <TracePath key={`pulse-${link.key}`} d={link.d} color={traceColor} width={3.1} />
                        ))}

                      {selfToQuestLinks
                        .filter((link) => activeIdentityTrace.questIds.has(link.questId))
                        .map((link) => (
                          <TracePath key={`pulse-${link.key}`} d={link.d} color={traceColor} width={2.8} />
                        ))}

                      {questToActivityLinks
                        .filter(
                          (link) =>
                            activeIdentityTrace.questIds.has(link.questId) &&
                            activeIdentityTrace.activityIds.has(link.activityId),
                        )
                        .map((link) => (
                          <TracePath key={`pulse-${link.key}`} d={link.d} color={traceColor} width={2.4} />
                        ))}

                      {activityToSkillLinks
                        .filter(
                          (link) =>
                            activeIdentityTrace.activityIds.has(link.activityId) &&
                            activeIdentityTrace.skillIds.has(link.skillId),
                        )
                        .map((link) => (
                          <TracePath key={`pulse-${link.key}`} d={link.d} color={traceColor} width={2.2} />
                        ))}
                    </g>
                  )}

                  {identities.map((identity) => {
                    const traced = activeIdentityTrace?.identityId === identity.id;
                    const selectedNode = selected.type === "identity" && selected.id === identity.id;

                    return (
                      <SvgNode
                        key={identity.id}
                        x={identity.x}
                        y={identity.y}
                        label={identity.short}
                        title={`${identity.name}`}
                        fill={traced ? withAlpha(traceColor, "20") : "#ead9bf"}
                        stroke={traced ? traceColor : "#9c8667"}
                        selected={selectedNode}
                        onClick={() => selectNode("identity", identity.id)}
                        textColor="#1f2937"
                      />
                    );
                  })}

                  <SvgNode
                    x={selfNode.x}
                    y={selfNode.y}
                    label={selfNode.short}
                    title="self"
                    fill="#1f1b17"
                    stroke={selected.type === "self" ? traceColor : "#1f1b17"}
                    selected={selected.type === "self"}
                    onClick={() => selectNode("self", selfNode.id)}
                    textColor="#ffffff"
                  />

                  {quests.map((quest) => {
                    const traced = Boolean(
                      activeIdentityTrace && activeIdentityTrace.questIds.has(quest.id),
                    );
                    const selectedNode = selected.type === "quest" && selected.id === quest.id;

                    return (
                      <SvgNode
                        key={quest.id}
                        x={quest.x}
                        y={quest.y}
                        label={quest.short}
                        title={quest.name}
                        fill={
                          traced
                            ? withAlpha(traceColor, "1d")
                            : completedQuestSet.has(quest.id)
                              ? "#cdbba3"
                              : "#d8c8b2"
                        }
                        stroke={traced ? traceColor : "#9e8a72"}
                        selected={selectedNode}
                        onClick={() => selectNode("quest", quest.id)}
                        textColor="#1f2937"
                      />
                    );
                  })}

                  {activities.map((activity) => {
                    const traced = Boolean(
                      activeIdentityTrace && activeIdentityTrace.activityIds.has(activity.id),
                    );
                    const unlocked = unlockedActivitySet.has(activity.id);
                    const done = practicedActivitySet.has(activity.id);
                    const selectedNode = selected.type === "activity" && selected.id === activity.id;

                    return (
                      <SvgNode
                        key={activity.id}
                        x={activity.x}
                        y={activity.y}
                        label={activity.short}
                        title={activity.name}
                        fill={
                          traced
                            ? withAlpha(traceColor, "1c")
                            : done
                              ? "#b5c1c9"
                              : unlocked
                                ? "#c3ced6"
                                : "#d5dce1"
                        }
                        stroke={traced ? traceColor : "#8a98a4"}
                        selected={selectedNode}
                        onClick={() => selectNode("activity", activity.id)}
                        textColor="#1f2937"
                      />
                    );
                  })}

                  {skills.map((skill) => {
                    const traced = Boolean(
                      activeIdentityTrace && activeIdentityTrace.skillIds.has(skill.id),
                    );
                    const unlocked = unlockedSkillSet.has(skill.id);
                    const done = trainedSkillSet.has(skill.id);
                    const selectedNode = selected.type === "skill" && selected.id === skill.id;

                    return (
                      <SvgNode
                        key={skill.id}
                        x={skill.x}
                        y={skill.y}
                        label={skill.short}
                        title={skill.name}
                        fill={
                          traced
                            ? withAlpha(traceColor, "1d")
                            : done
                              ? "#b8c3ad"
                              : unlocked
                                ? "#c8d1be"
                                : "#d7dccf"
                        }
                        stroke={traced ? traceColor : "#8d997d"}
                        selected={selectedNode}
                        onClick={() => selectNode("skill", skill.id)}
                        textColor="#1f2937"
                      />
                    );
                  })}
            </svg>

            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-white/85 px-2 py-1 text-[10px] text-zinc-600">
              zoom: {Math.round(zoom * 100)}% · wheel to zoom · drag empty space to pan
            </div>

            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-xl border border-zinc-700/60 bg-[#f8efdd]/90 px-6 py-2 text-center shadow-[0_8px_22px_rgba(28,20,12,0.26)]">
              <p className="text-[22px] leading-none tracking-[0.12em] text-zinc-900">identitree</p>
              <p className="mt-1 text-[11px] tracking-[0.08em] text-zinc-600">
                a reflective map of who you are becoming
              </p>
            </div>

            {!hasReferenceImage && (
              <div className="pointer-events-none absolute bottom-16 right-3 rounded-lg bg-white/85 px-2 py-1 text-[10px] text-zinc-600">
                reference image not found at `/public/identitree-reference.png`
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {instructionsOpen && (
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute left-4 top-4 z-20 w-[320px] max-w-[calc(100%-2rem)]"
            >
              <Card className={INK_CARD_CLASS}>
                <CardHeader className="flex-col items-start pb-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">interaction notes</p>
                  <h2 className="text-2xl text-zinc-900">how to explore</h2>
                </CardHeader>
                <CardBody className="gap-4 pt-0">
                  <div className={`${INK_SECTION_CLASS} p-3`}>
                    <div className="space-y-2 text-xs text-zinc-700">
                      <p>
                        move around: drag empty canvas to pan. hold space and drag to pan from
                        anywhere.
                      </p>
                      <p>
                        zoom: use mouse wheel or trackpad pinch. zoom follows your cursor, like a map.
                      </p>
                      <p>
                        inspect: click any node to open its journal meaning in the right panel.
                      </p>
                      <p>
                        trace identities: click an identity fruit to light its full root pathway.
                      </p>
                      <p>reset run clears progress and recenters the tree.</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {intakeOpen && (
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute left-4 top-4 z-20 w-[370px] max-w-[calc(100%-2rem)]"
            >
              <Card className={INK_CARD_CLASS}>
                <CardHeader className="flex-col items-start pb-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">guided intake</p>
                  <h2 className="text-2xl text-zinc-900">journal conversation</h2>
                  {currentIntakePrompt && !intakeState.completed && (
                    <p className="text-xs text-zinc-600">
                      prompt {intakeState.currentStep + 1}/{intakePrompts.length}:{" "}
                      {currentIntakePrompt.label}
                    </p>
                  )}
                </CardHeader>
                <CardBody className="gap-3 pt-0">
                  <div className={`${INK_SECTION_CLASS} h-[290px] space-y-2 overflow-y-auto p-3`}>
                    {intakeState.messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`rounded-xl border p-2 text-xs leading-relaxed ${
                          message.role === "guide"
                            ? "border-zinc-700/35 bg-[#f9f1df] text-zinc-700"
                            : "border-zinc-900/45 bg-[#2d2016] text-zinc-100"
                        }`}
                      >
                        <p className="mb-1 text-[10px] uppercase tracking-[0.14em] opacity-80">
                          {message.role === "guide" ? "guide" : "you"}
                        </p>
                        <p>{message.text}</p>
                      </div>
                    ))}
                  </div>

                  {!intakeState.completed && (
                    <>
                      <Textarea
                        value={intakeInput}
                        onValueChange={setIntakeInput}
                        minRows={3}
                        maxRows={6}
                        classNames={{
                          inputWrapper: "bg-[#f9f1df] border border-zinc-700/45",
                          input: "text-sm text-zinc-800",
                        }}
                        placeholder={currentIntakePrompt?.placeholder ?? "write your reflection..."}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <Button size="sm" variant="flat" onPress={restartIntake}>
                          restart prompts
                        </Button>
                        <Button size="sm" color="warning" onPress={submitIntakeAnswer}>
                          send reflection
                        </Button>
                      </div>
                    </>
                  )}

                  {intakeState.completed && intakeState.recommendations && (
                    <div className={`${INK_SECTION_CLASS} space-y-2 p-3`}>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">mapped pathway</p>
                      <p className="text-xs text-zinc-700">{intakeState.recommendations.reflection}</p>
                      <p className="text-xs text-zinc-700">
                        next 48h promise:{" "}
                        <span className="font-semibold text-zinc-900">
                          {intakeState.recommendations.nextAction}
                        </span>
                      </p>
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-600">identity focus</p>
                        <div className="flex flex-wrap gap-1.5">
                          {intakeState.recommendations.identityIds.map((identityId) => {
                            const identity = identityById[identityId];
                            if (!identity) return null;
                            return (
                              <Chip key={identityId} size="sm" variant="flat" className={identity.tone}>
                                {identity.fruit} {identity.name}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-zinc-600">suggested quests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {intakeState.recommendations.questIds.map((questId) => {
                            const quest = questById[questId];
                            if (!quest) return null;
                            return (
                              <Chip key={questId} size="sm" variant="flat">
                                {quest.short}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Button size="sm" variant="flat" onPress={restartIntake}>
                          new check-in
                        </Button>
                        <Button size="sm" color="warning" onPress={applyIntakeFocus}>
                          focus this path
                        </Button>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {inspectorOpen && (
            <motion.div
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute right-4 top-4 z-20 h-[calc(100%-2rem)] w-[360px] max-w-[calc(100%-2rem)]"
            >
              <Card className={`h-full ${INK_CARD_CLASS}`}>
                <CardHeader className="flex-col items-start pb-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">reflective journal</p>
                  <h2 className="text-2xl text-zinc-900">selected thread</h2>
                </CardHeader>
                <CardBody className="gap-4 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`${INK_SECTION_CLASS} p-2 text-center`}>
                      <p className="text-lg font-semibold text-zinc-900">{completedQuests.length}</p>
                      <p className="text-[11px] text-zinc-500">quests</p>
                    </div>
                    <div className={`${INK_SECTION_CLASS} p-2 text-center`}>
                      <p className="text-lg font-semibold text-zinc-900">{practicedActivities.length}</p>
                      <p className="text-[11px] text-zinc-500">activities</p>
                    </div>
                    <div className={`${INK_SECTION_CLASS} p-2 text-center`}>
                      <p className="text-lg font-semibold text-zinc-900">{trainedSkills.length}</p>
                      <p className="text-[11px] text-zinc-500">skills</p>
                    </div>
                  </div>

                  <div className={`${INK_SECTION_CLASS} p-3`}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">identity xp</p>
                      <Chip color="warning" variant="flat" size="sm">
                        {totalXp} total
                      </Chip>
                    </div>
                    <div className="space-y-3">
                      {identityProgress.map((identity) => (
                        <div key={identity.id}>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-xs font-medium text-zinc-700">{identity.name}</p>
                            <Chip size="sm" variant="flat" className={identity.tone}>
                              {identity.xp}/{identity.maxXp}
                            </Chip>
                          </div>
                          <Progress
                            aria-label={`${identity.name} progress`}
                            value={identity.pct}
                            classNames={{
                              track: "bg-zinc-200",
                              indicator: "bg-zinc-900",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div className={`${INK_SECTION_CLASS} p-3`}>
                    {selected.type === "self" && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-zinc-900">ME · self core</p>
                        <p className="text-sm text-zinc-600">{selfNode.summary}</p>
                        <p className="text-xs text-zinc-500">{selfInsights.reflectionLine}</p>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">{selfInsights.questPct}%</p>
                            <p className="text-[11px] text-zinc-500">quest proof</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">{selfInsights.activityPct}%</p>
                            <p className="text-[11px] text-zinc-500">activity reps</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">{selfInsights.skillPct}%</p>
                            <p className="text-[11px] text-zinc-500">skill roots</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-3 text-xs text-zinc-600">
                          <p>
                            strongest signal:{" "}
                            <span className="font-semibold text-zinc-800">
                              {selfInsights.strongestIdentity
                                ? `${selfInsights.strongestIdentity.name} (${selfInsights.strongestIdentity.pct}%)`
                                : "none yet"}
                            </span>
                          </p>
                          <p className="mt-1">
                            growth edge:{" "}
                            <span className="font-semibold text-zinc-800">
                              {selfInsights.growthEdgeIdentity
                                ? `${selfInsights.growthEdgeIdentity.name} (${selfInsights.growthEdgeIdentity.pct}%)`
                                : "none yet"}
                            </span>
                          </p>
                          {selfInsights.nextQuest && (
                            <p className="mt-2">
                              next leverage move:{" "}
                              <span className="font-semibold text-zinc-800">
                                {selfInsights.nextQuest.short}
                              </span>{" "}
                              ({selfInsights.nextQuest.name}) to create new identity evidence.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedIdentity && selectedIdentityInsights && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedIdentity.short} · {selectedIdentity.fruit} {selectedIdentity.name}
                            </p>
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: selectedIdentity.traceColor }}
                            />
                          </div>
                          <Chip size="sm" variant="flat" className={selectedIdentity.tone}>
                            {selectedIdentityInsights.progress?.pct ?? 0}% embodied
                          </Chip>
                        </div>

                        <p className="text-sm text-zinc-600">{selectedIdentity.summary}</p>
                        <p className="text-xs text-zinc-500">{selectedIdentityInsights.momentumLine}</p>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedIdentityInsights.doneQuests.length}/
                              {selectedIdentityInsights.questList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">quests</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedIdentityInsights.practicedActivities.length}/
                              {selectedIdentityInsights.activityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">activities</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedIdentityInsights.reinforcedSkills.length}/
                              {selectedIdentityInsights.skillList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">skills</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                            why the connected nodes matter
                          </p>
                          <div className="mt-2 space-y-2">
                            {selectedIdentityInsights.meaningLines.map((line) => (
                              <div key={line.quest.id} className="rounded-md border border-zinc-700/45 bg-[#f9f1df] p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-zinc-800">
                                    {line.quest.short} · {line.quest.name}
                                  </p>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={completedQuestSet.has(line.quest.id) ? "success" : "default"}
                                  >
                                    {completedQuestSet.has(line.quest.id) ? "done" : "pending"}
                                  </Chip>
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-600">{line.quest.summary}</p>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  path meaning: {toNaturalList(line.activityNames) || "activity chain not set"}
                                  {" -> "}
                                  {toNaturalList(line.skillNames) || "skill roots not set"}.
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {selectedIdentityInsights.nextQuest && (
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f9f1df] p-2 text-xs text-zinc-600">
                            next high-leverage quest:{" "}
                            <span className="font-semibold text-zinc-800">
                              {selectedIdentityInsights.nextQuest.short}
                            </span>{" "}
                            ({selectedIdentityInsights.nextQuest.name})
                          </div>
                        )}
                      </div>
                    )}

                    {selectedQuest && selectedQuestInsights && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {selectedQuest.short} · quest
                        </p>
                        <p className="text-sm text-zinc-600">{selectedQuest.name}</p>
                        <p className="text-xs text-zinc-500">{selectedQuest.summary}</p>
                        <p className="text-xs text-zinc-500">{selectedQuestInsights.meaningLine}</p>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedQuestInsights.identityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">identities</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedQuestInsights.practicedActivityCount}/
                              {selectedQuestInsights.activityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">activities live</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedQuestInsights.reinforcedSkillCount}/
                              {selectedQuestInsights.skillList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">skills rooted</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">identity impact</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedQuestInsights.identityList.map((identity) => (
                              <Chip key={identity.id} size="sm" variant="flat" className={identity.tone}>
                                {identity.fruit} {identity.name}
                              </Chip>
                            ))}
                          </div>
                          <p className="mt-2 text-[11px] text-zinc-600">
                            xp reward: {selectedQuest.xp}. this is direct identity evidence, not only task completion.
                          </p>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f9f1df] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                            pathway unlocked by this quest
                          </p>
                          <div className="mt-2 space-y-2">
                            {selectedQuestInsights.activityList.map((activity) => (
                              <div key={activity.id} className="rounded-md border border-zinc-700/45 bg-[#f5ecd9] p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-zinc-800">
                                    {activity.short} · {activity.name}
                                  </p>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={practicedActivitySet.has(activity.id) ? "success" : "default"}
                                  >
                                    {practicedActivitySet.has(activity.id) ? "active" : "idle"}
                                  </Chip>
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-600">{activity.summary}</p>
                                <p className="mt-1 text-[11px] text-zinc-500">
                                  trains {toNaturalList(activity.skillIds.map((skillId) => skillById[skillId].name))}.
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          color="warning"
                          variant={completedQuestSet.has(selectedQuest.id) ? "flat" : "solid"}
                          onPress={() => toggleQuest(selectedQuest.id)}
                        >
                          {completedQuestSet.has(selectedQuest.id)
                            ? "mark quest as not done"
                            : "mark quest done"}
                        </Button>
                      </div>
                    )}

                    {selectedActivity && selectedActivityInsights && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {selectedActivity.short} · activity
                        </p>
                        <p className="text-sm text-zinc-600">{selectedActivity.name}</p>
                        <p className="text-xs text-zinc-500">{selectedActivity.summary}</p>
                        <p className="text-xs text-zinc-500">{selectedActivityInsights.meaningLine}</p>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedActivityInsights.doneUnlockQuests.length}/
                              {selectedActivityInsights.unlockQuests.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">unlock quests</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedActivityInsights.reinforcedSkillCount}/
                              {selectedActivityInsights.skillList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">skills rooted</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedActivityInsights.identityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">identities fed</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">upstream context</p>
                          <div className="mt-2 space-y-2">
                            {selectedActivityInsights.unlockQuests.map((quest) => (
                              <div key={quest.id} className="rounded-md border border-zinc-700/45 bg-[#f9f1df] p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-zinc-800">
                                    {quest.short} · {quest.name}
                                  </p>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={completedQuestSet.has(quest.id) ? "success" : "default"}
                                  >
                                    {completedQuestSet.has(quest.id) ? "open" : "locked"}
                                  </Chip>
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-600">{quest.summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f9f1df] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">downstream effect</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedActivityInsights.skillList.map((skill) => (
                              <Chip
                                key={skill.id}
                                size="sm"
                                variant="flat"
                                color={trainedSkillSet.has(skill.id) ? "success" : "default"}
                              >
                                {skill.short} · {skill.name}
                              </Chip>
                            ))}
                          </div>
                        </div>

                        <Button
                          color="success"
                          variant={practicedActivitySet.has(selectedActivity.id) ? "flat" : "solid"}
                          isDisabled={!unlockedActivitySet.has(selectedActivity.id)}
                          onPress={() => toggleActivity(selectedActivity.id)}
                        >
                          {practicedActivitySet.has(selectedActivity.id)
                            ? "mark activity as not practiced"
                            : "mark activity practiced"}
                        </Button>
                        {!unlockedActivitySet.has(selectedActivity.id) && (
                          <p className="text-xs text-zinc-500">
                            unlock this by completing one connected quest first.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedSkill && selectedSkillInsights && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {selectedSkill.short} · skill root
                        </p>
                        <p className="text-sm text-zinc-600">{selectedSkill.name}</p>
                        <p className="text-xs text-zinc-500">{selectedSkill.summary}</p>
                        <p className="text-xs text-zinc-500">{selectedSkillInsights.meaningLine}</p>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedSkillInsights.practicedActivityCount}/
                              {selectedSkillInsights.activityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">activities active</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedSkillInsights.completedQuestCount}/
                              {selectedSkillInsights.questList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">quests carrying it</p>
                          </div>
                          <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-2 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              {selectedSkillInsights.identityList.length}
                            </p>
                            <p className="text-[11px] text-zinc-500">identities lifted</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f5ecd9] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                            where this skill shows up
                          </p>
                          <div className="mt-2 space-y-2">
                            {selectedSkillInsights.activityList.map((activity) => (
                              <div key={activity.id} className="rounded-md border border-zinc-700/45 bg-[#f9f1df] p-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-zinc-800">
                                    {activity.short} · {activity.name}
                                  </p>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={practicedActivitySet.has(activity.id) ? "success" : "default"}
                                  >
                                    {practicedActivitySet.has(activity.id) ? "practiced" : "not active"}
                                  </Chip>
                                </div>
                                <p className="mt-1 text-[11px] text-zinc-600">{activity.summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-zinc-700/45 bg-[#f9f1df] p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">identity contribution</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedSkillInsights.identityList.map((identity) => (
                              <Chip key={identity.id} size="sm" variant="flat" className={identity.tone}>
                                {identity.fruit} {identity.name}
                              </Chip>
                            ))}
                          </div>
                        </div>

                        <Button
                          color="primary"
                          variant={trainedSkillSet.has(selectedSkill.id) ? "flat" : "solid"}
                          isDisabled={!unlockedSkillSet.has(selectedSkill.id)}
                          onPress={() => toggleSkill(selectedSkill.id)}
                        >
                          {trainedSkillSet.has(selectedSkill.id)
                            ? "mark skill as not reinforced"
                            : "reinforce skill"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className={`${INK_SECTION_CLASS} p-3`}>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">node key</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-600">
                      <p>identities: I1-I3</p>
                      <p>quests: Q1-Q4</p>
                      <p>activities: A1-A4</p>
                      <p>skills: S1-S5</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
