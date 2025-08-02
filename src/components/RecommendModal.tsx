import { useState, useEffect } from 'react';

export default function RecommendModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [propertyId, setPropertyId] = useState('');
    const [note, setNote] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Effect to listen for the custom event that opens the modal
    useEffect(() => {
        const handleOpen = (e: CustomEvent) => {
            setPropertyId(e.detail.propertyId);
            setStatus('idle');
            setNote('');
            setIsOpen(true);
        };
        document.addEventListener('openRecommendModal', handleOpen as EventListener);
        return () => document.removeEventListener('openRecommendModal', handleOpen as EventListener);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ propertyId, note }),
        });

        if (res.ok) {
            setStatus('success');
        } else {
            const { error } = await res.json();
            setErrorMessage(error || 'An unknown error occurred.');
            setStatus('error');
        }
    };

    const getReferralLink = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/places/${propertyId}?ref=YOUR_USER_ID_HERE`; // You'll need to get the actual user ID
        }
        return '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-ink/10 dark:border-sand/20 flex justify-between items-center">
                    <h3 className="font-display text-2xl font-bold">Add Your Personal Note</h3>
                    <button onClick={() => setIsOpen(false)} className="text-ink/50 hover:text-coral">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {status === 'idle' && (
                        <>
                            <p className="text-sm text-ink/80 dark:text-sand/80 mb-4">
                                Share what you love about this place. Your note will be shown to the person you share this link with.
                            </p>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g., 'The sunset view from the pool is absolutely unforgettable! Ask for David at the front desk.'"
                                className="w-full h-32 p-3 rounded-lg border border-ink/20 dark:border-sand/30 bg-sand/30 dark:bg-dark-bg/50 focus:ring-2 focus:ring-coral focus:outline-none transition"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full mt-4 px-6 py-3 rounded-full bg-coral text-white font-bold shadow hover:shadow-lg hover:scale-105 active:scale-95 transition"
                            >
                                Save Note & Get Link
                            </button>
                        </>
                    )}

                    {status === 'loading' && <p>Saving your note...</p>}

                    {status === 'success' && (
                        <div className="text-center">
                            <p className="font-bold text-mint mb-2">Note Saved!</p>
                            <p className="text-sm mb-4">Copy and share this unique link:</p>
                            <input
                                type="text"
                                readOnly
                                value={getReferralLink()}
                                className="w-full p-2 rounded-lg border bg-sand/50 dark:bg-dark-bg/60 text-center"
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    )}

                    {status === 'error' && <p className="text-red-500">Error: {errorMessage}</p>}
                </form>
            </div>
        </div>
    );
}