import { ContactForm } from "../../components/forms/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Contact</h1>
      <p className="text-white/70 mb-6">
        Send a message and I’ll get back soon.
      </p>
      <ContactForm />
    </div>
  );
}
