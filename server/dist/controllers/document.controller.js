import { documentService } from '../services/document.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const documentController = {
    upload: asyncHandler(async (req, res) => {
        const document = await documentService.upload({
            owner: req.user._id,
            file: req.file,
            subject: req.body.subject,
            description: req.body.description,
        });
        res.status(201).json(new ApiResponse(201, document, 'Document uploaded'));
    }),
    list: asyncHandler(async (req, res) => {
        const result = await documentService.listForUser(req.user._id, req.query);
        res.json(new ApiResponse(200, result, 'Documents retrieved'));
    }),
    get: asyncHandler(async (req, res) => {
        const document = await documentService.getForUser(req.params.id, req.user._id);
        res.json(new ApiResponse(200, document, 'Document retrieved'));
    }),
    getContent: asyncHandler(async (req, res) => {
        const document = await documentService.getForUser(req.params.id, req.user._id, {
            includeContent: true,
        });
        res.json(new ApiResponse(200, document, 'Document content retrieved'));
    }),
    update: asyncHandler(async (req, res) => {
        const document = await documentService.update(req.params.id, req.user._id, req.body);
        res.json(new ApiResponse(200, document, 'Document updated'));
    }),
    favorite: asyncHandler(async (req, res) => {
        const document = await documentService.toggleFavorite(req.params.id, req.user._id);
        res.json(new ApiResponse(200, document, 'Document favorited'));
    }),
    unfavorite: asyncHandler(async (req, res) => {
        const document = await documentService.removeFavorite(req.params.id, req.user._id);
        res.json(new ApiResponse(200, document, 'Document unfavorited'));
    }),
    remove: asyncHandler(async (req, res) => {
        await documentService.delete(req.params.id, req.user._id);
        res.json(new ApiResponse(200, null, 'Document deleted'));
    }),
};
//# sourceMappingURL=document.controller.js.map