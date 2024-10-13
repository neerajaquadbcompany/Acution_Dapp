import React from 'react';
import motoko from './assets/IC_logo.svg';
import AuctionForm from './components/AuctionForm';
import AuctionList from './components/AuctionList';
import Navigation from './components/Navigation';
import AuctionDetail from './components/AuctionDetails';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 text-center">
        
        <img src={motoko} className="h-16 md:h-24 mb-4 md:mb-6" alt="Motoko logo" />
        
        
        <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6">
          Auction Platform
        </h1>
        
        
        <Navigation />
        
        
        <div className="content mt-4 md:mt-8">
          <Routes>
            <Route path="/" element={<AuctionList />} />
            <Route path="/newAuction" element={<AuctionForm />} />
            <Route path="/viewAuction/:id" element={<AuctionDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
