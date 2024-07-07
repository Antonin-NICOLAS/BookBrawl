import React, { useState, useEffect } from "react";
import './navbar.css';
import { Link } from 'react-router-dom'
import logo from "/src/assets/logo.png";
import { useContext } from "react";
import { UserContext } from "../context/userContext"

function Navbar({ onLoginClick}) {
  const [checked, setChecked] = useState(false);
  const { user } = useContext(UserContext)

  useEffect(() => {
    // Check navigator preferences
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setChecked(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setChecked(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Get stored theme from sessionStorage
    const storedTheme = sessionStorage.getItem('tempThemeState');
    if (storedTheme === 'dark') {
      setChecked(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (storedTheme === 'light') {
      setChecked(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  useEffect(() => {
    // Apply the theme to the document
    if (checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      sessionStorage.setItem('tempThemeState', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      sessionStorage.setItem('tempThemeState', 'light');
    }
  }, [checked]);

  // Function to handle the transition effect
  const trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
      document.documentElement.classList.remove('transition');
    }, 1000);
  };

  // Event handler for the checkbox change
  const handleChange = () => {
    trans();
    setChecked(prev => !prev);
  };

  const [showLinks, setShowLinks] = useState(false);
  const handleShowLinks = () => {
    setShowLinks(!showLinks);
  };


  return (
    <>
      <header>
        <nav className={`navbar dark-mode ${showLinks ? "show-nav" : ""}`}>
          <div className="divlogo">
            <a href="/">
              <img id="logo" src={logo} alt="logo" />
              <h1 className="Title">BookBrawl</h1>
            </a>
          </div>
          <div className="navbar-o-p">
            <ul className="navbar_links">
              <li className="navbar_link first">
                <Link to="/"><i className="fa-solid fa-house"></i>&nbsp;&nbsp;&nbsp;Accueil</Link>
              </li>
              <li className="navbar_link second">
                <Link to="/ranking"><i className="fa-solid fa-ranking-star"></i>&nbsp;&nbsp;&nbsp;Classement</Link>
              </li>
              <li className="navbar_link third">
                <Link to="/books"><i className="fa-solid fa-book"></i>&nbsp;&nbsp;&nbsp;Mes livres</Link>
              </li>
              <li className="navbar_link four">
                <Link to="/predict"><i className="fa-solid fa-calculator"></i>&nbsp;&nbsp;&nbsp;Prédictions</Link>
              </li>
              <li className="navbar_link fifth">
                <Link to="/about"><i className="fa-solid fa-question"></i>&nbsp;&nbsp;&nbsp;À propos</Link>
              </li>
            </ul>
            <input type="checkbox" id="switch" checked={checked} onChange={handleChange} name="theme" />
            <label htmlFor="switch">Toggle</label>
            {user ? (
              <Link class="linkaccount" to="/accounts"><button className="login"><i className="fa-solid fa-user"></i>{user.prenom}</button></Link>
            ) : (
              <button className="login" onClick={onLoginClick}><i className="fa-solid fa-user"></i>Login</button>
            )}
          </div>
          <button className="burger" onClick={handleShowLinks}>
            <span className="bar"></span>
          </button>
        </nav>
      </header>
    </>
  );
}

export default Navbar;