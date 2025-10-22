'use server'

import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short').max(2000, 'Message too long')
})

export async function submitContact (prevState: unknown, formData: FormData) {
  const values = Object.fromEntries(formData.entries()) as Record<string, unknown>
  const parse = schema.safeParse(values)
  if (!parse.success) {
    return { ok: false, errors: parse.error.flatten().fieldErrors }
  }
  // TODO: integrate mail or persistence later
  console.log('contact', parse.data)
  return { ok: true }
}


