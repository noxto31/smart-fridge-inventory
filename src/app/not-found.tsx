import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-4 text-center py-12">
      <div className="text-4xl mb-3">🔍</div>
      <h2 className="text-lg font-semibold mb-2">页面未找到</h2>
      <p className="text-gray-600 text-sm mb-4">您访问的页面不存在</p>
      <Link
        href="/"
        className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
