import { Form } from "@remix-run/react";

export default function LoginButton() {
  return (
    <Form action="/login" method="post" className="login-form">
      <input
        type="text"
        name="handle"
        placeholder="Enter your handle (eg alice.bsky.social)"
        required
        className="w-full rounded-md border p-2"
      />
      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Log in with Bluesky
      </button>
    </Form>
  );
}
