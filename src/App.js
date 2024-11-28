import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { memo } from 'react';

function App() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [visibleHints, setVisibleHints] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [streak, setStreak] = useState(0);
  const INITIAL_TIME = 120; // 2 minutes
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('timeLeft');
    const savedTimestamp = localStorage.getItem('timerTimestamp');
    
    if (savedTime && savedTimestamp) {
      const elapsedSeconds = Math.floor((Date.now() - parseInt(savedTimestamp)) / 1000);
      const remainingTime = Math.max(0, parseInt(savedTime) - elapsedSeconds);
      return remainingTime > 0 ? remainingTime : 0;
    }
    return INITIAL_TIME;
  });
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [activeCategory, setActiveCategory] = useState('frontend');

  // Sample detective puzzle
  const questions = [
    {
      id: 1,
      title: "The Case of the Missing Semicolon",
      scenario: `Team Lead Sarah reports a production bug.
                Junior Dev Tom claims he tested everything.
                DevOps Alex mentions recent deployment changes.`,
      statements: [
        "Sarah: 'The bug only appears in production, not in staging.'",
        "Tom: 'I ran all tests before pushing the code.'",
        "Alex: 'We didn't change any deployment configs recently.'"
      ],
      question: "Who is telling the truth about the production bug?",
      difficulty: 'easy',
      category: '🏗️ Backend',
      hints: [
        "Check the git logs for recent deployment changes",
        "Compare test environment variables between staging and production",
        "One person is lying about their involvement 🕵️‍♂️"
      ],
      answers: [
        { id: 1, text: "Sarah is telling the truth" },
        { id: 2, text: "Tom is telling the truth" },
        { id: 3, text: "Alex is telling the truth" },
        { id: 4, text: "Everyone is lying" }
      ],
      correctAnswer: 1,
      explanation: {
        logic: "Sarah is telling the truth because staging and production environments often have different configurations. Tom might think he tested everything but missed environment-specific cases. Alex's statement about deployment configs can be disproven by git logs.",
        technicalDetails: "This case highlights the importance of environment parity and thorough testing across different environments.",
        meme: "semicolon-bug-meme.gif"
      }
    }
    // Add more detective cases here
  ];

  // Update programming languages data structure
  const programmingCategories = [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: '🎨',
      languages: [
        { id: 'javascript', name: 'JavaScript', icon: '💛' },
        { id: 'react', name: 'React', icon: '⚛️' },
        { id: 'vue', name: 'Vue.js', icon: '💚' },
        { id: 'angular', name: 'Angular', icon: '🔴' },
      ]
    },
    {
      id: 'backend',
      name: 'Backend',
      icon: '⚙️',
      languages: [
        { id: 'golang', name: 'Golang', icon: '🔷' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'php', name: 'PHP', icon: '🐘' },
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'nodejs', name: 'Node.js', icon: '💚' },
      ]
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: '📱',
      languages: [
        { id: 'swift', name: 'iOS/Swift', icon: '🍎' },
        { id: 'kotlin', name: 'Android/Kotlin', icon: '🤖' },
        { id: 'reactnative', name: 'React Native', icon: '⚛️' },
        { id: 'flutter', name: 'Flutter', icon: '💙' },
      ]
    },
    {
      id: 'database',
      name: 'Database',
      icon: '🗄️',
      languages: [
        { id: 'sql', name: 'SQL', icon: '📊' },
        { id: 'mongodb', name: 'MongoDB', icon: '🍃' },
        { id: 'redis', name: 'Redis', icon: '🔴' },
      ]
    }
  ];

  // Difficulty levels with descriptions
  const difficultyLevels = [
    { 
      id: 'easy',
      name: 'Tập Sự',
      icon: '🟢',
      description: 'Perfect for beginners'
    },
    { 
      id: 'medium',
      name: 'Thợ Code',
      icon: '🟡',
      description: 'For experienced developers'
    },
    { 
      id: 'hard',
      name: 'Senior',
      icon: '🔴',
      description: 'Challenge your expertise'
    }
  ];

  const currentCase = questions[currentQuestion];
  const hints = currentCase?.hints || [];
  const answers = currentCase?.answers || [];

  const toggleHint = (index) => {
    if (visibleHints.includes(index)) {
      setVisibleHints(visibleHints.filter(i => i !== index));
    } else {
      setVisibleHints([...visibleHints, index]);
      // Easter egg when all hints are revealed
      if (visibleHints.length === 2) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 3000);
      }
    }
  };

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    resetQuestion();
  };

  const handleAnswerSelect = (answerId) => {
    if (!showAnswer) {  // Only allow selection if answer isn't shown yet
      setSelectedAnswer(answerId);
    }
  };

  const checkAnswer = () => {
    const isCorrect = selectedAnswer === currentCase.correctAnswer;
    setShowAnswer(true);
    if (isCorrect) {
      setScore(score + calculateScore());
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    
    // Add smooth scroll to solution
    setTimeout(() => {
      const solutionPanel = document.querySelector('.solution-panel');
      if (solutionPanel) {
        solutionPanel.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const calculateScore = () => {
    const baseScore = {
      'easy': 100,
      'medium': 200,
      'hard': 300
    }[selectedDifficulty];
    
    const timeBonus = Math.floor(timeLeft / 10);
    const streakBonus = streak * 50;
    const hintPenalty = visibleHints.length * 25;
    
    return baseScore + timeBonus + streakBonus - hintPenalty;
  };

  const resetQuestion = () => {
    setShowAnswer(false);
    setVisibleHints([]);
    setSelectedAnswer(null);
    setTimeLeft(120);
    setShowEasterEgg(false);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
    setTimeLeft(INITIAL_TIME);
    localStorage.setItem('timeLeft', INITIAL_TIME.toString());
    localStorage.setItem('timerTimestamp', Date.now().toString());
    setIsTimeout(false);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setVisibleHints([]);
  };

  const previousQuestion = () => {
    setCurrentQuestion((prev) => (prev - 1 + questions.length) % questions.length);
    resetQuestion();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const handleKeyboardNavigation = (e) => {
      if (e.key === 'ArrowLeft') previousQuestion();
      if (e.key === 'ArrowRight') nextQuestion();
    };

    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, []);

  useEffect(() => {
    if (!isPaused && timeLeft > 0 && !showAnswer) {
      // Save current time and timestamp to localStorage
      localStorage.setItem('timeLeft', timeLeft.toString());
      localStorage.setItem('timerTimestamp', Date.now().toString());

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev <= 1 ? 0 : prev - 1;
          if (newTime === 0) {
            setIsTimeout(true);
          }
          // Update localStorage
          localStorage.setItem('timeLeft', newTime.toString());
          localStorage.setItem('timerTimestamp', Date.now().toString());
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isPaused, showAnswer]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector('.sidebar');
      const menuButton = document.querySelector('.mobile-menu-btn');
      
      if (isMobileMenuOpen && 
          sidebar && 
          !sidebar.contains(event.target) && 
          !menuButton.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const TimeoutModal = ({ onRetry }) => (
    <div className="timeout-modal">
      <div className="timeout-content">
        <h2>⏰ Time's Up!</h2>
        <p>You ran out of time for this case.</p>
        <div className="timeout-stats">
          <div>Score: {score}</div>
          <div>Streak: {streak}</div>
        </div>
        <div className="timeout-actions">
          <button onClick={onRetry} className="retry-btn">
            🔄 Try Again
          </button>
          <button onClick={() => nextQuestion()} className="next-btn">
            ⏭️ Next Case
          </button>
        </div>
      </div>
    </div>
  );

  const handleRetry = () => {
    setTimeLeft(INITIAL_TIME);
    setIsTimeout(false);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setVisibleHints([]);
    localStorage.setItem('timeLeft', INITIAL_TIME.toString());
    localStorage.setItem('timerTimestamp', Date.now().toString());
  };

  useEffect(() => {
    return () => {
      localStorage.removeItem('timeLeft');
      localStorage.removeItem('timerTimestamp');
    };
  }, []);

  // Tách riêng Language Button thành component riêng và memo hóa
  const LanguageButton = memo(({ lang, isSelected, onSelect }) => (
    <button
      className={`language-btn ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect(lang.id)}
    >
      <span className="language-icon">{lang.icon}</span>
      <span className="language-name">{lang.name}</span>
    </button>
  ));

  // Tách Category Tab thành component riêng
  const CategoryTab = memo(({ category, isActive, onClick }) => {
    const tabRef = useRef(null);

    useEffect(() => {
      if (isActive && tabRef.current) {
        const tab = tabRef.current;
        const container = tab.parentElement;
        
        // Calculate scroll position
        const tabRect = tab.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Check if tab is partially visible
        if (tabRect.right > containerRect.right || tabRect.left < containerRect.left) {
          // Scroll into view with some padding
          const scrollPosition = tab.offsetLeft - container.offsetLeft - 
            (container.offsetWidth / 2) + (tab.offsetWidth / 2);
          
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    }, [isActive]);

    return (
      <button
        ref={tabRef}
        className={`category-tab ${isActive ? 'active' : ''}`}
        onClick={() => onClick(category.id)}
      >
        <span className="category-icon">{category.icon}</span>
        <span className="category-name">{category.name}</span>
      </button>
    );
  });

  // Update LanguageSelector component
  const LanguageSelector = memo(({ 
    selectedLanguage, 
    activeCategory,
    onLanguageSelect,
    onCategoryChange 
  }) => {
    return (
      <div className="language-selector">
        <div className="category-tabs">
          {programmingCategories.map(category => (
            <CategoryTab
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={onCategoryChange}
            />
          ))}
        </div>

        <div className="language-grid">
          {programmingCategories
            .find(cat => cat.id === activeCategory)
            ?.languages.map(lang => (
              <LanguageButton
                key={lang.id}
                lang={lang}
                isSelected={selectedLanguage === lang.id}
                onSelect={onLanguageSelect}
              />
            ))}
        </div>
      </div>
    );
  });

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // Optionally select the first language of the new category
    const firstLangInCategory = programmingCategories
      .find(cat => cat.id === categoryId)
      ?.languages[0]?.id;
    if (firstLangInCategory) {
      setSelectedLanguage(firstLangInCategory);
    }
  };

  return (
    <div className="App">
      <div className={`timer-display floating-control ${timeLeft < 30 ? 'warning' : ''}`}>
        ⏱️ {formatTime(timeLeft)}
      </div>

      <div className="theme-toggle">
        <button 
          className="theme-toggle-btn floating-control"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="ide-layout">
        <button 
          className="mobile-menu-btn floating-control"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <h1>{'</'} Tech Detective {'>'}</h1>
              <div className="badge">🕵️‍♂️ Case Files</div>
            </div>
          </div>

          <div className="profile-section">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              activeCategory={activeCategory}
              onLanguageSelect={setSelectedLanguage}
              onCategoryChange={handleCategoryChange}
            />

            <div className="difficulty-selector">
              <h3>🎯 Clearance Level</h3>
              <div className="difficulty-cards">
                {difficultyLevels.map(level => (
                  <button
                    key={level.id}
                    className={`difficulty-card ${selectedDifficulty === level.id ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange(level.id)}
                  >
                    <div className="difficulty-header">
                      <span className="difficulty-icon">{level.icon}</span>
                      <span className="difficulty-name">{level.name}</span>
                    </div>
                    <p className="difficulty-desc">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Detective Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Case Streak</span>
              <span className="stat-value">{streak} 🔥</span>
            </div>
            <div className={`stat-item timer ${timeLeft < 30 ? 'warning' : ''}`}>
              <span className="stat-label">Time Left</span>
              <div className="timer-controls">
                <span className="stat-value">⏱️ {formatTime(timeLeft)}</span>
                <button 
                  className="pause-btn"
                  onClick={() => setIsPaused(!isPaused)}
                  aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <main className="main-content">
          <div className="challenge-container">
            <div className="navigation-buttons">
              <button 
                className="nav-btn prev-btn" 
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                <span className="icon">⬅️</span>
                <span>Previous Case</span>
              </button>

              <button 
                className="nav-btn next-btn" 
                onClick={nextQuestion}
                disabled={currentQuestion === questions.length - 1}
              >
                <span>Next Case</span>
                <span className="icon">➡️</span>
              </button>
            </div>

            <div className="challenge-header">
              <div className="title-section">
                <h2 className="challenge-title">{currentCase?.title}</h2>
                <div className="case-meta">
                  <div className={`difficulty-badge ${selectedDifficulty}`}>
                    {selectedDifficulty}
                  </div>
                  <div className="category-badge">
                    {currentCase?.category}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="case-file">
              <div className="scenario-section">
                <h3>📁 Case Background</h3>
                <p>{currentCase?.scenario}</p>
              </div>

              <div className="statements-section">
                <h3>🗣️ Statements</h3>
                <div className="statements-list">
                  {currentCase?.statements.map((statement, index) => (
                    <div key={index} className="statement-item">
                      {statement}
                    </div>
                  ))}
                </div>
              </div>

              <div className="question-section">
                <h3>❓ Detective's Task</h3>
                <p>{currentCase?.question}</p>
              </div>
            </div>

            <div className="hints-section">
              <h3>🔍 Investigation Notes</h3>
              <div className="hints-grid">
                {hints.map((hint, index) => (
                  <div key={index} className="hint-card">
                    <button 
                      className={`hint-toggle ${visibleHints.includes(index) ? 'active' : ''}`}
                      onClick={() => toggleHint(index)}
                    >
                      <span className="hint-number">Clue #{index + 1}</span>
                      <span className="icon"></span>
                    </button>
                    {visibleHints.includes(index) && (
                      <div className="hint-content">
                        {hint}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="answers-section">
              <h3>🎯 Your Deduction</h3>
              <div className="answers-grid">
                {answers.map(answer => (
                  <div 
                    key={answer.id} 
                    className={`answer-card 
                      ${selectedAnswer === answer.id ? 'selected' : ''} 
                      ${showAnswer && answer.id === currentCase.correctAnswer ? 'correct' : ''}
                      ${showAnswer && selectedAnswer === answer.id && answer.id !== currentCase.correctAnswer ? 'incorrect' : ''}`}
                    onClick={() => handleAnswerSelect(answer.id)}
                  >
                    <div className="answer-text">{answer.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="check-answer-btn"
                onClick={checkAnswer}
                disabled={!selectedAnswer || showAnswer}
              >
                <span className="icon">🔍</span>
                Submit Deduction
              </button>
            </div>

            {showAnswer && (
              <div className="solution-panel">
                <h3 className="solution-title">📋 Case Solved!</h3>
                <div className="solution-content">
                  <div className="explanation-section">
                    <h4>🧩 Logic Behind the Case</h4>
                    <p>{currentCase.explanation.logic}</p>
                    
                    <h4>💻 Technical Analysis</h4>
                    <p>{currentCase.explanation.technicalDetails}</p>
                  </div>

                  <div className="score-breakdown">
                    <h4>🏆 Detective Rating</h4>
                    <ul>
                      <li>Base Score: {{'easy': 100, 'medium': 200, 'hard': 300}[selectedDifficulty]}</li>
                      <li>Quick Thinking Bonus: +{Math.floor(timeLeft / 10)}</li>
                      <li>Case Streak Bonus: +{streak * 50}</li>
                      <li>Clue Usage Penalty: -{visibleHints.length * 25}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {showEasterEgg && (
              <div className="easter-egg">
                <div className="egg-content">
                  🥚 "Elementary, my dear developer!" 🕵️‍♂️
                </div>
              </div>
            )}

            {isTimeout && (
              <TimeoutModal onRetry={handleRetry} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
