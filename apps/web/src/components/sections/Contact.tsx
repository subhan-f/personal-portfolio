import { motion } from "framer-motion";
import { ParticlesBackground } from "@components/shared/ParticlesBackground";
import { useState, useRef } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email({ error: "Invalid email" }),
  service: z.string().min(1, "Select a service"),
  budget: z.string().optional(),
  idea: z.string().min(1, "Please describe your idea"),
});

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const ContactForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionTimestamps = useRef<number[]>([]);

  const getFieldError = (field: string) => errors[field];

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);

    // Honeypot: if the hidden field has a value, it's a bot
    if (formData.get("website")) return;

    // Rate limiting
    const now = Date.now();
    submissionTimestamps.current = submissionTimestamps.current.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS
    );
    if (submissionTimestamps.current.length >= RATE_LIMIT_MAX) {
      setError("Too many submissions. Please try again in a few minutes.");
      return;
    }

    const data = Object.fromEntries(formData);
    delete data.website; // Remove honeypot field

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(z.flattenError(result.error).fieldErrors)) {
        if (msgs && msgs.length > 0) fieldErrors[key] = msgs[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const emailjs = await import("@emailjs/browser");
      await emailjs.send(
        import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
        import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
        result.data,
        import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY
      );
      submissionTimestamps.current.push(now);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full min-h-screen relative bg-black overflow-hidden text-white py-20 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10"
    >
      <ParticlesBackground />
      <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-10">
        <motion.div
          className="w-full md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.img
              src="https://res.cloudinary.com/dkcdwyrjl/image/upload/q_auto/f_auto/v1775601090/Astra_cueiuz.png"
              loading="lazy"
              alt="Contact"
              className="w-72 md:w-140 rounded-2xl shadow-lg object-cover"
            />
          </motion.div>
        </motion.div>
        <motion.div
          className="w-full md:w-1/2 bg-white/5 p-8 rounded-2xl shadow-lg border border-white/10"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Let's Work Together</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Honeypot - hidden from real users */}
            <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.name ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.name && <p className="text-red-500 text-xs">{getFieldError("name")}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">
                Your Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.email ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.email && <p className="text-red-500 text-xs">{getFieldError("email")}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">
                Service Needed <span className="text-red-500">*</span>
              </label>
              <select
                name="service"
                defaultValue=""
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.service ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              >
                <option value="" disabled>Something in mind?</option>
                <option value="AI Automation" className="text-black">AI Automation</option>
                <option value="AI / ML" className="text-black">AI / ML</option>
                <option value="Web Development" className="text-black">Web Development</option>
                <option value="Others" className="text-black">Others</option>
              </select>
              {errors.service && <p className="text-red-500 text-xs">{getFieldError("service")}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">
                Budget <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="budget"
                placeholder="Your Budget"
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.budget ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.budget && <p className="text-red-500 text-xs">{getFieldError("budget")}</p>}
            </div>

            <div className="flex flex-col">
              <label className="mb-1">
                Explain Your Idea <span className="text-red-500">*</span>
              </label>
              <textarea
                name="idea"
                rows={5}
                placeholder="Enter Your Idea..."
                className={`p-3 rounded-md bg-white/10 border ${
                  errors.idea ? "border-red-500" : "border-gray-500"
                } text-white focus:outline-none focus:border-blue-500`}
              />
              {errors.idea && <p className="text-red-500 text-xs">{getFieldError("idea")}</p>}
            </div>

            {success && <p className="text-green-400 text-sm">Message sent successfully ✅</p>}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            <motion.button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-md font-semibold transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
