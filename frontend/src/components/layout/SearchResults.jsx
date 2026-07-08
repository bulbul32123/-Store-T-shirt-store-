import SearchCard from './SearchCard';

export default function SearchResults({ searchQuery, data }) {
    if (!searchQuery) return null;
    console.log(data);

    return (
        <>
            {data.length > 0 ? (
                <div className="flex flex-col gap-2 p-2">
                    {data.map((item, index) => (
                        <SearchCard key={index} searchQuery={searchQuery} item={item} />
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
