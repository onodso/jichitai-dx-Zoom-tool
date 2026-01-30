"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Bell } from "lucide-react"

type SearchResult = {
    code: string
    name: string
    prefecture: string
    score: number
}

export function Header() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)

        if (value.length < 2) {
            setResults([])
            setShowResults(false)
            return
        }

        setIsSearching(true)
        setShowResults(true)
        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: value }),
            })
            if (res.ok) {
                const data = await res.json()
                setResults(data.results || [])
            }
        } catch (error) {
            console.error("Search failed", error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-white/5 bg-neutral-950/50 px-6 backdrop-blur-xl transition-all">
            <div className="flex w-full max-w-sm items-center gap-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search municipalities..."
                        className="w-full bg-white/5 pl-9 text-sm text-foreground focus-visible:ring-offset-0"
                        value={query}
                        onChange={handleSearch}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        onFocus={() => { if (results.length > 0) setShowResults(true) }}
                    />
                    {showResults && results.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-full rounded-md border border-white/10 bg-neutral-900 shadow-lg">
                            <ul className="py-2">
                                {results.map((item) => (
                                    <li key={item.code} className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm">
                                        <div className="font-medium text-white">{item.name}</div>
                                        <div className="text-xs text-neutral-400">{item.prefecture}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 hover:bg-white/5 transition-colors">
                    <Bell className="h-5 w-5 text-neutral-400" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-950" />
                </button>
            </div>
        </header>
    )
}
