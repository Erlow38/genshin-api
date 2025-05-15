import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar.tsx';
import HomePage from './components/homepage/homepage.tsx';

// Pages temporaires pour la démonstration
const CharactersPage = () => <div>Page des personnages</div>;
const WeaponsPage = () => <div>Page des armes</div>;
const ArtifactsPage = () => <div>Page des artéfacts</div>;
const ElementsPage = () => <div>Page des éléments</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/weapons" element={<WeaponsPage />} />
            <Route path="/artifacts" element={<ArtifactsPage />} />
            <Route path="/elements" element={<ElementsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
