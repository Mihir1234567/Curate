import React from "react";
import { Link } from "react-router-dom";

interface UnderConstructionProps {
  title: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-icons-outlined text-4xl text-gray-400">
          construction
        </span>
      </div>
      <h1 className="text-2xl font-bold text-neutral-dark mb-2">{title}</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        This feature is currently under development. Check back soon for
        updates!
      </p>
      <Link
        to="/admin"
        className="px-6 py-2 bg-primary text-neutral-dark font-bold rounded-lg hover:bg-neutral-dark hover:text-white transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default UnderConstruction;
