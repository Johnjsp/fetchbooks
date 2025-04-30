import React, { useState, useEffect } from 'react';

function BookSearch() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [file, setFile] = useState(null);
  const [uploadedBooks, setUploadedBooks] = useState([]);

  const itemsPerPage = 10;
  const maxResults = 10;

  const fetchBooks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query
        )}&startIndex=${currentPage * maxResults}&maxResults=${maxResults}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setBooks(data.items || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchBooks();
    }
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchBooks();
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const maxPage = Math.ceil(totalItems / itemsPerPage) - 1;
      return Math.min(maxPage, prev + 1);
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleFileUpload = () => {
    if (!file) return;

    // In a real app, we would send the file to a server
    // For this demo, we'll just parse it if it's a text file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Simulate parsing a CSV or TXT file with book titles
        const content = e.target.result;
        const lines = content.split('\n');
        const parsedBooks = lines
          .filter(line => line.trim())
          .map((line, index) => ({
            id: `upload-${index}`,
            volumeInfo: {
              title: line,
              authors: ['Unknown Author'],
              imageLinks: { thumbnail: '' }
            }
          }));
        
        setUploadedBooks(parsedBooks);
      } catch (err) {
        setError('Failed to parse uploaded file');
      }
    };
    reader.readAsText(file);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="book-search-container">
      <h1 className="book-search-title">Book Search</h1>
      
      {/* Search Input */}
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for books..."
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          className="search-button"
        >
          Search
        </button>
      </div>

      {/* Optional Upload Feature */}
      <div className="upload-section">
        <h2>Upload Books (Optional)</h2>
        <div className="upload-controls">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
            accept=".txt,.csv"
          />
          <button
            onClick={handleFileUpload}
            disabled={!file}
            className={file ? "upload-button" : "upload-button-disabled"}
          >
            Upload
          </button>
        </div>
        <p className="upload-hint">
          Upload a TXT or CSV file with book titles (one per line)
        </p>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="status-message">Loading books...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Book Results */}
      {!loading && books.length > 0 && (
        <div className="search-results">
          <h2>Search Results</h2>
          <div className="book-grid">
            {books.map((book) => (
              <div
                key={book.id}
                className="book-card"
              >
                <div className="book-image-container">
                  {book.volumeInfo.imageLinks ? (
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt={book.volumeInfo.title}
                      className="book-image"
                    />
                  ) : (
                    <div className="no-image">No image</div>
                  )}
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.volumeInfo.title}</h3>
                  <p className="book-author">
                    {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author'}
                  </p>
                  <p className="book-date">
                    {book.volumeInfo.publishedDate || 'No date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Books */}
      {uploadedBooks.length > 0 && (
        <div className="uploaded-books">
          <h2>Uploaded Books</h2>
          <div className="book-grid">
            {uploadedBooks.map((book) => (
              <div
                key={book.id}
                className="book-card"
              >
                <div className="book-image-container">
                  <div className="no-image">No image</div>
                </div>
                <div className="book-details">
                  <h3 className="book-title">{book.volumeInfo.title}</h3>
                  <p className="book-author">
                    {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown author'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={currentPage === 0 ? "pagination-button-disabled" : "pagination-button"}
          >
            Previous
          </button>
          
          <span className="page-indicator">
            Page {currentPage + 1} of {Math.max(1, totalPages)}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className={currentPage >= totalPages - 1 ? "pagination-button-disabled" : "pagination-button"}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BookSearch;