import Button from "./Button"; // Ensure it's correctly exported
import InputField from "./InputField"; // Ensure it's correctly exported

interface SearchBarProps {
    search: string;
    setSearch: (value: string) => void;
    filter: string;
    setFilter: (value: string) => void;
}

export default function SearchBar({ search, setSearch, filter, setFilter }: SearchBarProps) {
    return (
    <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        <InputField
        label="Search"
        type="text"
        placeholder="Search for books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-md"
    />


        {/* Native <select> dropdown */}
        <div className="flex justify-between items-center mt-4 gap-4">
        <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
        >
            <option value="">Filter by</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="genre">Genre</option>
            <option value="year">Year</option>
        </select>

        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Search
        </Button>
        </div>
    </div>
    );
}
