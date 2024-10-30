import React from 'react';
import { RefreshCw, Clipboard } from 'lucide-react';

interface ToolbarProps {
    onRefresh: () => void;
    onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onRefresh, onExport }) => {
    return (
        <div className="toolbar">
            <button onClick={onRefresh} className="btn btn-refresh"><RefreshCw /></button>
            <button onClick={onExport} className="btn btn-export"><Clipboard /></button>
        </div>
    );
};