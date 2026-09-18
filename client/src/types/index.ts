/**
 * Shared JSDoc type definitions for the PhysioMind client.
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'student'|'faculty'|'admin'} role
 * @property {string} [avatar]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Document
 * @property {string} _id
 * @property {string} title
 * @property {string} fileName
 * @property {string} fileUrl
 * @property {string} mimeType
 * @property {number} size
 * @property {number} pageCount
 * @property {string} [subject]
 * @property {string} [summary]
 * @property {string} owner
 * @property {boolean} bookmarked
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {'user'|'assistant'} role
 * @property {string} content
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctIndex
 * @property {string} [explanation]
 */

/**
 * @typedef {Object} Quiz
 * @property {string} _id
 * @property {string} documentId
 * @property {'easy'|'medium'|'hard'} difficulty
 * @property {Question[]} questions
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Flashcard
 * @property {string} id
 * @property {string} front
 * @property {string} back
 * @property {'weak'|'strong'} [strength]
 * @property {Date} [dueAt]
 */

export {}
