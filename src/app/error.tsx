"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 text-center py-12">
      <div className="text-4xl mb-3">😥</div>
      <h2 className="text-lg font-semibold mb-2">出了点问题</h2>
      <p className="text-gray-600 text-sm mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        重试
      </button>
    </div>
  );
}
