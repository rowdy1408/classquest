import React, { useEffect, useState } from 'react';
import Modal from './Modal';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 3;

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1000;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
          type: 'image/jpeg',
          size: Math.round((dataUrl.length * 3) / 4),
          dataUrl,
        });
      };
      image.onerror = () => reject(new Error(`Không thể xử lý ${file.name}.`));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error(`Không thể đọc ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export default function QuestSubmissionModal({ open, node, existingSubmission, onClose, onSubmit }) {
  const [form, setForm] = useState({ workLink: '', responseText: '', studentNote: '', images: [] });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      workLink: existingSubmission?.workLink || '',
      responseText: existingSubmission?.responseText || '',
      studentNote: existingSubmission?.studentNote || '',
      images: (existingSubmission?.images || []).map((image) => ({ ...image, dataUrl: image.dataUrl || image.url || '' })),
    });
    setMessage('');
  }, [open, existingSubmission]);

  if (!node) return null;

  const handleImages = async (event) => {
    setMessage('');
    const files = Array.from(event.target.files || []);
    const remaining = MAX_IMAGES - form.images.length;
    if (!remaining) {
      setMessage(`Em có thể tải tối đa ${MAX_IMAGES} hình ảnh.`);
      return;
    }
    const accepted = files.slice(0, remaining);
    const tooLarge = accepted.find((file) => file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      setMessage(`${tooLarge.name} lớn hơn 10 MB. Hãy chọn hình nhỏ hơn.`);
      return;
    }
    try {
      const images = await Promise.all(accepted.map(readImage));
      setForm((current) => ({ ...current, images: [...current.images, ...images] }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      event.target.value = '';
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    const hasEvidence = form.workLink.trim() || form.responseText.trim() || form.images.length;
    if (!hasEvidence) {
      setMessage('Hãy thêm đường dẫn, câu trả lời hoặc ít nhất một hình ảnh minh chứng.');
      return;
    }
    setBusy(true);
    const result = await onSubmit(form);
    setBusy(false);
    if (!result?.ok) {
      setMessage(result?.message || 'Chưa thể nộp nhiệm vụ này.');
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} title={`Nộp bài: ${node.title}`} onClose={onClose} wide>
      <form className="submission-form" onSubmit={submit}>
        <div className="submission-brief">
          <small>YÊU CẦU NHIỆM VỤ</small>
          <p>{node.assignmentInstructions || node.description || 'Làm theo hướng dẫn của giáo viên cho nhiệm vụ này.'}</p>
          {node.customPrompt && <div className="custom-task-box"><strong>Yêu cầu riêng</strong><span>{node.customPrompt}</span></div>}
          <div className="submission-meta-row">
            <span>Minh chứng: {node.acceptedEvidence || 'Đường dẫn, hình ảnh hoặc văn bản'}</span>
            <span>Hạn nộp: {node.deadline ? new Date(node.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
          </div>
        </div>

        <label>
          <span>Đường dẫn Google Drive / Google Docs / Google Classroom</span>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={form.workLink}
            onChange={(event) => setForm({ ...form, workLink: event.target.value })}
          />
          <small>Hãy chắc chắn giáo viên có quyền mở đường dẫn.</small>
        </label>

        <label>
          <span>Câu trả lời viết</span>
          <textarea
            rows="6"
            placeholder="Nhập câu trả lời của em tại đây."
            value={form.responseText}
            onChange={(event) => setForm({ ...form, responseText: event.target.value })}
          />
        </label>

        <div className="evidence-uploader">
          <div>
            <strong>Hình ảnh minh chứng</strong>
            <small>Tải tối đa 3 ảnh chụp màn hình hoặc ảnh bài làm.</small>
          </div>
          <label className="button secondary upload-button">
            Tải hình ảnh
            <input type="file" accept="image/*" multiple onChange={handleImages} />
          </label>
        </div>

        {form.images.length > 0 && (
          <div className="evidence-grid">
            {form.images.map((image) => (
              <figure key={image.id} className="evidence-thumb">
                <img src={image.dataUrl || image.url} alt={image.name} />
                <figcaption>{image.name}</figcaption>
                <button type="button" className="mini-button danger" onClick={() => setForm({ ...form, images: form.images.filter((item) => item.id !== image.id) })}>Xóa</button>
              </figure>
            ))}
          </div>
        )}

        <label>
          <span>Ghi chú cho giáo viên</span>
          <textarea
            rows="3"
            placeholder="Ví dụ: Em đã gửi bài nói trong Google Drive."
            value={form.studentNote}
            onChange={(event) => setForm({ ...form, studentNote: event.target.value })}
          />
        </label>

        {message && <div className="error-message">{message}</div>}
        <div className="form-actions">
          <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="button primary" disabled={busy}>{busy ? 'Đang nộp…' : existingSubmission ? 'Nộp lại minh chứng' : 'Nộp nhiệm vụ'}</button>
        </div>
      </form>
    </Modal>
  );
}
