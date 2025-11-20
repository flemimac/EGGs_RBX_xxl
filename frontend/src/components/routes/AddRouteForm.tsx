import React, { useState, FormEvent } from 'react';
import './AddRouteForm.css';

interface AddRouteFormProps {
  onAdd: (name: string) => void;
  onCancel: () => void;
}

export const AddRouteForm: React.FC<AddRouteFormProps> = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <div className="add-route-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название маршрута"
          autoFocus
          className="route-name-input"
        />
        <div className="form-actions">
          <button type="submit" className="btn-add">Добавить</button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

