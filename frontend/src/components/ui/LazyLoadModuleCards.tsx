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
          className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-highlight"
        >
          Load more
        </button>
      ) : (
        <button
          onClick={onShowLess}
          className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-highlight"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export default LazyLoadModuleCards;
