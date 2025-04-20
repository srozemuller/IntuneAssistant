// src/components/legacy-mode-toggle.tsx
import React, { useEffect, useState } from 'react';
import { Switch } from "@/components/ui/switch";
import {toast} from "react-toastify";

const LegacyModeToggle: React.FC = () => {
    const [useLegacy, setUseLegacy] = useState<boolean>(true);

    useEffect(() => {
        const legacy = localStorage.getItem('useLegacy') === 'true';
        setUseLegacy(legacy);
    }, []);

    const toggleLegacy = () => {
        const newUseLegacy = !useLegacy;
        setUseLegacy(newUseLegacy);
        localStorage.setItem('useLegacy', newUseLegacy.toString());
        window.location.reload();
        toast.info("Legacy mode " + (newUseLegacy ? "enabled" : "disabled"));
    };

    return (
        <Switch checked={useLegacy} onCheckedChange={toggleLegacy} />
    );
};

export default LegacyModeToggle;