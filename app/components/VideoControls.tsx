export default function VideoControls({
  isPlaying,
  onPlayback,
}: {
  isPlaying: boolean;
  onPlayback: (state: "play" | "pause" | "skip") => void;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-4">
      <button
        onClick={() => onPlayback(isPlaying ? "pause" : "play")}
        className="text-white hover:text-blue-400 transition-colors"
      >
        {isPlaying ? (
          <PauseIcon className="w-6 h-6" />
        ) : (
          <PlayIcon className="w-6 h-6" />
        )}
      </button>

      <button
        onClick={() => onPlayback("skip")}
        className="text-white hover:text-blue-400 transition-colors"
      >
        <SkipIcon className="w-6 h-6" />
      </button>
    </div>
  );
}

// Icons
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SkipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}
