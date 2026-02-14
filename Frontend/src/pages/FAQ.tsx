import React, { useState } from "react";
import { faqs } from "../data/faqs";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-neutral-dark font-serif mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Everything you need to know about Curate, our mission, and how we help
          you design the perfect small space.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
            >
              <span className="font-bold text-neutral-dark text-lg">
                {faq.question}
              </span>
              <span
                className={`material-icons-outlined text-gray-400 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180 text-primary" : ""
                }`}
              >
                expand_more
              </span>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center bg-gray-50 rounded-2xl p-12">
        <h3 className="text-xl font-bold text-neutral-dark mb-4">
          Still have questions?
        </h3>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          Can't find the answer you're looking for? Please chat to our friendly
          team.
        </p>
        <a
          href="#/feedback"
          className="inline-block px-8 py-3 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
};

export default FAQ;
