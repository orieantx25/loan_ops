import raw from "@/data/students.json";
import { Dashboard } from "@/components/Dashboard";
import type { RawStudent } from "@/lib/types";

export default function HomePage() {
  return <Dashboard raw={raw as RawStudent[]} />;
}
