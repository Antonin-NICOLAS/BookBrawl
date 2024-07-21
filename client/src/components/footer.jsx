import React from 'react';
import Conditions from '../assets/conditions.pdf'
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
    <div className="top-footer">
      <table>
        <tbody>
          <tr>
            <td className="contact">Contact us at : <a href="mailto:bookbrawl.contact@gmail.com">bookbrawl.contact@gmail.com</a></td>
            <td className="whatsapp" rowSpan="2"><a href="https://chat.whatsapp.com/CQNSY4nA3OO3ycC0S2hDuj"><i className="fa-brands fa-whatsapp"></i></a></td>
            <td className="condition" rowSpan="2"><a href={Conditions} target="_blank">TERMS OR SERVICES</a></td>
          </tr>
          <tr>
            <td className='copyright'>©BOOKBRAWL: ALL RIGHTS RESERVED</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className="footer-slogan">
      <strong>FEED YOUR NEED TO READ</strong>
    </div>
  </footer>
  );
};

export default Footer;