import LaptopForm from "@/app/components/LaptopForm";
import { createLaptop } from "@/app/lib/actions";
import GlitchText from "@/app/components/GlitchText";

export default function NewLaptopPage() {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <GlitchText text="Add Laptop" as="h1" className="corp-heading text-[38px] leading-none" />
        <p className="mt-2 text-[13px] text-corp-400">
          Choose Apple or Windows — the fields below adjust to match.
        </p>
      </div>
      <LaptopForm action={createLaptop} submitLabel="Add to Stock" />
    </div>
  );
}
