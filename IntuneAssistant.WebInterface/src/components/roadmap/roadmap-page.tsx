import React from 'react';
import Roadmap from './roadmap.tsx';

const MyRoadmapPage: React.FC = () => {
    // Replace with your GitHub username/org, project number, and GitHub token
    // IMPORTANT: Store your token securely, ideally in environment variables
    const githubToken = process.env.GITHUB_PAT_TOKEN

    return (
        <div className="container max-w-[95%] py-6">
            <h1>Our Product Roadmap</h1>

            <Roadmap
                owner="srozemuller"
                repo="IntuneAssistant.Backend"
                projectNumber={5}
                token={githubToken}
            />
        </div>
    );
};

export default MyRoadmapPage;