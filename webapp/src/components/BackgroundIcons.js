
import React from 'react';

import './BackgroundIcons.css';

import icon1 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/icon_1.svg'; 
import icon2 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/pencil.svg';
import icon3 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/icon_3.svg';
import icon4 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/lights.svg';
import icon5 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/icon_5.svg';
import icon6 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/QnA_f.svg';
import icon7 from '/Users/apple.store.pk/Desktop/University/scholarwatch-eman/webapp/src/student.svg';

const BackgroundIcons = () => {


  return (
    <div className="background-container">
      <img src={icon1} alt="Icon 1" className="background-icon" style={{ top: '10%', left: '-5%' }} />
      <img src={icon2} alt="Icon 2" className="background-icon" style={{ top: '55%', left: '50%' }} />
      <img src={icon3} alt="Icon 3" className="background-icon" style={{ top: '50%', left: '75%' }} />
      <img src={icon4} alt="Icon 4" className="background-icon" style={{ top: '5%', left: '75%' }} />
      <img src={icon5} alt="Icon 5" className="background-icon" style={{ top: '50%', left: '-5%' }} />
      <img src={icon6} alt="Icon 6" className="background-icon" style={{ top: '38%', left: '40%' }} />
      <img src={icon7} alt="Icon 7" className="background-icon" style={{ top: '50%', left: '21%' }} />
    </div>
  );

  
}

export default BackgroundIcons;