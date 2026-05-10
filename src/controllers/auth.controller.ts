import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import safeExecute, { DefaultResponse } from "../utils/safe.execute";

const AuthController = {
  async register(req: Request, res: Response) {
    const { user_name, password, email } = req.body;
    const response: DefaultResponse<any> = await safeExecute(async () => {
      const result = await AuthService.register(
        user_name,
        password,
        email,
      );
      return { status: 201, message: "Đăng ký thành công", data: result };
    });

    if (response.error === "EMAIL_EXISTS") {
      response.status = 400;
      response.message = "Email đã tồn tại. Vui lòng chọn email khác!";
      delete response.error;
    }

    return res.status(response.status).json(response);
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const response: DefaultResponse<any> = await safeExecute(async () => {
      const result = await AuthService.login(email, password);
      return { status: 200, message: "Đăng nhập thành công", data: result };
    });

    // map lỗi từ service
    if (response.error === "USER_NOT_FOUND") {
      response.status = 404;
      response.message = "Không tìm thấy người dùng";
      delete response.error;
    } else if (response.error === "INVALID_PASSWORD") {
      response.status = 401;
      response.message = "Mật khẩu không đúng";
      delete response.error;
    }

    return res.status(response.status).json(response);
  },
};

export default AuthController;
