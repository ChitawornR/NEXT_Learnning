"use client";
import { logout } from "../lib/actions";

export default function Page() {
  return (
    <div>
      <h1 className="text-5xl text-red-500">Dashboard</h1>
      <button
        onClick={() => logout()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}
