import { ActivityForm } from "@/components/provider/ActivityForm";
import { ProviderHeader } from "@/components/provider/ProviderHeader";

export default function NewProviderActivityPage() {
  return (
    <>
      <ProviderHeader title="Create activity" description="Add a new Moroccan experience with pricing, policies, and capacity." />
      <ActivityForm mode="create" />
    </>
  );
}
