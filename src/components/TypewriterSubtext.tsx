import { useEffect, useState, useRef } from "react";

interface Props {
  text: string;
  delay?: number;
  className?: string;
}

function TypewriterSubtext({ text, delay = 150, className = "" }: Props) {
  const [displayed, setDisplayed] = useState("");
  const index = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayed(""); // reset text
    index.current = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayed((prev) => {
        const next = text.substring(0, index.current + 1);
        index.current++;

        if (index.current >= text.length && intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        return next;
      });
    }, delay);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, delay]);

  return (
    <p
      className={`text-gray-300 text-2xl md:text-3xl font-medium tracking-wide mt-6 md:mt-8 ${className}`}
    >
      {displayed}
      <span className="inline-block w-1 animate-blink">|</span>
    </p>
  );
}

export default TypewriterSubtext;
