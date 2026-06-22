import Navbar from "../../components/Navbar";
import { CheckCircle2, Globe2, Target, Users2 } from "lucide-react";

export const metadata = {
  title: "About Us | Xpensa",
  description: "Learn more about Xpensa and our mission to simplify expense management.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-product-surface relative pt-32 pb-20 text-white overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-0 mx-auto max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-teal-500 blur-[120px]" />
          <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-blue-500 blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl mb-6">
            Rethinking how teams handle expenses.
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            We built Xpensa because we believe that managing company money shouldn't require an accounting degree or endless email threads.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-700 mb-6">
              <Target className="h-4 w-4" /> Our Mission
            </div>
            <h2 className="text-4xl font-black mb-6">Built for speed, designed for trust.</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Xpensa was born out of frustration. We saw modern companies moving fast, but their financial tools were stuck in the past—relying on messy spreadsheets, lost physical receipts, and ambiguous approval chains.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our mission is to give every employee a seamless way to request funds, while giving finance teams absolute visibility and control over every penny spent.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-slate-200 overflow-hidden relative shadow-2xl">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Team collaborating" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/40 to-transparent"></div>
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px]">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black">10k+</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">Teams worldwide trust Xpensa daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black sm:text-4xl mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">The principles that guide every feature we build and every decision we make.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Transparency First", desc: "No hidden rules. Everyone knows exactly where an expense stands." },
              { title: "Zero Friction", desc: "If it takes more than 3 clicks to approve something, we redesign it." },
              { title: "Built for Humans", desc: "Software should adapt to how your team works, not the other way around." }
            ].map((value, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-teal-500 text-white rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
