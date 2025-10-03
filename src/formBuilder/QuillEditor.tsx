import React, { useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  className = '',
}) => {
  // Configure Quill modules for a basic rich text editor
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['clean'],
      ],
    }),
    [],
  );

  // Configure formats that are allowed
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
  ];

  // Add basic styling to ensure editor is visible even without CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .quill-editor-wrapper .ql-toolbar {
        border: 1px solid #ced4da;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
      }
      .quill-editor-wrapper .ql-container {
        border: 1px solid #ced4da;
        border-top: none;
        border-radius: 0 0 4px 4px;
        font-family: inherit;
      }
      .quill-editor-wrapper .ql-editor {
        min-height: 100px;
        font-size: 14px;
        line-height: 1.42857143;
      }
      .quill-editor-wrapper .ql-editor.ql-blank::before {
        font-style: normal;
        color: #6c757d;
      }
    `;
    if (!document.querySelector('#quill-editor-styles')) {
      style.id = 'quill-editor-styles';
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`quill-editor-wrapper ${className}`}>
      <ReactQuill
        theme='snow'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
};

export default QuillEditor;
