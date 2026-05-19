import { motion } from 'framer-motion';

export const faqs = [
  {
    question: 'What automation tools do you specialize in?',
    answer: 'I specialize in n8n, Make (Integromat), Zapier, and custom API integrations. I build agentic AI workflows that connect CRMs, spreadsheets, and communication tools.',
  },
  {
    question: 'How much time can automation save my business?',
    answer: 'On average, my clients save 20-40 hours per week by eliminating manual data entry, follow-ups, and reporting tasks.',
  },
  {
    question: 'Do you work with clients internationally?',
    answer: 'Yes! I work remotely with clients across USA, Europe, and Asia. Time zone coordination is part of my workflow.',
  },
];

export const FAQ = () => (
  <section id="faq" className="py-20 px-6 bg-black text-white">
    <div className="max-w-4xl mx-auto">
      <motion.h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</motion.h2>
      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 p-6 rounded-xl border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
            <p className="text-gray-300">{faq.answer}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
