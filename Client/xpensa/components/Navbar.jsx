import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30 transition-transform group-hover:scale-105 group-hover:-rotate-3">
                X
              </div>
              <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Xpensa
              </span>
            </Link>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
              Customers
            </Link>
            <Link href="#" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
              Company
            </Link>
          </div>

          {/* Right side CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/admin/login" 
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link 
              href="/admin/register" 
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-slate-50 shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-400 hover:-translate-y-0.5 hover:shadow-teal-500/40"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button className="text-slate-500 hover:text-slate-900 p-2 focus:outline-none rounded-lg hover:bg-slate-100 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
