import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30">
                X
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Xpensa
              </span>
            </Link>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Smart expense management for modern teams. Track, manage, and optimize your spending with ease.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-slate-400 hover:text-teal-500 hover:-translate-y-1 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-500 hover:-translate-y-1 transition-all duration-300">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-500 hover:-translate-y-1 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-teal-500 hover:-translate-y-1 transition-all duration-300">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Features</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Pricing</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Integrations</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">About Us</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Careers</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Blog</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Terms of Service</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Cookie Policy</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-teal-600 hover:translate-x-1 inline-block text-sm transition-all duration-300">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Xpensa Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse-slow" /> by the Xpensa Team
          </div>
        </div>
      </div>
    </footer>
  );
}
