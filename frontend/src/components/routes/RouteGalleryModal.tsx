import React, { useState, useEffect } from 'react';
import { fileStorage } from '../../utils';
import type { Route } from '../../types';
import './RouteGalleryModal.css';

interface RouteGalleryModalProps {
  route: Route | null;
  onClose: () => void;
}

export const RouteGalleryModal: React.FC<RouteGalleryModalProps> = ({ route, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route) {
      loadFiles();
    }
  }, [route]);

  const loadFiles = async () => {
    if (!route) return;
    setLoading(true);
    try {
      const routeFiles = await fileStorage.getFiles(route.id);
      setFiles(routeFiles);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!route) return null;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  const selectedFile = files[selectedIndex];
  const isImage = selectedFile?.type.startsWith('image/');

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{route.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Загрузка файлов...</div>
        ) : files.length === 0 ? (
          <div className="modal-empty">Нет загруженных файлов</div>
        ) : (
          <>
            <div className="modal-thumbnails">
              {files.map((file, index) => {
                const isImg = file.type.startsWith('image/');
                return (
                  <div
                    key={index}
                    className={`thumbnail ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => setSelectedIndex(index)}
                  >
                    {isImg ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="thumbnail-image"
                      />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="modal-preview">
              {isImage ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="preview-image"
                />
              ) : (
                <div className="preview-file">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                  <p>{selectedFile.name}</p>
                </div>
              )}
              {files.length > 1 && (
                <>
                  <button className="nav-button nav-prev" onClick={handlePrev}>
                    ‹
                  </button>
                  <button className="nav-button nav-next" onClick={handleNext}>
                    ›
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

