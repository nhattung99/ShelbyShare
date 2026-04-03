export function LandingBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="pattern-dots absolute inset-0 opacity-20" />
      <div className="absolute top-[-5%] left-[-5%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[-5%] h-[30%] w-[30%] rounded-full bg-secondary/10 blur-[80px]" />
    </div>
  );
}
