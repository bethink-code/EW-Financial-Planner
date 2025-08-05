import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Note: Using simple grid layout instead of resizable panels for now
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

  return (
    <div className="space-y-6">
      {/* Chart Type Selector in top-right */}
      <div className="flex justify-end">
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
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="estate">Estate Position</TabsTrigger>
          <TabsTrigger value="dependants">Dependants Position</TabsTrigger>
          <TabsTrigger value="capital">Total Capital Position</TabsTrigger>
          <TabsTrigger value="income">Income Position</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Shows all 4 gauges */}
        <TabsContent value="overview">
          <OverviewDashboard 
            data={calculatedValues}
            chartType={chartType}
          />
        </TabsContent>

        {/* Individual Position Tabs */}
        <TabsContent value="estate">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <ParameterPanel
                title="Estate Position Parameters"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                section="estate"
              />
            </div>
            <div className="col-span-7">
              <ChartPanel
                title="Estate Position"
                data={calculatedValues.estatePosition}
                chartType={chartType}
                description="Shows the estate's capital position after death"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dependants">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <ParameterPanel
                title="Dependants Position Parameters"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                section="dependants"
              />
            </div>
            <div className="col-span-7">
              <ChartPanel
                title="Dependants Position"
                data={calculatedValues.dependantsPosition}
                chartType={chartType}
                description="Shows capital provisions for dependants"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="capital">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <ParameterPanel
                title="Total Capital Position Parameters"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                section="capital"
              />
            </div>
            <div className="col-span-7">
              <ChartPanel
                title="Total Capital Position"
                data={calculatedValues.totalCapitalPosition}
                chartType={chartType}
                description="Overall capital adequacy analysis"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <ParameterPanel
                title="Income Position Parameters"
                parameters={parameters}
                onParameterChange={handleParameterChange}
                section="income"
              />
            </div>
            <div className="col-span-7">
              <ChartPanel
                title="Income Position"
                data={calculatedValues.incomePosition}
                chartType={chartType}
                description="Monthly income provisions and requirements"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}