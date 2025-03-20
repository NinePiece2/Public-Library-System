import { Button } from "./Button";
import { InputField } from "./InputField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchBar({ search, setSearch, filter, setFilter }) {
return (
    <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
    <InputField
        type="text"
        placeholder="Search for books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-md"
    />
    <div className="flex justify-between mt-4">
        <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="genre">Genre</SelectItem>
            <SelectItem value="year">Year</SelectItem>
        </SelectContent>
        </Select>
    </div>
    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">Search</Button>
    </div>
);
}