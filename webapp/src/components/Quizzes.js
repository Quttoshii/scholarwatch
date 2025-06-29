import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { toast } from "react-toastify";

function Quizzes({ incrementInvalidationCount, makeQuiz, takeQuiz, setTakeQuiz, selectedLecture, pageNumbers, numQuestions, setWeakAreas }) {
  const [score, setScore] = useState(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizInvalidated, setQuizInvalidated] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const lecturesDir = process.env.REACT_APP_LECTURES_DIR;
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    if (isQuizActive) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("resize", handleResize);
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [isQuizActive]);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      invalidateQuiz();
    }
  };

  const handleResize = () => {
    invalidateQuiz();
  };

  const invalidateQuiz = () => {
    setIsQuizActive(false);
    setQuizInvalidated(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setUserAnswers({});
    incrementInvalidationCount();
    toast.error("The quiz has been invalidated due to tab switching or resizing. Please retake the quiz.");
  };

  const isBrowserMaximized = () => {
    const windowWidth = window.outerWidth;
    const windowHeight = window.outerHeight;
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const threshold = 50;
    return windowWidth >= screenWidth - threshold && windowHeight >= screenHeight - threshold;
  };

  const startQuiz = async () => {
    if (!isBrowserMaximized()) {
      toast.error("Please maximize your browser window to start the quiz.");
      return;
    }

    setIsQuizActive(true);
    setQuizInvalidated(false);
    setLoading(true);
    setQuizCompleted(false);
    setQuestions([]);
    setUserAnswers({});
    
    const selectedPages = pageNumbers.length > 5 
    ? pageNumbers.slice(0, 5) 
    : pageNumbers.map(page => (isNaN(page) || page === null) ? pageNumbers.length : page);

    // console.log(selectedPages);
    const requestBody = {
      pdf_location: selectedLecture && selectedLecture.path ? selectedLecture.path.split('/').pop() : '',
      page_numbers: selectedPages,
      num_questions: numQuestions,
    };

    try {
      const response = await fetch("http://localhost:8001/generate-mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to fetch quiz questions");

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
      toast.error("Failed to generate quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: selectedOption });
  };

  useEffect(() => {
    if (quizCompleted && questions.length > 0) {
      let correctCount = 0;

      questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correct_answer;
        const topic = question.topic;
        const page = question.page_number;
        const lectureName = selectedLecture && selectedLecture.name ? selectedLecture.name : (selectedLecture && selectedLecture.path ? selectedLecture.path.split('/').pop().split('.')[0] : '');

        if (userAnswer === correctAnswer) {
          correctCount++;
        } else {
          // Update weakAreas with the nested structure
          setWeakAreas(prev => {
            const newWeakAreas = JSON.parse(JSON.stringify(prev)); // Deep clone
            
            // Initialize structure if it doesn't exist
            if (!newWeakAreas.lectures) {
              newWeakAreas.lectures = {};
            }
            
            if (!newWeakAreas.lectures[lectureName]) {
              newWeakAreas.lectures[lectureName] = { Slides: {} };
            }
            
            if (!newWeakAreas.lectures[lectureName].Slides[`${page}`]) {
              newWeakAreas.lectures[lectureName].Slides[`${page}`] = { Topics: {} };
            }
            
            if (!newWeakAreas.lectures[lectureName].Slides[`${page}`].Topics[topic]) {
              newWeakAreas.lectures[lectureName].Slides[`${page}`].Topics[topic] = 0;
            }
            
            // Increment the count
            newWeakAreas.lectures[lectureName].Slides[`${page}`].Topics[topic]++;
            
            return newWeakAreas;
          });
        }
      });

      setScore(correctCount);
    }
  }, [quizCompleted, questions, userAnswers, selectedLecture, setWeakAreas]);

  const submitQuiz = () => {
    setQuizCompleted(true);
    setIsQuizActive(false);
    toast.success(`Quiz submitted!`);
  };

  const returnToHome = () => {
    setTakeQuiz(false); // Reset quiz availability
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="quiz-container">
      <h2>Quizzes</h2>

      {!makeQuiz ? (
        <p style={{ color: "gray" }}>There are no quizzes at the moment.</p>
      ) : !takeQuiz ? (
        <p style={{ color: "gray" }}>Complete your lectures before taking the quiz.</p>
      ) : isQuizActive && loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Generating quiz questions...</p>
        </div>
      ) : isQuizActive && questions.length > 0 ? (
        <div className="quiz-question">
          <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
          <p><strong>{questions[currentQuestionIndex].question}</strong></p>

          <form>
            {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => (
              <div key={key} className="option">
                <input
                  type="radio"
                  id={`option-${key}`}
                  name="quiz-option"
                  value={key}
                  checked={userAnswers[currentQuestionIndex] === key}
                  onChange={() => handleAnswerChange(currentQuestionIndex, key)}
                />
                <label htmlFor={`option-${key}`}>{`${key}: ${value}`}</label>
              </div>
            ))}
          </form>

          <div className="quiz-buttons">
            <button
              className="back-btn"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Back
            </button>

            {questions.length > 0 && currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="submit-quiz-btn"
                style={{
                  background: 'linear-gradient(135deg, #f6a623, #e6951a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 18px',
                  fontWeight: 600,
                  fontSize: 16,
                  minWidth: 110,
                  marginLeft: 12,
                  cursor: 'pointer',
                  transition: 'background 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 12px rgba(246, 166, 35, 0.2)'
                }}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                className="next-btn"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={questions.length === 0 || currentQuestionIndex >= questions.length - 1}
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : quizCompleted ? (
        <div className="quiz-results">
          <h3>Quiz Completed!</h3>
          {/* <p>Your Score: {calculateScore()} / {questions.length}</p> */}
          <p>Your Score: {score !== null ? `${score} / ${questions.length}` : "Calculating..."}</p>

          <table className="results-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <tr key={index} className={userAnswers[index] === question.correct_answer ? "correct" : "incorrect"}>
                  <td>{question.question}</td>
                  <td>{userAnswers[index] || "Not Answered"}</td>
                  <td>{question.correct_answer}</td>
                  <td>{question.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={returnToHome} className="take-quiz-btn">
            Return to Home
          </button>
        </div>
      ) : !isQuizActive && !quizInvalidated ? (
        <button onClick={startQuiz} className="take-quiz-btn">
          Take Quiz
        </button>
      ) : null}

      {quizInvalidated && (
        <div className="quiz-invalidated">
          <p style={{ color: "red" }}>
            The quiz has been invalidated due to tab switching or resizing. You must retake the quiz.
          </p>
          <button onClick={startQuiz} className="take-quiz-btn">
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default Quizzes;