const connectDB = require("./utils/db");
const response = require("./utils/response");
const ProgramApplication = require("../../models/ProgramApplication");

exports.handler = async (event) => {
  await connectDB();

  const method = event.httpMethod;
  const id = event.path.split("/").pop();

  try {
    if (method === "GET" && !id) return response(200, await ProgramApplication.find());

    if (method === "POST") {
      const body = JSON.parse(event.body);
      const app = await ProgramApplication.create(body);
      return response(201, { message: "Created", app });
    }

    if (method === "GET" && id) {
      const item = await ProgramApplication.findById(id);
      return item ? response(200, item) : response(404, { message: "Not found" });
    }

    if (method === "PUT") {
      const body = JSON.parse(event.body);
      const updated = await ProgramApplication.findByIdAndUpdate(id, body, { new: true });
      return updated ? response(200, updated) : response(404, { message: "Not found" });
    }

    if (method === "DELETE") {
      const deleted = await ProgramApplication.findByIdAndDelete(id);
      return deleted ? response(200, { message: "Deleted" }) : response(404, { message: "Not found" });
    }

    return response(405, { message: "Method not allowed" });
  } catch (err) {
    return response(500, { message: "Internship error", error: err.message });
  }
};
