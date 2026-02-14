import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-neutral-dark mb-8 font-serif">About Curate.</h1>
      <p className="text-xl text-gray-500 leading-relaxed mb-12 font-light">
        We believe that finding the right tools shouldn't be a chore. Our mission is to simplify your shopping experience through honest, data-driven recommendations.
      </p>

      <div className="aspect-video rounded-2xl overflow-hidden mb-12 shadow-sm">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" alt="Office" className="w-full h-full object-cover"/>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <p>
          Every year, thousands of new products flood the market. While choice is good, the noise can be overwhelming. Curate was founded on the principle that quality matters more than quantity.
        </p>
        <p>
          Our editorial team spends hundreds of hours researching, testing, and comparing products across various categories to ensure you only see the absolute best. We don't just list specs; we provide context on how these items fit into your daily life.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 py-8">
           <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-neutral-dark">Independent Research</h3>
              <p className="text-sm text-gray-500">We do not accept free products from manufacturers for review purposes to ensure 100% impartiality.</p>
           </div>
           <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-neutral-dark">Human-Verified</h3>
              <p className="text-sm text-gray-500">Every recommendation is vetted by a real person with expertise in the respective product category.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default About;