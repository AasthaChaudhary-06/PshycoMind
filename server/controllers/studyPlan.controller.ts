import { studyPlanService } from '../services/studyPlan.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const studyPlanController = {
  create: asyncHandler(async (req, res) => {
    const plan = await studyPlanService.create(req.user._id, req.body);
    res.status(201).json(new ApiResponse(201, plan, 'Study plan created'));
  }),

  list: asyncHandler(async (req, res) => {
    const result = await studyPlanService.list(req.user._id, req.query);
    res.json(new ApiResponse(200, result, 'Study plans retrieved'));
  }),

  get: asyncHandler(async (req, res) => {
    const plan = await studyPlanService.get(req.user._id, req.params.id);
    res.json(new ApiResponse(200, plan, 'Study plan retrieved'));
  }),

  updateTask: asyncHandler(async (req, res) => {
    const plan = await studyPlanService.updateTask(
      req.user._id,
      req.params.id,
      req.params.taskId,
      { completed: req.body.completed },
    );
    res.json(new ApiResponse(200, plan, 'Task updated'));
  }),

  remove: asyncHandler(async (req, res) => {
    await studyPlanService.remove(req.user._id, req.params.id);
    res.json(new ApiResponse(200, null, 'Study plan deleted'));
  }),
};
