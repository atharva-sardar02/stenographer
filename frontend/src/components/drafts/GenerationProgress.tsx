interface GenerationProgressProps {
  currentSection: 'facts' | 'liability' | 'damages' | 'demand' | null;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  currentSection,
  progress,
  estimatedTimeRemaining,
}) => {
  const getSectionLabel = (section: string | null) => {
    if (!section) return 'Preparing...';
    switch (section) {
      case 'facts':
        return 'Generating Facts Section';
      case 'liability':
        return 'Generating Liability Section';
      case 'damages':
        return 'Generating Damages Section';
      case 'demand':
        return 'Generating Demand Section';
      default:
        return 'Processing...';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {getSectionLabel(currentSection)}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Estimated time remaining: {formatTime(estimatedTimeRemaining)}
        </p>
      )}
    </div>
  );
};

