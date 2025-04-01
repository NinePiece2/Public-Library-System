import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<div>Loading Search Page...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
