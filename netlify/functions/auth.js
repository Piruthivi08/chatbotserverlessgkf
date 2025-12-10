const connectDB = require("./utils/db");
const response = require("./utils/response");
const AdminUser = require("../../models/AdminUser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  await connectDB();

  const method = event.httpMethod;
  const path = event.path;

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    // REGISTER
    if (path.includes("register") && method === "POST") {
      const { username, email, password, role } = body;

      const exists = await AdminUser.findOne({ $or: [{ email }, { username }] });
      if (exists) return response(400, { message: "User exists" });

      const user = await AdminUser.create({ username, email, password, role });
      return response(201, { message: "Registered", user });
    }

    // LOGIN
    if (path.includes("login") && method === "POST") {
      const { email, password } = body;

      const user = await AdminUser.findOne({ email });
      if (!user) return response(401, { message: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return response(401, { message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return response(200, { message: "Login OK", token, user });
    }

    return response(404, { message: "Unknown auth route" });
  } catch (err) {
    return response(500, { message: "Auth error", error: err.message });
  }
};
