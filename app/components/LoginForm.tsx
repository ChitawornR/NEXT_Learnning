"use client";

import { useActionState } from "react";
import { login } from "../lib/actions";
import { useFormStatus } from "react-dom";

export default function LoginForm() {
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <form action={loginAction} className="flex max-w-[300px] flex-col gap-2">
      <div className="flex flex-col gap-2">
        <input id="email" name="email" type="email" placeholder="Email" className="border border-gray-200 p-2 mt-3" />
      </div>
      {/* handle error email */}
      {state?.errors?.email && <p className="text-red-500">{state.errors.email}</p>}

      
      <div className="flex flex-col gap-2">
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          className="border border-gray-200 p-2"
        />
      </div>
      {/* handle error password */}
      {state?.errors?.password && <p className="text-red-500">{state.errors.password}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
  return (
    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={pending} type="submit">
      Login
    </button>
  );
}
