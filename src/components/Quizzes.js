import React, { useState, useEffect } from 'react';

function Quizzes({ incrementInvalidationCount }) {
  const [isQuizActive, setIsQuizActive] = useState(false); // State to track if the quiz is active
  const [hasSwitchedTabOrResized, setHasSwitchedTabOrResized] = useState(false); // State to track tab switching or resize
  const [quizInvalidated, setQuizInvalidated] = useState(false); // State to track if the quiz was invalidated
  const [initialWindowSize, setInitialWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (isQuizActive) {
      // Add event listener for tab visibility change and window resizing
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      // Clean up listeners when the quiz ends or component unmounts
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [isQuizActive, initialWindowSize]);

  // Handle tab visibility change (when user switches tabs or minimizes)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      invalidateQuiz(); // User switched tab, invalidate the quiz
    }
  };

  // Handle window resizing
  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // If the window is resized from the initial size, invalidate the quiz
    if (newWidth !== initialWindowSize.width || newHeight !== initialWindowSize.height) {
      invalidateQuiz();
    }
  };

  // Function to invalidate the quiz when tab switch or resize is detected
  const invalidateQuiz = () => {
    setIsQuizActive(false);
    setQuizInvalidated(true);
    incrementInvalidationCount(); // Track the invalidation event
    alert('The quiz has been invalidated due to tab switching or resizing. Please retake the quiz.');
  };

  const isBrowserMaximized = () => {
    const windowWidth = window.outerWidth;
    const windowHeight = window.outerHeight;
    const screenWidth = window.screen.availWidth; // Available screen space excluding system UI like taskbars
    const screenHeight = window.screen.availHeight;
  
    const threshold = 50; // Margin of error to account for browser chrome
    return (
      windowWidth >= screenWidth - threshold && windowHeight >= screenHeight - threshold
    );
  };
  

  // Start the quiz and reset the invalidation state
  const startQuiz = () => {
    if (isBrowserMaximized()) {
      // Proceed with the quiz if the browser is maximized
      setIsQuizActive(true); // Start the quiz
      setQuizInvalidated(false); // Reset invalidation flag
      setHasSwitchedTabOrResized(false); // Reset warning flag
      setInitialWindowSize({ width: window.innerWidth, height: window.innerHeight }); // Set initial window size
    } else {
      alert('Please maximize your browser window to start the quiz.');
    }
  };

  // Retake the quiz when the user clicks the button
  const retakeQuiz = () => {
    setIsQuizActive(false); // Reset quiz active state
    setQuizInvalidated(false); // Reset invalidation flag
    setHasSwitchedTabOrResized(false); // Reset warning flag
  };

  return (
    <div>
      <h2>Quizzes</h2>

      {!isQuizActive && !quizInvalidated ? (
        <button onClick={startQuiz} className="take-quiz-btn">
          Take Quiz
        </button>
      ) : null}

      {isQuizActive ? (
        <p>The quiz is now active. Please do not switch tabs or resize the window.</p>
      ) : null}

      {quizInvalidated && (
        <div>
          <p style={{ color: 'red' }}>
            The quiz has been invalidated. You must retake the quiz due to tab switching or resizing.
          </p>
          <button onClick={retakeQuiz} className="take-quiz-btn">
            Retake Quiz
          </button>
        </div>
      )}

      {hasSwitchedTabOrResized && (
        <p style={{ color: 'red' }}>
          Warning: You have switched tabs or resized the window during the quiz!
        </p>
      )}
    </div>
  );
}

export default Quizzes;
