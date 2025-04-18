import React, { useState, useEffect } from "react";
import axios from "axios";

function CreateQuiz({ userID, makeQuiz, setMakeQuiz, numQuestions, setNumQuestions, setSelectedLecture }) {
    const [lectures, setLectures] = useState([]);
    const [selectLecture, setSelectLecture] = useState("");
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                const response = await axios.post(
                    "http://localhost/scholarwatch/fetchLecture.php",
                    { userID },
                    { headers: { "Content-Type": "application/json" } }
                );

                if (response.data.success) {
                    setLectures(response.data.data);
                } else {
                    console.error("Error fetching lectures:", response.data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchLectures();
    }, [userID]);

    useEffect(() => {
        if (lectures.length > 0) {
            setSelectedLecture(lectures[0].DirectoryPath);
        }
    }, [lectures, setSelectedLecture]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectLecture) {
            setError("Please select a lecture");
            setSuccessMessage(null);
            return;
        }

        if (numQuestions < 1) {
            setError("Number of questions must be at least 1");
            setSuccessMessage(null);
            return;
        }

        setError(null);
        setSuccessMessage(" ");
        setMakeQuiz(true);
    };

    const handleRecreateQuiz = () => {
        setMakeQuiz(false);
        setNumQuestions(1);
        setSelectedLecture(lectures[0]?.DirectoryPath || "");
        setSelectLecture("");
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className="create-quiz-container">
            <h2>{makeQuiz ? "Quiz has been set!" : "Create a New Quiz"}</h2>

            {error && <div className="error-message">{error}</div>}

            {makeQuiz ? (
                <div>
                    <p className="success-message">{successMessage}</p>
                    <button onClick={handleRecreateQuiz} className="recreate-quiz-btn">
                        Recreate Quiz
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="lecture-select">Select Lecture (PDF):</label>
                        <select
                            id="lecture-select"
                            value={selectLecture}
                            onChange={(e) => {
                                setSelectLecture(e.target.value);
                                setSelectedLecture(e.target.value);
                                setSuccessMessage(null);
                            }}
                            required
                        >
                            <option value="">-- Select a lecture --</option>
                            {lectures.map((lecture) => (
                                <option key={lecture.lectureID} value={lecture.DirectoryPath}>
                                    {lecture.lectureName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="num-questions">Number of Questions:</label>
                        <input
                            id="num-questions"
                            type="number"
                            min="1"
                            max="20"
                            value={numQuestions}
                            onChange={(e) => {
                                setNumQuestions(parseInt(e.target.value) || 1);
                                setSuccessMessage(null);
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="create-quiz-btn">
                        Set Quiz
                    </button>
                </form>
            )}
        </div>
    );
}

export default CreateQuiz;
