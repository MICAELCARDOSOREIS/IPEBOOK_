import { useRouter } from "expo-router";
import CreateListing from "@/view/listings/createListing";

export default function AnunciarRoute() {
  const router = useRouter();

  return (
    <CreateListing
      sessionUserId={null}
      onCreated={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
