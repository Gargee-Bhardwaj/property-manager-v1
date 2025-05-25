'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { X } from 'lucide-react';

export default function Overview() {
  // Dummy data for charts
  const expensesData = [
    { name: '1 Gton', purchaseFuel: 1.2, stoner: 1.0, percentage: '2%' },
    { name: '2 Gton', purchaseFuel: 2.5, stoner: 2.2, percentage: '250' },
    { name: '2 Gtonn', purchaseFuel: 4.0, stoner: 2.5, percentage: '3%' },
    { name: '3 Gton', purchaseFuel: 5.5, stoner: 3.0, percentage: '3%' },
    { name: '4 Gton', purchaseFuel: 2.5, stoner: 1.0, percentage: '' },
    { name: '5 Rotemann', purchaseFuel: 6.0, stoner: 1.2, percentage: '3%' }
  ];

  const plotsSoldData = [
    { name: '6 Gton', volumeFruit: 1500, stoner: 500 },
    { name: '3.50ton', volumeFruit: 6000, stoner: 200 },
    { name: '6.30tonn', volumeFruit: 4500, stoner: 6500 },
    { name: '4.33ton', volumeFruit: 1200, stoner: 300 },
    { name: '5.90ton', volumeFruit: 6200, stoner: 6500 }
  ];

  const lineData = [
    { name: 'Apr', bacon: 800, potatoes: 750, vintage: 820 },
    { name: '1 mton', bacon: 650, potatoes: 600, vintage: 680 },
    { name: '5.0 ton', bacon: 500, potatoes: 480, vintage: 520 },
    { name: '1.6 ton', bacon: 750, potatoes: 720, vintage: 780 },
    { name: '2.8 ton', bacon: 650, potatoes: 600, vintage: 670 },
    { name: '4.0 ton', bacon: 900, potatoes: 850, vintage: 920 },
    { name: '5.0 ton', bacon: 950, potatoes: 900, vintage: 980 }
  ];

  const plotApartmentsData = [
    { name: 'Jan', plotStarts: 600, plotaData: 650, plotaData2: 700, plotStone: 550, plotHorse: 580, x2Fag: 620 },
    { name: 'Feb', plotStarts: 700, plotaData: 720, plotaData2: 750, plotStone: 680, plotHorse: 690, x2Fag: 710 },
    { name: '10ton', plotStarts: 650, plotaData: 680, plotaData2: 700, plotStone: 630, plotHorse: 650, x2Fag: 670 },
    { name: '15g', plotStarts: 750, plotaData: 780, plotaData2: 800, plotStone: 720, plotHorse: 740, x2Fag: 760 },
    { name: '20 ton', plotStarts: 800, plotaData: 820, plotaData2: 850, plotStone: 780, plotHorse: 790, x2Fag: 810 },
    { name: 'Apr', plotStarts: 750, plotaData: 770, plotaData2: 800, plotStone: 730, plotHorse: 750, x2Fag: 770 },
    { name: 'May', plotStarts: 650, plotaData: 670, plotaData2: 690, plotStone: 630, plotHorse: 640, x2Fag: 660 }
  ];

  const intesempeatleData = [
    { name: 'Alt', value: 40 },
    { name: 'Sept', value: 45 },
    { name: 'June', value: 55 },
    { name: 'Sept', value: 50 },
    { name: 'Pit', value: 60 }
  ];

  const plotsPieData = [
    { name: 'Major', value: 70, color: '#4A90E2' },
    { name: 'Minor', value: 25, color: '#D2691E' },
    { name: 'Other', value: 5, color: '#F4A460' }
  ];

  const pimshareData = [
    { name: 'Primary', value: 70, color: '#4A90E2' },
    { name: 'Secondary', value: 25, color: '#D2691E' },
    { name: 'Other', value: 5, color: '#87CEEB' }
  ];

  const intesempeatlePieData = [
    { name: 'Sucamtion', value: 60, color: '#4A90E2' },
    { name: 'Other', value: 20, color: '#D2691E' },
    { name: 'Empty', value: 20, color: 'transparent' }
  ];

  const COLORS = ['#4A90E2', '#D2691E', '#F4A460', '#87CEEB'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Overview</h1>
          <X className="w-6 h-6 cursor-pointer" />
        </div>
        
        {/* Navigation tabs */}
        <div className="flex space-x-8 mt-4 text-sm">
          <div className="flex items-center space-x-2 bg-blue-700 px-3 py-1 rounded">
            <span>📊</span>
            <span>Expenses</span>
          </div>
          <span className="opacity-75 cursor-pointer">📅 Due Date</span>
          <span className="opacity-75 cursor-pointer">Sale Date</span>
          <span className="opacity-75 cursor-pointer">Plots (Rose)</span>
          <span className="opacity-75 cursor-pointer">Da Vimes e Neutronion</span>
          <span className="opacity-75 cursor-pointer">Medina Assurance</span>
          <span className="opacity-75 cursor-pointer">Partners Stores</span>
          <span className="bg-blue-500 px-3 py-1 rounded cursor-pointer">Lower Insertor</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-12 gap-6">
        {/* Expenses Chart */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="purchaseFuel" fill="#4A90E2" name="Purchase Fuel Stones" />
              <Bar dataKey="stoner" fill="#D2691E" name="Stoner Ores" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span>Purchase Fuel Stones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-600"></div>
              <span>Stoner Ores</span>
            </div>
          </div>
        </div>

        {/* Plots Sold Pie Chart */}
        <div className="col-span-3 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Plots Sold</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={plotsPieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {plotsPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold">5.4%</span>
          </div>
        </div>

        {/* S. Pimshare */}
        <div className="col-span-3 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">● S. Pimshare</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pimshareData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {pimshareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold">25%</span>
          </div>
        </div>

        {/* Plots Sold Bar Chart */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Plots Sold</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={plotsSoldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="volumeFruit" fill="#4A90E2" name="Volume Fruit Stones" />
              <Bar dataKey="stoner" fill="#D2691E" name="Stoner Ores" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span>Volume Fruit Stones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-600"></div>
              <span>Stoner Ores</span>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-center mb-4 space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span>Bacon Sprouts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600"></div>
              <span>Potatoroot & Phplatte</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500"></div>
              <span>Vintage Ones</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Line type="monotone" dataKey="bacon" stroke="#87CEEB" strokeWidth={2} />
              <Line type="monotone" dataKey="potatoes" stroke="#4A90E2" strokeWidth={2} />
              <Line type="monotone" dataKey="vintage" stroke="#D2691E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plot Apartments */}
        <div className="col-span-6 bg-gray-800 p-6 rounded-lg shadow text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Plot Apartments</h3>
            <span className="text-blue-400">● PusDreenie</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={plotApartmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Line type="monotone" dataKey="plotStarts" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="plotaData" stroke="#F59E0B" strokeWidth={2} />
              <Line type="monotone" dataKey="plotaData2" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="plotStone" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="plotHorse" stroke="#06B6D4" strokeWidth={2} />
              <Line type="monotone" dataKey="x2Fag" stroke="#F97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Total Partnert Oeatised */}
        <div className="col-span-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Total Partnert Collected</h3>
            <span>=</span>
          </div>
          <div className="grid grid-cols-5 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-600">Ocean</div>
              <div className="font-semibold">30.000 Mile Ocdemium</div>
            </div>
            <div>
              <div className="text-gray-600">Planetarium</div>
              <div className="font-semibold">8.500 Metropolimum</div>
            </div>
            <div>
              <div className="text-orange-600">● Newtown Trees</div>
              <div className="font-semibold">5.500m Superunits</div>
            </div>
            <div>
              <div className="text-gray-600">Cnader Rivers</div>
              <div className="font-semibold">3.500 Refections</div>
            </div>
            <div>
              <div className="text-gray-600">Seachpoint</div>
              <div className="font-semibold">Systemadder</div>
            </div>
          </div>
              {/* Intesempeatie Flice */}
        <div className="col-span-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Intesempeatie Flice:</h3>
            <span className="text-blue-600">● Sucamtion</span>
          </div>
          <div className="flex items-center space-x-6">
            <ResponsiveContainer width="60%" height={200}>
              <BarChart data={intesempeatleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill="#4A90E2" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={intesempeatlePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {intesempeatlePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center">
                <div className="text-2xl font-bold">$15%</div>
                <div className="text-lg font-semibold">20%</div>
              </div>
            </div>
          </div>
        </div>
        </div>

    
      </div>
    </div>
  );
}