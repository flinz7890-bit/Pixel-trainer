export default function Logo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex flex-col items-center select-none">
      <div className={big ? "text-6xl pq-float" : "text-3xl"}>⚪</div>
      <div
        className={`font-extrabold tracking-tight ${big ? "text-4xl mt-2" : "text-xl"}`}
        style={{
          background: "linear-gradient(180deg,#fde047 0%,#f97316 70%,#dc2626 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextStroke: big ? "1px #1f2937" : "0.5px #1f2937",
        }}
      >
        Pokémon Quest
      </div>
    </div>
  );
}
