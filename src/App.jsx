import React, { useState } from 'react';
import { Calculator, Zap, TrendingDown, Mail, Building2, DollarSign, Loader2 } from 'lucide-react';

// ✅ ADD THIS LINE - MUST BE OUTSIDE THE COMPONENT
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    officeSize: '',
    currentACCount: '',
    currentACType: 'non-inverter',
    monthlyBill: '',
    operatingHours: '10',
    email: '',
    phone: ''
  });
  
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateSavings = () => {
    const monthlyBill = parseFloat(formData.monthlyBill);
    const acCount = parseInt(formData.currentACCount);
    const hours = parseInt(formData.operatingHours);
    
    const nonInverterConsumption = 1.5;
    const inverterConsumption = 0.9;
    
    const currentMonthlyConsumption = nonInverterConsumption * acCount * hours * 30;
    const inverterMonthlyConsumption = inverterConsumption * acCount * hours * 30;
    
    const savingsPercentage = ((currentMonthlyConsumption - inverterMonthlyConsumption) / currentMonthlyConsumption) * 100;
    const monthlySavings = monthlyBill * (savingsPercentage / 100);
    const yearlySavings = monthlySavings * 12;
    const fiveYearSavings = yearlySavings * 5;
    
    const co2Reduction = (currentMonthlyConsumption - inverterMonthlyConsumption) * 0.5 * 12;
    
    setResults({
      savingsPercentage: savingsPercentage.toFixed(1),
      monthlySavings: monthlySavings.toFixed(0),
      yearlySavings: yearlySavings.toFixed(0),
      fiveYearSavings: fiveYearSavings.toFixed(0),
      co2Reduction: co2Reduction.toFixed(0),
      currentConsumption: currentMonthlyConsumption.toFixed(0),
      newConsumption: inverterMonthlyConsumption.toFixed(0)
    });
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    calculateSavings();
    setStep(2);
  };

  // Mock Backend API call
  const mockBackendAPI = async (leadData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate backend processing
    const timestamp = new Date().toISOString();
    const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Log what would be sent to backend
    const backendPayload = {
      leadId: leadId,
      timestamp: timestamp,
      source: 'Energy_Savings_Calculator',
      leadData: {
        company: {
          name: leadData.companyName,
          officeSize: leadData.officeSize,
          acUnits: leadData.currentACCount,
          currentACType: leadData.currentACType
        },
        consumption: {
          monthlyBill: leadData.monthlyBill,
          operatingHours: leadData.operatingHours,
          currentUsage: results.currentConsumption,
          projectedUsage: results.newConsumption
        },
        projectedSavings: {
          monthly: results.monthlySavings,
          yearly: results.yearlySavings,
          fiveYear: results.fiveYearSavings,
          savingsPercentage: results.savingsPercentage,
          co2Reduction: results.co2Reduction
        },
        contact: {
          email: leadData.email,
          phone: leadData.phone
        },
        leadScore: calculateLeadScore(leadData),
        priority: getLeadPriority(leadData)
      },
      actions: {
        emailSent: true,
        crmUpdated: true,
        salesNotified: true,
        analyticsTracked: true
      }
    };

    // Console log for demonstration
    console.log('═══════════════════════════════════════');
    console.log('🚀 MOCK BACKEND API CALL');
    console.log('═══════════════════════════════════════');
    console.log('📤 Endpoint: POST /api/leads/capture');
    console.log('📊 Payload:', JSON.stringify(backendPayload, null, 2));
    console.log('═══════════════════════════════════════');
    console.log('✅ Response: 200 OK');
    console.log('📧 Email sent to:', leadData.email);
    console.log('💼 CRM updated with Lead ID:', leadId);
    console.log('🔔 Sales team notified');
    console.log('📈 Analytics event tracked');
    console.log('═══════════════════════════════════════');

    // Simulate successful response
    return {
      success: true,
      leadId: leadId,
      message: 'Lead captured successfully',
      emailSent: true
    };
  };

  // Calculate lead score (0-100)
  const calculateLeadScore = (data) => {
    let score = 0;
    
    // Company size score (max 30 points)
    const officeSize = parseInt(data.officeSize);
    if (officeSize > 10000) score += 30;
    else if (officeSize > 5000) score += 20;
    else if (officeSize > 2000) score += 10;
    
    // Number of AC units score (max 25 points)
    const acCount = parseInt(data.currentACCount);
    if (acCount >= 20) score += 25;
    else if (acCount >= 10) score += 20;
    else if (acCount >= 5) score += 15;
    else score += 10;
    
    // Monthly bill score (max 25 points)
    const bill = parseInt(data.monthlyBill);
    if (bill >= 200000) score += 25;
    else if (bill >= 100000) score += 20;
    else if (bill >= 50000) score += 15;
    else score += 10;
    
    // Email domain score (max 20 points)
    const email = data.email.toLowerCase();
    if (!email.includes('gmail') && !email.includes('yahoo') && !email.includes('hotmail')) {
      score += 20; // Corporate email
    } else {
      score += 5; // Personal email
    }
    
    return Math.min(score, 100);
  };

  // Determine lead priority
  const getLeadPriority = (data) => {
    const score = calculateLeadScore(data);
    if (score >= 80) return 'HIGH';
    if (score >= 60) return 'MEDIUM';
    return 'LOW';
  };

  // Final form submission with mock backend
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Prepare data for backend
      const leadData = {
        company: {
          name: formData.companyName,
          officeSize: parseInt(formData.officeSize),
          acUnits: parseInt(formData.currentACCount),
          currentACType: formData.currentACType,
        },
        consumption: {
          monthlyBill: parseFloat(formData.monthlyBill),
          operatingHours: parseInt(formData.operatingHours),
          currentUsage: parseFloat(results.currentConsumption),
          projectedUsage: parseFloat(results.newConsumption),
        },
        projectedSavings: {
          monthly: parseFloat(results.monthlySavings),
          yearly: parseFloat(results.yearlySavings),
          fiveYear: parseFloat(results.fiveYearSavings),
          savingsPercentage: parseFloat(results.savingsPercentage),
          co2Reduction: parseFloat(results.co2Reduction),
        },
        contact: {
          email: formData.email,
          phone: formData.phone,
        },
      };
  
      // Send to backend

    const response = await fetch(`${API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
  
      const data = await response.json();
  
      if (data.success) {
        console.log('✅ Lead captured:', data.data);
        setStep(3);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Error submitting lead:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Corporate AC Energy Savings Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how much your company can save by switching to inverter air conditioners
          </p>
        </div>

        {/* Step 1: Calculator Form */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="flex items-center mb-8">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Calculate Your Potential Savings</h2>
            </div>
            
            <form onSubmit={handleStep1Submit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Office Space (sq ft)
                </label>
                <input
                  type="number"
                  name="officeSize"
                  value={formData.officeSize}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of AC Units Currently Installed
                </label>
                <input
                  type="number"
                  name="currentACCount"
                  value={formData.currentACCount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current AC Type
                </label>
                <select
                  name="currentACType"
                  value={formData.currentACType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="non-inverter">Non-Inverter (Traditional)</option>
                  <option value="old-inverter">Old Inverter (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Average Monthly Electricity Bill (LKR)
                </label>
                <input
                  type="number"
                  name="monthlyBill"
                  value={formData.monthlyBill}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 150000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily AC Operating Hours
                </label>
                <input
                  type="number"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="24"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 10"
                />
                <p className="text-sm text-gray-500 mt-1">Typical office hours: 8-12 hours/day</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Calculate My Savings
                <TrendingDown className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Results & Lead Capture */}
        {step === 2 && results && (
          <div className="space-y-8">
            
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Your Potential Savings with Inverter ACs
                </h2>
                <p className="text-gray-600">Based on {formData.companyName}'s current usage</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-700">Monthly Savings</h3>
                  </div>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    LKR {parseInt(results.monthlySavings).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {results.savingsPercentage}% reduction in energy costs
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    <TrendingDown className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-700">Yearly Savings</h3>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    LKR {parseInt(results.yearlySavings).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Annual cost reduction
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    <Building2 className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-700">5-Year Savings</h3>
                  </div>
                  <p className="text-4xl font-bold text-purple-600 mb-2">
                    LKR {parseInt(results.fiveYearSavings).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Long-term investment return
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-3">
                    <Zap className="w-6 h-6 text-emerald-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-700">CO₂ Reduction</h3>
                  </div>
                  <p className="text-4xl font-bold text-emerald-600 mb-2">
                    {parseInt(results.co2Reduction).toLocaleString()} kg
                  </p>
                  <p className="text-sm text-gray-600">
                    Annual carbon footprint reduction
                  </p>
                </div>

              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Energy Consumption Comparison</h3>
                <div className="flex flex-col md:flex-row justify-around items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Current Monthly Usage</p>
                    <div className="bg-red-100 px-6 py-3 rounded-lg border-2 border-red-300">
                      <p className="text-3xl font-bold text-red-600">{results.currentConsumption} kWh</p>
                    </div>
                  </div>
                  <div className="text-3xl text-gray-400 rotate-90 md:rotate-0">→</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">With Inverter ACs</p>
                    <div className="bg-green-100 px-6 py-3 rounded-lg border-2 border-green-300">
                      <p className="text-3xl font-bold text-green-600">{results.newConsumption} kWh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Get Your Detailed Savings Report</h2>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-200">
                <p className="text-gray-700 font-medium mb-4">
                  📊 Receive a comprehensive PDF report including:
                </p>
                
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Detailed ROI analysis and payback period calculation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Recommended inverter AC models for your office size</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Installation and maintenance cost breakdown</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Energy efficiency certification guidance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Special corporate pricing and financing options</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleFinalSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Your Request...
                    </>
                  ) : (
                    <>
                      Get My Free Detailed Report
                      <Mail className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔒 We respect your privacy. Your information will only be used to send you the report and relevant product updates.
                </p>
              </form>
            </div>

          </div>
        )}

        {/* Step 3: Thank You */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thank You, {formData.companyName}!
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Your detailed savings report has been sent to<br />
              <span className="font-semibold text-blue-600">{formData.email}</span>
            </p>
            
            <div className="bg-blue-50 p-8 rounded-xl mb-8 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 What's Next?</h3>
              <ul className="text-left text-gray-700 space-y-3 max-w-md mx-auto">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Check your email for the comprehensive PDF report</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Our energy consultant will contact you within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Schedule a free on-site energy audit</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Get a customized quote for your office</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setFormData({
                  companyName: '',
                  officeSize: '',
                  currentACCount: '',
                  currentACType: 'non-inverter',
                  monthlyBill: '',
                  operatingHours: '10',
                  email: '',
                  phone: ''
                });
                setResults(null);
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Calculate for Another Office
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;