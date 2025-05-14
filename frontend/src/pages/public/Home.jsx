import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Calendar, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Home = () => {
  const [boxes, setBoxes] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    date: ''
  });
  
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/public/boxes');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch cricket boxes');
        }
       

        setBoxes(data);
        setFilteredBoxes(data);
      } catch (error) {
        console.error('Error fetching boxes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoxes();
  }, []);
  
  useEffect(() => {
    // Filter boxes based on search query and filters
    let results = boxes;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(box => 
        box.name.toLowerCase().includes(query) || 
        box.location.toLowerCase().includes(query) ||
        box.description.toLowerCase().includes(query)
      );
    }
    
    if (filters.location) {
      results = results.filter(box => 
        box.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.minPrice) {
      results = results.filter(box => box.hourlyRate >= parseFloat(filters.minPrice));
    }
    
    if (filters.maxPrice) {
      results = results.filter(box => box.hourlyRate <= parseFloat(filters.maxPrice));
    }
    
    // Date filtering would be more complex and would depend on availability data
    
    setFilteredBoxes(results);
  }, [searchQuery, filters, boxes]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      date: ''
    });
    setSearchQuery('');
  };
  
  // Mock data for demonstration purposes
  const mockBoxes = [
    {
      id: 1,
      name: 'Premium Cricket Box',
      description: 'High-quality cricket practice box with advanced bowling machine and analytics.',
      location: 'Central Sports Complex, New York',
      hourlyRate: 45,
      image: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      rating: 4.8,
      reviewCount: 24
    },
    {
      id: 2,
      name: 'Standard Cricket Net',
      description: 'Standard cricket practice net suitable for beginners and intermediate players.',
      location: 'Community Park, Boston',
      hourlyRate: 25,
      image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      rating: 4.2,
      reviewCount: 18
    },
    {
      id: 3,
      name: 'Professional Training Box',
      description: 'Professional-grade cricket box with multiple lanes and video analysis.',
      location: 'Sports Academy, Chicago',
      hourlyRate: 60,
      image: 'https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      rating: 4.9,
      reviewCount: 32
    },
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative mb-12">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Find and Book Cricket Boxes
            </h1>
            <p className="text-lg md:text-xl text-white opacity-90 mb-8 max-w-2xl">
              Book high-quality cricket boxes for practice and matches. Improve your game with the best facilities.
            </p>
            
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md max-w-3xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow">
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Search by name, location or description"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  className="flex items-center justify-center"
                >
                  <Filter size={18} className="mr-2" />
                  Filters
                </Button>
                <Button>
                  Search
                </Button>
              </div>
              
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Any location"
                        className="w-full px-3 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        id="minPrice"
                        name="minPrice"
                        min="0"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="$0"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        id="maxPrice"
                        name="maxPrice"
                        min="0"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="$999"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-3 flex justify-end">
                    <Button 
                      variant="secondary" 
                      onClick={clearFilters}
                      className="mr-2"
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Boxes Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            Available Cricket Boxes
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredBoxes.length || mockBoxes.length} results
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-80 animate-pulse">
                <div className="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredBoxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoxes.map(box => (
              <BoxCard key={box._id} box={box} />
            ))}
          </div>
        ) : (
          // Show mock data when no API data is available
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBoxes.map(box => (
              <BoxCard key={box.id} box={box} />
            ))}
          </div>
        )}
      </section>
      
      {/* Features Section */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-center text-yellow-800 dark:text-yellow-300 mb-10">
          Why Choose Our Cricket Box Booking Platform?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-yellow-700 dark:text-yellow-300">
              Easy Booking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find and book cricket boxes with just a few clicks. Filter by location, price, and availability.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-yellow-700 dark:text-yellow-300">
              Real-time Availability
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check real-time availability and secure your preferred time slots instantly.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:transform hover:scale-105">
            <div className="w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-yellow-700 dark:text-yellow-300">
              Quality Locations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access to premium cricket boxes and facilities in convenient locations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Box Card Component
const BoxCard = ({ box }) => {
  return (
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:translate-y-[-5px]">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={box.image?box.image : "https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
          alt={box.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2">
          <div className="flex items-center">
            <div className="text-white text-sm font-bold px-2 py-1 rounded bg-yellow-500">
              ${box.hourlyRate}/hr
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-1">{box.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 text-sm ml-1">{box.rating}</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">({box.reviewCount} reviews)</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{box.location}</span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {box.description}
        </p>
        
        <Link to={`/box/${box._id}`}>
          <Button fullWidth>View Details</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;