"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContact } from "../../controllers/contact";

const FormSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short").max(2000),
});

type FormValues = z.infer<typeof FormSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(values: FormValues) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    const res = await submitContact({}, fd);
    if (res?.ok) reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          {...register("name")}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
        />
        {errors.name ? (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        ) : null}
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
        />
        {errors.email ? (
          <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
        ) : null}
      </div>
      <div>
        <label className="block text-sm mb-1">Message</label>
        <textarea
          rows={5}
          {...register("message")}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2"
        />
        {errors.message ? (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        ) : null}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-white/10 border border-white/20 hover:bg-white/15 disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
