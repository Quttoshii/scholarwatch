import React, { useEffect } from 'react';

const Logout = ({ setUserType, returnTo, setLoggingOut }) => {
  // const navigate = useNavigate();
  useEffect(() => {

    setUserType('');
    // navigate('/');
    setLoggingOut(true);
  
    const params = new URLSearchParams(window.location.search);
    // const returnTo = params.get('returnto') || 'http:localhost/'; // fallback if not present

    window.location.href = returnTo;
  }, [setUserType, setLoggingOut]);

  return <div>Logging out...</div>;
};

export default Logout;