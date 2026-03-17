import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrderForm from './components/OrderForm';
import OrderSearch from './components/OrderSearch';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                

                <Routes>
                    <Route path="/" element={<OrderForm />} />
                    <Route path="/search" element={<OrderSearch />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;