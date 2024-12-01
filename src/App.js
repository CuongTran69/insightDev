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
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || 'javascript';
  });
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(() => {
    const savedCategory = localStorage.getItem('activeCategory');
    return savedCategory || 'frontend';
  });
  const questionContainerRef = useRef(null);

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
    
    const streakBonus = streak * 50;
    const hintPenalty = visibleHints.length * 25;
    
    return baseScore + streakBonus - hintPenalty;
  };

  const resetQuestion = () => {
    setShowAnswer(false);
    setVisibleHints([]);
    setSelectedAnswer(null);
  };

  const nextQuestion = () => {
    if (currentQuestion >= questions.length - 1) {
      setCurrentQuestion(0);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
    
    setShowAnswer(false);
    setSelectedAnswer(null);
    setVisibleHints([]);

    // Scroll to top
    questionContainerRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
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
      if (e.key === 'ArrowRight') nextQuestion();
    };

    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, []);

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setVisibleHints([]);
  };

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
    
    // Kiểm tra xem ngôn ngữ hiện tại có thuộc category mới không
    const currentCategoryLanguages = programmingCategories
      .find(cat => cat.id === categoryId)
      ?.languages.map(lang => lang.id) || [];
    
    // Nếu ngôn ngữ hiện tại không thuộc category mới, chọn ngôn ngữ đầu tiên của category mới
    if (!currentCategoryLanguages.includes(selectedLanguage)) {
      const firstLangInCategory = programmingCategories
        .find(cat => cat.id === categoryId)
        ?.languages[0]?.id;
      if (firstLangInCategory) {
        setSelectedLanguage(firstLangInCategory);
      }
    }
  };

  // Thêm useEffect để lưu language và category khi thay đổi
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('activeCategory', activeCategory);
  }, [activeCategory]);

  return (
    <div className="App">
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
          </div>
        </div>
        
        <main className="main-content">
          <div className="challenge-container" ref={questionContainerRef}>
            <div className="navigation-buttons">
              <button 
                className={`floating-control nav-btn ${showAnswer ? 'answered' : ''}`}
                onClick={nextQuestion}
                aria-label="Next case"
              >
                <span className="icon">⏭️</span>
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
