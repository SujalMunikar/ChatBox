import { useEffect, useState } from "react";
import { cn } from "../../helper/tailwindMergeClass.helper";

export default function LogoAnimation(props: { size?: string }) {
  const { size } = props;
  const name = "ChatterWave";
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % name.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [name.length]);

  return (
    <div
      className={cn(
        "text-[25px] sm:text-[40px] md:text-[60px] font-extrabold flex gap-2 text-white",
        {
          "md:text-[60px]": size === "lg" || size === undefined,
          "md:text-[50px]": size === "md",
          "md:text-[40px]": size === "sm",
        }
      )}
    >
      {name.split("").map((letter, index) =>
        letter === " " ? (
          <div key={index}>&nbsp;</div>
        ) : (
          <div
            key={index}
            className={cn(index === activeIndex ? "animate-char" : "")}
          >
            {letter}
          </div>
        )
      )}
    </div>
  );
}
