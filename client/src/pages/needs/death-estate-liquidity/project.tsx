import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { ParameterPanel } from '@/components/project/parameter-panel';
import { ChartPanel } from '@/components/project/chart-panel';
import { OverviewDashboard } from '@/components/project/overview-dashboard';

export default function ProjectStep() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('gauge');
  const [parameters, setParameters] = useState({
    // Estate position parameters
    lifeCoverToEstate: 4000000,
    voluntaryInvestments: 7812990,
    accrualClaimSpouse: 0,
    dependantsSurplus: 0,
    ownEstateCapital: 0,
    
    // Capital required parameters
    estateDuty: 177457,
    executorsFees: 813573,
    settleClientLiabilities: 1380000,
    capitalGainsTax: 886663,
    mastersFee: 7000,
    deathBedFuneral: 60000,
    conveyancingValuation: 132130,
    accrualClaimToSpouse: 6081350,
    ownEstateCapitalRequired: 0
  });

  const handleParameterChange = (key: string, value: number | boolean) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const calculatedValues = {
    estatePosition: {
      provided: 11812990,
      required: 9538163,
      surplus: 2274827,
      percentage: 100.0
    },
    dependantsPosition: {
      provided: 6960118,
      required: 2252157,
      surplus: 4707961,
      percentage: 309.0
    },
    totalCapitalPosition: {
      provided: 16498281,
      required: 11790320,
      surplus: 4707961,
      percentage: 139.9
    },
    incomePosition: {
      provided: 79288,
      required: 55000,
      surplus: 24288,
      percentage: 144.2
    }
  };

  const chartTypeSelector = (
    <Select value={chartType} onValueChange={setChartType}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Chart type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="gauge">Gauge Charts</SelectItem>
        <SelectItem value="bar">Bar Charts</SelectItem>
        <SelectItem value="line">Line Charts</SelectItem>
        <SelectItem value="pie">Pie Charts</SelectItem>
        <SelectItem value="area">Area Charts</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <CalculatorHeader 
          title="Projections"
          additionalControls={chartTypeSelector}
          className="mb-6"
        >
          {/* Tab Navigation and Content */}
          <div className="px-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Custom Tab Navigation */}
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('estate')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'estate'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Estate Position
                  </button>
                  <button
                    onClick={() => setActiveTab('dependants')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'dependants'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dependants Position
                  </button>
                  <button
                    onClick={() => setActiveTab('capital')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'capital'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Total Capital Position
                  </button>
                  <button
                    onClick={() => setActiveTab('income')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'income'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Income Position
                  </button>
                </div>
              </div>

              {/* Overview Tab - Shows all 4 gauges */}
              <TabsContent value="overview">
                <OverviewDashboard 
                  data={calculatedValues}
                  chartType={chartType}
                />
              </TabsContent>

              {/* Individual Position Tabs */}
              <TabsContent value="estate">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ChartPanel
                      title="Estate Position"
                      data={calculatedValues.estatePosition}
                      chartType={chartType}
                      description="Shows the estate's capital position after death"
                    />
                  </div>
                  <div>
                    <ParameterPanel
                      title="Estate Position Parameters"
                      parameters={parameters}
                      onParameterChange={handleParameterChange}
                      section="estate"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dependants">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ChartPanel
                      title="Dependants Position"
                      data={calculatedValues.dependantsPosition}
                      chartType={chartType}
                      description="Shows capital provisions for dependants"
                    />
                  </div>
                  <div>
                    <ParameterPanel
                      title="Dependants Position Parameters"
                      parameters={parameters}
                      onParameterChange={handleParameterChange}
                      section="dependants"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="capital">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ChartPanel
                      title="Total Capital Position"
                      data={calculatedValues.totalCapitalPosition}
                      chartType={chartType}
                      description="Overall capital adequacy analysis"
                    />
                  </div>
                  <div>
                    <ParameterPanel
                      title="Total Capital Position Parameters"
                      parameters={parameters}
                      onParameterChange={handleParameterChange}
                      section="capital"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="income">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ChartPanel
                      title="Income Position"
                      data={calculatedValues.incomePosition}
                      chartType={chartType}
                      description="Monthly income provisions and requirements"
                    />
                  </div>
                  <div>
                    <ParameterPanel
                      title="Income Position Parameters"
                      parameters={parameters}
                      onParameterChange={handleParameterChange}
                      section="income"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}