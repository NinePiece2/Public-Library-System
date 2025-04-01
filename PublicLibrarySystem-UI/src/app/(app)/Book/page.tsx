import { Suspense } from "react";
import BookPageContent from "./BookPageContent";

export default function BookPageWrapper() {
  return (
    <Suspense fallback={<div>Loading Book...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
