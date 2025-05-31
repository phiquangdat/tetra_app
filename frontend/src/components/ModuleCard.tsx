interface ModuleCardProps {
  title: string;
  topic: string;
  points: number;
  coverUrl: string;
}

function ModuleCard({ title, topic, points, coverUrl }: ModuleCardProps) {
  return (
    <div className="flex items-center border-2 border-blue-500 bg-gray-50 rounded-lg p-6 max-w-4xl w-150 h-50">
      {/* Cover Image */}
      <div className="flex-shrink-0 w-24 h-24 mr-8">
        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={coverUrl} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-400 flex items-center justify-center"><svg class="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
        <p className="text-lg text-gray-700 mb-1">
          <span className="font-medium">Topic:</span> {topic}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-medium">Earn:</span> {points} points
        </p>
      </div>

      {/* View Button */}
      <div className="flex-shrink-0 ml-8">
        <button className="bg-blue-300 hover:bg-blue-400 text-black font-medium py-3 px-8 rounded-full transition-colors duration-200">
          View
        </button>
      </div>
    </div>
  );
};

export default ModuleCard