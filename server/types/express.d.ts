declare global {
  namespace Express {
    interface Request {
      user?: any;
      tokenPayload?: any;
    }
  }
}

export {};
