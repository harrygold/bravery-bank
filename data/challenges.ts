/**
 * 50 challenges for shy adults — optimized for Bravery Bank V1
 *
 * All challenges are:
 * - Completable solo (no dependency on other people's actions)
 * - Doable anywhere (home, work, outside)
 * - Small enough to feel safe, brave enough to feel real
 * - Organized by category from gentle grounding to genuine stretches
 *
 * Categories:
 * 1. Body & Breath (1-8)
 * 2. Digital Bravery (9-12)
 * 3. Small Communication (13-19)
 * 4. Speaking Up (20-23)
 * 5. Safe Observation (24-31)
 * 6. Self-Compassion (32-37)
 * 7. The Pause (38-42)
 * 8. Gentle Stretches (43-50)
 */
export const challenges: string[] = [
  // Body & Breath (1-8)
  "Inhale for 4 seconds, hold for 4, exhale for 4. Just once.",
  "Notice if your shoulders are tight. Drop them down and take one breath.",
  "Before switching tasks today, close your eyes and count to 3.",
  "Stand with your feet planted and your shoulders back for 10 seconds. Own the space you're in.",
  "Before your next task, close your eyes for 3 seconds, take one breath, and say 'I choose this' before you begin.",
  "Stretch your hands wide, spread your fingers, and hold for 5 seconds. Take up space.",
  "Walk to the other side of the room slower than feels normal. Pay attention to each step.",
  "Stand in a doorway or open space and stretch your arms up for 5 seconds.",
  // Digital Bravery (9-12)
  "Type a short message or note and save/send it without re-reading it.",
  "Read a draft message. Remove one '!' or emoji to make it sound calmer.",
  "Find a message or post you liked but never responded to. Go back and reply to it right now — even just a few words.",
  "Post a photo or a short status update somewhere today. It doesn't have to be perfect.",
  // Small Communication (13-19)
  "Type one extra sentence in a message you were going to keep very short.",
  "Next time you're about to text someone, call them instead. Even if it's just for 30 seconds.",
  "Send a message to someone you haven't talked to in a while. Just one line is enough.",
  "Add a small personal detail to a message instead of keeping it purely functional.",
  "Say 'good morning' to someone today — a neighbor, a barista, a coworker, or even someone passing by.",
  "Say 'I don't know' today — and leave it there. Don't rush to fix it.",
  "Ask one small clarifying question instead of just guessing.",
  // Speaking Up (20-23)
  "Share one opinion today that you'd normally keep to yourself. Even a small one counts.",
  "Ask for clarification on something without starting with 'Sorry to bother you'.",
  "The next time you think 'I don't care either way,' stop and pick one. Anything — what to eat, what to watch, which route to take.",
  "Think of something you've been overthinking. Make a decision on it right now — even if it's not perfect.",
  // Safe Observation (24-31)
  "Walk into a room or a store today like you belong there. Shoulders back, eyes up.",
  "Walk from your door to your destination with your chin parallel to the ground.",
  "Go outside for 5 minutes with nothing to do. No phone, no task. Just stand or walk and notice what's around you.",
  "Give a nod or small wave to a neighbor, delivery person, or passerby.",
  "Hold a door open for the next person behind you. Make eye contact and nod when they walk through.",
  "Smile at someone today — a cashier, a stranger, anyone. Let them see it.",
  "Say 'You too' or 'Have a good one' at the end of a transaction or call.",
  "Use someone's name today (a clerk, a colleague, or a friend) in conversation.",
  // Self-Compassion (32-37)
  "Say one nice thing about yourself out loud. It can feel weird. Do it anyway.",
  "Catch yourself mid-negative thought today. Say out loud: 'Nope, moving on.'",
  "Clean or organize one small thing — but set a 2-minute timer and stop when it goes off, even if it's not done.",
  "Do something nice for yourself today that you'd normally skip. A walk, a coffee, five minutes of nothing. No reason needed.",
  "Say 'No' to a tiny request or self-imposed obligation you don't have energy for.",
  "When you finish work or chores, say out loud: 'I am done for the day'.",
  // The Pause (38-42)
  "The next time someone finishes talking, let the silence sit for 2 seconds before you respond. Don't rush to fill it.",
  "Walk from one room to another 10% slower than your anxiety wants you to.",
  "Keep water nearby today. When you feel pressure to respond or react quickly, take a slow sip first.",
  "Do one tiny task you've been putting off. The smallest version counts.",
  "Eat one meal today in silence. No phone, no TV, no distractions. Just you and the food.",
  // Gentle Stretches (43-50)
  "Speak your first sentence of the day 10% louder than usual.",
  "Ask a question where you genuinely don't know the answer.",
  "Give someone a genuine compliment today. It doesn't have to be big — 'I like your shirt' counts.",
  "If you stumble over your words today, don't apologize. Just pause, breathe, and say it again.",
  "When deciding what to do, pick the option YOU want, not the easiest one.",
  "Ask someone for help with something today. It doesn't matter how small. Just say the words 'Can you help me with this?'",
  "End a conversation or call today by saying 'I'm going to head out' — no over-explaining, no apologizing for leaving.",
  "Tell someone what you've been doing. Say 'I've been working on being braver.' You don't have to explain the app. Just share that one sentence.",
];

export const getChallenge = (index: number): string => {
  return challenges[index % challenges.length];
};

export const getTotalChallenges = (): number => {
  return challenges.length;
};
