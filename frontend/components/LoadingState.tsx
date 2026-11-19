import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "ACQUIRING GEOSPATIAL TELEMETRY...",
  className = "py-14",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-teal-400" />
      <p className="mt-3 text-xs text-teal-400/80 font-mono tracking-widest uppercase">{message}</p>
    </div>
  );
};
