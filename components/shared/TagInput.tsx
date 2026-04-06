import React, { useState, useRef, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags = [], setTags, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure tags is always an array
  const safeTags = Array.isArray(tags) ? tags : [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !safeTags.includes(trimmedTag)) {
      setTags([...safeTags, trimmedTag]);
    }
  };

  const removeTag = (index: number) => {
    setTags(safeTags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && safeTags.length > 0) {
      removeTag(safeTags.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white border border-slate-300 rounded-lg text-sm min-h-[42px] items-center">
      {safeTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={safeTags.length === 0 ? placeholder : ''}
        className="flex-1 outline-none min-w-[120px] bg-transparent"
      />
    </div>
  );
};

export default TagInput;