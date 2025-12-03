"use server";

import { z } from "zod";
import { createSession, destroySession } from "./sesstion";
import { redirect } from "next/navigation";
import { getUserFromEmail } from "./users";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  // แปลง formData เป็นอ็อบเจ็กต์แบบที่มีชนิดที่ชัดเจน
  const formObject = Object.fromEntries(formData);
  
  const result = loginSchema.safeParse(formObject);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;
  const user = await getUserFromEmail(email);

  if(!user) {
    return {
      errors: {
        email: "Invalid email or password",
        password: "",
      },
    };
  }

  // ตรวจสอบ password ที่ถูก hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return {
      errors: {
        email: "Invalid email or password",
      },
    };
  }

  await createSession('1');
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
