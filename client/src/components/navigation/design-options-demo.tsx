import { useState } from "react";
import { Link } from "wouter";
import { Palette, X } from "lucide-react";

export function DesignOptionsDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#016991] text-white p-3 rounded-full shadow-lg hover:bg-[#016991]/90 transition-colors z-50"
        title="View Navigation Design Options"
      >
        <Palette className="h-5 w-5" />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Navigation Design Options</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              <p className="text-gray-600">
                Compare different approaches for integrating secondary navigation with summary cards:
              </p>

              {/* Option previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option 1 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Option 1: Tabs in Card Header</h3>
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <div className="flex border-b mb-2">
                      <div className="px-3 py-1 bg-blue-100 text-blue-600 text-sm border-b-2 border-blue-600">
                        Retirement funds
                      </div>
                      <div className="px-3 py-1 text-gray-600 text-sm">
                        Defined benefit
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Retirement Funds</span>
                      <span className="text-sm text-gray-500">3 funds</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    ✓ Familiar tab pattern<br/>
                    ✓ Clear visual hierarchy<br/>
                    − Takes more vertical space
                  </p>
                </div>

                {/* Option 2 */}
                <div className="border rounded-lg p-4 border-green-200 bg-green-50">
                  <h3 className="font-semibold mb-2 text-green-800">Option 2: Pill Buttons (Recommended)</h3>
                  <div className="bg-white p-3 rounded mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Retirement Funds</span>
                        <div className="flex gap-1">
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                            Retirement funds
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Defined benefit
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">3 funds</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    ✓ Compact and modern<br/>
                    ✓ Saves vertical space<br/>
                    ✓ Matches existing patterns
                  </p>
                </div>

                {/* Option 3 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Option 3: Sidebar Navigation</h3>
                  <div className="bg-gray-50 p-3 rounded mb-3 flex">
                    <div className="w-32 bg-gray-100 p-2 mr-3 rounded">
                      <div className="text-xs font-medium mb-1">Retirement Funds</div>
                      <div className="bg-white px-2 py-1 text-xs rounded text-blue-600">
                        Retirement funds
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-500">3 funds</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    ✓ Good for many options<br/>
                    ✓ Always visible<br/>
                    − Takes horizontal space
                  </p>
                </div>

                {/* Option 4 */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Option 4: Dropdown Selector</h3>
                  <div className="bg-gray-50 p-3 rounded mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Retirement Funds</span>
                        <select className="px-2 py-1 border rounded text-sm">
                          <option>Retirement funds</option>
                          <option>Defined benefit funds</option>
                        </select>
                      </div>
                      <span className="text-sm text-gray-500">3 funds</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    ✓ Most compact<br/>
                    ✓ Familiar pattern<br/>
                    − Current selection less visible
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Recommendation:</strong> Option 2 (Pill Buttons) offers the best balance of compactness and clarity.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                  <Link href="/navigation-options">
                    <button
                      className="px-4 py-2 bg-[#016991] text-white rounded hover:bg-[#016991]/90"
                      onClick={() => setIsOpen(false)}
                    >
                      View Full Demo
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}