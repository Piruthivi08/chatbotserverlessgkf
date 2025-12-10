const connectDB = require("./utils/db");
const response = require("./utils/response");
const Appointment = require("../../models/Appointment");

exports.handler = async (event) => {
  await connectDB();

  const method = event.httpMethod;
  const segments = event.path.split("/");
  const last = segments[segments.length - 1];

  const id = last && last !== "appointments" ? last : null;

  try {
    if (method === "GET" && !id) {
      return response(200, await Appointment.find());
    }

    if (method === "POST") {
      const data = JSON.parse(event.body);
      const appointment = await Appointment.create(data);
      return response(201, { message: "Created", appointment });
    }

    if (method === "GET" && id) {
      const item = await Appointment.findById(id);
      return item
        ? response(200, item)
        : response(404, { message: "Not found" });
    }

    if (method === "PUT") {
      const data = JSON.parse(event.body);
      const updated = await Appointment.findByIdAndUpdate(id, data, {
        new: true,
      });
      return updated
        ? response(200, updated)
        : response(404, { message: "Not found" });
    }

    if (method === "DELETE") {
      const deleted = await Appointment.findByIdAndDelete(id);
      return deleted
        ? response(200, { message: "Deleted" })
        : response(404, { message: "Not found" });
    }

    return response(405, { message: "Method not allowed" });
  } catch (err) {
    return response(500, { message: "Appointments error", error: err.message });
  }
};
