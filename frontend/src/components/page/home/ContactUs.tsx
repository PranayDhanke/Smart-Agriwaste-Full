"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const t = useTranslations("home");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🚀 TODO: Add your form submission logic here (API, email service, etc.)
    console.log("Form Submitted:", formData);
    alert("Thank you! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          {/* View: "Contact Us" */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("contact.title")}</h1>
          {/* View: "We’d love to hear from you. Reach out for support, questions, or collaboration." */}
          <p className="text-lg text-green-100">{t("contact.subtitle")}</p>
        </div>
      </div>

      {/* Contact Form & Info */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        {/* Map / Placeholder */}
        <Card>
          <CardHeader>
            {/* View: "Our Location" */}
            <CardTitle>{t("contact.map.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* View: "🌍 Map Placeholder" */}
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
              {t("contact.map.placeholder")}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          {/* Contact Form */}
          <Card className="shadow-lg">
              <CardHeader>
              {/* View: "Send us a Message" */}
              <CardTitle className="text-2xl font-semibold">
                {t("contact.form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* View: "Your Name" */}
                <Input
                  placeholder={t("contact.form.namePlaceholder")}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {/* View: "Your Email" */}
                <Input
                  type="email"
                  placeholder={t("contact.form.emailPlaceholder")}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {/* View: "Your Message" */}
                <Textarea
                  placeholder={t("contact.form.messagePlaceholder")}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
                {/* Button view: <Send /> */}
                <Button
                  type="submit"
                  className="w-full flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> {t("contact.form.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Contact Info */}
          <Card>
            <CardHeader>
              {/* View: "Get in Touch" */}
              <CardTitle>{t("contact.info.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600" />
                <span>{t("contact.info.email")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <span>{t("contact.info.phone")}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>{t("contact.info.location")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
