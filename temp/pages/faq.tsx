import React from 'react';
import Layout from '@theme/Layout';
import styles from './faq.module.css';

const faqData = [
    {
        question: "What is Intune Assistant?",
        answer: "Intune Assistant is a tool that helps Intune Administrators getting insights in their Intune environment."
    },
    {
        question: "Who built Intune Assistant?",
        answer: "Intune Assistant is built by <a href='https://www.rozemuller.com' target='_blank'>Sander Rozemuller</a>. He is a Microsoft MVP in the category security (Intune) and Windows & Devices (AVD).<br>" +
            "You can find more information about him on his <a href='https://www.linkedin.com/in/srozemuller/' target='_blank'>LinkedIn</a>. " +
            "<br> You can find his MVP profile <a href='https://mvp.microsoft.com/en-us/PublicProfile/5004451?fullName=Sander%20Rozemuller' target='_blank'>here</a>."
    },
    {
        question: "Is using Intune Assistant safe?",
        answer: "Yes, using Intune Assistant is a safe process. " +
            "<br> It works under user context and connects to a tenant on behalf of the user."
    },
    {
        question: "What about the data?",
        answer: "Intune Assistant does <i><u><b>NOT</b></u></i> store any tenant sensitive data. It only reads the data from the tenant and displays it in the UI. " +
            "<br> If you log out and close the browser, the data is gone."
    },
    {
        question: "How does it work?",
        answer: "Intune Assistant uses an app registration consented during the onboarding process. The app registration has only the needed READ permissions. " +
            "<br> When a user logs in, the app registration is used under user context to get the data from the tenant." +
            "<br> For more information check the <a href='/docs/general/how-it-works/' target='_blank'>documentation</a>"
    },
    {
        question: "I read something about the Intune Assistant API?",
        answer: "That is great to hear! The Intune Assistant API is a sort of aggregation layer. The API harvests many Graph API endpoints and combines data to something that is useful. <br>" +
            "In fact, the Intune Assistant API is just a data shipper that streamlines Graph data to the web interface as also the Intune CLI"
    },
    {
        question: "What permissions does Intune Assistant need?",
        answer: `Intune Assistant relies on Graph API permission. The permissions in basic are READ permissions. For a full detailed overview check <a href="/docs/general/authentication" target="_blank">the permissions overview</a>`
    },
    {
        question: "Can I see more about the source code?",
        answer: `Yes, the web interface as the CLI source code is available at my GitHub. You can find the repo over <a href="https://github.com/srozemuller/IntuneAssistant" target="_blank">here</a>`
    },
    {
        question: "I want to request a feature",
        answer: `That is great! In my repo there is a template available for requesting features. You can find it <a href="https://github.com/srozemuller/IntuneAssistant/issues/new/choose" target="_blank">here</a>. 
                    <br> Use it also for bugs or other issues.`
    },
    {
        question: "Where can I find the documentation?",
        answer: `You can find the docs over <a href="/docs/web/getting-started/onboarding" target="_blank">here</a>`
    },
    {
        question: "Why is Intune Assistant a web interface only?",
        answer: "Intune Assistant is web interface because it helps users getting up to speed quick. Also not everyone has a subscription to store resources at."
    },
    {
        question: "Will Intune Assistant become available as a single instance to run at my own platform?",
        answer: "Yes, Intune Assistant will become available as a single instance to run at your own platform. It is on the roadmap but not yet available. "
    },
];

export default function FAQPage() {
    return (
        <Layout title="FAQ" description="Frequently Asked Questions about Intune Assistant">
            <main className="container margin-vert--lg">
                <h1 className={styles.title}>Frequently Asked Questions</h1>
                <div className={styles.faqList}>
                    {faqData.map((faq, index) => (
                        <div key={index} className={styles.faqItem}>
                            <h3 className={styles.question}>{faq.question}</h3>
                            <p
                                className={styles.answer}
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </Layout>
    );
}