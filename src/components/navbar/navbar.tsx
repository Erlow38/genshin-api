import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import './navbar.scss';
import logo from '../../assets/images/logo.png';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getApiExplorerUrl = () => {
    const uid = searchParams.get('uid') || '618285856';
    return `https://enka.network/api/uid/${uid}`;
  };

        /*
        <ul className="navbar__menu">
          <li className="navbar__item">
            <Link to="/characters" className={isActive('/characters') ? 'active' : ''}>
              Personnages
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/weapons" className={isActive('/weapons') ? 'active' : ''}>
              Armes
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/artifacts" className={isActive('/artifacts') ? 'active' : ''}>
              Artéfacts
            </Link>
          </li>
          <li className="navbar__item">
            <Link to="/elements" className={isActive('/elements') ? 'active' : ''}>
              Éléments
            </Link>
          </li>
        </ul>
         */

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="Genshin API" className="navbar__logo-image" />
          La Taverne de Jade
        </Link>


        <div className="navbar__cta">
          <a 
            href="https://api.enka.network/#/docs/gi/api"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__button navbar__button--outline"
          >
            Documentation
          </a>
          <a 
            href={getApiExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__button navbar__button--filled"
          >
            Explorer l'API
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;