const authService = require('../services/authService');
const { sendCreated, sendSuccess, sendUnauthorized } = require('../middleware/responseFormatter');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, role } = req.body;
      const result = await authService.register(email, password, role);

      sendCreated(res, 'User registered successfully. You can now log in.', result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      sendSuccess(res, 200, 'Login successful. Welcome back!', result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user.userId);

      sendSuccess(res, 200, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
