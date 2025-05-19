
import ItemCostCalculator from "@/components/ItemCostCalculator";

const Index = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Item Cost Calculator</h1>
        <p className="text-gray-600 mt-2">
          Calculate costs for electrical components by entering quantities
        </p>
      </header>
      <div className="w-full overflow-hidden rounded-lg shadow-md bg-white">
        <ItemCostCalculator />
      </div>
    </div>
  );
};

export default Index;
