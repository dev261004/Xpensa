"use client";

import Navbar from "../../components/Navbar";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Button, Input, Textarea } from "../../components/ui";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Navbar />
      
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl mb-6 text-slate-900">
              Get in touch
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions about pricing, features, or need technical support? Our team is ready to help you out.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 bg-slate-950 p-10 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
                <p className="text-slate-400 mb-12">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>

                <div className="space-y-8 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Phone</p>
                      <p className="text-slate-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      <p className="text-slate-400">hello@xpensa.demo</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Headquarters</p>
                      <p className="text-slate-400">100 Innovation Drive<br/>San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition cursor-pointer">X</div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition cursor-pointer">in</div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 p-10 lg:p-12">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
                  <p className="text-slate-500 text-lg">Thanks for reaching out. We'll get back to you shortly.</p>
                  <Button onClick={() => setSuccess(false)} className="mt-4">Send another message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input label="First Name" placeholder="Jane" required />
                    <Input label="Last Name" placeholder="Doe" required />
                  </div>
                  <Input label="Work Email" type="email" placeholder="jane@company.com" required />
                  <Input label="Company Name" placeholder="Acme Corp" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">How can we help?</label>
                    <Textarea placeholder="Tell us about your project or needs..." required className="h-32" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
