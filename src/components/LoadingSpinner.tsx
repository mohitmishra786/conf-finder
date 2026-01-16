export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
      <span className="text-zinc-400">Loading conferences...</span>
    </div>
  );
}