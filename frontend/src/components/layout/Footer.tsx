import Link from "next/link";

const CATEGORIES = [
  "Pottery", "Textiles", "Jewelry", "Woodwork", "Metalwork",
  "Leather", "Painting", "Glass", "Stone Carving", "Bamboo Craft",
];

export default function Footer() {
  return (
    <footer className="bg-[var(--charcoal)] text-white mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--terracotta)] to-[var(--brass)] flex items-center justify-center">
                <span className="text-white font-bold text-lg font-display">K</span>
              </div>
              <span className="text-2xl font-display font-bold">KalaSetu</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Where Craft Meets Intelligence. Connecting India&apos;s finest artisans
              with the world through AI-powered product discovery.
            </p>
            <p className="text-xs text-gray-500">
              Empowering artisans. Preserving heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[var(--clay)] transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[var(--clay)] transition-colors text-sm">
                  Featured Artisans
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[var(--clay)] transition-colors text-sm">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-[var(--clay)] transition-colors text-sm">
                  Sell on KalaSetu
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${cat.toLowerCase().replace(" ", "_")}`}
                    className="text-gray-400 hover:text-[var(--clay)] transition-colors text-sm"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-gray-400 text-sm">help@kalasetu.com</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">+91-XXXX-XXXXXX</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Terms & Conditions</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 KalaSetu. Made with ❤️ for Indian artisans.
          </p>
          <p className="text-gray-600 text-xs">
            AI-powered cataloguing • Semantic search • Fair pricing
          </p>
        </div>
      </div>
    </footer>
  );
}
