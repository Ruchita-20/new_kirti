import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; 
import './PredictorForm.css'; // Importing CSS for styling

const PredictorForm = ({ csvfile, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(Array(10).fill('10'));
  const [result, setResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/${csvfile}.csv`);
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value);
        const { data } = Papa.parse(csv, { header: true });
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (result !== null) {
      console.log('Result State:', result);
    }
  }, [result]);

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
    setSelectedOption({ ...selectedOption, [index]: value });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExit = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/predict', {
        ...responses.reduce((acc, response, index) => {
          acc[`col${index}`] = response;
          return acc;
        }, {})
      });
      console.log('Response from server:', res.data);
      setResult({
        predicted_total: res.data.predicted_total,
      });
    } catch (error) {
      console.log('Error predicting result', error);
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <button className="exit-btn" onClick={handleExit}>X</button>
        <form onSubmit={handleSubmit}>
          {questions.length > 0 && (
            <>
              <h2>Question {currentQuestionIndex + 1}</h2>
              <p>{questions[currentQuestionIndex]?.question}</p>
              <div className="answers">
                <label><input type='radio' value="10" name={`col${currentQuestionIndex}`} checked={selectedOption[currentQuestionIndex] === "10"} onChange={() => handleResponseChange(currentQuestionIndex, "10")}/>Rarely</label>
                <label><input type='radio' value="20" name={`col${currentQuestionIndex}`} checked={selectedOption[currentQuestionIndex] === "20"} onChange={() => handleResponseChange(currentQuestionIndex, "20")}/>Sometimes</label>
                <label><input type='radio' value="30" name={`col${currentQuestionIndex}`} checked={selectedOption[currentQuestionIndex] === "30"} onChange={() => handleResponseChange(currentQuestionIndex, "30")}/>Frequently</label>
              </div>
            </>
          )}
          <div className="navigation-btns">
            {currentQuestionIndex > 0 && (
              <button type="button" onClick={handlePreviousQuestion}>Previous</button>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <button type="button" onClick={handleNextQuestion}>Next</button>
            ) : (
              <button type="submit">Predict</button>
            )}
          </div>
        </form>
        {result !== null && (
          <div>
            <h2>Prediction Result:</h2>
            <p>Predicted Percentage: {result.predicted_total}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictorForm;
