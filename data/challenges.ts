/**
 * 50 ultra-safe challenges for shy adults
 * 
 * All challenges are:
 * - Doable at home
 * - Doable without other people if necessary
 * - < 30 seconds of effort
 * - Emotionally tiny
 * - Not culturally weird/aggressive
 */

export const challenges: string[] = [
  // Breath & Body (1-10)
  "Take one slow, deeper breath before you reply to someone today.",
  "Let yourself pause for 2 seconds before responding in a conversation.",
  "Put your phone down and look around the room for 5 seconds.",
  "Notice your feet on the ground right now. That's it.",
  "Take one breath where the exhale is longer than the inhale.",
  "Unclench your jaw right now. Notice how that feels.",
  "Roll your shoulders back once, just to check in with your body.",
  "Place your hand on your chest for 3 seconds. Just notice.",
  "Take one conscious breath before opening an app.",
  "Sit up a little straighter for just 10 seconds.",

  // Small communication (11-20)
  "Type one extra sentence in a message you were going to keep very short.",
  "If someone says 'thank you', let yourself say 'you're welcome' out loud.",
  "If you're on a call, say 'hi' out loud once, even briefly.",
  "Send a message to someone you haven't talked to in a while. Just one line is enough.",
  "Add a small personal detail to a message instead of keeping it purely functional.",
  "Say 'good morning' or 'good night' out loud, even if no one hears.",
  "If you agree with something, let yourself nod visibly.",
  "Let yourself say 'I don't know' without immediately trying to fix it.",
  "Ask one small clarifying question instead of just guessing.",
  "If you have an opinion, share one word of it. Just one word counts.",

  // Self-acknowledgment (21-30)
  "Notice one moment today when you wanted to disappear. Just notice it — no need to change it.",
  "Acknowledge one small thing you did well today, even silently.",
  "Let yourself feel proud of something tiny you accomplished.",
  "Notice when you're being hard on yourself. That's the whole challenge.",
  "Give yourself permission to not respond to something immediately.",
  "Acknowledge that you showed up today. That counts.",
  "Notice one thing you're curious about, even if you don't pursue it.",
  "Let yourself want something, even if you don't ask for it yet.",
  "Recognize one boundary you held today, even a small one.",
  "Notice one moment where you chose comfort. That's okay.",

  // Tiny presence (31-40)
  "Make eye contact with yourself in a mirror for 2 seconds.",
  "Stand in a doorway for a moment before walking through.",
  "Let yourself take up a little more space where you're sitting.",
  "Notice the sounds around you for 5 seconds without labeling them.",
  "Look out a window for 10 seconds. Just look.",
  "Let yourself move a bit slower for the next minute.",
  "Notice the texture of something you're touching right now.",
  "Take one action without checking your phone first.",
  "Let yourself be still for 10 seconds. No scrolling, no tasks.",
  "Notice the temperature of the air on your skin.",

  // Gentle action (41-50)
  "Do one tiny task you've been putting off. The smallest version counts.",
  "Close one browser tab you don't need.",
  "Put one thing back where it belongs.",
  "Drink a sip of water consciously, noticing the sensation.",
  "Write down one thought, even if it's just a few words.",
  "Let yourself leave something unfinished without guilt.",
  "Choose one small comfort for yourself today.",
  "Set one thing aside that's overwhelming you. Just for now.",
  "Let yourself say 'that's enough for today' about something.",
  "End this moment gently. You did something brave by being here.",
];

export const getChallenge = (index: number): string => {
  return challenges[index % challenges.length];
};

export const getTotalChallenges = (): number => {
  return challenges.length;
};
