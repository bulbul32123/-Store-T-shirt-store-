import SearchCard from './SearchCard';

export default function SearchResults({ searchQuery, data }) {
    if (!searchQuery) return null;
    return (
      <>
        {data.length > 0 ? (
          <div className="flex flex-col gap-2 p-2">
            {data.map((item) => (
              <SearchCard
                key={item._id}
                searchQuery={searchQuery}
                item={item}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full w-full">
            No Products Found.
          </div>
        )}
      </>
    );
}
