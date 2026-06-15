import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A2240] text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand — company-only wordmark in footer */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center text-lg font-bold tracking-tight mb-3">
              <span className="text-white">VictoryRev</span>
              <span className="text-[#C8102E]">Connect</span>
            </div>
            <p className="text-sm leading-relaxed">
              The social and AI mechanic app for serious boaters.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/boats" className="hover:text-white transition-colors">Supported Boats</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Business</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/business" className="hover:text-white transition-colors">List Your Business</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Mechanical Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© {new Date().getFullYear()} VictoryRevConnect. All rights reserved.</p>
          <p className="text-xs text-gray-500">
            Mechanical guidance is for reference only. Always consult a certified marine mechanic for safety-critical repairs.
          </p>
        </div>
      </div>
    </footer>
  );
}
