import StatisticsDisplay from "@/app/components/StatisticsDisplay";

export const metadata = {
  title: "Statistics - NYU/NYC Purity Test",
  description: "View detailed statistics from the NYU/NYC Purity Test",
};

export default function StatisticsPage() {
  return (
    <main className="min-h-screen py-8 px-pageMargin">
      <StatisticsDisplay />
    </main>
  );
}
