import { Document } from '../models/Document.js';
import { Note } from '../models/Note.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { Chat } from '../models/Chat.js';

export const searchRepository = {
  documents(userId, regex, limit) {
    return Document.find({
      owner: userId,
      status: 'ready',
      $or: [
        { title: regex },
        { subject: regex },
        { description: regex },
        { chunks: { $elemMatch: { text: regex } } },
      ],
    })
      .select({ title: 1, subject: 1, description: 1, fileName: 1, fileType: 1, createdAt: 1, 'chunks.$': 1 })
      .limit(limit)
      .lean()
      .exec();
  },

  notes(userId, regex, limit) {
    return Note.find({ user: userId, $or: [{ title: regex }, { body: regex }, { tags: regex }] })
      .select('title body type tags document createdAt')
      .limit(limit)
      .lean()
      .exec();
  },

  flashcards(userId, regex, limit) {
    return Flashcard.find({ user: userId, $or: [{ front: regex }, { back: regex }, { topic: regex }] })
      .select('front back topic mastery document')
      .limit(limit)
      .lean()
      .exec();
  },

  quizzes(userId, regex, limit) {
    return Quiz.find({ user: userId, $or: [{ title: regex }, { topic: regex }, { subject: regex }] })
      .select('title topic difficulty document subject createdAt')
      .limit(limit)
      .lean()
      .exec();
  },

  chats(userId, regex, limit) {
    return Chat.find({ user: userId, title: regex })
      .select('title document pinned createdAt updatedAt')
      .limit(limit)
      .lean()
      .exec();
  },
};
