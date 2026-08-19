import LaptopForm from "@/app/components/LaptopForm";
import { createLaptop } from "@/app/lib/actions";

export default function NewLaptopPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Add Laptop</h1>
        <p className="mt-1 text-navy-400">
          Choose Apple or Windows — the fields below adjust to match.
        </p>
      </div>
      <LaptopForm action={createLaptop} submitLabel="Add to Stock" />
    </div>
  );
}
