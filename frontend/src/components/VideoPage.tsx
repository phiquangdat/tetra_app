import React from 'react';

type Video = {
    title: string;
    url: string;
};

const video: Video = {
    title: 'Video title',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
};

const isYouTubeUrl = (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url);
};

const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1`;
};

const VideoPage: React.FC = () => {
    const isYouTube = isYouTubeUrl(video.url);
    const embedUrl = isYouTube ? getYouTubeEmbedUrl(video.url) : video.url;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-semibold mb-6 text-center">{video.title}</h1>
            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-lg">
                {isYouTube ? (
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={video.title}
                        style={{ border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <video
                        className="w-full h-full object-cover"
                        src={embedUrl}
                        controls
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        </div>
    );
};

export default VideoPage;
