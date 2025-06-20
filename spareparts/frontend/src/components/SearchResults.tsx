import React from 'react';
import { SearchResult } from '../types';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelectResult: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  isLoading, 
  onSelectResult 
}) => {
  if (isLoading) {
    return (
      <div className="search-results loading">
        <div className="loading-spinner">🔄</div>
        <p>Analyzing image...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results empty">
        <div className="empty-icon">🔍</div>
        <h3>No matches found</h3>
        <p>Try taking a clearer photo or uploading a different image.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h3>Potential Matches ({results.length})</h3>
      <div className="results-grid">
        {results.map((result, index) => (
          <div 
            key={result.spare_part.id} 
            className="result-card"
            onClick={() => onSelectResult(result)}
          >
            <div className="result-image">
              {result.spare_part.image_path ? (
                <img 
                  src={`http://localhost:8000/uploads/${result.spare_part.image_path}`}
                  alt={result.spare_part.description}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'block';
                  }}
                />
              ) : null}
              <div className="placeholder-image">📦</div>
            </div>
            
            <div className="result-info">
              <h4 className="material-number">
                {result.spare_part.material_number}
              </h4>
              <p className="description">
                {result.spare_part.description}
              </p>
              {result.spare_part.category && (
                <span className="category">
                  {result.spare_part.category}
                </span>
              )}
              <div className="confidence">
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${result.confidence_score * 100}%` }}
                  ></div>
                </div>
                <span className="confidence-text">
                  {Math.round(result.confidence_score * 100)}% match
                </span>
              </div>
              <p className="match-reason">
                {result.match_reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .search-results {
          margin-top: 2rem;
        }

        .search-results h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .loading {
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .empty {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .result-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .result-image {
          position: relative;
          height: 150px;
          background: #f5f5f5;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .result-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          font-size: 3rem;
          color: #ccc;
        }

        .result-info h4 {
          margin: 0 0 0.5rem 0;
          color: #007bff;
          font-size: 1.1rem;
        }

        .description {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .category {
          display: inline-block;
          background: #e9ecef;
          color: #495057;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }

        .confidence {
          margin: 0.5rem 0;
        }

        .confidence-bar {
          width: 100%;
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }

        .confidence-text {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .match-reason {
          margin: 0.5rem 0 0 0;
          font-size: 0.8rem;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults; 