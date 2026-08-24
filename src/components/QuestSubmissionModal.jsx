import React, { useEffect, useState } from 'react';
import Modal from './Modal';

const emptyForm = {
  workLink: '',
  responseText: '',
  studentNote: '',
  externalEvidenceSent: false,
  externalEvidenceNote: '',
};

export default function QuestSubmissionModal({ open, node, existingSubmission, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      workLink: existingSubmission?.workLink || '',
      responseText: existingSubmission?.responseText || '',
      studentNote: existingSubmission?.studentNote || '',
      externalEvidenceSent: Boolean(existingSubmission?.externalEvidenceSent),
      externalEvidenceNote: existingSubmission?.externalEvidenceNote || '',
    });
    setMessage('');
  }, [open, existingSubmission]);

  if (!node) return null;

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    const hasEvidence = form.workLink.trim() || form.responseText.trim() || form.externalEvidenceSent;
    if (!hasEvidence) {
      setMessage('Hãy thêm đường dẫn, câu trả lời hoặc xác nhận đã gửi minh chứng qua Zalo/ứng dụng khác.');
      return;
    }
    setBusy(true);
    const result = await onSubmit(form);
    setBusy(false);
    if (!result?.ok) {
      setMessage(result?.message || 'Chưa thể gửi bài nộp.');
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
            <span>Minh chứng: {node.acceptedEvidence || 'Đường dẫn, câu trả lời hoặc gửi ngoài ClassQuest'}</span>
            <span>Hạn nộp: {node.deadline ? new Date(node.deadline).toLocaleString('vi-VN') : 'Không giới hạn'}</span>
          </div>
        </div>

        <label>
          <span>Đường dẫn Google Drive / Google Docs / Google Classroom (không bắt buộc)</span>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={form.workLink}
            onChange={(event) => setForm({ ...form, workLink: event.target.value })}
          />
          <small>Hãy chắc chắn giáo viên có quyền mở đường dẫn.</small>
        </label>

        <label>
          <span>Câu trả lời viết (không bắt buộc)</span>
          <textarea
            rows="6"
            placeholder="Nhập câu trả lời của em tại đây."
            value={form.responseText}
            onChange={(event) => setForm({ ...form, responseText: event.target.value })}
          />
        </label>

        <label className={`external-evidence-card ${form.externalEvidenceSent ? 'selected' : ''}`}>
          <input
            type="checkbox"
            checked={form.externalEvidenceSent}
            onChange={(event) => setForm({
              ...form,
              externalEvidenceSent: event.target.checked,
              externalEvidenceNote: event.target.checked ? form.externalEvidenceNote : '',
            })}
          />
          <span><strong>Em đã gửi minh chứng cho giáo viên</strong><small>Qua Zalo, Messenger hoặc một ứng dụng khác.</small></span>
        </label>

        {form.externalEvidenceSent && (
          <label>
            <span>Gửi qua đâu? (không bắt buộc)</span>
            <input
              type="text"
              placeholder="Ví dụ: Nhóm Zalo lớp A2"
              value={form.externalEvidenceNote}
              onChange={(event) => setForm({ ...form, externalEvidenceNote: event.target.value })}
            />
          </label>
        )}

        <label>
          <span>Ghi chú cho giáo viên</span>
          <textarea
            rows="3"
            placeholder="Ví dụ: Em đã gửi video nói trong nhóm Zalo."
            value={form.studentNote}
            onChange={(event) => setForm({ ...form, studentNote: event.target.value })}
          />
        </label>

        {message && <div className="error-message">{message}</div>}
        <div className="form-actions">
          <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="button primary" disabled={busy}>{busy ? 'Đang gửi…' : existingSubmission ? 'Cập nhật bài nộp' : 'Gửi bài nộp'}</button>
        </div>
      </form>
    </Modal>
  );
}
