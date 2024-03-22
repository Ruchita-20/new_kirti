import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; 
const PredictorForm = ({ csvfile }) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState(Array(10).fill('10'));
  const [result, setResult] = useState(null);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const res = await axios.post('http://localhost:5000/predict', {
        col0: responses[0],
        col1: responses[1],
        col2: responses[2],
        col3: responses[3],
        col4: responses[4],
        col5: responses[5],
        col6: responses[6],
        col7: responses[7],
        col8: responses[8],
        col9: responses[9],
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
    <div>
      <form onSubmit={handleSubmit}>
        {responses.map((value, index) => (
          <div key={index}>
            <label htmlFor={`col${index}`}>{questions[index]?.question}</label>
            <label><input type='radio' value="10" name={`col${index}`} onChange={() => handleResponseChange(index, "10")}/>Rarely</label>
            <label><input type='radio' value="20" name={`col${index}`} onChange={() => handleResponseChange(index, "20")}/>Sometimes</label>
            <label><input type='radio' value="30" name={`col${index}`} onChange={() => handleResponseChange(index, "30")}/>Frequently</label>
            {/* <select
              name={`col${index}`}
              id={`col${index}`}
              value={value}
              onChange={(e) => handleResponseChange(index, e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select> */}
            <br />
          </div>
        ))}
        <button type="submit">Predict</button>
      </form>
      {result !== null && (
        <div>
          <h2>Prediction Result:</h2>
          <p>Predicted Percentage: {result.predicted_total}</p>
        </div>
      )}
    </div>
  );
};

export default PredictorForm;
