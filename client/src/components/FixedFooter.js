import React from 'react';
import './FixedFooter.css';

const FixedFooter = () => {
   return (
      <footer className="fixed-footer">
         <div className="fixed-footer-inner">
            <div className="brand">Personalised Learning Path Generator</div>
            <div className="links">
               <a href="/terms">Terms & Conditions</a>
               <a href="/privacy">Privacy Policy</a>
               <a href="/legal">Legal Notice</a>
            </div>
            <div className="copyright">© 2026 Personalised Learning Path Generator</div>
         </div>
      </footer>
   );
};

export default FixedFooter;
