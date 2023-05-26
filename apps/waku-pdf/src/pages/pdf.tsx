import { Suspense } from "react";

export default function PDFPage({ name = "Anonymous" }) {
  return (
    <div style={{ border: "3px red dashed", margin: "1em", padding: "1em" }}>
      <h1>Hello {name}!!</h1>
      <h3>This is a server component.</h3>
    </div>
  );
}
