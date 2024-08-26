import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OnboardedComponent = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            toast.error(`Consent failed: ${errorDescription}`);
            navigate(`/status/${error}`);
        } else {
            toast.success("Consent successful. Welcome aboard!");
        }
    }, [error, errorDescription, navigate, searchParams]);

    return null;
};

export default OnboardedComponent;