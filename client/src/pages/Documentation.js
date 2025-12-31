import React from 'react';
import { FiExternalLink, FiBook, FiCode, FiVideo } from 'react-icons/fi';
import './Documentation.css';

const Documentation = () => {
  const docs = [
    {
      category: 'JavaScript',
      resources: [
        { title: 'MDN Web Docs - JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'Documentation' },
        { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'Tutorial' },
        { title: 'ES6 Features', url: 'https://es6-features.org/', type: 'Reference' },
        { title: 'JavaScript Design Patterns', url: 'https://www.patterns.dev/', type: 'Guide' },
      ],
    },
    {
      category: 'React',
      resources: [
        { title: 'React Official Docs', url: 'https://react.dev/', type: 'Documentation' },
        { title: 'React Router', url: 'https://reactrouter.com/', type: 'Documentation' },
        { title: 'React Hooks Guide', url: 'https://react.dev/reference/react', type: 'Reference' },
        { title: 'React Patterns', url: 'https://reactpatterns.com/', type: 'Guide' },
      ],
    },
    {
      category: 'Node.js',
      resources: [
        { title: 'Node.js Official Docs', url: 'https://nodejs.org/docs/', type: 'Documentation' },
        { title: 'Express.js Guide', url: 'https://expressjs.com/', type: 'Documentation' },
        { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'Guide' },
      ],
    },
    {
      category: 'Databases',
      resources: [
        { title: 'MongoDB Manual', url: 'https://docs.mongodb.com/', type: 'Documentation' },
        { title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', type: 'Tutorial' },
        { title: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/', type: 'Documentation' },
      ],
    },
    {
      category: 'Python',
      resources: [
        { title: 'Python Official Docs', url: 'https://docs.python.org/3/', type: 'Documentation' },
        { title: 'Real Python', url: 'https://realpython.com/', type: 'Tutorial' },
        { title: 'Python Cheat Sheet', url: 'https://www.pythoncheatsheet.org/', type: 'Reference' },
      ],
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'Documentation':
        return <FiBook />;
      case 'Tutorial':
        return <FiVideo />;
      case 'Reference':
        return <FiCode />;
      default:
        return <FiBook />;
    }
  };

  return (
    <div className="documentation-page">
      <div className="docs-header">
        <h1>📚 Learning Resources & Documentation</h1>
        <p>Comprehensive documentation and resources for your learning journey</p>
      </div>

      <div className="docs-grid">
        {docs.map((category, index) => (
          <div key={index} className="docs-category">
            <h2 className="category-title">{category.category}</h2>
            <div className="resources-list">
              {category.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-item"
                >
                  <div className="resource-icon">{getIcon(resource.type)}</div>
                  <div className="resource-content">
                    <h3>{resource.title}</h3>
                    <span className="resource-type">{resource.type}</span>
                  </div>
                  <FiExternalLink className="external-icon" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documentation;

