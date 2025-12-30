import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AssessmentDetail.css';

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (assessment && timeRemaining === null) {
      setTimeRemaining(assessment.duration * 60); // Convert to seconds
    }
  }, [assessment]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeRemaining, submitted]);

  const fetchAssessment = async () => {
    try {
      const response = await api.get(`/assessments/${id}`);
      setAssessment(response.data);
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((q) => {
        initialAnswers[q._id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    // Check if all questions are answered
    const unanswered = assessment.questions.filter(
      (q) => !answers[q._id] || answers[q._id] === ''
    );

    if (unanswered.length > 0 && !window.confirm(
      `You have ${unanswered.length} unanswered questions. Submit anyway?`
    )) {
      return;
    }

    setSubmitted(true);

    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const response = await api.post('/assessments/submit', {
        assessmentId: id,
        answers: answersArray,
      });

      setResult(response.data);

      // Refresh user data to update assessment count
      await fetchUser();

      toast.success('Assessment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner message="Loading assessment..." />;
  }

  if (!assessment) {
    return <div className="error-message">Assessment not found</div>;
  }

  if (result) {
    return (
      <div className="assessment-result">
        <div className="result-card">
          <h2>Assessment Complete!</h2>
          <div className="result-score">
            <div className="score-circle">
              <span className="score-value">{result.score}%</span>
            </div>
            <p className="score-level">Level: {result.level}</p>
          </div>
          <div className="result-details">
            <p>Correct Answers: {result.correctCount} / {result.totalQuestions}</p>
          </div>
          <div className="result-actions">
            <button
              onClick={() => navigate('/assessments')}
              className="btn btn-secondary"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => navigate('/learning-path')}
              className="btn btn-primary"
            >
              Generate Learning Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = assessment.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  return (
    <div className="assessment-detail">
      <div className="assessment-header-bar">
        <h2>{assessment.title}</h2>
        <div className="timer">
          ⏱ {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="question-card">
        <div className="question-header">
          <span className="question-number">
            Question {currentQuestion + 1} of {assessment.questions.length}
          </span>
        </div>

        <div className="question-content">
          <h3>{question.question}</h3>
          <div className="options">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`option-label ${answers[question._id] === option ? 'selected' : ''
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={() => handleAnswerChange(question._id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="question-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          {currentQuestion === assessment.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="btn btn-primary"
            >
              {submitted ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary">
              Next
            </button>
          )}
        </div>
      </div>

      <div className="question-indicators">
        {assessment.questions.map((q, index) => (
          <button
            key={q._id}
            onClick={() => setCurrentQuestion(index)}
            className={`indicator ${index === currentQuestion ? 'active' : ''
              } ${answers[q._id] ? 'answered' : ''}`}
            title={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssessmentDetail;

