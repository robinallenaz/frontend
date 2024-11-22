import { useState } from 'react';

function About() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 1,
      title: "Practice Mode",
      icon: "🎮",
      description: "Interactive card-based learning system with memory games, immediate feedback, and progress tracking.",
      details: [
        "Memory game with kanji-meaning matching",
        "Immediate feedback on matches",
        "Progress tracking and scoring",
        "Engaging animations"
      ]
    },
    {
      id: 2,
      title: "Kanji Dictionary",
      icon: "📚",
      description: "Comprehensive kanji lookup functionality with detailed character information.",
      details: [
        "Meanings and readings",
        "Example usage",
        "Stroke order",
        "Detailed explanations"
      ]
    },
    {
      id: 3,
      title: "Custom Collections",
      icon: "📝",
      description: "Create and manage your personal kanji collections for focused learning.",
      details: [
        "Create custom kanji sets",
        "Track learning progress",
        "Review collections",
        "Personalized study path"
      ]
    }
  ];

  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "Node.js", icon: "🟢" },
    { name: "Express", icon: "🚂" },
    { name: "KanjiAPI", icon: "🈁" }
  ];

  return (
    <div className="about-container">
      <div className="about-hero">
        <div className="falling-characters">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="falling-character">漢</span>
          ))}
        </div>
        <h1>About Kanji Learning Journey</h1>
        <p>An interactive full-stack web application designed to help you master Japanese Kanji characters through engaging practice and personalized collections.</p>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map(feature => (
            <div 
              key={feature.id} 
              className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
              onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {activeFeature === feature.id && (
                <ul className="feature-details">
                  {feature.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tech-stack-section">
        <h2>Built With</h2>
        <div className="tech-stack-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="tech-card">
              <span className="tech-icon">{tech.icon}</span>
              <span className="tech-name">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
