import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart3, LineChart, PieChart, Upload, Database } from 'lucide-react';
import AuthModal from './AuthModal';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (formData, isLogin) => {
    try {
      if (isLogin) {
        // Login API call
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        } else {
          alert(data.msg || 'Login failed');
        }
      } else {
        // Registration API call
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.token);
          navigate('/dashboard');
        } else {
          alert(data.msg || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('An error occurred. Please try again.');
    }
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-green-50">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">Excel Analytics</span>
              </div>
              <div className="hidden md:flex md:ml-10 space-x-8">
                <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium">
                  How it Works
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-green-600 transition-colors duration-200 font-medium">
                  Testimonials
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsAuthModalOpen(true)} className="hidden md:inline-flex btn-secondary">
                Log in
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="min-h-[calc(100vh-4rem)] flex items-center">
            <div className="w-full text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-6">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:leading-tight">
                  Transform Your Excel Data into
                  <span className="text-green-600"> Interactive Insights</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-3xl lg:mx-0 mx-auto">
                  Upload your Excel files, analyze data, and create stunning 2D and 3D visualizations with our powerful analytics platform.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                  <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary flex items-center">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                  <button className="btn-dark">
                    Watch Demo
                  </button>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="relative mx-auto w-full rounded-lg shadow-xl overflow-hidden">
                  <img src="src/assets/landing-image.jpeg" alt="Dashboard preview" className="w-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-white border-y border-green-100">
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">10,000+</div>
              <div className="mt-2 text-lg text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">5M+</div>
              <div className="mt-2 text-lg text-gray-600">Excel Files Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">99.9%</div>
              <div className="mt-2 text-lg text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="w-full min-h-screen flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Powerful Features for Data Analysis</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform your Excel data into actionable insights
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-3xl mb-4">
                <BarChart3 className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Interactive Charts</h3>
              <p className="mt-2 text-gray-600">
                Create beautiful 2D and 3D visualizations from your Excel data with just a few clicks.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-3xl mb-4">
                <LineChart className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">AI-Powered Insights</h3>
              <p className="mt-2 text-gray-600">
                Get smart analysis and summary reports using advanced AI algorithms.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-green-100 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-3xl mb-4">
                <PieChart className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">User Dashboard</h3>
              <p className="mt-2 text-gray-600">
                Track your upload history and analysis results in your personalized dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="w-full min-h-screen flex items-center bg-white border-y border-green-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">1. Upload Your Excel File</h3>
              <p className="mt-2 text-base text-gray-600">
                Simply drag and drop your Excel files or select them from your computer.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify      justify-center rounded-full bg-green-100 text-green-600">
                <Database className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">2. Select Analysis Options</h3>
              <p className="mt-2 text-base text-gray-600">
                Choose from various analysis types and visualization options for your data.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">3. View Interactive Results</h3>
              <p className="mt-2 text-base text-gray-600">
                Explore your data through interactive visualizations and download reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-green-600">
        <div className="w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-green-100">Start your free trial today.</span>
            </h2>
            <div className="mt-8 flex justify-center">
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-secondary">
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900">
        <div className="w-full py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              © {new Date().getFullYear()} Excel Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onAuth={handleAuth} />
    </div>
  );
};

export default LandingPage;