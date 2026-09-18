import { quizService } from '../services/quiz.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const quizController = {
    generate: asyncHandler(async (req, res) => {
        const quiz = await quizService.generateQuiz(req.user._id, req.body);
        res.status(201).json(new ApiResponse(201, quiz, 'Quiz generated'));
    }),
    list: asyncHandler(async (req, res) => {
        const result = await quizService.listQuizzes(req.user._id, req.query);
        res.json(new ApiResponse(200, result, 'Quizzes retrieved'));
    }),
    get: asyncHandler(async (req, res) => {
        const includeAnswers = req.query.withAnswers !== 'false';
        const quiz = await quizService.getQuiz(req.user._id, req.params.id, { includeAnswers });
        res.json(new ApiResponse(200, quiz, 'Quiz retrieved'));
    }),
    start: asyncHandler(async (req, res) => {
        const quiz = await quizService.getQuiz(req.user._id, req.params.id, { includeAnswers: false });
        res.json(new ApiResponse(200, quiz, 'Quiz started'));
    }),
    submit: asyncHandler(async (req, res) => {
        const result = await quizService.submitAttempt(req.user._id, req.params.id, {
            answers: req.body.answers,
            startedAt: req.body.startedAt,
        });
        res.json(new ApiResponse(200, result, 'Quiz submitted'));
    }),
    remove: asyncHandler(async (req, res) => {
        await quizService.deleteQuiz(req.user._id, req.params.id);
        res.json(new ApiResponse(200, null, 'Quiz deleted'));
    }),
};
//# sourceMappingURL=quiz.controller.js.map