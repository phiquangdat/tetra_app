import React from 'react';

type Video = {
    title: string;
    url: string;
    content: string;
};

const video: Video = {
    title: 'Video title',
    url: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
    content: `This video provides an introduction to the topic and outlines key concepts that will be covered in the module. 
    Make sure to watch carefully and take notes where needed.`
};

const isYouTubeUrl = (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url);
};

const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0`;
};

const VideoPage: React.FC = () => {
    const isYouTube = isYouTubeUrl(video.url);
    const embedUrl = isYouTube ? getYouTubeEmbedUrl(video.url) : video.url;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-4xl mb-6 text-left">
                <a
                    href="/unit"
                    className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all"
                >
                    <span className="mr-2 text-xl">←</span>
                    Back to Unit page
                </a>
            </div>

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

            <div className="w-full max-w-4xl text-left mt-5">
                <h2 className="text-xl font-bold ml-4 mb-4">About</h2>
                <div className="bg-gray-200 rounded-3xl p-6 text-gray-700 text-base shadow-sm">
                    {video.content}
                </div>
            </div>

            <div className="w-full max-w-4xl mt-8 flex justify-end">
                <button
                    className="bg-blue-200 font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit"
                    type="button"
                >
                    Up next
                </button>
            </div>
        </div>
    );
};

export default VideoPage;
