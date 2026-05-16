import React, { useEffect, useRef } from 'react';
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
  const lastSyncedValue = useRef('');

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

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const nextValue = value ?? '';

    if (!editor || nextValue === lastSyncedValue.current) return;

    const currentHtml = editor.root.innerHTML;
    if (nextValue && currentHtml === '<p><br></p>') {
      editor.clipboard.dangerouslyPasteHTML(nextValue, 'silent');
    }

    lastSyncedValue.current = nextValue;
  }, [value]);

  return (
    <div className="react-quill-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value ?? ''}
        onChange={onChange}
        modules={modules || defaultModules}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomReactQuill;
