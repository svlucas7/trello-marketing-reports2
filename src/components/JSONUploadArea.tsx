import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const JSONUploadArea: React.FC<{ onUpload: (json: string) => void }> = ({ onUpload }) => {
  const [jsonText, setJsonText] = useState('');
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null);

  const validateJson = (text: string) => {
    if (!text.trim()) {
      setIsValidJson(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      setIsValidJson(!!parsed && typeof parsed === 'object');
    } catch {
      setIsValidJson(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    validateJson(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonText.trim() && isValidJson) {
      onUpload(jsonText.trim());
    }
  };

  const getTextareaClass = () => {
    let baseClass = "form-control";
    if (isValidJson === true) baseClass += " is-valid";
    if (isValidJson === false) baseClass += " is-invalid";
    return baseClass;
  };

  return (
    <div className="card border">
      <div className="card-header bg-light">
        <h6 className="card-title mb-0 d-flex align-items-center">
          <Upload size={20} className="me-2" />
          Carregar JSON do Trello
        </h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold d-flex align-items-center justify-content-between">
              <span>
                <i className="bi bi-file-earmark-code me-2"></i>
                JSON do Trello:
              </span>
              {jsonText && (
                <small className="text-muted">
                  {Math.round(jsonText.length / 1024)}KB
                </small>
              )}
            </label>
            <textarea
              className={getTextareaClass()}
              value={jsonText}
              onChange={handleTextChange}
              placeholder="Cole aqui o conteúdo do arquivo JSON exportado do Trello..."
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            {isValidJson === false && (
              <div className="invalid-feedback">
                JSON inválido. Verifique se copiou corretamente.
              </div>
            )}
            {isValidJson === true && (
              <div className="valid-feedback">
                JSON válido! Pronto para processar.
              </div>
            )}
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Aceita apenas arquivos JSON válidos do Trello
            </small>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValidJson}
            >
              <Upload size={16} className="me-2" />
              Processar JSON
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JSONUploadArea;
