import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

export const authController = {
  register: asyncHandler(async (req, res) => {
    const tokens = await authService.register(req.body);
    res.status(201).json(new ApiResponse(201, tokens, 'Account created successfully'));
  }),

  login: asyncHandler(async (req, res) => {
    const tokens = await authService.login(req.body);

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json(new ApiResponse(200, tokens, 'Logged in successfully'));
  }),

  refresh: asyncHandler(async (req, res) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    const tokens = await authService.refresh(token, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json(new ApiResponse(200, tokens, 'Token refreshed'));
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.body.refreshToken || req.cookies?.refreshToken);
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json(new ApiResponse(200, null, 'Logged out successfully'));
  }),

  me: asyncHandler(async (req, res) => {
    res.json(new ApiResponse(200, req.user.toSafeJSON(), 'Authenticated user'));
  }),
};
