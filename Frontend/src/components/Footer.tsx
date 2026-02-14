import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link
            to="/"
            className="text-xl font-bold mb-6 block text-neutral-dark"
          >
            Curate.
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            A curated selection of affordable, high-quality home decor designed
            specifically for small apartments and young renters. We do the
            hunting, you do the living.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-neutral-dark">
            Contact
          </h5>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link
                to="/feedback"
                className="hover:text-primary transition-colors"
              >
                Send Feedback
              </Link>
            </li>
            <li>
              <Link
                to="/feedback"
                className="hover:text-primary transition-colors"
              >
                Collaborate
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-sm mb-6 uppercase tracking-widest text-neutral-dark">
            FAQ
          </h5>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link to="/faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-gray-100 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Some links on this site are affiliate links. We may earn a small
          commission at no extra cost to you.
        </p>
        <p className="text-xs text-gray-400">
          © 2026 Curate Home Decor. All rights reserved.
        </p>
        <Link
          to="/admin/login"
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors mt-4 block"
        >
          Admin Panel
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
