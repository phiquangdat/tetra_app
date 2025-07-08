interface LazyLoadModuleCardsProps {
  total: number;
  visibleCount: number;
  defaulItemsNumber: number;
  onLoadMore: () => void;
  onShowLess: () => void;
}

function LazyLoadModuleCards({
  total,
  visibleCount,
  defaulItemsNumber,
  onLoadMore,
  onShowLess,
}: LazyLoadModuleCardsProps) {
  if (total <= defaulItemsNumber) return null;

  return (
    <div className="flex justify-center mt-6 gap-4">
      {visibleCount < total ? (
        <button
          onClick={onLoadMore}
          className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg"
        >
          Load more
        </button>
      ) : (
        <button
          onClick={onShowLess}
          className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export default LazyLoadModuleCards;
