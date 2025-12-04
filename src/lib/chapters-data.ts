export type AnimationMode = 'orbit' | 'slide' | 'tilt' | 'zoom'

export type ActVariant = 'act-1' | 'act-2' | 'act-3'

export interface ChapterParagraph {
  text: string
  strong?: boolean
}

export interface ChapterData {
  act: string
  actVariant: ActVariant
  title: string
  index: number
  mode: AnimationMode
  designWidth: number
  designHeight: number
  iframeSrc: string
  iframeTitle: string
  lede: string
  heading: string
  paragraphs: Array<ChapterParagraph>
  meta?: string
  fullText?: boolean
}

export interface HeroData {
  kicker: string
  title: string
  titleSpan: string
  subtitle: string
  tags: Array<{ text: string; variant: 'good' | 'bad' | 'neutral' }>
  note: string
}

export const heroData: HeroData = {
  kicker: 'Scrollytelling • Space Exploration',
  title: "Space: humanity's greatest leap…",
  titleSpan: 'and its most expensive gamble.',
  subtitle:
    'Scroll to move through full-screen mission windows. Each one is a different data story: collaboration, budgets, failures, emissions, debris, and jobs.',
  tags: [
    { text: 'Innovation & cooperation', variant: 'good' },
    { text: 'Cost, risk & debris', variant: 'bad' },
    { text: 'Scaled widgets • No inner scrolling', variant: 'neutral' },
  ],
  note: 'Each visualization lives in its own HTML file (vivek1.html, sehas1.html, samyogita1.html, manya2.html, razan1.html, etc.). This page stitches them into one continuous space story and scales them to fit your screen.',
}

export const chapters: Array<ChapterData> = [
  {
    act: 'ACT I · Wonder & Promise',
    actVariant: 'act-1',
    title: 'A Planet Looking Up Together',
    index: 0,
    mode: 'orbit',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/vivek1.html',
    iframeTitle: 'International Cooperation Network',
    lede: 'The Spark',
    heading:
      'We stopped just dreaming about the sky—and started launching together.',
    paragraphs: [
      {
        text: "Looking up used to be myth. Now it's code, guidance computers, and launch windows. The surprising twist is that space stopped being a one-country race.",
      },
      {
        text: 'Behind almost every big mission is a web of shared risk and shared data.',
        strong: true,
      },
    ],
    meta: 'Each glowing line is a mission where exploration became diplomacy between flags.',
  },
  {
    act: 'ACT I · Wonder & Promise',
    actVariant: 'act-1',
    title: 'The Launch Boom',
    index: 1,
    mode: 'slide',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/sehas1.html',
    iframeTitle: 'Top Missions by Cost & Time',
    lede: 'The Launch Boom',
    heading: "Mission counts didn't just grow—they exploded.",
    paragraphs: [
      {
        text: 'Commercial rockets, reusable boosters, and satellite constellations turned launches from rare national events into an industry heartbeat.',
      },
      {
        text: 'The chart beneath you tracks how mission budgets, timelines, and outcomes stack up over time.',
      },
    ],
    meta: 'Hover through the years: are we slowing down, or racing faster than ever?',
  },
  {
    act: 'ACT I · Wonder & Promise',
    actVariant: 'act-1',
    title: 'The Hidden Gifts of Space',
    index: 2,
    mode: 'tilt',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/samyogita2.html',
    iframeTitle: 'Space Tech Spin-offs',
    lede: 'Hidden Gifts',
    heading:
      'Not every launch lands on a planet. Some land in hospitals and homes.',
    paragraphs: [
      {
        text: 'Each bubble stands for a technology shaped by space: medical scanners, GPS, robotics, water purification, precision farming.',
      },
    ],
    meta: 'Count how many of these orbit your daily life without you noticing.',
  },
  {
    act: 'ACT I · Wonder & Promise',
    actVariant: 'act-1',
    title: 'The Economic Uplift',
    index: 3,
    mode: 'zoom',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/vivek2.html',
    iframeTitle: 'Space Economy Sankey',
    lede: 'Economic Uplift',
    heading: 'From orbit to payroll: how space money turns into Earth jobs.',
    paragraphs: [
      {
        text: 'Investments in launch, satellites, and data downstream into jobs, salaries, and GDP contributions across sectors.',
      },
      {
        text: "Space doesn't just burn fuel; it pays people.",
        strong: true,
      },
    ],
    meta: 'Follow the thickest flows: they show where "space" has become economic infrastructure.',
  },
  {
    act: 'ACT II · The Cost of the Stars',
    actVariant: 'act-2',
    title: 'The Price Tag No One Sees',
    index: 4,
    mode: 'slide',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/sehas1.html',
    iframeTitle: 'Top Missions by Cost',
    lede: 'The Price Tag',
    heading: 'Try to guess the bill before the bars appear.',
    paragraphs: [
      {
        text: 'Year after year, budgets stack into tens of billions. Some missions cost more because they anchor decades of science.',
      },
    ],
    meta: 'Hover the tallest bars and note which flags sit behind the biggest cheques.',
  },
  {
    act: 'ACT II · The Cost of the Stars',
    actVariant: 'act-2',
    title: 'Failure in the Void',
    index: 5,
    mode: 'orbit',
    designWidth: 2500,
    designHeight: 800,
    iframeSrc: '/visualizations/sehas2.html',
    iframeTitle: 'Mission Cost vs Success',
    lede: 'Failure in the Void',
    heading:
      "When a mission fails, the wreckage is invisible—but the bill isn't.",
    paragraphs: [
      {
        text: 'Some dots in this timeline hide explosions, silent spacecraft, or missions that never arrived across roughly twenty-five years of missions.',
      },
    ],
    meta: "Focus on the failed missions: how many billions did we spend for those X's in the sky?",
  },
  {
    act: 'ACT II · The Cost of the Stars',
    actVariant: 'act-2',
    title: 'The Environmental Wake-Up Call',
    index: 6,
    mode: 'tilt',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/samyogita1.html',
    iframeTitle: 'Rocket Emissions Comparison',
    lede: 'Atmospheric Footprint',
    heading:
      'Rockets punch through layers of air most pollution never reaches.',
    paragraphs: [
      {
        text: 'Here, launches sit next to emissions from planes, homes, and transport. The totals might surprise you.',
      },
    ],
    meta: 'Toggle different sources and imagine the chemistry changes in the upper atmosphere.',
  },
  {
    act: 'ACT II · The Cost of the Stars',
    actVariant: 'act-2',
    title: 'Orbits Turning Into Junkyards',
    index: 7,
    mode: 'orbit',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/razan1.html',
    iframeTitle: 'Space Debris Story',
    lede: 'Debris',
    heading: 'Every failed launch stays in orbit long after the funding ends.',
    paragraphs: [
      {
        text: 'Low Earth orbit is turning into a shell of dead satellites and fragments.',
      },
    ],
    meta: 'Imagine building highways on Earth if crashed cars never rusted away or were removed.',
  },
  {
    act: 'ACT III · Finding the Balance',
    actVariant: 'act-3',
    title: 'The Race to the Future',
    index: 8,
    mode: 'slide',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '/visualizations/manya2.html',
    iframeTitle: 'Country Missions Over Time',
    lede: 'The Race',
    heading:
      "Nations aren't easing off the throttle—they're stepping harder on it.",
    paragraphs: [
      {
        text: 'This chart tracks countries competing and collaborating across decades. Lines climb, intersect, and surge as new players join the game.',
      },
    ],
    meta: 'Think of it as a mission leaderboard: the next chapter will be more crowded than the last.',
  },
  {
    act: 'Epilogue',
    actVariant: 'act-3',
    title: "The Question We're Really Asking",
    index: 9,
    mode: 'zoom',
    designWidth: 1400,
    designHeight: 800,
    iframeSrc: '',
    iframeTitle: '',
    lede: 'The Real Question',
    heading:
      'Is space our greatest engine for progress—or our most expensive distraction?',
    paragraphs: [
      {
        text: "You've seen two stories braided together: one where space sparks cooperation, innovation, and economic growth; another where it carries heavy costs in money, risk, emissions, and debris.",
      },
      {
        text: 'The truth sits somewhere between them. Space travel is risk and reward. Loss and discovery. Danger and possibility.',
      },
      {
        text: 'The next chapter is written launch by launch, mission by mission, choice by choice—by the people who decide what we send up, and what we choose to fix down here.',
        strong: true,
      },
    ],
    fullText: true,
  },
]
