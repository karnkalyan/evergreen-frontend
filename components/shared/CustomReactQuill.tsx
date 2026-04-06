import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface CustomReactQuillProps {
  value: string;
  onChange: (value: string) => void;
  modules?: any;
  placeholder?: string;
}

const CustomReactQuill: React.FC<CustomReactQuillProps> = ({ 
  value, 
  onChange, 
  modules,
  placeholder 
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const defaultModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="react-quill-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules || defaultModules}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomReactQuill;