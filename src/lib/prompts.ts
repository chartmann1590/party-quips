import type { FibbagePrompt } from '../types/fibbage'
import type { TriviaQuestion } from '../types/trivia'

export interface QuiplashPromptDef {
  id: string
  text: string
  category: string
}

// ── Quiplash Prompts ──────────────────────────────────────────────────────────

export const QUIPLASH_PROMPTS: QuiplashPromptDef[] = [
  // Jobs & Work
  { id: 'q001', text: 'A terrible superpower for a dentist', category: 'jobs' },
  { id: 'q002', text: 'The worst job interview answer you could give', category: 'jobs' },
  { id: 'q003', text: 'What a CEO actually does all day', category: 'jobs' },
  { id: 'q004', text: 'A new job title that sounds impressive but means nothing', category: 'jobs' },
  { id: 'q005', text: 'The worst thing to put on a business card', category: 'jobs' },
  { id: 'q006', text: 'An awful motivational poster for the office', category: 'jobs' },
  { id: 'q007', text: 'A job that should exist but doesn\'t', category: 'jobs' },

  // Food
  { id: 'q010', text: 'The worst thing to discover at a pizza buffet', category: 'food' },
  { id: 'q011', text: 'A food combination that would end a friendship', category: 'food' },
  { id: 'q012', text: 'What fast food workers whisper to the burgers', category: 'food' },
  { id: 'q013', text: 'A new flavor of ice cream that nobody asked for', category: 'food' },
  { id: 'q014', text: 'The worst name for a restaurant', category: 'food' },
  { id: 'q015', text: 'A "health food" that is definitely not healthy', category: 'food' },
  { id: 'q016', text: 'What chefs say when nobody\'s watching', category: 'food' },
  { id: 'q017', text: 'The most disappointing thing to find in a birthday cake', category: 'food' },

  // Animals
  { id: 'q020', text: 'What dogs actually think about when they stare at you', category: 'animals' },
  { id: 'q021', text: 'The first rule of being a cat', category: 'animals' },
  { id: 'q022', text: 'A rejected animal superpower', category: 'animals' },
  { id: 'q023', text: 'What squirrels are REALLY burying out there', category: 'animals' },
  { id: 'q024', text: 'What bears say to each other in the woods', category: 'animals' },
  { id: 'q025', text: 'If sharks had one request for humans', category: 'animals' },
  { id: 'q026', text: 'The worst pet a villain could have', category: 'animals' },
  { id: 'q027', text: 'What the seagulls are plotting', category: 'animals' },

  // Society & Daily Life
  { id: 'q030', text: 'The most passive-aggressive sticky note ever left in a shared fridge', category: 'society' },
  { id: 'q031', text: 'The world would be better if everyone just agreed to stop ___', category: 'society' },
  { id: 'q032', text: 'A new law nobody asked for but that would help everyone', category: 'society' },
  { id: 'q033', text: 'The real reason the internet was invented', category: 'society' },
  { id: 'q034', text: 'A terrible idea for a social media platform', category: 'society' },
  { id: 'q035', text: 'The worst thing to text your boss by accident', category: 'society' },
  { id: 'q036', text: 'Something everyone pretends to like but secretly hates', category: 'society' },
  { id: 'q037', text: 'The most polite way to tell someone their breath is terrible', category: 'society' },
  { id: 'q038', text: 'A sign that would cause the most chaos in an elevator', category: 'society' },
  { id: 'q039', text: 'What people are REALLY thinking at family dinners', category: 'society' },

  // Superhero / Fantasy
  { id: 'q040', text: 'The worst weakness for a superhero to have', category: 'superhero' },
  { id: 'q041', text: 'A superhero whose power sounds great but is actually useless', category: 'superhero' },
  { id: 'q042', text: 'What supervillains do on their day off', category: 'superhero' },
  { id: 'q043', text: 'The world\'s lamest secret identity', category: 'superhero' },
  { id: 'q044', text: 'The worst thing to say when you\'re supposed to be saving the world', category: 'superhero' },
  { id: 'q045', text: 'A spell that a terrible wizard would cast', category: 'superhero' },

  // Science & Technology
  { id: 'q050', text: 'The app that should NOT be invented', category: 'tech' },
  { id: 'q051', text: 'What AI actually says about humans when we\'re not listening', category: 'tech' },
  { id: 'q052', text: 'A futuristic invention nobody will actually use', category: 'tech' },
  { id: 'q053', text: 'The password hint that gives away everything', category: 'tech' },
  { id: 'q054', text: 'A terrible robot feature', category: 'tech' },
  { id: 'q055', text: 'What happens when the WiFi goes out and people forget how to function', category: 'tech' },

  // History & School
  { id: 'q060', text: 'Something historians definitely got wrong about ancient Rome', category: 'history' },
  { id: 'q061', text: 'What George Washington was REALLY thinking at Valley Forge', category: 'history' },
  { id: 'q062', text: 'The worst excuse a student has ever given for not doing homework', category: 'school' },
  { id: 'q063', text: 'A subject that should be taught in school but isn\'t', category: 'school' },
  { id: 'q064', text: 'The most useless thing you learned in school', category: 'school' },

  // Random Absurdity
  { id: 'q070', text: 'The worst thing to say at a wedding toast', category: 'absurd' },
  { id: 'q071', text: 'The most suspicious item on a receipt', category: 'absurd' },
  { id: 'q072', text: 'A terrible thing to whisper to a stranger on the subway', category: 'absurd' },
  { id: 'q073', text: 'The laziest way to solve a world problem', category: 'absurd' },
  { id: 'q074', text: 'What\'s actually happening inside vending machines at night', category: 'absurd' },
  { id: 'q075', text: 'A conspiracy theory that would make everything make MORE sense', category: 'absurd' },
  { id: 'q076', text: 'The worst thing to find in your seat on a plane', category: 'absurd' },
  { id: 'q077', text: 'What clowns tell each other at clown school', category: 'absurd' },
  { id: 'q078', text: 'The rejected tagline for a famous brand', category: 'absurd' },
  { id: 'q079', text: 'A theme park ride that should be shut down immediately', category: 'absurd' },
  { id: 'q080', text: 'What the moon is actually made of (scientists are lying)', category: 'absurd' },
  { id: 'q081', text: 'The one thing that would make chess more exciting', category: 'absurd' },
  { id: 'q082', text: 'Why aliens have never visited Earth', category: 'absurd' },
  { id: 'q083', text: 'The worst thing to name a baby', category: 'absurd' },
  { id: 'q084', text: 'The most unconvincing disguise', category: 'absurd' },
  { id: 'q085', text: 'A terrible product description for a toilet plunger', category: 'absurd' },
  { id: 'q086', text: 'What ghosts are actually doing in your house', category: 'absurd' },
  { id: 'q087', text: 'The one skill that would make someone unstoppable', category: 'absurd' },
  { id: 'q088', text: 'What\'s printed on the world\'s most useless trophy', category: 'absurd' },
  { id: 'q089', text: 'The worst inspirational quote of all time', category: 'absurd' },
  { id: 'q090', text: 'A terrible name for a new country', category: 'absurd' },
  { id: 'q091', text: 'What would happen if dogs could talk for one day', category: 'absurd' },
  { id: 'q092', text: 'The real reason socks always go missing in the dryer', category: 'absurd' },
  { id: 'q093', text: 'A rejected McDonald\'s mascot', category: 'absurd' },
  { id: 'q094', text: 'The worst possible thing to say in a job reference', category: 'absurd' },
  { id: 'q095', text: 'What pirates actually argued about', category: 'absurd' },
  { id: 'q096', text: 'The most cursed museum exhibit', category: 'absurd' },
  { id: 'q097', text: 'The thing you\'d find in Santa\'s search history', category: 'absurd' },
  { id: 'q098', text: 'The world\'s worst self-help book title', category: 'absurd' },
  { id: 'q099', text: 'A terrible slogan for a funeral home', category: 'absurd' },
  { id: 'q100', text: 'What the statue in the town square is ACTUALLY thinking', category: 'absurd' },

  // Final Lash prompts (used for round 3, all players answer same one)
  { id: 'ql01', text: 'The worst thing to say to your doctor', category: 'finallash' },
  { id: 'ql02', text: 'The ultimate excuse for being late', category: 'finallash' },
  { id: 'ql03', text: 'What would be written on a warning label for being a person', category: 'finallash' },
  { id: 'ql04', text: 'The most embarrassing thing that could happen at the gym', category: 'finallash' },
  { id: 'ql05', text: 'The real reason you never see Batman and Superman in the same room', category: 'finallash' },
  { id: 'ql06', text: 'The world\'s most unnecessary invention', category: 'finallash' },
  { id: 'ql07', text: 'Something a time traveler would hate about the future', category: 'finallash' },
]

// ── Fibbage Prompts ───────────────────────────────────────────────────────────

export const FIBBAGE_PROMPTS: Omit<FibbagePrompt, 'id' | 'playerEntries' | 'submitted' | 'choices'>[] = [
  { text: 'The original name for Google was ___', blank: '___', realAnswer: 'BackRub', category: 'tech' },
  { text: 'A day\'s worth of global internet traffic would fill ___ Libraries of Congress', blank: '___', realAnswer: '4 million', category: 'tech' },
  { text: 'In Japan, there is a museum dedicated entirely to ___', blank: '___', realAnswer: 'instant ramen', category: 'food' },
  { text: 'The world record for most T-shirts worn at once is ___', blank: '___', realAnswer: '260', category: 'records' },
  { text: 'Honey never spoils — archaeologists found 3000-year-old honey in ___ that was still edible', blank: '___', realAnswer: 'Egyptian tombs', category: 'history' },
  { text: 'Cleopatra lived closer in time to the moon landing than to ___ being built', blank: '___', realAnswer: 'the Great Pyramid', category: 'history' },
  { text: 'Oxford University is older than ___ by at least 300 years', blank: '___', realAnswer: 'the Aztec Empire', category: 'history' },
  { text: 'The country with the most naturally occurring lakes is ___', blank: '___', realAnswer: 'Canada', category: 'geography' },
  { text: 'A group of flamingos is called a ___', blank: '___', realAnswer: 'flamboyance', category: 'animals' },
  { text: 'Octopuses have ___ hearts', blank: '___', realAnswer: 'three', category: 'animals' },
  { text: 'The inventor of the frisbee was turned into a frisbee after death — his ashes were made into a frisbee by ___', blank: '___', realAnswer: 'his family\'s request', category: 'weird' },
  { text: 'The shortest war in history lasted ___ minutes', blank: '___', realAnswer: '38', category: 'history' },
  { text: 'The average cloud weighs about ___ pounds', blank: '___', realAnswer: '1.1 million', category: 'science' },
  { text: 'Butterflies taste with their ___', blank: '___', realAnswer: 'feet', category: 'animals' },
  { text: 'The country that consumes the most chocolate per capita is ___', blank: '___', realAnswer: 'Switzerland', category: 'food' },
  { text: 'IKEA is named after its founder, Ingvar Kamprad, and his farm in ___', blank: '___', realAnswer: 'Elmtaryd, Agunnaryd', category: 'business' },
  { text: 'It rains ___ on Venus', blank: '___', realAnswer: 'sulfuric acid', category: 'science' },
  { text: 'The hashtag symbol is technically called an ___', blank: '___', realAnswer: 'octothorpe', category: 'language' },
  { text: 'The most stolen book from public libraries is ___', blank: '___', realAnswer: 'the Guinness Book of World Records', category: 'books' },
  { text: 'A snail can sleep for ___ years', blank: '___', realAnswer: 'three', category: 'animals' },
  { text: 'The Great Wall of China was partly built with ___', blank: '___', realAnswer: 'sticky rice', category: 'history' },
  { text: 'The first YouTube video ever uploaded was about ___', blank: '___', realAnswer: 'elephants at a zoo', category: 'tech' },
  { text: 'The original color of Coca-Cola was ___', blank: '___', realAnswer: 'green', category: 'food' },
  { text: 'The fear of long words is called ___', blank: '___', realAnswer: 'hippopotomonstrosesquippedaliophobia', category: 'language' },
  { text: 'Scotland\'s national animal is the ___', blank: '___', realAnswer: 'unicorn', category: 'animals' },
  { text: 'The dot above the letter i is called a ___', blank: '___', realAnswer: 'tittle', category: 'language' },
  { text: 'The first item ever sold on eBay was a ___', blank: '___', realAnswer: 'broken laser pointer', category: 'business' },
  { text: 'The sun is about ___ times the size of Earth', blank: '___', realAnswer: '1.3 million', category: 'science' },
  { text: 'The world\'s largest snowflake was recorded in Montana in 1887 and measured ___ inches wide', blank: '___', realAnswer: '15', category: 'nature' },
  { text: 'The country that has won the most Nobel Prizes per capita is ___', blank: '___', realAnswer: 'Switzerland', category: 'education' },
  { text: 'Bananas are technically classified as a ___', blank: '___', realAnswer: 'herb', category: 'food' },
  { text: 'In 1998, Sony accidentally shipped ___ inside some of its floppy disks', blank: '___', realAnswer: 'a virus', category: 'tech' },
  { text: 'The world\'s oldest known living organism is ___ in California', blank: '___', realAnswer: 'a bristlecone pine', category: 'nature' },
  { text: 'The first animated feature film ever made was produced in ___', blank: '___', realAnswer: 'Argentina', category: 'entertainment' },
  { text: 'The average person walks the equivalent of ___ times around the world in a lifetime', blank: '___', realAnswer: 'five', category: 'science' },
  { text: 'Crows can remember human ___ for years', blank: '___', realAnswer: 'faces', category: 'animals' },
  { text: 'The world\'s most expensive spice by weight is ___', blank: '___', realAnswer: 'saffron', category: 'food' },
  { text: 'A shrimp\'s heart is located in its ___', blank: '___', realAnswer: 'head', category: 'animals' },
  { text: 'The only letter that doesn\'t appear in any US state name is ___', blank: '___', realAnswer: 'Q', category: 'geography' },
  { text: 'There are more possible iterations of a game of chess than there are ___ in the observable universe', blank: '___', realAnswer: 'atoms', category: 'science' },
]

// ── Trivia Questions ──────────────────────────────────────────────────────────

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't001', category: 'Geography', difficulty: 'easy',
    text: 'What is the capital of Australia?',
    options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'],
    correctIndex: 0,
  },
  {
    id: 't002', category: 'Science', difficulty: 'easy',
    text: 'What is the chemical symbol for gold?',
    options: ['Au', 'Ag', 'Fe', 'Go'],
    correctIndex: 0,
  },
  {
    id: 't003', category: 'Pop Culture', difficulty: 'easy',
    text: 'How many seasons of "The Office" (US) are there?',
    options: ['9', '7', '8', '10'],
    correctIndex: 0,
  },
  {
    id: 't004', category: 'History', difficulty: 'medium',
    text: 'In what year did World War I begin?',
    options: ['1914', '1916', '1918', '1912'],
    correctIndex: 0,
  },
  {
    id: 't005', category: 'Science', difficulty: 'medium',
    text: 'Which planet has the most moons?',
    options: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'],
    correctIndex: 0,
  },
  {
    id: 't006', category: 'Geography', difficulty: 'medium',
    text: 'Which country has the longest coastline?',
    options: ['Canada', 'Russia', 'Australia', 'Norway'],
    correctIndex: 0,
  },
  {
    id: 't007', category: 'Pop Culture', difficulty: 'easy',
    text: 'What color is Thanos\'s skin?',
    options: ['Purple', 'Blue', 'Green', 'Gray'],
    correctIndex: 0,
  },
  {
    id: 't008', category: 'Food', difficulty: 'easy',
    text: 'What is the main ingredient in guacamole?',
    options: ['Avocado', 'Tomato', 'Lime', 'Jalapeño'],
    correctIndex: 0,
  },
  {
    id: 't009', category: 'Science', difficulty: 'hard',
    text: 'What is the powerhouse of the cell?',
    options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'],
    correctIndex: 0,
  },
  {
    id: 't010', category: 'History', difficulty: 'hard',
    text: 'The Berlin Wall fell in what year?',
    options: ['1989', '1991', '1987', '1993'],
    correctIndex: 0,
  },
  {
    id: 't011', category: 'Sports', difficulty: 'easy',
    text: 'How many players are on a basketball team on the court at once?',
    options: ['5', '6', '4', '7'],
    correctIndex: 0,
  },
  {
    id: 't012', category: 'Music', difficulty: 'medium',
    text: 'Which band released the album "Dark Side of the Moon"?',
    options: ['Pink Floyd', 'Led Zeppelin', 'The Beatles', 'The Who'],
    correctIndex: 0,
  },
  {
    id: 't013', category: 'Science', difficulty: 'medium',
    text: 'How many bones are in the adult human body?',
    options: ['206', '212', '196', '225'],
    correctIndex: 0,
  },
  {
    id: 't014', category: 'Pop Culture', difficulty: 'medium',
    text: 'In "Harry Potter," what is the name of Harry\'s owl?',
    options: ['Hedwig', 'Errol', 'Pigwidgeon', 'Fawkes'],
    correctIndex: 0,
  },
  {
    id: 't015', category: 'Geography', difficulty: 'hard',
    text: 'What is the smallest country in the world by area?',
    options: ['Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
    correctIndex: 0,
  },
  {
    id: 't016', category: 'Language', difficulty: 'medium',
    text: 'What is the most spoken language in the world by native speakers?',
    options: ['Mandarin Chinese', 'English', 'Spanish', 'Hindi'],
    correctIndex: 0,
  },
  {
    id: 't017', category: 'Science', difficulty: 'easy',
    text: 'What gas do plants absorb from the atmosphere during photosynthesis?',
    options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
    correctIndex: 0,
  },
  {
    id: 't018', category: 'History', difficulty: 'medium',
    text: 'Who painted the Mona Lisa?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'],
    correctIndex: 0,
  },
  {
    id: 't019', category: 'Weird Facts', difficulty: 'hard',
    text: 'Which of these animals can survive being frozen solid?',
    options: ['Wood frog', 'Polar bear', 'Arctic fox', 'Siberian tiger'],
    correctIndex: 0,
  },
  {
    id: 't020', category: 'Pop Culture', difficulty: 'easy',
    text: 'What does the "E" in Chuck E. Cheese stand for?',
    options: ['Entertainment', 'Edward', 'Excellent', 'Eddy'],
    correctIndex: 0,
  },
]

// ── Utility ───────────────────────────────────────────────────────────────────

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomQuiplashPrompts(count: number, usedIds: Set<string> = new Set()): QuiplashPromptDef[] {
  const available = QUIPLASH_PROMPTS.filter(p => !usedIds.has(p.id) && p.category !== 'finallash')
  return shuffleArray(available).slice(0, count)
}

export function getRandomFinalLashPrompt(usedIds: Set<string> = new Set()): QuiplashPromptDef {
  const finalLash = QUIPLASH_PROMPTS.filter(p => p.category === 'finallash' && !usedIds.has(p.id))
  const shuffled = shuffleArray(finalLash)
  return shuffled[0] ?? QUIPLASH_PROMPTS.filter(p => p.category === 'finallash')[0]
}

export function getRandomFibbagePrompts(count: number): typeof FIBBAGE_PROMPTS {
  return shuffleArray(FIBBAGE_PROMPTS).slice(0, count)
}

export function getRandomTriviaQuestions(count: number): TriviaQuestion[] {
  return shuffleArray(TRIVIA_QUESTIONS).slice(0, count)
}
