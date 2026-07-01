import { useState, useEffect } from 'react';

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Manejar persistencia en localStorage para recordar la configuración del usuario
  useEffect(() => {
    setHighContrast(localStorage.getItem('acc_contrast') === 'true');
    setFontSize(localStorage.getItem('acc_fontSize') || 'normal');
    setDyslexicFont(localStorage.getItem('acc_dyslexic') === 'true');
    setHighlightLinks(localStorage.getItem('acc_highlight') === 'true');
    setTtsEnabled(localStorage.getItem('acc_tts') === 'true');
  }, []);

  // 1. Efecto para Contraste Alto
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('acc_contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('acc_contrast', 'false');
    }
  }, [highContrast]);

  // 2. Efecto para Escala de Fuentes
  useEffect(() => {
    document.documentElement.classList.remove('font-large', 'font-xlarge');
    if (fontSize === 'large') {
      document.documentElement.classList.add('font-large');
    } else if (fontSize === 'xlarge') {
      document.documentElement.classList.add('font-xlarge');
    }
    localStorage.setItem('acc_fontSize', fontSize);
  }, [fontSize]);

  // 3. Efecto para Fuente Disléxica
  useEffect(() => {
    if (dyslexicFont) {
      document.documentElement.classList.add('dyslexic-font');
      localStorage.setItem('acc_dyslexic', 'true');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
      localStorage.setItem('acc_dyslexic', 'false');
    }
  }, [dyslexicFont]);

  // 4. Efecto para Resaltar Enlaces
  useEffect(() => {
    if (highlightLinks) {
      document.documentElement.classList.add('highlight-links');
      localStorage.setItem('acc_highlight', 'true');
    } else {
      document.documentElement.classList.remove('highlight-links');
      localStorage.setItem('acc_highlight', 'false');
    }
  }, [highlightLinks]);

  // 5. Efecto para Lector de Voz (TTS)
  useEffect(() => {
    localStorage.setItem('acc_tts', ttsEnabled ? 'true' : 'false');
    if (!ttsEnabled) return;

    const handleMouseOver = (e) => {
      // Ignorar elementos de la propia barra de herramientas
      if (e.target.closest('#accessibility-toolbar-container')) return;

      const text = e.target.innerText || e.target.ariaLabel || e.target.placeholder || '';
      if (text.trim() && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 150));
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [ttsEnabled]);

  const resetSettings = () => {
    setHighContrast(false);
    setFontSize('normal');
    setDyslexicFont(false);
    setHighlightLinks(false);
    setTtsEnabled(false);
  };

  return (
    <div id="accessibility-toolbar-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000, fontFamily: "system-ui, sans-serif" }}>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de Accesibilidad"
        aria-expanded={isOpen}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: highContrast ? '#ffff00' : '#38bdf8',
          color: highContrast ? '#000000' : '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s ease',
          outline: 'none'
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        ♿
      </button>

      {/* Panel de Ajustes */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Panel de Configuración de Accesibilidad"
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '290px',
            backgroundColor: highContrast ? '#000000' : '#1e293b',
            color: highContrast ? '#ffffff' : '#f8fafc',
            border: highContrast ? '3px solid #ffffff' : '1px solid #334155',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            boxSizing: 'border-box',
            textAlign: 'left'
          }}
        >
          {/* Cabecera */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: highContrast ? '#ffff00' : '#38bdf8' }}>
              ⚙️ Ajustes WCAG
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar panel de accesibilidad"
              style={{
                background: 'none',
                border: 'none',
                color: highContrast ? '#ffff00' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          {/* Opciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 1. Contraste */}
            <div>
              <span style={{ fontSize: '13px', display: 'block', marginBottom: '6px', color: highContrast ? '#ffffff' : '#cbd5e1' }}>Contraste</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setHighContrast(false)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: highContrast ? '2px solid #ffffff' : '1px solid #334155',
                    backgroundColor: !highContrast ? '#38bdf8' : '#1e293b',
                    color: !highContrast ? '#090d16' : '#cbd5e1',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Normal
                </button>
                <button
                  onClick={() => setHighContrast(true)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '2px solid #ffff00',
                    backgroundColor: highContrast ? '#ffff00' : '#0f172a',
                    color: '#000000',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Alto Contraste
                </button>
              </div>
            </div>

            {/* 2. Tamaño de letra */}
            <div>
              <span style={{ fontSize: '13px', display: 'block', marginBottom: '6px', color: highContrast ? '#ffffff' : '#cbd5e1' }}>Tamaño de Fuente</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['normal', 'large', 'xlarge'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: fontSize === size ? '2px solid #ffff00' : '1px solid #334155',
                      backgroundColor: fontSize === size ? '#475569' : '#0f172a',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Fuente Disléxica */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="dyslexic-toggle" style={{ fontSize: '13px', color: highContrast ? '#ffffff' : '#cbd5e1' }}>Fuente Disléxica</label>
              <input
                id="dyslexic-toggle"
                type="checkbox"
                checked={dyslexicFont}
                onChange={(e) => setDyslexicFont(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* 4. Resaltar Enlaces */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="highlight-toggle" style={{ fontSize: '13px', color: highContrast ? '#ffffff' : '#cbd5e1' }}>Resaltar Enlaces</label>
              <input
                id="highlight-toggle"
                type="checkbox"
                checked={highlightLinks}
                onChange={(e) => setHighlightLinks(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* 5. Lector de Pantalla Simulado (TTS) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="tts-toggle" style={{ fontSize: '13px', color: highContrast ? '#ffffff' : '#cbd5e1' }}>Lector de Voz (TTS)</label>
              <input
                id="tts-toggle"
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {/* Reset */}
            <button
              onClick={resetSettings}
              style={{
                marginTop: '10px',
                padding: '8px',
                fontSize: '12px',
                borderRadius: '8px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Restablecer Valores
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
