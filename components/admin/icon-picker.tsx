"use client"

import { ICON_OPTIONS } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IconPickerProps {
    value?: string
    onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((option) => {
                const Icon = option.component
                const isSelected = value === option.value
                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                            "h-10 w-10 p-0",
                            isSelected && "border-primary"
                        )}
                        onClick={() => onChange(option.value)}
                        title={option.label}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{option.label}</span>
                    </Button>
                )
            })}
        </div>
    )
}
