import { flashcardService } from '../services/flashcard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const flashcardController = {
  generate: asyncHandler(async (req, res) => {
    const cards = await flashcardService.generate(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, cards, 'Flashcards generated'));
  }),

  list: asyncHandler(async (req, res) => {
    const result = await flashcardService.list(req.user._id, req.query);
    res.json(new ApiResponse(200, result, 'Flashcards retrieved'));
  }),

  review: asyncHandler(async (req, res) => {
    const card = await flashcardService.review(req.user._id, req.params.id, {
      quality: req.body.quality,
    });
    res.json(new ApiResponse(200, card, 'Review recorded'));
  }),

  remove: asyncHandler(async (req, res) => {
    await flashcardService.delete(req.user._id, req.params.id);
    res.json(new ApiResponse(200, null, 'Flashcard deleted'));
  }),
};
