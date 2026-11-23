import React, { useEffect, useState } from "react";

export default function DeleteConfirmModal({
  isOpen,
  subject,
  onClose,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !subject) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg("");
      await onConfirm(subject.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete subject. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-subject-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <div className="flex items-center space-x-3 text-red-600 mb-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">
            🗑️
          </div>
          <h3 id="delete-subject-title" className="text-lg font-bold text-gray-900">
            Delete Subject
          </h3>
        </div>

        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <strong className="text-gray-900">"{subject.name}"</strong>?
        </p>

        <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
          ⚠️ <strong>Warning:</strong> All lecture notes inside this subject will be permanently deleted due to database cascade rules. This action cannot be undone.
        </p>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Subject</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
