import { Suspense } from "react";
import ConfirmEmailClient from "./ConfirmEmailClient";

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ConfirmEmailClient />
    </Suspense>
  );
}
