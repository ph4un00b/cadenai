"use client";

import { Suspense, useState, useTransition } from "react";
import { mutate, serve } from "waku/client";

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <h3>This is a client component.</h3>
    </div>
  );
};

export const CounterPromise = ({
  delayedMessage,
}: {
  delayedMessage: Promise<string>;
}) => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <h3>This is a client component.</h3>
      <Suspense fallback="Pending...">
        <Message count={count} delayedMessage={delayedMessage} />
      </Suspense>
    </div>
  );
};

const Message = ({
  count,
  delayedMessage,
}: {
  count: number;
  delayedMessage: Promise<string>;
}) => (
  <ul style={{ color: "red" }}>
    <li>count: {count}</li>
    <li>delayedMessage: {delayedMessage as any}</li>
  </ul>
);

export const CounterRPC = ({
  greet,
}: {
  greet: (name: string) => string | Promise<string>;
}) => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState<string | Promise<string>>("");
  const [isPending, startTransition] = useTransition();
  const handleClick = () => {
    startTransition(() => {
      setText(greet("c=" + count));
    });
  };
  return (
    <div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <p>
        <button onClick={handleClick}>
          greet("c=" + count) = {text as string}
        </button>{" "}
        {isPending ? "Pending..." : ""}
      </p>
      <h3>This is a client component.</h3>
    </div>
  );
};

export const CounterMutation = ({ increment }: { increment: () => void }) => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <p>
        <button onClick={() => mutate(() => increment())}>
          Increment server counter
        </button>
      </p>
      <h3>This is a client component.</h3>
    </div>
  );
};

// XXX This is not recommended in practice
// as it can easily make client server waterfalls.
const InnerApp = serve<{ count: number }>("InnerApp");

export const CounterNesting = ({ enableInnerApp = false }) => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ border: "3px blue dashed", margin: "1em", padding: "1em" }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      <h3>This is a client component.</h3>
      {enableInnerApp && <InnerApp count={count} />}
    </div>
  );
};
