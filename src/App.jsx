import React, { useState } from 'react';
import './App.css';
import './About.css'; // Import About.css to apply styles on About page
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import About from './About';


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
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const userStory = inputText;

            // REFINED PROMPT - Psychological Analysis Emphasis
            const enhancedPrompt = `Perform a deep psychological analysis of the following story. Focus on subconscious themes, character motivations, and emotional depth. Based on this psychological analysis, recommend 5-10 movies that resonate with these deeper layers. For each movie, provide the title and year of release. Format your response as a list of movies, with each movie on a new line, showing the title and year in parentheses.

            Story: "${userStory}"`;

            const initialResult = await model.generateContent(enhancedPrompt);
            const initialResponse = initialResult.response;
            const geminiTextResponse = initialResponse.candidates[0].content.parts[0].text;

            console.log("Gemini Movie Recommendation Response (Initial - Psychological Prompt):", geminiTextResponse);

            const refinementPrompt = `Refine the following list of movie recommendations. Extract just the movie titles and their release years. Return a list where each item is only the movie name and year in parentheses, with each movie on a new line.

            Movie Recommendations (from previous analysis):
            ${geminiTextResponse}
            `;

            const refinedResult = await model.generateContent(refinementPrompt);
            const refinedResponse = refinedResult.response;
            const refinedGeminiResponse = refinedResponse.candidates[0].content.parts[0].text;

            console.log("Gemini Movie Recommendation Response (Refined - Names and Years):", refinedGeminiResponse);

            const movieLines = refinedGeminiResponse.trim().split('\n');
            const fetchedMovies = [];

            for (const line of movieLines) {
                const movieMatch = line.match(/(.*) \((....)\)/);
                if (movieMatch) {
                    const title = movieMatch[1].trim();
                    const year = movieMatch[2];
                    console.log(`Fetching details for: ${title} (${year})`);

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
                        } else {
                            console.warn(`OMDb API Error for ${title} (${year}): ${omdbData.Error}`);
                            fetchedMovies.push({
                                title: title,
                                year: year,
                                poster: null,
                                imdbRating: "N/A",
                            });
                        }


                    } catch (omdbError) {
                        console.error('Error calling OMDb API:', omdbError);
                        fetchedMovies.push({
                            title: title,
                            year: year,
                            poster: null,
                            imdbRating: "N/A",
                        });
                    }
                }
            }

            console.log("Fetched Movie Data from OMDb:", fetchedMovies);
            setMovieRecommendations(fetchedMovies);
            setInputText('');

        } catch (error) {
            console.error('Error calling Gemini API:', error);
        } finally {
            setIsButtonWaiting(false);
        }
    };

    const extractThemes = async (geminiResponseText) => {
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const themePrompt = `Identify 3-5 main themes present in the following story.  Return the themes as a comma-separated list. Story: "${geminiResponseText}"`;

            const themeResult = await model.generateContent(themePrompt);
            const themeResponse = themeResult.response;
            const geminiThemeTextResponse = themeResponse.candidates[0].content.parts[0].text;

            console.log("Gemini Theme Analysis Response:", geminiThemeTextResponse);
            const extractedThemes = geminiThemeTextResponse.split(',').map(theme => theme.trim());
            return extractedThemes;

        } catch (error) {
            console.error('Error in extractThemes:', error);
            return [];
        }
    };

    const extractSentiment = (geminiResponseText) => {
        return 'Positive'; // Placeholder - Sentiment analysis to be implemented
    };

    const getMovieRecommendations = (themes, sentiment) => {
        return []; // Gemini provides recommendations directly now
    };


    return (
        <BrowserRouter>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-title">SubCine</h1>
                    <p className="app-tagline">Deep dive movie discovery from your subconscious mind.</p>
                    <div className="header-links">
                        <Link to="/about" className="about-link">About</Link>
                    </div>
                </header>

                <Routes>
                    <Route path="/" element={
                        <section className="input-section">
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
                                <div className="movie-grid">
                                    {movieRecommendations.length > 0 ? (
                                        movieRecommendations.map((movie, index) => (
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
                                        ))
                                    ) : (
                                        <p className="no-recommendations-message">Write a story and click 'Get Recommendations' to see movies here!</p>
                                    )}
                                </div>
                            </section>
                        </section>
                    } />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;