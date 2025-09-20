import React, { useState } from 'react';
import { AlertTriangleIcon, XIcon } from 'lucide-react';

const ConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    type = "warning", // warning, danger, info
    requiresTyping = false,
    typingConfirmation = "",
    isLoading = false
}) => {
    const [typedConfirmation, setTypedConfirmation] = useState('');

    const handleConfirm = () => {
        if (requiresTyping && typedConfirmation !== typingConfirmation) {
            return;
        }
        onConfirm();
        setTypedConfirmation('');
    };

    const handleClose = () => {
        setTypedConfirmation('');
        onClose();
    };

    const canConfirm = !requiresTyping || typedConfirmation === typingConfirmation;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    iconColor: 'text-error',
                    buttonClass: 'btn-error',
                    borderColor: 'border-error'
                };
            case 'info':
                return {
                    iconColor: 'text-info',
                    buttonClass: 'btn-info',
                    borderColor: 'border-info'
                };
            default:
                return {
                    iconColor: 'text-warning',
                    buttonClass: 'btn-warning',
                    borderColor: 'border-warning'
                };
        }
    };

    const styles = getTypeStyles();

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative max-w-md">
                <button 
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    <XIcon className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full bg-base-200 ${styles.iconColor}`}>
                        <AlertTriangleIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{title}</h3>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-base-content/80">{message}</p>
                </div>

                {requiresTyping && (
                    <div className="mb-6">
                        <label className="label">
                            <span className="label-text">
                                Type <strong>{typingConfirmation}</strong> to confirm:
                            </span>
                        </label>
                        <input
                            type="text"
                            className={`input input-bordered w-full ${
                                typedConfirmation && typedConfirmation !== typingConfirmation 
                                    ? 'input-error' 
                                    : ''
                            }`}
                            value={typedConfirmation}
                            onChange={(e) => setTypedConfirmation(e.target.value)}
                            placeholder={`Type "${typingConfirmation}" here`}
                            disabled={isLoading}
                        />
                        {typedConfirmation && typedConfirmation !== typingConfirmation && (
                            <label className="label">
                                <span className="label-text-alt text-error">
                                    Please type exactly: {typingConfirmation}
                                </span>
                            </label>
                        )}
                    </div>
                )}

                <div className="modal-action">
                    <button 
                        className="btn btn-ghost"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`btn ${styles.buttonClass} ${isLoading ? 'loading' : ''}`}
                        onClick={handleConfirm}
                        disabled={!canConfirm || isLoading}
                    >
                        {!isLoading && confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
