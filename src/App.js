import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { memo } from 'react';
import questionsData from './data/questions.json';

// Thêm Error Boundary component (đặt ở trên cùng, ngoài App component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Có thể gửi error log về server ở đây
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Có lỗi xảy ra</h2>
            <p>Xin lỗi vì sự bất tiện này. Hãy thử tải lại trang.</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Thêm Error Message component cho các lỗi nhỏ
const ErrorMessage = memo(({ message }) => (
  <div className="inline-error">
    <span className="error-icon">⚠️</span>
    <span className="error-text">{message}</span>
  </div>
));

function App() {
  const [showAnswer, setShowAnswer] = useState(false);
  const [visibleHints, setVisibleHints] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => {
    const savedDifficulty = localStorage.getItem('selectedDifficulty');
    return savedDifficulty || 'easy';
  });
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
  const [isLoading, setIsLoading] = useState(false);

  // Sample detective puzzle
  const questions = questionsData.questions;

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

  // Thêm useMemo để lọc câu hỏi theo ngôn ngữ và độ khó
  const filteredQuestions = useMemo(() => {
    return questionsData.questions.filter(question => 
      question.language === selectedLanguage && 
      question.difficulty === selectedDifficulty
    );
  }, [selectedLanguage, selectedDifficulty]);

  // Cập nhật state để theo dõi index của câu hỏi trong danh sách đã lọc
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Lấy câu hỏi hiện tại từ danh sách đã lọc
  const currentCase = filteredQuestions[currentQuestionIndex];

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

  const handleDifficultyChange = async (difficulty) => {
    setIsLoading(true);
    try {
      setSelectedDifficulty(difficulty);
      localStorage.setItem('selectedDifficulty', difficulty);
      resetQuestion();
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const handleAnswerSelect = (answerId) => {
    try {
      if (!showAnswer) {
        setSelectedAnswer(answerId);
      }
    } catch (error) {
      console.error('Error selecting answer:', error);
      // Có thể hiển thị thông báo lỗi nhẹ ở đây
    }
  };

  const checkAnswer = () => {
    try {
      if (!showAnswer) {
        const isCorrect = selectedAnswer === currentCase.correctAnswer;
        setShowAnswer(true);
        if (isCorrect) {
          setScore(score + calculateScore());
          setStreak(streak + 1);
        } else {
          setStreak(0);
        }
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      // Hiển thị thông báo lỗi user-friendly
      setErrorMessage('Không thể kiểm tra câu trả lời. Vui lòng thử lại.');
    }
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

  const nextQuestion = async () => {
    setIsLoading(true);
    try {
      if (currentQuestionIndex < filteredQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentQuestionIndex(0);
      }
      resetQuestion();
      
      // Scroll to top của question container với animation mượt
      if (questionContainerRef.current) {
        questionContainerRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
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

  // Tách Modal thành component riêng
  const LanguageModal = memo(({ 
    isOpen, 
    onClose, 
    categories, 
    selectedLanguage, 
    onLanguageSelect 
  }) => (
    <div className={`language-modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="language-modal" onClick={e => e.stopPropagation()}>
        <div className="language-modal-header">
          <h3 className="language-modal-title">Select Programming Language</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        {categories.map(category => (
          <div key={category.id} className="language-category">
            <div className="language-category-title">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </div>
            <div className="language-grid">
              {category.languages.map(lang => (
                <LanguageButton
                  key={lang.id}
                  lang={lang}
                  isSelected={selectedLanguage === lang.id}
                  onSelect={(langId) => {
                    onLanguageSelect(langId);
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ));

  // Cập nhật LanguageSelector
  const LanguageSelector = memo(({ 
    selectedLanguage,
    onLanguageSelect
  }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Lấy thông tin ngôn ngữ hiện tại
    const currentLang = useMemo(() => {
      for (const category of programmingCategories) {
        const lang = category.languages.find(l => l.id === selectedLanguage);
        if (lang) return lang;
      }
      return null;
    }, [selectedLanguage]);

    return (
      <div className="language-selector">
        <button 
          className="selected-language-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="selected-language-info">
            <span className="language-icon">{currentLang?.icon}</span>
            <span className="language-name">{currentLang?.name}</span>
          </div>
          <span className="language-selector-arrow">▼</span>
        </button>

        <LanguageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categories={programmingCategories}
          selectedLanguage={selectedLanguage}
          onLanguageSelect={onLanguageSelect}
        />
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

  // Thêm hàm để lấy thông tin ngôn ngữ hiện tại
  const getCurrentLanguageInfo = useMemo(() => {
    for (const category of programmingCategories) {
      const lang = category.languages.find(l => l.id === selectedLanguage);
      if (lang) {
        return {
          language: lang,
          category: category
        };
      }
    }
    return null;
  }, [selectedLanguage]);

  // Thêm useEffect để reset currentQuestionIndex khi đổi ngôn ngữ hoặc độ khó
  useEffect(() => {
    setCurrentQuestionIndex(0);
    resetQuestion();
  }, [selectedLanguage, selectedDifficulty]);

  // Thêm thông báo khi không có câu hỏi cho ngôn ngữ/độ khó đã chọn
  const NoQuestionsMessage = () => (
    <div className="no-questions-message">
      <h3>🔍 No Cases Available</h3>
      <p>There are currently no cases for {getCurrentLanguageInfo?.language.name} at {selectedDifficulty} level.</p>
      <p>Try selecting a different language or difficulty level.</p>
    </div>
  );

  const totalQuestions = filteredQuestions.length;

  // Thêm LoadingIndicator component (đặt trước component App)
  const LoadingIndicator = memo(() => (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  ));

  // Thêm state để lưu progress
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('questionProgress');
    return savedProgress ? JSON.parse(savedProgress) : {};
  });

  // Thêm useEffect để lưu tiến độ khi trả lời câu hỏi
  useEffect(() => {
    if (showAnswer) {
      const newProgress = {
        ...progress,
        [`${selectedLanguage}-${selectedDifficulty}`]: {
          ...progress[`${selectedLanguage}-${selectedDifficulty}`],
          [currentQuestionIndex]: {
            answered: true,
            correct: selectedAnswer === currentCase.correctAnswer,
            timestamp: new Date().toISOString()
          }
        }
      };
      setProgress(newProgress);
      localStorage.setItem('questionProgress', JSON.stringify(newProgress));
    }
  }, [showAnswer]);

  // Tách ProgressBar thành component riêng và thêm vào 2 vị trí
  const ProgressBar = memo(({ language, difficulty, isMobile }) => {
    const currentProgress = progress[`${language}-${difficulty}`] || {};
    const totalQuestions = filteredQuestions.length;
    const answeredCount = Object.values(currentProgress).filter(q => q.answered).length;
    const correctCount = Object.values(currentProgress).filter(q => q.correct).length;
    
    const percentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    
    return (
      <div className={`progress-section ${isMobile ? 'mobile' : ''}`}>
        <div className="progress-stats">
          <div className="progress-stat">
            <span>Đã làm</span>
            <span>{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="progress-stat">
            <span>Đúng</span>
            <span>{correctCount}/{answeredCount}</span>
          </div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  });

  // Thêm useEffect cho keyboard shortcuts
  React.useEffect(() => {
    const handleKeyboardNavigation = (e) => {
      // Chuyển câu hỏi tiếp theo với phím mũi tên phải
      if (e.key === 'ArrowRight') nextQuestion();

      // Kiểm tra đáp án với phím Enter khi đã chọn câu trả lời
      if (e.key === 'Enter' && selectedAnswer && !showAnswer) {
        checkAnswer();
      }

      // Chọn đáp án với phím số (1-4)
      if (['1', '2', '3', '4'].includes(e.key) && !showAnswer) {
        const answerIndex = parseInt(e.key) - 1;
        if (answers[answerIndex]) {
          handleAnswerSelect(answers[answerIndex].id);
        }
      }

      // Hiển thị/ẩn gợi ý với phím H
      if (e.key.toLowerCase() === 'h') {
        const unrevealedHints = hints.filter((_, index) => !visibleHints.includes(index));
        if (unrevealedHints.length > 0) {
          toggleHint(hints.findIndex((_, index) => !visibleHints.includes(index)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyboardNavigation);
    return () => window.removeEventListener('keydown', handleKeyboardNavigation);
  }, [selectedAnswer, showAnswer, answers, hints, visibleHints]);

  // Thêm component KeyboardShortcuts
  const KeyboardShortcuts = memo(() => (
    <div className="keyboard-shortcuts">
      <h3>⌨️ Phím tắt</h3>
      <div className="shortcuts-grid">
        <div className="shortcut-item">
          <kbd>→</kbd>
          <span>Câu tiếp theo</span>
        </div>
        <div className="shortcut-item">
          <kbd>Enter</kbd>
          <span>Kiểm tra đáp án</span>
        </div>
        <div className="shortcut-item">
          <kbd>1</kbd>-<kbd>4</kbd>
          <span>Chọn đáp án</span>
        </div>
        <div className="shortcut-item">
          <kbd>H</kbd>
          <span>Hiện gợi ý</span>
        </div>
      </div>
    </div>
  ));

  // Thêm state cho share status
  const [shareStatus, setShareStatus] = useState({
    isSharing: false,
    message: ''
  });

  // Thêm hàm share
  const shareQuestion = async () => {
    setShareStatus({ isSharing: true, message: '' });
    
    const shareData = {
      title: 'Tech Detective Challenge',
      text: `Can you solve this coding challenge? "${currentCase?.title}"`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        // Mobile native share
        await navigator.share(shareData);
        setShareStatus({ isSharing: false, message: 'Shared successfully!' });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setShareStatus({ isSharing: false, message: 'Link copied to clipboard!' });
      }
    } catch (err) {
      console.error('Error sharing:', err);
      setShareStatus({ 
        isSharing: false, 
        message: 'Failed to share. Please try again.'
      });
    }

    // Clear status message after 2 seconds
    setTimeout(() => {
      setShareStatus({ isSharing: false, message: '' });
    }, 2000);
  };

  // Sửa lại Share Button component
  const ShareButton = memo(({ onShare, isSharing, message }) => (
    <div className="share-container">
      <button 
        className="share-button floating-control"
        onClick={onShare}
        disabled={isSharing}
        aria-label="Share question"
      >
        {isSharing ? '⏳' : '📤'}
      </button>
      {message && (
        <div className="share-message">
          {message}
        </div>
      )}
    </div>
  ));

  // Thêm state cho error message
  const [errorMessage, setErrorMessage] = useState(null);

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
              onLanguageSelect={setSelectedLanguage}
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

            <ProgressBar 
              language={selectedLanguage}
              difficulty={selectedDifficulty}
              isMobile={false}
            />
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
          <KeyboardShortcuts />
        </div>
        
        <main className="main-content">
          {filteredQuestions.length > 0 ? (
            <div 
              className={`challenge-container ${isLoading ? 'loading' : ''}`} 
              ref={questionContainerRef}
            >
              {isLoading && <LoadingIndicator />}
              <div className="floating-controls">
                <ShareButton 
                  onShare={shareQuestion}
                  isSharing={shareStatus.isSharing}
                  message={shareStatus.message}
                />
                <button 
                  className={`floating-control nav-btn ${showAnswer ? 'answered' : ''}`}
                  onClick={nextQuestion}
                  aria-label="Next case"
                >
                  ⏭️
                </button>
              </div>

              <div className="challenge-header">
                <div className="title-section">
                  {totalQuestions > 0 && (
                    <div className="question-counter">
                      Câu {currentQuestionIndex + 1}/{totalQuestions}:
                    </div>
                  )}
                  <h2 className="challenge-title">{currentCase?.title}</h2>
                  <div className="case-meta">
                    <div className={`difficulty-badge ${selectedDifficulty}`}>
                      {selectedDifficulty}
                    </div>
                    <div className="category-badge">
                      {getCurrentLanguageInfo ? (
                        <>
                          {getCurrentLanguageInfo.category.icon} {getCurrentLanguageInfo.language.name}
                        </>
                      ) : '🏗️ Backend'}
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
          ) : (
            <NoQuestionsMessage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
