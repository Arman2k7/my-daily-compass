import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadence — Today" },
      { name: "description", content: "Your daily dashboard for routine, water, meals and workouts." },
      { property: "og:title", content: "Cadence — Today" },
      { property: "og:description", content: "Your daily dashboard for routine, water, meals and workouts." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/today" });
  },
});
