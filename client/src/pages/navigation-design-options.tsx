import { Option1, Option2, Option3, Option4 } from "@/components/navigation/integrated-summary-options";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function NavigationDesignOptions() {
  return (
    <div className="bg-[#EFF2F5] min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/retirement-funds">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ChevronLeft className="h-4 w-4" />
              Back to Retirement Funds
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Navigation Design Options</h1>
          <p className="text-gray-600">Compare different approaches for integrating secondary navigation with summary cards</p>
        </div>

        <div className="space-y-12">
          {/* Option 1 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Option 1: Tabs in Card Header</h2>
            <p className="text-sm text-gray-600 mb-4">
              Secondary navigation tabs are integrated directly into the card header with underline active indicator.
              Clean and familiar tab pattern.
            </p>
            <Option1 />
          </div>

          {/* Option 2 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Option 2: Pill Buttons in Header</h2>
            <p className="text-sm text-gray-600 mb-4">
              Navigation options as pill-shaped buttons next to the title. Compact and modern approach.
            </p>
            <Option2 />
          </div>

          {/* Option 3 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Option 3: Sidebar Navigation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Left sidebar within the card for navigation. Good for sections with many sub-pages.
            </p>
            <Option3 />
          </div>

          {/* Option 4 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Option 4: Dropdown Selector</h2>
            <p className="text-sm text-gray-600 mb-4">
              Simple dropdown selector for switching between sub-sections. Most compact option.
            </p>
            <Option4 />
          </div>
        </div>
      </div>
    </div>
  );
}