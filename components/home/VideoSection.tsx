import React from 'react';

interface VideoSectionProps {
    videoUrl: string;
}

const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
        const videoId = new URL(url).pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
    }
    // Add other providers like Vimeo if needed
    return url;
};

const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl }) => {
    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <div className="aspect-video" data-aos="zoom-in">
            <iframe
                className="w-full h-full rounded-2xl shadow-lg"
                src={embedUrl}
                title="Embedded video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default VideoSection;