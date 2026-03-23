"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming you are still using sonner for toasts
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate an API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent successfully! We will get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-900 mb-4">Contact Us</h1>
          <p className="text-lg text-green-700/80 max-w-2xl mx-auto">
            Have questions about listing your agricultural waste or finding the right materials? 
            Our team is here to help. Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Visit Us</h3>
                <p className="text-gray-600 mt-1">
                  123 Green Agri Park, <br />
                  Farming District, 400001
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Email Us</h3>
                <p className="text-gray-600 mt-1">support@agriwaste.com</p>
                <p className="text-gray-600">hello@agriwaste.com</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 flex items-start gap-4 transition-transform hover:-translate-y-1">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Call Us</h3>
                <p className="text-gray-600 mt-1">+91 98765 43210</p>
                <p className="text-gray-600">Mon-Fri, 9am - 6pm</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                    <Input 
                      id="firstName" 
                      required 
                      placeholder="John" 
                      className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                    <Input 
                      id="lastName" 
                      required 
                      placeholder="Doe" 
                      className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="john@example.com" 
                    className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                  <Input 
                    id="subject" 
                    required 
                    placeholder="How can we help you?" 
                    className="h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700">Message</Label>
                  <textarea 
                    id="message" 
                    required 
                    rows={5}
                    placeholder="Write your message here..." 
                    className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}