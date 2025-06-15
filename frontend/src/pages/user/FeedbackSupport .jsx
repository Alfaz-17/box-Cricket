import React, { useState } from "react";
import api from "../../utils/api";

const FeedbackSupport = () => {
  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setResponseMessage("");
  setErrorMessage(""); // Clear previous errors

  try {
    const res = await api.post("/boxes/support", form);

    if (res.status === 201) {
      setResponseMessage(res.data.message);
      setForm({ name: "", contactNumber: "", message: "" });
    }
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong. Please try again.";
    setErrorMessage(message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-base-300 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-4 text-center">
        Feedback & Support
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-primary">Name</span>
          </label>
          <input
            type="text"
            name="name"
            className="input input-bordered"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-primary">Contact Number</span>
          </label>
          <input
            type="text"
            name="contactNumber"
            className="input input-bordered"
            value={form.contactNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-primary">Message</span>
          </label>
          <textarea
            name="message"
            className="textarea textarea-bordered"
            rows={4}
            value={form.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

 {responseMessage && (
  <div className="alert alert-success mt-4">
    <span>{responseMessage}</span>
  </div>
)}

{errorMessage && (
  <div className="alert alert-error mt-4">
    <span>{errorMessage}</span>
  </div>
)}
    </div>
  );
};

export default FeedbackSupport;
