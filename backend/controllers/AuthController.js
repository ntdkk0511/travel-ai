//
//database
import AuthService from "../services/AuthService.js";

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      if (!result) {
        return res.status(401).json({ message: "login failed" });
      }
      res.json(result);
    } catch (err) {
      console.error("login error:", err);
      res.status(500).json({ message: "server error" });
    }
  }

  static checkToken(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    try {
      const userData = AuthService.verifyToken(token);
      return res.json({ user: userData });
    } catch (err) {
      console.error("error:" + err);
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

export default AuthController;