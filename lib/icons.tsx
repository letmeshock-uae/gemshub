import {
    Code,
    Image as ImageIcon,
    TextT,
    SpeakerHigh,
    Globe,
    Graph,
    Palette,
    CurrencyDollar,
    Book,
    Briefcase,
    Bookmark,
    Star,
} from "@phosphor-icons/react"

export const ICON_OPTIONS = [
    { label: "Code", value: "code", component: Code },
    { label: "Image", value: "image", component: ImageIcon },
    { label: "Text", value: "text", component: TextT },
    { label: "Audio", value: "audio", component: SpeakerHigh },
    { label: "World", value: "world", component: Globe },
    { label: "Graph", value: "graph", component: Graph },
    { label: "Art", value: "art", component: Palette },
    { label: "Money", value: "money", component: CurrencyDollar },
    { label: "Book", value: "book", component: Book },
    { label: "Case", value: "case", component: Briefcase },
    { label: "Bookmark", value: "bookmark", component: Bookmark },
    { label: "Star", value: "star", component: Star },
] as const

export type IconValue = (typeof ICON_OPTIONS)[number]["value"]

export function getIconComponent(value: string) {
    return ICON_OPTIONS.find((opt) => opt.value === value)?.component || Star
}
