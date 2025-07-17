import { toast } from 'react-toastify';
import { toastDuration } from '@/config/toastConfig.ts';

export const showLoadingToast = (message: string, cancelCallback: () => void) => {
    let toastId: string | number;

    const content = (
        <div className="flex items-center justify-between">
            <span>{message}</span>
            <button
                className="ml-4 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                onClick={() => {
                    cancelCallback();
                    toast.update(toastId, {
                        render: "Request cancelled by user",
                        type: "warning",
                        isLoading: false,
                        autoClose: toastDuration
                    });
                }}
            >
                Cancel
            </button>
        </div>
    );

    toastId = toast.loading(content, { closeButton: false });
    return toastId;
};
