import React from 'react';
import Layout from '@theme/Layout';
import styles from './about.module.css';

export default function AboutPage() {
    return (
        <Layout title="About Intune Assistant" description="Learn more about Intune Assistant">
            <header className={styles.hero}>
                <div className="container">
                    <h1 className={styles.heroTitle}>About Intune Assistant</h1>
                    <p className={styles.heroSubtitle}>
                        Simplifying Microsoft Intune management for the modern Cloud Engineer.
                    </p>
                </div>
            </header>
            <main className="container margin-vert--lg">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <section className={styles.section}>
                            <h2>Our Mission</h2>
                            <p>
                                The Intune Assistant is born out of a community idea to make a platform providing assignment insights fast.
                                It is a tool developed by Sander Rozemuller - Microsoft Intune MVP.
                            </p>
                        </section>
                        <section className={styles.section}>
                            <h2>Philosophy</h2>
                            <p>
                                The tools are web-based, requiring no additional resources other than a consent of an application with the least permissions possible.
                                <a href="/docs/general/permissions">Read more about permissions</a>.
                            </p>
                            <p>
                                The reason for a web-based variant is to enable users to get up to speed as fast as possible,
                                especially since not everyone has a subscription to deploy resources.
                            </p>
                        </section>
                        <section className={styles.section}>
                            <h2>Features</h2>
                            <ul>
                                <li>Conditional access insights</li>
                                <li>Configuration policy insights</li>
                                <li>All settings overview</li>
                            </ul>
                            <p>
                                The Intune Assistant tool remains free and available for the community.
                            </p>
                        </section>
                        <section className={styles.section}>
                            <h2>Premium Modules</h2>
                            <ul>
                                <li>
                                    <strong>Rollout Assistant:</strong> Helps with enrolling configurations in a scalable and controlled way.
                                    This is a paid feature on the Intune Assistant platform.
                                </li>
                                <li>
                                    <strong>Analyser:</strong> A tool designed to provide in-depth analysis of your Intune configurations,
                                    helping you identify potential improvements and optimizations.
                                </li>
                                <li>
                                    <strong>Historicus:</strong> Tracks and visualizes changes in your Intune environment over time,
                                    offering insights into historical trends and configurations.
                                </li>
                                <li>
                                    <strong>Configuration Comparator:</strong> Compares different configurations side-by-side,
                                    making it easier to spot differences and ensure consistency.
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </Layout>
    );
}