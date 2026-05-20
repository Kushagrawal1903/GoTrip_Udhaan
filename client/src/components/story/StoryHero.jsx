import { useState } from 'react';

/**
 * StoryHero — Fullscreen cinematic hero with Ken Burns effect.
 * Luxury travel ad feel. No CTA — let the emotion breathe.
 */
export default function StoryHero({ story }) {
    const [imgFailed, setImgFailed] = useState(false);
    const coverUrl = story.story?.coverImage?.url || story.destinationImage;
    const personality = story.story?.personality || {};
    const subtitle = story.story?.narrative?.subtitle || story.tripData?.subtitle;

    const styleMeta = story.travelStyle
        ? story.travelStyle.charAt(0).toUpperCase() + story.travelStyle.slice(1)
        : '';

    return (
        <section className="story-hero">
            {coverUrl && !imgFailed && (
                <img
                    src={coverUrl}
                    alt={story.story?.coverImage?.alt || story.destination}
                    className="story-hero-img"
                    onError={() => setImgFailed(true)}
                />
            )}
            <div className="story-hero-overlay" />

            <div className="story-hero-content">
                <h1 className="story-hero-destination">{story.destination}</h1>

                {subtitle && (
                    <p className="story-hero-subtitle">{subtitle}</p>
                )}

                <div className="story-hero-pills">
                    <span className="story-pill">{story.duration} Days</span>
                    {styleMeta && <span className="story-pill">{styleMeta}</span>}
                    <span className="story-pill">
                        {story.budget === 'premium' ? 'Luxury' : story.budget === 'moderate' ? 'Mid-Range' : 'Budget'}
                    </span>
                    {story.travelers > 1 && (
                        <span className="story-pill">{story.travelers} Travelers</span>
                    )}
                </div>

                {personality.vibeLabel && (
                    <p className="story-hero-personality">
                        {personality.emoji} {personality.vibeLabel}
                    </p>
                )}
            </div>
        </section>
    );
}
