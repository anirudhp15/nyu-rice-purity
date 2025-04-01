import TestForm from "./components/TestForm";
import AdminDemoButton from "./components/AdminDemoButton";

export default function Home() {
  return (
    <main>
      <TestForm />
      {/* Admin demo button will only be visible in development mode */}
      <AdminDemoButton />
    </main>
  );
}
