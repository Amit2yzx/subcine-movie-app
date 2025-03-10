import React from 'react';
import './About.css';
import { Link } from 'react-router-dom'; // Import Link

function About() {
    return (
        <div className="about-container">
            <div className="about-header"> {/* New header for About page */}
                <Link to="/" className="back-button">Back</Link> {/* Back Button Link */}
                <h2 className="about-heading">About SubCine</h2>
            </div>

            <p className="about-text">
                SubCine is a movie recommendation app that offers a unique way to discover films.
                Instead of relying on genres or popular lists, SubCine dives deeper.
                You write a short story, and SubCine uses AI to analyze your story and suggest movies
                that resonate with its themes and emotions.
            </p>

            <h3 className="about-section-heading">Why Movies?</h3>
            <p className="about-text artistic-paragraph">
                Movies possess a singular ability to forge connections to our shared human experience.
                They invite us to step into the lives of others, cultivating empathy and compassion for perspectives vastly different from our own.
                Through masterful narratives and richly imagined worlds, cinema embodies our common human nature.
                Unknowingly, the stories we craft often become reflections of our subconscious desires. SubCine understands this intimate link, using AI to translate your narratives into movie recommendations that align with these deeper parts of yourself.
                It reminds us of the universal joys, sorrows, aspirations, and challenges that unite us across all borders.
            </p>

            <h3 className="about-section-heading">Feedback & Queries</h3>
            <p className="about-text">
                For feedback or any queries, please feel free to reach out: <a href="mailto:amitshaankhwar2@gmail.com">amitshaankhwar2@gmail.com</a>
            </p>
        </div>
    );
}

export default About;
