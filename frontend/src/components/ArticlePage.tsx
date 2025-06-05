import React from 'react';

type Article = {
    title: string;
    content: string;
}

const articleToDisplay: Article = {
    title: 'The Power of React',
    content: `<p><strong>React</strong> is a JavaScript library for building user interfaces.</p><ul><li>Declarative</li><li>Component-Based</li><li>Learn Once, Write Anywhere</li></ul>`,
}

const ArticlePage: React.FC = () => {
    return (
        <div className="mx-auto px-8 py-8 min-h-screen text-left">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">{articleToDisplay.title}</h1>
            <div className="bg-gray-100 rounded-2xl p-6 shadow-md w-full md:w-full mx-auto">
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: articleToDisplay.content }}
                />
            </div>
        </div>
    )
}

export default ArticlePage;