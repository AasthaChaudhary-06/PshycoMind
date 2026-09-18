import { noteService } from '../services/note.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const noteController = {
    create: asyncHandler(async (req, res) => {
        const note = await noteService.create(req.user._id, req.body);
        res.status(201).json(new ApiResponse(201, note, 'Note created'));
    }),
    list: asyncHandler(async (req, res) => {
        const result = await noteService.listNotes(req.user._id, req.query);
        res.json(new ApiResponse(200, result, 'Notes retrieved'));
    }),
    get: asyncHandler(async (req, res) => {
        const note = await noteService.getNote(req.user._id, req.params.id);
        res.json(new ApiResponse(200, note, 'Note retrieved'));
    }),
    update: asyncHandler(async (req, res) => {
        const note = await noteService.update(req.user._id, req.params.id, req.body);
        res.json(new ApiResponse(200, note, 'Note updated'));
    }),
    remove: asyncHandler(async (req, res) => {
        await noteService.delete(req.user._id, req.params.id);
        res.json(new ApiResponse(200, null, 'Note deleted'));
    }),
    generateSummary: asyncHandler(async (req, res) => {
        const note = await noteService.generateSummary(req.user._id, req.body);
        res.status(201).json(new ApiResponse(201, note, 'Summary generated'));
    }),
};
//# sourceMappingURL=note.controller.js.map