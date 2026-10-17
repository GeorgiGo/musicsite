import { useEffect, type ReactNode } from "react";
import ButtonWithTitle from "../shared/buttonWithTitle";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose]);
    if (!isOpen) return null
    return (
        createPortal(
            <div
                onClick={onClose}
                className="fixed z-[8000] w-screen h-screen top-0 left-0 backdrop-blur-sm animate-fade-in flex justify-center items-center">

                <div onClick={(e) => e.stopPropagation()}
                    className="z-[8000] fixed left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-mantle border border-surface1 p-6 rounded-2xl shadow-2xl transition-all scale-100"
                >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface0">
                        <h3 className="text-lg font-bold text-text">{title}</h3>
                        <ButtonWithTitle
                            onClick={onClose}
                            className="p-1 rounded-full text-subtext0 hover:bg-surface1 bg-surface0 hover:text-text transition-colors absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
                            title="Закрыть (Esc)"
                        >
                            {/* Иконка крестика */}
                            <svg xmlns="http://w3.org" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </ButtonWithTitle>
                    </div>

                    {/* Динамическое содержимое, которое мы передаем снаружи */}
                    <div className="max-h-[60vh] overflow-y-auto pr-1">
                        {children}
                    </div>
                </div>
            </div>
            , document.body)
    )
}
