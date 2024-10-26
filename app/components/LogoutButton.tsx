import { Form } from "@remix-run/react";

export default function LogoutButton() {
  return (
    <Form action="/logout" method="post">
      <button
        type="submit"
        className="absolute top-4 right-24 bg-black/50 hover:bg-black/70 text-white px-4 py-1 rounded-full text-sm transition-colors duration-200 flex items-center gap-2"
      >
        <LogoutIcon className="w-4 h-4" />
        Logout
      </button>
    </Form>
  );
}

function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
