import React, { useState } from 'react';
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
    const [inputText, setInputText] = useState('');
    const [movieRecommendations, setMovieRecommendations] = useState([]);
    const [isButtonWaiting, setIsButtonWaiting] = useState(false);

    const handleInputChange = (event) => {
        if (event.target.value.length <= 600) {
            setInputText(event.target.value);
        } else {
            console.warn("Character limit reached (600 characters)");
        }
    };

    const handleSubmit = async () => {
        if (inputText.trim().length === 0) {
            alert("Please write a story before getting recommendations.");
            return;
        }

        setIsButtonWaiting(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const omdbApiKey = import.meta.env.VITE_OMDB_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const userStory = inputText;
            const enhancedPrompt = `Analyze the following story. Based on this analysis, recommend 5-10 movies. For each movie, provide the title and year of release. Format your response as a list of movies, with each movie on a new line, showing the title and year in parentheses.

            Story: "${userStory}"`;

            const initialResult = await model.generateContent(enhancedPrompt);
            const initialResponse = initialResult.response;
            const geminiTextResponse = initialResponse.candidates[0].content.parts[0].text;

            const movieLines = geminiTextResponse.trim().split('\n');
            const fetchedMovies = [];

            for (const line of movieLines) {
                const movieMatch = line.match(/(.*) \((....)\)/);
                if (movieMatch) {
                    const title = movieMatch[1].trim();
                    const year = movieMatch[2];

                    try {
                        const omdbResponse = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${omdbApiKey}`);
                        const omdbData = await omdbResponse.json();

                        if (omdbData.Response === "True") {
                            fetchedMovies.push({
                                title: omdbData.Title,
                                year: omdbData.Year,
                                poster: omdbData.Poster,
                                imdbRating: omdbData.imdbRating,
                            });
                        }
                    } catch (omdbError) {
                        console.error('Error calling OMDb API:', omdbError);
                    }
                }
            }

            setMovieRecommendations(fetchedMovies);
            setInputText('');

        } catch (error) {
            console.error('Error calling Gemini API:', error);
        } finally {
            setIsButtonWaiting(false);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">SubCine</h1>
                <p className="app-tagline">Deep dive movie discovery from your subconscious mind.</p>
                <button className="about-button">About</button> {/* This will be styled to look like the image */}
            </header>

            <main className="main-content">
                <textarea
                    className="story-input"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Write a random story from your heart, soul or mind and get movie recommendations (max 600 characters)"
                />
                <button
                    className="recommend-button"
                    onClick={handleSubmit}
                    disabled={isButtonWaiting}
                >
                    {isButtonWaiting ? 'Waiting...' : 'Get Recommendations'}
                </button>

                <section className="recommendations-section">
                    <h2 className="recommendations-heading">Movie Recommendations</h2>
                    {movieRecommendations.length > 0 ? (
                        <div className="movies-grid">
                            {movieRecommendations.map((movie, index) => (
                                <div key={index} className="movie-card">
                                    <img className="movie-poster" src={movie.poster} alt={`Poster for ${movie.title}`} />
                                    <div className="movie-details">
                                        <a
                                            className="movie-title-link"
                                            href={`https://www.google.com/search?q=${encodeURIComponent(movie.title) + ' movie'}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {movie.title} ({movie.year})
                                        </a>
                                        <p className="movie-rating">IMDb Rating: {movie.imdbRating}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-recommendations-message">Write a story and click 'Get Recommendations' to see movies here!</p>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
