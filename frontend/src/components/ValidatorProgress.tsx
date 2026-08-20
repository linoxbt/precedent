const STEPS = [
  "Retrieving nearest precedents",
  "Leader drafting ruling",
  "Validators grading (Non-Comparative EP)",
  "Writing accepted ruling to precedent store",
];

export default function ValidatorProgress({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-7 w-7 animate-pulse-soft rounded-full border-2 border-navy-300 bg-navy-100"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-navy-600">Validators reviewing...</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={`flex items-center gap-2 text-xs transition-colors ${
              i <= activeStep ? "text-navy-700" : "text-navy-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                i <= activeStep ? "bg-gold" : "bg-navy-200"
              }`}
            />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
