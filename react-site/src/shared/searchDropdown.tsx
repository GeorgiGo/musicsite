import { useEffect, useMemo, useState, type RefObject } from "react";
import type { SearchDropdownProps } from "../entities/dataInterfaces";
import { handleKeyWithKeyMap } from "../entities/keyHandler";

/**
 * `SearchDropdown` component for dropdown search suggestions
 * @param dropdownData - Array of suggetions
 * @param searchFunc - function to run search(like on enter)
 * @param setValue - function to set suggetion as value
 * @param value - input's value
 * @param inputRef - input's ref
 */
export function SearchDropdown({ dropdownData, searchFunc, setValue, search, inputElRef }: SearchDropdownProps) {
    const [focusedSuggestion, setFocusedSuggestion] = useState<number>(0)
    const keyMap = useMemo(() => ({
        'ArrowDown': (e) => { setFocusedSuggestion(prev => (prev + 1) % dropdownData.length) },
        'ArrowUp': e => { setFocusedSuggestion(prev => (prev - 1 + (prev < 1 ? dropdownData.length : 0))); e.preventDefault(); },
        'ctrl+Enter': e => { searchFunc(); e.preventDefault() },
        'Enter': e => { setValue(dropdownData[focusedSuggestion]); e.preventDefault() }
    }), [dropdownData, focusedSuggestion]);

    useEffect(() => {
        const searchSuggetionsControl = (e: KeyboardEvent) => {
            handleKeyWithKeyMap(e, keyMap)
        }
        inputElRef.current.addEventListener('keydown', searchSuggetionsControl);
        return () => { inputElRef.current?.removeEventListener('keydown', searchSuggetionsControl) }
    }, [dropdownData, focusedSuggestion])
    if (!search || dropdownData.length == 0)
        return (null);
    else
        return (
            <div className="flex m-auto flex-col bg-base w-4/5 p-1" >
                {dropdownData.map((ss, idx) =>
                    <span key={ss} className={"text-subtext0" + (focusedSuggestion == idx ? ' bg-surface0' : '')} onMouseEnter={() => setFocusedSuggestion(idx)} onMouseDown={() => setValue(ss)} dangerouslySetInnerHTML={{
                        __html: search.toLowerCase().split(' ')
                            .reduce((acc, sw) => acc.toLowerCase().replace(sw, `<span style="color:var(--color-text);font-weight:bold;">${sw}</span>`), ss)
                    }}></span>
                )}
            </div>
        )
}
