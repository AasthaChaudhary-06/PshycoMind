import { examService } from '../services/exam.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const examController = {
  create: asyncHandler(async (req, res) => {
    const exam = await examService.create(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, exam, 'Exam created'));
  }),

  list: asyncHandler(async (req, res) => {
    const result = await examService.list(req.user._id, req.query);
    res.json(new ApiResponse(200, result, 'Exams retrieved'));
  }),

  get: asyncHandler(async (req, res) => {
    const exam = await examService.get(req.user._id, req.params.id);
    res.json(new ApiResponse(200, exam, 'Exam retrieved'));
  }),

  start: asyncHandler(async (req, res) => {
    const exam = await examService.start(req.user._id, req.params.id);
    res.json(new ApiResponse(200, exam, 'Exam started'));
  }),

  submit: asyncHandler(async (req, res) => {
    const result = await examService.submit(req.user._id, req.params.id, {
      answers: req.body.answers,
      startedAt: req.body.startedAt,
    });
    res.json(new ApiResponse(200, result, 'Exam submitted'));
  }),

  remove: asyncHandler(async (req, res) => {
    await examService.remove(req.user._id, req.params.id);
    res.json(new ApiResponse(200, null, 'Exam deleted'));
  }),
};
