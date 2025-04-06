"use client";
import { useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import FrontendLayout from "@/app/layouts/FrontendLayout";

export default function Page() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", email: "", message: "" });
      setStatus("Message sent!");
    } else {
      setStatus("Failed to send. Please try again.");
    }
  };

  return (
    <>
      <FrontendLayout>
        <Header />
        <div className="page-heading about-page-heading" id="top">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="inner-content">
                  <h2>Contact Us</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-us">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div id="map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=..."
                    width="100%"
                    height="400px"
                    frameBorder={0}
                    style={{ border: 0 }}
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="section-heading">
                  <h2>Say Hello. Don't Be Shy!</h2>
                  <span>Send us a quick message below!</span>
                </div>
                <form id="contact" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-6">
                      <fieldset>
                        <input
                          name="name"
                          type="text"
                          id="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </fieldset>
                    </div>
                    <div className="col-lg-6">
                      <fieldset>
                        <input
                          name="email"
                          type="email"
                          id="email"
                          placeholder="Your email"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </fieldset>
                    </div>
                    <div className="col-lg-12">
                      <fieldset>
                        <textarea
                          name="message"
                          rows={6}
                          id="message"
                          placeholder="Your message"
                          value={form.message}
                          onChange={handleChange}
                          required
                        />
                      </fieldset>
                    </div>
                    <div className="col-lg-12">
                      <fieldset>
                        <button type="submit" className="main-dark-button">
                          <i className="fa fa-paper-plane" /> Send
                        </button>
                        <p style={{ marginTop: "10px" }}>{status}</p>
                      </fieldset>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </FrontendLayout>
    </>
  );
}
