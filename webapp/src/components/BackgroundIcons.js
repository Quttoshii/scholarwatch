import React from 'react';
import './BackgroundIcons.css';

import icon1 from '../icon_1.svg'; 
import icon2 from '../pencil.svg';
import icon3 from '../icon_3.svg';
import icon4 from '../lights.svg';
import icon5 from '../icon_5.svg';
import icon6 from '../QnA_f.svg';
import icon7 from '../alarm.svg';
import icon8 from '../alarm.svg';
import icon9 from '../study.svg';
import icon10 from '../page.svg';
//import icon11 from './arrow.svg';

const BackgroundIcons = () => {

  return (
  
  
    <div className="background-container">


      <img src={icon1} alt="Icon 1" className="background-icon" style={{ top: '28%', left: '14%', transform: 'rotate(-26deg)' }} />
      <img src={icon2} alt="Icon 2" className="background-icon" style={{ top: '55%', left: '50%', }} />
      <img src={icon3} alt="Icon 3" className="background-icon" style={{ top: '50%', left: '75%',transform: 'rotate(20deg)' }} />
      <img src={icon4} alt="Icon 4" className="background-icon" style={{ top: '-10%', left: '50%',transform: 'rotate(20deg)' }} />
      <img src={icon5} alt="Icon 5" className="background-icon" style={{ top: '50%', left: '-5%', }} />
      <img src={icon6} alt="Icon 6" className="background-icon" style={{ top: '38%', left: '40%', }} />
      <img src={icon7} alt="Icon 7" className="background-icon" style={{ top: '50%', left: '21%', }} />
      <img src={icon8} alt="Icon 8" className="background-icon" style={{ top: '-8%', left: '10%', }} />
      <img src={icon9} alt="Icon 9" className="background-icon" style={{ top: '9%', left: '-3%', }} />
      <img src={icon10} alt="Icon 10" className="background-icon" style={{ top: '9%', left: '70%', }} />
      
      


    </div>


  );
};

export default BackgroundIcons;