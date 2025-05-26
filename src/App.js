import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CX      = process.env.REACT_APP_GOOGLE_CSE_ID;

// 5 minutes in milliseconds:
const IDLE_TIMEOUT = 5 * 60 * 1000;

export default function App() {
  const [barcode, setBarcode]     = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [history, setHistory]     = useState([]);    // array of { code, url }
  const inputRef = useRef(null);
  const idleTimer = useRef(null);

  // keep the hidden input focused
  useEffect(() => {
    const inp = inputRef.current;
    inp.focus();
    const onBlur = () => inp.focus();
    inp.addEventListener('blur', onBlur);
    return () => inp.removeEventListener('blur', onBlur);
  }, []);

  // reset everything
  const resetAll = useCallback(() => {
    setBarcode('');
    setCurrentImage(null);
    setHistory([]);
  }, []);

  // call on each successful scan
  const kickIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      resetAll();
    }, IDLE_TIMEOUT);
  }, [resetAll]);

  // fetch via Google Custom Search
  const fetchFirstImage = async code => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1`
        + `?key=${API_KEY}`
        + `&cx=${CX}`
        + `&searchType=image`
        + `&num=1`
        + `&q=${encodeURIComponent(code)}`
      );
      const data = await res.json();
      if (data.items?.length) {
        const url = data.items[0].link;
        setCurrentImage(url);
        setHistory(h => [...h, { code, url }]);
        kickIdleTimer();
      } else {
        alert(`No image found for ${code}`);
      }
    } catch (err) {
      console.error(err);
      alert('Image lookup failed');
    } finally {
      setLoading(false);
    }
  };

  // handle scans
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      const code = barcode.trim();
      setBarcode('');
      if (code) fetchFirstImage(code);
    }
  };

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8, #ffffff)',
      overflow: 'hidden',
    }}>
      {/* Left: current scan */}
      <div style={{
        flex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* full-screen invisible input */}
        <input
          ref={inputRef}
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100vw',
            height: '100vh',
            opacity: 0,
            border: 'none',
            margin: 0,
            padding: 0,
            zIndex: 9999,
          }}
        />

        <div style={{
          width: '60%',
          height: '60%',
          background: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {loading && <p style={{ color: '#666' }}>Looking up image…</p>}

          {!loading && currentImage && (
            <img
              src={currentImage}
              alt="Last scanned item"
              style={{
                width: '50vw',
                height: '50vh',
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          )}

          {!loading && !currentImage && (
            <p style={{ color: '#888', fontSize: 20 }}>
              ✨ Scan a barcode to display its image ✨
            </p>
          )}
        </div>
      </div>

      {/* Right: history */}
      <div style={{
        flex: 1,
        background: '#fafafa',
        borderLeft: '1px solid #e0e0e0',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <h2 style={{ margin: 0, marginBottom: 10 }}>
          {history.length} item{history.length !== 1 && 's'} scanned
        </h2>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
        }}>
          {history.map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              padding: '5px',
              borderRadius: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 80,
            }}>
              <img
                src={item.url}
                alt={item.code}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
