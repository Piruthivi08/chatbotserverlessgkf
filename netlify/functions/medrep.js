const connectDB = require("./utils/db");
const response = require("./utils/response");
const MedRepVisit = require("../../models/MedRepVisit");

exports.handler = async (event) => {
  await connectDB();

  const method = event.httpMethod;
  const id = event.path.split("/").pop();

  try {
    if (method === "GET" && !id) return response(200, await MedRepVisit.find());

    if (method === "POST") {
      const body = JSON.parse(event.body);
      const visit = await MedRepVisit.create(body);
      return response(201, { message: "Created", visit });
    }

    if (method === "GET" && id) {
      const item = await MedRepVisit.findById(id);
      return item ? response(200, item) : response(404, { message: "Not found" });
    }

    if (method === "PUT") {
      const body = JSON.parse(event.body);
      const updated = await MedRepVisit.findByIdAndUpdate(id, body, { new: true });
      return updated ? response(200, updated) : response(404, { message: "Not found" });
    }

    if (method === "DELETE") {
      const deleted = await MedRepVisit.findByIdAndDelete(id);
      return deleted ? response(200, { message: "Deleted" }) : response(404, { message: "Not found" });
    }

    return response(405, { message: "Method not allowed" });
  } catch (err) {
    return response(500, { message: "MedRep error", error: err.message });
  }
};
