import { chatService } from '../services/chat.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const chatController = {
    create: asyncHandler(async (req, res) => {
        const chat = await chatService.createChat(req.user._id, req.body);
        res.status(201).json(new ApiResponse(201, chat, 'Chat created'));
    }),
    list: asyncHandler(async (req, res) => {
        const result = await chatService.listChats(req.user._id, req.query);
        res.json(new ApiResponse(200, result, 'Chats retrieved'));
    }),
    get: asyncHandler(async (req, res) => {
        const chat = await chatService.getChat(req.user._id, req.params.id);
        res.json(new ApiResponse(200, chat, 'Chat retrieved'));
    }),
    sendMessage: asyncHandler(async (req, res) => {
        const result = await chatService.sendMessage(req.user._id, req.params.id, {
            content: req.body.content,
            documentId: req.body.documentId,
        });
        res.json(new ApiResponse(200, result, 'Message sent'));
    }),
    rename: asyncHandler(async (req, res) => {
        const chat = await chatService.renameChat(req.user._id, req.params.id, req.body.title);
        res.json(new ApiResponse(200, chat, 'Chat renamed'));
    }),
    bookmark: asyncHandler(async (req, res) => {
        const chat = await chatService.toggleBookmark(req.user._id, req.params.id);
        res.json(new ApiResponse(200, chat, 'Bookmark toggled'));
    }),
    pin: asyncHandler(async (req, res) => {
        const chat = await chatService.togglePin(req.user._id, req.params.id);
        res.json(new ApiResponse(200, chat, 'Pin toggled'));
    }),
    remove: asyncHandler(async (req, res) => {
        await chatService.deleteChat(req.user._id, req.params.id);
        res.json(new ApiResponse(200, null, 'Chat deleted'));
    }),
};
//# sourceMappingURL=chat.controller.js.map