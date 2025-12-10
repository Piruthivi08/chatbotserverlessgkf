const connectDB = require("./utils/db");
const response = require("./utils/response");
const AdoptionEnquiry = require("../../models/AdoptionEnquiry");

exports.handler = async (event) => {
  await connectDB();

  const method = event.httpMethod;
  const segments = event.path.split("/");
  const last = segments[segments.length - 1];

  const id = last && last !== "adoption" ? last : null;

  try {
    // GET /api/adoption
    if (method === "GET" && !id) {
      const data = await AdoptionEnquiry.find();
      return response(200, data);
    }

    // POST /api/adoption
    if (method === "POST") {
      const body = JSON.parse(event.body);
      const enquiry = await AdoptionEnquiry.create(body);
      return response(201, { message: "Enquiry created", enquiry });
    }

    // GET /api/adoption/:id
    if (method === "GET" && id) {
      const enquiry = await AdoptionEnquiry.findById(id);
      if (!enquiry) return response(404, { message: "Not found" });
      return response(200, enquiry);
    }

    // PUT /api/adoption/:id
    if (method === "PUT") {
      const body = JSON.parse(event.body);
      const updated = await AdoptionEnquiry.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!updated) return response(404, { message: "Not found" });
      return response(200, { message: "Updated", updated });
    }

    // DELETE /api/adoption/:id
    if (method === "DELETE") {
      const deleted = await AdoptionEnquiry.findByIdAndDelete(id);
      if (!deleted) return response(404, { message: "Not found" });
      return response(200, { message: "Deleted" });
    }

    return response(405, { message: "Method not allowed" });
  } catch (err) {
    return response(500, { message: "Adoption error", error: err.message });
  }
};
