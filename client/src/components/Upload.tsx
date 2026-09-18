import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '@/features/document/documentThunk';
import { showNotification } from '@/features/notification/notificationSlice';
import { getErrorMessage } from '@/utils/error';
import { SUBJECTS } from '@/constants';

export function Upload(props: any) {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('General');
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or text file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('description', description);

    setIsUploading(true);
    try {
      const action = await dispatch(
        uploadDocument({
          formData,
          onUploadProgress: (event) => {
            if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
          },
        }),
      );

      if (uploadDocument.fulfilled.match(action)) {
        dispatch(
          showNotification({
            type: 'success',
            title: 'Uploaded',
            message: 'Document uploaded. AI indexing is in progress.',
          }),
        );
        navigate(`/documents/${action.payload._id}`);
      } else {
        setError(getErrorMessage(action.payload));
        dispatch(showNotification({ type: 'error', message: 'Upload failed' }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Upload Material</h2>

      <div
        className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-8 text-center hover:border-brand-500 dark:border-slate-600"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.txt,.docx"
          className="hidden"
          onChange={onFileChange}
        />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {file ? file.name : 'Click to choose a file'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, Markdown, TXT or DOCX · up to 50MB</p>
      </div>

      {progress > 0 && progress < 100 && (
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="label">Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input">
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="label">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input resize-none"
          rows={2}
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={isUploading}>
        {isUploading ? 'Uploading & Indexing…' : 'Upload & Index'}
      </button>
    </form>
  );
}

export default Upload;
